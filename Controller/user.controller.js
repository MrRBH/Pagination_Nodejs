import User from "../Model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendOtpEmail } from "../utils/sendOtp.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Session from "../Model/session.model.js";
// import { redis } from "../utils/Redis.js";


// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Function to generate access and refresh tokens
const generateAccessAndRefereshTokens = async (userId ,req) => {
  try {
    console.log("called generateAccessAndRefereshTokens");
    
    const user = await User.findById(userId);
    if(!user){
      throw new ApiError(404, "Provide UserId Plaease");
    }

    // Generate tokens using the user instance methods
    const accessToken = user.generateAccessToken(); // Assuming this is a method on your User model
    const refreshToken = user.generateRefreshToken(); // Assuming this is a method on your User model

    // Save the refresh token to the user
//   const session = await Session.create({
//       userId: user._id,
//       refreshToken,
//       accessToken,
//       userAgent: req.headers['user-agent'],
//       ipAddress: req.ip,
//   })
//  console.log("Session about to be created", { userId: user._id, userAgent: req.headers['user-agent'], ip: req.ip });

//   if (!session) {
//     throw new ApiError(500, "Session not created");
//   }
  
    // user.refreshToken = refreshToken;
    // user.accessToken = accessToken;
    // await user.save({ validateBeforeSave: false });

    // Return the tokens
    return { accessToken, refreshToken };
  } catch (error) {
    console.error({"Token Generation Error": error.message});
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
const homePage = asyncHandler(async (req, res) => {
  res.send("this is  home page ");
});

// GoogleLogin
const googleLogin = asyncHandler(async (req, res) => {
  const user = await req.user;
});


// Register User with OTP
const verifyUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError(400, "User already exists and is verified.");
    } else {
      const otp = generateOtp();
      console.log("OTP:", otp);
      
      existingUser.otp = otp;
      existingUser.otpExpires = Date.now() + 10 * 60 * 1000;
      await existingUser.save();
      await sendOtpEmail(email, otp);
      return res.status(200).json(
        new ApiResponse(200, email, "OTP re-sent. Please verify your email.")
      );
    }
  }

  const otp = generateOtp();
  console.log("Generated OTP:", otp);
  
  const otpExpires = Date.now() + 10 * 60 * 1000;

  await User.create({
    fullName, 
    email,
    password,
    otp,
    otpExpires,
  });

  await sendOtpEmail(email, otp);

  res.status(201).json(
    new ApiResponse(201, email, "User registered. OTP sent for verification.")
  );
});



const VerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
   if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
    
   }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // if (user.isVerified) {
  //   throw new ApiError(400, "User already verified");
  // }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (Date.now() > user.otpExpires) {
    throw new ApiError(400, "OTP has expired");
  }


  user.otp = null;
  user.otpExpires = null;
  await user.save();


 

  res.status(200).json(
    new ApiResponse(200, email, "OTP verified successfully. Now create account.")
  );
});
 

const RegenrateOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(req.body);

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Generate new OTP and set expiry (e.g., 10 minutes)
  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  // Update the user's OTP and expiration
  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  // Send OTP to user's email
  await sendOtpEmail(email, otp);

  // Send success response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        otp,
        "OTP regenerated successfully. Please check your email for new OTP."
      )
    );
});

const CreateUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found.");
  }
  // if (user) {
  //    throw new ApiError ("500" , "user already Existed")
  // }

  if (!user.isVerified) {
    user.isVerified =  true
  }

 
 
  await user.save();

  res.status(201).json(
    new ApiResponse(201, user, "User created successfully.")
  );
});



const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // const alreadyLoggedIn = await Session.findOne({ userId: user._id });
  // if (alreadyLoggedIn) {
  //   throw new ApiError(401, "User already logged in");
  // }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id, req);

  // Check if user is verified
  if (user.isVerified === true) {
    const userAgent = req.headers["user-agent"] || "Unknown User-Agent"; // Fallback to default value
    console.log({"User Agent": userAgent});
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP Address"; // Fallback to default value
    console.log({"IP Address": req.ip});
    
    // Store session with device details
    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      ipAddress,
      userAgent
    });
    console.log("Session created:", session._id);


    // Add session ID to user's sessions array

    user.sessions.push(session._id);
     if (!session._id) {
      throw new ApiError(500, "Session not created");
     }
    await user.save();
    // Send response with user details and tokens
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, email: user.email },
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
  } else {
    throw new ApiError(401, "User not verified");
  }
});

// const LogoutUser = asyncHandler(async (req, res) => {
//   // const {userId } = req.body
//   const userId = req.user?._id;
//   console.log(userId);
  
//   if (!userId) {
//     throw new ApiError(401, "Unauthenticated user");
//   }
  

//   // const userId = req.user?.id;
//   // if (!userId) {
//   //   throw new ApiError(401, "Unauthenticated user");
//   // }

//   // Clear tokens from database
//   await User.findByIdAndUpdate(
//     userId,
//     {
//       $unset: {
//         refreshToken: 1, // Remove refresh token
//         accessToken: 1, // Remove access token
//       },
//     },
//     { new: true }
//   );

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         {},
//         "User logged out successfully"
//       )
//     );
// });

const LogoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(401, "Access token missing");
  }

  const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP Address";
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthenticated user");
  }

  // Find the session
  const session = await Session.findOneAndDelete({ accessToken, ipAddress, userAgent });

  if (!session) {
    throw new ApiError(404, "Session not found or already logged out");
  }

  // Remove session ID from user's sessions array
  await User.findByIdAndUpdate(userId, {
    $pull: { sessions: session._id }
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "User logged out from current device successfully")
  );
});

 
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, } = req.body;
  // console.log(req.body);
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  const userId = req.user?._id;
  if (!userId) return new ApiError(404, "unauthenticated user"); 
  console.log(userId);

  const checkuser = await Session.findOne({userId});
  if (!checkuser) {
    throw new ApiError(404, "session logout pleas login again to change password"); 
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }


  console.log(user);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {newPassword}, "Password changed successfully"));
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("Forgot Password Request:", req.body);

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if(!user.isVerified) {
    throw new ApiError(403, "User not verified cannot send OTP");
  }

  const otp = generateOtp(); 
  console.log("Generated OTP:", otp);
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const sendOtpResult = await sendOtpEmail(email, otp);
  console.log(sendOtpEmail);
  

  //  if (!sendOtpResult) {
  //       new ApiError(400, "Unable to send OTP");
  //    }


  // Save OTP and Expiry in user record
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { otp },
        "OTP sent successfully for forgotPasword. Please check your email for OTP verification."
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const {  email ,  newPassword, confirmPassword } = req.body;
  console.log(req.body);

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password do not match");
  }
  const user = await User.findOne( {email} );
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  if (!user.isVerified) {    
    throw new ApiError(
      403,
      "OTP not verified. Please verify OTP before resetting password."
    );
  }else if (user.isVerified) {
    const currentpassword = (user.password = newPassword);
    console.log(currentpassword);
    await user.save({ validateBeforeSave: false });
  }
  res
    .status(200) 
    .json(
      new ApiResponse(
        200,
        {  },
        "Password reset successfully. Please login with your new password."
      )
    );
});

const DeleteUser = asyncHandler(async(req,res)=>{
  const email = req.body 
  console.log(req.body);

  if(!email){
    throw new ApiError(404,"User not found")
  }
  const user = User.deleteOne(email)
  if(!user){
    throw new ApiError(404,"User not found")
  }
  await user.remove()
  res.status(200).json(
    new ApiResponse(200, {}, "User deleted successfully")
  ); 
  
})

const SplashScreen = asyncHandler(async(req ,res)=>{
 try {
  const isLoggedIn  = req.user?._id ? true : false; 
   console.log({isLoggedIn :isLoggedIn});
   if(!isLoggedIn){
     throw new ApiError(404,"User not Login")
   }
   const accessToken = req.headers.authorization?.split(" ")[1];
   console.log({"Access Token": accessToken});
   
    if (!accessToken) {
      throw new ApiError(401, "Access token missing");
    }
    const session  = await Session.findOne({accessToken})
    if (!session) {
      throw new ApiError(404, "Session not found or already logged out");
    }

  //  if(isLoggedIn){
  //   return 
  //  }
   res.status(200).json(
     new ApiResponse(200, {
       accessToken,
      
 
     }, "Welcome to LifeCoachPro!")
   );

 } catch (error) {
   console.error("Error in SplashScreen:", error);
   res.status(500).json(
     new ApiError(500, "Session not found or already logged out", error.message)
   )};


})


export {
  generateAccessAndRefereshTokens,
  LoginUser,
  VerifyOtp,
  LogoutUser,
  changeCurrentPassword,
  homePage,
  RegenrateOtp,
  forgotPassword,
  resetPassword,
  verifyUser, 
  CreateUser,
  DeleteUser,
  SplashScreen 
};
