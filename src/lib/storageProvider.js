/**
 * Storage Provider — Livello di astrazione per la persistenza dati.
 *
 * Espone un'interfaccia unica; l'implementazione concreta cambia in base
 * alla configurazione (localStorage offline vs Supabase cloud).
 *
 * Quando Supabase è configurato (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
 * e l'utente è autenticato, i dati vengono letti/scritti sulla tabella `projects`.
 * Altrimenti si usa localStorage come fallback trasparente.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient'

const STORAGE_KEY = 'wbs-projects'

/* ═══════════════════════════════════════
   localStorage provider (offline / dev)
   ═══════════════════════════════════════ */
const localProvider = {
  async loadProjects() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return null // segnala "nessun dato salvato"
  },

  async saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  },

  async saveProject(project) {
    // Salva l'intero array (localStorage non supporta update parziali efficienti)
    const all = await this.loadProjects() || []
    const idx = all.findIndex(p => p.id === project.id)
    if (idx >= 0) all[idx] = project
    else all.push(project)
    await this.saveProjects(all)
  },

  async deleteProject(projectId) {
    const all = await this.loadProjects() || []
    await this.saveProjects(all.filter(p => p.id !== projectId))
  },
}

/* ═══════════════════════════════════════
   Supabase provider (cloud / production)
   ═══════════════════════════════════════

   Schema atteso su Supabase:

   CREATE TABLE projects (
     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     titolo     TEXT NOT NULL DEFAULT 'Nuovo Progetto',
     data       JSONB NOT NULL DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- RLS: ogni utente vede solo i propri progetti
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users see own projects"
     ON projects FOR ALL
     USING (auth.uid() = user_id);

   -- Indice per query rapide
   CREATE INDEX idx_projects_user ON projects(user_id);
*/

const supabaseProvider = {
  async loadProjects() {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('projects')
      .select('id, titolo, data, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[Supabase] loadProjects error:', error.message)
      return null
    }

    // Ricostruisce l'array di progetti dal formato DB
    return data.map(row => ({
      ...row.data,
      id: row.id,
      titolo: row.titolo,
    }))
  },

  async saveProjects(projects) {
    if (!supabase) return
    // Batch upsert — usato per import/sync completo
    for (const p of projects) {
      await this.saveProject(p)
    }
  },

  async saveProject(project) {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        user_id: user.id,
        titolo: project.titolo,
        data: project,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) console.error('[Supabase] saveProject error:', error.message)
  },

  async deleteProject(projectId) {
    if (!supabase) return
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) console.error('[Supabase] deleteProject error:', error.message)
  },
}

/* ═══════════════════════════════════════
   Selettore automatico del provider
   ═══════════════════════════════════════ */

/**
 * Restituisce il provider attivo.
 * Se Supabase è configurato E l'utente è autenticato → supabaseProvider.
 * Altrimenti → localProvider (fallback trasparente).
 */
export async function getProvider() {
  if (isSupabaseConfigured() && supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return supabaseProvider
  }
  return localProvider
}

/**
 * Versione sincrona per check rapido.
 */
export function isCloudMode() {
  return isSupabaseConfigured()
}

export { localProvider, supabaseProvider }
