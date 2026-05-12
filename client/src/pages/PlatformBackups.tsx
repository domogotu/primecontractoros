import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Download, FileText, Archive, HardDrive, Table2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DbInfo {
  tables: Record<string, number>;
  totalTables: number;
  totalRows: number;
  databaseSizeBytes: number;
  databaseSizeMB: string;
  exportedAt: string;
}

export default function PlatformBackups() {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/admin/info", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch database info");
      const data = await res.json();
      setDbInfo(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  const downloadFile = async (url: string, filename: string, exportKey: string) => {
    setExporting(exportKey);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toast({ title: "Export Complete", description: `Downloaded ${filename}` });
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const dateStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backups & Export</h1>
          <p className="text-muted-foreground mt-1">
            Full database backup and table-level export for data ownership and compliance
          </p>
        </div>
        <Button variant="outline" onClick={fetchInfo} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Database Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Overview
          </CardTitle>
          <CardDescription>Current database statistics and size information</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading database info...</div>
          ) : dbInfo ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{dbInfo.totalTables}</div>
                <div className="text-sm text-muted-foreground">Tables</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{dbInfo.totalRows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{dbInfo.databaseSizeMB} MB</div>
                <div className="text-sm text-muted-foreground">Database Size</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{new Date(dbInfo.exportedAt).toLocaleTimeString()}</div>
                <div className="text-sm text-muted-foreground">Last Checked</div>
              </div>
            </div>
          ) : (
            <div className="text-destructive">Failed to load database info</div>
          )}
        </CardContent>
      </Card>

      {/* Full Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Full Database Backup
          </CardTitle>
          <CardDescription>Export the entire database as a downloadable archive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">CSV Backup (Zipped)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All tables exported as individual CSV files in a single ZIP archive. Best for spreadsheet tools and data analysis.
              </p>
              <Button
                onClick={() => downloadFile("/api/export/admin/all-csv", `primecontractoros_full_backup_${dateStr}.zip`, "all-csv")}
                disabled={exporting === "all-csv"}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting === "all-csv" ? "Exporting..." : "Download CSV Backup"}
              </Button>
            </div>

            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">JSON Backup (Zipped)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All tables exported as individual JSON files in a single ZIP archive. Best for programmatic access and data migration.
              </p>
              <Button
                onClick={() => downloadFile("/api/export/admin/all-json", `primecontractoros_full_backup_${dateStr}.zip`, "all-json")}
                disabled={exporting === "all-json"}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting === "all-json" ? "Exporting..." : "Download JSON Backup"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Table Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5 text-primary" />
            Export Individual Tables
          </CardTitle>
          <CardDescription>Download specific tables as CSV or JSON files</CardDescription>
        </CardHeader>
        <CardContent>
          {dbInfo ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center font-semibold text-sm text-muted-foreground pb-2 border-b border-border sticky top-0 bg-card">
                <span>Table</span>
                <span className="text-center">Rows</span>
                <span className="text-center">CSV</span>
                <span className="text-center">JSON</span>
              </div>
              {Object.entries(dbInfo.tables)
                .sort(([, a], [, b]) => b - a)
                .map(([tableName, rowCount]) => (
                  <div key={tableName} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{tableName}</span>
                    </div>
                    <Badge variant="secondary" className="justify-center min-w-[60px]">
                      {rowCount.toLocaleString()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(`/api/export/admin/table/${tableName}`, `${tableName}_${dateStr}.csv`, `csv-${tableName}`)}
                      disabled={exporting === `csv-${tableName}` || rowCount === 0}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(`/api/export/admin/table/${tableName}/json`, `${tableName}_${dateStr}.json`, `json-${tableName}`)}
                      disabled={exporting === `json-${tableName}` || rowCount === 0}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-muted-foreground">Load database info to see available tables</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
