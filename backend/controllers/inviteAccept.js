const Group = require('../models/group');
const Users = require('../models/users')
const invites = require('../models/invites')

const acceptInvite = async(req,res)=>{
    try{
        const token = req.params.id;
        const invite = await invites.findOne({token});
        if(!invite){
            return res.status(401).json({message:"Invalid or expired token"});
        }

        if(invite.expiresAt < new Date()){
            return res.status(401).json({message:"Token is expired"});
        }

        const user = await Users.findOne({email:invite.email})
        if(!user){
            return res.status(200).json({ 
                message: "User not registered yet", 
                action: "redirect_to_signup",
                email: invite.email,
                groupId: invite.groupId,
                token: invite.token
              });
              
        }

        const alreadyInGroup =await Group.findOne({
            _id:invite.groupId,
            'members.userId':user._id
        })
        if(alreadyInGroup){
            return res.status(400).json({message:'User is already in group'})
        }

        await Group.updateOne(
            { _id: invite.groupId },
            { $push: { members: { userId: user._id, role: "member" } } 
        })

        await invites.deleteOne({ _id: invite._id });

    return res.status(200).json({ message: "Joined group successfully" });
    }
    catch(error){
        console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = acceptInvite;