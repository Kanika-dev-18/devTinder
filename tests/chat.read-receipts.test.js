const assert = require("node:assert/strict");
const { test } = require("node:test");
const cookieParser = require("cookie-parser");
const express = require("express");
const jwt = require("jsonwebtoken");

const { Chat } = require("../src/model/chat");
const User = require("../src/model/user");
const chatRouter = require("../src/routes/chat");
const getChatRoomId = require("../src/utils/chatRoom");

test("chat read marks only unseen incoming messages and notifies the room", async () => {
  const readerId = "64a000000000000000000001";
  const senderId = "64a000000000000000000002";
  const secret = "test-secret";
  const alreadySeenAt = new Date("2026-11-13T10:00:00.000Z");
  const messages = [
    { _id: "message-1", senderId, text: "Unread", seenAt: null },
    { _id: "message-2", senderId: readerId, text: "Sent by reader", seenAt: null },
    { _id: "message-3", senderId, text: "Previously read", seenAt: alreadySeenAt },
  ];
  const chat = {
    messages,
    saveCount: 0,
    async save() {
      this.saveCount += 1;
    },
    async populate(options) {
      assert.deepEqual(options, {
        path: "messages.senderId",
        select: "firstName lastName",
      });
      return this;
    },
  };
  const emitted = [];
  const originalFindById = User.findById;
  const originalFindOne = Chat.findOne;
  const originalJwtSecret = process.env.JWT_SECRET;
  let server;

  process.env.JWT_SECRET = secret;
  User.findById = async (id) => {
    assert.equal(id, readerId);
    return { _id: readerId };
  };
  Chat.findOne = async (filter) => {
    assert.deepEqual(filter, {
      participants: { $all: [readerId, senderId] },
    });
    return chat;
  };

  const app = express();
  app.use(cookieParser());
  app.set("io", {
    to(roomId) {
      assert.equal(roomId, getChatRoomId(readerId, senderId));
      return {
        emit(event, payload) {
          emitted.push({ event, payload });
        },
      };
    },
  });
  app.use(chatRouter);
  server = app.listen(0);

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    const token = jwt.sign({ _id: readerId }, secret);

    for (let request = 0; request < 2; request += 1) {
      const response = await fetch(`http://127.0.0.1:${port}/chat/${senderId}`, {
        headers: { Cookie: `token=${token}` },
      });
      assert.equal(response.status, 200);
      await response.json();
    }

    assert.ok(messages[0].seenAt instanceof Date);
    assert.equal(messages[1].seenAt, null);
    assert.equal(messages[2].seenAt, alreadySeenAt);
    assert.equal(chat.saveCount, 1);
    assert.deepEqual(emitted, [
      {
        event: "messagesSeen",
        payload: {
          messageIds: ["message-1"],
          seenAt: messages[0].seenAt.toISOString(),
          readerId,
        },
      },
    ]);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    User.findById = originalFindById;
    Chat.findOne = originalFindOne;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
});
