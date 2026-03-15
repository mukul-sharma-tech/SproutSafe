import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAllowedSites, addAllowedSite, deleteAllowedSite, type AllowedSite } from "@/api/superSafe";
import { toast } from "sonner";

export function AllowedSitesManager() {
  const [sites, setSites] = useState<AllowedSite[]>([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllowedSites();
        setSites(data);
      } catch {
        toast.error("Failed to load allowed websites");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async () => {
    const trimmed = domain.trim();
    if (!trimmed) return;
    try {
      const site = await addAllowedSite(trimmed);
      setSites((prev) => [site, ...prev]);
      setDomain("");
    } catch {
      toast.error("Failed to add allowed website");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAllowedSite(id);
      setSites((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Failed to remove website");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">Allowed Websites</p>
          <p className="text-xs text-muted-foreground">
            Only these domains will be accessible when SuperSafe is on.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <Button type="button" onClick={handleAdd} disabled={loading}>
          Add
        </Button>
      </div>

      <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
        {sites.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between rounded-md border px-2 py-1"
          >
            <span>{s.domain}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(s._id)}>
              Remove
            </Button>
          </div>
        ))}
        {!loading && sites.length === 0 && (
          <p className="text-xs text-muted-foreground">No allowed websites yet.</p>
        )}
      </div>
    </div>
  );
}

