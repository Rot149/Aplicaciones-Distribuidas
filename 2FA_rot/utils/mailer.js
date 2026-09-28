const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

async function sendPinEmail(toEmail, pin) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"2FA System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Código de verificación 2FA',
    text: `Tu código PIN es: ${pin}. Válido por 5 minutos.`,
    html: `<p>Tu código PIN es: <strong>${pin}</strong></p><p>Válido por 5 minutos.</p>`
  });
}

module.exports = { sendPinEmail };