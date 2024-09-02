const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
    title: { type: String, required: true },
    withDiscount: { type: Number },
    description: { type: String },
    supplierID: { type: Number },
    price: { type: Number },
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
    lifeCount: { type: Number },
    lifeRate: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
