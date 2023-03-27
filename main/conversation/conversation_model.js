import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    type: { type: String, enum: ["private", "group"], default: "private" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Conversation = model("Conversation", ConversationSchema);
