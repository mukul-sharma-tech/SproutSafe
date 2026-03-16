import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Child } from "@/types/models";
import { fetchChildren } from "@/api/children";
import { Copy as CopyIcon, Clock, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface ChildStatus {
  name: string;
  token: string;
  isActivated: boolean;
  activatedAt?: string;
  location?: string;
  lastSeen?: string;
}

interface ChildStatusCardProps {
  child: ChildStatus;
}

function formatRelativeTime(iso?: string) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "just now";
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
}

export function ChildStatusCard({ child }: ChildStatusCardProps) {
  const [localChild, setLocalChild] = useState(child);

  useEffect(() => {
    setLocalChild(child);
  }, [child]);

  useEffect(() => {
    if (localChild.isActivated) return;

    const interval = window.setInterval(async () => {
      try {
        const children = await fetchChildren();
        const match = children.find((c: Child) => c.name === localChild.name);
        if (match && match.status === "online") {
          setLocalChild((prev) => ({
            ...prev,
            isActivated: true,
            activatedAt: prev.activatedAt ?? new Date().toISOString(),
            lastSeen: match.lastHeartbeat,
          }));
          if (interval) window.clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [localChild.isActivated, localChild.name]);

  const handleCopy = async () => {
    if (!localChild.token) return;
    try {
      await navigator.clipboard.writeText(localChild.token);
    } catch {
      // ignore
    }
  };

  const activatedAtLabel = localChild.activatedAt
    ? format(new Date(localChild.activatedAt), "MMM d, yyyy 'at' h:mm a")
    : "Just now";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {localChild.name?.charAt(0).toUpperCase()}
          </span>
          <h3 className="text-lg font-semibold">{localChild.name}</h3>
        </div>
        {localChild.isActivated ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Awaiting Activation
          </span>
        )}
      </div>

      {!localChild.isActivated ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste this token in the CyberNest extension to activate.
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-foreground">
              {localChild.token}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-muted-foreground/10 transition-colors"
              title="Copy token"
            >
              <CopyIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Activated
            </div>
            <div className="text-sm text-foreground">{activatedAtLabel}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Location
            </div>
            <div className="text-sm text-foreground">{localChild.location || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              Last Seen
            </div>
            <div className="text-sm text-foreground">{formatRelativeTime(localChild.lastSeen)}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

