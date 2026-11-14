const crypto = require("crypto");

const getChatRoomId = (userId, targetUserId) =>
  crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");

module.exports = getChatRoomId;
