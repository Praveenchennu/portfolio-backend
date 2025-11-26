import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

console.log("Server starting...");

const app = express();
app.use(express.json());
app.use(cors());

// BREVO SMTP EMAIL CONFIG
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log("Brevo transporter created.");

// VERIFY SMTP
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

// TRACK VISITOR API
app.post("/track-visitor", async (req, res) => {
  try {
    const browser = req.body.browser || "Unknown browser";
    const time = new Date().toLocaleString();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Portfolio Visitor`,
      text: `Browser: ${browser}\nTime: ${time}`,
    });

    console.log("Email sent!");
    res.json({ success: true });

  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: "Email sending failed" });
  }
});

// START SERVER
app.listen(5000, () => console.log("Backend running on port 5000"));
