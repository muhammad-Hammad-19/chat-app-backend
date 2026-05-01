import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messagesRoutes from "./routes/message.routes.js";
import cookieParser from "cookie-parser";
import { getSmartReplies } from "./controllers/ai.controllers.js";

dotenv.config();

const app = express();
const server = createServer(app); // HTTP server

const io = new Server(server, {
  cors: {
    origin: process?.env?.CLIENT_URL,
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process?.env?.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Test Route

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messagesRoutes);

// DB Connect

// Socket Connection
const users = {}; // { userId: socket.id }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Step 1: Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;

    io.emit("register", users); // send to everyone
  });

  socket.on("typing", (data) => {
    const targetSocketId = users[data.to];

    if (targetSocketId) {
      socket.to(targetSocketId).emit("typing", data);
    }
  });

  socket.on("stopTyping", (data) => {
    const targetSocketId = users[data.to];

    if (targetSocketId) {
      socket.to(targetSocketId).emit("stopTyping", data);
    }
  });

  socket.on("chat-message", async (data) => {
    const { from, to, message } = data;

    const targetSocketId = users[to];

    // send to receiver
    if (targetSocketId) {
      io.to(targetSocketId).emit("chat-message", data);
    }

    socket.emit("chat-message", data);

    if (message && message.trim().length > 0) {
      try {
        const aiResponse = await getSmartReplies(message);

        if (targetSocketId) {
          io.to(targetSocketId).emit("ai-suggestions", aiResponse);
        }
      } catch (error) {
        console.error("AI error:", error);
      }
    }
  });

  // ✅ Step 3: Remove user on disconnect
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);

    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

connectDB();

// Port
const PORT = process.env.PORT || 5000;

// ✅ IMPORTANT: server.listen use karo
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
