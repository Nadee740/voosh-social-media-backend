const CryptoJS = require("crypto-js");

function encrypt(data) {
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.ENCRYPTION_KEY).toString();
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  }
  
function decrypt(data) {
    let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    return CryptoJS.AES.decrypt(decData, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
}

module.exports={encrypt,decrypt}