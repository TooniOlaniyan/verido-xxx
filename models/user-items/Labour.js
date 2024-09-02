const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labourSchema = new Schema({
    title: { type: String, required: true },
    rate: { type: String },
    unitPrice: { type: Number, required: true },
    labourType: { type: String },
    description: { type: String },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const Labour = mongoose.model('Labour', labourSchema);
module.exports = Labour;
