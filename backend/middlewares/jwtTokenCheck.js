const jwt = require('jsonwebtoken')
require("dotenv").config();
const secret_key = process.env.JWT_SECRET_PASS

const authMiddleware = (req,res,next)=>{
    
    try{
        const authHeader = req.headers["authorization"]
        if(!authHeader){
            return res.status(401).json({message:"No token provided"})
        }
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({message:"Token is not found"})
        }

        jwt.verify(token , secret_key , (err , decoded)=>{
            if(err){
                return res.status(403).json({ message: "Invalid or expired token" });
            }

            req.user = decoded;
            console.log(decoded);
            next();
        })
    }
    catch(error){
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = authMiddleware;