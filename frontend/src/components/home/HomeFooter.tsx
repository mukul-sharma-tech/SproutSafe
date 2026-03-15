import { Link, useLocation } from "react-router-dom";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "#product-demo" },
      { label: "SuperSafe", href: "#super-safe" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export function HomeFooter() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      if (isHome) {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/${href}`;
      }
    }
  };

  const linkClass = cn("text-sm text-muted-foreground hover:text-foreground transition-colors duration-200");

  return (
    <footer className="relative border-t border-border/40">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <Sprout className="h-3.5 w-3.5" />
              </div>
              <span className="text-lg font-bold tracking-tight">SproutSafe</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Helping kids grow safely online. Monitoring without spying, protection without control.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4 text-foreground/80">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className={linkClass}>{link.label}</Link>
                    ) : (
                      <button onClick={() => handleClick(link.href)} className={linkClass}>{link.label}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SproutSafe. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for families everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
