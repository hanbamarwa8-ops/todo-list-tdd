import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD}
});

export async function sendResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Réinitialisation de ton mot de passe",
    html: `
      <p>Tu as demandé la réinitialisation de ton mot de passe.</p>
      <p><a href="${resetLink}">Clique ici pour choisir un nouveau mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
    `
  });
}