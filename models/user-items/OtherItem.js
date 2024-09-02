const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otherItemSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String },
    unitPrice: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const OtherItem = mongoose.model('OtherItem', otherItemSchema);
module.exports = OtherItem;
