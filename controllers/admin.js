if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const Admin = require('../models/admin/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const nodemailer = require('nodemailer')
const Consultant = require('../models/admin/Consultant')
// const schedule = requrie('node-schedule')
const SubScription = require('../models/users/Subcription.js')
const Business = require('../models/users/Business')
const Message = require('../models/admin/Messages')
const {TWILO_ACCOUNT_SID, VERIFICATION_SID, SECRET_KEY, TWILO_AUTH_TOKEN} = process.env
const twilio = require('twilio')(TWILO_ACCOUNT_SID, TWILO_AUTH_TOKEN);
const nodemaile = require('nodemailer')

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const SuperAdmin = require('../models/admin/SuperAdmin.js')
const Partner = require('../models/admin/Partner.js')
const Video = require('../models/users/Videos')
const SubcriptionTransaction = require('../models/users/SubcriptionTransaction')



const Material = require('../models/user-items/Material');
const AssetItem = require('../models/user-items/AssetItem');
const Labour = require('../models/user-items/Labour');
const OtherItem = require('../models/user-items/OtherItem');
const OverheadItem = require('../models/user-items/OverheadItem');
const Product = require('../models/user-items/Product');
const Asset = require('../models/money-out/Asset');
const DirectLabour = require('../models/money-out/DirectLabour');
const DirectMaterial = require('../models/money-out/DirectMaterial');
const OtherMoneyOut = require('../models/money-out/OtherMoneyOut');
const Overhead = require('../models/money-out/Overhead');
const OverheadItemTransaction = require('../models/money-out/OverheadItemTransaction');
const RefundGiven = require('../models/money-out/RefundGiven');
const OtherMoneyIn = require('../models/money-in/OtherMoneyIn');
const RefundReceived = require('../models/money-in/RefundReceived');
const Sale = require('../models/money-in/Sale');
const Customer = require('../models/associates/Customer');
const Supplier = require('../models/associates/Supplier');
const Reminder = require('../models/users/Reminder');
const Installment = require('../models/users/Installment');

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

// const rule = new schedule.RecurrenceRule();
// rule.minute = 30;

// const job = schedule.scheduleJob(rule, async function(){

//   const date_1 = new Date()
//   const subs = await Subscription.find()
//   subs.map(data => {
//     let d_1 = new Date(data.expires)

//   })
//   console.log('The answer to life, the universe, and everthing!');
// });
// console.log()


// module.exports.register_admin = async (req, res) => {
//   try {
//     await bcrypt.hash(req.body.password, 12).then(async function (hash) {
//         const newAdmin = new Admin({username: req.body.email, password: hash})
//         await newAdmin.save();
//         res.status(200).json({"code": 200, "message": "Admin Registered"})
//   })
//   } catch (e) {
//     return next(e)
//   }
// }

/**
 * @swagger
 * /admin-register:
 *   post:
 *     summary: Register
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         message: Admin Registered
 *       500:
 *         description: Internal server error
 */

module.exports.admin_login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await SuperAdmin.findOne({ email: email })
    const partner = await Partner.findOne({ email: email })
    const consultant = await Consultant.findOne({ email: email })

    if (admin) {
      bcrypt.compare(password, admin.password).then(function (result) {
        console.log('admin')
        console.log(result)
        if (result) {
          jwt.sign({ username: admin.email }, 'secretkey', async function (err, token) {
            if (err) {
              return res.json({ "code": 403, "message": "Auth Failed" })
            } else {
              admin.token = token;
              await admin.save();
              return res.status(200).json({ "code": 200, "message": "Ok", "response": admin, })
            }
          })
        } else {
          return res.status(401).json({ "code": 401, "message": "Unauthorised" })
        }

      });
    } else if (partner) {
      bcrypt.compare(password, partner.password).then(function (result) {
        console.log('partner')
        console.log(result)
        if (result) {
          jwt.sign({ username: partner.email }, 'secretkey', async function (err, token) {
            if (err) {
              return res.json({ "code": 403, "message": "Auth Failed" })
            } else {
              partner.token = token;
              await partner.save();
              return res.status(200).json({ "code": 200, "message": "Ok", "response": partner, })
            }
          })
        } else {
          return res.status(401).json({ "code": 401, "message": "Unauthorised" })
        }

      });
    } else if (consultant) {
      bcrypt.compare(password, consultant.password).then(function (result) {

                if (result) {
                  jwt.sign({ username: consultant.email }, 'secretkey', async function (err, token) {
                      if (err) {
                        res.json({ "code": 403, "message": "Auth Failed" })
                      } else {
                        consultant.token = token;
                        consultant.role = "consultant";
                        await consultant.save();
                        res.status(200).json({ "code": 200, "message": "Ok", "response": consultant, "role": "consultant" })
                      }
                    })
                }
                else {
                  res.status(401).json({ "code": 401, "message": "Unauthorised" })
                }

              })
    }





    else {
      return res.status(401).json({ "code": 401, "message": "Unauthorised" })
    }

  } catch (e) {
    return next(e)
  }
})

module.exports.get_current_user = catchAsync(async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      try {

        const admin = await SuperAdmin.findOne({ email: data.username })
        const partner = await Partner.findOne({ email: data.username })
        const consultant = await Consultant.findOne({ email: data.username })

        if (consultant == null) {
          const consultant = await Consultant.findOne({ email: data.username })
        }

        if (admin) {
          {
            jwt.sign({ username: admin.email, role: admin.role }, 'secretkey', async function (err, token) {
              if (err) {
                return res.json({ "code": 403, "message": "Auth Failed" })
              } else {
                return res.status(200).json({ "code": 200, "message": "Ok", "response": admin, })
              }
            })
          }
        } else if (partner) {

          return res.status(200).json({ "code": 200, "message": "Ok", "response": partner, })

        } else if (consultant) {
          res.status(200).json({ "code": 200, "message": "Ok", "response": consultant, "role": "consultant" })

        } else {
          return res.status(401).json({ "code": 401, "message": "User not found" })
        }

      } catch (e) {
        return next(e)
      }
    }
  })
})

module.exports.get_partners = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const admin = await SuperAdmin.findOne({ email: data.username })
        if (admin) {
          const users = await Partner.find().select('-token -password')
          res.status(200).json({ "code": 200, "response": users })
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }

      }
    })
  } catch (e) {
    next(e)
  }
})

module.exports.single_partner = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const admin = await SuperAdmin.findOne({ email: data.username })
        if (admin) {
          var user = await Partner.findById({ _id: req.params.id }).select('-token -password').populate('consultants')
            .populate('consultants', '-token -password')

          const consultants = await Consultant.find({ partner: user._id }).select('-token -password')

          const consultantsID = consultants == null ? [] : await consultants.map(consultant => consultant._id);

          var response = {};

          const businesses = await User.find({ consultant: { $in: consultantsID } }).select('-token -password -database -money_in -money_out -consultant -messages').populate('business')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password -database -money_in -money_out -consultant -messages')

          user.consultants = consultants;
          user.businesses = businesses;

          // stats



          const bsns = await User.find({ consultant: { $in: consultantsID } });
          const bsnsID = await bsns.map(bzn => bzn._id.toString());


          response['all_users'] = {
            consultants: await Consultant.countDocuments({ partner: user._id }),
            businesses: await User.countDocuments({ consultant: { $in: consultantsID } }),
          };
          // earnings map
          // Sales earnings aggregation pipeline
          const salesEarnings = await Sale.aggregate([

            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsReceived earnings aggregation pipeline
          const refundsReceivedEarnings = await RefundReceived.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyIn earnings aggregation pipeline
          const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments earnings aggregation pipeline
          const installmentsEarnings = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyIn: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all earnings
          const allEarnings = [
            ...salesEarnings,
            ...refundsReceivedEarnings,
            ...otherMoneyInEarnings,
            ...installmentsEarnings,
          ];

          // Reduce to accumulate total amounts per month
          const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const earningsArray = Object.values(earningsPerMonth);

          // money-out
          // DirectMaterial expenses aggregation pipeline
          const directMaterialExpenses = await DirectMaterial.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // DirectLabour expenses aggregation pipeline
          const directLabourExpenses = await DirectLabour.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // OverheadItemTransactions expenses aggregation pipeline
          const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Assets expenses aggregation pipeline
          const assetsExpenses = await Asset.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsGiven expenses aggregation pipeline
          const refundsGivenExpenses = await RefundGiven.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyOut expenses aggregation pipeline
          const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments expenses aggregation pipeline (isMoneyOut: 1)
          const installmentsExpenses = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyOut: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all expenses
          const allExpenses = [
            ...directMaterialExpenses,
            ...directLabourExpenses,
            ...overheadItemTransactionsExpenses,
            ...assetsExpenses,
            ...refundsGivenExpenses,
            ...otherMoneyOutExpenses,
            ...installmentsExpenses,
          ];

          // Reduce to accumulate total amounts per month
          const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const expensesArray = Object.values(expensesPerMonth);


          response['money_in_v_money_out'] = {
            total_money_in: earningsArray,
            total_money_out: expensesArray,
            money_in: {
              sales: salesEarnings,
              refundsReceived: refundsReceivedEarnings,
              otherMoneyIn: otherMoneyInEarnings,
              installments: installmentsEarnings,
            },
            expenses: {
              directMaterial: directMaterialExpenses,
              directLabour: directLabourExpenses,
              overheadItemTransactions: overheadItemTransactionsExpenses,
              assets: assetsExpenses,
              refundsGiven: refundsGivenExpenses,
              otherMoneyOut: otherMoneyOutExpenses,
              installments: installmentsExpenses,
            }
          }


          res.status(200).json({ "code": 200, "response": user, "data": response })
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }

      }
    })
  } catch (e) {
    next(e)
  }
})

module.exports.get_consultants = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })
        if (super_admin) {
          const users = await Consultant.find().select('-token -password')
          res.status(200).json({ "code": 200, "response": users })
        } else if (institution) {
          const users = await Consultant.find({ partner: institution._id }).select('-token -password')
          res.status(200).json({ "code": 200, "response": users ?? [] })
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }

      }
    })
  } catch (e) {
    next(e)
  }
})

module.exports.single_consultant = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })
        var user = await Consultant.findById({ _id: req.params.id }).select('-token -password')
          .populate('business')

        const businesses = await User.find({ consultant: user._id }).select('-token -password -database -money_in -money_out -consultant -messages').populate('business')
          .populate('subscription_status')
          .populate('userID')
          .populate('consultant', '-token -password -database -money_in -money_out -consultant -messages')
        const partner = await Partner.findOne({ _id: user.partner }).select('-token -password -database -money_in -money_out -consultant -messages');
        user.business = businesses;
        user.partner = partner;

        var response = {};

        {

          const bsns = await User.find({ consultant: user._id });
          const bsnsID = await bsns.map(bzn => bzn._id.toString());


          response['all_users'] = {
            businesses: await User.countDocuments({ consultant: user._id }),
          };
          // earnings map
          // Sales earnings aggregation pipeline
          const salesEarnings = await Sale.aggregate([

            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsReceived earnings aggregation pipeline
          const refundsReceivedEarnings = await RefundReceived.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyIn earnings aggregation pipeline
          const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments earnings aggregation pipeline
          const installmentsEarnings = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyIn: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all earnings
          const allEarnings = [
            ...salesEarnings,
            ...refundsReceivedEarnings,
            ...otherMoneyInEarnings,
            ...installmentsEarnings,
          ];

          // Reduce to accumulate total amounts per month
          const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const earningsArray = Object.values(earningsPerMonth);

          // money-out
          // DirectMaterial expenses aggregation pipeline
          const directMaterialExpenses = await DirectMaterial.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // DirectLabour expenses aggregation pipeline
          const directLabourExpenses = await DirectLabour.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // OverheadItemTransactions expenses aggregation pipeline
          const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Assets expenses aggregation pipeline
          const assetsExpenses = await Asset.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsGiven expenses aggregation pipeline
          const refundsGivenExpenses = await RefundGiven.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyOut expenses aggregation pipeline
          const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments expenses aggregation pipeline (isMoneyOut: 1)
          const installmentsExpenses = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyOut: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all expenses
          const allExpenses = [
            ...directMaterialExpenses,
            ...directLabourExpenses,
            ...overheadItemTransactionsExpenses,
            ...assetsExpenses,
            ...refundsGivenExpenses,
            ...otherMoneyOutExpenses,
            ...installmentsExpenses,
          ];

          // Reduce to accumulate total amounts per month
          const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const expensesArray = Object.values(expensesPerMonth);


          response['money_in_v_money_out'] = {
            total_money_in: earningsArray,
            total_money_out: expensesArray,
            money_in: {
              sales: salesEarnings,
              refundsReceived: refundsReceivedEarnings,
              otherMoneyIn: otherMoneyInEarnings,
              installments: installmentsEarnings,
            },
            expenses: {
              directMaterial: directMaterialExpenses,
              directLabour: directLabourExpenses,
              overheadItemTransactions: overheadItemTransactionsExpenses,
              assets: assetsExpenses,
              refundsGiven: refundsGivenExpenses,
              otherMoneyOut: otherMoneyOutExpenses,
              installments: installmentsExpenses,
            }
          }

        }

        if (super_admin) {
          res.status(200).json({ "code": 200, "response": user, "data": response })
        } else if (institution && user.partner.equals(institution._id)) {
          res.status(200).json({ "code": 200, "response": user, "data": response })
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }
      }
    })
  } catch (e) {
    next(e)
  }
})


module.exports.resetPassword = async (req, res, next) => {
  const { email } = req.body;
      const user = await Admin.findOne({username: email})
      console.log(user)
      if(user){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: `${process.env.FROM}`,
              pass: `${process.env.PASSWORD}`,
            },
          })


        const token = jwt.sign({email}, 'secretkey', {expiresIn: '15m'})
        const link = `https://verido-admin.herokuapp.com/reset-password/${token}`
  
        const mailOptions = {
          from:   `${process.env.FROM}`, 
          to: `${req.body.email}`, 
          message: 'Reset Password',
          subject: 'Confirm Password Update', 
          text: link
        }
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error)
            res.json({
              status: 'fail'
            })
          } else {
            res.status(200).json(info)
              console.log(info)
            res.json({
             status: 'success'
            })
          }
        })
        
      }

     
    
}

module.exports.passwordUpdate = catchAsync(async (req, res, next) => {
  try {

    const { email, confirm_password } = req.body;
    const user = await Admin.findOne({username: email})
    if(user){
      await bcrypt.hash(confirm_password, 12).then(async function(hash){
        await Admin.findOneAndUpdate({username: email}, { password: hash})
        return res.status(200).json({"code": 200, "status": "Ok", "message": "Password Successfully updates"})
      })
    }
  } catch(e){
    next(e)
  }
})

module.exports.business = catchAsync(async( req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      console.log(data);
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })
        const consultant = await Consultant.findOne({ email: data.username })

        if (consultant) {

        }

        if (super_admin) {
          const users = await User.find().populate('business').select('-token -password -database -money_in -money_out -messages')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password')
          res.status(200).json({ "code": 200, "response": users })
        } else if (institution) {

          const consultants = await Consultant.find({ partner: institution._id });
          const consultantsID = consultants.map(consultant => consultant._id);



          const users = await User.find({ consultant: { $in: consultantsID } }).select('-token -password -database -money_in -money_out -messages').populate('business')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password')

          res.status(200).json({ "code": 200, "response": users })

        } else if (consultant) {
          const users = await User.find({ consultant: consultant._id }).select('-token -password').populate('business')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password')

          res.status(200).json({ "code": 200, "response": users })
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }



      }
    })
  } catch (e) {
    next(e)
  }
})

module.exports.single_business = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      console.log(data);
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })
        var consultant = await Consultant.findOne({ email: data.email })
        if (!consultant) {
          consultant = await Consultant.findOne({ email: data.username })
        }

        var response = {};

        var user = await User.findById({ _id: req.params.id }).select('-token -password -database -money_in -money_out -messages').populate('business')
          .populate('subscription_status')
          .populate('userID')
          .populate('consultant', '-token -password')

        const userID = user._id.toString();



        // earnings map
        // Sales earnings aggregation pipeline
        const salesEarnings = await Sale.aggregate([

          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // RefundsReceived earnings aggregation pipeline
        const refundsReceivedEarnings = await RefundReceived.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amount" }
            }
          }
        ]);

        // OtherMoneyIn earnings aggregation pipeline
        const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // Installments earnings aggregation pipeline
        const installmentsEarnings = await Installment.aggregate([
          { $match: { userID: userID, isMoneyIn: 1 } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // Combine all earnings
        const allEarnings = [
          ...salesEarnings,
          ...refundsReceivedEarnings,
          ...otherMoneyInEarnings,
          ...installmentsEarnings,
        ];

        // Reduce to accumulate total amounts per month
        const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
          if (!acc[_id]) {
            acc[_id] = { month: _id, totalAmount: 0 };
          }
          acc[_id].totalAmount += totalAmount;
          return acc;
        }, {});

        const earningsArray = Object.values(earningsPerMonth);

        // money-out
        // DirectMaterial expenses aggregation pipeline
        const directMaterialExpenses = await DirectMaterial.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // DirectLabour expenses aggregation pipeline
        const directLabourExpenses = await DirectLabour.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // OverheadItemTransactions expenses aggregation pipeline
        const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // Assets expenses aggregation pipeline
        const assetsExpenses = await Asset.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // RefundsGiven expenses aggregation pipeline
        const refundsGivenExpenses = await RefundGiven.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amount" }
            }
          }
        ]);

        // OtherMoneyOut expenses aggregation pipeline
        const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
          { $match: { userID: userID } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // Installments expenses aggregation pipeline (isMoneyOut: 1)
        const installmentsExpenses = await Installment.aggregate([
          { $match: { userID: userID, isMoneyOut: 1 } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
              totalAmount: { $sum: "$amountPaid" }
            }
          }
        ]);

        // Combine all expenses
        const allExpenses = [
          ...directMaterialExpenses,
          ...directLabourExpenses,
          ...overheadItemTransactionsExpenses,
          ...assetsExpenses,
          ...refundsGivenExpenses,
          ...otherMoneyOutExpenses,
          ...installmentsExpenses,
        ];

        // Reduce to accumulate total amounts per month
        const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
          if (!acc[_id]) {
            acc[_id] = { month: _id, totalAmount: 0 };
          }
          acc[_id].totalAmount += totalAmount;
          return acc;
        }, {});

        const expensesArray = Object.values(expensesPerMonth);


        response['money_in_v_money_out'] = {
          total_money_in: earningsArray,
          total_money_out: expensesArray,
          money_in: {
            sales: salesEarnings,
            refundsReceived: refundsReceivedEarnings,
            otherMoneyIn: otherMoneyInEarnings,
            installments: installmentsEarnings,
          },
          expenses: {
            directMaterial: directMaterialExpenses,
            directLabour: directLabourExpenses,
            overheadItemTransactions: overheadItemTransactionsExpenses,
            assets: assetsExpenses,
            refundsGiven: refundsGivenExpenses,
            otherMoneyOut: otherMoneyOutExpenses,
            installments: installmentsExpenses,
          }
        }

        response['associates'] = {
          "customers": await Customer.find({ userID: userID }),
          "suppliers": await Supplier.find({ userID: userID }),
        }

        response['company'] = {
          products: await Product.find({ userID: userID }),
          assets: await AssetItem.find({ userID: userID }),
          overhead: await OverheadItem.find({ userID: userID }),
          labour: await Labour.find({ userID: userID }),
          material: await Material.find({ userID: userID }),
        }

        const consult = await Consultant.findOne({ _id: user.consultant });
        if (consult && consult.partner) {
          const partner = await Partner.findOne({ _id: consult.partner }).select('-token -password -database -money_in -money_out -consultant -messages');
          user.partner = partner;
        }

        if (super_admin) {



          res.status(200).json({ "code": 200, "response": user, "data": response })

        } else if (institution) {
          const consultants = await Consultant.find({ partner: institution._id });
          const consultantsID = consultants.map(consultant => consultant._id);

          const user = await User.findOne({ _id: req.params.id, consultant: { $in: consultantsID } }).select('-token -password -database -money_in -money_out -messages').populate('business')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password');
          const consult = await Consultant.findOne({ _id: user.consultant });
          if (consult && consult.partner) {
            const partner = await Partner.findOne({ _id: consult.partner }).select('-token -password -database -money_in -money_out -consultant -messages');
            user.partner = partner;
          }

          res.status(200).json({ "code": 200, "response": user, "data": response })

        } else if (consultant) {
          const user = await User.findOne({ _id: req.params.id, consultant: consultant._id }).select('-token -password -database -money_in -money_out -messages').populate('business')
            .populate('subscription_status')
            .populate('userID')
            .populate('consultant', '-token -password');
          const consult = await Consultant.findOne({ _id: user.consultant, "data": response });
          if (consult && consult.partner) {
            const partner = await Partner.findOne({ _id: consult.partner }).select('-token -password -database -money_in -money_out -consultant -messages');
            user.partner = partner;
          }

          res.status(200).json({ "code": 200, "response": user })

        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }

      }
    })
  } catch (e) {
    next(e)
  }
})

module.exports.admins = catchAsync( async (req, res, next) => {
  try {
    const Admins = await Admin.find();
    return res.status(200).json({"admins": Admins})
  } catch(e){
    return next(e)
  }
})

module.exports.admin_new_message = catchAsync( async (req, res, next) => {
  try {
    const { admin } = req.params;
    const message = new Message({...req.body})
    await message.save();

    const current_admin = await Admin.findOne({_id: admin})
    current_admin.messages.push(message);

    await current_admin.save();

    return res.status(200).json({messege: 'Ok'})
  } catch (e){
    return next(e)
  }
})

module.exports.fetch_admin_message = catchAsync( async ( req, res, next) => {
  try {
    const { admin } = req.params;

    const current_admin = await Admin.findOne({_id: admin}).populate('messages')
    if(current_admin){
      return res.status(200).json({messges: current_admin})
    }
  } catch (e){
    return next(e)
  }
})

module.exports.suspendUser = catchAsync( async (req, res, next) => {
  try{
        const { id } = req.params;
    const user = await User.findById({ _id: id }).select('-token -password -database -money_in -money_out -messages')
        if(user){
          
        
            if(req.params.type == 'suspend-user'){
              await User.findByIdAndUpdate({_id: id, }, 
                {password: user.password.concat('suspended'), suspended: true})

              twilio.messages
                .create({
                  body: `Your account is suspended`,
                  from: '+447401123846',
                  to: user.username
                })
                .then(message => console.log(message.sid))
                .catch(e => console.log(e))
            } else {
              await User.findByIdAndUpdate({_id: id, }, 
                {password: user.password.slice(0, user.password.indexOf('suspended')), suspended: false})
              twilio.messages
              .create({
                body: `Your account is Re-activated`,
                from: '+447401123846',
                to: user.username
              })
              .then(message => console.log(message.sid))
              .catch(e => console.log(e))
            }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "codewithbiyi@gmail.com", 
      pass: "08032243047", 
    },
  });

  const mailOptions = {
    from: 'codewithbiyi@gmail.com',
    to: 'seinde4@yahoo.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    html: "<b>Hello world?</b>", // html body
  };
 
//   transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });



        // const transporter = nodemailer.createTransport({
        //   service: 'gmail',
        //   auth: {
        //     user: `${process.env.FROM}`,
        //     pass: `${process.env.PASSWORD}`,
        //   },
        // })

        // const mailOptions = {
        //   from:   `${process.env.FROM}`, 
        //   to: `${user.email}`, 
        //   message: 'Account Suspended',
        //   subject: 'Den don suspend your account alaye', 
        //   text: "Follow admin reason make he help ypu open am ASAP"
        // }

        // transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //       console.log(error)
        //     res.json({
        //       status: 'fail'
        //     })
        //   } else {
        //     res.status(200).json(info)
        //       console.log(info)
        //     res.json({
        //      status: 'success'
        //     })
        //   }
        // })
        

        res.status(200).json({"message": "Ok"})
        }
        
       

  } catch(e){
    return next(e)
  }
})

module.exports.create_account = async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const institution = await Partner.findOne({ email: data.username })

      if (super_admin) {
        try {
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
      } else if (partner) {
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


module.exports.updateUserInformation = catchAsync( async (req, res, next) => {
  try {
    const {phoneVerified} = req.body;
    const user = await User.findByIdAndUpdate({
      _id: req.params.id
    }, {
      phoneVerified: phoneVerified
    })

    res.json({"message": "Ok"})
  } catch (e){
    return next(e)
  }
})


module.exports.updateBusiness = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('business')
    console.log(req.body)
    
    await Business.findByIdAndUpdate({_id: user.business._id.toString()}, {...req.body})

    const user_1 = await User.findById(req.params.id).populate('business')

    console.log('user found', user_1.business)
    res.send("helo")
  } catch(e){
    return next(e)
  }
})

module.exports.editVideos =  catchAsync(async (req, res, next) => {
  try {
    const vid = await Videos.findById(req.params.id)
    console.log(vid)
    
    await Videos.findByIdAndUpdate({ _id: req.params.id }, { ...req.body })

    res.status(200).json({"status": "succcess"})
  } catch (e){
    return next(e)
  }
})

module.exports.create_video = catchAsync(async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {

      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const institution = await Partner.findOne({ email: data.username })
      if (super_admin) {
        try {
          const video = new Video({ vidoeID: req.body.vidoeID, title: req.body.title, category: req.body.category })
          await video.save();
          const videos = await Video.find();
          return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })

        } catch (e) {
          console.log(e);
          return next(e)
        }
      } else if (institution) {
        try {
          const video = new Video({ vidoeID: req.body.vidoeID, title: req.body.title, category: req.body.category, owner: institution._id })
          await video.save();
          const videos = await Video.find({ owner: institution._id });
          return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })
        } catch (e) {
          console.log(e);
          return next(e)
        }
      } else {
        return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
      }
    }

  });
})

module.exports.update_video = catchAsync(async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const institution = await Partner.findOne({ email: data.username })
      const vid = await Video.findById(req.params.id)
      if (!vid) {
        return res.status(401).json({ "code": 404, "message": "video does not exist" })

      } else if (super_admin) {
        try {
          await Video.findByIdAndUpdate({ _id: req.params.id }, { ...req.body });
          const videos = await Video.find();
          return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })

        } catch (e) {
          return next(e)
        }
      } else if (institution) {
        try {
          if (vid.owner.equals(institution._id)) {
            await Video.findByIdAndUpdate({ _id: req.params.id }, { ...req.body });
            const videos = await Video.find();
            return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })
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
})

module.exports.delete_video = catchAsync(async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const institution = await Partner.findOne({ email: data.username })
      const vid = await Video.findById(req.params.id)
      if (!vid) {
        return res.status(401).json({ "code": 404, "message": "video does not exist" })

      } else if (super_admin) {
        try {
          await Video.findByIdAndDelete(req.params.id);
          return res.status(200).json({ "code": 200, "status": "Ok", "message": "Video deleted successfully" })

        } catch (e) {
          return next(e)
        }
      } else if (institution) {
        try {
          if (vid.owner.equals(institution._id)) {

            await Video.findByIdAndDelete(req.params.id);
            return res.status(200).json({ "code": 200, "status": "Ok", "message": "Video deleted successfully" })

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
})

module.exports.videos = catchAsync(async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const institution = await Partner.findOne({ email: data.username })
      if (super_admin) {
        try {
          const videos = await Video.find();
          return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })

        } catch (e) {
          return next(e)
        }
      } else if (institution) {
        try {
          const videos = await Video.find({ owner: institution._id });
          return res.status(200).json({ "code": 200, "status": "Ok", "response": videos })
        } catch (e) {
          return next(e)
        }
      } else {
        return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
      }
    }

  });
})

module.exports.updateSubscription = catchAsync(async (req, res, next) => {
  try {
      await SubScription.findByIdAndUpdate({_id: req.params.id}, {...req.body})
      res.status(200).json({messge: "Ok"})
      

  } catch (e){
    return next(e)
  }
})


module.exports.updateUsername = catchAsync(async (req, res, next) => {
  try {
    await User.findOneAndUpdate({_id: req.params.id}, {...req.body})
    res.status(200).json({message: "Ok"})
  } catch(e){
    return next(e)
  }
})


module.exports.create_partner = async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      console.log(data);
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      const admin = await SuperAdmin.findOne({ email: req.body.email })
      const partner = await Partner.findOne({ email: req.body.email })
      const consultant = await Consultant.findOne({ email: req.body.email })
      if (admin || partner || consultant) {
        return res.status(401).json({ "code": 423, "message": "Account with email already exists" })
      } else
        if (super_admin) {
          try {

            await bcrypt.hash(req.body.password, 12).then(async function (hash) {
              const newAdmin = new Partner({ name: req.body.name, email: req.body.email, phone: req.body.phone, password: hash, partner_id: req.body.partner_id, username: req.body.email });
              jwt.sign({ email: newAdmin.email }, 'secretkey', async function (err, token) {
                if (err) {
                  res.json({ "code": 403, "message": "Auth Failed" })
                } else {
                  newAdmin.token = token;
                  await newAdmin.save();
                  res.status(200).json({ "code": 200, "message": "Partner Registered, Awaiting Approval", "message": "Ok", "response": newAdmin });
                }
              })

            })


          } catch (e) {
            return next(e)
          }
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }
    }

  });

}


module.exports.suspend_partner = async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      var institution = await Partner.findOne({ _id: req.params.id })
      if (!institution) {
        return res.status(401).json({ "code": 423, "message": "Partner does not exists" })
      } else
        if (super_admin) {
          try {
            institution.status = false;
            await institution.save();
            res.status(200).json({ "code": 200, "message": "Partner Suspended Successfully", "response": institution });
          } catch (e) {
            return next(e)
          }
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }
    }

  });

}

module.exports.activate_partner = async (req, res, next) => {
  jwt.verify(req.token, 'secretkey', async function (err, data) {
    if (err) {
      console.log('Failed Auth')
      res.status(403).json({ "code": 403, "message": 'Auth failed' })
    } else {
      const super_admin = await SuperAdmin.findOne({ email: data.username });
      var institution = await Partner.findOne({ _id: req.params.id })
      if (!institution) {
        return res.status(401).json({ "code": 423, "message": "Partner does not exists" })
      } else
        if (super_admin) {
          try {
            institution.status = true;
            await institution.save();
            res.status(200).json({ "code": 200, "message": "Partner Activated Successfully", "response": institution });
          } catch (e) {
            return next(e)
          }
        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }
    }

  });

}

module.exports.change_business_consiltant = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })

        var user = await User.findById({ _id: req.body.user_id }).select('-token -password -database -money_in -money_out -messages').populate('business')
          .populate('subscription_status')
          .populate('userID')
          .populate('consultant', '-token -password')

        const d_business_consultant = Consultant.find(user.consultant);

        const consultant = await Consultant.findOne({ consultant_id: req.body.consultant_id })

        if (!consultant) {
          return res.status(401).json({ "code": 423, "message": "Consultant not found" })

        } else if (!user
        ) {
          return res.status(401).json({ "code": 423, "message": "Consultant not found" })

        } else if (super_admin) {

          user.consultant_id = req.body.consultant_id;
          await user.save();

          res.status(200).json({ "code": 200, "response": user })

        } else if (institution && consultant.partner.equals(institution._id) && d_business_consultant.partner.equals(institution._id)) {

          user.consultant_id = req.body.consultant_id;
          await user.save();

          res.status(200).json({ "code": 200, "response": user })

        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }

      }
    })
  } catch (e) {
    next(e)
  }
})

// Function to get the month and year as a string (e.g., '2023-07')
function getMonthYearString(date) {
  const month = date.getMonth() + 1; // getMonth() is zero-based
  const year = date.getFullYear();
  return `${year}-${month < 10 ? '0' : ''}${month}`;
}

module.exports.dashboard_stat = catchAsync(async (req, res, next) => {
  try {
    jwt.verify(req.token, 'secretkey', async function (err, data) {
      console.log(data);
      if (err) {
        console.log('Failed Auth')
        res.status(403).json({ "code": 403, "message": 'Auth failed' })
      } else {
        const super_admin = await SuperAdmin.findOne({ email: data.username });
        const institution = await Partner.findOne({ email: data.username })
        const consultant = await Consultant.findOne({ email: data.username })
        const verido_partner = await Partner.findOne({ email: "partner@verido.app" })
        const verido_consultants = await Consultant.findOne({ partner: verido_partner._id })

        // Get the current date
        const currentDate = new Date();

        // Calculate the date 12 months ago
        const lastYearDate = new Date(currentDate);
        lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

        // Fetch all records for the last 12 months
        const subTransactions = await SubcriptionTransaction.find({
          starts: { $gte: lastYearDate.toISOString() }
        });

        // Initialize an array to store totals by month
        const monthlyTotals = [];

        var response = {};


        if (super_admin) {
          response['all_users'] = {
            partners: await Partner.countDocuments(),
            consultants: await Consultant.countDocuments(),
            businesses: await User.countDocuments(),
          };


          // Extract consultant IDs
          const consultantIds = verido_consultants == null ? [] : verido_consultants.map(cons => cons._id);

          response['verido_users'] = {
            partners: await Partner.countDocuments({ email: "partner@verido.app" }),
            consultants: await Consultant.countDocuments({ partner: verido_partner._id }),
            businesses: await User.countDocuments({ consultant: { $in: consultantIds } }),
          }

          response['independent_users'] = {
            consultants: await Consultant.countDocuments({ partner: null }),
            businesses: await User.countDocuments({ consultant: null }),
          }

          // earnings map
          // Sales earnings aggregation pipeline
          const salesEarnings = await Sale.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsReceived earnings aggregation pipeline
          const refundsReceivedEarnings = await RefundReceived.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyIn earnings aggregation pipeline
          const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments earnings aggregation pipeline
          const installmentsEarnings = await Installment.aggregate([
            { $match: { isMoneyIn: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all earnings
          const allEarnings = [
            ...salesEarnings,
            ...refundsReceivedEarnings,
            ...otherMoneyInEarnings,
            ...installmentsEarnings,
          ];

          // Reduce to accumulate total amounts per month
          const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const earningsArray = Object.values(earningsPerMonth);

          // money-out
          // DirectMaterial expenses aggregation pipeline
          const directMaterialExpenses = await DirectMaterial.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // DirectLabour expenses aggregation pipeline
          const directLabourExpenses = await DirectLabour.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // OverheadItemTransactions expenses aggregation pipeline
          const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Assets expenses aggregation pipeline
          const assetsExpenses = await Asset.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsGiven expenses aggregation pipeline
          const refundsGivenExpenses = await RefundGiven.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyOut expenses aggregation pipeline
          const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments expenses aggregation pipeline (isMoneyOut: 1)
          const installmentsExpenses = await Installment.aggregate([
            { $match: { isMoneyOut: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all expenses
          const allExpenses = [
            ...directMaterialExpenses,
            ...directLabourExpenses,
            ...overheadItemTransactionsExpenses,
            ...assetsExpenses,
            ...refundsGivenExpenses,
            ...otherMoneyOutExpenses,
            ...installmentsExpenses,
          ];

          // Reduce to accumulate total amounts per month
          const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const expensesArray = Object.values(expensesPerMonth);

          // Group transactions by month and calculate the total amount for each month
          subTransactions.forEach(transaction => {
            const monthYear = getMonthYearString(new Date(transaction.starts));
            const existingMonth = monthlyTotals.find(m => m.month === monthYear);

            if (existingMonth) {
              existingMonth.totalAmount += transaction.amount;
            } else {
              monthlyTotals.push({
                month: monthYear,
                totalAmount: transaction.amount
              });
            }
          });

          // Sort the results by month
          monthlyTotals.sort((a, b) => new Date(a.month) - new Date(b.month));


          response['money_in_v_money_out'] = {
            total_money_in: earningsArray,
            total_money_out: expensesArray,
            money_in: {
              sales: salesEarnings,
              refundsReceived: refundsReceivedEarnings,
              otherMoneyIn: otherMoneyInEarnings,
              installments: installmentsEarnings,
            },
            expenses: {
              directMaterial: directMaterialExpenses,
              directLabour: directLabourExpenses,
              overheadItemTransactions: overheadItemTransactionsExpenses,
              assets: assetsExpenses,
              refundsGiven: refundsGivenExpenses,
              otherMoneyOut: otherMoneyOutExpenses,
              installments: installmentsExpenses,
            },
            subscription: monthlyTotals
          }



          return res.status(200).json({ "code": 200, "message": "Dashboard Statistics", "data": response });


        } else if (institution) {


          const consultants = await Consultant.find({ partner: institution._id });
          const consultantsID = consultants == null ? [] : consultants.map(consultant => consultant._id);
          const bsns = await User.find({ consultant: { $in: consultantsID } });
          const bsnsID = await bsns.map(bzn => bzn._id.toString());
          const bsnsOID = await bsns.map(bzn => bzn._id);

          // Fetch all records for the last 12 months
          const subTransactions = await SubcriptionTransaction.find({
            starts: { $gte: lastYearDate.toISOString() }, user: { $in: bsnsOID },
          });

          // Initialize an array to store totals by month
          const monthlyTotals = [];


          response['all_users'] = {
            consultants: await Consultant.countDocuments({ partner: institution._id }),
            businesses: await User.countDocuments({ consultant: { $in: consultantsID } }),
          };
          // earnings map
          // Sales earnings aggregation pipeline
          const salesEarnings = await Sale.aggregate([

            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsReceived earnings aggregation pipeline
          const refundsReceivedEarnings = await RefundReceived.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyIn earnings aggregation pipeline
          const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments earnings aggregation pipeline
          const installmentsEarnings = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyIn: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all earnings
          const allEarnings = [
            ...salesEarnings,
            ...refundsReceivedEarnings,
            ...otherMoneyInEarnings,
            ...installmentsEarnings,
          ];

          // Reduce to accumulate total amounts per month
          const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const earningsArray = Object.values(earningsPerMonth);

          // money-out
          // DirectMaterial expenses aggregation pipeline
          const directMaterialExpenses = await DirectMaterial.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // DirectLabour expenses aggregation pipeline
          const directLabourExpenses = await DirectLabour.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // OverheadItemTransactions expenses aggregation pipeline
          const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Assets expenses aggregation pipeline
          const assetsExpenses = await Asset.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsGiven expenses aggregation pipeline
          const refundsGivenExpenses = await RefundGiven.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyOut expenses aggregation pipeline
          const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments expenses aggregation pipeline (isMoneyOut: 1)
          const installmentsExpenses = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyOut: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all expenses
          const allExpenses = [
            ...directMaterialExpenses,
            ...directLabourExpenses,
            ...overheadItemTransactionsExpenses,
            ...assetsExpenses,
            ...refundsGivenExpenses,
            ...otherMoneyOutExpenses,
            ...installmentsExpenses,
          ];

          // Reduce to accumulate total amounts per month
          const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const expensesArray = Object.values(expensesPerMonth);

          // Group transactions by month and calculate the total amount for each month
          subTransactions.forEach(transaction => {
            const monthYear = getMonthYearString(new Date(transaction.starts));
            const existingMonth = monthlyTotals.find(m => m.month === monthYear);

            if (existingMonth) {
              existingMonth.totalAmount += transaction.amount;
            } else {
              monthlyTotals.push({
                month: monthYear,
                totalAmount: transaction.amount
              });
            }
          });

          // Sort the results by month
          monthlyTotals.sort((a, b) => new Date(a.month) - new Date(b.month));



          response['money_in_v_money_out'] = {
            total_money_in: earningsArray,
            total_money_out: expensesArray,
            money_in: {
              sales: salesEarnings,
              refundsReceived: refundsReceivedEarnings,
              otherMoneyIn: otherMoneyInEarnings,
              installments: installmentsEarnings,
            },
            expenses: {
              directMaterial: directMaterialExpenses,
              directLabour: directLabourExpenses,
              overheadItemTransactions: overheadItemTransactionsExpenses,
              assets: assetsExpenses,
              refundsGiven: refundsGivenExpenses,
              otherMoneyOut: otherMoneyOutExpenses,
              installments: installmentsExpenses,
            },
            subscription: monthlyTotals
          }


          return res.status(200).json({ "code": 200, "message": "Dashboard Statistics", "data": response });


        } else if (consultant) {
          const bsns = await User.find({ consultant: consultant._id });
          const bsnsID = await bsns.map(bzn => bzn._id.toString());
          const bsnsOID = await bsns.map(bzn => bzn._id);

          // Fetch all records for the last 12 months
          const subTransactions = await SubcriptionTransaction.find({
            starts: { $gte: lastYearDate.toISOString() }, user: { $in: bsnsOID },
          });

          // Initialize an array to store totals by month
          const monthlyTotals = [];



          response['all_users'] = {
            businesses: await User.countDocuments({ consultant: consultant._id }),
          };
          // earnings map
          // Sales earnings aggregation pipeline
          const salesEarnings = await Sale.aggregate([

            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsReceived earnings aggregation pipeline
          const refundsReceivedEarnings = await RefundReceived.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyIn earnings aggregation pipeline
          const otherMoneyInEarnings = await OtherMoneyIn.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments earnings aggregation pipeline
          const installmentsEarnings = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyIn: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all earnings
          const allEarnings = [
            ...salesEarnings,
            ...refundsReceivedEarnings,
            ...otherMoneyInEarnings,
            ...installmentsEarnings,
          ];

          // Reduce to accumulate total amounts per month
          const earningsPerMonth = allEarnings.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const earningsArray = Object.values(earningsPerMonth);

          // money-out
          // DirectMaterial expenses aggregation pipeline
          const directMaterialExpenses = await DirectMaterial.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // DirectLabour expenses aggregation pipeline
          const directLabourExpenses = await DirectLabour.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // OverheadItemTransactions expenses aggregation pipeline
          const overheadItemTransactionsExpenses = await OverheadItemTransaction.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Assets expenses aggregation pipeline
          const assetsExpenses = await Asset.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // RefundsGiven expenses aggregation pipeline
          const refundsGivenExpenses = await RefundGiven.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amount" }
              }
            }
          ]);

          // OtherMoneyOut expenses aggregation pipeline
          const otherMoneyOutExpenses = await OtherMoneyOut.aggregate([
            { $match: { userID: { $in: bsnsID } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Installments expenses aggregation pipeline (isMoneyOut: 1)
          const installmentsExpenses = await Installment.aggregate([
            { $match: { userID: { $in: bsnsID }, isMoneyOut: 1 } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } } },
                totalAmount: { $sum: "$amountPaid" }
              }
            }
          ]);

          // Combine all expenses
          const allExpenses = [
            ...directMaterialExpenses,
            ...directLabourExpenses,
            ...overheadItemTransactionsExpenses,
            ...assetsExpenses,
            ...refundsGivenExpenses,
            ...otherMoneyOutExpenses,
            ...installmentsExpenses,
          ];

          // Reduce to accumulate total amounts per month
          const expensesPerMonth = allExpenses.reduce((acc, { _id, totalAmount }) => {
            if (!acc[_id]) {
              acc[_id] = { month: _id, totalAmount: 0 };
            }
            acc[_id].totalAmount += totalAmount;
            return acc;
          }, {});

          const expensesArray = Object.values(expensesPerMonth);

          // Group transactions by month and calculate the total amount for each month
          subTransactions.forEach(transaction => {
            const monthYear = getMonthYearString(new Date(transaction.starts));
            const existingMonth = monthlyTotals.find(m => m.month === monthYear);

            if (existingMonth) {
              existingMonth.totalAmount += transaction.amount;
            } else {
              monthlyTotals.push({
                month: monthYear,
                totalAmount: transaction.amount
              });
            }
          });

          // Sort the results by month
          monthlyTotals.sort((a, b) => new Date(a.month) - new Date(b.month));




          response['money_in_v_money_out'] = {
            total_money_in: earningsArray,
            total_money_out: expensesArray,
            money_in: {
              sales: salesEarnings,
              refundsReceived: refundsReceivedEarnings,
              otherMoneyIn: otherMoneyInEarnings,
              installments: installmentsEarnings,
            },
            expenses: {
              directMaterial: directMaterialExpenses,
              directLabour: directLabourExpenses,
              overheadItemTransactions: overheadItemTransactionsExpenses,
              assets: assetsExpenses,
              refundsGiven: refundsGivenExpenses,
              otherMoneyOut: otherMoneyOutExpenses,
              installments: installmentsExpenses,
              subscription: monthlyTotals
            }
          }

          return res.status(200).json({ "code": 200, "message": "Dashboard Statistics", "data": response });



        } else {
          return res.status(401).json({ "code": 423, "message": "You dont have permission to perform this action" })
        }



      }
    })
  } catch (e) {
    next(e)
  }
})