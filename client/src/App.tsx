import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <>
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
    </>
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
