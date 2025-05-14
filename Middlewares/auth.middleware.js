
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import  User  from "../Model/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Support both header-based and cookie-based token delivery
    const authHeader = req.header("Authorization");
    console.log({"Authorization Header" : authHeader});
    
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    console.log({"Token from Header" :  tokenFromHeader});
    

    const token = tokenFromHeader || req.cookies?.jwt;
    console.log({"Token from Cookies" : token});
    

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decoded);
    if (!decoded) {
      throw new ApiError(401, "Unauthorized: Invalid token");
    }
    console.log({"Decoded Token" : decoded});
    

    const user = await User.findById(decoded?.id).select("-password ");

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);

    const isTokenExpired = error.name === "TokenExpiredError";

    throw new ApiError(
      401,
      isTokenExpired ? "Session expired, please log in again." : "Unauthorized: Invalid token",
      error?.message
    );
  }
});
