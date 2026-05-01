import { messageModel } from "../model/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;

    // validation
    if (!from?.trim() || !to?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // save to MongoDB
    const newMessage = await messageModel.create({
      from,
      to,
      message,
    });

    res.status(201).json({
      message: "Message saved successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Messages (chat between two users)
export const getMessages = async (req, res) => {
  const { from, to } = req.params;
  try {
    if (!from?.trim() || !to?.trim()) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const messages = await messageModel
      .find({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      })
      .sort({ createdAt: 1 });
    res.status(201).json({
      message: "Message Fetch successfully",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;

    if (!id) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const message = await messageModel.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Check ownership
    if (message.from.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this message",
      });
    }

    const deletedMessage = await messageModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Message deleted successfully",
      deletedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
