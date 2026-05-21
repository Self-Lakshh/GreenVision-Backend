import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import Transaction from '../models/Transaction.js';
import emailService from './email.service.js';
import logger from '../utils/logger.js';

export const generateCertificate = async (transactionId) => {
  try {
    const transaction = await Transaction.findById(transactionId)
      .populate('buyerId')
      .populate('projectId');

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    const buyer = transaction.buyerId;
    const project = transaction.projectId;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Green filled rectangle header bar
    page.drawRectangle({
      x: 0,
      y: 762,
      width: 595,
      height: 80,
      color: rgb(0.1, 0.47, 0.29),
    });

    // White text in header
    page.drawText('NIRMAL CARBON', {
      x: 40,
      y: 805,
      size: 24,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText('Carbon Credit Offset Certificate', {
      x: 40,
      y: 780,
      size: 14,
      font: regularFont,
      color: rgb(1, 1, 1),
    });

    // Date calculations
    const createdDate = transaction.createdAt || new Date();
    const dateStr = createdDate.toISOString().slice(0, 10).replace(/-/g, '');
    const shortTxId = transaction._id.toString().slice(-6).toUpperCase();
    const certId = `CERT-${dateStr}-${shortTxId}`;

    // Unique Certificate ID
    page.drawText(`Certificate ID: ${certId}`, {
      x: 40,
      y: 730,
      size: 11,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Horizontal separator line
    page.drawLine({
      start: { x: 40, y: 715 },
      end: { x: 555, y: 715 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Info drawer helper
    let currentY = 675;
    const drawLabelValue = (label, value) => {
      // Draw label (gray, size 10)
      page.drawText(label, {
        x: 40,
        y: currentY,
        size: 10,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Draw value (dark, size 12)
      page.drawText(value, {
        x: 180,
        y: currentY,
        size: 12,
        font: regularFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      currentY -= 40;
    };

    const formattedDate = createdDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    drawLabelValue('Issued To:', buyer.fullName || 'Nirmal Carbon Buyer');
    drawLabelValue('Email:', buyer.email || 'N/A');
    drawLabelValue('Project Name:', project.title || 'Nirmal Carbon Listing');
    drawLabelValue('Project Type:', project.projectType ? project.projectType.toUpperCase() : 'OTHER');
    drawLabelValue('Location:', project.location || 'India');
    drawLabelValue('Credits Purchased:', `${transaction.creditsPurchased} tCO₂e`);
    drawLabelValue('Amount Paid:', `₹${(transaction.totalAmount + transaction.gstAmount).toLocaleString('en-IN')}`);
    drawLabelValue('Purchase Date:', formattedDate);
    drawLabelValue('CO₂ Offset:', `${transaction.creditsPurchased} tonnes of CO₂ equivalent`);

    // Bottom border green rectangle
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 595,
      height: 30,
      color: rgb(0.1, 0.47, 0.29),
    });

    // Footer text
    page.drawText(`Verify this certificate at nirmalcarbon.in/verify/${certId}`, {
      x: 40,
      y: 50,
      size: 9,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    const filePath = path.join('uploads', 'certificates', `${certId}.pdf`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, pdfBytes);

    const certUrl = `/uploads/certificates/${certId}.pdf`;

    // Update Transaction
    await Transaction.findByIdAndUpdate(transactionId, {
      certificateUrl: certUrl,
      certificateGeneratedAt: new Date(),
    });

    // Attempt email notifications without waiting (async)
    emailService.sendPurchaseConfirmation(buyer, transaction, project, certUrl)
      .catch((err) => logger.error(`Error sending cert email: ${err.message}`));

    logger.info(`Certificate generated successfully for transaction ${transactionId} at ${certUrl}`);
    return certUrl;
  } catch (error) {
    logger.error(`Error generating carbon certificate: ${error.message}`);
    throw error;
  }
};

export default {
  generateCertificate,
};
