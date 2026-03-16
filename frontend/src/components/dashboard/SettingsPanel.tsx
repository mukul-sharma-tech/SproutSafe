import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useParentProfile } from "@/hooks/use-auth";
import { changePassword } from "@/api/auth";
import { SuperSafeSettingsSection } from "@/components/supersafe/SuperSafeSettingsSection";

export function SettingsPanel() {
  const navigate = useNavigate();
  const { data: parent } = useParentProfile();

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!currentPass) { toast.error("Enter your current password"); return; }
    if (newPass.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (newPass !== confirmPass) { toast.error("New passwords do not match"); return; }

    setChangingPass(true);
    try {
      await changePassword(currentPass, newPass);
      toast.success("Password changed successfully");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6">
      <SuperSafeSettingsSection />

      {parent && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{parent.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{parent.email}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New password (min 6 chars)"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
          />
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={changingPass} className="gap-1.5">
              {changingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}

