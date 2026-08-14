require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendTestEmail() {
    try {
        const info = await transporter.sendMail({
            from: `"CRM App" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "gmail Email Test",
            text: "This is a test email using Elastic Email SMTP from Render!",
        });
        console.log("✅ Test email sent:", info.messageId);
    } catch (err) {
        console.error("❌ Failed to send test email:", err);
    }
}

sendTestEmail();
