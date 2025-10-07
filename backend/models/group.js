const mongoose = require("mongoose")

const memberSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site_users",
        required:true
    },
    role:{
        type:String,
        enum:['admin','member'],
        required:true
    }
})

const groupSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    currency:{
        type:String,
        default:"PKR"
    },
    members:[memberSchema],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'site_users',
        required:true,
    },
  },
  {
    timestamps:{createdAt:true,updatedAt:false},
  }
);
const group = mongoose.model("group_info",groupSchema)
module.exports = group;
