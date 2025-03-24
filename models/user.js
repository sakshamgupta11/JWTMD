import mongoose from "mongoose";

// ! Defining Schema 
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    token: { type: String },
    tc: { type: Boolean, required: true }
}, { timestamps: true });  

// ! Model 
const userModel = mongoose.model("User", userSchema);

export default userModel;
