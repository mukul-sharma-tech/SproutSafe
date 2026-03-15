import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SuperSafeToggle } from "./SuperSafeToggle";
import { BlockExtensionsPageToggle } from "./BlockExtensionsPageToggle";
import { AllowedSitesManager } from "./AllowedSitesManager";
import { CustomBlockedWords } from "./CustomBlockedWords";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoicePreviewPlayer } from "./VoicePreviewPlayer";

export function SuperSafeSettingsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SuperSafe Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SuperSafeToggle />
          <AllowedSitesManager />
          <div className="space-y-2">
            <p className="font-medium text-sm">Warning Voice Message (optional)</p>
            <VoiceRecorder />
            <VoicePreviewPlayer />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Extension Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockExtensionsPageToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Custom Blocked Words</CardTitle>
          <CardDescription>
            Add extra bypass or circumvention terms (e.g. proxy names, VPN tools) to mask them in activity. These won't close tabs — they'll just appear masked in the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomBlockedWords />
        </CardContent>
      </Card>
    </div>
  );
}

