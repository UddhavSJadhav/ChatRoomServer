import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectToDB } from "./utils/mongodb.js";
import { UserProtect } from "./middlewares/jwt.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/logHandler.js";
import { returnUserID } from "./middlewares/jwt.js";

import userHandler from "./main/user/userHandler.js";
import conversationHandler from "./main/conversation/conversationHandler.js";
import messageHandler from "./main/message/messageHandler.js";

import UserAuthRoutes from "./main/user/user_routes.js";
import ChatRoutes from "./main/message/message_routes.js";

const port = process.env.PORT || 5000;
const app = express();

dotenv.config();
app.use(logger);
const whitelist = ["http://localhost:3000"];
// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (whitelist.includes(origin)) {
//     res.header("Access-Control-Allow-Credentials", true);
//   }
//   next();
// });
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
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); //secure:true, will run only on https | comment secure:true to run locally

app.use("/api/v1/auth", UserAuthRoutes);

app.use(UserProtect);

app.use("/api/v1/chat", ChatRoutes);

app.use(errorHandler);
const httpServer = createServer(app);
try {
  connectToDB();
  httpServer.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
} catch (error) {
  console.log(error);
}

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const onConnection = (socket) => {
  console.log(`User connected ${socket.id}`);

  userHandler(io, socket);
  conversationHandler(io, socket);
  messageHandler(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
  });
};

//socket middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    socket.userID = await returnUserID(token);
  }
  next();
});

io.on("connection", onConnection);
