import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, FileText, Briefcase, FolderOpen, Users,
  Receipt, Settings, BarChart3, Shield, BookOpen, Zap,
  Home, CheckSquare, ArrowRight, Command
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: "navigate" | "create" | "action";
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export default function CommandPalette({ open, onClose, onOpenSearch }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "nav-dashboard", label: "Go to Dashboard", icon: <Home className="h-4 w-4" />, action: () => { navigate("/app"); onClose(); }, category: "navigate", keywords: ["home", "main"] },
    { id: "nav-opportunities", label: "Go to Opportunities", icon: <Briefcase className="h-4 w-4" />, action: () => { navigate("/app/opportunities"); onClose(); }, category: "navigate", keywords: ["opp", "pipeline"] },
    { id: "nav-proposals", label: "Go to Proposals", icon: <FileText className="h-4 w-4" />, action: () => { navigate("/app/proposals"); onClose(); }, category: "navigate", keywords: ["prop", "bid"] },
    { id: "nav-contracts", label: "Go to Contracts", icon: <FolderOpen className="h-4 w-4" />, action: () => { navigate("/app/contracts"); onClose(); }, category: "navigate", keywords: ["contract", "award"] },
    { id: "nav-files", label: "Go to Files", icon: <FileText className="h-4 w-4" />, action: () => { navigate("/app/files"); onClose(); }, category: "navigate", keywords: ["document", "upload"] },
    { id: "nav-contacts", label: "Go to Contacts", icon: <Users className="h-4 w-4" />, action: () => { navigate("/app/contacts"); onClose(); }, category: "navigate", keywords: ["people", "team"] },
    { id: "nav-invoices", label: "Go to Invoices", icon: <Receipt className="h-4 w-4" />, action: () => { navigate("/app/invoices"); onClose(); }, category: "navigate", keywords: ["billing", "payment"] },
    { id: "nav-tasks", label: "Go to Tasks", icon: <CheckSquare className="h-4 w-4" />, action: () => { navigate("/app/tasks"); onClose(); }, category: "navigate", keywords: ["todo", "action"] },
    { id: "nav-compliance", label: "Go to Compliance", icon: <Shield className="h-4 w-4" />, action: () => { navigate("/app/compliance"); onClose(); }, category: "navigate", keywords: ["far", "regulation"] },
    { id: "nav-reports", label: "Go to Reports", icon: <BarChart3 className="h-4 w-4" />, action: () => { navigate("/app/reports"); onClose(); }, category: "navigate", keywords: ["analytics", "metrics"] },
    { id: "nav-rate-parity", label: "Go to Rate Parity", icon: <Zap className="h-4 w-4" />, action: () => { navigate("/app/rate-parity"); onClose(); }, category: "navigate", keywords: ["rates", "variance"] },
    { id: "nav-settings", label: "Go to Settings", icon: <Settings className="h-4 w-4" />, action: () => { navigate("/app/settings"); onClose(); }, category: "navigate", keywords: ["config", "preferences"] },

    // Create actions
    { id: "create-opportunity", label: "Create New Opportunity", description: "Start tracking a new opportunity", icon: <Plus className="h-4 w-4 text-blue-500" />, action: () => { navigate("/app/opportunities?create=true"); onClose(); }, category: "create", keywords: ["new", "add"] },
    { id: "create-proposal", label: "Create New Proposal", description: "Start a new proposal", icon: <Plus className="h-4 w-4 text-purple-500" />, action: () => { navigate("/app/proposals?create=true"); onClose(); }, category: "create", keywords: ["new", "add", "bid"] },
    { id: "create-contract", label: "Create New Contract", description: "Add a new contract", icon: <Plus className="h-4 w-4 text-green-500" />, action: () => { navigate("/app/contracts?create=true"); onClose(); }, category: "create", keywords: ["new", "add", "award"] },
    { id: "create-invoice", label: "Create New Invoice", description: "Generate a new invoice", icon: <Plus className="h-4 w-4 text-emerald-500" />, action: () => { navigate("/app/invoices?create=true"); onClose(); }, category: "create", keywords: ["new", "add", "bill"] },
    { id: "create-task", label: "Create New Task", description: "Add a task to your list", icon: <Plus className="h-4 w-4 text-indigo-500" />, action: () => { navigate("/app/tasks?create=true"); onClose(); }, category: "create", keywords: ["new", "add", "todo"] },

    // Actions
    { id: "action-search", label: "Smart Search", description: "Search across all records and SAM.gov", icon: <Search className="h-4 w-4 text-amber-500" />, action: () => { onClose(); onOpenSearch(); }, category: "action", keywords: ["find", "lookup"] },
    { id: "action-sam", label: "Search SAM.gov", description: "Find opportunities on SAM.gov", icon: <Search className="h-4 w-4 text-blue-500" />, action: () => { navigate("/app/sam-search"); onClose(); }, category: "action", keywords: ["government", "federal"] },
    { id: "action-help", label: "Open Help", description: "View documentation and guides", icon: <BookOpen className="h-4 w-4 text-gray-500" />, action: () => { navigate("/help"); onClose(); }, category: "action", keywords: ["docs", "guide", "support"] },
  ], [navigate, onClose, onOpenSearch]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = { navigate: [], create: [], action: [] };
    filteredCommands.forEach(cmd => {
      groups[cmd.category]?.push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  let runningIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Command className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, items]) => {
            if (items.length === 0) return null;
            const categoryLabels: Record<string, string> = {
              navigate: "Navigation",
              create: "Create",
              action: "Actions",
            };
            return (
              <div key={category}>
                <div className="px-4 py-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </p>
                </div>
                {items.map((cmd) => {
                  const currentIndex = runningIndex++;
                  return (
                    <div
                      key={cmd.id}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                        currentIndex === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      {cmd.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-xs text-muted-foreground">{cmd.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No commands found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>⌘K to open</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
