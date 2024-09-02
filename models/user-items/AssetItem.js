const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetItemSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number },
    lifeCount: { type: Number },
    lifePeriod: { type: String },
    description: { type: String },
    safeDelete: { type: Number },
    userID: { type: String, required: true },
    localID: { type: String, required: true }
});

const AssetItem = mongoose.model('AssetItem', assetItemSchema);
module.exports = AssetItem;
