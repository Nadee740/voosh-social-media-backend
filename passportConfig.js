const passport=require("passport");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done("invalid User", false);
      }
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        return done("invalid User !", false);

      }
      const {accessToken,refreshToken} = await user.generateTokens()
      await user.save()

      return done(null, {user,accessToken,refreshToken});
    } catch (err) {
      return done(err);
    }
  }
));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/v1/google-sign-in/callback/'
  },
async (googleAccessToken, googleRefreshToken,profile, done) => {
    const user=await User.findOne({email:profile.emails[0].value})
    console.log(user,profile.emails[0].value)
    if(!user){
      const newUser=new User({
        name:profile.displayName,
        email:profile.emails[0].value,
        googleId:profile.id,
        sso:true
      })
      
        
      const {accessToken,refreshToken} =await newUser.generateTokens();
      await newUser.save()
      
      return done(null,{user:newUser,accessToken,refreshToken})
    }
    if(user.googleId!=profile.id)
      {user.googleId=profile.id}
    const {accessToken,refreshToken} =await user.generateTokens();
    await user.save()
    return done(null,{user,accessToken,refreshToken})

  }));

  passport.serializeUser((user, done) => {
    done(null, user.user._id);
  });
  
  passport.deserializeUser((id, done) => {
    const user =User.findById(id);
    done(null, user);
  });