const Group = require("../models/group")

const GetGroups = async(req,res)=>{
    try{
        const userId = req.user.id;
        const groups = await Group.findOne({createdBy:userId});
        console.log(userId);
        res.status(200).json({message:"All groups of a specific user are here",groups})
    }
    catch(error){
        console.log({message:"Error is :", error})
        res.status(500).json({message:"Server error",error})
    }
}

module.exports = GetGroups;