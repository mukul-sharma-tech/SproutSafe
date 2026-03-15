import { useState, useEffect } from "react";
import { X, Plus, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSuperSafeSettings,
  addCustomBlockedWord,
  removeCustomBlockedWord,
} from "@/api/superSafe";

export function CustomBlockedWords() {
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingWord, setRemovingWord] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuperSafeSettings()
      .then((s) => setCustomWords(s.customBlockedWords || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = input.trim().toLowerCase();
    if (!word) return;
    if (customWords.includes(word)) {
      toast({ title: "Already exists", description: `"${word}" is already in your list.`, variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const res = await addCustomBlockedWord(word);
      setCustomWords(res.customBlockedWords);
      setInput("");
      toast({ title: "Word added", description: `"${word}" will now appear masked in activity.` });
    } catch {
      toast({ title: "Failed to add word", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (word: string) => {
    setRemovingWord(word);
    try {
      const res = await removeCustomBlockedWord(word);
      setCustomWords(res.customBlockedWords);
      toast({ title: "Word removed", description: `"${word}" has been unmasked.` });
    } catch {
      toast({ title: "Failed to remove word", variant: "destructive" });
    } finally {
      setRemovingWord(null);
    }
  };

  const maskWord = (word: string) => {
    if (word.length <= 2) return "***";
    return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="e.g. proxy site name, VPN tool..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-9 text-sm"
          disabled={adding}
        />
        <Button type="submit" size="sm" className="h-9 shrink-0 gap-1.5" disabled={adding || !input.trim()}>
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : customWords.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {customWords.map((word) => (
            <Badge
              key={word}
              variant="outline"
              className="text-xs font-mono py-1 pl-2.5 pr-1 gap-1.5 border-primary/30 bg-primary/5"
            >
              {maskWord(word)}
              <button
                type="button"
                onClick={() => handleRemove(word)}
                disabled={removingWord === word}
                className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-50"
              >
                {removingWord === word ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-3">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">No custom words added yet</span>
        </div>
      )}
    </div>
  );
}
