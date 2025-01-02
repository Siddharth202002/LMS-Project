import nodemailer from "nodemailer";
import "dotenv/config";

const sendEmail = async function (email, subject, message) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"siddharth" <siddharth12@gmial.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line

    html: message, // html body
  });
};

export default sendEmail;
