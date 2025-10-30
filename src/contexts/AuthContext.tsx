import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("user_id", session.user.id)
              .single();
            
            setIsAdmin(profile?.is_admin || false);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.is_admin || false);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", data.user.id)
        .single();
      
      if (profileError || !profile) {
        // Profile doesn't exist - create a new one
        const { error: createError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          username: email.split("@")[0],
          is_admin: false,
        });
        
        if (createError) {
          console.error("Error creating profile:", createError);
          await supabase.auth.signOut();
          return { 
            error: new Error("Failed to create profile") as any
          };
        }
      }
      
      navigate("/");
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
        }
      },
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      // Create profile (only if it doesn't exist)
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: data.user.id,
        username: username || email.split("@")[0],
        is_admin: false,
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: true
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // With email confirmation disabled, we get a session immediately
      // Navigate to home page
      if (data.session) {
        navigate("/");
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, signIn, signUp, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
