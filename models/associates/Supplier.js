const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    businessName: { type: String },
    address1: { type: String },
    address2: { type: String },
    postCode: { type: String },
    region: { type: String },
    town: { type: String },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
