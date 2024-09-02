const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const installmentSchema = new Schema({
    transactionID: { type: Number },
    isMaterial: { type: Number },
    isOther: { type: Number },
    isMoneyIn: { type: Number },
    isOverhead: { type: Number },
    isAsset: { type: Number },
    amountPaid: { type: Number },
    date: { type: String },
    time: { type: String },
    paymentOption: { type: String },
    description: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const Installment = mongoose.model('Installment', installmentSchema);
module.exports = Installment;
