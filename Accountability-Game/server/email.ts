import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendEmail(toEmail: string, subject: string, html: string) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  await client.emails.send({
    from: fromEmail || 'noreply@resend.dev',
    to: toEmail,
    subject,
    html,
  });
}

export async function processEmailQueue() {
  try {
    const { storage } = await import("./storage");
    const pendingEmails = await storage.getPendingEmailQueueItems(5);
    
    if (pendingEmails.length === 0) return;
    
    for (const email of pendingEmails) {
      try {
        await storage.updateEmailQueueItem(email.id, { status: "PROCESSING" });
        
        const { client, fromEmail } = await getUncachableResendClient();
        await client.emails.send({
          from: fromEmail || 'noreply@resend.dev',
          to: email.toEmail,
          subject: email.subject,
          html: email.htmlBody,
        });
        
        await storage.updateEmailQueueItem(email.id, {
          status: "SENT",
          sentAt: new Date(),
        });
        
        if (email.notificationId) {
          await storage.createNotificationDelivery({
            notificationId: email.notificationId,
            channel: "EMAIL",
            status: "SENT",
            dedupeKey: email.dedupeKey || undefined,
            sentAt: new Date(),
          });
        }
      } catch (err: any) {
        console.error(`Failed to send email ${email.id}:`, err);
        const retryCount = (email.retryCount || 0) + 1;
        const maxRetries = 3;
        
        await storage.updateEmailQueueItem(email.id, {
          status: retryCount >= maxRetries ? "FAILED" : "QUEUED",
          retryCount,
          lastError: err.message || "Unknown error",
          scheduledFor: new Date(Date.now() + retryCount * 60000),
        });
      }
    }
  } catch (err) {
    console.error("Error processing email queue:", err);
  }
}

export function startEmailWorker() {
  setInterval(processEmailQueue, 30000);
  console.log("Email worker started (every 30 seconds)");
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, username: string) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const resetUrl = `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  await client.emails.send({
    from: fromEmail || 'noreply@resend.dev',
    to: toEmail,
    subject: 'Reset Your Stride Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password for your Stride account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 14px;">The Stride Team</p>
      </div>
    `
  });
}
