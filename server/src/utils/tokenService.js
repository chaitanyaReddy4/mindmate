const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_TTL } = require("../config/constants");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user, secret) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    },
    secret,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = (user, secret, sessionId) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      sessionId
    },
    secret,
    { expiresIn: "7d" }
  );

const verifyAccessToken = (token, secret) => jwt.verify(token, secret);
const verifyRefreshToken = (token, secret) => jwt.verify(token, secret);

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
