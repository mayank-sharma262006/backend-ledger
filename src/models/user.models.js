//mongoose is an Object Data Modeling (ODM) library
//  for MongoDB and Node.js. It provides a
//  straightforward, schema-based solution
//  to model your application data. It includes
// built-in type casting, validation, query
//  building, business logic hooks and more,
//  out of the box.
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false, // Exclude password field from query results by default
    },
    systemUser: {
        type : Boolean,
        default : false,
        immutable : true,
        select : false
    }
}, {
    // timestamps option adds createdAt and updatedAt fields to the schema, which are automatically managed by Mongoose
    timestamps: true
});
userSchema.pre("save", async function () {
    //this line checks if the password field has been modified.
    //  If it hasn't, the function returns to proceed
    //  to the next middleware or save operation
    // without hashing the password again.
    if(!this.isModified("password")) {
        return;
    }
    //this line uses the bcrypt.hash() method
    //  to hash the password before saving it to the
    // database.
    //password is hashed because storing
    //  plain text passwords in a database is a security risk.
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  });
userSchema.methods.comparePassword = async function (password) {
    console.log("password", this.password);
    //this line uses the bcrypt.compare() method to compare the provided 
    // password with the hashed password stored in the database.
    //  It returns a boolean value indicating whether
    //  the passwords match or not.
    return await bcrypt.compare(password, this.password)
}
//this line creates a Mongoose model named "User" based on the userSchema
//  The model represents the "User" collection in the MongoDB database
//this helps in creating, reading, updating, and 
// deleting user documents in the database
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;