import mongoose from "mongoose";
import { Message } from "./message_model.js";
import { Conversation } from "../conversation/conversation_model.js";

const handleMessages = (io, socket) => {
  const userId = mongoose.Types.ObjectId(socket?.userID);

  const getMessages = async ({ conversation }, callback) => {
    try {
      socket.join(conversation);
      await Message.updateMany(
        { conversation, from: { $ne: userId } },
        { seen: true }
      ).exec();
      const data = await Message.find({ conversation }).exec();
      callback(null, { data });
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  const sendMessage = async ({ conversation, text }, callback) => {
    try {
      const saveMessage = await Message.create({
        from: userId,
        text,
        conversation,
      });

      //Find participants in conversation
      const { participants } = await Conversation.findOne({
        _id: conversation,
      }).exec();
      participants
        ?.filter((e) => e !== userId)
        ?.forEach((participant) =>
          io.to(participant?.toString()).emit("sidebar_message", saveMessage)
        );

      // Send the message to the receiver and success to sender
      io.to(conversation).emit("receive_message", saveMessage);
    } catch (error) {
      console.log(error);
      callback({ message: "Something went wrong!" });
    }
  };

  socket.on("conversation:getmessages", getMessages);
  socket.on("send_message", sendMessage);
};

export default handleMessages;
