import express, { Request, Response, Router } from "express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const archiver: any = require("archiver");
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import {
  users, workspaces, opportunities, proposals, contracts, invoices, payments,
  files, contacts, messages, tasks, alerts, deliverables, deadlines, obligations,
  complianceItems, notes, closeoutRecords, lessonsLearned, subcontractors, vendors,
  invites, templates, capabilityStatements, aiRuns, aiFindings, aiSuggestions,
  plans, discounts, platformBilling, supportTickets, auditLogs, notifications,
  onboardingProgress, workspaceMembers, documentVersions, generatedDocuments,
  flowdownReviews, lossReviews, recordTimeline, recordNotes, emailTemplates
} from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

// All tables available for export
const ALL_TABLES = {
  users, workspaces, opportunities, proposals, contracts, invoices, payments,
  files, contacts, messages, tasks, alerts, deliverables, deadlines, obligations,
  complianceItems, notes, closeoutRecords, lessonsLearned, subcontractors, vendors,
  invites, templates, capabilityStatements, aiRuns, aiFindings, aiSuggestions,
  plans, discounts, platformBilling, supportTickets, auditLogs, notifications,
  onboardingProgress, workspaceMembers, documentVersions, generatedDocuments,
  flowdownReviews, lossReviews, recordTimeline, recordNotes, emailTemplates
};

// Workspace-scoped tables (have workspaceId column)
const WORKSPACE_TABLES = {
  opportunities, proposals, contracts, invoices, payments,
  files, contacts, messages, tasks, alerts, deliverables, deadlines, obligations,
  complianceItems, notes, closeoutRecords, lessonsLearned, subcontractors, vendors,
  invites, templates, capabilityStatements, aiRuns, aiFindings, aiSuggestions,
  documentVersions, generatedDocuments, flowdownReviews, lossReviews,
  recordTimeline, recordNotes
};

// Category groupings for workspace export
const EXPORT_CATEGORIES: Record<string, Record<string, any>> = {
  all: WORKSPACE_TABLES,
  contracts: { contracts, deliverables, deadlines, obligations, complianceItems, closeoutRecords, lessonsLearned, flowdownReviews },
  finance: { invoices, payments },
  contacts: { contacts, subcontractors, vendors },
};

/**
 * Authenticate request and return user, or send 401
 */
async function authenticateRequest(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    return user;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

/**
 * Check if user is admin
 */
function isAdmin(user: any): boolean {
  return user.role === "admin";
}

/**
 * Convert rows to CSV string
 */
function rowsToCsv(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = val instanceof Date ? val.toISOString() : String(val);
      // Escape CSV values
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvLines.push(values.join(","));
  }
  return csvLines.join("\n");
}

// ============================================================
// PLATFORM ADMIN: Database Info
// ============================================================
router.get("/api/export/admin/info", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  try {
    // Get table counts
    const tableCounts: Record<string, number> = {};
    for (const [name, table] of Object.entries(ALL_TABLES)) {
      try {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(table);
        tableCounts[name] = result?.count ?? 0;
      } catch {
        tableCounts[name] = 0;
      }
    }

    // Get approximate database size
    const [sizeResult] = await db.execute(sql`
      SELECT SUM(data_length + index_length) as total_size
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `);
    const totalSize = (sizeResult as any)?.total_size || 0;

    res.json({
      tables: tableCounts,
      totalTables: Object.keys(ALL_TABLES).length,
      totalRows: Object.values(tableCounts).reduce((a, b) => a + b, 0),
      databaseSizeBytes: Number(totalSize),
      databaseSizeMB: (Number(totalSize) / 1024 / 1024).toFixed(2),
      exportedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get database info", details: error.message });
  }
});

// ============================================================
// PLATFORM ADMIN: Export workspaces with optional search/status filter
// ============================================================
router.get("/api/export/admin/workspaces", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  const { search = "", status = "" } = req.query as { search?: string; status?: string };

  try {
    let rows = await db.select().from(workspaces);

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(ws =>
        ws.name.toLowerCase().includes(q) ||
        (ws.companyName || "").toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (status && status !== "all") {
      rows = rows.filter(ws => ws.status === status);
    }

    const csv = rowsToCsv(rows);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterSuffix = status && status !== "all" ? `_${status}` : "";
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="workspaces${filterSuffix}_${dateStr}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export workspaces", details: error.message });
  }
});

// ============================================================
// PLATFORM ADMIN: Export single table as CSV
// ============================================================
router.get("/api/export/admin/table/:tableName", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const { tableName } = req.params;
  const table = (ALL_TABLES as any)[tableName];
  if (!table) return res.status(404).json({ error: `Table '${tableName}' not found` });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  try {
    const rows = await db.select().from(table);
    const csv = rowsToCsv(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${tableName}_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export table", details: error.message });
  }
});

// ============================================================
// PLATFORM ADMIN: Export single table as JSON
// ============================================================
router.get("/api/export/admin/table/:tableName/json", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const { tableName } = req.params;
  const table = (ALL_TABLES as any)[tableName];
  if (!table) return res.status(404).json({ error: `Table '${tableName}' not found` });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  try {
    const rows = await db.select().from(table);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${tableName}_${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export table", details: error.message });
  }
});

// ============================================================
// PLATFORM ADMIN: Export ALL tables as zipped CSV
// ============================================================
router.get("/api/export/admin/all-csv", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  try {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="primecontractoros_full_backup_${dateStr}.zip"`);
    archive.pipe(res);

    for (const [name, table] of Object.entries(ALL_TABLES)) {
      try {
        const rows = await db.select().from(table);
        const csv = rowsToCsv(rows);
        if (csv) {
          archive.append(csv, { name: `${name}.csv` });
        }
      } catch {
        // Skip tables that fail (might not exist yet)
      }
    }

    // Add metadata file
    const metadata = JSON.stringify({
      exportedAt: new Date().toISOString(),
      exportedBy: user.name || user.email || user.openId,
      tables: Object.keys(ALL_TABLES),
      format: "CSV",
    }, null, 2);
    archive.append(metadata, { name: "_export_metadata.json" });

    await archive.finalize();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to create backup", details: error.message });
    }
  }
});

// ============================================================
// PLATFORM ADMIN: Export ALL tables as zipped JSON
// ============================================================
router.get("/api/export/admin/all-json", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;
  if (!isAdmin(user)) return res.status(403).json({ error: "Admin access required" });

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  try {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="primecontractoros_full_backup_${dateStr}.zip"`);
    archive.pipe(res);

    for (const [name, table] of Object.entries(ALL_TABLES)) {
      try {
        const rows = await db.select().from(table);
        if (rows.length > 0) {
          archive.append(JSON.stringify(rows, null, 2), { name: `${name}.json` });
        }
      } catch {
        // Skip tables that fail
      }
    }

    const metadata = JSON.stringify({
      exportedAt: new Date().toISOString(),
      exportedBy: user.name || user.email || user.openId,
      tables: Object.keys(ALL_TABLES),
      format: "JSON",
    }, null, 2);
    archive.append(metadata, { name: "_export_metadata.json" });

    await archive.finalize();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to create backup", details: error.message });
    }
  }
});

// ============================================================
// WORKSPACE OWNER: Export workspace data
// ============================================================
router.get("/api/export/workspace", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  // Get user's workspace
  const [ws] = await db.select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id))
    .limit(1);

  if (!ws) return res.status(404).json({ error: "No workspace found" });

  const category = (req.query.category as string) || "all";
  const format = (req.query.format as string) || "csv";

  const tablesToExport = EXPORT_CATEGORIES[category];
  if (!tablesToExport) return res.status(400).json({ error: `Invalid category: ${category}. Use: all, contracts, finance, contacts` });

  try {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeName = (ws.name || "workspace").replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}_${category}_export_${dateStr}.zip"`);
    archive.pipe(res);

    for (const [name, table] of Object.entries(tablesToExport)) {
      try {
        const rows = await db.select().from(table).where(eq((table as any).workspaceId, ws.id));
        if (rows.length > 0) {
          if (format === "json") {
            archive.append(JSON.stringify(rows, null, 2), { name: `${name}.json` });
          } else {
            archive.append(rowsToCsv(rows), { name: `${name}.csv` });
          }
        }
      } catch {
        // Skip tables that fail
      }
    }

    const metadata = JSON.stringify({
      exportedAt: new Date().toISOString(),
      exportedBy: user.name || user.email || user.openId,
      workspace: ws.name,
      workspaceId: ws.id,
      category,
      format,
      tables: Object.keys(tablesToExport),
    }, null, 2);
    archive.append(metadata, { name: "_export_metadata.json" });

    await archive.finalize();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export workspace data", details: error.message });
    }
  }
});

// ============================================================
// WORKSPACE OWNER: Get workspace export info (table counts)
// ============================================================
router.get("/api/export/workspace/info", async (req: Request, res: Response) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  const [ws] = await db.select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id))
    .limit(1);

  if (!ws) return res.status(404).json({ error: "No workspace found" });

  try {
    const tableCounts: Record<string, number> = {};
    for (const [name, table] of Object.entries(WORKSPACE_TABLES)) {
      try {
        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(table)
          .where(eq((table as any).workspaceId, ws.id));
        tableCounts[name] = result?.count ?? 0;
      } catch {
        tableCounts[name] = 0;
      }
    }

    res.json({
      workspace: ws.name,
      workspaceId: ws.id,
      tables: tableCounts,
      totalRows: Object.values(tableCounts).reduce((a, b) => a + b, 0),
      categories: Object.keys(EXPORT_CATEGORIES),
      exportedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get workspace info", details: error.message });
  }
});

export { router as exportRouter };
