import AppError from "../utils/error.util.js";
import User from "../models/userModel.js";
import fs from "fs/promises";
import coludinary from "cloudinary";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
};
const register = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already exists", 400));
  }

  const user = await User.create({
    fullname,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: "he",
    },
  });
  if (!user) {
    return next(new AppError("User registraiton faied ,please try again"));
  }
  console.log(`file is ${req.file}`);

  // file upload
  if (req.file) {
    try {
      const result = await coludinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
      }
      // remove file after upload
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(new AppError("File not uploaded"));
    }
  }

  await user.save();
  user.password = undefined;

  const token = await user.generateJWToken();
  res.cookie("token", token, cookieOptions);
  return res.status(200).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("User not found!"));
    }
    const token = await user.generateJWToken();
    res.cookie("token", token, cookieOptions);
    user.password = undefined;
    res.status(200).json({
      success: true,
      message: "User loogedIn successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logout successfully",
  });
};
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    return res.status(200).json({
      success: true,
      message: "User Details",
      user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch user profile", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email is not registered", 400));
  }
  const resetToken = await user.generatePasswordResetToken();

  await user.save();
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = `Reset password`;
  const message = `You can reset your password by clicking this <a href=${resetPasswordUrl} target="_blank"> URl </a>`;

  console.log(resetPasswordUrl);

  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset Password token has been sent to ${email} successfully `,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(error.message, 500));
  }
};
const resetPassword = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return next(new AppError("New password is required", 400));
  }
  const { resetToken } = req.params;
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError("Token is invalid,please try again after some time", 400)
    );
  }
  user.password = password;
  await user.save();
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new AppError(" All fields are required", 400));
  }
  const { id } = req.user;

  const user = await User.findById(id).select("+password");
  if (!user) {
    return next(new AppError("User do not exist", 400));
  }
  const isPassword = await user.comparePassword(oldPassword);
  if (!isPassword) {
    return next(new AppError("Invalid old password", 400));
  }
  user.password = newPassword;
  await user.save();
  user.password = undefined;
  return res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
};

const updateUser = async (req, res, next) => {
  const { fullname } = req.body;
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not exist", 400));
  }
  if (req.body.fullname) {
    user.fullname = fullname;
  }

  if (req.file) {
    await coludinary.v2.uploader.destroy(user.avatar.public_id);
    try {
      const result = await coludinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
      }
      // remove file after upload
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      return next(new AppError("File not uploaded"));
    }
  }

  await user.save();
  user.password = undefined;

  const token = await user.generateJWToken();
  res.cookie("token", token, cookieOptions);

  await user.save();
  return res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
};
export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
