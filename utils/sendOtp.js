import nodemailer from "nodemailer";
import { google } from "googleapis";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv";
import { otpTemplate } from "./OtpTemplate.js";
dotenv.config({ path: "./.env" });
// OAuth2 setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// console.log('CLIENT_ID:', CLIENT_ID);
// console.log('CLIENT_SECRET:', CLIENT_SECRET);
// console.log('REDIRECT_URI:', REDIRECT_URI);
// console.log('REFRESH_TOKEN:', REFRESH_TOKEN);  // Don't do this in production!

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, 
  CLIENT_SECRET,
  REDIRECT_URI 
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendOtpEmail = async (email, otp) => {
  try {
    const AccessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rabi81450@gmail.com", // Your Gmail address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: AccessToken.token,
      },
    });

    const mailOptions = {
      from: "rabi81450@gmail.com",
      to: email,
      subject: "Your OTP Code",
      html: otpTemplate(otp),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new ApiError(500, "Failed to send OTP email");
  }
}; 
