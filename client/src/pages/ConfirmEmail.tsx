import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ConfirmEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the hash params from URL (Supabase sends them there)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setMessage("Invalid confirmation link. Please try requesting a new one.");
          return;
        }

        // Store the session
        localStorage.setItem("supabase.auth.token", JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }));

        setStatus("success");
        setMessage("Your email has been confirmed successfully! Redirecting to login...");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          setLocation("/login");
        }, 2000);
      } catch (error: any) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        setMessage("Failed to confirm email. Please try again or contact support.");
      }
    };

    confirmEmail();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-600" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Confirming your email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "error" && (
            <div className="space-y-2">
              <Button
                onClick={() => setLocation("/login")}
                className="w-full"
                data-testid="button-goto-login"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => setLocation("/register")}
                variant="outline"
                className="w-full"
                data-testid="button-goto-register"
              >
                Create New Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
