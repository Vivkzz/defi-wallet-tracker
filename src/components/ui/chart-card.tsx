import { cn } from "@/lib/utils";
import { Card } from "./card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}

export function MockChart({ type = "line" }: { type?: "line" | "area" | "bar" }) {
  return (
    <div className="w-full h-full flex items-center justify-center glass-subtle rounded-lg">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Chart visualization will be integrated with real-time data
        </p>
      </div>
    </div>
  );
}