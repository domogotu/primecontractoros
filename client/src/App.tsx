import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import PlatformLogin from "./pages/PlatformLogin";
import PlatformRouter from "./pages/PlatformRouter";
import ProposalDetail from "./pages/ProposalDetail";
import ContractDetail from "./pages/ContractDetail";
import Onboarding from "./pages/Onboarding";
import BusinessProfile from "./pages/BusinessProfile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Clients from "./pages/Clients";
import Obligations from "./pages/Obligations";
import Deliverables from "./pages/Deliverables";
import Deadlines from "./pages/Deadlines";
import Compliance from "./pages/Compliance";
import Glossary from "./pages/Glossary";
import Support from "./pages/Support";
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
import Terms from "./pages/Terms";
import Documentation from "./pages/Documentation";
import PlatformCompliance from "./pages/PlatformCompliance";
import Security from "./pages/Security";
import AppShell from "./components/AppShell";

// Wrapper to render app pages inside AppShell
function withAppShell(Component: React.ComponentType) {
  return function WrappedWithAppShell() {
    return (
      <AppShell>
        <Component />
      </AppShell>
    );
  };
}

function Router() {
  return (
    <Switch>
      {/* Public pages - no sidebar, no auth required */}
      <Route path={"/"} component={Home} />
      <Route path={"/features"} component={Features} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/help"} component={Help} />
      <Route path={"/glossary"} component={Glossary} />
      <Route path={"/support"} component={Support} />
      <Route path={"/get-started"} component={GetStarted} />
      <Route path={"/login"} component={Login} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/platform-compliance"} component={PlatformCompliance} />
      <Route path={"/security"} component={Security} />
      
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
      <Route path={"/app/opportunities/:id"} component={withAppShell(OpportunityDetail)} />
      <Route path={"/app/proposals"} component={withAppShell(Proposals)} />
      <Route path={"/app/proposals/:id"} component={withAppShell(ProposalDetail)} />
      <Route path={"/app/proposal-frameworks"} component={withAppShell(ProposalFrameworkSelector)} />
      <Route path={"/app/contracts"} component={withAppShell(Contracts)} />
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
      <Route path={"/app/obligations"} component={withAppShell(Obligations)} />
      <Route path={"/app/deliverables"} component={withAppShell(Deliverables)} />
      <Route path={"/app/deadlines"} component={withAppShell(Deadlines)} />
      <Route path={"/app/compliance"} component={withAppShell(Compliance)} />
      
      {/* User Setup & Profile pages */}
      <Route path={"/app/business-profile"} component={withAppShell(BusinessProfile)} />
      <Route path={"/app/profile"} component={withAppShell(UserProfile)} />
      <Route path={"/app/settings"} component={withAppShell(Settings)} />
      <Route path={"/app/billing"} component={withAppShell(Billing)} />
      <Route path={"/app/users"} component={withAppShell(Users)} />
      <Route path={"/app/alerts"} component={withAppShell(Alerts)} />
      <Route path={"/app/tasks"} component={withAppShell(Tasks)} />
      
      {/* Contract Hub, AI, and Learning pages */}
      <Route path={"/app/contracts/:id/hub"} component={withAppShell(ContractHub)} />
      <Route path={"/app/reports"} component={withAppShell(Reports)} />
      <Route path={"/app/capability-statements"} component={withAppShell(CapabilityStatements)} />
      <Route path={"/app/templates"} component={withAppShell(Templates)} />
      <Route path={"/app/contracts/:id/closeout"} component={withAppShell(Closeout)} />
      <Route path={"/app/proposals/:id/loss-review"} component={withAppShell(LossReview)} />
      <Route path={"/app/lessons"} component={withAppShell(LessonsLearned)} />
      <Route path={"/app/ai-findings"} component={withAppShell(AIFindings)} />
      
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
