import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Dashboard from "@/pages/dashboard";
import Messages from "@/pages/messages";
import CustomerMessages from "@/pages/customer-messages";
import Login from "@/pages/login";
import Navbar from "@/components/layout/navbar";
import ProtectedRoute from "@/components/auth/protected-route";

// Get base path from Vite's import.meta.env.BASE_URL
// Vite automatically sets this based on the base config in vite.config.ts
const basePath = import.meta.env.BASE_URL || "/";

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route path="/login" component={Login} />
        <Route path="/customer-messages" component={CustomerMessages} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/messages">
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
