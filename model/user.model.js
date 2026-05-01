import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    profilePic: String,
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("userschemas", userSchema);
