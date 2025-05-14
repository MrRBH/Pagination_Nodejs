import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/user.routes.js";
import blogRouter from "./Routes/blog.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { changeCurrentPassword, forgotPassword, LoginUser, RegenrateOtp, VerifyOtp } from "./Controller/user.controller.js";
import { verifyJWT } from "./Middlewares/auth.middleware.js";
import { blogList } from "./Controller/Blog.controller.js";



// Initialize app and server
const app = express();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing requests
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));


// Register routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/createBlog", blogRouter);


// EJS Pages
app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/verify-otp", (req, res) => res.render("verifyOtp"));
app.get("/login", (req, res) => res.render("login"));
app.get("/change-password", (req, res) => res.render("changePassword"));
app.get("/regenerate-otp", (req, res) => res.render("regenerateOtp"));
app.get("/blog", (req, res) => res.render("blog"));

// // APIs
// app.post("/register", RegisterUser);
// app.post("/verify-otp", VerifyOtp);
// app.post("/login", LoginUser);
// app.post("/change-password", changeCurrentPassword);
// app.post("/forgot-password", forgotPassword);
// app.post("/regenerate-otp", RegenrateOtp);
// app.get("/blogs", blogList); 


 

 
// Error handling for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Export app, server, and io
export { app };
 