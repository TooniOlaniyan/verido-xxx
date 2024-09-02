const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
})

module.exports = mongoose.model('business_sector', businessSchema)