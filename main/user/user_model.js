import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "", select: false },
  },
  { timestamps: true, versionKey: false }
);

export const User = model("User", UserSchema);
