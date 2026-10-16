//to load environment variables from a .env file
//  into process.env
require("dotenv").config();
// Import the Express application from the app.js file
const app = require("./src/app");
//import the connectDB function from the db.js file to establish a connection to the MongoDB database
const connectDB = require("./src/config/db");

connectDB();

//to start the server and listen on a specific port
//listen for incoming requests on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});