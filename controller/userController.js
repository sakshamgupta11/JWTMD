import userModel from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
import transporter from "../config/emailConfic.js";
import { error } from "console";
import { status } from "init";
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
            const updatedUser = await userModel.findOneAndUpdate(
                { email: email },
                { $set: { token: token } },
                { new: true }
            );

            // Send success response along with the generated token
            return res.status(200).json({ status: "success", message: "Login successful", token: token });


        } catch (error) {
            // Log the error in the console for debugging
            console.error(error);

            // Send an internal server error response
            return res.status(500).json({ status: "failed", message: "Internal server error" }); // Fixed typo in "message" & "internal"
        }
    }
    static changePassword = async (req, res) => {
        try {

            const { password, password_confirmation } = req.body;
            if (!password || !password_confirmation) {
                return res.status(400).json({ message: "All fields are required.." })
            }
            if (password !== password_confirmation) {
                return res.status(400).json({ message: "password and confirm password does not match" })
            }
            const salt = await bcrypt.genSalt(10)
            const newhashPassword = await bcrypt.hash(password, salt)
            await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newhashPassword } })

            res.status(200).json({ message: "The password has been updated ..." })

        } catch (error) {
            res.status(500).json({ error: "internal server error" })
        }
    }

    static loggedUser = async (req, res) => {
        res.status(200).json({ "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        try {

            if (!email) {
                return res.status(400).json({ status: "failed", message: "email are required" });
            }
            const user = await userModel.findOne({ email: email })
            if (!user) {
                return res.status(400).json({ status: "failed", message: "email does not exist please register or enter correct email" })
            }

            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" })
            // const link = `http://127.0.0.13000/api/user/reset/${user._id}/${token}`
            const link = `http://127.0.0.1:3000/api/user/reset-password/${user._id}/${token}`

            // send email

            let info = await transporter.sendMail({
                from:process.env.EMAIL_FROM,
                to:user.email,
                subject:"saksham PVT LMD - password -reset -link",
                // html:`<a href=${link}> click here<a/> to Reset your password`
                html: `<a href="${link}" target="_blank">Click here</a> to reset your password`


            })

            // console.log(link)
            res.status(200).json({ message: "email sent please check your register  email","info":info })

        } catch (error) {
            console.error("Error in sending email:", error);
            res.status(500).json({ status: "failed", message: "internal server error" })
        }

    }


    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params
        const user = await userModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (!password || !password_confirmation) {
                return res.status(400).json({ status: "failed", message: "all feilds are required" })
            }
            if (password !== password_confirmation) {
                return res.status(400).json({ status: "faild", message: "password and confirm password does not match" })
            }
            const salt = await bcrypt.genSalt(10)
            const newhashPassword = await bcrypt.hash(password, salt)
            await userModel.findByIdAndUpdate(user._id, { $set: { password: newhashPassword } })

            return res.status(200).json({status:"success",message:"password updated"})


        } catch (error) {
            return res.status(400).json({ message: "invalid token" })
        }

    }
}



export default userConteroller