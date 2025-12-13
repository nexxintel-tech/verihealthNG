import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setAuthToken, setUser } from "@/lib/auth";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      
      // Check if email confirmation is required
      if (!data.session) {
        // Email confirmation is enabled - show instructions
        toast({
          title: "Registration successful!",
          description: "Please check your email to confirm your account before logging in.",
          duration: 8000,
        });
        
        // Redirect to login after showing message
        setTimeout(() => {
          setLocation("/login");
        }, 2000);
        return;
      }
      
      // Store token and user info (email confirmation disabled)
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
        
        // Fetch user details
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Welcome to VeriHealth!",
      });
      
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">VeriHealth</span>
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground">Enter your information to get started with VeriHealth.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                placeholder="doctor@hospital.org" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                New accounts are created as <strong>Patient</strong> accounts. 
                Contact an administrator if you need healthcare provider access.
              </p>
            </div>

            <Button 
              className="w-full h-11 text-base" 
              type="submit"
              disabled={isLoading}
              data-testid="button-register"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="underline underline-offset-4 hover:text-primary font-medium"
              data-testid="link-login"
            >
              Sign in
            </a>
          </p>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-1 text-sm backdrop-blur-sm">
            <UserPlus className="mr-2 h-4 w-4 text-primary" />
            Join VeriHealth Today
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <h2 className="text-3xl font-heading font-bold">
            Start monitoring health with confidence
          </h2>
          <ul className="space-y-3 text-sidebar-foreground/80">
            <li className="flex items-start gap-2">
              <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Real-time vital signs monitoring</span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>AI-powered risk detection</span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Secure and HIPAA compliant</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
