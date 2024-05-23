const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const CryptoJS = require("crypto-js");

function encrypt(data) {
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.ENCRYPTION_KEY).toString();
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  }
  
function decrypt(data) {
    let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    return CryptoJS.AES.decrypt(decData, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
}
const userSchema = new mongoose.Schema(
    {
        
        name: { 
            type: String, 
            trim: true },
        phone: { 
            type: String,
            trim: true 
         },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: /.+\@.+\..+/
        },
        password: {
            type: String,
            trim: true ,
            minlength: 6 ,
            validate: {
                validator: function(value) {
                  // Password complexity requirements: at least one uppercase letter, one lowercase letter, one digit, and one special character
                  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>?]).{8,}$/.test(value);
                },
                message: props => `${props.value} does not meet the password complexity requirements`
              }

        },
        sso:{
            type:Boolean,
            required:true,
            default:false
        },
        googleId:{
            type:String,
            trim: true
        },
        bio: { 
            type: String ,
            trim: true 
        },
        profileLink: { 
            type: String,
            validate: {
                validator: function(value) {
                  return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
                },
                message: props => `${props.value} is not a valid URL!`
              },
            trim: true 
         },
        public:{
            type:Boolean,
            required:true,
            default:false
        },
        isAdmin:{
            type:Boolean,
            required:true,
            default:false
        },
        tokens: [
            {
                token: {
                    type: String,

                    
                }
            }
        ]
    },
    {
        timestamp: true
    }
)


userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password') || (this.isNew && this.password)) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
            next();
          } catch (err) {
            next(err);
          }
    }
    else if(user.isModified('googleId')){
        try {
            const encryptedData=encrypt(user.googleId)
            user.googleId=encryptedData.toString();
            next();
          } catch (err) {
            next(err);
          }
    }
    else
    next()
   
  });
  
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.tokens;
    delete userObject.password
    delete userObject.googleId
    return userObject;
}

userSchema.methods.generateTokens = async function () {
    const user = this;
    const accessToken = jwt.sign(
        { userId: user._id.toString() }, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION })
    
    const refreshToken = jwt.sign(
           { userId: user._id.toString() },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
          );
    user.tokens.push({token: refreshToken})
    
    return {accessToken,refreshToken};

}

userSchema.methods.isValidPassword = async function (password) {

    if(!this.password)
        return false;
    return await bcrypt.compare(password, this.password);
  };


const User = mongoose.model("users", userSchema)

module.exports = User
