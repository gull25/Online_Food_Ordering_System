const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For local development we'll use a test account or ethereal, 
    // but we configure it to pick up env vars for production
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_EMAIL || 'test@ethereal.email',
            pass: process.env.SMTP_PASSWORD || 'testpassword',
        },
    });

    // Define the email options
    const message = {
        from: `${process.env.FROM_NAME || 'Foodora'} <${process.env.FROM_EMAIL || 'noreply@foodora.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML version
    };

    // Send the email
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
