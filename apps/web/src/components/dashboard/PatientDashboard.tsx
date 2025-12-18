import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  HeartPulse, 
  Activity, 
  Droplets, 
  Moon, 
  Footprints,
  User,
  Building2,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPatientDashboard, PatientDashboardData, PatientVital } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function PatientDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: fetchPatientDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Unable to load your health data</h3>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Please try again later or contact support."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { patient, latestVitals, recentVitals, clinician, institution, recentAlerts } = data;

  const getVitalIcon = (type: string) => {
    switch (type) {
      case "Heart Rate": return HeartPulse;
      case "HRV": return Activity;
      case "Blood Pressure": return Droplets;
      case "SpO2": return Droplets;
      case "Sleep": return Moon;
      case "Steps": return Footprints;
      default: return Activity;
    }
  };

  const getVitalStatus = (status: string) => {
    switch (status) {
      case "normal": return { color: "text-green-600", bg: "bg-green-50", label: "Normal" };
      case "warning": return { color: "text-amber-600", bg: "bg-amber-50", label: "Needs attention" };
      case "critical": return { color: "text-red-600", bg: "bg-red-50", label: "Critical" };
      default: return { color: "text-gray-600", bg: "bg-gray-50", label: "Unknown" };
    }
  };

  const hrData = recentVitals
    .filter(v => v.type === "Heart Rate")
    .map(v => ({
      time: format(new Date(v.timestamp), "MMM dd HH:mm"),
      value: parseFloat(v.value.toString())
    }))
    .reverse()
    .slice(-20);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{patient.gender}, {patient.age} years</Badge>
                  <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                    {patient.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Health Risk Score</p>
                <p className="text-3xl font-bold">{patient.riskScore}</p>
              </div>
              <RiskBadge level={patient.riskLevel} />
            </div>
          </div>
          {patient.conditions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Conditions:</span>
              {patient.conditions.map((condition, i) => (
                <Badge key={i} variant="secondary">{condition}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(latestVitals).slice(0, 4).map(([type, vital]) => {
          const Icon = getVitalIcon(type);
          const statusInfo = getVitalStatus(vital.status);
          return (
            <Card key={type} className="border-none shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
                    <Icon className={`h-5 w-5 ${statusInfo.color}`} />
                  </div>
                  <Badge variant="outline" className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">{type}</p>
                  <p className="text-2xl font-bold">
                    {vital.value} <span className="text-sm font-normal text-muted-foreground">{vital.unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {format(new Date(vital.timestamp), "MMM dd, HH:mm")}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {Object.keys(latestVitals).length === 0 && (
          <Card className="col-span-4 border-none shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No vital readings yet</p>
              <p className="text-sm">Connect your health device to start tracking</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {hrData.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Heart Rate Trend
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hrData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Recent Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No recent alerts</p>
                <p className="text-sm">Your health metrics look good!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'high' 
                        ? 'bg-red-50 border-red-200' 
                        : alert.severity === 'medium'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-500' : 
                        alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.timestamp), "MMM dd, yyyy HH:mm")}
                        </p>
                        <p className="text-sm mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {clinician && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Care Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {clinician.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{clinician.name}</h3>
                  <p className="text-muted-foreground">{clinician.specialty}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{clinician.email}</span>
                    </div>
                    {clinician.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{clinician.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {institution && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Your Healthcare Institution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-semibold text-lg">{institution.name}</h3>
                {institution.address && (
                  <p className="text-muted-foreground mt-1">{institution.address}</p>
                )}
                <div className="mt-3 space-y-2">
                  {institution.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{institution.contactEmail}</span>
                    </div>
                  )}
                  {institution.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{institution.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!clinician && !institution && (
          <Card className="col-span-2 border-none shadow-md">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No care provider assigned yet</p>
              <p className="text-sm">Contact your institution to get connected with a clinician</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}