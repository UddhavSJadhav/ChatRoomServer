import jwt from "jsonwebtoken";

import { User } from "../main/user/user_model.js";

export const UserProtect = async (req, res, next) => {
  try {
    const auth_header = req.headers["authorization"];
    if (!auth_header) return res.sendStatus(401);
    let token = auth_header.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = await User.findOne({ _id: payload._id }).exec();
        next();
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const returnUserID = async (token) => {
  try {
    if (!token) return null;
    const accessToken = token.split(" ")[1];
    if (!accessToken) return null;

    return new Promise((resolve, reject) => {
      jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(null);
          resolve(payload?._id);
        }
      );
    });
  } catch (error) {
    return null;
  }
};
