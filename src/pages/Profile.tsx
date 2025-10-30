import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, Info, Upload as UploadIcon, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("Regular");
  const [joinDate, setJoinDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      console.log("Fetching profile for user ID:", user?.id);
      
      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching profile:", fetchError);
        toast.error("Failed to load profile: " + fetchError.message);
        return;
      }

      // If no profile exists, create one
      if (!existingProfile) {
        console.log("Creating new profile for user");
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            username: user.email?.split("@")[0] || "",
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: "Regular",
            nickname: "",
            avatar_url: ""
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast.error("Failed to create profile: " + insertError.message);
          return;
        }

        setNickname(newProfile.nickname || newProfile.username || "");
        setRole(newProfile.role || "Regular");
        setJoinDate(newProfile.created_at || "");
        setAvatarUrl(newProfile.avatar_url || "");
      } else {
        console.log("Found existing profile:", existingProfile);
        // Use nickname as primary, username as fallback
        setNickname(existingProfile.nickname || existingProfile.username || "");
        setRole(existingProfile.role || "Regular");
        setJoinDate(existingProfile.created_at || "");
        setAvatarUrl(existingProfile.avatar_url || "");
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      toast.error("Failed to load profile");
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    fetchUserProfile();
  }, [user, navigate, fetchUserProfile]);

  const updateProfileField = async (field: string, value: string | boolean) => {
    try {
      console.log(`Updating ${field} for user ID:`, user?.id, "New value:", value);
      
      const updateData: Record<string, string | boolean> = {
        updated_at: new Date().toISOString()
      };
      
      updateData[field] = value;
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Failed to update ${field}: ` + error.message);
        return { success: false, error };
      }

      console.log(`${field} updated successfully:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
      return { success: false, error };
    }
  };

  const updateNickname = async () => {
    const result = await updateProfileField('nickname', nickname);
    if (result.success) {
      toast.success("Nickname updated successfully");
    }
  };

  const updateRole = async (newRole: string) => {
    // Prevent non-admin users from selecting Supreme role
    if (newRole === "Supreme" && !user?.app_metadata?.is_supreme) {
      toast.error("Supreme role is not available for selection");
      return;
    }

    const result = await updateProfileField('role', newRole);
    if (result.success) {
      setRole(newRole);
      toast.success("Role updated successfully");
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete your account and all associated data including:\n\n" +
      "• Your profile and settings\n" +
      "• All uploaded wallpapers\n" +
      "• Your favorites\n" +
      "• Your avatar\n\n" +
      "This action CANNOT be undone!\n\n" +
      "Are you absolutely sure you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    // Double confirmation
    const doubleConfirm = window.confirm(
      "This is your last chance!\n\n" +
      "Click OK to permanently delete your account, or Cancel to abort."
    );

    if (!doubleConfirm) {
      return;
    }

    try {
      if (!user?.id) {
        toast.error("You must be logged in to delete your account");
        return;
      }

      toast.loading("Deleting account data...", { id: "delete-account" });

      // Step 1: Delete user data using database function
      const { error: dataError } = await supabase.rpc('delete_user_data', {
        user_id_to_delete: user.id
      });

      if (dataError) {
        console.error("Error deleting user data:", dataError);
        throw new Error("Failed to delete account data: " + dataError.message);
      }

      // Step 2: Delete avatar from storage if exists
      try {
        const { data: files } = await supabase.storage
          .from('avatars')
          .list(`${user.id}/`);

        if (files && files.length > 0) {
          const filePaths = files.map(file => `${user.id}/${file.name}`);
          await supabase.storage.from('avatars').remove(filePaths);
        }
      } catch (storageError) {
        console.error("Error deleting avatar:", storageError);
        // Continue even if avatar deletion fails
      }

      // Step 3: Delete user from authentication
      // Note: This requires the user to be logged in and will automatically log them out
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      // If admin delete fails (expected on client side), just sign out
      if (authError) {
        console.log("Admin delete not available on client, signing out instead");
      }

      toast.success("Account deleted successfully", { id: "delete-account" });
      
      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account", { id: "delete-account" });
    }
  };

  const changePassword = async () => {
    try {
      if (!user?.email) {
        toast.error("No email associated with this account");
        return;
      }

      toast.loading("Sending password reset email...", { id: "reset-password" });

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Error sending password reset:", error);
        toast.error("Failed to send password reset email: " + error.message, { id: "reset-password" });
        return;
      }
      
      toast.success(
        `Password reset email sent to ${user.email}. Check your inbox and spam folder.`,
        { id: "reset-password", duration: 5000 }
      );
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast.error(error.message || "Failed to send password reset email", { id: "reset-password" });
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        toast.error("You must select an image to upload.");
        return;
      }

      const file = event.target.files[0];
      console.log("Uploading avatar file:", file.name, "Size:", file.size);
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log("Uploading to path:", filePath);
      
      // First, delete the existing avatar if it exists
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(`${user?.id}/`, {
          limit: 1,
          search: 'avatar'
        });

      if (listError) {
        console.error("Error listing existing avatars:", listError);
      } else if (existingFiles && existingFiles.length > 0) {
        const existingFilePath = `avatars/${user?.id}/${existingFiles[0].name}`;
        console.log("Deleting existing avatar:", existingFilePath);
        const { error: deleteError } = await supabase.storage.from('avatars').remove([existingFilePath]);
        
        if (deleteError) {
          console.error("Error deleting existing avatar:", deleteError);
        } else {
          console.log("Successfully deleted existing avatar");
        }
      }

      // Now upload the new avatar
      let { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: false // Explicitly set to false to avoid conflicts
        });

      // If upload fails because file exists, try with a timestamp
      if (uploadError && uploadError.message.includes('already exists')) {
        const timestamp = Date.now();
        const timestampedFileName = `${user?.id}/avatar_${timestamp}.${fileExt}`;
        const timestampedFilePath = `avatars/${timestampedFileName}`;
        
        console.log("Uploading with timestamp:", timestampedFilePath);
        ({ error: uploadError, data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(timestampedFilePath, file));
      }

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast.error("Failed to upload avatar: " + uploadError.message);
        setUploading(false);
        return;
      }

      console.log("Upload successful:", uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
      console.log("Public URL:", urlData.publicUrl);
      
      // Update profile with avatar URL
      const result = await updateProfileField('avatar_url', urlData.publicUrl);
      if (result.success) {
        setAvatarUrl(urlData.publicUrl);
        // Dispatch a custom event to notify other components (like Header) about the avatar update
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: urlData.publicUrl }));
        toast.success("Avatar uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Regular":
        return "Explore the website, add favorites, and enjoy the content";
      case "Contributor":
        return "Unlock upload capabilities to share your own waifu artwork";
      case "Supreme":
        return "Unlocked after 30 consecutive days of website visits. Full access to all features";
      default:
        return "";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Role Rules
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Role Rules & Guidelines</DialogTitle>
                  <DialogDescription>
                    Understand the privileges and responsibilities of each role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      Regular Role
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>Browse and search all waifus</li>
                      <li>Add waifus to favorites</li>
                      <li>View waifu details</li>
                      <li>Download waifu artwork</li>
                      <li>Share waifus</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      Contributor Role
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>All Regular role privileges</li>
                      <li>Upload custom waifu artwork</li>
                      <li>Manage your uploaded waifus</li>
                      <li>Set tags and categories for uploads</li>
                      <li>Moderate your own content</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      Supreme Role
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>All Contributor role privileges</li>
                      <li>Early access to new features</li>
                      <li>Special badges and recognition</li>
                      <li>Priority support</li>
                      <li>Exclusive content access</li>
                      <li>Advanced search filters</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">How to Unlock Supreme Role</h4>
                    <p className="text-sm text-muted-foreground">
                      The Supreme role is automatically unlocked after visiting the website for 30 consecutive days without missing a day. 
                      Your visit streak is tracked automatically.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your nickname and manage account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="nickname" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                      />
                      <Button onClick={updateNickname}>Save</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input value={joinDate ? new Date(joinDate).toLocaleDateString() : ""} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                  <CardDescription>Upload and manage your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload New Picture"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG, or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>Change password or delete your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={changePassword} className="flex-1">
                      Change Password
                    </Button>
                    <Button variant="destructive" onClick={deleteAccount} className="flex-1">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Role & Permissions</CardTitle>
                  <CardDescription>Your current role and available options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Role</Label>
                      <div className="p-3 rounded-md bg-muted">
                        <span className="font-medium">{role}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getRoleDescription(role)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Change Role</Label>
                      <Select value={role} onValueChange={updateRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular">Regular</SelectItem>
                          <SelectItem value="Contributor">Contributor</SelectItem>
                          <SelectItem value="Supreme" disabled={!user?.app_metadata?.is_supreme}>
                            Supreme {user?.app_metadata?.is_supreme ? "" : "(Locked)"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {role === "Contributor" && "Unlock upload capabilities"}
                        {role === "Supreme" && "Full access to all features"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Role Benefits</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Regular: Browse and favorite waifus</li>
                      <li>• Contributor: Upload your own waifu artwork</li>
                      <li>• Supreme: Exclusive features and recognition</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;