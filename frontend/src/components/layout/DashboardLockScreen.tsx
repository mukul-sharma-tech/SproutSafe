import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DashboardLockScreenProps {
  onUnlock: () => void;
}

export function DashboardLockScreen({ onUnlock }: DashboardLockScreenProps) {
  const [password, setPassword] = useState("");

  const handleUnlock = () => {
    const stored = sessionStorage.getItem("dashboard_lock_pass");
    if (!stored) {
      sessionStorage.removeItem("dashboard_locked");
      onUnlock();
      return;
    }
    if (password === stored) {
      sessionStorage.removeItem("dashboard_locked");
      sessionStorage.removeItem("dashboard_lock_pass");
      onUnlock();
      toast.success("Dashboard unlocked");
    } else {
      toast.error("Incorrect password");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto px-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Dashboard Locked</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your password to unlock</p>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            className="text-center"
            autoFocus
          />
          <Button onClick={handleUnlock} className="w-full gap-2">
            <Unlock className="h-4 w-4" />
            Unlock
          </Button>
        </div>
      </div>
    </div>
  );
}
