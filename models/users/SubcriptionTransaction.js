const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionTransaction = new Schema({
    type: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
    starts: {
        type: String,
    },
    expires: {
        type: String,
    },
    duration: {
        type: Number,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subscription'
    }
})

const SubscriptionTransaction = mongoose.model('subscriptionTransaction', subscriptionTransaction);
module.exports = SubscriptionTransaction;

