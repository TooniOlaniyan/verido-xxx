const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const materialSchema = new Schema({
    name: { type: String, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    image: { type: String },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true },
    avatar: { type: Buffer }
});

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
