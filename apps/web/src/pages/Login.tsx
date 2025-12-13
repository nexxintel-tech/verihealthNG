import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ShieldCheck, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [email, setEmail] = useState("clinician@verihealth.com");
  const [password, setPassword] = useState("");
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResendConfirmation(false);

    try {
      await login({ email, password });
      
      toast({
        title: "Login successful",
        description: "Welcome to VeriHealth",
      });
      
      setLocation("/");
    } catch (error: any) {
      // Check if this is an email confirmation error
      const errorData = error.response?.data || {};
      if (errorData.requiresConfirmation) {
        setShowResendConfirmation(true);
        setUnconfirmedEmail(errorData.email || email);
        toast({
          title: "Email not confirmed",
          description: "Please check your inbox and confirm your email before logging in.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResendingConfirmation(true);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: unconfirmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation');
      }

      toast({
        title: "Email sent",
        description: "Please check your inbox for the confirmation link.",
        duration: 5000,
      });

      setShowResendConfirmation(false);
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResendingConfirmation(false);
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
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Enter your credentials to access the clinician dashboard.</p>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
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
            <Button 
              className="w-full h-11 text-base" 
              type="submit"
              disabled={isLoading}
              data-testid="button-sign-in"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {showResendConfirmation && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                Didn't receive the confirmation email?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={isResendingConfirmation}
                className="w-full"
                data-testid="button-resend-confirmation"
              >
                {isResendingConfirmation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a 
                href="/register" 
                className="underline underline-offset-4 hover:text-primary font-medium"
                data-testid="link-register"
              >
                Create account
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Healthcare provider?{" "}
              <a 
                href="/register-clinician" 
                className="underline underline-offset-4 hover:text-primary font-medium"
                data-testid="link-register-clinician"
              >
                Register as Clinician
              </a>
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium mb-2">Demo Credentials</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Clinician:</strong> clinician@verihealth.com</p>
              <p><strong>Patient:</strong> patient1@example.com</p>
              <p className="text-xs opacity-75">(You'll need to set up users in Supabase first)</p>
            </div>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
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
            <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
            HIPAA Compliant & Secure
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <blockquote className="space-y-2">
            <p className="text-2xl font-heading font-medium leading-normal">
              "VeriHealth has transformed how we monitor chronic conditions. The real-time risk scoring helps us intervene days before a crisis occurs."
            </p>
            <footer className="text-sm text-sidebar-foreground/60">
              — Dr. Sarah Chen, Chief of Cardiology
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
