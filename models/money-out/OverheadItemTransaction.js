const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overheadItemTransactionSchema = new Schema({
    withDiscount: { type: Number },
    description: { type: String },
    supplierID: { type: Number },
    amountDue: { type: Number },
    amountPaid: { type: Number },
    date: { type: String },
    time: { type: String },
    paymentOption: { type: String },
    discount: { type: Number },
    reduction: { type: Number },
    overheadID: { type: Number },
    quantity: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const OverheadItemTransaction = mongoose.model('OverheadItemTransaction', overheadItemTransactionSchema);
module.exports = OverheadItemTransaction;
