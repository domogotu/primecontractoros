import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { KeyboardShortcutProvider } from "./contexts/KeyboardShortcutContext";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Help from "./pages/Help";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import AppRouter from "./pages/AppRouter";
import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Proposals from "./pages/Proposals";
import ProposalFrameworkSelector from "./pages/ProposalFrameworkSelector";
import Contracts from "./pages/Contracts";
import Files from "./pages/Files";
import Contacts from "./pages/Contacts";
import Messages from "./pages/Messages";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Finance from "./pages/Finance";
import ContractHub from "./pages/ContractHub";
import Reports from "./pages/Reports";
import CapabilityStatements from "./pages/CapabilityStatements";
import Templates from "./pages/Templates";
import Closeout from "./pages/Closeout";
import LossReview from "./pages/LossReview";
import LessonsLearned from "./pages/LessonsLearned";
import AIFindings from "./pages/AIFindings";
import AISuggestions from "./pages/AISuggestions";
import AIRuns from "./pages/AIRuns";
import AuditLog from "./pages/AuditLog";
import NotificationsCenter from "./pages/NotificationsCenter";
import PlatformLogin from "./pages/PlatformLogin";
import PlatformRouter from "./pages/PlatformRouter";
import ProposalDetail from "./pages/ProposalDetail";
import ContractDetail from "./pages/ContractDetail";
import Onboarding from "./pages/Onboarding";
import BusinessProfile from "./pages/BusinessProfile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import WorkspaceExport from "./pages/WorkspaceExport";
import Billing from "./pages/Billing";
import Clients from "./pages/Clients";
import Obligations from "./pages/Obligations";
import Deliverables from "./pages/Deliverables";
import Deadlines from "./pages/Deadlines";
import Compliance from "./pages/Compliance";
import Glossary from "./pages/Glossary";
import Support from "./pages/Support";
import CustomerSupport from "./pages/CustomerSupport";
import CustomerSupportDetail from "./pages/CustomerSupportDetail";
import Users from "./pages/Users";
import Alerts from "./pages/Alerts";
import Tasks from "./pages/Tasks";
import FileDetail from "./pages/FileDetail";
import ContactDetail from "./pages/ContactDetail";
import MessageDetail from "./pages/MessageDetail";
import InvoiceDetail from "./pages/InvoiceDetail";
import PaymentDetail from "./pages/PaymentDetail";
// New content pages
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import Privacy from "./pages/Privacy";
import Subcontractors from "./pages/Subcontractors";
import Vendors from "./pages/Vendors";
import Invites from "./pages/Invites";
import Diagnostics from "./pages/Diagnostics";
import DocumentGeneration from "./pages/DocumentGeneration";
import FlowdownReview from "./pages/FlowdownReview";
import CustomerAdoption from "./pages/CustomerAdoption";
import Handbook from "./pages/Handbook";
import ChangeManagement from "./pages/ChangeManagement";
import Requirements from "./pages/Requirements";
import AIContractReview from "./pages/AIContractReview";
import FarReference from "./pages/FarReference";
import AlertsAndTasks from "./pages/AlertsAndTasks";
import CommunicationLog from "./pages/CommunicationLog";
import PlanFeatures from "./pages/PlanFeatures";
import EmailTemplates from "./pages/EmailTemplates";
import ConsistencyCheck from "./pages/ConsistencyCheck";
import ExternalViewer from "./pages/ExternalViewer";
import DocumentVersions from "./pages/DocumentVersions";
import LegalPages from "./pages/LegalPages";
import Terms from "./pages/Terms";
import Documentation from "./pages/Documentation";
import PlatformCompliance from "./pages/PlatformCompliance";
import Security from "./pages/Security";
import AppShell from "./components/AppShell";
import AdminBadge from "./components/AdminBadge";
import ConsentBanner from "./components/ConsentBanner";
import ContractHubDetail from "./pages/ContractHubDetail";
import AIConfirmation from "./pages/AIConfirmation";
import ContractCloseout from "./pages/ContractCloseout";
import Webhooks from "./pages/Webhooks";
import WorkspaceTeam from "./pages/WorkspaceTeam";
import EmailNotificationPreferences from "./pages/EmailNotificationPreferences";
import SAMSearch from "./pages/SAMSearch";
import RateParityDashboard from "./pages/RateParityDashboard";
import Training from "./pages/Training";
import Subscription from "./pages/Subscription";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Reconciliation from "./pages/Reconciliation";
import InviteAccept from "./pages/InviteAccept";

// Wrapper to render app pages inside AppShell with per-route error boundary
function withAppShell(Component: React.ComponentType) {
  return function WrappedWithAppShell() {
    const [location] = useLocation();
    return (
      <AppShell>
        <ErrorBoundary fallbackKey={location}>
          <Component />
        </ErrorBoundary>
      </AppShell>
    );
  };
}

function Router() {
  return (
    <Switch>
      {/* Public pages - no sidebar, no auth required */}
      <Route path={"/"} component={Home} />
      <Route path={"/home"} component={Home} />
      <Route path={"/features"} component={Features} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/help"} component={Help} />
      <Route path={"/help-center"} component={Help} />
      <Route path={"/glossary"} component={Glossary} />
      <Route path={"/support"} component={Support} />
      <Route path={"/get-started"} component={GetStarted} />
      <Route path={"/checkout/success"} component={CheckoutSuccess} />
      <Route path={"/login"} component={Login} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/platform-compliance"} component={PlatformCompliance} />
      <Route path={"/security"} component={Security} />
      
      {/* Invite accept - public-ish route (needs auth to accept) */}
      <Route path="/invite/accept/:token" component={InviteAccept} />

      {/* Platform Owner pages - has its own sidebar via PlatformRouter */}
      <Route path={"/platform/login"} component={PlatformLogin} />
      <Route path={"/platform"} component={PlatformRouter} />
      <Route path={"/platform/*"} component={PlatformRouter} />
      
      {/* App routes - all wrapped with AppShell (sidebar + auth) */}
      <Route path={"/app"} component={withAppShell(AppRouter)} />
      <Route path={"/app/dashboard"} component={withAppShell(Dashboard)} />
      <Route path={"/app/onboarding"} component={withAppShell(Onboarding)} />
      
      {/* Workflow pages */}
      <Route path={"/app/opportunities"} component={withAppShell(Opportunities)} />
      <Route path={"/app/sam-search"} component={withAppShell(SAMSearch)} />
      <Route path={"/app/opportunities/:id"} component={withAppShell(OpportunityDetail)} />
      <Route path={"/app/proposals"} component={withAppShell(Proposals)} />
      <Route path={"/app/proposals/:id"} component={withAppShell(ProposalDetail)} />
      <Route path={"/app/proposal-frameworks"} component={withAppShell(ProposalFrameworkSelector)} />
      <Route path={"/app/contracts"} component={withAppShell(Contracts)} />
      <Route path={"/app/contracts/:id/hub"} component={withAppShell(ContractHubDetail)} />
      <Route path={"/app/contracts/:id/ai-confirmation"} component={withAppShell(AIConfirmation)} />
      <Route path={"/app/contracts/:id/closeout"} component={withAppShell(ContractCloseout)} />
      <Route path={"/app/contracts/:id"} component={withAppShell(ContractDetail)} />
      
      {/* Active operations pages */}
      <Route path={"/app/clients"} component={withAppShell(Clients)} />
      <Route path={"/app/files"} component={withAppShell(Files)} />
      <Route path={"/app/files/:id"} component={withAppShell(FileDetail)} />
      <Route path={"/app/contacts"} component={withAppShell(Contacts)} />
      <Route path={"/app/contacts/:id"} component={withAppShell(ContactDetail)} />
      <Route path={"/app/messages"} component={withAppShell(Messages)} />
      <Route path={"/app/messages/:id"} component={withAppShell(MessageDetail)} />
      <Route path={"/app/invoices"} component={withAppShell(Invoices)} />
      <Route path={"/app/invoices/:id"} component={withAppShell(InvoiceDetail)} />
      <Route path={"/app/payments"} component={withAppShell(Payments)} />
      <Route path={"/app/payments/:id"} component={withAppShell(PaymentDetail)} />
      <Route path={"/app/finance"} component={withAppShell(Finance)} />
      <Route path={"/app/reconciliation"} component={withAppShell(Reconciliation)} />
      <Route path={"/app/obligations"} component={withAppShell(Obligations)} />
      <Route path={"/app/deliverables"} component={withAppShell(Deliverables)} />
      <Route path={"/app/deadlines"} component={withAppShell(Deadlines)} />
      <Route path={"/app/compliance"} component={withAppShell(Compliance)} />
      <Route path={"/app/rate-parity"} component={withAppShell(RateParityDashboard)} />
      <Route path={"/app/training"} component={withAppShell(Training)} />
      
      <Route path={"/app/requirements"} component={withAppShell(Requirements)} />
      <Route path={"/app/far-reference"} component={withAppShell(FarReference)} />
      <Route path={"/app/ai-contract-review"} component={withAppShell(AIContractReview)} />
      <Route path={"/app/alerts-tasks"} component={withAppShell(AlertsAndTasks)} />
      <Route path={"/app/communication-log"} component={withAppShell(CommunicationLog)} />

      {/* User Setup & Profile pages */}
      <Route path={"/app/business-profile"} component={withAppShell(BusinessProfile)} />
      <Route path={"/app/profile"} component={withAppShell(UserProfile)} />
      <Route path={"/app/account-settings"} component={withAppShell(UserProfile)} />
      <Route path={"/app/settings"} component={withAppShell(Settings)} />
      <Route path={"/app/webhooks"} component={withAppShell(Webhooks)} />
      <Route path={"/app/team"} component={withAppShell(WorkspaceTeam)} />
      <Route path={"/app/notification-preferences"} component={withAppShell(EmailNotificationPreferences)} />
      <Route path={"/app/export"} component={withAppShell(WorkspaceExport)} />
      <Route path={"/app/billing"} component={withAppShell(Billing)} />
      <Route path={"/app/support/:id"} component={withAppShell(CustomerSupportDetail)} />
      <Route path={"/app/support"} component={withAppShell(CustomerSupport)} />
      <Route path={"/app/users"} component={withAppShell(Users)} />
      <Route path={"/app/alerts"} component={withAppShell(Alerts)} />
      <Route path={"/app/tasks"} component={withAppShell(Tasks)} />
      
      {/* Contract Hub, AI, and Learning pages */}
      <Route path={"/app/contract-hub"} component={withAppShell(ContractHub)} />
      <Route path={"/app/reports"} component={withAppShell(Reports)} />
      <Route path={"/app/capability-statements"} component={withAppShell(CapabilityStatements)} />
      <Route path={"/app/templates"} component={withAppShell(Templates)} />
      <Route path={"/app/closeout"} component={withAppShell(Closeout)} />
      <Route path={"/app/proposals/:id/loss-review"} component={withAppShell(LossReview)} />
      <Route path={"/app/lessons-learned"} component={withAppShell(LessonsLearned)} />
      <Route path={"/app/lessons"} component={withAppShell(LessonsLearned)} />
      <Route path={"/app/loss-review"} component={withAppShell(LossReview)} />
      <Route path={"/app/ai-findings"} component={withAppShell(AIFindings)} />
      
      {/* Batch 1-4: Product Completion Routes */}
      <Route path={"/app/subcontractors"} component={withAppShell(Subcontractors)} />
      <Route path={"/app/vendors"} component={withAppShell(Vendors)} />
      <Route path={"/app/invites"} component={withAppShell(Invites)} />
      <Route path={"/app/diagnostics"} component={withAppShell(Diagnostics)} />
      <Route path={"/app/document-generation"} component={withAppShell(DocumentGeneration)} />
      <Route path={"/app/flowdown-review"} component={withAppShell(FlowdownReview)} />
      <Route path={"/app/customer-adoption"} component={withAppShell(CustomerAdoption)} />
      <Route path={"/app/handbook"} component={withAppShell(Handbook)} />
      <Route path={"/app/change-management"} component={withAppShell(ChangeManagement)} />
      <Route path={"/app/plan-features"} component={withAppShell(PlanFeatures)} />
      <Route path={"/app/email-templates"} component={withAppShell(EmailTemplates)} />
      <Route path={"/app/consistency-check"} component={withAppShell(ConsistencyCheck)} />
      <Route path={"/app/external-viewers"} component={withAppShell(ExternalViewer)} />
      <Route path={"/app/document-versions"} component={withAppShell(DocumentVersions)} />
      <Route path={"/app/subscription"} component={withAppShell(Subscription)} />
      <Route path={"/app/user-profile"} component={withAppShell(UserProfile)} />
      <Route path={"/legal"} component={LegalPages} />
      <Route path={"/app/ai-suggestions"} component={withAppShell(AISuggestions)} />
      <Route path={"/app/ai-runs"} component={withAppShell(AIRuns)} />
      <Route path={"/app/audit-log"} component={withAppShell(AuditLog)} />
      <Route path={"/app/notifications"} component={withAppShell(NotificationsCenter)} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <KeyboardShortcutProvider>
            <Toaster />
            <AdminBadge />
            <ConsentBanner />
            <Router />
          </KeyboardShortcutProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
