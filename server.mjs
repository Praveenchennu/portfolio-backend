import express from "express";
import cors from "cors";
import Brevo from "@getbrevo/brevo";

console.log("Server starting...");

const app = express();
app.use(express.json());
app.use(cors());

// Brevo API setup
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// TRACK VISITOR API
app.post("/track-visitor", async (req, res) => {
  try {
    const browser = req.body.browser || "Unknown browser";
    const time = new Date().toLocaleString();

    await apiInstance.sendTransacEmail({
      sender: { email: process.env.SMTP_FROM },
      to: [{ email: process.env.EMAIL_TO }],
      subject: "New Portfolio Visitor",
      textContent: `Browser: ${browser}\nTime: ${time}`
    });

    console.log("Email sent via Brevo API!");
    res.json({ success: true });

  } catch (error) {
    console.error("Brevo API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// START SERVER
app.listen(5000, () => console.log("Backend running on port 5000"));
