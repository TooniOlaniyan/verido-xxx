const mongoose = require('mongoose')
const Users = require('./Users')
const Business = require('./Business')

const newMarketOrderSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        required: true
    },
    customer_phone: {
        type: Number,
        require: true
    },
    customer_mail: {
        type: String,
    },
    complete_status: {
        type: Boolean,
        default: false
    },
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketProduct', required: true },
            quantity: { type: Number, required: true },
        }
    ],
    createdAt: { type: Date, default: Date.now },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },

})

module.exports = mongoose.model('MarketOrder', newMarketOrderSchema)


