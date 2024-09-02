const Consultant = require("../models/admin/Consultant");
const Partner = require("../models/admin/Partner");
const SuperAdmin = require("../models/admin/SuperAdmin");
const jwt = require('jsonwebtoken')
const User = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN } = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const bcrypt = require('bcrypt')
const Subscription = require('../models/users/Subcription')
const Business = require('../models/users/Business')
const userMap = []
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const Video = require('../models/users/Videos')
const userID = require('../models/users/UserID')
const STRIPE_LIVE_KEY = process.env.STRIPE_LIVE_KEY
const stripe = require('stripe')(STRIPE_LIVE_KEY);
const shortUrl = require("node-url-shortener");


module.exports.register = async (req, res, next) => {
    try {
        const used_partner = await Partner.findOne({ partner_id: req.body.partner_id });
        const admin = await SuperAdmin.findOne({ email: req.body.email })
        const partner = await Partner.findOne({ email: req.body.email })
        const consultant = await Consultant.findOne({ email: req.body.email })
        if (admin || partner || consultant) {
            return res.status(401).json({ "code": 423, "message": "Account with email already exists" })
        }
        if (used_partner) {
            await bcrypt.hash(req.body.password, 12).then(async function (hash) {
                const newAdmin = new Consultant({ username: req.body.name, email: req.body.email, mobile_number: req.body.phone, partner: used_partner._id, password: hash });
                jwt.sign({ email: newAdmin.email }, 'secretkey', async function (err, token) {
                    if (err) {
                        res.json({ "code": 403, "message": "Auth Failed" })
                    } else {
                        newAdmin.token = token;
                        await newAdmin.save();
                        res.status(200).json({ "code": 200, "message": "Consultant Registered, Awaiting Approval", "message": "Ok", "response": newAdmin });
                    }
                })

            })
        } else {
            return res.status(401).json({ "code": 423, "message": "Partner not found, please verify and retry" })
        }

    } catch (e) {
        return next(e)
    }
}

module.exports.create_account = async (req, res, next) => {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
        if (err) {
            console.log('Failed Auth')
            res.status(403).json({ "code": 403, "message": 'Auth failed' })
        } else {
            const super_admin = await SuperAdmin.findOne({ email: data.username });
            const institution = await Partner.findOne({ email: data.username })
            const used_partner = await Partner.findOne({ partner_id: req.body.partner_id });
            const verido_partner = await Partner.findOne({ email: "partner@verido.app" });
            const admin = await SuperAdmin.findOne({ email: req.body.email })
            const partner = await Partner.findOne({ email: req.body.email })
            const consultant = await Consultant.findOne({ email: req.body.email })

            var newAdmin;

            console.log(data);
            if (admin || partner || consultant) {
                return res.status(401).json({ "code": 423, "message": "Account with email already exists" })
            } else
                if (super_admin) {
                    try {

                            await bcrypt.hash(req.body.password, 12).then(async function (hash) {
                                if (used_partner) {
                                    newAdmin = new Consultant({ username: req.body.name, email: req.body.email, mobile_number: req.body.phone, partner: used_partner._id, password: hash });

                                } else {
                                    newAdmin = new Consultant({ username: req.body.name, email: req.body.email, mobile_number: req.body.phone, password: hash });

                                }
                                jwt.sign({ email: newAdmin.email }, 'secretkey', async function (err, token) {
                                    if (err) {
                                        res.json({ "code": 403, "message": "Auth Failed" })
                                    } else {
                                        newAdmin.token = token;
                                        await newAdmin.save();
                                        res.status(200).json({ "code": 200, "message": "Consultant Registered, Awaiting Approval", "message": "Ok", "response": newAdmin });
                                    }
                                })

                            })

                    } catch (e) {
                        return next(e)
                    }
                } else if (institution) {
                    try {
                        if (institution) {
                            await bcrypt.hash(req.body.password, 12).then(async function (hash) {
                            const newAdmin = new Consultant({ username: req.body.name, email: req.body.email, mobile_number: req.body.phone, partner: institution._id, password: hash });
                            jwt.sign({ email: newAdmin.email }, 'secretkey', async function (err, token) {
                                if (err) {
                                    res.json({ "code": 403, "message": "Auth Failed" })
                                } else {
                                    newAdmin.token = token;
                                    await newAdmin.save();
                                    res.status(200).json({ "code": 200, "message": "Consultant Registered, Awaiting Approval", "message": "Ok", "response": newAdmin });
                                }
                            })

                        })
                    } else {
                        return res.status(401).json({ "code": 423, "message": "Partner not found, please verify and retry" })
                    }

                } catch (e) {
                    return next(e)
                }
                } else {
                    return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
                }
        }

    });

}

module.exports.suspend = async (req, res, next) => {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
        if (err) {
            console.log('Failed Auth')
            res.status(403).json({ "code": 403, "message": 'Auth failed' })
        } else {
            const super_admin = await SuperAdmin.findOne({ email: data.username });
            const institution = await Partner.findOne({ email: data.username })
            var consultant = await Consultant.findOne({ _id: req.params.id })
            if (!consultant) {
                return res.status(401).json({ "code": 423, "message": "Consultant does not exists" })
            } else
                if (super_admin) {
                    try {
                        consultant.status = false;
                        await consultant.save();
                        res.status(200).json({ "code": 200, "message": "Consultant Suspended Successfully", "response": consultant });
                    } catch (e) {
                        return next(e)
                    }
                } else if (institution) {
                    try {
                        if (consultant.partner.equals(institution._id)) {
                            consultant.status = false;
                            await consultant.save();
                            res.status(200).json({ "code": 200, "message": "Consultant Suspended Successfully", "response": consultant });
                        } else {
                            return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
                        }

                    } catch (e) {
                        return next(e)
                    }
                } else {
                    return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
                }
        }

    });

}

module.exports.activate = async (req, res, next) => {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
        if (err) {
            console.log('Failed Auth')
            res.status(403).json({ "code": 403, "message": 'Auth failed' })
        } else {
            const super_admin = await SuperAdmin.findOne({ email: data.username });
            const institution = await Partner.findOne({ email: data.username })
            var consultant = await Consultant.findOne({ _id: req.params.id })
            if (!consultant) {
                return res.status(401).json({ "code": 423, "message": "Consultant does not exists" })
            } else
                if (super_admin) {
                    try {
                        consultant.status = true;
                        await consultant.save();
                        res.status(200).json({ "code": 200, "message": "Consultant Activated Successfully", "response": consultant });
                    } catch (e) {
                        return next(e)
                    }
                } else if (institution) {
                    try {
                        if (consultant.partner.equals(institution._id)) {
                            consultant.status = true;
                            await consultant.save();
                            res.status(200).json({ "code": 200, "message": "Consultant Activated Successfully", "response": consultant });
                        } else {
                            return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
                        }

                    } catch (e) {
                        return next(e)
                    }
                } else {
                    return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
                }
        }

    });

}