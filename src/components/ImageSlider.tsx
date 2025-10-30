import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPreviewUrl, getThumbnailUrl } from "@/utils/imageOptimization";

interface ImageSliderProps {
  images: string[];
  alt: string;
}

export const ImageSlider = ({ images, alt }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Single image - no slider needed, but maintain 16:9 aspect ratio
  if (images.length === 1) {
    return (
      <div className="relative w-full">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={getPreviewUrl(images[0])}
            alt={alt}
            className="w-full h-full object-contain"
            style={{ objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      {/* Main Image - Always 16:9 aspect ratio */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={getPreviewUrl(images[currentIndex])}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          style={{ objectFit: 'contain' }}
          loading="lazy"
        />

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <img
                src={getThumbnailUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      {images.length > 1 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Use arrow keys or click thumbnails to navigate
        </p>
      )}
    </div>
  );
};
