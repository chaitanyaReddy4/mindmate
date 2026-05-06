const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const refreshTokenSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ip: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    googleId: {
      type: String,
      default: null
    },
    refreshTokens: [refreshTokenSchema]
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    googleId: this.googleId,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("User", userSchema);
