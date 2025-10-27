import { Wallpaper } from "@/types/wallpaper";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
}

export const WallpaperCard = ({ wallpaper }: WallpaperCardProps) => {
  // Determine aspect ratio based on orientation with fallback to horizontal
  const orientation = wallpaper.orientation || "horizontal";
  // Make vertical cards shorter - using 3/4 aspect ratio instead of 9/16
  const aspectRatioClass = orientation === "vertical" 
    ? "aspect-[3/4]" 
    : "aspect-[16/9]";

  return (
    <Card className="group overflow-hidden cursor-pointer border-border/50 bg-card shadow-card transition-all duration-300 animate-fade-in">
      <Link to={`/watch/${wallpaper.id}`}>
        <div className={`relative ${aspectRatioClass} overflow-hidden bg-muted`}>
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>
    </Card>
  );
};