const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../model/chat");
const getChatRoomId = require("../utils/chatRoom");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    const unseenMessages = chat.messages.filter((message) => {
      const senderId = message.senderId?._id ?? message.senderId;
      return !message.seenAt && senderId.toString() !== userId.toString();
    });
    const seenAt = new Date();

    if (unseenMessages.length > 0) {
      unseenMessages.forEach((message) => {
        message.seenAt = seenAt;
      });
      await chat.save();
    }

    await chat.populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (unseenMessages.length > 0) {
      req.app
        .get("io")
        .to(getChatRoomId(userId, targetUserId))
        .emit("messagesSeen", {
          messageIds: unseenMessages.map((message) => message._id.toString()),
          seenAt: seenAt.toISOString(),
          readerId: userId.toString(),
        });
    } else {
      await chat.populate({
        path: "messages.senderId",
        select: "firstName lastName",
      });
    }

    res.json(chat);
  } catch (err) {
    console.error("Failed to load chat:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
});

module.exports = chatRouter;