import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectToDB } from "./utils/mongodb.js";
import { UserProtect } from "./middlewares/jwt.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/logHandler.js";

import UserAuthRoutes from "./main/user/user_routes.js";

const port = process.env.PORT || 5000;
const app = express();

dotenv.config();
app.use(logger);
const whitelist = ["http://localhost:3000"];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (whitelist.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); //secure:true, will run only on https | comment secure:true to run locally

app.use("/api/v1/auth", UserAuthRoutes);

app.use(UserProtect);

app.use(errorHandler);
try {
  connectToDB();
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
} catch (error) {
  console.log(error);
}
