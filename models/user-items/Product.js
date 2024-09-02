const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true },
    unit: { type: String, required: true },
    costPrice: { type: Number, required: true },
    margin: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    forecast: { type: Number },
    rate: { type: String },
    image: { type: String },
    usedMaterials: { type: String },
    usedLabours: { type: String },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true },
    avatar: { type: Buffer }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
