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
import AIConfirmationWorkspace from "./pages/AIConfirmationWorkspace";
import Reports from "./pages/Reports";
import CapabilityStatements from "./pages/CapabilityStatements";
import Templates from "./pages/Templates";
import Closeout from "./pages/Closeout";
import LossReview from "./pages/LossReview";
import LessonsLearned from "./pages/LessonsLearned";
import PlatformLogin from "./pages/PlatformLogin";
import PlatformRouter from "./pages/PlatformRouter";
import ProposalDetail from "./pages/ProposalDetail";
import ContractDetail from "./pages/ContractDetail";
import Onboarding from "./pages/Onboarding";
import BusinessProfile from "./pages/BusinessProfile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path={"/"} component={Home} />
      <Route path={"/features"} component={Features} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/help"} component={Help} />
      <Route path={"/get-started"} component={GetStarted} />
      <Route path={"/login"} component={Login} />
      
      {/* Post-login routes */}
      <Route path={"/app"} component={AppRouter} />
      <Route path={"/app/dashboard"} component={Dashboard} />
      
      {/* Platform Owner pages */}
      <Route path={"/platform/login"} component={PlatformLogin} />
      <Route path={"/platform*"} component={PlatformRouter} />
      
      {/* Workflow pages */}
      <Route path={"/app/opportunities"} component={Opportunities} />
      <Route path={"/app/opportunities/:id"} component={OpportunityDetail} />
      <Route path={"/app/proposals"} component={Proposals} />
      <Route path={"/app/proposals/:id"} component={ProposalDetail} />
      <Route path={"/app/proposal-frameworks"} component={ProposalFrameworkSelector} />
      <Route path={"/app/contracts"} component={Contracts} />
      <Route path={"/app/contracts/:id"} component={ContractDetail} />
      
      {/* Active operations pages */}
      <Route path={"/app/files"} component={Files} />
      <Route path={"/app/contacts"} component={Contacts} />
      <Route path={"/app/messages"} component={Messages} />
      <Route path={"/app/invoices"} component={Invoices} />
      <Route path={"/app/payments"} component={Payments} />
      <Route path={"/app/finance"} component={Finance} />
      
      {/* User Setup & Profile pages */}
      <Route path={"/app/onboarding"} component={Onboarding} />
      <Route path={"/app/business-profile"} component={BusinessProfile} />
      <Route path={"/app/profile"} component={UserProfile} />
      <Route path={"/app/settings"} component={Settings} />
      <Route path={"/app/subscription"} component={Subscription} />
      
      {/* Contract Hub, AI, and Learning pages */}
      <Route path={"/app/contracts/:id/hub"} component={ContractHub} />
      <Route path={"/app/contracts/:id/ai-confirmation"} component={AIConfirmationWorkspace} />
      <Route path={"/app/reports"} component={Reports} />
      <Route path={"/app/capability-statements"} component={CapabilityStatements} />
      <Route path={"/app/templates"} component={Templates} />
      <Route path={"/app/contracts/:id/closeout"} component={Closeout} />
      <Route path={"/app/proposals/:id/loss-review"} component={LossReview} />
      <Route path={"/app/lessons"} component={LessonsLearned} />
      
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
