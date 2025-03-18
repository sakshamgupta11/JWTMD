import mongoose from "mongoose";
// import { type } from "os";

// ! Defining Schema 

const  userSchema =  new mongoose.Schema({
    name:{type:String, required:true,trim:true},
    email:{type:String, required:true,trim:true},
    password:{type:String, required:true,trim:true},
    token:{type:String},
    tc:{type:Boolean, required:true}
})

// Model 

const userModel = mongoose.model("user",userSchema)

export default userModel