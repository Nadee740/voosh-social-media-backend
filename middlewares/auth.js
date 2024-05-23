const jwt=require('jsonwebtoken')
const User = require('../models/user')
const CryptoJS = require("crypto-js");


const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  };


  const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  };
const authenticateToken = async (req, res, next) => {

    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.replace('Bearer ','');
   
  
    if (!token) 
      return res.status(401).send({status:"failed",msg:"user not found !"});
  
    try {
      const data = verifyAccessToken(token);
      const userId=data.userId;
      const user = await User.findById(userId);
      if(!user)
        return res.status(401).msg({status:"failed",msg:"user not found"});
      req.user = user;
      next();
    } catch (err) {
      res.status(401).send({status:"failed",msg:"user not found"});
    }
  };

const checkAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).msg({status:"failed",msg:"Not Authorized"});
    }
    next();
  };

function encrypt(data) {
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.ENCRYPTION_KEY).toString();
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  }
  
function decrypt(data) {
    let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    return CryptoJS.AES.decrypt(decData, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
  }
module.exports={authenticateToken,verifyAccessToken, verifyRefreshToken,checkAdmin,encrypt,decrypt}