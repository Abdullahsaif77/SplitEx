const Expenses = require('../models/expense')


const getExpense = async(req,res)=>{
    try{
        const userId = req.user.id;
        const UserExpense = await Expenses.find({
            $or:[
                {'payer':userId},
                {'participants.userId':userId}
            ]
        })
        .populate('payer','name email')
        .populate('participants.userId','name email')

        if(!UserExpense){
            return res.status(400).json({message:"User Expense are not found"})
        }

        return res.status(200).json({
            UserExpense
        })
    }
    catch(error){
        return res.status(500).json({message:"Error",error})
    }
}

module.exports = getExpense;