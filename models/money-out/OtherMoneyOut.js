const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otherMoneyOutSchema = new Schema({
    withDiscount: { type: Number },
    description: { type: String },
    customerID: { type: Number },
    amountDue: { type: Number },
    amountPaid: { type: Number },
    date: { type: String },
    time: { type: String },
    selectedDay: { type: String },
    payCount: { type: Number },
    paymentOption: { type: String },
    discount: { type: Number },
    reduction: { type: Number },
    isInstallment: { type: Number },
    frequency: { type: String },
    payDays: { type: String },
    cart: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const OtherMoneyOut = mongoose.model('OtherMoneyOut', otherMoneyOutSchema);
module.exports = OtherMoneyOut;
