const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    vidoeID : {
        type: String,
        required: true
    },
    category : {
        type: String,
        required: true

    },
    title: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner'
    },
})

module.exports = mongoose.model('videos', videoSchema)