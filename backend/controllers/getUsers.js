const Users = require('../models/users')

const getUsers = async(req,res)=>{
    try{
        const user = await Users.find()
        if(!user){
            return res.status(400).json({message:"Users are not found"})
        }
        res.status(200).json({
            Friends:user
        })
    }
    catch(error){
        return res.status(400).json({message:"Error",error})
    }
}

module.exports = getUsers