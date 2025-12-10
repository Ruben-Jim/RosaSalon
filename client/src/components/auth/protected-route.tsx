import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  const { data: auth, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      return res.json();
    },
  });

  useEffect(() => {
    if (!isLoading && !auth?.authenticated) {
      setLocation("/login");
    }
  }, [auth, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!auth?.authenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}

