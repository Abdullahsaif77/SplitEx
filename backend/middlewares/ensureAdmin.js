const Group = require('../models/group')

const ensureAdmin = async(req,res,next)=>{
    try{
        const groupId = req.params.id;
        const userId = req.user.id;

        const IsAdmin = await Group.findOne({
            _id:groupId,
            members:{
                $elemMatch:{userId : userId , role:'admin'}
            }
        })
        if(!IsAdmin){
            return res.status(400).json({message:"Access denied: admin only"})
        }

        next();
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server error"})
    }
}

module.exports = ensureAdmin;