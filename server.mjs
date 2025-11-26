import express from "express";
import cors from "cors";
import Brevo from "@getbrevo/brevo";
import axios from "axios";

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

app.post("/track-visitor", async (req, res) => {
  try {
    const browser = req.body.browser || "Unknown browser";
    const time = new Date().toLocaleString();

    // ⭐ BEST IP DETECTION FOR RENDER, VERCEL, NETLIFY, NGINX
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      "UNKNOWN";

    console.log("Detected Visitor IP:", userIp);

    // ⭐ Get Location Info from IPINFO
    let info = {};
    try {
      const ipInfoResponse = await axios.get(
        `https://ipinfo.io/${userIp}?token=6df68ee082e69e`
      );
      info = ipInfoResponse.data;
    } catch (err) {
      console.log("IPINFO error:", err.message);
      info = { error: "Could not fetch location" };
    }

    const locationText = `
IP: ${info.ip || "N/A"}
City: ${info.city || "N/A"}
Region: ${info.region || "N/A"}
Country: ${info.country || "N/A"}
Coordinates: ${info.loc || "N/A"}
Org/ISP: ${info.org || "N/A"}
Timezone: ${info.timezone || "N/A"}
    `;

    // ⭐ Send Email using Brevo API
    await apiInstance.sendTransacEmail({
      sender: { email: process.env.SMTP_FROM },
      to: [{ email: process.env.EMAIL_TO }],
      subject: "New Portfolio Visitor",
      textContent: `
Time: ${time}
Browser: ${browser}

===== LOCATION DETAILS =====
${locationText}
      `,
    });

    console.log("Email sent WITH LOCATION!");
    res.json({ success: true });

  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// START SERVER
app.listen(5000, () => console.log("Backend running on port 5000"));
