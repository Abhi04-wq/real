const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const smtpUser = process.env.SMTP_EMAIL || "promonexlive@gmail.com";
  // Gmail shows app-passwords with spaces (xxxx xxxx xxxx xxxx) but
  // SMTP auth expects them without spaces. Strip whitespace defensively.
  const smtpPass = (process.env.SMTP_PASSWORD || "bitv cexs miti tvbk").replace(/\s/g, "");
  // Gmail only allows From = authenticated account or a verified alias.
  // Using noreply@example.com via smtp.gmail.com gets rejected / spam-filtered.
  const fromEmail = process.env.FROM_EMAIL && !process.env.FROM_EMAIL.endsWith("@example.com")
    ? process.env.FROM_EMAIL
    : smtpUser;

  // Create SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    family: 4, // force IPv4: avoids ETIMEDOUT/ENETUNREACH when IPv6 is broken
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  // Define email options
  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Promonex'}" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent: %s", info.messageId);
  return info;
};

module.exports = sendEmail;
