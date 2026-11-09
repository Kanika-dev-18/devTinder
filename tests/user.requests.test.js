const assert = require("node:assert/strict");
const { test } = require("node:test");
const cookieParser = require("cookie-parser");
const express = require("express");
const jwt = require("jsonwebtoken");

const userRouter = require("../src/routes/user");
const ConnectionRequest = require("../src/model/connectionRequest");
const User = require("../src/model/user");

test("received requests populate only the safe sender profile fields", async () => {
  const loggedInUserId = "64a000000000000000000001";
  const senderId = "64a000000000000000000002";
  const requestId = "64a000000000000000000003";
  const secret = "test-secret";
  const senderFields = {
    firstName: "Alex",
    lastName: "Smith",
    photoUrl: "https://example.com/photo.jpg",
    age: 28,
    gender: "other",
    about: "Enjoys building software",
  };
  const senderDocument = {
    _id: senderId,
    ...senderFields,
    emailId: "alex@example.com",
    password: "hashed-password",
    isPremium: true,
    skills: ["JavaScript"],
  };
  const originalFindById = User.findById;
  const originalFind = ConnectionRequest.find;
  const originalJwtSecret = process.env.JWT_SECRET;
  let server;

  process.env.JWT_SECRET = secret;
  User.findById = async (id) => {
    assert.equal(id, loggedInUserId);
    return { _id: loggedInUserId };
  };
  ConnectionRequest.find = (filter) => {
    assert.deepEqual(filter, {
      toUserId: loggedInUserId,
      status: "interested",
    });

    return {
      populate(path, projection) {
        assert.equal(path, "fromUserId");
        assert.equal(
          projection,
          "firstName lastName photoUrl age gender about"
        );

        const selectedSender = Object.fromEntries(
          ["_id", ...projection.split(" ")].map((field) => [
            field,
            senderDocument[field],
          ])
        );

        return Promise.resolve([
          {
            _id: requestId,
            status: "interested",
            fromUserId: selectedSender,
          },
        ]);
      },
    };
  };

  const app = express();
  app.use(cookieParser());
  app.use(userRouter);
  server = app.listen(0);

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    const token = jwt.sign({ _id: loggedInUserId }, secret);
    const response = await fetch(
      `http://127.0.0.1:${port}/user/requests/received`,
      { headers: { Cookie: `token=${token}` } }
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      message: "Data fetched successfully",
      data: [
        {
          _id: requestId,
          status: "interested",
          fromUserId: { _id: senderId, ...senderFields },
        },
      ],
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    User.findById = originalFindById;
    ConnectionRequest.find = originalFind;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
});

test("connection request user fields reference the User model", () => {
  assert.equal(ConnectionRequest.schema.path("fromUserId").options.ref, "User");
});
