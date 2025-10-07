const Group = require('../models/group')
const Users = require("../models/users")

const ensureMember = async(req,res,next)=>{
    try{
        const groupId = req.params.id
        const userId = req.user.id

        const existUser = await Group.findOne({
            _id:groupId,
            'members.userId':userId,             
        })
        if(!existUser){
            return res.status(400).json({message:"Access denied : not a group member"})
        }

        next();

    }
    catch(error){
        console.log(error);
        return res.status(500).json({message:"Server error"})
    }
}

module.exports = ensureMember;