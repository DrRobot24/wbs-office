/**
 * Admin Service — Funzioni per la gestione utenti e condivisione progetti.
 *
 * Accessibili solo agli utenti con ruolo 'admin'.
 * La creazione utente usa signUp di Supabase Auth (client-side),
 * poi collega l'utente all'admin tramite il campo created_by in profiles.
 */

import { supabase } from "./supabaseClient";
import { logActivity } from "./activityLogger";

/**
 * Crea un nuovo utente e lo collega all'admin corrente.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {'user'|'moderator'} role
 * @returns {{ data, error }}
 */
export async function createUser(email, password, fullName, role = "user") {
  if (!supabase) return { error: { message: "Supabase non configurato" } };

  // 1. Salva la sessione admin PRIMA che signUp la sostituisca con quella del nuovo utente
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  const { data: { user: admin } } = await supabase.auth.getUser();
  if (!admin) return { error: { message: "Non autenticato" } };

  // 2. Crea il nuovo utente — con autoconfirm attivo questo sostituisce la sessione corrente
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) {
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    return { error: signUpError };
  }

  const newUserId = signUpData.user?.id;
  if (!newUserId) {
    if (adminSession) await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
    return { error: { message: "Utente creato ma ID non disponibile" } };
  }

  // 3. Aggiorna il profilo del nuovo utente (siamo temporaneamente loggati come lui → può aggiornare il proprio profilo)
  await supabase
    .from("profiles")
    .update({ role, created_by: admin.id, full_name: fullName })
    .eq("id", newUserId);

  // 4. Disconnetti il nuovo utente e ripristina la sessione admin
  await supabase.auth.signOut();
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  logActivity("user.create", "user", newUserId, { email, fullName, role });
  return { data: { id: newUserId, email, full_name: fullName, role }, error: null };
}

/**
 * Carica la lista degli utenti creati dall'admin corrente.
 * @returns {{ data: Array, error }}
 */
export async function getMyUsers() {
  if (!supabase) return { data: [], error: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: { message: "Non autenticato" } };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true });

  return { data: data || [], error };
}

/**
 * Condividi un progetto con un utente.
 * @param {string} projectId
 * @param {string} userId
 * @returns {{ error }}
 */
export async function shareProject(projectId, userId) {
  if (!supabase) return { error: { message: "Supabase non configurato" } };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Non autenticato" } };

  const { error } = await supabase.from("project_shares").upsert(
    {
      project_id: projectId,
      user_id: userId,
      shared_by: user.id,
    },
    { onConflict: "project_id,user_id" },
  );

  if (!error) logActivity("share.add", "share", projectId, { userId });
  return { error };
}

/**
 * Rimuovi la condivisione di un progetto con un utente.
 * @param {string} projectId
 * @param {string} userId
 * @returns {{ error }}
 */
export async function unshareProject(projectId, userId) {
  if (!supabase) return { error: { message: "Supabase non configurato" } };

  const { error } = await supabase
    .from("project_shares")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (!error) logActivity("share.remove", "share", projectId, { userId });
  return { error };
}

/**
 * Carica le condivisioni per un dato progetto.
 * @param {string} projectId
 * @returns {{ data: Array, error }}
 */
export async function getProjectShares(projectId) {
  if (!supabase) return { data: [], error: null };

  const { data: shares, error } = await supabase
    .from("project_shares")
    .select("user_id, created_at")
    .eq("project_id", projectId);

  if (error || !shares || shares.length === 0) return { data: shares || [], error };

  // Carica profili separatamente
  const userIds = shares.map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .in("id", userIds);

  const profileMap = {};
  for (const p of profiles || []) profileMap[p.id] = p;

  const enriched = shares.map((s) => ({
    ...s,
    profiles: profileMap[s.user_id] || null,
  }));

  return { data: enriched, error: null };
}

/**
 * Carica tutte le condivisioni create dall'admin corrente (tutti i progetti).
 * @returns {{ data: Array, error }}
 */
export async function getAllMyShares() {
  if (!supabase) return { data: [], error: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: { message: "Non autenticato" } };

  const { data: shares, error } = await supabase
    .from("project_shares")
    .select("id, project_id, user_id, created_at")
    .eq("shared_by", user.id)
    .order("created_at", { ascending: false });

  if (error || !shares || shares.length === 0) return { data: shares || [], error };

  // Carica profili e progetti separatamente
  const userIds = [...new Set(shares.map((s) => s.user_id))];
  const projectIds = [...new Set(shares.map((s) => s.project_id))];

  const [{ data: profiles }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role").in("id", userIds),
    supabase.from("projects").select("id, titolo").in("id", projectIds),
  ]);

  const profileMap = {};
  for (const p of profiles || []) profileMap[p.id] = p;
  const projectMap = {};
  for (const p of projects || []) projectMap[p.id] = p;

  const enriched = shares.map((s) => ({
    ...s,
    profiles: profileMap[s.user_id] || null,
    projects: projectMap[s.project_id] || null,
  }));

  return { data: enriched, error: null };
}
