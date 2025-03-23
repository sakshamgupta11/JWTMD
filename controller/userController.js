import userModel from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
import { error } from "console";
dotenv.config()


class userConteroller {
    static userRegistration = async (req, res) => {
        try {
            const { name, email, password, password_confirmation, tc } = req.body
            const user = await userModel.findOne({ email: email })
            if (user) {
                return res.status(400).json({ error: "email already exists" })
            }
            else {
                if (name && email && password && password_confirmation && tc) {
                    if (password === password_confirmation) {
                        try {
                            const salt = await bcrypt.genSalt(18)
                            const hashPassword = await bcrypt.hash(password, salt)
                            const doc = new userModel({
                                name: name,
                                email: email,
                                password: hashPassword,
                                tc: tc

                            })

                            const save_user = userModel.findOne({ email: email })
                            const userSave = await doc.save()
                            // generate JWT token
                            const token = jwt.sign({ userID: save_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })

                            await userModel.findByIdAndUpdate(userSave._id, { token });
                            res.status(201).json({ status: "success", message: "registrered successfully", "token": token })

                        } catch (error) {
                            console.log(error);
                            return res.status(400).json({ error: "error in interting data registraction" })

                        }

                    }
                    else {
                        res.status(400).json({ error: "password and confrimed password does not match" })
                    }

                } else {
                    res.status(400).json({ error: "all fields are required" })
                }
            }
        } catch (error) {
res.status(500).json({ status: "failed", message: "Internal server error" })
        }
    }
    static userLogin = async (req, res) => {
        try {
            // Extract email, password, and tc (terms & conditions) from the request body
            const { email, password, tc } = req.body;
    
            // Validate if all required fields are provided
            if (!email || !password || !tc) {
                return res.status(400).json({ error: "All fields are required" }); // Fixed typo in "fields"
            }
    
            // Find the user in the database using the provided email
            const user = await userModel.findOne({ email: email });
    
            // If user does not exist, return an error response
            if (!user) {
                return res.status(400).json({ error: "User does not exist" });
            }
    
            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);
    
            // If password is incorrect, return an error response
            if (!isMatch) {
                return res.status(400).json({ error: "Email or password is incorrect" }); // Fixed typo in "incorrect"
            }
    
            // Generate a JWT token with user ID and set expiration time to 5 days
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
    
            // Send success response along with the generated token
            return res.status(200).json({ status: "success", message: "Login successful", token: token });
    
        } catch (error) {
            // Log the error in the console for debugging
            console.error(error);
    
            // Send an internal server error response
            return res.status(500).json({ status: "failed", message: "Internal server error" }); // Fixed typo in "message" & "internal"
        }
    }
    
}

export default userConteroller