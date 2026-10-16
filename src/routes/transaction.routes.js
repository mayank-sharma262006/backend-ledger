const {Router} = require('express')
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controllers")
const transactionRoutes = Router();
//post api/transaction
//create new transaction
transactionRoutes.post("/",authMiddleware,transactionController.createTransactionController)
//post api/transaction/system/initial-funds
//create initial funds transaction from system user
transactionRoutes.post("/system/initial-funds",authSystemUserMiddleware,transactionController.createInitialFundsTransaction)
module.exports = transactionRoutes