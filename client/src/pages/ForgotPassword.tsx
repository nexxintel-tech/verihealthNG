import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reset email');
      }

      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
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
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">Check your email</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.location.href = '/login'}
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </div>
          ) : (
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
              <Button 
                className="w-full h-11 text-base" 
                type="submit"
                disabled={isLoading}
                data-testid="button-send-reset-email"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a 
              href="/login" 
              className="underline underline-offset-4 hover:text-primary font-medium"
              data-testid="link-back-to-login"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent"></div>
        
        <div className="relative z-10 space-y-4 max-w-lg">
          <h2 className="text-3xl font-heading font-bold">
            We'll help you get back in
          </h2>
          <p className="text-lg text-sidebar-foreground/80">
            Enter your email address and we'll send you instructions to reset your password
            and regain access to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
