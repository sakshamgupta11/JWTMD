import express from "express"
import userConteroller from "../controller/userController.js";

const router = express.Router();

//public route 
router.post('/register',userConteroller.userRegistration)
router.post('/login',userConteroller.userLogin)
// private route


export default router