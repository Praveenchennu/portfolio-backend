import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import axios from "axios";

console.log("Server starting...");

const app = express();
app.use(express.json());
app.use(cors());

// ------------ BREVO SMTP EMAIL CONFIG --------------
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "9c2d43001@smtp-brevo.com",
    pass: "Bq21NRlcrMgJhk48",
  },
  tls: {
    rejectUnauthorized: false
  }
});


console.log("Brevo transporter created.");

// VERIFY SMTP (VERY IMPORTANT)
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

// ------------ TRACK VISITOR API ---------------------
app.post("/track-visitor", async (req, res) => {
  console.log("Track visitor hit.");

  const response = await axios.get("https://ipinfo.io/json?token=6df68ee082e69e");
  const info = response.data;

  console.log("IPInfo data:", info);

  const browser = req.body.browser || "Unknown browser";
  const time = new Date().toLocaleString();

  console.log("Sending email...");

  await transporter.sendMail({
    from: "portfolio@brevo.com",
    to: "praveenchennu547@gmail.com",
    subject: `New Portfolio Visitor - ${info.ip}`,
    text: `Visitor details:\n${JSON.stringify(info, null, 2)}\nBrowser:${browser}\nTime:${time}`,
  });

  console.log("Email sent!");

  res.json({ success: true });
});

// ------------------ START SERVER ---------------------
app.listen(5000, () => console.log("Backend running on port 5000"));
