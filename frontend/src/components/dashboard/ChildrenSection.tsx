import { useEffect, useState } from "react";
import { Child } from "@/types/models";
import { fetchChildren } from "@/api/children";
import { ChildStatusCard, ChildStatus } from "./ChildStatusCard";
import { AddChildModal } from "@/components/child/AddChildModal";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function ChildrenSection() {
  const [children, setChildren] = useState<ChildStatus[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChildren();
        const mapped: ChildStatus[] = data.map((c: Child) => ({
          name: c.name,
          token: c.token || c.extensionToken || "",
          isActivated: Boolean(c.token || c.extensionToken) || c.status === "online",
          activatedAt: undefined,
          location: c.location,
          lastSeen: c.lastHeartbeat,
        }));
        setChildren(mapped);
      } catch {
        setChildren([]);
      }
    };
    void load();
  }, []);

  const handleChildAdded = (child: { name: string; token: string }) => {
    setChildren((prev) => [
      ...prev,
      {
        name: child.name,
        token: child.token,
        isActivated: false,
        activatedAt: undefined,
        location: undefined,
        lastSeen: undefined,
      },
    ]);
  };

  return (
    <section className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Your Children
        </h2>
        <Button
          type="button"
          size="sm"
          className="h-9 px-3"
          onClick={() => setShowAddModal(true)}
        >
          + Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center space-y-2">
          <p className="text-base font-medium text-foreground">No child profiles yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first child profile to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((c) => (
            <ChildStatusCard key={c.name + c.token} child={c} />
          ))}
        </div>
      )}

      <AddChildModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onChildAdded={handleChildAdded}
      />
    </section>
  );
}
