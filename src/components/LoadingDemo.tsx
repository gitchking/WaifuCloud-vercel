import { LoadingSpinner, WallpaperGridSkeleton, CategoryHeadingSkeleton } from "./LoadingSpinner";

// Demo component to showcase the loading animations
export const LoadingDemo = () => {
  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">Loading Spinners</h2>
        <div className="flex gap-8 items-center">
          <LoadingSpinner size="sm" text="Small" />
          <LoadingSpinner size="md" text="Medium" />
          <LoadingSpinner size="lg" text="Large" />
          <LoadingSpinner size="xl" text="Extra Large" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Category Heading Skeleton</h2>
        <CategoryHeadingSkeleton />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Wallpaper Grid Skeleton</h2>
        <WallpaperGridSkeleton />
      </div>
    </div>
  );
};