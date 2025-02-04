if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/users/Users')
const cors = require('cors')
const bcrypt = require('bcrypt')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')
const log = require('morgan');
const logger = require('./logger')
const userRoles = require('./userRoles')
const passport = require('passport')
const passportLocal  = require('passport-local');
const session = require('express-session')
const axios = require('axios')
const Video = require('./models/users/Videos')
const Subscription = require('./models/users/Subcription')
const Message = require('./models/admin/Messages')
const UserID = require('./models/users/UserID')
const AdminRoutes = require('./routes/admin')
const AuthRoutes = require('./routes/auth')
const passwordRoutes = require('./routes/password')
const Business = require('./models/users/Business')
const MarketProduct = require('./models/users/MarketProduct');
const path = require('path')
const fs = require('fs')
const { google } = require('googleapis')
const verifyToken = require('./authenticate')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const {storage} = require('./cloudinary/index')
const cloudinary = require('cloudinary').v2
const upload = multer({ storage })
const STRIPE_LIVE_KEY = process.env.STRIPE_LIVE_KEY
const stripe = require('stripe')(STRIPE_LIVE_KEY);
const Consultant = require('./models/admin/Consultant')
const KEYPATH = ''
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const schedule = require('node-schedule');
const cron = require('node-cron');
const MarketOrder = require('./models/users/MarketOrder');
const { business } = require('./controllers/admin');
const BusinessSector = require('./models/users/BusinessSector');
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);

const Material = require('./models/user-items/Material');
const AssetItem = require('./models/user-items/AssetItem');
const Labour = require('./models/user-items/Labour');
const OtherItem = require('./models/user-items/OtherItem');
const OverheadItem = require('./models/user-items/OverheadItem');
const Product = require('./models/user-items/Product');
const Asset = require('./models/money-out/Asset');
const DirectLabour = require('./models/money-out/DirectLabour');
const DirectMaterial = require('./models/money-out/DirectMaterial');
const OtherMoneyOut = require('./models/money-out/OtherMoneyOut');
const Overhead = require('./models/money-out/Overhead');
const OverheadItemTransaction = require('./models/money-out/OverheadItemTransaction');
const RefundGiven = require('./models/money-out/RefundGiven');
const OtherMoneyIn = require('./models/money-in/OtherMoneyIn');
const RefundReceived = require('./models/money-in/RefundReceived');
const Sale = require('./models/money-in/Sale');
const Customer = require('./models/associates/Customer');
const Supplier = require('./models/associates/Supplier');
const Reminder = require('./models/users/Reminder');
const Installment = require('./models/users/Installment');

const usersMap = []
const el_4 = []

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

const models = {
    materials: Material,
    labours: Labour,
    assetItems: AssetItem,
    otherItems: OtherItem,
    overheadItems: OverheadItem,
    products: Product,
    assets: Asset,
    directLabours: DirectLabour,
    directMaterials: DirectMaterial,
    otherMoneyOuts: OtherMoneyOut,
    overheads: Overhead,
    overheadItemTransactions: OverheadItemTransaction,
    refundsGiven: RefundGiven,
    otherMoneyIns: OtherMoneyIn,
    refundsReceived: RefundReceived,
    sales: Sale,
    customers: Customer,
    suppliers: Supplier,
    reminders: Reminder,
    installments: Installment,

};


const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE


const DB = `mongodb+srv://seinde4:${PASSWORD}@cluster0.pp8yv.mongodb.net/${DATABASE}?retryWrites=true&w=majority` || 'mongodb://localhost:27017/verido';

mongoose.connect(DB,
    {    
    useNewUrlParser: true,
    useUnifiedTopology: true,
    }
)


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database connected')
})



app.use(session(sessionConfig))
app.use(cors())
// app.use(express.json())
app.use(bodyParser())

app.use((req, res, next) => {
    if(req.originalUrl.includes('/webhook')){
        next()
    } else {
        bodyParser()(req, res, next)
    }
})
app.use(log('dev'))
app.use(userRoles.middleware())
app.use(express.urlencoded({ extended: true, limit: '50mb' }))


app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get('/', (req, res) => {
    res.send('<h1>Express App is running</h1>')
})


app.use(AuthRoutes)
app.use(passwordRoutes)
app.use(AdminRoutes)




app.get('/user-verification', verifyToken, catchAsync( async( req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.status(401).json({"message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('userID')
                const userid = await UserID.findOne({_id: user.userID.id})
                res.status(200).json({"message": userid})
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.post('/new-consultant', catchAsync( async (req, res, next) => {
    try {
        
        await bcrypt.hash(req.body.password, 12).then(async function(hash){

            const full_name_split = req.body.username.trim().split(' ');

            console.log(full_name_split, full_name_split[0])
            let salt_id = Math.floor(Math.random() * 10000)


            const availaible_id = await Consultant.findOne({consultant_id: `${full_name_split[0]}-${salt_id}`})
            if(availaible_id){
                let newRand = Math.floor(Math.random() * 1000)
                salt_id = newRand + salt_id
            } 
            const consultant = new Consultant({email:req.body.email, username: req.body.username,
                                                consultant_id: `${full_name_split[0].trim()}-${salt_id}`,
                                                mobile_number: req.body.mobile_number, password: hash})
            await consultant.save();
            const user = await Consultant.findOne({email: req.body.email})
            return res.status(200).json({"message": user})
        })
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant', catchAsync( async( req, res, next) => {
    try {
        const { username, password } = req.body;
        const consultant = await Consultant.find().populate({
            path: 'business',
            populate: {
                path: 'business'
            }
        })
        
        
        return res.status(200).json({"consultant": consultant})
        
    } catch(e){
        return next(e)
    }
}))

app.post('/update-consultant', catchAsync(async(req, res, next) => {
    try {
        const {userId, consultantId} = req.body;
        const consultant = await Consultant.findOne({consultant_id: consultantId})

        if(consultant){
            await User.findOneAndUpdate({_id: userId}, {consultant: [consultant]})
        }

        res.json({"message": "Ok"})
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant/:id', catchAsync( async (req, res, next) => {
    try {
        const { id } = req.params;
        const consultant = await Consultant.findOne({_id: id}).populate({
            path: 'business',
            populate: {
                path: 'business'
            }
        }).populate({
            path: 'business',
            populate: {
                path: 'subscription_status'
            }
        })



        

        return res.status(200).json({"consultant": consultant})

        
    } catch(e){
        return next(e)
    }
}))


app.post('/new-consultant-message/:consultant', catchAsync( async (req, res, next) => {
    try {
        const { consultant } = req.params;

        const message = new Message({...req.body})

        await message.save();

        const current_consultant = await Consultant.findOne({_id: consultant});
        current_consultant.messages.push(message);

        await current_consultant.save();

        return res.status(200).json({"message": "Ok"})
    } catch(e){
        return next(e)
    }
}))

app.post('/new-business-message/:id', catchAsync( async (req, res, next) => {
    try {
        const { id } = req.params;

        const message = new Message({...req.body})

        await message.save();

        const current_consultant = await User.findOne({_id: id});
        current_consultant.messages.push(message);

        await current_consultant.save();

        return res.status(200).json({"message": "Ok"})
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-consultant-message/:consultant', (catchAsync( async( req, res, next) => {
    try {
        const { consultant } = req.params;

        const current_consultant = await Consultant.findOne({_id: consultant}).populate('messages');

        if(current_consultant){
            return res.status(200).json({"messages": current_consultant});
        }
    } catch(e){
        return next(e)
    }
})))
app.get('/fetch-business-message/:id', (catchAsync( async( req, res, next) => {
    try {
        const { id } = req.params;

        const current_consultant = await User.findOne({_id: id}).populate('messages');

        if(current_consultant){
            return res.status(200).json({"messages": current_consultant});
        }
    } catch(e){
        return next(e)
    }
})))


app.get('/fetch-business-messages/:id', (catchAsync( async( req, res, next) => {
    try {
        const { id } = req.params;

        const current_consultant = await Message.find({channel: id});

        if(current_consultant){
            return res.status(200).json({"messages": current_consultant});
        } else {
            return res.status(401).json({"messages": "No Messages found"});
        }
    } catch(e){
        return next(e)
    }
})))




app.post('/user-verification', verifyToken, catchAsync( async( req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.status(401).json({"message": "Auth Failed"})
            } else {
                const { BVN, NIN } = req.body;
                const user = await User.findOne({username: data.user}).populate('userID')
                const userid = await UserID.findOneAndUpdate({_id: user.userID.id}, {
                    ...req.body
                })
                const newUserid = await UserID.findOne({_id: user.userID.id}) 

                res.status(200).json({"message": newUserid})
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.post('/admin-verification/:id', catchAsync(async(req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({_id: id}).populate('userID')
        if(user.userID){
            console.log(req.body)
            const new_userID = await UserID.findOneAndUpdate({_id: user.userID._id}, {...req.body})
            .then(async data => {
                const user = await User.findOneAndUpdate({_id: id}, {idVerified: true})

                res.status(200).json({"message": "Ok"})
            })
        } else {
            const new_data = new UserID({
                BVN: req.body.BVN,
                NIN: req.body.NIN
            })

            await new_data.save()
            user.idVerified = true
            user.userID = new_data
            await user.save()
            res.status(200).json({"message": "Ok"})

        }

    } catch (e){
        return next(e)
    }
}))


app.post('/reminder', verifyToken, catchAsync(async ( req, res, next) => {
    try {
        const { days, phoneNumber } = req.body

        jwt.verify(req.token, 'secretkey', async( err, data) => {
            if(err){
                return res.status(401).json({"message": "Auth failed"})
            } else {
                // const days = ['2022-01-29', '2022-02-26']
                const user = await User.findOne({username: data.user}).populate('business')

                for(let day of days){

                    let values = day.split('-');

                    let date = new Date(Number(values[0]), Number(values[1]) - 1, Number(values[2]), 7, 30, 0)

                    const job = schedule.scheduleJob(date, function(){
                        twilio.messages
                        .create({
                           body: `Your credit transaction with ${user.business.name ? user.business.name : "a Verido Business"} is due an installment payment today. Please make necessary payments to avoid defaults today. \n\n For Enquiries about this transaction, contact ${user.business.name ? user.business.name : "This verido Business"} at ${user.username} \n\n Message generated with Verido\nhttps://verido.app`,
                           from: '+447401123846',
                           to: phoneNumber
                         })
                        .then(message => console.log(message.sid))
                        .catch(e => console.log(e))
                        console.log('The world is going to end today.');
                    });
                    console.log(job)

                }
                res.status(200).json({"message": `${days.length} Notifications schceduled`})


        }
            
        })
    } catch(e){
        return next(e)
    }
}))



app.post('/payment',verifyToken, async (req, res, next) => {

    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                res.status(401).json({"message": 'Auth Failed'})
            } else {
                const user = await User.findOne({username: data.user})
                console.log(user, data.user)
                let id;
                if(user.stripeCustomerID === null){
                    const customer = await stripe.customers.create({
                        email: user.email ? user.email : null,
                        phone: user.username,
                        name: user.full_name
                    });

                    await User.findOneAndUpdate({username: data.user}, {stripeCustomerID: customer.id})
                    id = customer.id
                } else {
                    id = user.stripeCustomerID
                }

                

                const { plainID } = req.body;
                let amount;
                switch(plainID){
                    case 0:
                        amount = 799
                        break;
                    case 1:
                        amount = 2277
                        break;
                    case 2:
                        amount = 8150
                        break
                    default:
                        amount = 0
                }

                
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: ['card'],
                });


                // const { id } = customer
                const { client_secret } = paymentIntent

                res.status(200).json({"customer_id": id, "client_secret": client_secret})

            }
        })
       
    } catch (e){
        return next(e)
    }

})


app.post('/delete-consultant',verifyToken, catchAsync( async( req, res, next) => {
    try {

        jwt.verify(req.token, 'secretkey', async( err, data) => {
            if(err){
                res.status(401).json({"message": "Auth Failed"})
            } else {
                const users = await User.findOne({username: data.user});


                // const delConst = users.consultant.find(del_consultant => del_consultant.consultant_id === req.body.consultant_id)
                const delConst = users.consultant = "";

                users.consultant.splice(users.consultant.indexOf(delConst), 1)
                // const deleteConsultant = await Consultant.findOneAndDelete({consultant_id: req.body.consultant_id})

                // for(let user of users){
                //     if(user.consultant._id === req.body.consultant_id){
                //         user.consultant.splice(user.consultant.indexOf(user.consultant), 1)
                //     }
                // }

                await users.save();

                res.status(200).json({"message": "Consultant Deleted"})
            }
        })
} catch (e){
    return next(e)
    }
}))

app.post('/set-consultant', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.status(401).json({"message": 'Auth Failed'})
            } else {
                // const user = await User.findOneAndUpdate({username: data.user}, {consultant: req.body.consultant_id})
                var userNew = await User.findOne({ username: data.user }).populate('consultant')

                const consultant = await Consultant.findOne({consultant_id: req.body.consultant_id})

                //    const available_consultant = userNew.consultant.some(current_consultant => current_consultant.consultant_id === req.body.consultant_id)

                // if(consultant && !available_consultant){
                if (consultant && userNew) {
                    userNew.consultant = consultant._id;

                    consultant.business.push(userNew)

                    await userNew.save()
                    await consultant.save()

                    userNew.consultant = consultant;
                    consultant.password = "xxx";
                    consultant.rating = consultant.rating ?? 0;
                    consultant.ratedBy = consultant.ratedBy ?? 0;


                    res.status(200).json({ "message": "Ok", "response": { "consultant": [consultant] } })
                } else {
                    res.status(401).json({"message": "Consultant has been added already or does not exist"})
                }


                


            }
        })
    } catch(e){
        return next(e)
    }
}))


app.post('/rate-consultant', catchAsync( async (req, res, next) => {
    try {
        const consultant = await Consultant.findOne({consultant_id: req.body.consultant_id})
        if(consultant){
            console.log(consultant)
            const newRatedBy = consultant.ratedBy + 1;
            const rating = consultant.rating + req.body.rating;
            const newRating = Math.ceil(rating / newRatedBy)

            await Consultant.findOneAndUpdate({consultant_id: req.body.consultant_id}, {rating: newRating, ratedBy: newRatedBy})

            res.status(200).json({"message": 'Consultant Rated'})

        } else {
            res.status(403).json({"message": "Consultant Not found"})
        }
    } catch(e){
        return next(e)
    }
}))

const endpointSecret = "whsec_bGQ3BuM9QbMRjYFX954Ueob2YgOdf8zQ";

app.post('/webhook', express.raw({type: 'application/json'}),  async (request, response) => {

    try {
   
            const sig = request.headers['stripe-signature'];

            let event;
            let date = new Date()

            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
            switch (event.type) {
                case 'charge.succeeded':
                const charge = event.data.object;
                console.log(event)
                break;
                case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                switch(event.data.object.amount_received){
                    case 799:
                        date.setDate(date.getDate() + 28)
                        const user_1 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_1.subscription_status.expires = date.toDateString()
                        await user_1.save()
                        break;
                    case 2277:
                        date.setDate(date.getDate() + 112)
                        const user_2 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_2.subscription_status.expires = date.toDateString()
                        await user_2.save()
                        break;
                    case 8150:
                        date.setDate(date.getDate() + 365)
                        const user_3 = await User.findOne({stripeCustomerID: event.data.object.customer}).populate('subscription_status')
                        user_3.subscription_status.expires = date.toDateString()
                        await user_3.save()
                        break
                    default:
                        console.log('Default')
                        break;

                }
                console.log(event)
                break;
                default:
                console.log(`Unhandled event type ${event.type}`);
            }
            response.send();
        
   
 
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

 
});

app.post('/new-payment', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                return res.status(401).json({"message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('subscription_status')
                const { amount } = req.body;
                let val;
                let date = new Date();
                let startDate = new Date();
                var d_type = "monthly";
                switch(amount){
                    case 799:
                        val = 28;
                        d_type = "monthly";
                        break;
                    case 2277:
                        val = 112;
                        d_type = "quarterly";
                        break;
                    case 8150:
                        val = 365
                        d_type = "yearly";
                        break
                    default:
                        val = 0
                        break
                }
                // const d = new Date(user.subscription_status.expires)
                const d = new Date()
                d.setDate(d.getDate() + val);

                
                const subs = await Subscription.findOneAndUpdate({_id: user.subscription_status.id}, {
                    started: `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`, //startDate.toDateString(), 
                    expires: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,//date.toDateString(),
                    type: 'Subscribed'
                })

                const newSub = await Subscription.findOne({ _id: user.subscription_status.id });


                const starts = new Date();
                const expires = starts.setDate(result.getDate() + days);


                const transaction = new SubscriptionTransaction({
                    type: 'monthly',
                    amount: amount,
                    status: true,
                    starts: starts.toISOString(),
                    expires: expires.toISOString(),
                    duration: duration,
                    user: user._id,
                    subscription: user.subscription_status._id,
                });

                await transaction.save();

                res.send(newSub)
                
            }
        })
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-all-product',verifyToken, (req, res, next) => {
  
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                console.log(data.user.username)

                const user = await User.findOne({username: data.user})
                .populate({
                    path: 'product',
                    populate: {
                        path: 'sale'
                    }
                })
                                   
                    if(user.product.length){
                    return res.status(200).json({"code": 200, "status": "ok", "response": {"product": user.product}, "message": "Fetch for all products"})
                    }

                    return res.status(200).json({"code": 200, "status": "ok", "message": "No product saved"})
            }
        })

})

app.post('/fetch-single-product', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                throw new Error('Auth Failed')
            } else {
                // const { username } = req.session.currentUser;

        const { product } = req.body;
        const user = await User.findOne({username: data.user}).populate('product');
        let singleProductFound;

        for(let userProduct of user.product){
            if(userProduct.product === product){
                singleProductFound = userProduct
            }
        }
        if(singleProductFound){
            return res.status(200).json({"code": 200, "status": "Ok", "response": singleProductFound})
        } 
        return res.status(200).json({"code": 200, "status": "Ok", "response": 'No Product'})

            }
        })
        // const { id } = req.user;
        
    } catch (e) {
        return next(e)
    }
}))



app.delete('/delete-single-product/:_id',verifyToken, catchAsync( async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                if(req.session.currentUser){
                    const { _id } = req.params;
                    // const { id } = req.
                    // const { username } = req.session.currentUser;
                    
                    const user = await User.findOne({username: data.user}).populate('product');
                    for(let element of user.product){
                        if(element.id === _id){
                            await Product.findByIdAndDelete(_id);
                        }
                    }
                    return res.status(200).json({"code": 200, "status": "Ok", "message": "Deleted"})
                }
            }
        })
        
        
    } catch (e) {
        return next(e)
    }
}))

app.patch('/update-single-product/:_id', verifyToken, catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                throw new Error('Auth failed')
            } else {
                if(req.session.currentUser){
                    const { _id } = req.params;
                    // const { id } = req.user;
                    // const { username } = req.session.currentUser;
                    
                    const user = await User.findOne({username: data.user}).populate('product');
                    for(let element of user.product){
                        if(element.id === _id){
                            await Product.findOneAndUpdate(_id, {...req.body})
                        }
                    }
                    // user.product.findByIdAndUpdate(_id, {...req.body})
                    return res.status(200).json({"code": 200, "status": "Ok", "message": "Successfully updated"})
                }
            }
        })
        
        
    } catch(e){
        return next(e)
    }
}))

app.get('/fetch-materials', verifyToken, catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth failed"})
            } else {
                const user = await User.findOne({username: data.user})
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'material_assign'
                    }
                })
                const { material_assign } = user.money_in;
                if(material_assign){
                    return res.status(200).json({"code": 200, "status": "ok", "response": material_assign, "message": "Materials saved"})
                }
                return res.status(200).json({"code": 200, "status": "ok", "message": "No material saved"})
            }
        })

        
    } catch (e){
        return next(e)
    }
    
}))

app.post('/new-sale/:_id', verifyToken, catchAsync(async (req, res, next) => {
    try {
        const { _id } = req.params;
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 200, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate({
                    path: 'product',
                    populate: {
                        path: 'sale'
                    }
                });
        
                let available;
                const newSale = new Sale({...req.body});
                await newSale.save();
                for(let product of user.product){
                    if(product.id === _id){
                        available = true
                        product.sale.push(newSale)
                        await product.save()
                    } 
                }
        
                
                return res.status(200).json({"code": 200, "status": "Ok", "message": "New sale succesfully recorded", "response":newSale})
            }
            
        })

        

    } catch (e) {
        return next(e)
    }
}))

app.get('/get-all-customers', verifyToken, catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 400, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('customer');
        const { customer } = user;
        return res.status(200).json({"code": 200, "status": "success", "message": `All customers`, "response": customer})
            }
        })

        
    } catch (e){
        return next(e)
    }
}))

app.post('/add-new-customer', verifyToken, catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;

        jwt.verify(req.token, async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user})
                const newCustomer = new Customer({...req.body});
                await newCustomer.save();
                user.customer.push(newCustomer);
                await user.save();
                return res.status(200).json({"code": 200, "status": "Ok", "message": "New customer added", "new_customer": newCustomer})
            }
        })
        
    } catch (e){
        return next(e)
    }
}))

app.get('/fetch-all-transactions', verifyToken, catchAsync(async(req, res, next) => {
    try{
        // const { username } = req.session.currentUser;
        // const { id } = req.user;       
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if(err){
                res.json({"code": 403, "message": 'Auth Failed'})
            } else {
                const user = await User.findOne({username: data.user}).populate({
                    path: 'product',
                    populate: {
                        path: 'sale'
                    }
                }).populate({
                    path: 'product',
                    populate: {
                        path: 'credit_sale'
                    }
                })
                .populate('customer')
                .populate('suppliers')
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'other_transaction',
                        populate: {
                            path: 'customer'
                        }
                    }
                })
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'refund',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'material_assign',
                    }
                })
                .populate({
                    path: 'money_in',
                    populate: {
                        path: 'labour_assign',
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'direct_material_purchase',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'credit_purchase',
                        populate: {
                            path: 'customer'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'refund_given',
                        populate: {
                            path: 'customer'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'direct_labour',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'asset_purchase',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'overhead',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'other_transaction',
                        populate: {
                            path: 'supplier'
                        }
                    }
                })
                .populate({
                    path: 'money_out',
                    populate: {
                        path: 'materials',
                    }
                })
               
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Money in transactions for product sale, refund, and other transactions", "response": user})
            }
        })
        
    } catch(e){
        return next(e)
    }
}))


app.post('/add-new-supplier', verifyToken, catchAsync( async( req, res, next) => {
   try {
    // const { id } = req.user;
    // const { username } = req.session.currentUser;
    jwt.verify(req.token, 'secretkey', async(err, data) => {
        if(err){
            res.json({"code": 200, "message": "Auth Failed"})
        } else {
            const user = await User.findOne({username: data.user}).populate({
                path: 'product',
                populate: {
                    path: 'sale'
                }
            }).populate({
                path: 'product',
                populate: {
                    path: 'credit_sale'
                }
            })
            .populate('customer')
            .populate('suppliers')
            .populate({
                path: 'money_in',
                populate: {
                    path: 'other_transaction',
                    populate: {
                        path: 'customer'
                    }
                }
            })
            .populate({
                path: 'money_in',
                populate: {
                    path: 'refund',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_in',
                populate: {
                    path: 'material_assign',
                }
            })
            .populate({
                path: 'money_in',
                populate: {
                    path: 'labour_assign',
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'direct_material_purchase',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'credit_purchase',
                    populate: {
                        path: 'customer'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'refund_given',
                    populate: {
                        path: 'customer'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'direct_labour',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'asset_purchase',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'overhead',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'other_transaction',
                    populate: {
                        path: 'supplier'
                    }
                }
            })
            .populate({
                path: 'money_out',
                populate: {
                    path: 'materials',
                }
            }).populate('token')
            .populate('business')
            .populate('subscription_status')
            .populate('database')
            const newSupplier = new Supplier({...req.body});
            await newSupplier.save()
            user.suppliers.push(newSupplier);
            await user.save();
        
            return res.status(200).json({"code": 200, "status": "Ok", "message": "New Supplier added", "response": user})
        }
    })

   
   } catch (e){
       return next(e)
   }

}))


app.post('/business-information',verifyToken, catchAsync( async(req, res, next) => {
    try {
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({ username: data.user }).populate('token')
                .populate('business')
                .populate('subscription_status')
                .populate('database')
                .populate('consultant')

                const newBusiness = new Business({...req.body});
                await newBusiness.save()
                user.business = newBusiness;
                await user.save()
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Personal Information Updated", "response": user})
            }
        })
        

    }
    catch (e){
        return next(e)
    }
}))

app.get('/get-business-information', verifyToken, catchAsync(async(req, res, next) => {
    try {
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({username: data.user}).populate('business')
                return res.status(200).json({"code": 200, "status": "Ok", "message": "Business information", "response": user.business})
            }
        })
        
    } catch (e){
        return next(e)
    }
}))



app.get('/user', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const user = await User.findOne({ username: data.user }).populate('token')
                .populate('business')
                .populate('subscription_status')
                    .populate('database')
                return res.status(200).json({"code": 200, "status": "Ok", "message": "user", "response": user})
            }
        })
        

    } catch(e){
        return next(e)
    }
}))

function uploader(req, res, next){
    if(req.body.image){
        upload.single(req.body.image)
    }
    next()
}

app.post('/update-profile', verifyToken, catchAsync(async(req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message" : "Auth Failed"})
            }else {

                 const {image = null} = req.body;
                 let pathUrl;

                 if(image !== null){
                    await cloudinary.uploader.upload(`data:image/jpg;base64,${image}`, {

                 
                 

                        folder: 'Verido'
                     }, function(err, result) {
                         if(err){
                             console.log(err)

                         }else {

                            pathUrl = result.url
                         }
                    })
                 }
    
                   

                // const profile = await  User.findOneAndUpdate(data.user.username
                const profile = await  User.findOne({username: data.user}
                    //, 
                    // {full_name: req.body.full_name ? req.body.full_name : data.user.username.full_name,
                    // email: req.body.email ? req.body.email : data.user.username.email,
                    // photoUrl: req.file.path ? path : data.user.username.photoUrl,
                        
                    // }
                ).populate('token')
                .populate('business')
                .populate('subscription_status')
                .populate('database')
                    .populate('videos')

                const { full_name = null, email = null } = req.body;
                
                
                profile.full_name = full_name === null ? profile.full_name  :  req.body.full_name;
                 profile.email = email === null ? profile.email :  req.body.email;
                profile.photoUrl = pathUrl ? pathUrl : profile.photoUrl;
                await profile.save()
               

                    return res.status(200).json({"code": 200, "status": "Ok", "message": "user", "response": profile})

            }
        })
    }catch (e){
        return next(e)
    }
}))

app.get('/videos', catchAsync(async (req, res, next) => {
    try {

        const videos = await Video.find();
        // return res.status.json({}) videos 
        return res.status(200).json({"response": videos})

    } catch (e){
        return next(e)
    }
}))

app.get('/vidoes', catchAsync(async (req, res, next) => {
    try {

        const videos = await Video.find();
        // return res.status.json({}) videos 
        return res.status(200).json({ "response": videos })

    } catch (e) {
        return next(e)
    }
}))

app.post('/vidoes', catchAsync(async (req, res, next) => {
    try {

        const video = new Video({...req.body})

        await video.save();
        const videos = await Video.find();
        return res.status(200).json({"code": 200, "status": "Ok", "response": videos})

    } catch (e){
        return next(e)
    }
}))

app.post('/delete-video/:id', catchAsync(async (req, res, next) => {
    try {
        const {id } = req.params;
        const deleteVidoe = await Video.findOneAndDelete({vidoeID: req.body.vidoeID})

        return res.status(200).json({"message": "Video Deleted", "response": deleteVidoe})

    } catch (e){
        return next(e)
    }
}))
// app.post('/reset-password', async (req, res) => {
//     const { password } = req.body
//     await User.findOneAndUpdate({username: phoneNumber, { username: }})
// })

app.get('/logout', (req, res) => {
    //MAKE SURE TO DESTROY THE session
    req.logout()
    res.json({"code": 200, "message": "logout"})
})

app.post('/create-market-product', verifyToken, catchAsync(async (req, res, next) => {
    try {
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if (err) {
                throw new Error('Auth failed')
            } else {
                {
                    // const { _id } = req.params;
                    // const { id } = req.user;
                    // const { username } = req.session.currentUser;

                    // console.log(req.body);

                    const user = await User.findOne({ username: data.user }).populate('business');


                    if (!user) {
                        return res.status(404).send('User not found');
                    } else if (user.business == null || user.business._id == null) {
                        return res.status(429).json({ "code": 429, "message": "Please create a business profile before creating a product" });
                    }

                    const { image = null } = req.body;
                    let pathUrl;

                    if (image !== null) {
                        await cloudinary.uploader.upload(`data:image/jpg;base64,${image}`, {




                            folder: 'Verido'
                        }, function (err, result) {
                            if (err) {
                                console.log(err)

                            } else {

                                pathUrl = result.url
                            }
                        })
                    }



                    const newProduct = MarketProduct({
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price,
                        ownerId: user._id,
                        createdAt: new Date(),
                        local_id: req.body.local_id,
                        unit: req.body.unit,
                        cost_price: req.body.cost_price,
                        margin: req.body.margin,
                        selling_price: req.body.selling_price,
                        forcast: req.body.forcast,
                        rate: req.body.rate,
                        image: pathUrl,
                        labour: req.body.labour,
                        material: req.body.uni,
                        business: user.business._id,
                    });

                    const result = await newProduct.save();

                    return res.status(200).json({ "code": 200, "status": "Ok", "message": "Successfully created" })
                }
            }
        })


    } catch (e) {
        return next(e)
    }
}))

app.get('/marketplace', catchAsync(async (req, res, next) => {
    try {

        const products = await MarketProduct.find();
        const businesses = await Business.find().populate('market_products');
        const sectors = await BusinessSector.find();


        return res.status(200).json({
            "code": 200, "status": "ok", "message": "Marketplace fetched successfully", data: {
                products: products,
                businesses: businesses,
                sectors: sectors
            }
        })


    } catch (e) {
        return next(e)
    }

}))

app.post('/marketplace/order', catchAsync(async (req, res, next) => {
    try {

        const newOrder = MarketOrder({

            customer_name: req.body.customer_name,
            customer_phone: req.body.customer_phone,
            customer_mail: req.body.customer_mail,
            business: req.body.business,

            cart: req.body.cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            createdAt: new Date(),

        });

        const result = await newOrder.save();

        return res.status(200).json({ "code": 200, "status": "Ok", "message": "Successfully recorded" })


    } catch (e) {
        return next(e)
    }

}))


// export data for app
app.post('/export-data', verifyToken, catchAsync(async (req, res, next) => {
    try {
        const data2 = req.body;
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if (err) {
                res.json({ "code": 403, "message": "Auth Failed" })
            } else {
                console.log(data);
                var user = await User.findOne({ username: data.username })

                if (!user) {
                    user = await User.findOne({ username: data.user })
                }

                if (user) {
                    for (const [tableName, records] of Object.entries(data2)) {
                        const Model = models[tableName];

                        if (!Model) {
                            console.error(`Model not found for table: ${tableName}`);
                            continue;
                        }

                        // Process each record in the table
                        for (const record of records) {
                            const { id, remoteID, userID, ...rest } = record;

                            // Convert userID to ObjectId if it exists
                            const userObjectId = user._id.toString();

                            // Check if the record needs to be updated or created
                            if (remoteID && remoteID !== '') {
                                // Update existing record
                                await Model.findOneAndUpdate(
                                    { _id: remoteID },
                                    { ...rest, localID: id, userID: userObjectId },
                                    { new: true, upsert: true } // upsert: true creates a new record if it doesn't exist
                                );
                            } else {
                                // Create new record
                                const newRecord = new Model({ ...rest, localID: id, userID: userObjectId });
                                await newRecord.save();
                            }
                        }
                    }

                    // After importing, retrieve all records for the specified userID
                    const userObjectId = user._id.toString();
                    var response = {};

                    for (const [tableName, Model] of Object.entries(models)) {
                        const records = await Model.find({ userID: userObjectId });



                        // Transform records to replace _id with remoteID and localID with id
                        response[tableName] = records.map(record => {
                            const transformedRecord = record.toObject();
                            transformedRecord.remoteID = transformedRecord._id;
                            delete transformedRecord._id;
                            transformedRecord.id = transformedRecord.localID;
                            delete transformedRecord.localID;
                            delete transformedRecord.__v;
                            return transformedRecord;
                        });


                    }

                    return res.status(200).json({ "code": 200, "status": "Ok", "message": "Data exported successfully", "data": response })

                } else {
                    return res.status(404).json({ "message": 'User not found' });
                }
            }
        })

    } catch (e) {
        return next(e)
    }
}))

app.get('/get-data', verifyToken, catchAsync(async (req, res, next) => {
    try {
        const data = req.body;
        jwt.verify(req.token, 'secretkey', async (err, data) => {
            if (err) {
                res.json({ "code": 403, "message": "Auth Failed" })
            } else {
                const user = await User.findOne({ username: data.user })

                if (user) {
                    // After importing, retrieve all records for the specified userID
                    const userObjectId = mongoose.Types.ObjectId(req.body.userID);
                    const response = {};

                    for (const [tableName, Model] of Object.entries(models)) {
                        const records = await Model.find({ userID: user._id });

                        // Transform records to replace _id with remoteID and localID with id
                        response[tableName] = records.map(record => {
                            const transformedRecord = record.toObject();
                            transformedRecord.remoteID = transformedRecord._id;
                            delete transformedRecord._id;
                            transformedRecord.id = transformedRecord.localID;
                            delete transformedRecord.localID;
                            return transformedRecord;
                        });
                    }
                }

                return res.status(200).json({ "code": 200, "status": "Ok", "message": "Data exported successfully", "data": response })
            }
        })

    } catch (e) {
        return next(e)
    }
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404))
})

let code;
let status;
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.log(err)
    switch(err.name){
        case 'MongoServerError': 
            code = 403;
            status = "Duplicate";
            err.message = `username is already registered`
            // err.message = `${err.keyValue.username} is already registered`
            break;

        case 'ValidationError':
            code = 403;
            status = "Forbidden";
            err.message = `${err._message}`
            break;

        case 'TypeError':
            code = 403;
            status = "Forbidden";
            err.message = 'You must be logged in to proceed'
            break;

        case 'UserExistsError': 
            err.message = "A user with the given Phone number is already registered"
            break;

        default :
            err.message = "Oh no, Something went wrong"
    }
    res.status(code ? code : statusCode).json({"code": code ? code : statusCode, "status": status ? status : "error", "message": err.message })
   
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
})
