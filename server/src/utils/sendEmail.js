const nodemailer = require("nodemailer");
const env = require("../config/env");

/*
 * One transporter for the process, created lazily.
 *
 * `createTransport` was called on every send, so each email opened a fresh SMTP
 * connection and threw away the pool nodemailer exists to maintain.
 *
 * The old defaults were also actively harmful: with no SMTP configuration it
 * fell back to `smtp.ethereal.email` with the literal credentials
 * `test@ethereal.email` / `testpassword`, so a misconfigured production server
 * failed to send password-reset links while reporting success.
 */
let transporter;

const getTransporter = () => {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        // 465 is implicit TLS; 587 upgrades via STARTTLS.
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_EMAIL, pass: env.SMTP_PASSWORD },
        pool: true,
        maxConnections: 3,
        connectionTimeout: 10_000,
    });

    return transporter;
};

/**
 * Sends a transactional email.
 *
 * @param {{email: string, subject: string, message?: string, html?: string}} options
 */
const sendEmail = async ({ email, subject, message, html }) => {
    if (!env.emailEnabled) {
        /*
         * In development, log instead of silently pretending to send. A reset
         * link printed to the console is what makes the flow testable without
         * SMTP credentials; throwing here would make it untestable.
         */
        console.warn(`[Email] SMTP is not configured — not sending "${subject}" to ${email}`);
        if (!env.isProduction && message) console.warn(`[Email] Body:\n${message}`);
        return;
    }

    const info = await getTransporter().sendMail({
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to: email,
        subject,
        text: message,
        html,
    });

    if (!env.isProduction) console.log(`[Email] Sent ${info.messageId} to ${email}`);
};

module.exports = sendEmail;
