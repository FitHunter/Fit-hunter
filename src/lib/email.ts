import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "NextFit <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// The Resend SDK does NOT throw on API errors — it resolves with
// { data, error }. Without this check, failed sends are silently swallowed
// (callers' .catch() never fires). Log and throw so failures are visible.
async function send(args: Parameters<typeof resend.emails.send>[0]) {
  const result = await resend.emails.send(args);
  if (result.error) {
    console.error("[email] send failed:", result.error);
    throw new Error(`Email send failed: ${result.error.message}`);
  }
  return result;
}

// Escape any user-supplied value before interpolating it into email HTML,
// otherwise senders can inject markup/links (phishing) into recipients' inboxes.
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  return send({
    from: FROM,
    to: email,
    subject: "Verify your NextFit account",
    html: `<p>Click <a href="${url}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return send({
    from: FROM,
    to: email,
    subject: "Reset your NextFit password",
    html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function sendContactNotificationToTrainer(opts: {
  trainerEmail: string;
  trainerName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}) {
  return send({
    from: FROM,
    to: opts.trainerEmail,
    subject: `New consult request from ${opts.senderName}`,
    html: `
      <h2>You have a new contact request on NextFit</h2>
      <p><strong>From:</strong> ${esc(opts.senderName)} (${esc(opts.senderEmail)})</p>
      <p><strong>Message:</strong></p>
      <p>${esc(opts.message)}</p>
      <p><a href="${APP_URL}/dashboard/trainer">View in Dashboard</a></p>
    `,
  });
}

export async function sendContactConfirmationToSender(opts: {
  senderEmail: string;
  senderName: string;
  recipientName: string;
}) {
  return send({
    from: FROM,
    to: opts.senderEmail,
    subject: `Your message to ${opts.recipientName} was sent`,
    html: `
      <p>Hi ${esc(opts.senderName)},</p>
      <p>Your message to <strong>${esc(opts.recipientName)}</strong> has been sent. They'll be in touch with you soon.</p>
      <p>— The NextFit Team</p>
    `,
  });
}

export async function sendContactNotificationToGym(opts: {
  gymEmail: string;
  gymName: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}) {
  return send({
    from: FROM,
    to: opts.gymEmail,
    subject: `New inquiry: ${opts.subject}`,
    html: `
      <h2>New inquiry at ${esc(opts.gymName)}</h2>
      <p><strong>From:</strong> ${esc(opts.senderName)} (${esc(opts.senderEmail)})</p>
      <p><strong>Subject:</strong> ${esc(opts.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${esc(opts.message)}</p>
      <p><a href="${APP_URL}/dashboard/gym">View in Dashboard</a></p>
    `,
  });
}

export async function sendReviewSubmittedConfirmation(email: string) {
  return send({
    from: FROM,
    to: email,
    subject: "Your review has been submitted",
    html: `<p>Thank you for submitting a review on NextFit. It will be published after moderation (typically within 24–48 hours).</p>`,
  });
}

export async function sendReviewRejectedEmail(email: string, reason: string) {
  return send({
    from: FROM,
    to: email,
    subject: "Your NextFit review was not approved",
    html: `<p>Unfortunately, your review was not approved.</p><p><strong>Reason:</strong> ${esc(reason)}</p>`,
  });
}

export async function sendCertRejectedEmail(email: string, certName: string) {
  return send({
    from: FROM,
    to: email,
    subject: `Certification not verified: ${certName}`,
    html: `<p>We were unable to verify your <strong>${esc(certName)}</strong> certification. Please re-upload a clear copy of your certificate.</p>`,
  });
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  return send({
    from: FROM,
    to: email,
    subject: "Action required: payment failed",
    html: `
      <p>Hi ${esc(name)},</p>
      <p>We were unable to process your NextFit subscription payment. You have 7 days to update your payment method before your account is downgraded.</p>
      <p>Sign in and open your dashboard, then click <strong>Manage Billing</strong> to update your payment method.</p>
      <p><a href="${APP_URL}">Sign in to NextFit</a></p>
    `,
  });
}
