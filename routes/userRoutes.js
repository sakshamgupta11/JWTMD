import express from "express"
import userConteroller from "../controller/userController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

const router = express.Router();


// Route level middle ware 
router.use('/updatepassword', checkUserAuth)

//public route 
router.post('/register',userConteroller.userRegistration)
router.put('/login',userConteroller.userLogin)
// private route
router.post('/updatepassword',userConteroller.changePassword)


export default router