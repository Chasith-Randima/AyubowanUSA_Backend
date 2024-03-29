const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provoide a valid email"],
    },
    photo: {
      type: Buffer,
    },
    role: {
      type: String,
      enum: ["User", "Editor", "Admin"],
      default: "User",
    },
    password: {
      type: String,
      required: [true, "Please choose a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      active: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// userSchema.pre('save',function(next){
//     if(!this.isModified('password') || this.isNew) return next();
// })

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfer = function (JWTTimeStamp) {
  if (this.passwordChangedAt != null) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000.1
    );
    return JWTTimeStamp < changedTimeStamp;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
