/**
 * Scheduled Email Scans
 * 
 * Scans for:
 * 1. Deadlines approaching within 48 hours (not completed, not already reminded)
 * 2. Invoices overdue by more than 7 days (not paid, not already reminded)
 * 
 * Sends reminder emails using existing email infrastructure and marks records
 * as "reminded" to prevent duplicates.
 */

import { getDb } from "../db";
import { deadlines, invoices, workspaces, users, contracts } from "../../drizzle/schema";
import { eq, and, lte, gte, isNull, isNotNull, not, sql } from "drizzle-orm";
import { sendDeadlineReminder, sendOverdueInvoiceNotification } from "./email";

export async function scanDeadlinesApproaching(): Promise<{ scanned: number; reminded: number }> {
  const db = await getDb();
  if (!db) return { scanned: 0, reminded: 0 };

  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find deadlines due within 48 hours that are not completed and not already reminded
  const upcomingDeadlines = await db
    .select()
    .from(deadlines)
    .where(
      and(
        lte(deadlines.dueDate, in48Hours),
        gte(deadlines.dueDate, now),
        not(eq(deadlines.status, "completed")),
        isNull(deadlines.lastRemindedAt)
      )
    );

  let reminded = 0;

  for (const deadline of upcomingDeadlines) {
    try {
      // Get workspace owner email
      const [ws] = await db
        .select({ ownerId: workspaces.ownerId, name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, deadline.workspaceId));
      if (!ws) continue;

      const [owner] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, ws.ownerId));
      if (!owner?.email) continue;

      const daysLeft = Math.ceil((deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const dueDate = deadline.dueDate.toISOString().split("T")[0];

      await sendDeadlineReminder(
        deadline.workspaceId,
        owner.email,
        deadline.title,
        dueDate,
        deadline.linkedRecordType || "general",
        ws.name || "Workspace",
        daysLeft
      );

      // Mark as reminded
      await db
        .update(deadlines)
        .set({ lastRemindedAt: now })
        .where(eq(deadlines.id, deadline.id));

      reminded++;
    } catch (err) {
      console.error(`[ScheduledScan] Failed to send deadline reminder for deadline ${deadline.id}:`, err);
    }
  }

  return { scanned: upcomingDeadlines.length, reminded };
}

export async function scanOverdueInvoices(): Promise<{ scanned: number; reminded: number }> {
  const db = await getDb();
  if (!db) return { scanned: 0, reminded: 0 };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Find invoices overdue by more than 7 days, not paid, not already reminded
  const overdueInvoices = await db
    .select()
    .from(invoices)
    .where(
      and(
        isNotNull(invoices.dueDate),
        lte(invoices.dueDate, sevenDaysAgo),
        not(eq(invoices.status, "paid")),
        not(eq(invoices.status, "draft")),
        isNull(invoices.deletedAt),
        isNull(invoices.lastRemindedAt)
      )
    );

  let reminded = 0;

  for (const invoice of overdueInvoices) {
    try {
      // Get workspace owner email
      const [ws] = await db
        .select({ ownerId: workspaces.ownerId, name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, invoice.workspaceId));
      if (!ws) continue;

      const [owner] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, ws.ownerId));
      if (!owner?.email) continue;

      // Get contract name if linked
      let contractName = "N/A";
      if (invoice.contractId) {
        const [contract] = await db
          .select({ title: contracts.title })
          .from(contracts)
          .where(eq(contracts.id, invoice.contractId));
        if (contract) contractName = contract.title;
      }

      const dueDate = invoice.dueDate!.toISOString().split("T")[0];
      const daysPastDue = Math.ceil((now.getTime() - invoice.dueDate!.getTime()) / (1000 * 60 * 60 * 24));

      await sendOverdueInvoiceNotification(
        invoice.workspaceId,
        owner.email,
        invoice.invoiceNumber,
        String(invoice.amount),
        contractName,
        dueDate,
        daysPastDue
      );

      // Mark as reminded
      await db
        .update(invoices)
        .set({ lastRemindedAt: now })
        .where(eq(invoices.id, invoice.id));

      reminded++;
    } catch (err) {
      console.error(`[ScheduledScan] Failed to send overdue invoice reminder for invoice ${invoice.id}:`, err);
    }
  }

  return { scanned: overdueInvoices.length, reminded };
}

/**
 * Run all scheduled email scans. Called by the heartbeat endpoint.
 */
export async function runAllEmailScans(): Promise<{
  deadlines: { scanned: number; reminded: number };
  invoices: { scanned: number; reminded: number };
}> {
  const [deadlineResult, invoiceResult] = await Promise.all([
    scanDeadlinesApproaching(),
    scanOverdueInvoices(),
  ]);

  console.log(
    `[ScheduledScan] Completed: Deadlines ${deadlineResult.reminded}/${deadlineResult.scanned} reminded, ` +
    `Invoices ${invoiceResult.reminded}/${invoiceResult.scanned} reminded`
  );

  return { deadlines: deadlineResult, invoices: invoiceResult };
}
