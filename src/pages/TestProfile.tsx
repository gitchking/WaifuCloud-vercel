import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, User } from "lucide-react";

const TestProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    fetchProfileData();
  }, [user, navigate, fetchProfileData]);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching profile for user ID:", user?.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, role, avatar_url")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile: " + error.message);
        return;
      }

      console.log("Profile data:", data);
      setNickname(data.nickname || "");
      setRole(data.role || "");
      setAvatarUrl(data.avatar_url || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async () => {
    try {
      console.log("Updating profile for user ID:", user?.id);
      console.log("Updating with data:", { nickname, role });
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          nickname,
          role,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile: " + error.message);
        return;
      }

      toast.success("Profile updated successfully");
      fetchProfileData(); // Refresh the data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const testAvatarUpload = async () => {
    try {
      // Create a simple test image as base64
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.fillText('Test', 30, 55);
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], "test-avatar.png", { type: "image/png" });
        const filePath = `avatars/${user?.id}/test-avatar.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          toast.error("Failed to upload avatar: " + uploadError.message);
          return;
        }

        // Get public URL
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        // Update profile with avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error("Error updating profile with avatar:", updateError);
          toast.error("Failed to update profile with avatar: " + updateError.message);
          return;
        }

        setAvatarUrl(data.publicUrl);
        toast.success("Avatar uploaded successfully!");
      }, 'image/png');
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Profile Test</h1>
            <p className="text-muted-foreground">Test profile data synchronization with Supabase</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Data Test</CardTitle>
              <CardDescription>Test saving and retrieving profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <p>Loading profile data...</p>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>User ID</Label>
                      <Input value={user.id} disabled />
                    </div>
                    
                    <div>
                      <Label>Email</Label>
                      <Input value={user.email || ""} disabled />
                    </div>
                    
                    <div>
                      <Label>Nickname</Label>
                      <Input 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter nickname"
                      />
                    </div>
                    
                    <div>
                      <Label>Role</Label>
                      <Input 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Enter role"
                      />
                    </div>
                    
                    <div>
                      <Label>Avatar URL</Label>
                      <Input 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Avatar URL"
                      />
                    </div>
                    
                    {avatarUrl && (
                      <div>
                        <Label>Avatar Preview</Label>
                        <img 
                          src={avatarUrl} 
                          alt="Avatar preview" 
                          className="w-24 h-24 rounded-full object-cover border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button onClick={updateProfile}>
                      Update Profile
                    </Button>
                    <Button variant="outline" onClick={testAvatarUpload}>
                      <User className="h-4 w-4 mr-2" />
                      Test Avatar Upload
                    </Button>
                    <Button variant="outline" onClick={fetchProfileData}>
                      Refresh Data
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestProfile;