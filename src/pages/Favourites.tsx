import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wallpaper } from "@/types/wallpaper";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const Favourites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavouriteWallpapers();
  }, []);

  const fetchFavouriteWallpapers = async () => {
    try {
      const savedWallpapers = JSON.parse(localStorage.getItem('favouriteWallpapers') || '[]');
      
      if (savedWallpapers.length === 0) {
        setWallpapers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .in("id", savedWallpapers);

      if (error) throw error;

      // Filter out NSFW content if user is not logged in or hasn't enabled NSFW
      const nsfwEnabled = user ? localStorage.getItem("nsfw-enabled") === "true" : false;
      
      const wallpaperData = data
        .filter((item: { is_nsfw: boolean }) => {
          // Only show NSFW content to logged-in users who have enabled it
          if (item.is_nsfw && (!user || !nsfwEnabled)) {
            return false;
          }
          return true;
        })
        .map((item: {
          id: string;
          title: string;
          image_url: string;
          images: string[] | null;
          image_count: number | null;
          tags: string[] | null;
          category: string;
          is_nsfw: boolean;
          created_at: string;
          credit: string | null;
          orientation: string | null;
        }) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          image_url: item.image_url,
          images: item.images || [item.image_url],
          image_count: item.image_count || 1,
          tags: item.tags || [],
          category: item.category,
          isNSFW: item.is_nsfw,
          uploadedAt: item.created_at,
          created_at: item.created_at,
          credit: item.credit || undefined,
          orientation: item.orientation || "horizontal",
        }));

      setWallpapers(wallpaperData);
    } catch (error) {
      console.error("Error fetching favourite wallpapers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Favourites
            </h1>
            <p className="text-muted-foreground">
              Your saved anime wallpapers
            </p>
          </div>
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading favourites..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                Favourites
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Your saved anime waifus
              </p>
            </div>
          </div>
        </div>

        {wallpapers.length === 0 ? (
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">No Favourites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Save your favourite waifus by clicking the heart icon on any waifu page.
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Wallpapers
            </Button>
          </Card>
        ) : (
          <div>
            <p className="text-muted-foreground mb-4 text-sm">
              {wallpapers.length} favourite{wallpapers.length !== 1 ? 's' : ''}
            </p>
            <WallpaperGrid wallpapers={wallpapers} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favourites;