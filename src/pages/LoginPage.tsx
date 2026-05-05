import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignup) {
        const { error } = await signup(name, email, password);
        if (error) {
          toast({ title: "Signup failed", description: error, variant: "destructive" });
        } else {
          toast({ title: "Check your email!", description: "We sent a confirmation link to verify your account." });
        }
      } else {
        const { error } = await login(email, password);
        if (error) {
          toast({ title: "Login failed", description: error, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "Logged in successfully." });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-4xl font-heading text-foreground">Rei Wa Maki</h1>
          <p className="text-muted-foreground mt-1 font-body">Online Ordering System</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <h2 className="text-xl font-heading text-foreground">
              {isSignup ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Join us for fresh sushi delivered to you" : "Order your favorite sushi online"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignup ? "Create Account" : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-primary hover:underline font-body block w-full"
              >
                {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
              {!isSignup && (
                <a
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline font-body block"
                >
                  Forgot your password?
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
