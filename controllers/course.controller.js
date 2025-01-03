import Course from "../models/courseModel.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";

import fs from "fs/promises";
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "Successfully get the list of all courses",
      courses,
    });
  } catch (error) {
    return next(new AppError("Cannot get the list of all courses", 500));
  }
};
const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Invalid course id", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course lecture get successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;
    if (!title || !description || !category || !createdBy) {
      return next(new AppError("All fields are required", 400));
    }
    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    });
    if (!course) {
      return next(new AppError("Course not created", 500));
    }
    console.log(req.file);
    req.file;

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }
    }

    // fs.rm(`uploads/${req.file.filename}`);
    await course.save();
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );
    if (!course) {
      return next(new AppError("Invalid course id ", 400));
    }

    res.status(200).json({
      success: true,
      message: "Course update successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Invalid User Id", 400));
    }
    await Course.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Course delete successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const addLectureToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return next(new AppError("All fields are required", 400));
    }
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Invalild Course Id", 400));
    }

    const lectureData = {
      title,
      description,
      lecture: {
        public_id: "hey",
        secure_url: "hey",
      },
    };

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
      }
    }

    fs.rm(`uploads/${req.file.filename}`);
    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "Lecture successfully added to the course",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  addLectureToCourseById,
};
