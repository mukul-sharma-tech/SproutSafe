import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Users, FileText, Settings, Timer, LogOut, Plus, ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Child { _id: string; name: string; email: string; status?: string; }

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  children: Child[];
  selectedChildEmail: string | null;
  onSelectChild: (email: string) => void;
  parentName: string;
  onAddChildClick: () => void;
}

const navItems = [
  { id: "overview", icon: BarChart3, label: "Overview" },
  { id: "profiles", icon: Users, label: "Profiles" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "timer-based", icon: Timer, label: "Timer Based" },
];

export function DashboardSidebar({ collapsed, onToggle, activeView, onViewChange, children: childProfiles, selectedChildEmail, onSelectChild, parentName, onAddChildClick }: DashboardSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className={cn("fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">SproutSafe</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="h-4 w-4" />
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Separator />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const btn = (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return btn;
        })}
      </nav>

      {!collapsed && (
        <>
          <Separator />
          <div className="px-3 py-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Children</p>
            <div className="space-y-0.5">
              {childProfiles.map((child) => (
                <button
                  key={child._id}
                  onClick={() => onSelectChild(child.email)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition-all duration-150",
                    selectedChildEmail === child.email ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold", selectedChildEmail === child.email ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                    {child.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{child.name}</span>
                  {child.status === "online" && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />}
                </button>
              ))}
              <button
                onClick={onAddChildClick}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                  <Plus className="h-3 w-3" />
                </span>
                <span>Add child</span>
              </button>
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {parentName?.charAt(0)?.toUpperCase() || "P"}
              </span>
              <span className="truncate text-sm font-medium">{parentName}</span>
            </div>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Log out</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="mx-auto h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
