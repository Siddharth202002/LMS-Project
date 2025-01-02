import express, { urlencoded } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRouter from "./routes/user.router.js";
import courseRouter from "./routes/course.router.js";
import errorMiddleware from "./middleWare/error.middleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use("/ping", (req, res) => {
  res.status(200).send("pong");
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/courses", courseRouter);

app.all("*", (req, res) => {
  res.status(404).send("Page Not found");
});
app.use(errorMiddleware);
export default app;
