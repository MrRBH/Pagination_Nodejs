import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
    unique: false,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  salt: {
    type: String,
  },
  sessions: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Session",
}]
},{ timestamps: true });

// Hash the password before saving the user
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  // Generate salt and hash the password
  this.salt = crypto.randomBytes(16).toString("hex");

  crypto.scrypt(this.password, this.salt, 64, (err, derivedKey) => {
    if (err) return next(new ApiError(400, "Something went wrong", err));

    this.password = derivedKey.toString("hex");
    next();
  });
});

// Method to verify password
UserSchema.methods.isPasswordCorrect = function (candidatePassword) {
  const hashedCandidatePassword = crypto
    .scryptSync(candidatePassword, this.salt, 64)
    .toString("hex");
  return this.password === hashedCandidatePassword;
};

// Generate Access Token
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, fullName: this.fullName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate Refresh Token
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = mongoose.model("User", UserSchema);
export default User;
