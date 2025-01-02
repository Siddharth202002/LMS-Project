import { Router } from "express";
import { isloogedIn } from "../middleWare/auth.middleware.js";
import upload from "../middleWare/multer.middleware.js";
import {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  deleteCourse,
  updateCourse,
} from "../controllers/course.controller.js";
const courseRouter = Router();

courseRouter
  .route("/")
  .get(isloogedIn, getAllCourses)
  .post(isloogedIn, upload.single("thumbnail"), createCourse);

courseRouter
  .route("/:id")
  .get(isloogedIn, getLecturesByCourseId)
  .put(isloogedIn, updateCourse)
  .delete(isloogedIn, deleteCourse);

export default courseRouter;
