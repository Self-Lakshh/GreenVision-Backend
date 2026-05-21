import resend from '../config/resend.js';
import logger from '../utils/logger.js';

const isDev = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('mock');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@nirmalcarbon.in';

const sendMail = async ({ to, subject, html }) => {
  if (isDev) {
    logger.info(`[MOCK EMAIL SENT]
To: ${Array.isArray(to) ? to.join(', ') : to}
From: ${fromEmail}
Subject: ${subject}
Content: ${html.replace(/<[^>]*>/g, ' ').substring(0, 500)}...`);
    return { id: `mock-email-id-${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully. ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error(`Error sending email via Resend: ${error.message}`);
    // Non-blocking, so we don't throw to crash the process
    return null;
  }
};

export const sendPurchaseConfirmation = async (user, transaction, project, certificateUrl) => {
  const subject = `Nirmal Carbon — Purchase Confirmation: ${project.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #0b7849;">Purchase Successful!</h2>
      <p>Dear ${user.fullName || 'User'},</p>
      <p>Thank you for purchasing carbon credits on Nirmal Carbon. You are actively contributing to environmental sustainability!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Project</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${project.title}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Credits Purchased</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${transaction.creditsPurchased} tCO₂e</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total Amount Paid</th>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${(transaction.totalAmount + transaction.gstAmount).toLocaleString('en-IN')} (incl. GST)</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Order ID</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${transaction.razorpayOrderId}</td>
        </tr>
      </table>

      <p>Your carbon credit certificate has been successfully generated.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${certificateUrl}" style="background-color: #0b7849; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a></p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>Nirmal Carbon Team</strong></p>
    </div>
  `;

  return sendMail({ to: user.email, subject, html });
};

export const sendProjectVerified = async (firmUser, project) => {
  const subject = `Nirmal Carbon — Project Verified: ${project.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #0b7849;">Project Approved & Verified!</h2>
      <p>Dear ${firmUser.fullName || 'Partner'},</p>
      <p>We are pleased to inform you that your project, <strong>${project.title}</strong>, has been successfully reviewed and verified by our administrative team.</p>
      <p>It is now live on the Nirmal Carbon marketplace and available for individual and corporate buyers to purchase credits.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Credits Listed</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${project.totalCredits} Credits</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Price Per Credit</th>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${project.pricePerCredit}</td>
        </tr>
      </table>

      <p>Log in to your dashboard to monitor sales, credits sold, and revenue generated.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>Nirmal Carbon Team</strong></p>
    </div>
  `;

  return sendMail({ to: firmUser.email, subject, html });
};

export const sendProjectRejected = async (firmUser, project, reason) => {
  const subject = `Nirmal Carbon — Project Updates Required: ${project.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #d9534f;">Project Review Update</h2>
      <p>Dear ${firmUser.fullName || 'Partner'},</p>
      <p>Thank you for submitting your project, <strong>${project.title}</strong>, to Nirmal Carbon.</p>
      <p>Upon review, our validation team requires additional adjustments or documents before we can list it. Below is the feedback reason:</p>
      
      <div style="background-color: #fcf8e3; border: 1px solid #faebcc; color: #8a6d3b; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>Rejection Reason:</strong><br/>
        ${reason}
      </div>

      <p>You can edit your project draft in the dashboard, address the feedback, and re-submit it for approval.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>Nirmal Carbon Team</strong></p>
    </div>
  `;

  return sendMail({ to: firmUser.email, subject, html });
};

export const sendNewProjectPendingAlert = async (adminUsers, project, firmUser) => {
  if (!adminUsers || adminUsers.length === 0) return;

  const emails = adminUsers.map((a) => a.email);
  const subject = `[Admin Alert] New Project Pending Verification: ${project.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #f0ad4e;">New Project for Verification</h2>
      <p>A new carbon offset project has been submitted and is awaiting administrative review.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Project Title</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${project.title}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Listed By</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${firmUser.companyName || firmUser.fullName} (${firmUser.email})</td>
        </tr>
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Total Credits</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${project.totalCredits} tCO₂e</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Credit Price</th>
          <td style="padding: 10px; border: 1px solid #ddd;">₹${project.pricePerCredit}</td>
        </tr>
      </table>

      <p>Please log in to the admin console to verify or reject this submission.</p>
    </div>
  `;

  return sendMail({ to: emails, subject, html });
};

export default {
  sendPurchaseConfirmation,
  sendProjectVerified,
  sendProjectRejected,
  sendNewProjectPendingAlert,
};
