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
const server = createServer(app);

// Allowed Origins
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://chat-app-frontend-with-socket-2sq1uqdnq.vercel.app", // Production frontend
];

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Express Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messagesRoutes);

// Connect Database
connectDB();

// Socket Users
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    io.emit("register", users);
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
    const { to, message } = data;

    const targetSocketId = users[to];

    if (targetSocketId) {
      io.to(targetSocketId).emit("chat-message", data);
    }

    socket.emit("chat-message", data);

    if (message?.trim()) {
      try {
        const aiResponse = await getSmartReplies(message);

        if (targetSocketId) {
          io.to(targetSocketId).emit("ai-suggestions", aiResponse);
        }
      } catch (error) {
        console.error("AI Error:", error);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }

    io.emit("register", users);
  });
});

// Local Development
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;