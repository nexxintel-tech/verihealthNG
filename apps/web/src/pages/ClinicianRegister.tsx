import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerClinician, fetchInstitutions, type Institution, type ClinicianRegistration } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const clinicianRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name is required"),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  institutionId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ClinicianRegisterForm = z.infer<typeof clinicianRegisterSchema>;

export function ClinicianRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicianRegisterForm>({
    resolver: zodResolver(clinicianRegisterSchema),
  });

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const data = await fetchInstitutions();
        setInstitutions(data);
        // Select first institution by default (already sorted with default first)
        if (data.length > 0) {
          setSelectedInstitution(data[0].id);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load institutions",
          variant: "destructive",
        });
      }
    }
    loadInstitutions();
  }, [toast]);

  const onSubmit = async (data: ClinicianRegisterForm) => {
    setIsLoading(true);
    try {
      // Validate institution selection
      if (!selectedInstitution) {
        toast({
          title: "Error",
          description: "Please select an institution to continue",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const registrationData: ClinicianRegistration = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        licenseNumber: data.licenseNumber || undefined,
        specialty: data.specialty || undefined,
        phone: data.phone || undefined,
        institutionId: selectedInstitution,
      };

      const result = await registerClinician(registrationData);

      toast({
        title: "Registration Successful",
        description: result.message,
      });

      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold" data-testid="title-clinician-register">
            Clinician Registration
          </CardTitle>
          <CardDescription data-testid="text-register-description">
            Register as a healthcare provider. Your account will require approval from your institution administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  data-testid="input-fullName"
                  {...register("fullName")}
                  placeholder="Dr. John Smith"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500" data-testid="error-fullName">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  {...register("email")}
                  placeholder="[email protected]"
                />
                {errors.email && (
                  <p className="text-sm text-red-500" data-testid="error-email">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="input-password"
                    {...register("password")}
                    placeholder="Minimum 6 characters"
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
                {errors.password && (
                  <p className="text-sm text-red-500" data-testid="error-password">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    data-testid="input-confirmPassword"
                    {...register("confirmPassword")}
                    placeholder="Re-enter password"
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
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500" data-testid="error-confirmPassword">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  data-testid="input-licenseNumber"
                  {...register("licenseNumber")}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  data-testid="input-specialty"
                  {...register("specialty")}
                  placeholder="e.g., Cardiology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  data-testid="input-phone"
                  {...register("phone")}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger data-testid="select-institution">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id} data-testid={`option-institution-${inst.id}`}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || institutions.length === 0 || !selectedInstitution}
                data-testid="button-register"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
              {institutions.length === 0 && (
                <p className="text-sm text-red-500 text-center">
                  No institutions available. Please contact support.
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center" data-testid="text-approval-notice">
              After registration, your account will be pending approval from your institution administrator.
              You'll be able to log in once approved.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
