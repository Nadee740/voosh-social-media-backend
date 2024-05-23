const User = require("../models/user")


const viewProfiles =async(req,res)=>{
    try{
        const user=await User.find();
        res.status(200).send({
            status:"ok",
            msg:"got user profiles",
            data:user
        })

    }catch(err){
        res.status(404).send({
            status:"failed",
            msg:err.message
        })
    }
}

module.exports ={viewProfiles}