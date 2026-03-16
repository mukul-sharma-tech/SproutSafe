import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Clock, Save } from "lucide-react";
import { toast } from "sonner";

export function ProtectionPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Content Filtering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Block adult content", "Block violence", "Filter profanity"].map((label) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Time Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "School hours blocking", on: true },
              { label: "Bedtime restrictions", on: true },
              { label: "Weekend limits", on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <Switch defaultChecked={item.on} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Protection Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Image filtering", on: true },
            { label: "Text filtering", on: true },
            { label: "URL classification", on: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => toast.info("Reset to default settings?")}>
          Reset to Default
        </Button>
        <Button onClick={() => toast.success("Protection settings saved")}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
