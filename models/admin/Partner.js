
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
        default: "partner"
    },
    status: {
        type: Boolean,
        default: false
    },
    consultants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consultants'
    }],

    businesses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],

    business_sector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'business_sector'
    },

    business_type: {
        type: String,
    },

    address: {
        type: String,
    },

    country: {
        type: String,
    },

    agreement_expires: {
        type: Date,
    },

    partner_id: {
        type: String,
        unique: true,
        required: true
    }
})


// company name, address, business type, country, lenght of agreement, - these
userSchema.plugin(passportLocalMongoose)


module.exports = mongoose.model('Partner', userSchema)