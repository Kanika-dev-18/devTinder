const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
const REQUEST_SENDER_SAFE_DATA = "firstName lastName photoUrl age gender about";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", REQUEST_SENDER_SAFE_DATA);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

//Fetches the list of all users with whom the logged-in user has an accepted connection.
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    console.log(connectionRequests);

/*
When the logged-in user asks for "my connections", your app searches for all accepted requests where they are involved—either as the sender (fromUserId) or as the receiver (toUserId).
Because of this, the resulting array of connectionRequests contains a mix:
In some documents, the logged-in user is the sender (fromUserId), meaning their friend is the receiver (toUserId).
In other documents, the logged-in user is the receiver (toUserId), meaning their friend is the sender (fromUserId).
The .map() function cleans this up so you only return the other person's profile, regardless of who originally sent the request.

row.fromUserId._id === loggedInUser._id), it will compare their memory references and return false, even if the string values are identical. Converting them to strings ensures a safe, accurate comparison.
*/
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

//Serves user cards for discovery while hiding users the logged-in user has already interacted with or sent requests to.
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

/*{ _id: { $nin: Array.from(hideUsersFromFeed) } } 
tells MongoDB: "Give me users whose ID is NOT inside the list of users we want to hide."

{ _id: { $ne: loggedInUser._id } } ensures that the logged-in user never accidentally
  sees their own profile card in their own discovery feed.
*/
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;