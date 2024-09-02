const mongoose = require('mongoose')
const Users = require('./Users')
const Business = require('./Business')

const newMarketProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    local_id: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    cost_price: {
        type: Number,
        require: true
    },
    margin: {
        type: String
    },
    selling_price: {
        type: String,
        required: true
    },
    forcast: {
        type: Number
    },
    rate: {
        type: String
    },
    image: String,
    material: String,
    labour: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },
})

module.exports = mongoose.model('MarketProduct', newMarketProductSchema)