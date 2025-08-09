// backend/mailer.js
const nodemailer = require('nodemailer');

exports.sendThankYouEmail = async (orderData) => {
  const { name, email, type, details, phone } = orderData;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });

  const messageBody = `
Hi ${name}, 👋

Thank you so much for placing your order with Shruti's Art! 🎨

🖌️ Artwork Type: ${type}
📄 Custom Details: ${details}
📞 WhatsApp: ${phone}

We’ll be in touch soon to confirm everything.

Stay creative!  
– Shruti's Art 💖
`;

  // Customer Email
  await transporter.sendMail({
    from: `"Shruti's Art" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Thank you for your order, ${name}!`,
    text: messageBody
  });

  // Admin Email Copy
  await transporter.sendMail({
    from: `"Order Alert" <${process.env.SMTP_EMAIL}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
    subject: `🆕 New Order from ${name}`,
    text: `
New order received:

👤 Name: ${name}
📧 Email: ${email}
📱 WhatsApp: ${phone}
🎨 Type: ${type}
📝 Details: ${details}
    `
  });
};
