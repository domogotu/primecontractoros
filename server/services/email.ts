import { Resend } from "resend";
import { getDb } from "../db";
import { emailNotifications, workspaceSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export async function getEmailConfig(workspaceId: number): Promise<EmailConfig | null> {
  const db = await getDb();
  if (!db) return null;
  const settings = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspaceId));

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.settingValue) settingsMap[s.settingKey] = s.settingValue;
  }

  const apiKey = settingsMap["resend_api_key"];
  const fromEmail = settingsMap["email_from_address"] || "noreply@example.com";
  const fromName = settingsMap["email_from_name"] || "PrimeContractorOS";

  if (!apiKey) return null;

  return { apiKey, fromEmail, fromName };
}

// Email templates
export const EMAIL_TEMPLATES = {
  welcome: {
    name: "welcome",
    subject: "Welcome to PrimeContractorOS",
    body: (params: { userName: string; workspaceName: string }) => `
      <h2>Welcome to PrimeContractorOS, ${params.userName}!</h2>
      <p>Your workspace <strong>${params.workspaceName}</strong> is ready.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your business profile</li>
        <li>Add your first opportunity</li>
        <li>Explore the contract lifecycle tools</li>
      </ul>
      <p>If you need help, visit our documentation or contact support.</p>
    `,
  },
  deadlineReminder: {
    name: "deadline_reminder",
    subject: (params: { title: string; daysLeft: number }) =>
      `Deadline Reminder: ${params.title} (${params.daysLeft} days left)`,
    body: (params: { title: string; dueDate: string; entityType: string; entityName: string }) => `
      <h2>Upcoming Deadline</h2>
      <p>You have an upcoming deadline:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Item:</td><td style="padding: 8px;">${params.title}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Related to:</td><td style="padding: 8px;">${params.entityType}: ${params.entityName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Due Date:</td><td style="padding: 8px;">${params.dueDate}</td></tr>
      </table>
      <p>Please ensure all required actions are completed before the deadline.</p>
    `,
  },
  invoiceAlert: {
    name: "invoice_alert",
    subject: (params: { invoiceNumber: string; action: string }) =>
      `Invoice ${params.action}: ${params.invoiceNumber}`,
    body: (params: { invoiceNumber: string; amount: string; contractName: string; action: string }) => `
      <h2>Invoice ${params.action}</h2>
      <p>An invoice requires your attention:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Invoice:</td><td style="padding: 8px;">${params.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Amount:</td><td style="padding: 8px;">$${params.amount}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Contract:</td><td style="padding: 8px;">${params.contractName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px;">${params.action}</td></tr>
      </table>
    `,
  },
};

export async function sendEmail(
  workspaceId: number,
  recipientEmail: string,
  subject: string,
  htmlBody: string,
  templateName?: string
): Promise<{ success: boolean; id?: string }> {
  const config = await getEmailConfig(workspaceId);

  // Log to database regardless of email config
  const db = await getDb();
  if (!db) return { success: false };
  const [notification] = await db.insert(emailNotifications).values({
    workspaceId,
    recipientEmail,
    subject,
    body: htmlBody,
    templateName: templateName || null,
    status: config ? "queued" : "skipped",
  });

  if (!config) {
    // No email configured - just log to database
    return { success: true, id: `db-only-${notification.insertId}` };
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: recipientEmail,
      subject,
      html: htmlBody,
    });

    // Update status to sent
    await db
      .update(emailNotifications)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(emailNotifications.id, Number(notification.insertId)));

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    // Update status to failed
    await db
      .update(emailNotifications)
      .set({ status: "failed", errorMessage: error.message })
      .where(eq(emailNotifications.id, Number(notification.insertId)));

    return { success: false };
  }
}

export async function sendWelcomeEmail(
  workspaceId: number,
  recipientEmail: string,
  userName: string,
  workspaceName: string
): Promise<{ success: boolean }> {
  const template = EMAIL_TEMPLATES.welcome;
  const body = template.body({ userName, workspaceName });
  return sendEmail(workspaceId, recipientEmail, template.subject, body, template.name);
}

export async function sendDeadlineReminder(
  workspaceId: number,
  recipientEmail: string,
  title: string,
  dueDate: string,
  entityType: string,
  entityName: string,
  daysLeft: number
): Promise<{ success: boolean }> {
  const template = EMAIL_TEMPLATES.deadlineReminder;
  const subject = template.subject({ title, daysLeft });
  const body = template.body({ title, dueDate, entityType, entityName });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}

export async function sendInvoiceAlert(
  workspaceId: number,
  recipientEmail: string,
  invoiceNumber: string,
  amount: string,
  contractName: string,
  action: string
): Promise<{ success: boolean }> {
  const template = EMAIL_TEMPLATES.invoiceAlert;
  const subject = template.subject({ invoiceNumber, action });
  const body = template.body({ invoiceNumber, amount, contractName, action });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}
