import jwt from "jsonwebtoken";

import { User } from "../main/user/user_model.js";

export const RefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const findUser = await User.findOne({ refresh_token: refreshToken });
    if (!findUser) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err || payload._id.toString() !== findUser._id.toString())
          return res.sendStatus(403);
        const accessToken = jwt.sign(
          { _id: findUser._id },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15m",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
