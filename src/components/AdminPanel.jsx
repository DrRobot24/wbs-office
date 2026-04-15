import { useState, useEffect, useCallback } from "react";
import { createUser, getMyUsers, shareProject, unshareProject, getProjectShares, getAllMyShares } from "../lib/adminService";
import { getActivityLog } from "../lib/activityLogger";

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-400 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] font-bold text-sm text-black">
      ✅ {message}
    </div>
  );
}

export default function AdminPanel({ projects, onClose }) {
  const [tab, setTab] = useState("users"); // 'users' | 'shares' | 'activity'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toast, setToast] = useState("");

  // Activity log
  const [activityLog, setActivityLog] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityFilter, setActivityFilter] = useState(""); // user_id filter

  // Form nuovo utente
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Condivisione per progetto
  const [selectedProject, setSelectedProject] = useState("");
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  // Vista globale di tutte le condivisioni
  const [allShares, setAllShares] = useState([]);
  const [loadingAllShares, setLoadingAllShares] = useState(false);

  const showToast = useCallback((msg) => setToast(msg), []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data } = await getMyUsers();
    setUsers(data);
    setLoadingUsers(false);
  }, []);

  const fetchAllShares = useCallback(async () => {
    setLoadingAllShares(true);
    const { data, error } = await getAllMyShares();
    if (error) console.error("[admin] getAllMyShares error:", error);
    setAllShares(data);
    setLoadingAllShares(false);
  }, []);

  const fetchActivity = useCallback(async (userId) => {
    setLoadingActivity(true);
    const filters = userId ? { userId, limit: 200 } : { limit: 200 };
    const { data } = await getActivityLog(filters);
    setActivityLog(data);
    setLoadingActivity(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAllShares();
  }, [fetchUsers, fetchAllShares]);

  // Carica log quando si apre il tab attività
  useEffect(() => {
    if (tab === "activity") fetchActivity(activityFilter || undefined);
  }, [tab, activityFilter, fetchActivity]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newEmail.trim() || !newPassword.trim()) {
      setFormError("Email e password sono obbligatori");
      return;
    }
    if (newPassword.length < 6) {
      setFormError("La password deve avere almeno 6 caratteri");
      return;
    }

    setCreating(true);
    const { error } = await createUser(newEmail, newPassword, newName, newRole);
    setCreating(false);

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess(`Utente ${newEmail} creato con successo`);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("user");
      fetchUsers();
    }
  };

  const fetchShares = useCallback(async (projectId) => {
    if (!projectId) { setShares([]); return; }
    setLoadingShares(true);
    const { data, error } = await getProjectShares(projectId);
    if (error) console.error("[admin] getProjectShares error:", error);
    setShares(data);
    setLoadingShares(false);
  }, []);

  useEffect(() => {
    if (selectedProject) fetchShares(selectedProject);
  }, [selectedProject, fetchShares]);

  const handleShare = async (userId, displayName) => {
    if (!selectedProject) return;
    const { error } = await shareProject(selectedProject, userId);
    if (error) {
      console.error("[admin] shareProject error:", error);
      showToast(`❌ Errore condivisione: ${error.message}`);
    } else {
      showToast(`Progetto condiviso con ${displayName}`);
      fetchShares(selectedProject);
      fetchAllShares();
    }
  };

  const handleUnshare = async (userId, displayName) => {
    if (!selectedProject) return;
    const { error } = await unshareProject(selectedProject, userId);
    if (error) {
      console.error("[admin] unshareProject error:", error);
      showToast(`❌ Errore rimozione: ${error.message}`);
    } else {
      showToast(`Accesso rimosso per ${displayName}`);
      fetchShares(selectedProject);
      fetchAllShares();
    }
  };

  const handleUnshareGlobal = async (projectId, userId, displayName) => {
    const { error } = await unshareProject(projectId, userId);
    if (error) {
      console.error("[admin] unshareProject error:", error);
      showToast(`❌ Errore rimozione: ${error.message}`);
    } else {
      showToast(`Accesso rimosso per ${displayName}`);
      fetchAllShares();
      if (selectedProject === projectId) fetchShares(projectId);
    }
  };

  const sharedUserIds = new Set(shares.map((s) => s.user_id));
  const activeProjects = projects.filter((p) => !p.archived);

  // Mappa utente → progetti condivisi (per la vista riepilogo nel tab utenti)
  const sharesByUser = {};
  for (const s of allShares) {
    if (!sharesByUser[s.user_id]) sharesByUser[s.user_id] = [];
    sharesByUser[s.user_id].push(s);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast("")} />}

      {/* Header */}
      <div className="bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">⚙</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-black">Pannello Admin</h2>
            <p className="text-xs text-gray-500 font-bold">Gestione utenti e condivisione progetti</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-black rounded-xl text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          ← Torna ai progetti
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b-2 border-black px-6 flex gap-2 pt-2">
        <button
          onClick={() => setTab("users")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            tab === "users"
              ? "bg-rose-500 text-white border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
              : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
          }`}
        >
          👥 Utenti
        </button>
        <button
          onClick={() => setTab("shares")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            tab === "shares"
              ? "bg-emerald-500 text-white border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
              : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
          }`}
        >
          🔗 Condivisione Progetti
          {allShares.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold border border-emerald-300">
              {allShares.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("activity")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            tab === "activity"
              ? "bg-blue-500 text-white border-2 border-black border-b-0 -mb-[2px] shadow-[2px_-2px_0px_#000]"
              : "text-gray-500 hover:text-black hover:bg-gray-100 border-2 border-transparent"
          }`}
        >
          📋 Registro Attività
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "users" ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Form Creazione Utente */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
              <h3 className="text-base font-extrabold text-black mb-4">
                ✨ Crea Nuovo Utente
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="utente@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Min. 6 caratteri"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Ruolo
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <p className="text-sm font-bold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-2">
                    {formError}
                  </p>
                )}
                {formSuccess && (
                  <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-2">
                    {formSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-amber-400 text-black rounded-xl text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Creazione..." : "+ Crea Utente"}
                </button>
              </form>
            </div>

            {/* Lista Utenti */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
              <h3 className="text-base font-extrabold text-black mb-4">
                👥 I Tuoi Utenti
              </h3>
              {loadingUsers ? (
                <p className="text-sm text-gray-500 font-bold">Caricamento...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold italic">
                  Nessun utente creato ancora
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-black transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-200 border-2 border-black flex items-center justify-center shrink-0 text-sm font-extrabold text-black">
                          {(u.full_name || u.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-black truncate">
                            {u.full_name || "—"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase border-2 ${
                            u.role === "moderator"
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      {/* Progetti condivisi con questo utente */}
                      {sharesByUser[u.id] && sharesByUser[u.id].length > 0 ? (
                        <div className="mt-2 ml-12 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase self-center mr-1">Progetti:</span>
                          {sharesByUser[u.id].map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[11px] font-bold"
                            >
                              📂 {s.projects?.titolo || "—"}
                              <button
                                onClick={() => handleUnshareGlobal(s.project_id, s.user_id, u.full_name || u.email)}
                                className="ml-0.5 text-rose-400 hover:text-rose-600 font-extrabold cursor-pointer"
                                title="Rimuovi condivisione"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 ml-12 text-[10px] text-gray-400 italic font-semibold">
                          Nessun progetto condiviso
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : tab === "shares" ? (
          /* ═══ Tab Condivisione ═══ */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Selettore progetto */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
              <h3 className="text-base font-extrabold text-black mb-4">
                📂 Seleziona Progetto
              </h3>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              >
                <option value="">— Seleziona un progetto —</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titolo}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista utenti con toggle condivisione */}
            {selectedProject && (
              <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
                <h3 className="text-base font-extrabold text-black mb-4">
                  🔗 Condividi con
                </h3>
                {loadingShares ? (
                  <p className="text-sm text-gray-500 font-bold">Caricamento...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-gray-500 font-semibold italic">
                    Crea prima degli utenti nella sezione "Utenti"
                  </p>
                ) : (
                  <div className="space-y-2">
                    {users.map((u) => {
                      const isShared = sharedUserIds.has(u.id);
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                            isShared
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 hover:border-black"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-200 border-2 border-black flex items-center justify-center shrink-0 text-sm font-extrabold text-black">
                            {(u.full_name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-black truncate">
                              {u.full_name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase border-2 ${
                              u.role === "moderator"
                                ? "bg-violet-100 text-violet-700 border-violet-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {u.role}
                          </span>
                          <button
                            onClick={() =>
                              isShared ? handleUnshare(u.id, u.full_name || u.email) : handleShare(u.id, u.full_name || u.email)
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                              isShared
                                ? "bg-rose-100 text-rose-600 border-rose-300 hover:bg-rose-200"
                                : "bg-emerald-400 text-black border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            }`}
                          >
                            {isShared ? "Rimuovi" : "Condividi"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── Vista globale di tutte le condivisioni ─── */}
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-black">
                  📊 Tutte le Condivisioni Attive
                </h3>
                {allShares.length > 0 && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-extrabold border-2 border-emerald-300">
                    {allShares.length} attive
                  </span>
                )}
              </div>
              {loadingAllShares ? (
                <p className="text-sm text-gray-500 font-bold">Caricamento...</p>
              ) : allShares.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold italic">Nessuna condivisione attiva</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="text-left py-2 pr-4 text-xs font-extrabold uppercase text-gray-500">Progetto</th>
                        <th className="text-left py-2 pr-4 text-xs font-extrabold uppercase text-gray-500">Utente</th>
                        <th className="text-left py-2 pr-4 text-xs font-extrabold uppercase text-gray-500">Email</th>
                        <th className="text-left py-2 pr-4 text-xs font-extrabold uppercase text-gray-500">Ruolo</th>
                        <th className="text-left py-2 pr-4 text-xs font-extrabold uppercase text-gray-500">Dal</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {allShares.map((s) => (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-4 font-bold text-black max-w-[140px] truncate">
                            {s.projects?.titolo || "—"}
                          </td>
                          <td className="py-2.5 pr-4 font-bold text-black max-w-[120px] truncate">
                            {s.profiles?.full_name || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-500 text-xs max-w-[160px] truncate">
                            {s.profiles?.email || "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${
                              s.profiles?.role === "moderator"
                                ? "bg-violet-100 text-violet-700 border-violet-300"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                              {s.profiles?.role || "user"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-gray-400 font-semibold whitespace-nowrap">
                            {new Date(s.created_at).toLocaleDateString("it-IT")}
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => handleUnshareGlobal(s.project_id, s.user_id, s.profiles?.full_name || s.profiles?.email)}
                              className="px-3 py-1 bg-rose-100 text-rose-600 border border-rose-300 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors cursor-pointer"
                            >
                              Rimuovi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : tab === "activity" ? (
          /* ═══ Tab Registro Attività ═══ */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-black">
                  📋 Registro Attività
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="px-3 py-2 border-2 border-black rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Tutti gli utenti</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => fetchActivity(activityFilter || undefined)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                  >
                    🔄 Aggiorna
                  </button>
                </div>
              </div>
              {loadingActivity ? (
                <p className="text-sm text-gray-500 font-bold">Caricamento...</p>
              ) : activityLog.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold italic">
                  Nessuna attività registrata
                </p>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-black">
                        <th className="text-left py-2 pr-3 text-xs font-extrabold uppercase text-gray-500">Data/Ora</th>
                        <th className="text-left py-2 pr-3 text-xs font-extrabold uppercase text-gray-500">Utente</th>
                        <th className="text-left py-2 pr-3 text-xs font-extrabold uppercase text-gray-500">Azione</th>
                        <th className="text-left py-2 pr-3 text-xs font-extrabold uppercase text-gray-500">Dettagli</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-3 text-xs text-gray-500 font-semibold whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("it-IT", {
                              day: "2-digit", month: "2-digit", year: "2-digit",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-gray-200 border border-black flex items-center justify-center text-[10px] font-extrabold">
                                {(log.profile?.full_name || log.profile?.email || "?")[0].toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-black truncate max-w-[120px]">
                                {log.profile?.full_name || log.profile?.email || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                              log.action.startsWith("project") ? "bg-amber-50 text-amber-700 border-amber-300" :
                              log.action.startsWith("node") ? "bg-blue-50 text-blue-700 border-blue-300" :
                              log.action.startsWith("share") ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                              log.action.startsWith("user") ? "bg-violet-50 text-violet-700 border-violet-300" :
                              "bg-gray-50 text-gray-700 border-gray-300"
                            }`}>
                              {log.action.replace(".", " › ")}
                            </span>
                          </td>
                          <td className="py-2.5 text-xs text-gray-600 font-medium max-w-[250px]">
                            {log.details?.titolo && (
                              <span className="font-bold text-black">{log.details.titolo} </span>
                            )}
                            {log.details?.email && (
                              <span>email: {log.details.email} </span>
                            )}
                            {log.details?.fields && (
                              <span className="text-gray-400">campi: {log.details.fields.join(", ")}</span>
                            )}
                            {log.details?.userId && !log.details?.email && (
                              <span className="text-gray-400 text-[10px]">target: {log.details.userId.slice(0, 8)}…</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
