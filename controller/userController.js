import userModel from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
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
                            const userSave =  await doc.save()
                            // generate JWT token
                            const token = jwt.sign({ userID: save_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                           
                           await userModel.findByIdAndUpdate(userSave._id, { token });
                            res.status(201).json({ status: "success", message: "registrered successfully", "token": token })

                        } catch (error) {
                            console.log(error);
                         return   res.status(400).json({ error: "error in interting data registraction" })

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

        }
    }
}

export default userConteroller