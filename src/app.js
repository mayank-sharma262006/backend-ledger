//this line imports the Express module,
//  which is a web application framework for
//  Node.js. It provides a set of features
//  and utilities to build web applications and APIs.
//express gives features like routing, middleware support, 
// and request/response handling, making it easier to create
//  server-side applications.
const express = require('express');
//what are cookies? Cookies are small pieces
//  of data that are stored on the client-side
//  (in the user's browser) and sent to the
//  server with each request. They are commonly
//  used for session management, user authentication,
//  and storing user preferences.
//cookie-parser is a middleware that parses cookies
//  attached to the client request object. It populates
//  the req.cookies object with key-value pairs 
// representing the cookies sent by the client.
//  This allows the server to easily access and manipulate cookie data.
const cookieParser = require('cookie-parser');
//approuter is imported from the auth.routes.js file,
//  which contains the routes for authentication-related operations 
// such as user registration and login. It is used to
//  handle requests related to authentication.
const approuter = require("./routes/auth.routes");
const accountrouter = require("./routes/account.routes");
const transactionrouter = require("./routes/transaction.routes");
// Create an instance of the Express application
const app = express();
//this middleware is used to parse incoming
//  JSON data in the request body
app.use(express.json());
//this middleware is used to parse cookies attached
//  to the client request object. It populates the req.cookies
//  object with key-value pairs representing the cookies sent by the client.
app.use(cookieParser());
//this line mounts the authentication router
//  on the /api/auth path. It means that any requests
//  starting with /api/auth will be handled by the 
// authentication router defined in the auth.routes.js file.
app.use("/api/auth", approuter);
app.use("/api/account", accountrouter);
app.use("/api/transaction", transactionrouter);
//export the app instance for use in other modules

module.exports = app;

//app has two works to create a server and handle
//  incoming requests. It listens for incoming requests
//  on a specific port (3000 in this case) and routes
//  those requests to the appropriate route handlers defined
//  in the application.
//and to config the server to handle incoming 
// requests and responses, including parsing JSON data,
//  routing requests to the appropriate handlers, and managing
//  middleware functions.