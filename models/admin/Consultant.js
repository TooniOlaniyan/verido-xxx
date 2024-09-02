const mongoose = require('mongoose')

const consultantSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    token: String,
    email: { type: String, required: true },
    consultant_id: { type: String, unique: true },
    mobile_number: { type: String, required: true },
    rating: {
        type: Number,
        default: 0
    },
    ratedBy: {
        type: Number,
        default: 0
    },
    business: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner'
    },
    status: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: "consultant"
    },
})
// console.log()


// Middleware to generate unique ID
consultantSchema.pre('save', async function (next) {
    const consultant = this;

    if (!consultant.isModified('username')) return next();

    const baseId = consultant.username.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if the generated ID is unique
    let uniqueId = baseId;
    let count = 1;

    while (await Consultant.findOne({ consultant_id: uniqueId })) {
        uniqueId = `${baseId}-${count}`;
        count++;
    }

    consultant.consultant_id = uniqueId;
    next();
});

const Consultant = mongoose.model('consultants', consultantSchema)

module.exports = Consultant;