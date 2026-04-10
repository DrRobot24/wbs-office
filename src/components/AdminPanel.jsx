import { useState, useEffect, useCallback } from "react";
import { createUser, getMyUsers, shareProject, unshareProject, getProjectShares } from "../lib/adminService";

export default function AdminPanel({ projects, onClose }) {
  const [tab, setTab] = useState("users"); // 'users' | 'shares'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form nuovo utente
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Condivisione
  const [selectedProject, setSelectedProject] = useState("");
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data } = await getMyUsers();
    setUsers(data);
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    const { data } = await getProjectShares(projectId);
    setShares(data);
    setLoadingShares(false);
  }, []);

  useEffect(() => {
    if (selectedProject) fetchShares(selectedProject);
  }, [selectedProject, fetchShares]);

  const handleShare = async (userId) => {
    if (!selectedProject) return;
    await shareProject(selectedProject, userId);
    fetchShares(selectedProject);
  };

  const handleUnshare = async (userId) => {
    if (!selectedProject) return;
    await unshareProject(selectedProject, userId);
    fetchShares(selectedProject);
  };

  const sharedUserIds = new Set(shares.map((s) => s.user_id));
  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
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
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-black transition-colors"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
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
                              isShared ? handleUnshare(u.id) : handleShare(u.id)
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
          </div>
        )}
      </div>
    </div>
  );
}
