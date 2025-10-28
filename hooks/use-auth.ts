import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser({ email: session.user.email || "" });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && session.user) {
          setUser({ email: session.user.email || "" });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setLoginLoading(true);
    setLoginError(null);
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !data.session) {
      setUser(null);
      setLoginError(error?.message || "Login failed. Please try again.");
    } else {
      setUser({ email: data.session.user.email || "" });
    }
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return {
    user,
    authLoading,
    loginLoading,
    loginError,
    setLoginError,
    handleLogin,
    handleLogout,
  };
}
