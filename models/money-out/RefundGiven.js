const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundGivenSchema = new Schema({
    trxID: { type: Number },
    description: { type: String },
    customerID: { type: Number },
    amount: { type: Number },
    date: { type: String },
    time: { type: String },
    paymentOption: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const RefundGiven = mongoose.model('RefundGiven', refundGivenSchema);
module.exports = RefundGiven;
