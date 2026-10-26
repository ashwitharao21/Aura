import React, { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  PieChart, 
  Lock, 
  CheckCircle,
  Database,
  Coins,
  BarChart3
} from "lucide-react";

interface LandingPageProps {
  onSignIn: () => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSignIn();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err?.message || "Failed to sign in with Google. Please check popup permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-slate-900 flex flex-col justify-between selection:bg-[#7ED4C9]/30 selection:text-[#1E293B]">
      {/* Top Banner */}
      <div className="border-b border-[#7ED4C9]/30 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#4AA89E] animate-pulse" />
        <span>Aura • <strong>See your money's energy</strong> with <strong>Cloud Firestore</strong> &amp; <strong>Calm Financial Clarity</strong></span>
      </div>

      {/* Main Hero Container */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20 flex-1 flex flex-col items-center text-center">
        {/* Logo Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-aura-gradient p-0.5 shadow-lg shadow-[#7ED4C9]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#FBF7F0] rounded-[14px] flex items-center justify-center font-black text-2xl text-[#358E85]">
              ✦
            </div>
          </div>
          <div className="text-left">
            <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#358E85]">
              Aura
            </span>
            <div className="text-xs text-slate-500 font-semibold tracking-wide">
              See your money's energy
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl text-slate-900 leading-tight md:leading-none">
          Understand Your Financial Aura with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4AA89E] via-[#5BC0BE] to-[#358E85]">
            Calm Clarity
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Log incomes, categorize expenses, track monthly budgets, and analyze spending trends with calm clarity to balance your cashflow peacefully.
        </p>

        {/* Google Sign In Call to Action */}
        <div className="mt-10 flex flex-col items-center gap-3.5 w-full max-w-sm">
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold px-6 py-4 rounded-2xl border border-[#FF9A8B]/60 shadow-lg shadow-[#FF9A8B]/20 transition-all transform active:scale-98 disabled:opacity-60 cursor-pointer text-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing In with Google..." : "Continue with Google Sign-In"}</span>
          </button>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl w-full text-left">
              {error}
            </div>
          )}

          {/* Privacy & Zero Password Assurance */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#4AA89E]" />
            <span>Zero password storage. Federated Google Authentication.</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] flex items-center justify-center mb-3 border border-[#7ED4C9]/40">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Income &amp; Expense Flow</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Log transactions with categories, dates, and payment methods with real-time balance calculations.
            </p>
          </div>

          <div className="bg-white border border-[#C6B9E0]/40 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#C6B9E0]/25 text-[#6B5A96] flex items-center justify-center mb-3 border border-[#C6B9E0]/50">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Category Budget Limits</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Set monthly spending targets and receive soothing alerts before exceeding boundaries.
            </p>
          </div>

          <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs hover:border-[#FF9A8B]/70 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB7A5]/25 text-[#E07A5F] flex items-center justify-center mb-3 border border-[#FFB7A5]/50">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Visual Reports &amp; Trends</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Analyze cashflow distributions, daily cumulative spending trajectory, and export CSV spreadsheets.
            </p>
          </div>

          <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] flex items-center justify-center mb-3 border border-[#7ED4C9]/40">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Firestore Isolation</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Your financial data is strictly partitioned and secured under owner-authenticated Firestore rules.
            </p>
          </div>
        </div>

        {/* Security Matrix Checklist */}
        <div className="mt-12 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 max-w-2xl w-full text-left shadow-xs">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4AA89E]" />
            Security &amp; Data Integrity Directives
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <span>Owner-bound Firestore path security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <span>Direct authenticated data persistence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <span>Zero-crash payload sanitization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <span>Real-time budget adherence alerts</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#7ED4C9]/30 py-6 text-center text-xs text-slate-500 bg-white/70">
        <p>Aura • See your money's energy</p>
      </footer>
    </div>
  );
};
