const mongoose = require('mongoose')

const subscriptionStatus = new mongoose.Schema({
    type : {
        type: String,
    },
    status : {
            type: Boolean,
            default: true
    },
    starts: {
        type: String,
    },
    expires : {
        type: String,
    }
})

module.exports = mongoose.model('subscription', subscriptionStatus)