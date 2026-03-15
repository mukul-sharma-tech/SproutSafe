import { Link, useNavigate } from "react-router-dom";
import { Sprout, LayoutDashboard, Users, FileText, Settings, Timer, ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Child {
  _id: string;
  name: string;
  email: string;
  status?: string;
}

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  children: Child[];
  selectedChildEmail: string | null;
  onSelectChild: (email: string) => void;
  parentName: string;
  onAddChildClick?: () => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "timer-based", label: "Timer Access", icon: Timer },
  { id: "settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  collapsed,
  onToggle,
  activeView,
  onViewChange,
  children,
  selectedChildEmail,
  onSelectChild,
  parentName,
  onAddChildClick,
}: DashboardSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border shrink-0">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4" />
            </div>
            <span className="font-bold text-base">SproutSafe</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <Sprout className="h-4 w-4" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn("p-1 rounded-lg hover:bg-accent transition-colors", collapsed && "mx-auto mt-0")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              activeView === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}

        {/* Children list */}
        {!collapsed && children.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Children
            </p>
            {children.map((child) => (
              <button
                key={child._id}
                onClick={() => onSelectChild(child.email)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                  selectedChildEmail === child.email
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  child.status === "online" ? "bg-emerald-500" : "bg-gray-400"
                )} />
                <span className="truncate">{child.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Add child */}
        {!collapsed && (
          <button
            onClick={onAddChildClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mt-1"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Child</span>
          </button>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 shrink-0">
        {!collapsed && (
          <p className="text-xs text-muted-foreground px-2 mb-2 truncate">{parentName}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
