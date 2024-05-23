const express=require('express')
const router=express.Router()
const multer = require('multer');
const userController=require('../controllers/userController')
const authenticationMiddlewares=require('../middlewares/auth')

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });



router.get('/v1/view-user-profile',authenticationMiddlewares.authenticateToken,userController.viewUserProfile)

router.post('/v1/edit-user-profile-image',upload.single('file'),authenticationMiddlewares.authenticateToken,userController.uploadUserProfilePicture)

router.put('/v1/edit-user-profile',authenticationMiddlewares.authenticateToken,userController.editUserProfile)

router.get('/v1/view-profiles',authenticationMiddlewares.authenticateToken,userController.viewProfiles)

module.exports=router