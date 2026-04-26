import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "sonner";
import { SystemProvider } from "@/context/SystemContext";
import OverviewPage from "@/pages/Overview";
import DispatchPage from "@/pages/Dispatch";
import ForecastingPage from "@/pages/Forecasting";
import DigitalTwinPage from "@/pages/DigitalTwin";
import GpuRoutingPage from "@/pages/GpuRouting";
import CarbonCreditsPage from "@/pages/CarbonCredits";
import AlertsPage from "@/pages/Alerts";
import ReportsPage from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={OverviewPage} />
      <Route path="/dispatch" component={DispatchPage} />
      <Route path="/forecasting" component={ForecastingPage} />
      <Route path="/digital-twin" component={DigitalTwinPage} />
      <Route path="/gpu-routing" component={GpuRoutingPage} />
      <Route path="/carbon-credits" component={CarbonCreditsPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <SystemProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#0F2040",
            border: "1px solid rgba(0,201,167,0.3)",
            color: "#F0F4FF",
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "13px",
          },
        }}
      />
    </SystemProvider>
  );
}

export default App;
