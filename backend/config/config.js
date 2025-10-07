const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/SPLIT_EX')
        console.log("Database is connected...")
    }
    catch(error){
        console.log("Database failed to connect",error.message)
    }
}

module.exports = connectDB;

