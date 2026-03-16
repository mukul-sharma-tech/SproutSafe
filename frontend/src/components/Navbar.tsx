import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sprout, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSignInClick?: (tab: "login" | "signup") => void;
}

export const Navbar = ({ onSignInClick }: NavbarProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const token = localStorage.getItem("token") || null;

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const section = document.getElementById(sectionId);
      if (section) window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
      setIsMenuOpen(false);
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  const navLinks = [
    { label: "Features", action: () => scrollToSection("features") },
    { label: "How It Works", action: () => scrollToSection("how-it-works") },
    { label: "Pricing", action: () => scrollToSection("pricing") },
    { label: "FAQ", action: () => scrollToSection("faq") },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Sprout className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">CyberNest</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              {link.label}
            </button>
          ))}
          <Link to="/contact" className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent">
            Contact
          </Link>
          {token && (
            <Link to="/dashboard" className="px-3.5 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5">
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />
          {!token ? (
            onSignInClick && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onSignInClick("login")}>Sign In</Button>
                <Button size="sm" className="shadow-sm" onClick={() => onSignInClick("signup")}>Get Started</Button>
              </>
            )
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />Logout
            </Button>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <button key={link.label} onClick={link.action} className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">
              {link.label}
            </button>
          ))}
          {token ? (
            <Link to="/dashboard" className="block px-3 py-2.5 text-sm font-medium text-primary rounded-lg hover:bg-primary/5">Dashboard</Link>
          ) : onSignInClick ? (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onSignInClick("login")}>Sign In</Button>
              <Button size="sm" className="flex-1" onClick={() => onSignInClick("signup")}>Get Started</Button>
            </div>
          ) : null}
          <div className="pt-2 flex items-center gap-2">
            <ModeToggle />
            {token && (
              <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1.5" />Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

