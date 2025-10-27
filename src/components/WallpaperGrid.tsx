import { Wallpaper } from "@/types/wallpaper";
import { WallpaperCard } from "./WallpaperCard";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  loading?: boolean;
}

export const WallpaperGrid = ({ wallpapers, loading = false }: WallpaperGridProps) => {
  // Check if we're showing only vertical wallpapers (phone filter active)
  const isPhoneView = wallpapers.every(w => w.orientation === "vertical");

  return (
    <div className={
      isPhoneView 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    }>
      {wallpapers.map((wallpaper) => (
        <div 
          key={wallpaper.id}
          className={
            wallpaper.orientation === "vertical" 
              ? "w-full max-w-[220px]" 
              : "w-full"
          }
        >
          <WallpaperCard wallpaper={wallpaper} />
        </div>
      ))}
    </div>
  );
};