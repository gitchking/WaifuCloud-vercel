import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload as UploadIcon, Sparkles, Loader2, Search, Plus, Image as ImageIcon, X } from "lucide-react";
import { generateAutoTags } from "@/utils/autoTagger";
import { TagSuggestions } from "@/components/TagSuggestions";
import { MultipleImageUpload } from "@/components/MultipleImageUpload";
import { CreditInput } from "@/components/CreditInput";

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const Upload = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [credit, setCredit] = useState("");
  const [isNSFW, setIsNSFW] = useState(false);
  const [orientation, setOrientation] = useState("horizontal");
  
  // Multiple images support
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [autoTagging, setAutoTagging] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // New category creation states
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryThumbnail, setCategoryThumbnail] = useState<File | null>(null);
  const [categoryThumbnailPreview, setCategoryThumbnailPreview] = useState<string | null>(null);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(category.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(category.toLowerCase()))
  );

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryThumbnail(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCategoryThumbnailPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCategoryThumbnail = () => {
    setCategoryThumbnail(null);
    setCategoryThumbnailPreview(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (existingCategory) {
      toast.error("A category with this name already exists");
      return;
    }

    setCreatingCategory(true);
    try {
      let thumbnailUrl = null;

      if (categoryThumbnail) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("You must be logged in to upload");
        }

        const formData = new FormData();
        formData.append("file", categoryThumbnail);

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.success && uploadResult.url) {
            thumbnailUrl = uploadResult.url;
          }
        } else {
          console.warn("Thumbnail upload failed, proceeding without thumbnail");
        }
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          thumbnail_url: thumbnailUrl,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategory(data.name);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryThumbnail(null);
      setCategoryThumbnailPreview(null);
      setShowCreateCategoryDialog(false);
      
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleAutoTag = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image first");
      return;
    }

    setAutoTagging(true);
    try {
      const result = await generateAutoTags(images[0], title, category);
      const newTags = result.tags.join(", ");
      
      if (tags) {
        const existingTags = tags.split(",").map(tag => tag.trim());
        const allTags = [...new Set([...existingTags, ...result.tags])];
        setTags(allTags.join(", "));
      } else {
        setTags(newTags);
      }
      
      toast.success(`Generated ${result.tags.length} tags from ${result.sources.length} sources!`);
    } catch (error) {
      console.error("Auto-tagging error:", error);
      toast.error("Failed to generate tags automatically");
    } finally {
      setAutoTagging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0 || !title || !category) {
      toast.error("Please fill in all required fields and select at least one image");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to upload");
      }

      // Upload all images
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("file", images[i]);

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(`Image ${i + 1} upload failed - no URL returned`);
        }

        imageUrls.push(uploadResult.url);
      }

      // Check if category exists, create if it doesn't
      let finalCategory = category.trim();
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === finalCategory.toLowerCase()
      );

      if (!existingCategory) {
        const { data: newCategoryData, error: categoryError } = await supabase
          .from("categories")
          .insert({
            name: finalCategory,
            description: null,
            is_active: true
          })
          .select()
          .single();

        if (!categoryError && newCategoryData) {
          setCategories(prev => [...prev, newCategoryData].sort((a, b) => a.name.localeCompare(b.name)));
        }
      }

      // Insert waifu metadata with multiple images
      const { error: insertError } = await supabase
        .from("wallpapers")
        .insert({
          title,
          image_url: imageUrls[0], // Keep first image as primary for backward compatibility
          images: imageUrls, // Store all images in array
          image_count: imageUrls.length,
          tags: tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0),
          category: finalCategory,
          credit: credit || null,
          is_nsfw: isNSFW,
          orientation,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success("Waifu uploaded successfully!");
      navigate("/");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload waifu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="p-6 shadow-card animate-slide-up">
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 rounded-full gradient-primary items-center justify-center mb-3">
                <UploadIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold mb-1">
                Upload Waifu
              </h1>
              <p className="text-muted-foreground text-sm">
                Share your amazing anime artwork with the community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter waifu title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateCategoryDialog(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Category
                  </Button>
                </div>
                {loadingCategories ? (
                  <div className="text-sm text-muted-foreground p-2">
                    Loading categories...
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type category name or create a new one..."
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        className="pl-10"
                        required
                      />
                    </div>

                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {filteredCategories.length > 0 && (
                          <>
                            {filteredCategories.slice(0, 5).map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex flex-col"
                                onClick={() => {
                                  setCategory(cat.name);
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <span className="font-medium">{cat.name}</span>
                                {cat.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {cat.description}
                                  </span>
                                )}
                              </button>
                            ))}
                            {category && !categories.some(cat => cat.name.toLowerCase() === category.toLowerCase()) && (
                              <div className="border-t border-border">
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                                  onClick={() => {
                                    setNewCategoryName(category);
                                    setShowCreateCategoryDialog(true);
                                    setShowCategoryDropdown(false);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-2" />
                                  <span>Create "{category}" category</span>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {filteredCategories.length === 0 && category && (
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                            onClick={() => {
                              setNewCategoryName(category);
                              setShowCreateCategoryDialog(true);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            <span>Create "{category}" category</span>
                          </button>
                        )}

                        {!category && categories.length > 0 && (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                              Popular Categories
                            </div>
                            {categories.slice(0, 5).map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex flex-col"
                                onClick={() => {
                                  setCategory(cat.name);
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <span className="font-medium">{cat.name}</span>
                                {cat.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {cat.description}
                                  </span>
                                )}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Type to search existing categories or create a new one
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">
                  Orientation
                </Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal (16:9)</SelectItem>
                    <SelectItem value="vertical">Vertical (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tags">Tags</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoTag}
                    disabled={images.length === 0 || autoTagging}
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
                  value={tags}
                  onChange={setTags}
                  placeholder="Type tags like 'ani' for anime suggestions..."
                />
                <p className="text-xs text-muted-foreground">
                  Type to get suggestions • Use Auto Tag for AI-generated tags
                </p>
              </div>

              <CreditInput
                value={credit}
                onChange={setCredit}
                id="credit"
              />

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="nsfw" className="text-base font-medium">
                    NSFW Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mark as adult content (18+)
                  </p>
                </div>
                <Switch
                  id="nsfw"
                  checked={isNSFW}
                  onCheckedChange={setIsNSFW}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Images <span className="text-destructive">*</span>
                </Label>
                <MultipleImageUpload
                  images={images}
                  imagePreviews={imagePreviews}
                  onImagesChange={(newImages, newPreviews) => {
                    setImages(newImages);
                    setImagePreviews(newPreviews);
                  }}
                  maxImages={15}
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white border-0"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Waifu"}
              </Button>
            </form>
          </Card>

          {/* Preview Card */}
          <Card className="p-6 shadow-card animate-slide-up">
            <h2 className="text-lg font-display font-bold mb-4">Preview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Orientation Preview</h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Selected: {orientation === "horizontal" ? "Horizontal (16:9)" : "Vertical (9:16)"}
                  </div>
                  <div className="flex items-center justify-center">
                    {imagePreviews.length > 0 ? (
                      <div className="relative bg-background rounded overflow-hidden border">
                        <div 
                          className={
                            orientation === "horizontal" 
                              ? "w-64 h-36"
                              : "w-36 h-64"
                          }
                        >
                          <img
                            src={imagePreviews[0]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {imagePreviews.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            +{imagePreviews.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-8">
                        <p>Upload images to see preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Waifu Card Preview</h3>
                <div className="bg-muted rounded-lg p-4">
                  {imagePreviews.length > 0 ? (
                    <div className="group overflow-hidden border-border/50 bg-card shadow-card transition-all duration-300">
                      <div className="relative overflow-hidden bg-muted">
                        <div 
                          className={
                            orientation === "horizontal" 
                              ? "aspect-[16/9]"
                              : "aspect-[9/16]"
                          }
                        >
                          <img
                            src={imagePreviews[0]}
                            alt="Preview"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {imagePreviews.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {imagePreviews.length} images
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <h3 className="font-display font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {title || "Waifu Title"}
                        </h3>
                        {category && (
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {category}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      <p>Upload images to see card preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Category Dialog */}
        <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category that everyone can use when uploading waifus.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-category-name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Anime, Gaming, Nature"
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-category-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="new-category-description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-thumbnail">
                  Category Thumbnail (Optional)
                </Label>
                {!categoryThumbnailPreview ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a thumbnail for this category
                    </p>
                    <Input
                      id="category-thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryThumbnailChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("category-thumbnail")?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={categoryThumbnailPreview}
                      alt="Category thumbnail"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeCategoryThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateCategoryDialog(false);
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                  setCategoryThumbnail(null);
                  setCategoryThumbnailPreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="gradient-primary text-white border-0"
              >
                {creatingCategory ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
