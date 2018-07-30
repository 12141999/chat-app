var crypto = require('crypto');
var key = "thekey%%123";
var text = "crypto is awesome";
var enc = crypto.createCipher("aes-256-ctr" , key).update(text , "utf-8" , "hex");
var dec = crypto.createDecipher("aes-256-ctr" , key).update(enc , "hex" ,"utf-8" );
console.log(enc); 
console.log(dec); 