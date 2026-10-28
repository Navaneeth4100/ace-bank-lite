import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(
      `[MailUtil] SMTP credentials not fully configured. Skipped sending email to: ${to}`
    );
    return false;
  }

  try {
    const from = process.env.SMTP_FROM || `"AceBank Support" <${process.env.SMTP_USER}>`;
    await mailer.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.info(`[MailUtil] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.warn(`[MailUtil] Failed to send email to ${to}:`, error);
    return false;
  }
}

export function sendWelcomeEmailAsync(firstName: string, email: string, accNo: number) {
  const subject = "Welcome to AceBank";
  const message = `Dear ${firstName},\n\nWelcome! Your account number is: ${accNo}.\nKeep it safe!\n\nBest regards,\nAceBank Team`;
  
  // Fire and forget (asynchronous)
  sendEmail(email, subject, message).catch((err) =>
    console.warn("Async welcome email failed:", err)
  );
}

export function sendRecoveryEmailAsync(
  firstName: string,
  lastName: string,
  email: string,
  accNo: number
) {
  const subject = "AceBank - Account Recovery";
  const message = `Hi ${firstName} ${lastName},\n\nWe found your account details associated with this email:\n- Account Number: ${accNo}\n\nNote: For security reasons, we cannot email your password. Please use the 'Reset Password' feature if you've forgotten it.\n\nBest regards,\nAceBank Team`;

  return sendEmail(email, subject, message);
}
