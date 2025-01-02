import JWT from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isloogedIn = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new AppError("Unauthenticated,please login again", 400));
  }
  const userDetails = await JWT.verify(token,process.env.SECRET_KEY);
  req.user = userDetails;
  next();
};
export { isloogedIn };
