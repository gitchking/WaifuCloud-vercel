import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  text = "Loading..."
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative flex items-center justify-center">
        {/* Perfect circular spinner */}
        <div className={cn(
          "animate-loading-spin rounded-full border-4 border-muted border-t-primary border-r-primary/50",
          sizeClasses[size]
        )} />
        
        {/* Subtle glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/10 animate-loading-pulse blur-sm",
          sizeClasses[size]
        )} />
      </div>
      
      {text && (
        <p className="text-muted-foreground animate-bounce-gentle font-medium text-sm">
          {text}
        </p>
      )}
    </div>
  );
};

// Grid loading skeleton for wallpapers
export const WallpaperGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="bg-muted rounded-xl aspect-[16/10] mb-3 animate-skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-skeleton-shimmer" />
            <div className="flex gap-1">
              <div className="h-6 bg-muted rounded-full w-16 animate-skeleton-shimmer" />
              <div className="h-6 bg-muted rounded-full w-12 animate-skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Category heading skeleton
export const CategoryHeadingSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="h-10 bg-muted rounded-lg w-64 animate-skeleton-shimmer" />
      <div className="h-6 bg-muted rounded w-96 animate-skeleton-shimmer" />
    </div>
  );
};