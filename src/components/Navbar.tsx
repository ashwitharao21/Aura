import React from "react";
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart, 
  BarChart3, 
  Sparkles, 
  Plus, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenAddModal: (type: "expense" | "income" | "budget") => void;
  onSeedDemoData?: () => void;
  isSeedingDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  selectedMonth,
  onMonthChange,
  user,
  onSignOut,
  onOpenAddModal,
  onSeedDemoData,
  isSeedingDemo = false,
}) => {
  // Navigation tabs (AI Advisor removed as it is now in bottom-right floating chatbot)
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "income", label: "Income", icon: ArrowDownCircle },
    { id: "expenses", label: "Expenses", icon: ArrowUpCircle },
    { id: "budgets", label: "Budgets", icon: PieChart },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(next);
  };

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-b border-[#7ED4C9]/30 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand with Calm Clarity Aura Gradient */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-aura-gradient p-0.5 shadow-md shadow-[#7ED4C9]/30 flex items-center justify-center text-slate-900 font-extrabold text-xl">
              <div className="w-full h-full bg-[#FBF7F0] rounded-[14px] flex items-center justify-center font-black text-[#358E85]">
                ✦
              </div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#358E85]">
                Aura Money
              </span>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
                <span>See your money's energy</span>
              </div>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-[#7ED4C9]/35 rounded-2xl px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#4AA89E]" />
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="min-w-[120px] text-center font-bold text-slate-800">
              {formatMonthName(selectedMonth)}
            </span>
            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/70 border border-[#7ED4C9]/25 p-1 rounded-2xl shadow-2xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#7ED4C9]/25 text-[#358E85] border border-[#7ED4C9]/50 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#358E85]" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Demo Data Button */}
            {onSeedDemoData && (
              <button
                id="navbar-seed-demo-btn"
                onClick={onSeedDemoData}
                disabled={isSeedingDemo}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#C6B9E0]/25 hover:bg-[#C6B9E0]/40 text-[#6B5A96] border border-[#C6B9E0]/50 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
                title="Populate Cloud Firestore with realistic demo financial records"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6B5A96]" />
                <span>{isSeedingDemo ? "Seeding..." : "Demo Data"}</span>
              </button>
            )}

            {/* Quick Action Button with Warm Glow palette */}
            <div className="relative group">
              <button
                id="quick-add-btn"
                onClick={() => onOpenAddModal("expense")}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-[#FF9A8B]/60"
              >
                <Plus className="w-3.5 h-3.5 text-slate-900" />
                <span>Record Entry</span>
              </button>
            </div>

            {/* User Profile Avatar & Sign Out */}
            {user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-[#7ED4C9]/30">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full border-2 border-[#7ED4C9] object-cover shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#7ED4C9]/20 border border-[#7ED4C9] flex items-center justify-center font-bold text-xs text-[#358E85]">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden xl:block text-left text-xs">
                    <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  id="sign-out-btn"
                  onClick={onSignOut}
                  className="p-1.5 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-[#7ED4C9]/25 scrollbar-none gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#7ED4C9]/25 text-[#358E85] border border-[#7ED4C9]/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
