const express = require('express')
const router = express.Router();
const verifyToken = require('../authenticate')
const Admin = require('../controllers/admin')
const Constroller = require('../controllers/consultant')
const generateUniqueId = require('../middleware/generateUniqueId');

// router.post('/admin-register', Admin.register_admin)

router.post('/admin-login', Admin.admin_login)

router.post('/admin-reset-password', Admin.resetPassword)

router.get('/admin/me', verifyToken, Admin.get_current_user)

router.get('/admin/partners', verifyToken, Admin.get_partners)

router.get('/admin/partners/:id', verifyToken, Admin.single_partner)

router.get('/admin/consultants', verifyToken, Admin.get_consultants)

router.get('/admin/consultants/:id', verifyToken, Admin.single_consultant)

router.post('/admin-password-update', Admin.passwordUpdate)

router.get('/admin-business', verifyToken, Admin.business)

router.get('/admin-business/:id', verifyToken, Admin.single_business)

router.post('/admin-business/change-consultant', verifyToken, Admin.change_business_consiltant)

router.get('/fetch-admins', Admin.admins)

router.post('/new-admin-message/:admin', Admin.admin_new_message)

router.post('/update-user-information/:id', Admin.updateUserInformation)

router.get('/fetch-admin-message/:admin', Admin.fetch_admin_message)

router.get('/suspend-user/:id/:type', Admin.suspendUser)

router.post('/update-business/:id', Admin.updateBusiness)

// router.post('/edit-vidoes/:id', Admin.editVideos)

router.post('/admin/videos/create', verifyToken, Admin.create_video)

router.post('/admin/videos/update/:id', verifyToken, Admin.update_video)

router.delete('/admin/videos/:id', verifyToken, Admin.delete_video)


router.get('/admin/videos', verifyToken, Admin.videos)

router.post('/update-subscription/:id', Admin.updateSubscription)

router.post('/update-fullname/:id', Admin.updateUsername)

router.post('/consultant/register', Constroller.register)

router.post('/consultant/create', verifyToken, Constroller.create_account)

router.post('/partner/create', generateUniqueId, verifyToken, Admin.create_partner)

router.get('/consultant/suspend/:id', verifyToken, Constroller.suspend)

router.get('/consultant/activate/:id', verifyToken, Constroller.activate)

router.get('/partner/suspend/:id', verifyToken, Admin.suspend_partner)

router.get('/partner/activate/:id', verifyToken, Admin.activate_partner)

router.get('/dashboard/stat', verifyToken, Admin.dashboard_stat)

module.exports = router

