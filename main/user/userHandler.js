import mongoose from "mongoose";
import { User } from "./user_model.js";

const userHandler = (io, socket) => {
  const userId = mongoose.Types.ObjectId(socket?.userID);
  const searchUser = async ({ username }, callback) => {
    try {
      const users = await User.find({
        username: { $regex: new RegExp(username), $options: "i" },
        _id: { $ne: userId },
      })
        .sort("-updatedAt")
        .limit(10)
        .exec();
      callback(null, { data: users });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  socket.on("user:search", searchUser);
};

export default userHandler;
