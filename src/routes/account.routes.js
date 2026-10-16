const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const accountModel = require("../models/account.model")
const accountController = require("../controllers/account.controllers")
 
// --post route for creating a new account
//post/api/account
//create a new account for the authenticated user
//protected route, requires authentication
router.post("/",authMiddleware,accountController.createAccountController)
router.get("/",authMiddleware,accountController.getUserAccountController)
router.get("/balance/:accountId",authMiddleware,accountController.getAccountBalanceController)
    
// --get route for fetching all accounts of the authenticated user
//get/api/account
//fetch all accounts for the authenticated user
//protected route, requires authentication
        
module.exports = router;
