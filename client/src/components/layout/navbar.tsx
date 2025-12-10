import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auth } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      return res.json();
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const getNavLinks = () => {
    const publicLinks = [
      { href: "/", label: "Home" },
      { href: "/booking", label: "Book Now" },
      { href: "/customer-messages", label: "Messages" },
    ];
    
    if (auth?.authenticated) {
      return [
        { href: "/", label: "Home" },
        { href: "/booking", label: "Book Now" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/messages", label: "Admin Messages" },
      ];
    }
    
    return publicLinks;
  };

  const navLinks = getNavLinks();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="glass-effect border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-serif font-bold text-primary cursor-pointer">
                Bella Beauty
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {auth?.authenticated ? (
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button className="btn-primary">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {auth?.authenticated ? (
                    <Button onClick={handleLogout} variant="outline" size="sm" className="mt-4">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button className="btn-primary mt-4 w-full" onClick={() => setIsOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
