import mongoose from "mongoose";
import { Conversation } from "./conversation_model.js";
import { User } from "../user/user_model.js";

const conversationHandler = (io, socket) => {
  const userId = mongoose.Types.ObjectId(socket?.userID);

  const createConversation = async ({ friend }, callback) => {
    try {
      if (
        await Conversation.findOne({
          participants: { $all: [userId, friend] },
        }).exec()
      )
        return;
      const newConvo = await Conversation.create({
        participants: [userId, friend],
      });
      const FRD = await User.findById(friend);
      socket.to(friend).emit("conversation:new_chat", newConvo);
      callback(null, { data: { ...newConvo, friend: { name: FRD?.name } } });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  const getConversations = async (callback) => {
    try {
      const data = await Conversation.aggregate([
        {
          $match: { participants: userId },
        },
        { $unwind: "$participants" },
        {
          $match: { participants: { $ne: userId } },
        },
        {
          $project: {
            friend: "$participants",
            _id: "$_id",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "friend",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  _id: 1,
                },
              },
            ],
            as: "friend",
          },
        },
        { $unwind: "$friend" },
        {
          $lookup: {
            from: "messages",
            let: { convoID: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$conversation", "$$convoID"] },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  text: 1,
                  from: 1,
                  seen: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "messages",
          },
        },
        {
          $addFields: {
            message: {
              $arrayElemAt: ["$messages", -1],
            },
          },
        },
        {
          $project: {
            messages: 0,
          },
        },
        { $sort: { "message.createdAt": -1 } },
      ]);
      callback(null, { data });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  socket.on("conversation:create", createConversation);
  socket.on("user:conversations", getConversations);
};

export default conversationHandler;
