const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Sender account is required"],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Receiver account is required"],
        index: true,
    },
    status: {
        type: String,  
        enum: {
            values: ["pending", "completed", "failed"],
            message: "Status must be either 'pending', 'completed', or 'failed'",
        },
        default: "pending",
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [1, "Amount must be greater than 0"],
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency Key is required for creating a transaction"],
        index: true,
        unique: true
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
