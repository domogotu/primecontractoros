import { describe, it, expect } from "vitest";
import {
  EMAIL_TEMPLATES,
  NOTIFICATION_TEMPLATES,
} from "./services/email";

describe("Email Notification Templates", () => {
  it("should have all required base templates", () => {
    expect(EMAIL_TEMPLATES.welcome).toBeDefined();
    expect(EMAIL_TEMPLATES.welcome.name).toBe("welcome");
    expect(EMAIL_TEMPLATES.welcome.subject).toBe("Welcome to PrimeContractorOS");
    expect(typeof EMAIL_TEMPLATES.welcome.body).toBe("function");
  });

  it("should have deadline reminder template", () => {
    expect(EMAIL_TEMPLATES.deadlineReminder).toBeDefined();
    const subject = EMAIL_TEMPLATES.deadlineReminder.subject({ title: "Test", daysLeft: 3 });
    expect(subject).toContain("Test");
    expect(subject).toContain("3 days left");
  });

  it("should have invoice alert template", () => {
    expect(EMAIL_TEMPLATES.invoiceAlert).toBeDefined();
    const subject = EMAIL_TEMPLATES.invoiceAlert.subject({ invoiceNumber: "INV-001", action: "Overdue" });
    expect(subject).toContain("INV-001");
  });

  it("should have critical error notification template", () => {
    expect(NOTIFICATION_TEMPLATES.criticalError).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.criticalError.name).toBe("critical_error");
    const subject = NOTIFICATION_TEMPLATES.criticalError.subject({ errorType: "Database Failure" });
    expect(subject).toContain("CRITICAL");
    expect(subject).toContain("Database Failure");
    const body = NOTIFICATION_TEMPLATES.criticalError.body({
      errorType: "Database Failure",
      message: "Connection lost",
      timestamp: "2026-01-01T00:00:00Z",
      workspaceName: "TestWorkspace",
    });
    expect(body).toContain("Database Failure");
    expect(body).toContain("Connection lost");
    expect(body).toContain("TestWorkspace");
  });

  it("should have overdue invoice notification template", () => {
    expect(NOTIFICATION_TEMPLATES.overdueInvoice).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.overdueInvoice.name).toBe("overdue_invoice");
    const subject = NOTIFICATION_TEMPLATES.overdueInvoice.subject({ invoiceNumber: "INV-100", daysPastDue: 15 });
    expect(subject).toContain("INV-100");
    expect(subject).toContain("15 days past due");
  });

  it("should have task assignment notification template", () => {
    expect(NOTIFICATION_TEMPLATES.taskAssignment).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.taskAssignment.name).toBe("task_assignment");
    const subject = NOTIFICATION_TEMPLATES.taskAssignment.subject({ taskTitle: "Review Contract" });
    expect(subject).toContain("Review Contract");
    const body = NOTIFICATION_TEMPLATES.taskAssignment.body({
      taskTitle: "Review Contract",
      description: "Please review the contract",
      priority: "high",
      dueDate: "2026-05-15",
      assignedBy: "Admin",
    });
    expect(body).toContain("Review Contract");
    expect(body).toContain("high");
    expect(body).toContain("Admin");
  });

  it("should have workspace invite notification template", () => {
    expect(NOTIFICATION_TEMPLATES.workspaceInvite).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.workspaceInvite.name).toBe("workspace_invite");
    const subject = NOTIFICATION_TEMPLATES.workspaceInvite.subject({ workspaceName: "Reed's Solutions" });
    expect(subject).toContain("Reed's Solutions");
    const body = NOTIFICATION_TEMPLATES.workspaceInvite.body({
      workspaceName: "Reed's Solutions",
      inviterName: "John",
      role: "member",
      inviteUrl: "https://example.com/invite/abc",
    });
    expect(body).toContain("John");
    expect(body).toContain("Reed's Solutions");
    expect(body).toContain("member");
    expect(body).toContain("https://example.com/invite/abc");
  });
});
