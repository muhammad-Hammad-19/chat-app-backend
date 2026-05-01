import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export const messageModel = mongoose.model("messages", messageSchema);
