//routes are used to define the endpoints for the
//  authentication-related operations in the
//  application. It imports the necessary modules and
//  sets up the routes for user registration, login, 
// and other authentication-related actions.
//express is a popular web application framework
//  for Node.js that simplifies the process of 
// building web applications and APIs. It provides 
// a set of features and utilities to handle routing,
//  middleware, request/response handling, and more.

const express = require("express");
//this line imports the authController module, which contains
//  the controller functions for handling authentication-related
//  operations such as user registration and login.
const authController = require("../controllers/auth.controllers");

// Create an instance of the Express router 
// to define routes for authentication
//router is an instance of the Express Router, which is used to define
//  routes for handling authentication-related requests. It allows
//  you to define endpoints and associate them with specific controller
//  functions that handle the logic for those endpoints.
const router = express.Router();
//this line defines a route for handling user registration requests.
// /register is the endpoint for user registration,
//  and authController.userRegisterConstroller is the controller
//  function that will be executed when a POST request is
//  made to this endpoint.
router.post("/register", authController.userRegisterConstroller);
router.post("/login", authController.userLoginController);
module.exports = router;