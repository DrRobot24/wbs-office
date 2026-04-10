import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

/**
 * AuthProvider — Gestisce lo stato di autenticazione.
 *
 * Se Supabase non è configurato, l'app funziona in modalità offline
 * e user sarà sempre null (nessun login richiesto).
 *
 * Quando Supabase è attivo, ascolta i cambiamenti di sessione
 * e fornisce metodi per login/logout/signup.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const cloud = isSupabaseConfigured();
  const [loading, setLoading] = useState(cloud);

  // Carica profilo dall'utente
  const fetchProfile = async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    console.log("[Auth] Profilo caricato:", data);
    setProfile(data ?? null);
  };

  useEffect(() => {
    if (!cloud || !supabase) {
      return;
    }

    // Controlla sessione attiva
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      setLoading(false);
    });

    // Ascolta cambiamenti auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [cloud]);

  const signIn = async (email, password) => {
    if (!supabase) return { error: { message: "Supabase non configurato" } };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email, password) => {
    if (!supabase) return { error: { message: "Supabase non configurato" } };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!supabase || !user) return { error: { message: "Non autenticato" } };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (!error) await fetchProfile(user.id);
    return { error };
  };

  const value = {
    user,
    profile,
    loading,
    cloud, // true se Supabase è configurato
    isAdmin: profile?.role === "admin",
    isModerator: profile?.role === "moderator",
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  return ctx;
}
