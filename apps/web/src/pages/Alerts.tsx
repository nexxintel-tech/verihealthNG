import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchAlerts, markAlertAsRead, type Alert } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      markAlertAsRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({
        title: "Alert updated",
        description: "Alert status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update alert status.",
        variant: "destructive",
      });
    },
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "unread") return !alert.isRead;
    if (filter === "high") return alert.severity === "high";
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const highSeverityCount = alerts.filter((a) => a.severity === "high").length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive";
      case "medium":
        return "bg-warning/10 text-warning border-warning";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Patient Alerts
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage patient health alerts and notifications.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" data-testid="text-total-alerts">{alerts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unread Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning" data-testid="text-unread-alerts">{unreadCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive" data-testid="text-high-severity">{highSeverityCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>View and manage all patient alerts</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all" data-testid="button-filter-all">All</TabsTrigger>
                    <TabsTrigger value="unread" data-testid="button-filter-unread">
                      Unread ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="high" data-testid="button-filter-high">
                      High Severity ({highSeverityCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm mt-1">
                  {filter === "all"
                    ? "All patients are stable. No alerts at this time."
                    : `No ${filter} alerts to display.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-all",
                      alert.isRead
                        ? "bg-secondary/20 border-border/50"
                        : "bg-card border-border shadow-sm"
                    )}
                    data-testid={`alert-item-${alert.id}`}
                  >
                    <div
                      className={cn(
                        "mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                        getSeverityColor(alert.severity)
                      )}
                    >
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground" data-testid={`text-alert-type-${alert.id}`}>
                              {alert.type}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn("capitalize", getSeverityColor(alert.severity))}
                            >
                              {alert.severity}
                            </Badge>
                            {!alert.isRead && (
                              <Badge variant="default" className="bg-primary">
                                New
                              </Badge>
                            )}
                          </div>
                          <Link href={`/patients/${alert.patientId}`}>
                            <p className="text-sm text-primary hover:underline cursor-pointer" data-testid={`link-patient-${alert.id}`}>
                              {alert.patientName}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant={alert.isRead ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            markAsReadMutation.mutate({
                              id: alert.id,
                              isRead: !alert.isRead,
                            })
                          }
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          {alert.isRead ? "Mark Unread" : "Mark Read"}
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/80" data-testid={`text-alert-message-${alert.id}`}>{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
