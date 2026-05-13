import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Database, FileText, HardDrive, RefreshCw, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageGuide from "@/components/PageGuide";
import PageLayout from "@/components/PageLayout";

interface WorkspaceInfo {
  workspace: string;
  workspaceId: number;
  tables: Record<string, number>;
  totalRows: number;
  categories: string[];
  exportedAt: string;
}

export default function WorkspaceExport() {
  const [info, setInfo] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/workspace/info", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          toast({ title: "No Workspace", description: "You don't have a workspace yet. Create one first.", variant: "destructive" });
          setInfo(null);
          return;
        }
        throw new Error("Failed to fetch workspace info");
      }
      const data = await res.json();
      setInfo(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/workspace?category=${category}&format=${format}`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `workspace_${category}_export_${dateStr}.zip`;
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
      setExporting(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    all: "All Records",
    contracts: "Contracts Only",
    finance: "Finance Only",
    contacts: "Contacts Only",
  };

  const categoryDescriptions: Record<string, string> = {
    all: "Opportunities, proposals, contracts, invoices, payments, files, contacts, messages, tasks, alerts, deliverables, deadlines, obligations, compliance items, notes, closeout records, lessons learned, subcontractors, vendors, and more",
    contracts: "Contracts, deliverables, deadlines, obligations, compliance items, closeout records, lessons learned, flowdown reviews",
    finance: "Invoices, payments",
    contacts: "Contacts, subcontractors, vendors",
  };

  return (
    <PageLayout
        label="Administration"
        title="Data Export"
        subtitle="Export your workspace data including contracts, invoices, contacts, and more."
      >
      <PageGuide
        title="Export My Data"
        description="Download your workspace data for backup, compliance, or migration. All exports are scoped to your workspace only."
        whenToUse="When you need a local copy of your data for compliance audits, backups, or migrating to another system."
        whatToDoNext={["Select a data category to export", "Choose CSV or JSON format", "Download and store securely"]}
        relatedRecords={[{ label: "Settings", path: "/app/settings" }, { label: "Business Profile", path: "/app/business-profile" }]}
      />

      {/* Workspace Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Workspace Data Summary
          </CardTitle>
          <CardDescription>
            {info ? `Data overview for "${info.workspace}"` : "Loading workspace data..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading workspace data...
            </div>
          ) : info ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{Object.keys(info.tables).length}</div>
                  <div className="text-sm text-muted-foreground">Data Tables</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{info.totalRows.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold">{new Date(info.exportedAt).toLocaleTimeString()}</div>
                  <div className="text-sm text-muted-foreground">Last Checked</div>
                </div>
              </div>

              {/* Table breakdown */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Records by Table</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {Object.entries(info.tables)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-secondary/30">
                        <span className="font-mono text-xs">{name}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  {Object.values(info.tables).every(c => c === 0) && (
                    <div className="col-span-full text-muted-foreground text-sm">No records found in your workspace</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No workspace found. Create a workspace first to export data.</div>
          )}
        </CardContent>
      </Card>

      {/* Export Configuration */}
      {info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Export Configuration
            </CardTitle>
            <CardDescription>Choose what data to export and in what format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {categoryDescriptions[category]}
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet-friendly)</SelectItem>
                    <SelectItem value="json">JSON (Developer-friendly)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {format === "csv"
                    ? "Each table exported as a .csv file — opens in Excel, Google Sheets, etc."
                    : "Each table exported as a .json file — ideal for data migration or API import."}
                </p>
              </div>
            </div>

            {/* Export Preview */}
            <div className="p-4 border border-border rounded-lg bg-secondary/30 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export Preview
              </h4>
              <div className="text-sm text-muted-foreground">
                <strong>Category:</strong> {categoryLabels[category]} &bull;{" "}
                <strong>Format:</strong> {format.toUpperCase()} &bull;{" "}
                <strong>Output:</strong> ZIP archive with one {format.toUpperCase()} file per table + metadata
              </div>
            </div>

            {/* Download Button */}
            <Button
              size="lg"
              onClick={handleExport}
              disabled={exporting || info.totalRows === 0}
              className="w-full md:w-auto"
            >
              {exporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Export
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchInfo} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>
    
      </PageLayout>
  );
}
