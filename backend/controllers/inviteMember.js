const Groups = require("../models/group")
const Users = require("../models/users")
const validator = require('validator');
const inviteToken = require("../utils/inviteTokenGenerate")
const Invite = require("../models/invites")
const sendEmail = require("../utils/emailGenerator")


const InviteMembers = async(req,res)=>{
    try{
        const groupId = req.params.id;
        const {email} = req.body;
        const userId = req.user.id;

        if(!email || !validator.isEmail(email)){
           return res.status(400).json({message:"Invalid email address"});
        }

        const existGroup = await Groups.findOne({_id:groupId});
        if(!existGroup){
            return res.status(401).json({message:"Group is not existed"});
        }

        const IsAdmin = await Groups.findOne({
            _id:groupId,
            'members.userId':userId,
            'members.role':'admin'
        })
        if(!IsAdmin){
            return res.status(401).json({message:"User is not admin"})
        }

        const userExists = await Users.findOne({email});
        if (userExists) {

            const userInGroup = await Groups.findOne({
                _id:groupId,
                'members.userId':userExists.id
            })
            if(userInGroup){
                return res.status(400).json({message:"User is already in the group"})
            }

            existGroup.members.push({userId:userExists._id,role:'member'})
            await existGroup.save();

            res.status(200).json({message:"User is added succesfully"})

          }else{

            const { token, expiresAt } = inviteToken(48);
      
          const invite = new Invite({
            email,
            groupId,
            token,
            expiresAt,
            invitedBy: req.user.id,
          });
          await invite.save();

          const inviteLink = `http://localhost:5173/invite/accept/${token}`;

          await sendEmail(
            email, 
            "You're invited to join a group!", 
            `<p>Hello,</p>
             <p>You have been invited to join the group <b>${existGroup.name}</b>.</p>
             <p>Click below to accept your invitation (valid for 48 hours):</p>
             <a href="${inviteLink}">${inviteLink}</a>
             <p>If you don’t have an account, you’ll be asked to sign up first.</p>
             <br/>
             <p>– SPLIT_EX Team</p>`
          );
      
          res.status(201).json({
            message: "Invite sent successfully",
            inviteLink,
          });
        }
    }
    catch(error){
        console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = InviteMembers;