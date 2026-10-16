const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({

    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Account is required"],
        immutable: true,
        index: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        immutable: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Transaction is required"],
        index: true,
    },
    type: {
        type: String,
        enum: {
            values: ["credit", "debit"],
            message: "Type must be either 'credit' or 'debit'",
        },
        required: [true, "Type is required"],
    }
}, {
    timestamps: true
})

//a ledger is an append-only record of money movement - once an
//  entry is written it must never be edited, only new entries
//  may be added. these hooks block every mongoose path that
//  could mutate an existing document.
function blockLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("save", function () {
    if (!this.isNew) {
        throw new Error("Ledger entries are immutable and cannot be modified or deleted");
    }
});

ledgerSchema.pre("findOneAndUpdate", blockLedgerModification);
ledgerSchema.pre("updateOne", blockLedgerModification);
ledgerSchema.pre("deleteOne", blockLedgerModification);
ledgerSchema.pre("remove", blockLedgerModification);
ledgerSchema.pre("deleteMany", blockLedgerModification);
ledgerSchema.pre("updateMany", blockLedgerModification);
ledgerSchema.pre("findOneAndDelete", blockLedgerModification);
ledgerSchema.pre("findOneAndReplace", blockLedgerModification);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);
module.exports = ledgerModel;
