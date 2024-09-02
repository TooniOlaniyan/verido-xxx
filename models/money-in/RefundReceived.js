const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundReceivedSchema = new Schema({
    trxID: { type: Number },
    isMaterial: { type: Number },
    description: { type: String },
    supplierID: { type: Number },
    amount: { type: Number },
    date: { type: String },
    time: { type: String },
    paymentOption: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const RefundReceived = mongoose.model('RefundReceived', refundReceivedSchema);
module.exports = RefundReceived;
