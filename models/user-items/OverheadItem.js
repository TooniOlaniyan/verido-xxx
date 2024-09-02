const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const overheadItemSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number },
    shouldRemind: { type: Number },
    frequency: { type: String },
    type: { type: String },
    reminderID: { type: Number },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const OverheadItem = mongoose.model('OverheadItem', overheadItemSchema);
module.exports = OverheadItem;
