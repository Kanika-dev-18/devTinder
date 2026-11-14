const socket = require("socket.io");
const { Chat } = require("../model/chat");
const ConnectionRequest = require("../model/connectionRequest");
const getChatRoomId = require("./chatRoom");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getChatRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Save messages to the database
        try {
        const roomId = getChatRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          // TODO: Check if userId & targetUserId are friends

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          const savedMessage = chat.messages[chat.messages.length - 1];
          io.to(roomId).emit("messageReceived", {
            _id: savedMessage._id.toString(),
            senderId: userId,
            firstName,
            lastName,
            text,
            createdAt: savedMessage.createdAt.toISOString(),
            seenAt: savedMessage.seenAt,
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });

  return io;
};

module.exports = initializeSocket;