import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  className 
}: StatCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-6 hover:shadow-accent transition-all duration-300", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
        </div>
        {change && (
          <div className={cn(
            "px-2 py-1 rounded-md text-xs font-semibold",
            changeType === "positive" && "bg-success/20 text-success",
            changeType === "negative" && "bg-destructive/20 text-destructive",
            changeType === "neutral" && "bg-muted/20 text-muted-foreground"
          )}>
            {changeType === "positive" && "+"}
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}