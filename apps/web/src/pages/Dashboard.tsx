import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  HeartPulse, 
  ArrowUpRight,
  UserCheck,
  Clock,
  Award
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { TopPerformingClinicians } from "@/components/dashboard/TopPerformingClinicians";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPatients, fetchAlerts, fetchDashboardStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth";

export default function Dashboard() {
  const user = getUser();
  const isPatient = user?.role === 'patient';
  const isClinicianOrAdmin = user?.role === 'clinician' || user?.role === 'admin';
  const isInstitutionAdmin = user?.role === 'institution_admin';
  const canViewPatients = isClinicianOrAdmin; // Institution admins cannot view patients

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    enabled: canViewPatients, // Only fetch for clinicians/admins
  });

  // Only fetch alerts for clinicians/admins (not institution admins)
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    enabled: isClinicianOrAdmin,
  });

  // Fetch stats for clinicians, admins, and institution admins
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: isClinicianOrAdmin || isInstitutionAdmin,
  });

  const highRiskPatients = patients.filter(p => p.riskLevel === "high" || p.riskLevel === "medium");
  const recentAlerts = alerts.slice(0, 4);

  if (isPatient) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">My Health Dashboard</h1>
            <p className="text-muted-foreground">
              Track your health vitals and stay connected with your care team.
            </p>
          </div>
          <PatientDashboard />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            {isInstitutionAdmin 
              ? "Here's an overview of your institution's clinicians and their performance."
              : "Here's what's happening with your patients today."}
          </p>
        </div>

        {/* Stats Grid - Different views for different roles */}
        {(isClinicianOrAdmin || isInstitutionAdmin) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : isInstitutionAdmin ? (
              /* Institution Admin sees clinician-focused stats */
              <>
                <StatCard 
                  title="Total Clinicians" 
                  value={stats?.totalClinicians || 0} 
                  icon={Users} 
                  trend="In your institution" 
                  trendDirection="neutral"
                />
                <StatCard 
                  title="Approved Clinicians" 
                  value={stats?.approvedClinicians || 0} 
                  icon={UserCheck} 
                  trend="Active and approved" 
                  trendDirection="up"
                  className="border-l-4 border-l-green-500"
                />
                <StatCard 
                  title="Pending Approvals" 
                  value={stats?.pendingApprovals || 0} 
                  icon={Clock} 
                  trend="Requires review" 
                  trendDirection={(stats?.pendingApprovals ?? 0) > 0 ? "down" : "neutral"}
                  className="border-l-4 border-l-warning"
                />
                <StatCard 
                  title="Avg. Performance" 
                  value={stats?.avgPerformanceScore || 0} 
                  icon={Award} 
                  trend="Response time score" 
                  trendDirection="neutral"
                />
              </>
            ) : (
              /* Clinicians and Admins see patient-focused stats */
              <>
                <StatCard 
                  title="Total Patients" 
                  value={stats?.totalPatients || 0} 
                  icon={Users} 
                  trend="+12% from last month" 
                  trendDirection="up"
                />
                <StatCard 
                  title="High Risk Patients" 
                  value={stats?.highRiskCount || 0} 
                  icon={Activity} 
                  trend="+2 new this week" 
                  trendDirection="down"
                  className="border-l-4 border-l-risk-high"
                />
                <StatCard 
                  title="Active Alerts" 
                  value={stats?.activeAlerts || 0} 
                  icon={AlertTriangle} 
                  trend="Requires attention" 
                  trendDirection="down"
                  className="border-l-4 border-l-warning"
                />
                <StatCard 
                  title="Avg. Risk Score" 
                  value={stats?.avgRiskScore || 0} 
                  icon={HeartPulse} 
                  trend="Stable" 
                  trendDirection="neutral"
                />
              </>
            )}
          </div>
        )}

        {/* Patient/Alert sections - Not for institution admins */}
        {!isInstitutionAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* High Risk Patients List (or Patient's own data for patient role) */}
          <Card className={isClinicianOrAdmin ? "col-span-4 border-none shadow-md" : "col-span-7 border-none shadow-md"}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {isClinicianOrAdmin ? "High Priority Attention Needed" : "My Health Overview"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link href="/patients">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : highRiskPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No high-priority patients at this time.</p>
                  <p className="text-sm mt-1">All patients are stable.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highRiskPatients.slice(0, 5).map((patient) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer border border-transparent hover:border-border">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.conditions[0] || "No conditions"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">Score: {patient.riskScore}</p>
                            <p className="text-xs text-muted-foreground">Last sync: {new Date(patient.lastSync).toLocaleTimeString()}</p>
                          </div>
                          <RiskBadge level={patient.riskLevel} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts - Only for clinicians/admins */}
          {isClinicianOrAdmin && (
            <Card className="col-span-3 border-none shadow-md">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent alerts</p>
                  <p className="text-sm mt-1">System monitoring is active.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex gap-3 items-start pb-4 border-b last:border-0 last:pb-0 border-border">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${alert.severity === 'high' ? 'bg-destructive' : 'bg-warning'}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.patientName} • {new Date(alert.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-foreground/80">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
        )}

        {/* Top Performing Clinicians - For clinicians, admins, and institution admins */}
        {(isClinicianOrAdmin || isInstitutionAdmin) && (
          <div className="grid gap-4 md:grid-cols-1">
            <TopPerformingClinicians />
          </div>
        )}
      </div>
    </Layout>
  );
}
