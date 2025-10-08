const Users = require('../models/users')
const Balances = require('../models/balance')

const GetUserBalances  = async(req,res)=>{
    try{
        
        const balance = await Balances.find()
        const userId = balance.map(items => items.userId)
        const userName = await Users.find({_id:{$in:userId}})
        const names = userName.map(user => user.name)
        
        if(!balance){
            return res.status(400).json({message:"This user balance is not found"})
        }
        res.status(200).json({
            balance,
            names
        })
    }
    catch(error){
        return res.status(500).json({message:"Error" , error})
    }
}

module.exports = GetUserBalances