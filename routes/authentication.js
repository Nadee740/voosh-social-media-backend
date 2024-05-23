const express = require('express')
const router = express.Router()
const passport = require('passport');
const authenticationMiddlewares = require('../middlewares/auth');
const User = require('../models/user');
const userController=require('../controllers/userController');


router.post('/v1/user-email-signup',userController.userSignUp)

router.post("/v1/user-email-login", passport.authenticate("local",{ failureRedirect: '/' }), (req, res) => {
  try{
    if(!req.user)
      res.status(401).send({status:"failed",msg:"Invalid User !"})
  
    const { user, accessToken, refreshToken } = req.user;
     res.status(200).send({
        status: "success",
        msg: "User signed in successfully",
        data: user,
        accessToken,
        refreshToken
      })
  }catch(err){
    res.status(401).send({status:"failed",msg:"Invalid User !"})
  }

});


router.get('/v1/google-sign-in',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/v1/google-sign-in/callback',
  passport.authenticate('google', {failureRedirect: '/api/auth/v1/google-sign-in/failed' }),
  async (req, res) => {
    const { user, accessToken, refreshToken } = req.user;
    res.status(200).send({
      status: "success",
      msg: "User signed in successfully",
      data: user,
      accessToken,
      refreshToken
    })
  }
);

router.get('/v1/google-sign-in/failed',(req,res)=>{
res.status(401).send({status:"failed",msg:"Authentication Failed"});
})

router.post('/v1/generate-tokens', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).send({status:"failed",msg:"Not authorized "});;

  try {
    const payload = authenticationMiddlewares.verifyRefreshToken(token);
    const user = await User.findById({_id:payload.userId,'tokens.token':token});
    if (!user) {
      return res.status(403).send({status:"failed",msg:"Not authorized !"});
    }

    const tokens = await user.generateTokens(user);

    user.tokens = user.tokens.filter(t => t.token != token);
    user.tokens.push({token:tokens.refreshToken});
    await user.save();

    res.status(200).send({status:"success",msg:"generated tokens", accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    res.status(403).send({
      status:"failed",
      msg:err.message
    });
  }
});


module.exports = router;