import mongoose from "mongoose";
import "dotenv/config";
mongoose.set("strictQuery", false);
const connection = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected succesfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default connection;
