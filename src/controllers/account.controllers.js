const accountModel = require("../models/account.model")
 
//required user , status , currency except id everything default 
async function createAccountController(req,res){
     const user = await req.user;
     const account = await accountModel.create(
        {
            user : user._id
        }
     )
     res.status(201).json({account})
}
async function getUserAccountController(req,res){
    const account = await accountModel.find({
        user : req.user._id
    })
    return res.status(200).json({
        account
    })

}
async function getAccountBalanceController(req,res){
    const {accountId} = req.params;
    const account = await accountModel.findOne({
        _id : accountId,
        user : req.user._id
    })
    if(!account){
        return res.status(404).json({
            message : "account not found!"
        })
    }
    const balance = await account.getBalance();
    res.status(200).json({
        accountId : account._id,
        balance : balance
    })
}
module.exports = {
    createAccountController,getUserAccountController,getAccountBalanceController
}