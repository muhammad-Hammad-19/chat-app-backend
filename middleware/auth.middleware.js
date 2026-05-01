import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await userModel.findById(decoded.id).select("-password");

    req.user = user;
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", me: err.message });
  }
};
