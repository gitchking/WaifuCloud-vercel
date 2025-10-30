import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MultipleImageUploadProps {
  images: File[];
  imagePreviews: string[];
  onImagesChange: (images: File[], previews: string[]) => void;
  maxImages?: number;
}

export const MultipleImageUpload = ({
  images,
  imagePreviews,
  onImagesChange,
  maxImages = 15,
}: MultipleImageUploadProps) => {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = images.length + newFiles.length;

      if (totalImages > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed per post`);
        return;
      }

      // Validate file sizes (max 5MB each)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error("Each image must be less than 5MB");
        return;
      }

      // Create previews for new images
      const newPreviews: string[] = [];
      let loadedCount = 0;

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string);
            loadedCount++;

            if (loadedCount === newFiles.length) {
              onImagesChange(
                [...images, ...newFiles],
                [...imagePreviews, ...newPreviews]
              );
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    onImagesChange(newImages, newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Images ({images.length}/{maxImages})
        </Label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("multiple-image-input")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        )}
      </div>

      <input
        id="multiple-image-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("multiple-image-input")?.click()}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to upload images or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxImages} images, max 5MB each
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Images will be displayed in a slider on the watch page
        </p>
      )}
    </div>
  );
};
