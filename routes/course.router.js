import { Router } from "express";
import { isloogedIn, autorizeRoles } from "../middleWare/auth.middleware.js";
import upload from "../middleWare/multer.middleware.js";
import {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  deleteCourse,
  updateCourse,
  addLectureToCourseById,
} from "../controllers/course.controller.js";
const courseRouter = Router();

courseRouter
  .route("/")
  .get(isloogedIn, getAllCourses)
  .post(isloogedIn, autorizeRoles("ADMIN"), upload.single("thumbnail"), createCourse);

courseRouter
  .route("/:id")
  .get(isloogedIn, getLecturesByCourseId)
  .put(isloogedIn, autorizeRoles("ADMIN"), updateCourse)
  .delete(isloogedIn, autorizeRoles("ADMIN"), deleteCourse)
  .post(
    isloogedIn,
    autorizeRoles("ADMIN"),
    upload.single("lecture"),
    addLectureToCourseById
  );

export default courseRouter;
