import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Edit, Trash2, FolderOpen, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  
  // Wallpaper upload states
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [credit, setCredit] = useState("");
  const [isNSFW, setIsNSFW] = useState(false);
  const [orientation, setOrientation] = useState("horizontal");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Category management states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: true
  });
  const [categoryThumbnail, setCategoryThumbnail] = useState<File | null>(null);
  const [categoryThumbnailPreview, setCategoryThumbnailPreview] = useState<string | null>(null);
  const [adminCategorySearch, setAdminCategorySearch] = useState("");
  const [showAdminCategoryDropdown, setShowAdminCategoryDropdown] = useState(false);

  // Filter categories for admin upload
  const filteredAdminCategories = categories.filter(cat => 
    cat.is_active && (
      cat.name.toLowerCase().includes(adminCategorySearch.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(adminCategorySearch.toLowerCase()))
    )
  );

  useEffect(() => {
    if (user && isAdmin) {
      fetchCategories();
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      console.log("Categories query result:", { data, error });
      
      if (error) throw error;
      setCategories(data || []);
      console.log("Categories set:", data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(`Failed to load categories: ${error}`);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCategoryThumbnailPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      // Check if user is logged in first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      // For category creation, only admins should be allowed
      // But for regular users, we should allow them to upload without creating categories
      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (categoryThumbnail) {
        const fileExt = categoryThumbnail.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category-thumbnails')
          .upload(fileName, categoryThumbnail);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('category-thumbnails')
          .getPublicUrl(uploadData.path);

        thumbnailUrl = publicUrl;
      }
      
      if (editingCategory) {
        // Only admins can edit categories
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          toast.error("Admin privileges required to edit categories");
          return;
        }

        // Update existing category
        const updateData: {
          name: string;
          description: string | null;
          is_active: boolean;
          thumbnail_url?: string;
        } = {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null,
          is_active: categoryForm.is_active
        };

        if (thumbnailUrl) {
          updateData.thumbnail_url = thumbnailUrl;
        }

        console.log('Updating category with data:', updateData);

        const { error } = await supabase
          .from("categories")
          .update(updateData)
          .eq("id", editingCategory.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success("Category updated successfully");
      } else {
        // Check if category already exists
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("name", categoryForm.name.trim())
          .single();

        if (existingCategory) {
          // Category already exists, no need to create
          toast.success("Using existing category");
        } else {
          // Only admins can create new categories
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', session.user.id)
            .single();

          if (profileError || !profile?.is_admin) {
            // Regular users can't create categories, but they can still upload
            toast.info("Using existing categories. Contact admin to create new categories.");
          } else {
            // Admin can create new category
            const insertData: {
              name: string;
              description: string | null;
              is_active: boolean;
              thumbnail_url?: string;
            } = {
              name: categoryForm.name.trim(),
              description: categoryForm.description.trim() || null,
              is_active: categoryForm.is_active
            };

            // Only add thumbnail_url if it exists
            if (thumbnailUrl) {
              insertData.thumbnail_url = thumbnailUrl;
            }

            console.log('Creating category with data:', insertData);

            const { error } = await supabase
              .from("categories")
              .insert(insertData);

            if (error) {
              console.error('Insert error:', error);
              console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              });
              throw error;
            }
            toast.success("Category created successfully");
          }
        }
      }

      // Reset form and refresh categories
      setCategoryForm({ name: "", description: "", is_active: true });
      setCategoryThumbnail(null);
      setCategoryThumbnailPreview(null);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: unknown) {
      console.error('Category save error:', error);
      console.error('Error type:', typeof error);
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      
      let errorMessage = "Unknown error";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Handle Supabase error objects
        const supabaseError = error as { message?: string; error_description?: string; details?: string };
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error_description) {
          errorMessage = supabaseError.error_description;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else {
          errorMessage = `Object error: ${JSON.stringify(error)}`;
        }
      }
      
      toast.error(`Failed to save category: ${errorMessage}`);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active
    });
    setCategoryThumbnailPreview(category.thumbnail_url);
    setCategoryThumbnail(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !title || !category) {
      toast.error("Please fill in all required fields and select an image");
      return;
    }

    setUploading(true);

    try {
      // Get auth session for edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to upload");
      }

      // Upload image via edge function (bypasses CORS)
      const formData = new FormData();
      formData.append("file", image);

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
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("Image upload failed - no URL returned");
      }

      const imageUrl = uploadResult.url;

      const { error: insertError } = await supabase.from("wallpapers").insert({
        title,
        image_url: imageUrl.trim(),
        tags: tags.split(",").map((tag) => tag.trim()),
        category,
        credit: credit || null,
        is_nsfw: isNSFW,
        orientation, // Add orientation to the insert
        uploaded_by: user.id,
      });

      if (insertError) throw insertError;

      toast.success("Wallpaper uploaded successfully!");
      setTitle("");
      setTags("");
      setCategory("");
      setCredit("");
      setIsNSFW(false);
      setOrientation("horizontal");
      setImage(null);
      setImagePreview(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to upload waifu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-full gradient-primary items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage wallpapers and categories with full control
            </p>
          </div>

          <Tabs defaultValue="wallpapers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="wallpapers">Upload Waifus</TabsTrigger>
              <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="wallpapers">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <Card className="p-6 shadow-card animate-slide-up">
                  <h2 className="text-xl font-display font-bold mb-4">Upload Waifu</h2>

                  {/* Test Upload Button */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        console.log('Testing wallpaper upload functionality...');
                        
                        // Create a test image blob (1x1 pixel red image)
                        const canvas = document.createElement('canvas');
                        canvas.width = 1;
                        canvas.height = 1;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.fillStyle = '#ff0000';
                          ctx.fillRect(0, 0, 1, 1);
                        }
                        
                        canvas.toBlob(async (blob) => {
                          if (!blob) {
                            toast.error('Failed to create test image');
                            return;
                          }
                          
                          const testFile = new File([blob], 'test-wallpaper.png', { type: 'image/png' });
                          
                          const testData = {
                            title: `Test Wallpaper ${Date.now()}`,
                            tags: ['test', 'admin', 'sample'],
                            category: categories.find(cat => cat.is_active)?.name || 'Test',
                            credit: 'Admin Test',
                            is_nsfw: false,
                            orientation: 'horizontal'
                          };
                          
                          console.log('Test wallpaper data:', testData);
                          
                          // Get auth session
                          const { data: { session } } = await supabase.auth.getSession();
                          
                          if (!session) {
                            toast.error('Not authenticated');
                            return;
                          }
                          
                          // Upload test image
                          const formData = new FormData();
                          formData.append("file", testFile);
                          
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
                            const errorText = await uploadResponse.text();
                            toast.error(`Upload test failed: ${errorText}`);
                            return;
                          }
                          
                          const uploadResult = await uploadResponse.json();
                          
                          if (!uploadResult.success || !uploadResult.url) {
                            toast.error('Test image upload failed - no URL returned');
                            return;
                          }
                          
                          // Insert test wallpaper
                          const { data, error } = await supabase
                            .from("wallpapers")
                            .insert({
                              title: testData.title,
                              image_url: uploadResult.url.trim(),
                              tags: testData.tags,
                              category: testData.category,
                              credit: testData.credit,
                              is_nsfw: testData.is_nsfw,
                              orientation: testData.orientation,
                              uploaded_by: user.id,
                            })
                            .select();
                          
                          console.log('Test wallpaper result:', { data, error });
                          
                          if (error) {
                            console.error('Test wallpaper error:', error);
                            toast.error(`Test wallpaper failed: ${error.message}`);
                          } else {
                            toast.success('Test wallpaper uploaded successfully!');
                            console.log('Test wallpaper created:', data);
                          }
                        }, 'image/png');
                        
                      } catch (err) {
                        console.error('Test upload error:', err);
                        toast.error('Test upload failed with exception');
                      }
                    }}
                    className="mb-4 w-full"
                  >
                    🧪 Test Wallpaper Upload
                  </Button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="admin-title"
                  type="text"
                  placeholder="Enter wallpaper title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                {categories.filter(cat => cat.is_active).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active categories available. Create categories in the "Manage Categories" tab first.
                  </p>
                ) : (
                  <div className="relative">
                    {/* Category Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type category name..."
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setShowAdminCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAdminCategoryDropdown(false), 200)}
                        className="pl-10"
                        required
                      />
                    </div>

                    {/* Autocomplete Suggestions */}
                    {showAdminCategoryDropdown && category && filteredAdminCategories.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                        {filteredAdminCategories.slice(0, 5).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex flex-col"
                            onClick={() => {
                              setCategory(cat.name);
                              setShowAdminCategoryDropdown(false);
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
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-orientation">
                  Orientation
                </Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger id="admin-orientation">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal (16:9)</SelectItem>
                    <SelectItem value="vertical">Vertical (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-tags">Tags</Label>
                <Textarea
                  id="admin-tags"
                  placeholder="Enter tags separated by commas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-credit">Credit</Label>
                <Input
                  id="admin-credit"
                  type="text"
                  placeholder="Artist name or source"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="admin-nsfw" className="text-base font-medium">
                    NSFW Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mark as adult content (18+)
                  </p>
                </div>
                <Switch
                  id="admin-nsfw"
                  checked={isNSFW}
                  onCheckedChange={setIsNSFW}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-image">
                  Image <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="admin-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {image && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {image.name}
                  </p>
                )}
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
                    {imagePreview ? (
                      <div className="relative bg-background rounded overflow-hidden border">
                        <div 
                          className={
                            orientation === "horizontal" 
                              ? "w-64 h-36" // 16:9 aspect ratio
                              : "w-36 h-64" // 9:16 aspect ratio
                          }
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-8">
                        <p>Upload an image to see preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Wallpaper Card Preview</h3>
                <div className="bg-muted rounded-lg p-4">
                  {imagePreview ? (
                    <div className="group overflow-hidden border-border/50 bg-card shadow-card transition-all duration-300">
                      {/* Image */}
                      <div className="relative overflow-hidden bg-muted">
                        <div 
                          className={
                            orientation === "horizontal" 
                              ? "aspect-[16/9]" // 16:9 aspect ratio
                              : "aspect-[9/16]" // 9:16 aspect ratio
                          }
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 space-y-2">
                        <h3 className="font-display font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {title || "Wallpaper Title"}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      <p>Upload an image to see card preview</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Form */}
                <Card className="p-6 shadow-card">
                  <h2 className="text-xl font-display font-bold mb-4">
                    {editingCategory ? "Edit Category" : "Create Category"}
                  </h2>
                  
                  {/* Debug Test Button */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        console.log('Testing simple category creation...');
                        
                        const testData = {
                          name: `Test Category ${Date.now()}`,
                          description: 'Test description',
                          is_active: true
                        };
                        
                        console.log('Test data:', testData);
                        
                        const { data, error } = await supabase
                          .from('categories')
                          .insert(testData)
                          .select();
                        
                        console.log('Test result:', { data, error });
                        
                        if (error) {
                          console.error('Test error details:', {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code
                          });
                          toast.error(`Test failed: ${error.message}`);
                        } else {
                          toast.success('Test category created successfully!');
                          fetchCategories();
                        }
                      } catch (err) {
                        console.error('Test catch error:', err);
                        toast.error('Test failed with exception');
                      }
                    }}
                    className="mb-4"
                  >
                    🧪 Test Category Creation
                  </Button>

                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">
                        Category Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="category-name"
                        type="text"
                        placeholder="e.g., Anime, Nature, Gaming"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category-thumbnail">Category Thumbnail</Label>
                      <Input
                        id="category-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryThumbnailChange}
                      />
                      {categoryThumbnailPreview && (
                        <div className="mt-2">
                          <img 
                            src={categoryThumbnailPreview} 
                            alt="Category thumbnail preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        placeholder="Brief description of this category"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="category-active" className="text-base font-medium">
                          Active Category
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show this category to users
                        </p>
                      </div>
                      <Switch
                        id="category-active"
                        checked={categoryForm.is_active}
                        onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingCategory ? "Update Category" : "Create Category"}
                      </Button>
                      {editingCategory && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryForm({ name: "", description: "", is_active: true });
                            setCategoryThumbnail(null);
                            setCategoryThumbnailPreview(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                {/* Categories List */}
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold">Categories</h2>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchCategories}
                      >
                        Refresh
                      </Button>
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{categories.length} categories</span>
                    </div>
                  </div>

                  {loadingCategories ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading categories...</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No categories yet. Create your first category!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                          {category.thumbnail_url && (
                            <img 
                              src={category.thumbnail_url} 
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{category.name}</h3>
                              {!category.is_active && (
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;