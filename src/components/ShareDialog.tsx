import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Mail,
  Link2,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallpaper: {
    id: string;
    title: string;
    imageUrl: string;
  };
}

export const ShareDialog = ({ open, onOpenChange, wallpaper }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/watch/${wallpaper.id}`;
  const shareText = `Check out this amazing waifu: ${wallpaper.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleSocialShare = (platform: string) => {
    let url = "";
    
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(wallpaper.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(wallpaper.imageUrl, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    } catch (error) {
      console.error("Download error:", error);
      window.open(wallpaper.imageUrl, '_blank');
      toast.info("Opening image in new tab for download");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Waifu
          </DialogTitle>
          <DialogDescription>
            Share this amazing waifu with your friends
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <img 
              src={wallpaper.imageUrl} 
              alt={wallpaper.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{wallpaper.title}</p>
              <p className="text-xs text-muted-foreground">Waifu Cloud</p>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare("facebook")}
                className="flex items-center gap-2 justify-start"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare("twitter")}
                className="flex items-center gap-2 justify-start"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare("whatsapp")}
                className="flex items-center gap-2 justify-start"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare("email")}
                className="flex items-center gap-2 justify-start"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                Email
              </Button>
            </div>
          </div>

          {/* Download Option */}
          <div className="pt-3 border-t border-border">
            <Button
              variant="outline"
              onClick={handleDownloadImage}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};