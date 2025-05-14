import { Router } from "express";

import {
  changeCurrentPassword,
  CreateUser,
  forgotPassword,
  homePage,
  LoginUser,
  LogoutUser,
  RegenrateOtp,
  resetPassword,
  SplashScreen,
  VerifyOtp,
  verifyUser,
} from "../Controller/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";


const router = Router();


// User Routes
router.post("/home", homePage);
// router.post("/register", RegisterUser);
router.post ("/verifyUser" ,verifyUser)
router.post("/createuser", CreateUser)
router.put("/verifyotp", VerifyOtp);
router.put("/regenrateotp", RegenrateOtp);
router.post("/login", LoginUser);
router.post("/logout", verifyJWT,LogoutUser);
router.post("/change_password",verifyJWT ,  changeCurrentPassword); 
router.post("/forgotPassword", forgotPassword);
router.post("/resetpassword" ,resetPassword);
router.get("/splash",verifyJWT , SplashScreen);

export default router;
