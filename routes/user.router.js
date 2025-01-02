import { Router } from "express";
import {
  login,
  logout,
  register,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
} from "../controllers/user.controller.js";
import { isloogedIn } from "../middleWare/auth.middleware.js";
import upload from "../middleWare/multer.middleware.js";
const userRouter = Router();
userRouter.post("/register", upload.single("avatar"), register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/me", isloogedIn, getProfile);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:resetToken", resetPassword);
userRouter.post("/change-passowrd", isloogedIn, changePassword);
userRouter.put(
  "/update",
  isloogedIn,
  upload.single("avatar"),
  updateUser
);

export default userRouter;
