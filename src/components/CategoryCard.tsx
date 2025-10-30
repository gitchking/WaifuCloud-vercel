import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Images } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Category } from "@/types/wallpaper";

interface CategoryCardProps {
  category: Category & { count: number };
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/wallpapers?category=${encodeURIComponent(category.name)}`);
  };



  return (
    <Card 
      className="group overflow-hidden cursor-pointer border-border/50 bg-card shadow-card transition-all duration-300 animate-fade-in"
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={category.thumbnail || '/placeholder.svg'}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Soft vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
        
        {/* Hover gradient overlay - same as WallpaperCard */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {/* Top section with count badge */}
          <div className="flex justify-end">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
            >
              <Images className="w-3 h-3 mr-1" />
              {category.count}
            </Badge>
          </div>
          
          {/* Bottom section with title */}
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-1 transition-colors">
              {category.name}
            </h3>
            <p className="text-white/80 text-sm">
              {category.count} {category.count === 1 ? 'Artwork' : 'Artworks'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};