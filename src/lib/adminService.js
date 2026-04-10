/**
 * Admin Service — Funzioni per la gestione utenti e condivisione progetti.
 *
 * Accessibili solo agli utenti con ruolo 'admin'.
 * La creazione utente usa signUp di Supabase Auth (client-side),
 * poi collega l'utente all'admin tramite il campo created_by in profiles.
 */

import { supabase } from "./supabaseClient";

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

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();
  if (!admin) return { error: { message: "Non autenticato" } };

  // Crea utente via signUp (non fa logout dell'admin grazie a autoconfirm/invite)
  // NOTA: Supabase signUp in client non cambia la sessione corrente se l'utente
  // richiede conferma email. Se autoconfirm è attivo, i dati vengono salvati dopo.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) return { error: signUpError };

  const newUserId = signUpData.user?.id;
  if (!newUserId) return { error: { message: "Utente creato ma ID non disponibile" } };

  // Aggiorna il profilo con ruolo e created_by
  // Il trigger handle_new_user avrà già creato il profilo base
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role,
      created_by: admin.id,
      full_name: fullName,
    })
    .eq("id", newUserId);

  if (profileError) {
    console.warn("[Admin] Errore aggiornamento profilo:", profileError.message);
  }

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

  return { error };
}

/**
 * Carica le condivisioni per un dato progetto.
 * @param {string} projectId
 * @returns {{ data: Array, error }}
 */
export async function getProjectShares(projectId) {
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from("project_shares")
    .select("user_id, created_at, profiles:user_id(email, full_name, role)")
    .eq("project_id", projectId);

  return { data: data || [], error };
}
