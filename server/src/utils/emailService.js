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

export const sendEnrollmentEmail = async (userEmail, userName, courseTitle, isPaid, price, pdfBuffer = null) => {
  const subject = `Successfully Enrolled in ${courseTitle}`;
  const text = isPaid 
    ? `Hi ${userName},\n\nYou have successfully enrolled in ${courseTitle}. Your payment of INR ${price} has been received. Please find your fee receipt attached.\n\nHappy Learning!\nEduscale Team`
    : `Hi ${userName},\n\nYou have successfully enrolled in ${courseTitle} for free.\n\nHappy Learning!\nEduscale Team`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject,
    text,
    attachments: pdfBuffer ? [
      {
        filename: `Fee_Receipt_${courseTitle.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Enrollment email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending enrollment email:', error);
  }
};

export const sendCertificateEmail = async (userEmail, userName, courseTitle, pdfBuffer) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your Completion Certificate: ${courseTitle}`,
    text: `Congratulations ${userName}!\n\nYou have successfully completed ${courseTitle}. Please find your completion certificate attached to this email.\n\nKeep learning and keep growing!\nBest Regards,\nEduscale Team`,
    attachments: [
      {
        filename: `${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Certificate email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending certificate email:', error);
  }
};

export default transporter;
