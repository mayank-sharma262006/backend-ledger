const mongoose = require('mongoose');
const ledgerModel = require("./ledger.model")
const accountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Account must be associated with a user"],
            index: true, // Create an index on the user field for faster queries
        },
        status: {
            type: String,
            enum: {
                values: ["active", "closed", "frozen"],
                message: "Status must be either 'active', 'closed', or 'frozen'",
            },
            default: "active",
        },
        currency: {
            type: String,
            required: [true, "Currency is required"],
            default: "INR"
        }
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);
accountSchema.index({ user: 1, status: 1 }); // Create a compound index
//  on user and status fields for faster queries
//this line creates a Mongoose model named "Account" based on the accountSchema
//  The model represents the "Account" collection in the MongoDB database
//this helps in creating, reading, updating, and 
// deleting account documents in the database
//instance method - call as `account.getBalance()` on a fetched Account document.
//  aggregates this account's Ledger entries, grouped by type (credit/debit),
//  and returns the totals along with the net balance.
accountSchema.methods.getBalance = async function () {
    const [balanceData] = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
                    },
                },
                totalCredit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalDebit: 1,
                totalCredit: 1,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] },
            },
        },
    ]);

    return balanceData || { totalCredit: 0, totalDebit: 0, balance: 0 };
};
const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;
