import { useEffect, useState } from "react";
import { fetchVoiceMessage } from "@/api/superSafe";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VoicePreviewPlayer() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { voiceMessageUrl } = await fetchVoiceMessage();
        setUrl(voiceMessageUrl);
      } catch {
        // Silently fail — no voice message is not an error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading voice message…</p>;
  }

  if (!url) {
    return (
      <p className="text-xs text-muted-foreground">
        No voice message saved yet. The standard text warning will be shown.
      </p>
    );
  }

  const base = (import.meta.env.VITE_BACKENDURL as string | undefined)?.replace(/\/$/, "") || "";
  const src = url.startsWith("http") ? url : `${base}${url}`;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Current warning message:</p>
      <audio className="w-full" controls src={src} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setUrl(null);
          // Backend deletion can be added later; for now, re-recording simply overwrites.
        }}
      >
        Clear preview (you can re-record)
      </Button>
    </div>
  );
}

