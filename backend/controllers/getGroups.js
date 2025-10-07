const Groups = require('../models/group')
const Users = require('../models/users')

const getGroups = async(req,res)=>{
    try{
        const userId = req.user.id;
        if(!userId){
            return res.status(400).json({message:"User is not found"});
        }
        const UserName = await Users.findById(userId)
        const UsersGroup = await Groups.find({ 'members.userId': userId })
        .populate('members.userId', 'name email');

        res.status(200).json({
            Groups:UsersGroup,
            LoggedIn:UserName
        })
    }
    catch(error){
        return res.status(500).json({message:"Error",error})
    }
}

module.exports = getGroups;