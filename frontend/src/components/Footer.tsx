import { Link, useLocation } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="relative border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3 group">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <Sprout className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold">SproutSafe</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Helping kids grow safely online. Protection without spying.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Features", action: () => scrollToSection("features") },
                { label: "How It Works", action: () => scrollToSection("how-it-works") },
                { label: "Pricing", action: () => scrollToSection("pricing") },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: "FAQ", action: () => scrollToSection("faq") },
                { label: "Contact Us", to: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  {"to" in item ? (
                    <Link to={item.to!} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SproutSafe. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Built with</span>
            <span className="text-primary">♥</span>
            <span>to protect what matters most</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
