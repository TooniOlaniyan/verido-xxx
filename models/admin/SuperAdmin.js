
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    token: String,
    photoUrl: String,
    dateJoined: { type: Date, default: Date.now },
    email: {
        type: String,
        required: [true, 'Email Address is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "super_admin"
    },
    status: {
        type: Boolean,
        default: true
    },
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('super_admin', userSchema)