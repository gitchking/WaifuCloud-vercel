import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wallpaper } from "@/types/wallpaper";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ShareDialog } from "@/components/ShareDialog";
import { ImageSlider } from "@/components/ImageSlider";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Download, Heart, Share2, User } from "lucide-react";

// Color mapping based on first letter of tag
const getTagColor = (tag: string) => {
  if (!tag) return "bg-gray-500";

  const firstLetter = tag.charAt(0).toUpperCase();
  const colorMap: Record<string, string> = {
    'A': "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    'B': "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    'C': "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
    'D': "bg-red-800/10 text-red-800 hover:bg-red-800/20",
    'E': "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    'F': "bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20",
    'G': "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    'H': "bg-yellow-300/10 text-yellow-300 hover:bg-yellow-300/20",
    'I': "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
    'J': "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20",
    'K': "bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20",
    'L': "bg-purple-300/10 text-purple-300 hover:bg-purple-300/20",
    'M': "bg-magenta-500/10 text-magenta-500 hover:bg-magenta-500/20",
    'N': "bg-blue-900/10 text-blue-900 hover:bg-blue-900/20",
    'O': "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    'P': "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    'Q': "bg-pink-400/10 text-pink-400 hover:bg-pink-400/20",
    'R': "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    'S': "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20",
    'T': "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20",
    'U': "bg-blue-700/10 text-blue-700 hover:bg-blue-700/20",
    'V': "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
    'W': "bg-white/10 text-white hover:bg-white/20",
    'X': "bg-green-700/10 text-green-700 hover:bg-green-700/20",
    'Y': "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    'Z': "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  };

  return colorMap[firstLetter] || "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
};

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [publisher, setPublisher] = useState<{ name: string, avatar?: string } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  console.log('Watch component rendered with ID:', id);

  useEffect(() => {
    if (id) {
      fetchWallpaper();
      checkIfSaved();
    }
  }, [id]);

  const fetchWallpaper = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check NSFW settings - only allow NSFW content for logged-in users who have enabled it
      const nsfwEnabled = user ? localStorage.getItem("nsfw-enabled") === "true" : false;
      if (data.is_nsfw && (!user || !nsfwEnabled)) {
        toast.error("This content is not available. Please log in and enable NSFW content in settings.");
        navigate("/");
        return;
      }

      setWallpaper({
        id: data.id,
        title: data.title,
        imageUrl: data.image_url,
        image_url: data.image_url,
        images: data.images || [data.image_url], // Support multiple images
        image_count: data.image_count || 1,
        tags: data.tags || [],
        category: data.category,
        isNSFW: data.is_nsfw,
        uploadedAt: data.created_at,
        created_at: data.created_at,
        credit: data.credit || undefined,
        orientation: (data as { orientation?: string }).orientation || "horizontal",
      });

      // Fetch publisher info if uploaded_by exists
      if (data.uploaded_by) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, username, nickname")
            .eq("user_id", data.uploaded_by)
            .single();

          if (!userError && userData) {
            setPublisher({
              name: userData.nickname || userData.username || userData.full_name || "Anonymous User",
              avatar: userData.avatar_url
            });
          } else {
            // Fallback if no profile found
            setPublisher({
              name: "Anonymous User"
            });
          }
        } catch (profileError) {
          console.log("Profile fetch error:", profileError);
          setPublisher({
            name: "Anonymous User"
          });
        }
      } else {
        setPublisher({
          name: "Anonymous User"
        });
      }
    } catch (error) {
      console.error("Error fetching wallpaper:", error);
      toast.error("Failed to load wallpaper");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

  const checkIfSaved = useCallback(() => {
    try {
      if (!id) return;

      const savedWallpapers = JSON.parse(localStorage.getItem('favouriteWallpapers') || '[]');
      const isWallpaperSaved = savedWallpapers.some((wallpaperId: string) => wallpaperId === id);
      setIsSaved(isWallpaperSaved);
    } catch (error) {
      console.error("Error checking save status:", error);
    }
  }, [id]);

  const handleSave = () => {
    try {
      if (!wallpaper) return;

      const savedWallpapers = JSON.parse(localStorage.getItem('favouriteWallpapers') || '[]');

      if (isSaved) {
        // Remove from saved
        const updatedSavedWallpapers = savedWallpapers.filter((wallpaperId: string) => wallpaperId !== wallpaper.id);
        localStorage.setItem('favouriteWallpapers', JSON.stringify(updatedSavedWallpapers));
        setIsSaved(false);
        toast.success("Removed from favourites");
      } else {
        // Add to saved
        if (!savedWallpapers.includes(wallpaper.id)) {
          savedWallpapers.push(wallpaper.id);
          localStorage.setItem('favouriteWallpapers', JSON.stringify(savedWallpapers));
        }
        setIsSaved(true);
        toast.success("Added to favourites");
      }
    } catch (error) {
      console.error("Error saving wallpaper:", error);
      toast.error("Failed to save wallpaper");
    }
  };

  const handleDownload = async () => {
    try {
      if (!wallpaper) return;

      const images = wallpaper.images || [wallpaper.imageUrl];
      
      // If multiple images, download all
      if (images.length > 1) {
        toast.info(`Downloading ${images.length} images...`);
        
        for (let i = 0; i < images.length; i++) {
          try {
            const response = await fetch(images[i], { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${wallpaper.title.replace(/\s+/g, '_')}_${i + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error(`Error downloading image ${i + 1}:`, err);
          }
        }
        
        toast.success("All images downloaded!");
      } else {
        // Single image download
        const response = await fetch(wallpaper.imageUrl, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${wallpaper.title.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("Download started!");
      }
    } catch (error) {
      console.error("Download error:", error);
      window.open(wallpaper?.imageUrl, '_blank');
      toast.info("Opening image in new tab for download");
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading wallpaper..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Wallpaper not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
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
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Preview */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-border/50 bg-card p-4">
                <ImageSlider 
                  images={wallpaper.images || [wallpaper.imageUrl]} 
                  alt={wallpaper.title}
                />
              </Card>
            </div>

            {/* Metadata Panel */}
            <div className="flex flex-col gap-6">
              <Card className="flex-1 p-6 border-border/50 bg-card overflow-hidden">
                <div className="h-full flex flex-col">
                  <h1 className="text-2xl font-display font-bold mb-4 line-clamp-2">{wallpaper.title}</h1>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      {/* Published by section */}
                      {publisher && (
                        <div>
                          <h2 className="text-sm font-medium text-muted-foreground mb-2">Published by</h2>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={publisher.avatar} alt={publisher.name} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{publisher.name}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h2 className="text-sm font-medium text-muted-foreground mb-2">Category</h2>
                        <Badge variant="secondary" className="text-sm">
                          {wallpaper.category}
                        </Badge>
                      </div>

                      {wallpaper.tags && wallpaper.tags.length > 0 && (
                        <div>
                          <h2 className="text-sm font-medium text-muted-foreground mb-2">Tags</h2>
                          <div className="flex flex-wrap gap-2">
                            {wallpaper.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`${getTagColor(tag)} border-0 text-xs`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {wallpaper.credit && (
                        <div>
                          <h2 className="text-sm font-medium text-muted-foreground mb-2">Credit / Source</h2>
                          {wallpaper.credit.match(/^https?:\/\//i) ? (
                            <a 
                              href={wallpaper.credit} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              {wallpaper.credit}
                            </a>
                          ) : (
                            <p className="text-sm break-words">{wallpaper.credit}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <h2 className="text-sm font-medium text-muted-foreground mb-2">Uploaded</h2>
                        <p className="text-sm">
                          {new Date(wallpaper.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons - Same height as metadata panel */}
              <Card className="p-6 border-border/50 bg-card flex items-center justify-center">
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 gradient-primary text-white"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    className={isSaved ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Share Dialog */}
        {wallpaper && (
          <ShareDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            wallpaper={{
              id: wallpaper.id,
              title: wallpaper.title,
              imageUrl: wallpaper.imageUrl,
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Watch;