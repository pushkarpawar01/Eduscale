import PDFDocument from 'pdfkit';

export const generateCertificatePDF = (userName, courseTitle, completionDate, certificateId) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Background Color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

    // Decorative Borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#f97316');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#1e293b');

    // Logo Placeholder / Text Logo
    doc.fillColor('#f97316')
       .fontSize(40)
       .font('Helvetica-Bold')
       .text('EDUSCALE', 0, 80, { align: 'center' });

    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica')
       .text('CERTIFICATE OF COMPLETION', 0, 140, { align: 'center' });

    doc.fillColor('#64748b')
       .fontSize(14)
       .text('This is to certify that', 0, 200, { align: 'center' });

    doc.fillColor('#ffffff')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text(userName.toUpperCase(), 0, 240, { align: 'center' });

    doc.fillColor('#64748b')
       .fontSize(14)
       .font('Helvetica')
       .text('has successfully completed the course', 0, 300, { align: 'center' });

    doc.fillColor('#10b981')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(courseTitle, 0, 340, { align: 'center' });

    doc.fillColor('#64748b')
       .fontSize(12)
       .font('Helvetica')
       .text(`Issued on: ${new Date(completionDate).toLocaleDateString()}`, 0, 420, { align: 'center' });

    doc.fillColor('#334155')
       .fontSize(10)
       .text(`Certificate ID: ${certificateId}`, 0, 520, { align: 'center' });

    // Signatures
    doc.moveTo(200, 480).lineTo(350, 480).stroke('#334155');
    doc.fillColor('#64748b').fontSize(10).text('Program Director', 200, 490, { width: 150, align: 'center' });

    doc.moveTo(490, 480).lineTo(640, 480).stroke('#334155');
    doc.fillColor('#64748b').fontSize(10).text('Academic Head', 490, 490, { width: 150, align: 'center' });

    doc.end();
  });
};

export const generateReceiptPDF = (userName, courseTitle, price, paymentId, date) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fillColor('#0f172a').fontSize(25).font('Helvetica-Bold').text('FEE RECEIPT', { align: 'right' });
    doc.fillColor('#f97316').fontSize(20).text('EDUSCALE', 50, 50);
    
    doc.moveDown();
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Receipt Date: ${new Date(date).toLocaleDateString()}`);
    doc.text(`Transaction ID: ${paymentId}`);

    doc.moveDown(2);
    
    // Billing Info
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('BILLED TO:');
    doc.font('Helvetica').text(userName);
    
    doc.moveDown(2);

    // Table Header
    const tableTop = 250;
    doc.font('Helvetica-Bold').text('Description', 50, tableTop);
    doc.text('Amount', 450, tableTop, { align: 'right' });
    
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke('#e2e8f0');

    // Table Content
    doc.font('Helvetica').text(courseTitle, 50, tableTop + 35);
    doc.text(`INR ${price.toFixed(2)}`, 450, tableTop + 35, { align: 'right' });

    // Total
    doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).stroke('#e2e8f0');
    doc.font('Helvetica-Bold').fontSize(14).text('Total Paid', 50, tableTop + 80);
    doc.fillColor('#f97316').text(`INR ${price.toFixed(2)}`, 450, tableTop + 80, { align: 'right' });

    // Footer
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Thank you for choosing Eduscale. This is a computer-generated receipt.', 50, 700, { align: 'center' });

    doc.end();
  });
};
