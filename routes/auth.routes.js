import express from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

router.get("/getuser", protect, (req, res) => {
  console.log(req.user);
  res.json(req.user); // or res.send(req.user);
});

export default router;
