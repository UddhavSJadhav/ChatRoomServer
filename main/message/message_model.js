import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    text: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Message = model("Message", MessageSchema);
