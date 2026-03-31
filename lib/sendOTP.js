import nodemailer from "nodemailer";

export async function sendOTPMail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Kode OTP",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <p style="font-size: 36px; font-weight: bold; color: #333;">${otp}</p>
        <p style="font-size: 18px; color: #555;">Gunakan Kode Di atas untuk merubah password</p>
      </div>
    `,
  });
}
