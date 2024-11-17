import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agustinbruno147@gmail.com',
        pass: 'rcab xsvm ktbf rulv',
    },
});

export const sendMail = async (fromUser, to, subject, text, html = '') => {
    try {
        const mailOptions = {
            from: `"${fromUser.firstName} ${fromUser.lastName}" <${fromUser.email}>`,
            to, 
            subject, 
            text, 
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};
