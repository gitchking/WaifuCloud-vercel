import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TestEnv = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Check if environment variables are available
    setEnvVars({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "NOT SET",
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "NOT SET",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-16">
        <Card className="max-w-2xl mx-auto p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold mb-2">
              Environment Variables Test
            </h1>
            <p className="text-muted-foreground">
              Checking if environment variables are properly loaded
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">VITE_SUPABASE_URL:</h2>
              <p className="text-sm break-all p-2 bg-muted rounded">
                {envVars.VITE_SUPABASE_URL}
              </p>
            </div>
            
            <div>
              <h2 className="font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY:</h2>
              <p className="text-sm break-all p-2 bg-muted rounded">
                {envVars.VITE_SUPABASE_PUBLISHABLE_KEY}
              </p>
            </div>
            
            <div className="pt-4">
              <Button onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TestEnv;