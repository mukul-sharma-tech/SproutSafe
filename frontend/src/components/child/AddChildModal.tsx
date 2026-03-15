import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, X, Copy as CopyIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addChild } from "@/api/children";
import { toast } from "sonner";

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  onChildAdded: (child: { name: string; token: string }) => void;
}

type Step = "form" | "success";

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function AddChildModal({ open, onClose, onChildAdded }: AddChildModalProps) {
  const [childName, setChildName] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");

  if (!open) return null;

  const handleAddChild = async () => {
    if (!childName.trim()) return;
    setIsLoading(true);
    try {
      const email = `c${Date.now()}_${slug(childName)}@sproutsafe.local`;
      const { token } = await addChild({ name: childName.trim(), email });
      setGeneratedToken(token);

      try {
        await navigator.clipboard.writeText(token);
        toast.success("Token copied to clipboard. Paste it in the SproutSafe extension.");
      } catch {
        toast.success("Child profile created. Copy the token below for your extension.");
      }

      setStep("success");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add child. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAgain = async () => {
    if (!generatedToken) return;
    try {
      await navigator.clipboard.writeText(generatedToken);
      toast.success("Token copied!");
    } catch {
      toast.error("Unable to copy token. Please copy manually.");
    }
  };

  const handleDone = () => {
    if (generatedToken) {
      onChildAdded({ name: childName.trim(), token: generatedToken });
    }
    setChildName("");
    setGeneratedToken(null);
    setStep("form");
    onClose();
  };

  const showClose = step === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mx-4 mt-[15vh] w-full max-w-[380px] rounded-2xl bg-card border border-border p-6 shadow-2xl relative"
        >
          {showClose && (
            <button
              type="button"
              onClick={handleDone}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {step === "form" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Add a Child Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your child's name to get started.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-medium">
                  Child's name
                </label>
                <Input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Child's name"
                  className="h-12 text-base rounded-xl"
                />
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!childName.trim() || isLoading}
                onClick={handleAddChild}
              >
                {isLoading ? "Setting up profile..." : "Add Child"}
              </Button>
            </div>
          )}

          {step === "success" && generatedToken && (
            <div className="space-y-6 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {childName.trim()} has been added!
                </p>
                <p className="text-sm text-muted-foreground">
                  Token has been copied. Paste it in the SproutSafe extension to activate.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-foreground">
                  {generatedToken}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAgain}
                  className="p-2 rounded-full hover:bg-muted-foreground/10 transition-colors"
                  title="Copy token"
                >
                  <CopyIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <Button type="button" className="w-full h-12 text-base" onClick={handleDone}>
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
