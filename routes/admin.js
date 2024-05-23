const express = require('express')
const authenticationMiddlewares=require('../middlewares/auth')
const adminController = require('../controllers/adminController')
const router=express.Router()

router.get('/v1/view-profiles',authenticationMiddlewares.authenticateToken,authenticationMiddlewares.checkAdmin,adminController.viewProfiles)
