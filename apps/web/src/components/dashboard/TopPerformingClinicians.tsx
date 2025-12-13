import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTopPerformers, TopPerformer } from "@/lib/api";

function getMedalColor(index: number): string {
  switch (index) {
    case 0:
      return "text-yellow-500";
    case 1:
      return "text-gray-400";
    case 2:
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
}

function getPerformanceColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-muted-foreground";
}

export function TopPerformingClinicians() {
  const { data: performers = [], isLoading, error } = useQuery({
    queryKey: ["top-performers"],
    queryFn: fetchTopPerformers,
  });

  if (error) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Performing Clinicians
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load top performers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md" data-testid="card-top-performers">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Performing Clinicians
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : performers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No clinician data available</p>
            <p className="text-sm mt-1">Performance metrics will appear once clinicians respond to alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {performers.map((performer: TopPerformer, index: number) => (
              <div
                key={performer.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                data-testid={`row-clinician-${performer.id}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-background ${getMedalColor(index)}`}>
                  {index < 3 ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate" data-testid={`text-clinician-name-${performer.id}`}>
                    {performer.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {performer.specialty}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5" title="Average Response Time">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium" data-testid={`text-response-time-${performer.id}`}>
                      {performer.avgResponseTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5" title="Patient Improvement Rate">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium" data-testid={`text-outcome-rate-${performer.id}`}>
                      {performer.patientOutcomeRate}%
                    </span>
                  </div>

                  <div 
                    className={`font-bold ${getPerformanceColor(performer.performanceScore)}`}
                    title="Performance Score"
                    data-testid={`text-performance-score-${performer.id}`}
                  >
                    {performer.performanceScore}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Avg Response
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Patient Outcomes
                  </span>
                </div>
                <span>Performance Score</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
