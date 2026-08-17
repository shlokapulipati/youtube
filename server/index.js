import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import paymentroutes from "./routes/payment.js";
import subscriberoutes from "./routes/subscribe.js";


dotenv.config();
const app = express();
import path from "path";
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("webrtc-offer", (data) => {
      io.to(data.to).emit("webrtc-offer", { offer: data.offer, from: socket.id });
    });

    socket.on("webrtc-answer", (data) => {
      io.to(data.to).emit("webrtc-answer", { answer: data.answer, from: socket.id });
    });

    socket.on("new-ice-candidate", (data) => {
      io.to(data.to).emit("new-ice-candidate", { candidate: data.candidate, from: socket.id });
    });

    socket.on("chat-message", (msg) => {
      socket.to(roomId).emit("chat-message", { message: msg, from: socket.id });
    });

    socket.on("video-sync", (state) => {
      socket.to(roomId).emit("video-sync", state);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});



app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadroutes);
app.use("/api/payment", paymentroutes);
app.use("/subscribe", subscriberoutes);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;

mongoose
  .connect(DBURL, {
    serverSelectionTimeoutMS: 2000, // Reduced from 5000 to fail faster
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message); // Cleaned up massive error log
  });

// Disable buffering globally so it doesn't hang for 10s on every request
mongoose.set('bufferCommands', false);

