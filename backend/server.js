const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const authrouter = require("./routes/authroutes");
const mongoose = require("mongoose");

const User = require("./model/user");
const message = require("./model/message");
const { send } = require("process");

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://chat-app-jiyl.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected"))
  .catch((error) => console.error("mongodb error", error));

app.use("/api/auth", authrouter);

app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});

const server = http.createServer(app);

const PORT = 5000;
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-jiyl.vercel.app",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User registered: ${userId}`);
    io.emit("onlineuser", Array.from(onlineUsers.keys()));
  });

  socket.on("privateMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("privateMessage", { senderId, message });
    }
  });

  socket.on("disconnect", () => {
        for (let [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
