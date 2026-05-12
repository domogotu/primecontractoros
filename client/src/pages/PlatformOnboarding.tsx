import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, Send, CheckCircle, AlertCircle, ExternalLink, Users, Clock, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PlatformOnboardingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"send" | "monitor">("monitor");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const sendLink = trpc.platformAdmin.onboarding.sendLink.useMutation({
    onSuccess: () => {
      setSuccessEmail(email);
      setEmail("");
      setName("");
      setErrorMsg(null);
      toast.success("Onboarding link sent successfully");
    },
    onError: (err: { message: string }) => {
      setErrorMsg(err.message);
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSuccessEmail(null);
    setErrorMsg(null);
    sendLink.mutate({ recipientEmail: email.trim(), recipientName: name.trim() || undefined });
  };

  // Mock onboarding progress data for monitoring dashboard
  const onboardingUsers = [
    { id: 1, name: "Sarah Johnson", email: "sarah@example.com", invitedAt: "2026-05-01", status: "completed", stepsCompleted: 5, totalSteps: 5, lastActivity: "2026-05-03" },
    { id: 2, name: "Mike Chen", email: "mike@example.com", invitedAt: "2026-05-05", status: "in_progress", stepsCompleted: 3, totalSteps: 5, lastActivity: "2026-05-10" },
    { id: 3, name: "Lisa Park", email: "lisa@example.com", invitedAt: "2026-05-08", status: "in_progress", stepsCompleted: 1, totalSteps: 5, lastActivity: "2026-05-08" },
    { id: 4, name: "Tom Wilson", email: "tom@example.com", invitedAt: "2026-05-10", status: "stuck", stepsCompleted: 2, totalSteps: 5, lastActivity: "2026-05-10" },
    { id: 5, name: "Amy Davis", email: "amy@example.com", invitedAt: "2026-05-11", status: "not_started", stepsCompleted: 0, totalSteps: 5, lastActivity: "\u2014" },
  ];

  const filteredUsers = onboardingUsers.filter(u => {
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: onboardingUsers.length,
    completed: onboardingUsers.filter(u => u.status === "completed").length,
    inProgress: onboardingUsers.filter(u => u.status === "in_progress").length,
    stuck: onboardingUsers.filter(u => u.status === "stuck").length,
    notStarted: onboardingUsers.filter(u => u.status === "not_started").length,
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    stuck: "bg-red-100 text-red-700",
    not_started: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">Onboarding Management</h1>
        <p className="text-gray-600">Send onboarding links and monitor user progress</p>
      </div>

      <div className="p-4 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Invited</p></CardContent></Card>
          <Card className="border-l-4 border-l-green-500"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.completed}</p><p className="text-xs text-gray-500">Completed</p></CardContent></Card>
          <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p><p className="text-xs text-gray-500">In Progress</p></CardContent></Card>
          <Card className="border-l-4 border-l-red-500"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.stuck}</p><p className="text-xs text-gray-500">Stuck</p></CardContent></Card>
          <Card className="border-l-4 border-l-gray-400"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p><p className="text-xs text-gray-500">Not Started</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === "monitor" ? "default" : "outline"} onClick={() => setActiveTab("monitor")} className={activeTab === "monitor" ? "bg-blue-900 hover:bg-blue-800" : ""}>
            <BarChart3 className="w-4 h-4 mr-2" /> Monitor Progress
          </Button>
          <Button variant={activeTab === "send" ? "default" : "outline"} onClick={() => setActiveTab("send")} className={activeTab === "send" ? "bg-blue-900 hover:bg-blue-800" : ""}>
            <Send className="w-4 h-4 mr-2" /> Send Invite
          </Button>
        </div>

        {activeTab === "send" && (
          <div className="max-w-2xl">
            {/* Onboarding page preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Onboarding Guide URL</p>
                <a href="https://reedssolutionsllc.org/onboarding" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">https://reedssolutionsllc.org/onboarding</a>
                <p className="text-xs text-blue-700 mt-1">This page is not linked from the main navigation — only accessible via direct URL or this email.</p>
              </div>
            </div>

            {successEmail && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Email sent successfully</p>
                  <p className="text-sm text-green-700">Onboarding link sent to <strong>{successEmail}</strong></p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Failed to send email</p>
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Recipient Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Recipient Email <span className="text-red-500">*</span></label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="employee@example.com" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <Button type="submit" disabled={sendLink.isPending || !email.trim()} className="w-full bg-blue-900 hover:bg-blue-800">
                {sendLink.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Onboarding Email</>}
              </Button>
            </form>

            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">What the email includes</h2>
              <ul className="space-y-2">
                {["Welcome message addressed to the recipient by name", "Button linking to the onboarding guide (reedssolutionsllc.org/onboarding)", "Button linking to the PrimeContractorOS login page", "Support contact information", "Reed's Solutions LLC branding and footer"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "monitor" && (
          <>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="stuck">Stuck</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invited</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Activity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.invitedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(user.stepsCompleted / user.totalSteps) * 100}%` }} /></div>
                          <span className="text-xs text-gray-500">{user.stepsCompleted}/{user.totalSteps}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge className={statusColors[user.status]}>{user.status.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.lastActivity}</td>
                      <td className="px-4 py-3">
                        {user.status === "stuck" && <Button size="sm" variant="outline" onClick={() => toast.info("Reminder sent to " + user.email)} className="text-xs"><Mail className="w-3 h-3 mr-1" /> Nudge</Button>}
                        {user.status === "not_started" && <Button size="sm" variant="outline" onClick={() => toast.info("Resent invite to " + user.email)} className="text-xs"><Send className="w-3 h-3 mr-1" /> Resend</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-500">No users match the current filters.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
