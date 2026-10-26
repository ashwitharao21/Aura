import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart, 
  BarChart3, 
  Plus, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Menu,
  X
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  selectedMonth,
  onMonthChange,
  user,
  onSignOut,
  onOpenAddModal,
}) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);

  // Close navigation drawer with Escape key for accessible experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isNavMenuOpen) {
        setIsNavMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNavMenuOpen]);

  // Lock body scroll when navigation drawer is open to eliminate double scrollbar
  useEffect(() => {
    if (isNavMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavMenuOpen]);

  // Navigation tabs
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

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    setIsNavMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-b border-[#7ED4C9]/30 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* DESKTOP VIEW (lg and above: 1024px+) - Pristine 2-Row Design              */}
        {/* ========================================================================= */}
        <div className="hidden lg:block">
          {/* DESKTOP ROW 1: Brand (Left) + Month Navigator (Center) + User & Sign Out & Hamburger (Right) */}
          <div className="flex items-center justify-between h-14 border-b border-[#7ED4C9]/20 gap-4">
            {/* Brand Identity */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-aura-gradient p-0.5 shadow-sm shadow-[#7ED4C9]/30 flex items-center justify-center text-slate-900 font-extrabold text-base shrink-0">
                <div className="w-full h-full bg-[#FBF7F0] rounded-[10px] flex items-center justify-center font-black text-[#358E85]">
                  ✦
                </div>
              </div>
              <div className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#358E85] whitespace-nowrap">
                  Aura Money
                </span>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap border-l border-[#7ED4C9]/40 pl-2">
                  See your money's energy
                </span>
              </div>
            </div>

            {/* Desktop Month Navigator in Center */}
            <div className="flex items-center gap-1.5 bg-white border border-[#7ED4C9]/35 rounded-xl px-3 py-1 text-xs font-semibold shadow-2xs whitespace-nowrap shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <button
                id="desktop-prev-month-btn"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[140px] text-center font-bold text-slate-800 whitespace-nowrap">
                {formatMonthName(selectedMonth)}
              </span>
              <button
                id="desktop-next-month-btn"
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop User Profile, Sign Out & Hamburger Toggle (Right) */}
            <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
              {user && (
                <>
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full border-2 border-[#7ED4C9] object-cover shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#7ED4C9]/20 border border-[#7ED4C9] flex items-center justify-center font-bold text-xs text-[#358E85] shrink-0">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="text-left text-xs whitespace-nowrap">
                      <p className="font-bold text-slate-800 truncate max-w-[140px] whitespace-nowrap">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-[10.5px] text-slate-500 truncate max-w-[140px] whitespace-nowrap">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    id="desktop-sign-out-btn"
                    onClick={onSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white rounded-xl text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200 text-xs font-semibold whitespace-nowrap"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* DESKTOP ROW 2: Navigation Links (Left) + Action Buttons (Right) */}
          <div className="flex items-center justify-between py-2 gap-4">
            {/* Navigation Links */}
            <nav className="flex items-center gap-1.5 bg-white/75 border border-[#7ED4C9]/30 p-1 rounded-2xl shadow-2xs whitespace-nowrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-[#7ED4C9]/25 text-[#358E85] border border-[#7ED4C9]/50 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#358E85]" : "text-slate-500"}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <button
                id="desktop-quick-add-btn"
                onClick={() => onOpenAddModal("expense")}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border border-[#FF9A8B]/60 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                <span className="whitespace-nowrap">Record Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLET & MOBILE VIEW (<1024px) - Clean 3-Row Layout + Hamburger Menu     */}
        {/* ========================================================================= */}
        <div className="block lg:hidden py-2 space-y-2">
          
          {/* MOBILE ROW 1: Brand (Left) + Quick Add & Hamburger Toggle (Right) */}
          <div className="flex items-center justify-between gap-2">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-aura-gradient p-0.5 shadow-sm shadow-[#7ED4C9]/30 flex items-center justify-center text-slate-900 font-extrabold text-sm shrink-0">
                <div className="w-full h-full bg-[#FBF7F0] rounded-[10px] flex items-center justify-center font-black text-[#358E85]">
                  ✦
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-black text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-[#358E85] whitespace-nowrap">
                  Aura Money
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-500 font-medium whitespace-nowrap border-l border-[#7ED4C9]/40 pl-1.5">
                  See your money's energy
                </span>
              </div>
            </div>

            {/* Quick Actions & Hamburger Toggle Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="mobile-quick-add-btn"
                onClick={() => onOpenAddModal("expense")}
                className="flex items-center gap-1 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] text-slate-900 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer border border-[#FF9A8B]/60 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                <span className="whitespace-nowrap">Record</span>
              </button>

              <button
                id="hamburger-menu-toggle-btn"
                onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                aria-label={isNavMenuOpen ? "Close menu" : "Open menu"}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                  isNavMenuOpen
                    ? "bg-[#7ED4C9]/30 border-[#7ED4C9] text-[#358E85]"
                    : "bg-white border-[#7ED4C9]/40 text-slate-700 hover:bg-[#7ED4C9]/15"
                }`}
              >
                {isNavMenuOpen ? (
                  <X className="w-5 h-5 text-[#358E85]" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE ROW 2: Month Navigator (Full Width, Centered, No Cropping) */}
          <div className="flex items-center justify-between bg-white border border-[#7ED4C9]/40 rounded-xl px-2 sm:px-3 py-1.5 shadow-2xs w-full">
            <button
              id="mobile-prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-600 hover:text-slate-900 cursor-pointer active:scale-90"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-slate-800 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
              <span className="whitespace-nowrap">{formatMonthName(selectedMonth)}</span>
            </div>

            <button
              id="mobile-next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#FBF7F0] rounded-lg transition-colors text-slate-600 hover:text-slate-900 cursor-pointer active:scale-90"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-VIEWPORT (100vh / 100dvh) NAVIGATION DRAWER (Via React Portal)       */}
      {/* Rendered directly into document.body to prevent containing-block traps    */}
      {/* Works seamlessly across desktop, tablet, and mobile breakpoints           */}
      {/* ========================================================================= */}
      {typeof document !== "undefined" && isNavMenuOpen && createPortal(
        <div 
          id="aura-navigation-drawer-portal"
          className="fixed inset-0 z-50 overflow-hidden" 
          role="dialog" 
          aria-modal="true"
        >
          {/* Fullscreen Backdrop Blur: click to dismiss */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsNavMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Full-Height (100vh / 100dvh) Sidebar Panel from screen top to bottom */}
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm h-screen h-[100dvh] bg-[#FBF7F0] border-l border-[#7ED4C9]/40 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto overscroll-contain animate-in slide-in-from-right duration-200 p-5"
          >
            {/* Top: Drawer Header & Navigation List */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#7ED4C9]/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-aura-gradient p-0.5 flex items-center justify-center font-bold text-xs shadow-xs">
                    <div className="w-full h-full bg-[#FBF7F0] rounded-[9px] flex items-center justify-center text-[#358E85]">
                      ✦
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">Aura Money</h3>
                    <p className="text-[10.5px] text-slate-500 font-medium">Navigation &amp; Views</p>
                  </div>
                </div>

                <button
                  id="drawer-close-btn"
                  onClick={() => setIsNavMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-white border border-[#7ED4C9]/40 text-slate-600 hover:text-slate-900 hover:bg-[#7ED4C9]/15 transition-colors cursor-pointer active:scale-90"
                  title="Close Navigation Menu (Esc)"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items (Touch targets >= 44px) */}
              <div className="space-y-1">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                  Select View
                </p>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`drawer-nav-tab-${tab.id}`}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#7ED4C9]/30 text-[#358E85] border border-[#7ED4C9]/60 shadow-2xs font-black"
                          : "text-slate-700 hover:bg-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-[#7ED4C9]/40 text-[#358E85]" : "bg-white border border-[#7ED4C9]/30 text-slate-500"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{tab.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#358E85]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions in Drawer */}
              <div className="pt-2 space-y-2 border-t border-[#7ED4C9]/20">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                  Quick Actions
                </p>

                <button
                  id="drawer-add-record-btn"
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    onOpenAddModal("expense");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-black text-xs px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm cursor-pointer border border-[#FF9A8B]/60 active:scale-98 transition-all"
                >
                  <Plus className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Record New Entry</span>
                </button>
              </div>
            </div>

            {/* Bottom: User Profile Info & Sign Out Button */}
            {user && (
              <div className="pt-4 mt-4 border-t border-[#7ED4C9]/30 space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 bg-white border border-[#7ED4C9]/30 rounded-2xl shadow-2xs">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-9 h-9 rounded-full border-2 border-[#7ED4C9] object-cover shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#7ED4C9]/20 border border-[#7ED4C9] flex items-center justify-center font-black text-sm text-[#358E85] shrink-0">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-xs text-slate-900 truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  id="drawer-sign-out-btn"
                  onClick={() => {
                    setIsNavMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer active:scale-98"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

