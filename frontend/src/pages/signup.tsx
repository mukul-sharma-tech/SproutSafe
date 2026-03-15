// LEGACY — kept for backward compatibility. Primary auth is now via AuthModal on /.
// Do not link to this route from main UI. Logic below is unchanged.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, UserPlus, Loader2, ArrowRight, Sprout, Cpu } from "lucide-react";
import { CipherQueryModal } from "@/components/CipherQueryModal";
import { toast } from "sonner";
import { signup } from "@/api/auth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [querySent, setQuerySent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await signup({ name, email, password });
      localStorage.setItem("token", data.token);
      setIsSignedUp(true);
      toast.success("Account created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedUp) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Sprout className="h-8 w-8" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
            <p className="text-sm text-muted-foreground">
              {querySent
                ? "Registration complete. You're ready to protect your family."
                : "One last step: activate your SproutSafe registration to enable monitoring."}
            </p>
          </div>

          {!querySent ? (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Cpu className="h-4 w-4" />
              Activate SproutSafe
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate("/dashboard")}
            >
              Access Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          <CipherQueryModal
            isOpen={isModalOpen}
            isMandatory={true}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setQuerySent(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">SproutSafe</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
