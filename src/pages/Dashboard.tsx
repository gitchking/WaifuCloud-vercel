import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Eye, Upload, Calendar, Tag, Shield, Sparkles, Loader2 } from "lucide-react";
import { generateAutoTags } from "@/utils/autoTagger";
import { TagSuggestions } from "@/components/TagSuggestions";
import { Switch } from "@/components/ui/switch";
import { CreditInput } from "@/components/CreditInput";

// Color mapping based on first letter of tag
const getTagColor = (tag: string) => {
  if (!tag) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  
  const firstLetter = tag.charAt(0).toUpperCase();
  const colorMap: Record<string, string> = {
    'A': "bg-amber-500/10 text-amber-600 border-amber-500/20",
    'B': "bg-blue-500/10 text-blue-600 border-blue-500/20",
    'C': "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    'D': "bg-red-800/10 text-red-700 border-red-800/20",
    'E': "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    'F': "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
    'G': "bg-green-500/10 text-green-600 border-green-500/20",
    'H': "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    'I': "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    'J': "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
    'K': "bg-yellow-600/10 text-yellow-700 border-yellow-600/20",
    'L': "bg-purple-400/10 text-purple-600 border-purple-400/20",
    'M': "bg-pink-500/10 text-pink-600 border-pink-500/20",
    'N': "bg-blue-900/10 text-blue-800 border-blue-900/20",
    'O': "bg-orange-500/10 text-orange-600 border-orange-500/20",
    'P': "bg-purple-500/10 text-purple-600 border-purple-500/20",
    'Q': "bg-pink-400/10 text-pink-600 border-pink-400/20",
    'R': "bg-red-500/10 text-red-600 border-red-500/20",
    'S': "bg-sky-500/10 text-sky-600 border-sky-500/20",
    'T': "bg-teal-500/10 text-teal-600 border-teal-500/20",
    'U': "bg-blue-700/10 text-blue-800 border-blue-700/20",
    'V': "bg-violet-500/10 text-violet-600 border-violet-500/20",
    'W': "bg-slate-500/10 text-slate-600 border-slate-500/20",
    'X': "bg-green-700/10 text-green-800 border-green-700/20",
    'Y': "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    'Z': "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return colorMap[firstLetter] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

interface Wallpaper {
  id: string;
  title: string;
  image_url: string;
  images?: string[];
  image_count?: number;
  tags: string[];
  category: string;
  credit: string | null;
  created_at: string;
  orientation?: string;
  isNSFW?: boolean;
}

interface EditingWallpaper {
  id: string;
  title: string;
  category: string;
  tags: string;
  credit: string;
  isNSFW: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<EditingWallpaper | null>(null);
  const [wallpaperToDelete, setWallpaperToDelete] = useState<{id: string, imageUrl: string} | null>(null);
  const [autoTagging, setAutoTagging] = useState(false);

  const fetchUserWallpapers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("id, title, image_url, images, image_count, tags, category, is_nsfw, created_at, credit, orientation")
        .eq("uploaded_by", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const wallpaperData = data.map((item: {
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
    } catch (error: unknown) {
      toast.error("Failed to load waifus");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserWallpapers();
    }
  }, [user, fetchUserWallpapers]);

  const handleDeleteClick = (id: string, imageUrl: string) => {
    setWallpaperToDelete({ id, imageUrl });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!wallpaperToDelete) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("wallpapers")
        .delete()
        .eq("id", wallpaperToDelete.id);

      if (dbError) throw dbError;

      // Delete from storage
      const path = wallpaperToDelete.imageUrl.split("/wallpapers/")[1];
      if (path) {
        await supabase.storage.from("wallpapers").remove([path]);
      }

      toast.success("Waifu deleted successfully");
      fetchUserWallpapers();
    } catch (error: unknown) {
      toast.error("Failed to delete waifu");
    } finally {
      setDeleteDialogOpen(false);
      setWallpaperToDelete(null);
    }
  };

  const handleEditClick = (wallpaper: Wallpaper) => {
    setEditingData({
      id: wallpaper.id,
      title: wallpaper.title,
      category: wallpaper.category,
      tags: wallpaper.tags.join(", "),
      credit: wallpaper.credit || "",
      isNSFW: wallpaper.isNSFW || false
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingData) return;

    try {
      const { error } = await supabase
        .from("wallpapers")
        .update({
          title: editingData.title,
          category: editingData.category,
          tags: editingData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
          credit: editingData.credit || null,
          is_nsfw: editingData.isNSFW
        })
        .eq("id", editingData.id);

      if (error) throw error;

      toast.success("Waifu updated successfully");
      setEditDialogOpen(false);
      setEditingData(null);
      fetchUserWallpapers();
    } catch (error: unknown) {
      toast.error("Failed to update waifu");
    }
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    setEditingData(null);
  };

  const handleAutoTagForEdit = async () => {
    if (!editingData) return;

    setAutoTagging(true);
    try {
      // Create a temporary image element to analyze the existing wallpaper
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = async () => {
        try {
          // Convert image to blob for analysis
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], 'wallpaper.jpg', { type: 'image/jpeg' });
                const result = await generateAutoTags(file, editingData.title, editingData.category);
                
                const existingTags = editingData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
                const allTags = [...new Set([...existingTags, ...result.tags])];
                
                setEditingData(prev => prev ? {
                  ...prev,
                  tags: allTags.join(", ")
                } : null);
                
                toast.success(`Generated ${result.tags.length} tags from ${result.sources.length} sources!`);
              }
              setAutoTagging(false);
            }, 'image/jpeg');
          } else {
            setAutoTagging(false);
          }
        } catch (error) {
          console.error("Auto-tagging error:", error);
          toast.error("Failed to generate tags automatically");
          setAutoTagging(false);
        }
      };
      
      img.onerror = () => {
        toast.error("Could not load image for analysis");
        setAutoTagging(false);
      };
      
      img.src = editingData.imageUrl;
    } catch (error) {
      console.error("Auto-tagging error:", error);
      toast.error("Failed to generate tags automatically");
      setAutoTagging(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">
                  My Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage and organize your uploaded waifu artwork
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/upload")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && wallpapers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{wallpapers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Waifus</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(wallpapers.flatMap(w => w.tags)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Tags</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {wallpapers.length > 0 ? new Date(wallpapers[0].created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Latest Upload</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading your waifus..." />
            </div>
          ) : wallpapers.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't uploaded any waifus yet
              </p>
              <Button
                onClick={() => (window.location.href = "/upload")}
                className="gradient-primary text-white border-0"
              >
                Upload Your First Waifu
              </Button>
            </Card>
          ) : (
            <Card className="overflow-hidden shadow-lg">
              <div className="p-6 border-b border-border/40">
                <h2 className="text-xl font-semibold">Your Waifus</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and edit your uploaded content
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Preview</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Details</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Tags</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Uploaded</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallpapers.map((wallpaper) => (
                      <tr key={wallpaper.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="relative group">
                            <img 
                              src={wallpaper.image_url} 
                              alt={wallpaper.title}
                              className="w-20 h-12 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                            {wallpaper.image_count && wallpaper.image_count > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {wallpaper.image_count}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {wallpaper.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {wallpaper.category}
                              </Badge>
                              {wallpaper.orientation === "vertical" && (
                                <Badge variant="outline" className="text-xs">
                                  Portrait
                                </Badge>
                              )}
                              {wallpaper.isNSFW && (
                                <Badge variant="destructive" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  NSFW
                                </Badge>
                              )}
                            </div>
                            {wallpaper.credit && (
                              <p className="text-xs text-muted-foreground">
                                Credit: {wallpaper.credit}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap max-w-48">
                            {wallpaper.tags.slice(0, 2).map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={`text-xs border ${getTagColor(tag)}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {wallpaper.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-muted">
                                +{wallpaper.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(wallpaper.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(wallpaper)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(wallpaper.id, wallpaper.image_url)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Waifu</DialogTitle>
                <DialogDescription>
                  Update the details of your waifu.
                </DialogDescription>
              </DialogHeader>
              {editingData && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingData.title}
                      onChange={(e) => setEditingData(prev => prev ? {...prev, title: e.target.value} : null)}
                      placeholder="Enter waifu title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editingData.category}
                      onChange={(e) => setEditingData(prev => prev ? {...prev, category: e.target.value} : null)}
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tags">Tags</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoTagForEdit}
                        disabled={autoTagging}
                        className="text-xs"
                      >
                        {autoTagging ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Auto Tag
                          </>
                        )}
                      </Button>
                    </div>
                    <TagSuggestions
                      value={editingData.tags}
                      onChange={(value) => setEditingData(prev => prev ? {...prev, tags: value} : null)}
                      placeholder="Type tags like 'ani' for anime suggestions..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Type for suggestions • Use Auto Tag for AI analysis • Click popular tags to add quickly
                    </p>
                  </div>
                  <CreditInput
                    value={editingData.credit}
                    onChange={(value) => setEditingData(prev => prev ? {...prev, credit: value} : null)}
                    id="edit-credit"
                  />
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="edit-nsfw" className="text-base font-medium">
                        NSFW Content
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mark as adult content (18+)
                      </p>
                    </div>
                    <Switch
                      id="edit-nsfw"
                      checked={editingData.isNSFW}
                      onCheckedChange={(checked) => setEditingData(prev => prev ? {...prev, isNSFW: checked} : null)}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Waifu</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this waifu? This action cannot be undone.
                  The waifu will be permanently removed from your account and our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
