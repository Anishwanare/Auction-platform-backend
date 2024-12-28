// import nodemailer from 'nodemailer'

// export const sendEmail = async ({ email, subject, message }) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         service: process.env.SMTP_SERVICE,
//         auth: {
//             user: process.env.SMTP_MAIL,
//             pass: process.env.SMTP_PASSWORD
//         }
//     })

//     const option = {
//         from: process.env.SMTP_MAIL,
//         to: email,
//         subject: subject,
//         text: message
//     }

//     await transporter.sendMail(option)
// }

import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message }) => {
    try {
        // Create a transporter object using SMTP configuration
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // True for 465, false for other ports like 587
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Define email options
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: subject,
            text: message,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}: ${info.response}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}: ${error.message}`);
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};
