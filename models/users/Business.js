const mongoose = require('mongoose')
const MarketProduct = require('./MarketProduct')

const businessSchema = new mongoose.Schema({
    name : String,
    sector : String,
    type : String,
    currency : String,
    currencySymbol: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    market_products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketProduct'
    }]
})

module.exports = mongoose.model('business', businessSchema)