import JWT from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isloogedIn = async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token);
  
  if (!token) {
    return next(new AppError("Unauthenticated,please login again", 400));
  }
  const userDetails = await JWT.verify(token, process.env.SECRET_KEY);
  req.user = userDetails;
  next();
};

const autorizeRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRole = req.user.role;
    if (!roles.includes(currentUserRole)) {
      return next(
        new AppError(" You dont have permission to access the route", 403)
      );
    }
    next();
  };
export { isloogedIn ,autorizeRoles};
