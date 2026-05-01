import userModel from "../model/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    // logged-in user ka id
    const loggedInUserId = req.user._id;

    // sab users fetch karo except current user
    const users = await userModel.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
