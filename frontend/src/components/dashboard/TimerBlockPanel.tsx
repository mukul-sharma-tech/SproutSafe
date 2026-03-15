import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Timer, Plus, X, Loader2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { fetchTimedBlocks, addTimedBlock, removeTimedBlock, type TimedBlock } from "@/api/timedBlocks";

function formatTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function progressPercent(createdAt: string, expiresAt: string) {
  const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime();
  const elapsed = Date.now() - new Date(createdAt).getTime();
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function TimerBlockPanel() {
  const [blocks, setBlocks] = useState<TimedBlock[]>([]);
  const [domain, setDomain] = useState("");
  const [minutes, setMinutes] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const loadBlocks = useCallback(async () => {
    try {
      const data = await fetchTimedBlocks();
      setBlocks(data.filter((b) => new Date(b.expiresAt).getTime() > Date.now()));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBlocks(); }, [loadBlocks]);

  // Tick every second to update countdowns, and prune expired
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setBlocks((prev) => prev.filter((b) => new Date(b.expiresAt).getTime() > Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = domain.trim();
    const m = parseInt(minutes, 10);
    if (!d) { toast.error("Enter a domain"); return; }
    if (!m || m < 1) { toast.error("Enter valid minutes (>=1)"); return; }
    setAdding(true);
    try {
      const block = await addTimedBlock(d, m);
      setBlocks((prev) => {
        const filtered = prev.filter((b) => b.domain !== block.domain);
        return [block, ...filtered];
      });
      setDomain("");
      setMinutes("");
      toast.success(`${block.domain} accessible for ${m} minutes`);
    } catch {
      toast.error("Failed to add timed block");
    } finally { setAdding(false); }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeTimedBlock(id);
      setBlocks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Timer removed");
    } catch {
      toast.error("Failed to remove");
    } finally { setRemovingId(null); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base heading-serif flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer Based Access
          </CardTitle>
          <CardDescription>
            Grant temporary access to a blocked website. The site will be accessible for the set duration even if SuperSafe mode is on. If the child opens it in multiple tabs, the timer drops to zero and all tabs close.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="e.g. youtube.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="h-9 text-sm flex-1"
              disabled={adding}
            />
            <Input
              type="number"
              placeholder="Minutes"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="h-9 text-sm w-full sm:w-28"
              min={1}
              disabled={adding}
            />
            <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0" disabled={adding}>
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Allow
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base heading-serif flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Timers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : blocks.length > 0 ? (
            <div className="space-y-3">
              {blocks.map((block) => {
                const timeLeft = formatTimeLeft(block.expiresAt);
                const pct = progressPercent(block.createdAt, block.expiresAt);
                const isLow = new Date(block.expiresAt).getTime() - Date.now() < 60000;
                return (
                  <div key={block._id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {block.domain}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-mono font-semibold tabular-nums ${isLow ? "text-destructive" : "text-primary"}`}>
                          {isLow && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                          {timeLeft}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(block._id)}
                          disabled={removingId === block._id}
                        >
                          {removingId === block._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isLow ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Timer className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No active timers</p>
              <p className="text-xs mt-1">Add a website above to start a timer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
