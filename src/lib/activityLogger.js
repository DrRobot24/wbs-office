/**
 * Activity Logger — Registra le azioni degli utenti nella tabella activity_log.
 *
 * Ogni azione viene scritta in modo fire-and-forget (non blocca l'UI).
 * Se Supabase non è configurato o l'utente non è autenticato, il log viene ignorato.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * Registra un'azione nel log.
 * @param {string} action      - Tipo azione (es: "project.create", "node.update")
 * @param {string} targetType  - Tipo target (es: "project", "node", "share", "user")
 * @param {string} [targetId]  - ID del target (progetto, nodo, ecc.)
 * @param {object} [details]   - Dettagli aggiuntivi (titolo, campo modificato, ecc.)
 */
export async function logActivity(action, targetType, targetId = null, details = {}) {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_log").insert({
      user_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch {
    // Fire-and-forget: non bloccare l'app se il logging fallisce
  }
}

/**
 * Carica il registro attività. L'admin vede anche i log degli utenti creati da lui.
 * @param {object} [filters] - Filtri opzionali
 * @param {string} [filters.userId] - Filtra per utente specifico
 * @param {number} [filters.limit]  - Numero massimo di risultati (default: 100)
 * @returns {{ data: Array, error }}
 */
export async function getActivityLog(filters = {}) {
  if (!supabase) return { data: [], error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: { message: "Non autenticato" } };

  let query = supabase
    .from("activity_log")
    .select("id, user_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(filters.limit || 100);

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return { data: data || [], error };

  // Arricchisci con email/nome utente
  const userIds = [...new Set(data.map((d) => d.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  const profileMap = {};
  for (const p of profiles || []) profileMap[p.id] = p;

  const enriched = data.map((d) => ({
    ...d,
    profile: profileMap[d.user_id] || null,
  }));

  return { data: enriched, error: null };
}
