const nodemailer = require("nodemailer");

const transportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

let transporter;

// Lazily create a transporter so apps without SMTP configured can still boot.
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(transportOptions);
  }

  return transporter;
}

/**
 * Send an email with the provided options.
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
async function sendEmail({ to, subject, html, text }) {
  if (!transportOptions.host || !transportOptions.auth.user || !transportOptions.auth.pass) {
    throw new Error("SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  const transporterInstance = getTransporter();

  await transporterInstance.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
    text,
  });
}

module.exports = sendEmail;
