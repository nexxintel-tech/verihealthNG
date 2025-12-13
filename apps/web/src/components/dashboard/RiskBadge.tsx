import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/mockData";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const styles = {
    low: "bg-risk-low/15 text-risk-low hover:bg-risk-low/25 border-risk-low/20",
    medium: "bg-risk-medium/15 text-risk-medium hover:bg-risk-medium/25 border-risk-medium/20",
    high: "bg-risk-high/15 text-risk-high hover:bg-risk-high/25 border-risk-high/20 animate-pulse",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "capitalize font-medium border", 
        styles[level], 
        className
      )}
    >
      {level} Risk
    </Badge>
  );
}
