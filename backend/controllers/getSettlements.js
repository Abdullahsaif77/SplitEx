const Settlements = require('../models/settle')

const getSettlement = async(req,res)=>{
    try{
        const userId = req.user.id;
        const userSettlements = await Settlements.find({
            $or:[
                {"payer.userId":userId},
                {"receiver.userId":userId}
            ]
        })
        if(!userSettlements){
            return res.status(400).json({message:"User settlements are not found"})
        }
        return res.status(200).json({
            UserSettlements : userSettlements
        })
    }
    catch(error){
        return res.status(500).json({message:"Error",error})
    }
}

module.exports = getSettlement;