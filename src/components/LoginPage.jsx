import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Inserisci email e password')
      return
    }
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password)
        if (err) {
          setError(err.message)
        } else {
          setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account.')
          setIsSignUp(false)
        }
      } else {
        const { error: err } = await signIn(email, password)
        if (err) {
          setError(err.message === 'Invalid login credentials'
            ? 'Credenziali non valide. Controlla email e password.'
            : err.message
          )
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* ═══ Lato sinistro — Hero / Immagine ═══ */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        {/* Immagine di sfondo — cantiere / progetto */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80')`,
          }}
        />
        {/* Overlay scuro con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white/70 to-white/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-white/30" />

        {/* Contenuto Hero */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <span className="text-white font-extrabold text-xl">RS</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">WBS Office</h1>
                <p className="text-amber-600/60 text-sm font-medium">Project Management Suite</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              Gestisci i tuoi progetti
              <br />
              <span className="text-amber-600">con precisione.</span>
            </h2>

            <p className="text-lg text-gray-500 leading-relaxed mb-10">
              Dalla struttura WBS al cronoprogramma di Gantt, dalla gestione costi
              alla dashboard di avanzamento. Tutto in un unico strumento professionale.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '🌳', label: 'Albero WBS', desc: 'Gerarchia infinita' },
                { icon: '📅', label: 'Gantt', desc: 'Cronoprogramma' },
                { icon: '💰', label: 'Costi', desc: 'Budget & Materiali' },
                { icon: '📊', label: 'Dashboard', desc: 'Vista globale' },
                { icon: '🖨️', label: 'PDF', desc: 'Export professionale' },
                { icon: '☁️', label: 'Cloud', desc: 'Sync automatico' },
              ].map(f => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 backdrop-blur-sm"
                >
                  <span className="text-lg">{f.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{f.label}</p>
                    <p className="text-[10px] text-gray-400">{f.desc}</p>
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-extrabold text-sm">RS</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WBS Office</h1>
              <p className="text-amber-600/50 text-[11px] font-medium">Project Management Suite</p>
            </div>
          </div>

          {/* Card form */}
          <div className="bg-white rounded-2xl border border-gray-300 shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-amber-600 mb-1">
                {isSignUp ? 'Crea il tuo account' : 'Bentornato'}
              </h3>
              <p className="text-sm text-gray-400">
                {isSignUp
                  ? 'Registrati per iniziare a gestire i tuoi progetti'
                  : 'Accedi per continuare con i tuoi progetti'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block mb-1.5 text-xs font-medium text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  placeholder="nome@esempio.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 text-xs font-medium text-gray-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>

              {/* Messaggi errore / successo */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 text-xs text-green-400">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-wait text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                {loading
                  ? '⏳ Attendere...'
                  : isSignUp
                    ? '🚀 Registrati'
                    : '🔐 Accedi'}
              </button>
            </form>

            {/* Toggle login/signup */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
                  className="ml-1.5 text-amber-600 hover:text-gray-700 font-semibold cursor-pointer transition-colors"
                >
                  {isSignUp ? 'Accedi' : 'Registrati'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-gray-400 mt-6">
            WBS Office © {new Date().getFullYear()} — Project Management Suite
          </p>
        </div>
      </div>
    </div>
  )
}
