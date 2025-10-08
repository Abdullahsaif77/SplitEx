const { default: mongoose } = require("mongoose");

const dbErrorHandling = (err,req,res,next)=>{
    console.error("🔥 Database Error:", err);

    if(err instanceof mongoose.Error.ValidationError){
        res.status(500).json({error:"Validation Error:",details:err.errors})
    }

    if(err.code == 11000){
        res.status(400).json({error:"Duplicate key Error:",details:err.keyValue})
    }
    res.status(500).json({ error: "Database error occurred", details: err.message });
}

module.exports = dbErrorHandling;