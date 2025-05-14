
// import express from 'express';
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app, } from "./app.js";

dotenv.config({ path: "./.env" });

// const app = express();
const port = process.env.PORT || 8200;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`⚙️ Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed: ", err);
  });
