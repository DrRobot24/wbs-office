import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export default function ProfilePage({ onClose }) {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const { error: err } = await updateProfile({
      full_name: fullName.trim(),
      company: company.trim(),
    });

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess("Profilo aggiornato con successo");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
            <span className="text-black font-extrabold text-sm">
              {(fullName || user?.email || "?")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-black">Il Mio Profilo</h2>
            <p className="text-xs text-gray-500 font-bold">Modifica le tue informazioni personali</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-black rounded-xl text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          ← Torna ai progetti
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] p-6">
            <form onSubmit={handleSave} className="space-y-5">
              {/* Email (readonly) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Ruolo (readonly) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Ruolo
                </label>
                <input
                  type="text"
                  value={profile?.role || "user"}
                  disabled
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold bg-gray-100 text-gray-500 cursor-not-allowed capitalize"
                />
              </div>

              {/* Nome completo */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Mario Rossi"
                />
              </div>

              {/* Azienda */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Azienda
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Nome azienda (opzionale)"
                />
              </div>

              {/* Messaggi */}
              {error && (
                <p className="text-sm font-bold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-2">
                  ✅ {success}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-amber-400 text-black rounded-xl text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? "Salvataggio..." : "💾 Salva Profilo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
