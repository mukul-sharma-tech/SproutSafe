import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus, Copy, Check, Loader2, Sprout, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { addChild } from "@/api/children";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";

export default function AddChild() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasExistingChild, setHasExistingChild] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await addChild({ name, email });
      setToken(data.token);
      setHasExistingChild(false);
      qc.invalidateQueries({ queryKey: ["children"] });
      toast.success("Child added successfully!");
    } catch (err: any) {
      const msg: string = err?.response?.data?.message || "Network error. Please try again.";
      if (msg.includes("E11000") || msg.toLowerCase().includes("duplicate")) {
        setHasExistingChild(true);
        toast.error("A child with this email already exists. You can't generate a second token.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">CyberNest</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Add Child Profile</CardTitle>
            <CardDescription>
              Enter your child's details to generate their monitoring token
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input
                  id="name"
                  placeholder="Enter child's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Child's Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter child's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {token && (
                <div className="space-y-3">
                  <Label>Connect Extension</Label>
                  <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4">
                    <QRCodeSVG value={token} size={180} level="M" includeMargin />
                    <p className="text-xs text-muted-foreground text-center">
                      Open the CyberNest extension and tap <span className="font-semibold">"Scan QR"</span>, or paste the
                      token below.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Input value={token} readOnly className="font-mono text-[11px]" />
                      <Button type="button" variant="outline" size="icon" onClick={copyToken} className="shrink-0">
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Keep this token safe. You usually only need to connect once.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={!email.trim() || !name.trim() || isLoading || hasExistingChild}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {hasExistingChild ? "Token already generated" : isLoading ? "Adding child..." : "Generate Token"}
              </Button>
              <Link to="/dashboard" className="w-full">
                <Button variant="ghost" className="w-full text-muted-foreground gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

