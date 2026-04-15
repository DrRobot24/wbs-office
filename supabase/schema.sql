-- ═══════════════════════════════════════════════
-- WBS Office — Schema Supabase
-- ═══════════════════════════════════════════════
-- Esegui questo SQL nella Supabase SQL Editor
-- per creare la tabella e le policy RLS necessarie.

-- 0. Enum ruolo utente
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. Tabella progetti
CREATE TABLE IF NOT EXISTS projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titolo     TEXT NOT NULL DEFAULT 'Nuovo Progetto',
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Row Level Security — ogni utente vede solo i propri dati
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: INSERT
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Indice per query rapide
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- 4. Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════
-- 5. Tabella profili utente
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT DEFAULT '',
  company     TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  role        user_role NOT NULL DEFAULT 'user',
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ogni utente vede e modifica solo il proprio profilo
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: aggiorna updated_at
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. Funzione per creare profilo automaticamente al signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger su auth.users → crea profilo automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════
-- 7. Tabella condivisione progetti
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS project_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- L'admin che ha condiviso può gestire le condivisioni
CREATE POLICY "Admin can manage own shares"
  ON project_shares FOR ALL
  USING (auth.uid() = shared_by);

-- L'utente può vedere le proprie condivisioni
CREATE POLICY "Users can see shares with them"
  ON project_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shares_user ON project_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_project ON project_shares(project_id);

-- ═══════════════════════════════════════════════
-- 8. Policy aggiuntive: accesso ai progetti condivisi
-- ═══════════════════════════════════════════════

-- SELECT: utente vede anche i progetti condivisi con lui
CREATE POLICY "Users can read shared projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_shares ps
      WHERE ps.project_id = id AND ps.user_id = auth.uid()
    )
  );

-- UPDATE: utente può modificare i progetti condivisi con lui
CREATE POLICY "Users can update shared projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_shares ps
      WHERE ps.project_id = id AND ps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_shares ps
      WHERE ps.project_id = id AND ps.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════
-- 9. Policy profili: admin vede i profili degli utenti che ha creato
-- ═══════════════════════════════════════════════
CREATE POLICY "Admin can read created users profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_p
      WHERE admin_p.id = auth.uid()
        AND admin_p.role = 'admin'
    )
    AND (created_by = auth.uid() OR id = auth.uid())
  );

-- ═══════════════════════════════════════════════
-- 10. Funzione RPC: admin invita utente
-- ═══════════════════════════════════════════════
-- NOTA: La creazione utente via auth.admin richiede la service_role key
-- (lato server / Edge Function). Per semplicità usiamo signUp client-side
-- e poi l'admin collega l'utente via created_by.

-- ═══════════════════════════════════════════════
-- 11. Migrazione: colonne mancanti in profiles
-- ═══════════════════════════════════════════════
-- Esegui questo blocco nel Supabase SQL Editor se la tabella profiles
-- esiste già senza le colonne role e created_by (ALTER è idempotente).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role        TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by  UUID REFERENCES auth.users(id);

-- Policy: Admin può aggiornare i profili degli utenti che ha creato
-- (necessario per il flow di createUser con ripristino sessione)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admin can update created users profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin can update created users profiles"
        ON profiles FOR UPDATE
        USING (created_by = auth.uid())
        WITH CHECK (created_by = auth.uid());
    $policy$;
  END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 12. Tabella Activity Log (audit trail)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,          -- es: project.create, node.update, share.add
  target_type TEXT NOT NULL,          -- es: project, node, share, user
  target_id   TEXT,                   -- id del progetto/nodo (può essere null)
  details     JSONB DEFAULT '{}',     -- dettagli extra (titolo, campo modificato, ecc.)
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- L'utente può inserire i propri log
CREATE POLICY "Users can insert own logs"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- L'utente vede solo i propri log
CREATE POLICY "Users can read own logs"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- L'admin vede i log degli utenti che ha creato
CREATE POLICY "Admin can read created users logs"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = activity_log.user_id
        AND p.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
