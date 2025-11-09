import { Button } from "@/components/ui/button";
import { List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  currentView: "list" | "grid";
  onViewChange: (viewType: "list" | "grid") => void;
  className?: string;
}

const ViewToggle = ({ currentView, onViewChange, className }: ViewToggleProps) => {
  return (
    <div className={cn("flex items-center space-x-1 p-1 bg-muted rounded-lg", className)}>
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "p-0 transition-all duration-200",
          currentView === "list" 
            ? "h-10 w-12 bg-primary text-primary-foreground shadow-sm" 
            : "h-8 w-8 hover:bg-muted-foreground/10"
        )}
      >
        <List className={cn(
          "transition-all duration-200",
          currentView === "list" ? "h-5 w-5" : "h-4 w-4"
        )} />
      </Button>
      <Button
        variant={currentView === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "p-0 transition-all duration-200",
          currentView === "grid" 
            ? "h-10 w-12 bg-primary text-primary-foreground shadow-sm" 
            : "h-8 w-8 hover:bg-muted-foreground/10"
        )}
      >
        <Grid3X3 className={cn(
          "transition-all duration-200",
          currentView === "grid" ? "h-5 w-5" : "h-4 w-4"
        )} />
      </Button>
    </div>
  );
};

export default ViewToggle;


