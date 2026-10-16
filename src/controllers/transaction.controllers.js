const mongoose = require('mongoose');
const emailService = require("../services/email.service")
const accountModel = require("../models/account.model");
const userModel = require("../models/user.models");
const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
//post /api/transaction
/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
async function createTransactionController(req, res) {
    //validating data
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    //validate request
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required",
            status: "failed",
        });
    }
    const fromUserAccount = await accountModel.findOne({
        _id : fromAccount,
    })
    const toUserAccount = await accountModel.findOne({
        _id : toAccount,
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message : "invalid fromAccount or toAccount",
            status: "failed",
        })
    }

    if (String(fromAccount) === String(toAccount)) {
        return res.status(400).json({
            message: "fromAccount and toAccount cannot be the same",
            status: "failed",
        });
    }
    if (!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({
            message: "fromAccount and toAccount must be valid account ids",
            status: "failed",
        });
    }

    //transaction creation logic goes here
    //validating idempotency key
    const isTransaactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })
    if(isTransaactionAlreadyExist){
        if(isTransaactionAlreadyExist.status==="completed"){
            return res.status(200).json({
                message : "transaction already completed",
                transaction : isTransaactionAlreadyExist
            } )
        } 
        if(isTransaactionAlreadyExist.status==="pending"){
            return res.status(200).json({
                message : "transaction is still processing",

            })
        }
        if(isTransaactionAlreadyExist.status==="failed"){
            return res.status(500).json({
                message : "transaction processing failed, please retry"
            })
        }
        if(isTransaactionAlreadyExist.status==="reversed"){
            return res.status(500).json({
                message : "transaction processing reversed, please retry"
            })
        }
    }
    if(fromUserAccount.status!="active" || toUserAccount.status!="active" ){
        return res.status(400).json({
            message : "Both fromAccount and toAccount must be active"
        })
    }
    //derive sender balance from ledger
    const { balance } = await fromUserAccount.getBalance()
    if(balance < amount){
        return res.status(400).json({
            message : `insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
            status: "failed",
        })
    }

    //create transaction
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status : "pending"
        }], { session }))[0]

        //TEMPORARY TEST CODE - remove after testing idempotency.
        //  holds the transaction in "pending" for 100s so a duplicate
        //  request with the same idempotencyKey can be sent while this
        //  one is still in-flight, to verify it gets rejected correctly.
        const debitLedgerEntry = await ledgerModel.create([{
            account : fromAccount,
            amount : amount,
            transaction : transaction._id,
            type : "debit"
        }],{session})
        await new Promise((resolve) => setTimeout(resolve, 100000));
        const creditLedgerEntry = await ledgerModel.create([{
            account : toAccount,
            amount : amount,
            transaction : transaction._id,
            type : "credit"
        }],{session})
        await transactionModel.findOneAndUpdate(
            {_id : transaction._id},{status : "completed"},{session}
        )
        await session.commitTransaction()
        session.endSession()
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
            message : "transaction is pending due to some issue,please try after sometime"
        })
    }
}
async function createInitialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey} = req.body
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required",
            status: "failed",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({
            message: "toAccount must be a valid account id",
            status: "failed",
        });
    }

    //req.user is guaranteed to be a system user here - enforced by authSystemUserMiddleware.
    //  find that system user's own account to fund transfers from.
    const fromUserAccount = await accountModel.findOne({
        user : req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message : "System user account not found",
            status: "failed",
        })
    }
    const toUserAccount = await accountModel.findOne({
        _id : toAccount,
    })
    if(!toUserAccount){
        return res.status(400).json({
            message : "Invalid toAccount",
            status: "failed",
        })
    }

    if (String(fromUserAccount._id) === String(toAccount)) {
        return res.status(400).json({
            message: "toAccount cannot be the system account itself",
            status: "failed",
        });
    }

    if (toUserAccount.status !== "active") {
        return res.status(400).json({
            message: "toAccount must be active",
            status: "failed",
        });
    }

    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey
    })
    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === "completed") {
            return res.status(200).json({
                message: "transaction already completed",
                transaction: isTransactionAlreadyExist,
            });
        }
        if (isTransactionAlreadyExist.status === "pending") {
            return res.status(200).json({
                message: "transaction is still processing",
            });
        }
        return res.status(500).json({
            message: "transaction processing failed, please retry",
            status: "failed",
        });
    }

    //no balance check on fromUserAccount - the system account is the source
    //  of newly issued funds, so it is allowed to run into a negative balance.
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const [transaction] = await transactionModel.create([{
            fromAccount : fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status : "pending"
        }], { session })

        await ledgerModel.create([{
            account : fromUserAccount._id,
            amount,
            transaction : transaction._id,
            type : "debit",
        }], { session })

        await ledgerModel.create([{
            account : toAccount,
            amount,
            transaction : transaction._id,
            type : "credit",
        }], { session })

        transaction.status = "completed"
        await transaction.save({ session })

        await session.commitTransaction()

        //notify the account holder that received the initial funds
        const recipientUser = await userModel.findById(toUserAccount.user)
        if (recipientUser) {
            await emailService.sendTransactionEmail(recipientUser.email, recipientUser.name, amount, transaction._id);
        }

        return res.status(201).json({
            message: "initial funds transaction completed successfully",
            transaction,
        });
    } catch (err ) {
        await session.abortTransaction();

        //same concurrent-idempotencyKey race as createTransactionController -
        //  fall back gracefully instead of a generic 500.
        const isDuplicateKeyError = err.code === 11000 && err.keyPattern && err.keyPattern.idempotencyKey;
        const isConcurrentWriteConflict = err.hasErrorLabel && err.hasErrorLabel('TransientTransactionError');

        if (isDuplicateKeyError || isConcurrentWriteConflict) {
            const existingTransaction = await transactionModel.findOne({ idempotencyKey });
            if (existingTransaction) {
                if (existingTransaction.status === "completed") {
                    return res.status(200).json({
                        message: "transaction already completed",
                        transaction: existingTransaction,
                    });
                }
                return res.status(200).json({
                    message: "transaction is still processing",
                });
            }
            return res.status(200).json({
                message: "another request with this idempotencyKey is already being processed, please retry shortly",
            });
        }

        return res.status(500).json({
            message: "transaction processing failed, please retry",
            status: "failed",
        });
    } finally {
        session.endSession();
    }
}
module.exports = { createTransactionController , createInitialFundsTransaction};
