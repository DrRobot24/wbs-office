import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Inserisci email e password");
      return;
    }
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password);
        if (err) {
          setError(err.message);
        } else {
          setSuccess(
            "Registrazione completata! Controlla la tua email per confermare l'account.",
          );
          setIsSignUp(false);
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(
            err.message === "Invalid login credentials"
              ? "Credenziali non valide. Controlla email e password."
              : err.message,
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      {/* ═══ Lato sinistro — Hero / Immagine ═══ */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        {/* Immagine di sfondo — cantiere / progetto */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80')`,
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/80" />

        {/* Contenuto Hero */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-xl bg-amber-400 border-3 border-black shadow-[5px_5px_0px_#000] flex items-center justify-center">
                <span className="text-black font-extrabold text-xl">RS</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-black tracking-tight">
                  WBS Office
                </h1>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wider">
                  Project Management Suite
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-black leading-tight mb-6">
              Gestisci i tuoi progetti
              <br />
              <span className="bg-amber-400 px-2 border-2 border-black">con precisione.</span>
            </h2>

            <p className="text-lg text-gray-700 font-semibold leading-relaxed mb-10">
              Dalla struttura WBS al cronoprogramma di Gantt, dalla gestione
              costi alla dashboard di avanzamento. Tutto in un unico strumento
              professionale.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "🌳", label: "Albero WBS", desc: "Gerarchia infinita" },
                { icon: "📅", label: "Gantt", desc: "Cronoprogramma" },
                { icon: "💰", label: "Costi", desc: "Budget & Materiali" },
                { icon: "📊", label: "Dashboard", desc: "Vista globale" },
                { icon: "🖨️", label: "PDF", desc: "Export professionale" },
                { icon: "☁️", label: "Cloud", desc: "Sync automatico" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
                >
                  <span className="text-lg">{f.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-black">
                      {f.label}
                    </p>
                    <p className="text-[10px] text-gray-600 font-semibold">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Lato destro — Form Login ═══ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 rounded-xl bg-amber-400 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
              <span className="text-black font-extrabold text-sm">RS</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-black">WBS Office</h1>
              <p className="text-gray-600 text-[11px] font-bold uppercase">
                Project Management Suite
              </p>
            </div>
          </div>

          {/* Card form */}
          <div className="bg-white rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000] p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-extrabold text-black mb-1">
                {isSignUp ? "Crea il tuo account" : "Bentornato"}
              </h3>
              <p className="text-sm text-gray-600 font-semibold">
                {isSignUp
                  ? "Registrati per iniziare a gestire i tuoi progetti"
                  : "Accedi per continuare con i tuoi progetti"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-black uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-white"
                  placeholder="nome@esempio.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-black uppercase">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-white"
                  placeholder="••••••••"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>

              {/* Messaggi errore / successo */}
              {error && (
                <div className="bg-rose-300 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-black font-bold">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-lime-300 border-2 border-black rounded-xl px-4 py-2.5 text-xs text-black font-bold">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 disabled:opacity-50 disabled:cursor-wait text-black rounded-xl text-sm font-extrabold transition-all cursor-pointer border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                {loading
                  ? "⏳ Attendere..."
                  : isSignUp
                    ? "🚀 Registrati"
                    : "🔐 Accedi"}
              </button>
            </form>

            {/* Toggle login/signup */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {isSignUp ? "Hai già un account?" : "Non hai un account?"}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccess("");
                  }}
                  className="ml-1.5 text-amber-600 hover:text-black font-extrabold cursor-pointer transition-colors underline decoration-2"
                >
                  {isSignUp ? "Accedi" : "Registrati"}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-gray-600 font-bold mt-6 uppercase">
            WBS Office © {new Date().getFullYear()} — Project Management Suite
          </p>
        </div>
      </div>
    </div>
  );
}
