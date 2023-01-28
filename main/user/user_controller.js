import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

import { User } from "./user_model.js";

export const SignUp = async (req, res) => {
  try {
    if (!req.body?.email)
      return res.status(400).json({ message: "Email is required!" });
    if (!req.body?.password)
      return res.status(400).json({ message: "Password is required!" });
    if (!req.body?.confirm_password)
      return res.status(400).json({ message: "Confirm password is required!" });
    if (req.body.password !== req.body.confirm_password)
      return res
        .status(400)
        .json({ message: "Password and confirm password does not match!" });

    const findIfAlreadyAdded = await User.findOne({
      email: req.body.email,
    }).exec();
    if (findIfAlreadyAdded)
      return res
        .status(409)
        .json({ message: "User with provided email already exists!" });

    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.username =
      req.body.email.split(".")[0] + randomBytes(4).toString("hex");

    await User.create(req.body);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};

export const SignIn = async (req, res) => {
  try {
    if (!req.body?.email)
      return res.status(400).json({ message: "Email is required!" });
    if (!req.body?.password)
      return res.status(400).json({ message: "Password is required!" });

    const findUser = await User.findOne({ email: req.body.email })
      .select("password")
      .exec();
    if (!findUser) return res.status(401).json({ message: "User not found!" });

    if (!(await bcrypt.compare(req.body.password, findUser.password)))
      return res.status(401).json({ message: "Incorrect password!" });

    const refreshToken = jwt.sign(
      { _id: findUser._id },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const accessToken = jwt.sign(
      { _id: findUser._id },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    findUser.refresh_token = refreshToken;
    await findUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};

export const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const findUser = await User.findOne({ refresh_token: refreshToken }).exec();
    if (!findUser) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || findUser._id !== decoded?._id) return res.sendStatus(403);
        const accessToken = jwt.sign(
          { _id: findUser._id },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15m",
          }
        );
        findUser.refresh_token = refreshToken;
        await findUser.save();
        res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};

export const signOut = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const findUser = await User.findOne({ refresh_token: refreshToken }).exec();
    if (!findUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }
    findUser.refresh_token = "";
    await findUser.save();
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};
