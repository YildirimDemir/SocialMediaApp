const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send_message", (chatId, message) => {
    console.log("Message received:", message);

    io.to(chatId).emit("receive_message", message);
  });

  socket.on("delete_message", (chatId, messageId) => {
    console.log(`Message ${messageId} deleted in chat ${chatId}`);
  
    io.to(chatId).emit("message_deleted", messageId);
  });
  
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
  });
});

server.listen(8000, () => {
  console.log("Socket server is running on http://localhost:8000");
});
