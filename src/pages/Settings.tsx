import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [nsfwEnabled, setNsfwEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nsfw-enabled");
    setNsfwEnabled(saved === "true");
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleNSFWToggle = (checked: boolean) => {
    setNsfwEnabled(checked);
    localStorage.setItem("nsfw-enabled", checked.toString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-16">
        <Card className="max-w-2xl mx-auto p-8 shadow-card animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 rounded-full gradient-primary items-center justify-center mb-4">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your Proxima experience
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="nsfw-toggle" className="text-base font-medium">
                  Show NSFW Content
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display adult content wallpapers (18+). Only available to logged-in users.
                </p>
              </div>
              <Switch
                id="nsfw-toggle"
                checked={nsfwEnabled}
                onCheckedChange={handleNSFWToggle}
              />
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
