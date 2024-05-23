const express = require('express')
const authenticationMiddlewares=require('../middlewares/auth')
const adminController = require('../controllers/adminController')
const User = require('../models/user')
const router=express.Router()

router.post('/create-admin',async(req,res)=>{
const admin=new User();
admin.name="Admin",
admin.email="vooshadmin@gmail.com"
admin.password="Voosh@12"
admin.isAdmin=true
await admin.save()
})

router.get('/v1/view-profiles',authenticationMiddlewares.authenticateToken,authenticationMiddlewares.checkAdmin,adminController.viewProfiles)


module.exports = router