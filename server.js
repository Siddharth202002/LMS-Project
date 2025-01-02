import app from "./app.js";

import cloudinary from "cloudinary";
import connection from "./config/config.js";
const PORT = process.env.PORT;

cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

app.listen(PORT, async () => {
  await connection();
  console.log(`server is running at port no ${PORT}`);
});
