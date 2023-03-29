import mongoose from "mongoose";
import { User } from "./user_model.js";
import { Conversation } from "../conversation/conversation_model.js";

const userHandler = (io, socket) => {
  const userId = mongoose.Types.ObjectId(socket?.userID);
  const searchUser = async ({ username }, callback) => {
    try {
      const alreadyFriends = await Conversation.aggregate([
        { $match: { participants: userId } },
        { $project: { participants: 1 } },
        { $unwind: "$participants" },
        { $match: { participants: { $ne: userId } } },
        { $project: { participant: "$participants" } },
        {
          $addFields: {
            new_id: 1,
          },
        },
        {
          $group: {
            _id: "$new_id",
            participants: { $push: "$participant" },
          },
        },
      ]);
      let friendsArray = [];
      if (alreadyFriends?.length > 0) {
        friendsArray = alreadyFriends[0]?.participants || [];
      }

      const users = await User.find({
        username: { $regex: new RegExp(username), $options: "i" },
        _id: { $nin: [userId, ...friendsArray] },
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
