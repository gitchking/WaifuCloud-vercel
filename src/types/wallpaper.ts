export interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  image_url: string;
  tags: string[];
  credit?: string;
  category: string;
  isNSFW: boolean;
  uploadedAt: string;
  created_at: string;
  uploadedBy?: string;
  orientation?: string; // "horizontal" or "vertical" - made optional to prevent issues with existing data
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  thumbnail_url?: string;
  count: number;
  is_active?: boolean;
}