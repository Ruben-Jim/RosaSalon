import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
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

// Handle GitHub Pages redirect format (/?/path)
function useGitHubPagesRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const search = window.location.search;
    const pathname = window.location.pathname;
    
    // Check if we have the GitHub Pages redirect format: /?/path
    // The redirect script converts /RosaSalon/dashboard to /RosaSalon/?/dashboard
    if (search.startsWith('?/')) {
      const redirectPath = '/' + search.slice(2).replace(/~and~/g, '&').split('&')[0];
      setLocation(redirectPath);
      // Clean up the URL - remove the query parameter but keep the base path
      const basePath = pathname.split('/').slice(0, 2).join('/'); // Get /RosaSalon
      const newUrl = basePath + redirectPath + (window.location.hash || '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [setLocation]);
}

function Router() {
  useGitHubPagesRedirect();
  
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
