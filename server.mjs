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

    // Get visitor IP (supports Render proxies)
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      "UNKNOWN";

    // Fetch Location using IPINFO
    const ipinfo = await axios.get(
      `https://ipinfo.io/${userIp}?token=6df68ee082e69e`
    );

    const info = ipinfo.data;

    const locationText = `
IP: ${info.ip}
City: ${info.city}
Region: ${info.region}
Country: ${info.country}
Location: ${info.loc}
Org: ${info.org}
Timezone: ${info.timezone}
    `;

    // Send Email
    await apiInstance.sendTransacEmail({
      sender: { email: process.env.SMTP_FROM },
      to: [{ email: process.env.EMAIL_TO }],
      subject: "New Portfolio Visitor",
      textContent: `
Browser: ${browser}
Time: ${time}

===== LOCATION DETAILS =====
${locationText}
      `,
    });

    console.log("Email sent with location!");
    res.json({ success: true });

  } catch (error) {
    console.error("Brevo API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// START SERVER
app.listen(5000, () => console.log("Backend running on port 5000"));
