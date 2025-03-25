import jwt from "jsonwebtoken"
import userModel from "../models/user.js"
import { error } from "console";

const checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers
    // Check if authorization header exists and starts with "Bearer"
    if (authorization && authorization.startsWith("Bearer")) {

        try {
            // Get token from headers (split by space, not empty string)
            token = authorization.split(" ")[1]

             // Verify token 
             const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
             // console.log(userID)
             // Get user from token (exclude the password)
             req.user = await userModel.findById(userID).select("-password");
 
             next();

        } catch (error) {
            res.status(401).json({ status: "failed", error: "Unauthorized user" })
        }

    } else {
        res.status(401).json({ status: "failed", error: "Unauthorized user, no token" })
    }
}

export default checkUserAuth