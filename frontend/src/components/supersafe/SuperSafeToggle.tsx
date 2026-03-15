import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { fetchSuperSafeSettings, updateSuperSafeToggle } from "@/api/superSafe";
import { toast } from "sonner";

export function SuperSafeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const settings = await fetchSuperSafeSettings();
        setEnabled(settings.enabled);
      } catch {
        toast.error("Failed to load SuperSafe settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = async (value: boolean) => {
    setEnabled(value);
    try {
      await updateSuperSafeToggle(value);
      toast.success(value ? "SuperSafe Mode enabled" : "SuperSafe Mode disabled");
    } catch {
      toast.error("Failed to update SuperSafe Mode");
      setEnabled((prev) => !prev);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">SuperSafe Mode</p>
        <p className="text-xs text-muted-foreground">
          Block all websites except your approved list.
        </p>
      </div>
      <Switch disabled={loading} checked={enabled} onCheckedChange={handleChange} />
    </div>
  );
}

