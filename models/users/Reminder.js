const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reminderSchema = new Schema({
    type: { type: Number },
    message: { type: String },
    day: { type: String },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
