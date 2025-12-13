import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRealtimeSubscriptions } from "@/lib/realtime";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ConfirmEmail from "@/pages/ConfirmEmail";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import { ClinicianRegister } from "@/pages/ClinicianRegister";
import { ClinicianApprovals } from "@/pages/ClinicianApprovals";
import { AdminPanel } from "@/pages/AdminPanel";

function Router() {
  // Enable realtime updates
  useRealtimeSubscriptions();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register-clinician" component={ClinicianRegister} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/confirm-email" component={ConfirmEmail} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/patients">
        <ProtectedRoute>
          <PatientList />
        </ProtectedRoute>
      </Route>
      <Route path="/patients/:id">
        <ProtectedRoute>
          <PatientDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute>
          <Alerts />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/clinician-approvals">
        <ProtectedRoute>
          <ClinicianApprovals />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
