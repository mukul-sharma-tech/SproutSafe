import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { AnalyticsChartsSection } from "@/components/dashboard/AnalyticsChartsSection";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { ProfilesPanel } from "@/components/dashboard/ProfilesPanel";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { TimerBlockPanel } from "@/components/dashboard/TimerBlockPanel";
import { useDashboardGuard } from "@/hooks/useDashboardGuard";
import { AuthModal } from "@/components/auth/AuthModal";
import { ChildrenSection } from "@/components/dashboard/ChildrenSection";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { AddChildModal } from "@/components/child/AddChildModal";
import { DashboardLockScreen } from "@/components/layout/DashboardLockScreen";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [isLocked, setIsLocked] = useState(() => sessionStorage.getItem("dashboard_locked") === "true");
  const { isAllowed, showVerification } = useDashboardGuard();
  const qc = useQueryClient();

  const handleLockEvent = useCallback(() => setIsLocked(true), []);

  useEffect(() => {
    window.addEventListener("dashboard-locked", handleLockEvent);
    return () => window.removeEventListener("dashboard-locked", handleLockEvent);
  }, [handleLockEvent]);

  if (!isAllowed) {
    return null;
  }

  if (isLocked) {
    return <DashboardLockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <>
      {showVerification && <AuthModal open={true} initialMode="verify-safety" />}
      <DashboardLayout
        activeView={activeView}
        onViewChange={setActiveView}
        onAddChildClick={() => setShowAddChildModal(true)}
      >
        {({ selectedChildEmail, childProfiles, parentName }: { selectedChildEmail: string | null; childProfiles: any[]; parentName: string; parentEmail: string }) => (
          <>
            {activeView === "overview" && (
              <div className="space-y-6">
                {/* Top: analytics cards */}
                <AnalyticsCards childEmail={selectedChildEmail} onNavigateToSettings={() => setActiveView("settings")} />

                {/* Charts */}
                <AnalyticsChartsSection childEmail={selectedChildEmail} />

                {/* Overview with integrated Activity Monitor & Feed */}
                <OverviewPanel
                  childEmail={selectedChildEmail}
                  childName={childProfiles.find((c) => c.email === selectedChildEmail)?.name ?? null}
                />

                {/* Bottom: children / profiles summary */}
                <ChildrenSection />
              </div>
            )}

            {activeView === "profiles" && (
              <ProfilesPanel
                children={childProfiles}
                onSelectChild={() => {}}
                onSwitchToOverview={() => setActiveView("overview")}
              />
            )}

            {activeView === "reports" && (
              <ReportsPanel childEmail={selectedChildEmail} parentName={parentName} />
            )}

            {activeView === "settings" && <SettingsPanel />}

            {activeView === "timer-based" && <TimerBlockPanel />}
          </>
        )}
      </DashboardLayout>
      <AddChildModal
        open={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onChildAdded={async () => {
          setShowAddChildModal(false);
          await qc.invalidateQueries({ queryKey: ["children"] });
        }}
      />
      <VoiceAssistant />
    </>
  );
}
