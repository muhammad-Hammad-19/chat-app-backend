import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import {
  deleteMessages,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", protect, sendMessage);

router.get("/:from/:to", protect, getMessages);

router.delete("/:id", protect, deleteMessages);

export default router;
