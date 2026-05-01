import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEnrollmentEmail = async (userEmail, userName, courseTitle, isPaid, price) => {
  const subject = `Successfully Enrolled in ${courseTitle}`;
  const text = isPaid 
    ? `Hi ${userName},\n\nYou have successfully enrolled in ${courseTitle}. Your payment of ${price} has been received.\n\nHappy Learning!\nEduscale Team`
    : `Hi ${userName},\n\nYou have successfully enrolled in ${courseTitle} for free.\n\nHappy Learning!\nEduscale Team`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Enrollment email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending enrollment email:', error);
  }
};

export const sendCertificateEmail = async (userEmail, userName, courseTitle, certificateUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your Certificate for ${courseTitle}`,
    text: `Congratulations ${userName}!\n\nYou have successfully completed ${courseTitle}. You can view your certificate here: ${certificateUrl}`,
    // You could also attach the PDF here if generated
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Certificate email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending certificate email:', error);
  }
};

export default transporter;
