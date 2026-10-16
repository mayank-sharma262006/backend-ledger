//to connect to the database
const mongoose = require('mongoose');
//this function connects to the MongoDB database using the connection string from the environment variables
function connectDB() {
    mongoose.connect(process.env.MONGO_URI )
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
}

module.exports = connectDB; 
