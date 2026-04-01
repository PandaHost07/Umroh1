import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}verify?email=${email}&token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verifikasi Akun",
    html: `<p>Klik link berikut untuk verifikasi akun Anda: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}
