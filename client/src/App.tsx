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
      
      {/* Workflow pages */}
      <Route path={"/app/opportunities"} component={Opportunities} />
      <Route path={"/app/opportunities/:id"} component={OpportunityDetail} />
      <Route path={"/app/proposals"} component={Proposals} />
      <Route path={"/app/proposal-frameworks"} component={ProposalFrameworkSelector} />
      <Route path={"/app/contracts"} component={Contracts} />
      
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
