import { Resend } from "resend";
import { getDb } from "../db";
import { emailNotifications, workspaceSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";

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

  const apiKey = settingsMap["resend_api_key"] || ENV.resendApiKey || "";
  const fromEmail = settingsMap["email_from_address"] || "noreply@primecontractoros.com";
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

// --- Additional notification templates ---

export const NOTIFICATION_TEMPLATES = {
  criticalError: {
    name: "critical_error",
    subject: (params: { errorType: string }) =>
      `[CRITICAL] System Alert: ${params.errorType}`,
    body: (params: { errorType: string; message: string; timestamp: string; workspaceName: string }) => `
      <h2 style="color: #dc2626;">Critical System Alert</h2>
      <p>A critical error has been detected in workspace <strong>${params.workspaceName}</strong>:</p>
      <table style="border-collapse: collapse; width: 100%; background: #fef2f2; border-radius: 8px;">
        <tr><td style="padding: 8px; font-weight: bold;">Error Type:</td><td style="padding: 8px;">${params.errorType}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${params.message}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td style="padding: 8px;">${params.timestamp}</td></tr>
      </table>
      <p>Please investigate and resolve this issue as soon as possible.</p>
    `,
  },
  overdueInvoice: {
    name: "overdue_invoice",
    subject: (params: { invoiceNumber: string; daysPastDue: number }) =>
      `Overdue Invoice: ${params.invoiceNumber} (${params.daysPastDue} days past due)`,
    body: (params: { invoiceNumber: string; amount: string; contractName: string; dueDate: string; daysPastDue: number }) => `
      <h2 style="color: #d97706;">Overdue Invoice Notice</h2>
      <p>The following invoice is past due and requires immediate attention:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Invoice:</td><td style="padding: 8px;">${params.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Amount:</td><td style="padding: 8px;">$${params.amount}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Contract:</td><td style="padding: 8px;">${params.contractName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Due Date:</td><td style="padding: 8px;">${params.dueDate}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Days Past Due:</td><td style="padding: 8px; color: #dc2626; font-weight: bold;">${params.daysPastDue}</td></tr>
      </table>
      <p>Please follow up on this invoice to ensure timely payment.</p>
    `,
  },
  taskAssignment: {
    name: "task_assignment",
    subject: (params: { taskTitle: string }) =>
      `New Task Assigned: ${params.taskTitle}`,
    body: (params: { taskTitle: string; description: string; priority: string; dueDate: string; assignedBy: string }) => `
      <h2>New Task Assignment</h2>
      <p>You have been assigned a new task:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Task:</td><td style="padding: 8px;">${params.taskTitle}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Description:</td><td style="padding: 8px;">${params.description || "No description"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Priority:</td><td style="padding: 8px;">${params.priority}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Due Date:</td><td style="padding: 8px;">${params.dueDate || "Not set"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Assigned By:</td><td style="padding: 8px;">${params.assignedBy}</td></tr>
      </table>
      <p>Please review and begin working on this task.</p>
    `,
  },
  workspaceInvite: {
    name: "workspace_invite",
    subject: (params: { workspaceName: string }) =>
      `You've been invited to join ${params.workspaceName}`,
    body: (params: { workspaceName: string; inviterName: string; role: string; inviteUrl: string }) => `
      <h2>Workspace Invitation</h2>
      <p><strong>${params.inviterName}</strong> has invited you to join the workspace <strong>${params.workspaceName}</strong> as a <strong>${params.role}</strong>.</p>
      <p>Click the button below to accept the invitation:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${params.inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    `,
  },
};

export async function sendCriticalErrorNotification(
  workspaceId: number,
  recipientEmail: string,
  errorType: string,
  message: string,
  workspaceName: string
): Promise<{ success: boolean }> {
  const template = NOTIFICATION_TEMPLATES.criticalError;
  const subject = template.subject({ errorType });
  const body = template.body({ errorType, message, timestamp: new Date().toISOString(), workspaceName });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}

export async function sendOverdueInvoiceNotification(
  workspaceId: number,
  recipientEmail: string,
  invoiceNumber: string,
  amount: string,
  contractName: string,
  dueDate: string,
  daysPastDue: number
): Promise<{ success: boolean }> {
  const template = NOTIFICATION_TEMPLATES.overdueInvoice;
  const subject = template.subject({ invoiceNumber, daysPastDue });
  const body = template.body({ invoiceNumber, amount, contractName, dueDate, daysPastDue });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}

export async function sendTaskAssignmentNotification(
  workspaceId: number,
  recipientEmail: string,
  taskTitle: string,
  description: string,
  priority: string,
  dueDate: string,
  assignedBy: string
): Promise<{ success: boolean }> {
  const template = NOTIFICATION_TEMPLATES.taskAssignment;
  const subject = template.subject({ taskTitle });
  const body = template.body({ taskTitle, description, priority, dueDate, assignedBy });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}

export async function sendWorkspaceInviteNotification(
  workspaceId: number,
  recipientEmail: string,
  workspaceName: string,
  inviterName: string,
  role: string,
  inviteUrl: string
): Promise<{ success: boolean }> {
  const template = NOTIFICATION_TEMPLATES.workspaceInvite;
  const subject = template.subject({ workspaceName });
  const body = template.body({ workspaceName, inviterName, role, inviteUrl });
  return sendEmail(workspaceId, recipientEmail, subject, body, template.name);
}

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

export async function sendContractStatusChangeNotification(
  workspaceId: number,
  recipientEmail: string,
  contractTitle: string,
  contractNumber: string,
  previousStatus: string,
  newStatus: string
): Promise<{ success: boolean }> {
  const subject = `Contract Status Update: ${contractTitle} — ${newStatus}`;
  const body = `
    <h2>Contract Status Changed</h2>
    <p>A contract in your workspace has been updated:</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding: 8px; font-weight: bold;">Contract:</td><td style="padding: 8px;">${contractTitle}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Contract Number:</td><td style="padding: 8px;">${contractNumber || "N/A"}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Previous Status:</td><td style="padding: 8px;">${previousStatus}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">New Status:</td><td style="padding: 8px; font-weight: bold; color: #2563eb;">${newStatus}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Changed At:</td><td style="padding: 8px;">${new Date().toISOString()}</td></tr>
    </table>
    <p>Please review the contract details and take any necessary actions.</p>
  `;
  return sendEmail(workspaceId, recipientEmail, subject, body, "contract_status_change");
}
