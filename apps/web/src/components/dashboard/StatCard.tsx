import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendDirection, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm hover:shadow-md transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            trendDirection === "up" ? "text-green-600" : 
            trendDirection === "down" ? "text-red-600" : 
            "text-muted-foreground"
          )}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
