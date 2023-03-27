import mongoose from "mongoose";
import { Message } from "./message_model.js";

const handleMessages = (io, socket) => {
  const userId = mongoose.Types.ObjectId(socket?.userID);
  const getChatListOfUser = async (callback) => {
    try {
      const chatList = await Message.aggregate([
        {
          $match: {
            $or: [
              {
                from: userId,
              },
              { to: userId },
            ],
          },
        },
        { $sort: { createdAt: 1 } },
        {
          $addFields: {
            friend: {
              $cond: [{ $eq: [userId, "$to"] }, "$from", "$to"],
            },
          },
        },
        {
          $group: {
            _id: { friend: "$friend" },
            text: { $first: "$text" },
            from: { $first: "$from" },
            to: { $first: "$to" },
            seen: { $first: "$seen" },
            createdAt: { $first: "$createdAt" },
          },
        },
        {
          $project: {
            friend: "$_id.friend",
            text: 1,
            from: 1,
            to: 1,
            seen: 1,
            createdAt: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "friend",
            foreignField: "_id",
            as: "friend",
          },
        },
        { $unwind: "$friend" },
        {
          $project: {
            friend: "$friend._id",
            text: 1,
            from: 1,
            to: 1,
            seen: 1,
            createdAt: 1,
            name: "$friend.name",
          },
        },
      ]);
      callback(null, { data: chatList });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  const getmessages = async ({ friend }, callback) => {
    try {
      const friendId = friend;
      const chatMessages = await Message.find({
        $or: [
          { from: userId, to: friendId },
          { from: friendId, to: userId },
        ],
      }).sort("-createdAt");
      callback(null, { messages: chatMessages });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  const sendMessage = async ({ friend: to, text }, callback) => {
    try {
      const saveMessage = await Message.create({
        from: userId,
        to,
        text,
      });

      // Send the message to the receiver and success to sender
      callback(null, { data: saveMessage });
      io.to(to).emit("receive_message", saveMessage);
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  socket.on("get_chat_list", getChatListOfUser);
  socket.on("get_messages", getmessages);
  socket.on("send_message", sendMessage);
};

export default handleMessages;
