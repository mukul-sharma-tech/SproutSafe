import { useState } from "react";
import { Bell, FileText, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-children";
import { formatActivityTime } from "@/utils/formatActivityTime";
import { toast } from "sonner";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onGenerateReport: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  isRefreshing,
  onRefresh,
  onGenerateReport,
}: DashboardHeaderProps) {
  const { data } = useNotifications();
  const items = Array.isArray(data) ? data : (data as { notifications?: any[] })?.notifications ?? [];
  const unreadCount = items.length;

  const [lockOpen, setLockOpen] = useState(false);
  const [lockPass, setLockPass] = useState("");
  const [lockConfirm, setLockConfirm] = useState("");

  const handleLock = () => {
    if (!lockPass || lockPass.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (lockPass !== lockConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    sessionStorage.setItem("dashboard_lock_pass", lockPass);
    sessionStorage.setItem("dashboard_locked", "true");
    setLockOpen(false);
    setLockPass("");
    setLockConfirm("");
    window.dispatchEvent(new Event("dashboard-locked"));
    toast.success("Dashboard locked");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur-sm">
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setLockOpen(true)}
            title="Lock Dashboard"
          >
            <Lock className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onGenerateReport}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Report</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing" : "Refresh"}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {items.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {items.slice(0, 10).map((item: { id?: string; text?: string; time?: string; timestamp?: string }, i: number) => {
                    const timeStr = item.timestamp ? formatActivityTime(item.timestamp) : (item.time ?? "");
                    return (
                    <DropdownMenuItem key={item.id ?? i} className="flex flex-col items-start gap-0.5 py-2.5">
                      <span className="text-sm leading-tight">{item.text ?? "Notification"}</span>
                      {timeStr && <span className="text-xs text-muted-foreground">{timeStr}</span>}
                    </DropdownMenuItem>
                  );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </header>

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Lock Dashboard</DialogTitle>
            <DialogDescription>
              Set a password to lock the dashboard. You'll need it to unlock.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={lockPass}
              onChange={(e) => setLockPass(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={lockConfirm}
              onChange={(e) => setLockConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLock()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockOpen(false)}>Cancel</Button>
            <Button onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
