import React, { useState, useMemo } from "react";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  PiggyBank, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Calendar,
  IndianRupee,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Edit3,
  Trash2,
  RotateCcw
} from "lucide-react";
import { 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetStatus 
} from "../types";
import { 
  EXPENSE_CATEGORIES, 
  INCOME_SOURCES, 
  getCategoryMeta, 
  getIncomeSourceMeta 
} from "../data/categories";

interface DashboardViewProps {
  selectedMonth: string;
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  budgetStatuses: BudgetStatus[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  onOpenAddModal: (type: "expense" | "income" | "budget") => void;
  onNavigateTab: (tab: string) => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onEditIncome: (income: IncomeEntry) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedMonth,
  incomes,
  expenses,
  budgetStatuses,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  onOpenAddModal,
  onNavigateTab,
  onEditExpense,
  onEditIncome,
  onDeleteExpense,
  onDeleteIncome,
}) => {
  // Format month name
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Search & Filter state for transactions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Combined all transactions
  const allCombinedTransactions = useMemo(() => {
    return [
      ...expenses.map(e => ({ ...e, type: "expense" as const })),
      ...incomes.map(i => ({ ...i, type: "income" as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, incomes]);

  // Filtered transactions based on search and category
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCombinedTransactions.filter((tx) => {
      const isExp = tx.type === "expense";
      const catOrSource = isExp ? (tx as ExpenseEntry).category : (tx as IncomeEntry).source;
      const subCat = (tx as any).category || "";
      const notes = tx.notes || "";
      const tag = (tx as any).tag || "";
      const paymentMethod = (tx as any).paymentMethod || "";
      const amountStr = tx.amount.toString();
      const dateStr = tx.date;

      // Filter by Type
      if (selectedTypeFilter !== "all" && tx.type !== selectedTypeFilter) {
        return false;
      }

      // Filter by Category or Source
      if (selectedFilterCategory !== "all") {
        if (catOrSource !== selectedFilterCategory && subCat !== selectedFilterCategory) {
          return false;
        }
      }

      // Filter by Search Query
      if (q) {
        const matches = 
          notes.toLowerCase().includes(q) ||
          catOrSource.toLowerCase().includes(q) ||
          subCat.toLowerCase().includes(q) ||
          tag.toLowerCase().includes(q) ||
          paymentMethod.toLowerCase().includes(q) ||
          dateStr.includes(q) ||
          amountStr.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allCombinedTransactions, searchQuery, selectedFilterCategory, selectedTypeFilter]);

  // Whether active filtering is engaged
  const isFiltering = searchQuery.trim().length > 0 || selectedFilterCategory !== "all" || selectedTypeFilter !== "all";

  // Sliced transactions to display (show all if filtering or user clicked show all)
  const displayedTransactions = useMemo(() => {
    if (isFiltering || showAllTransactions) {
      return filteredTransactions;
    }
    return filteredTransactions.slice(0, 8);
  }, [filteredTransactions, isFiltering, showAllTransactions]);

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const topCategoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Hero Metric Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#358E85] mb-1">
            <Sparkles className="w-4 h-4 text-[#4AA89E]" />
            <span>Monthly Financial Aura</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Financial Overview for {monthName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance calculations backed by user-isolated Cloud Firestore storage.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-add-expense-btn"
            onClick={() => onOpenAddModal("expense")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 border border-[#FF9A8B]/60 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-slate-900" />
            <span>+ Add Expense</span>
          </button>
          <button
            id="dash-add-income-btn"
            onClick={() => onOpenAddModal("income")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 border border-[#4AA89E]/40 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-900" />
            <span>+ Log Income</span>
          </button>
          <button
            id="dash-set-budget-btn"
            onClick={() => onOpenAddModal("budget")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#C6B9E0] to-[#8E7BB5] hover:from-[#B8A8D6] hover:to-[#7E6AA8] text-slate-900 border border-[#8E7BB5]/40 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <PiggyBank className="w-3.5 h-3.5 text-slate-900" />
            <span>🎯 Set Budget</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-[#7ED4C9]/30 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/60 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4 text-[#4AA89E]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-[#358E85] font-semibold mt-1">
              {incomes.length} {incomes.length === 1 ? "entry" : "entries"} logged
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs hover:border-[#FF9A8B]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/50 flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4 text-[#E07A5F]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-[#E07A5F] font-semibold mt-1">
              {expenses.length} {expenses.length === 1 ? "transaction" : "transactions"} logged
            </p>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Savings</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              netSavings >= 0 ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40" : "bg-[#FFB7A5]/20 text-[#E07A5F] border-[#FFB7A5]/40"
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black tracking-tight ${
              netSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"
            }`}>
              {netSavings < 0 ? "-" : ""}₹{Math.abs(netSavings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {netSavings >= 0 ? "Surplus buffer" : "Deficit this month"}
            </p>
          </div>
        </div>

        {/* Savings Rate & Budget Health */}
        <div className="bg-white border border-[#C6B9E0]/40 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Savings Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#6B5A96] tracking-tight">
              {savingsRate}%
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Target: 20%+ recommended
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Budget Status & Top Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Adherence Widget */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#6B5A96]" />
                Budget Limits &amp; Tracking
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target limits set for {monthName}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("budgets")}
              className="text-xs font-bold text-[#358E85] hover:text-[#4AA89E] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {budgetStatuses.length === 0 ? (
            <div className="py-8 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
              <p className="text-xs text-slate-500">No category spending limits set for this month.</p>
              <button
                onClick={() => onOpenAddModal("budget")}
                className="mt-3 px-3.5 py-1.5 bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 rounded-xl text-xs font-extrabold hover:bg-[#7ED4C9]/30 transition-all cursor-pointer"
              >
                + Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 4).map((b) => {
                const meta = getCategoryMeta(b.category);
                const Icon = meta.icon;
                return (
                  <div key={b.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl ${meta.bgColor} ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-slate-800">{b.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900">₹{b.spent.toFixed(0)}</span>
                        <span className="text-slate-500 font-medium"> / ₹{b.limit.toFixed(0)}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.status === "safe"
                            ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40"
                            : b.status === "warning"
                            ? "bg-[#C6B9E0]/25 text-[#6B5A96] border-[#C6B9E0]/40"
                            : "bg-[#FFB7A5]/25 text-[#E07A5F] border-[#FFB7A5]/40"
                        }`}>
                          {b.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#FBF7F0] h-2 rounded-full overflow-hidden border border-[#7ED4C9]/25">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.percentage > 100
                            ? "bg-[#FF9A8B]"
                            : b.percentage > 85
                            ? "bg-[#FFB7A5]"
                            : "bg-[#7ED4C9]"
                        }`}
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Expense Categories Breakdown */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-[#E07A5F]" />
                Category Spending Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Highest expense areas for {monthName}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("expenses")}
              className="text-xs font-bold text-[#E07A5F] hover:text-[#FF9A8B] flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topCategoryEntries.length === 0 ? (
            <div className="py-8 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
              <p className="text-xs text-slate-500">No expenses recorded for this month.</p>
              <button
                onClick={() => onOpenAddModal("expense")}
                className="mt-3 px-3.5 py-1.5 bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/45 rounded-xl text-xs font-extrabold hover:bg-[#FFB7A5]/35 transition-all cursor-pointer"
              >
                + Record An Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topCategoryEntries.slice(0, 4).map(([catName, amount]) => {
                const meta = getCategoryMeta(catName);
                const Icon = meta.icon;
                const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={catName} className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF7F0] border border-[#7ED4C9]/25 hover:border-[#7ED4C9]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-2xl ${meta.bgColor} ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{catName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{percent}% of total monthly expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#E07A5F]">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Global Search & Category Filter Bar with Transactions Table */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#358E85]" />
              <span>Financial Transactions &amp; Activity</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Quickly find transactions by description, note, category, or payment method
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Showing {displayedTransactions.length} of {allCombinedTransactions.length}
            </span>
            {isFiltering && (
              <button
                id="dash-reset-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilterCategory("all");
                  setSelectedTypeFilter("all");
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-[#358E85] bg-[#7ED4C9]/15 hover:bg-[#7ED4C9]/30 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="dash-search-input"
              type="text"
              placeholder="Search by description, note, category, payment method, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-xl py-2 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                id="dash-clear-search-btn"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Type Selector */}
            <select
              id="dash-type-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="bg-white border border-[#7ED4C9]/40 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer shadow-2xs"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
            </select>

            {/* Category / Source Selector */}
            <select
              id="dash-category-filter"
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              className="bg-white border border-[#7ED4C9]/40 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer shadow-2xs max-w-[200px] truncate"
            >
              <option value="all">All Categories &amp; Sources</option>
              <optgroup label="Expense Categories">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={`exp-${c.name}`} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Income Sources">
                {INCOME_SOURCES.map((s) => (
                  <option key={`inc-${s.name}`} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {allCombinedTransactions.length === 0 ? (
          <div className="py-10 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
            <p className="text-xs text-slate-500">No financial transactions logged yet for this month.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => onOpenAddModal("expense")}
                className="px-3.5 py-1.5 bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/45 rounded-xl text-xs font-extrabold hover:bg-[#FFB7A5]/35 transition-all cursor-pointer"
              >
                + Add Expense
              </button>
              <button
                onClick={() => onOpenAddModal("income")}
                className="px-3.5 py-1.5 bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 rounded-xl text-xs font-extrabold hover:bg-[#7ED4C9]/30 transition-all cursor-pointer"
              >
                + Log Income
              </button>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-[#FBF7F0]/60 rounded-2xl border border-dashed border-[#7ED4C9]/40">
            <div className="w-10 h-10 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center mx-auto mb-2.5">
              <Search className="w-5 h-5 text-[#358E85]" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">No matching transactions found</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              No transactions match your query &quot;{searchQuery}&quot; {selectedFilterCategory !== "all" ? `in ${selectedFilterCategory}` : ""}.
            </p>
            <button
              id="dash-clear-search-empty-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedFilterCategory("all");
                setSelectedTypeFilter("all");
              }}
              className="mt-3 px-3.5 py-1.5 bg-[#7ED4C9]/20 hover:bg-[#7ED4C9]/35 text-[#358E85] border border-[#7ED4C9]/40 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#7ED4C9]/20 bg-[#FBF7F0]/60 text-slate-600 font-bold">
                    <th className="py-3.5 pl-4">Type</th>
                    <th className="py-3.5">Source / Category</th>
                    <th className="py-3.5">Date</th>
                    <th className="py-3.5">Method / Description</th>
                    <th className="py-3.5 text-right">Amount</th>
                    <th className="py-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedTransactions.map((tx) => {
                    const isExp = tx.type === "expense";
                    const meta = isExp 
                      ? getCategoryMeta((tx as ExpenseEntry).category)
                      : getIncomeSourceMeta((tx as IncomeEntry).source);
                    const Icon = meta.icon;

                    return (
                      <tr key={tx.id} className="hover:bg-[#FBF7F0]/80 transition-colors group">
                        <td className="py-3.5 pl-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isExp ? "bg-[#FFB7A5]/25 text-[#E07A5F] border-[#FFB7A5]/40" : "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40"
                          }`}>
                            {isExp ? "Expense" : "Income"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-xl ${meta.bgColor} ${meta.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-extrabold text-slate-800">
                              {isExp ? (tx as ExpenseEntry).category : (tx as IncomeEntry).source}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">
                          {tx.date}
                        </td>
                        <td className="py-3.5 text-slate-500 max-w-xs truncate">
                          {isExp ? (
                            <span className="text-[11px] font-medium">
                              {(tx as ExpenseEntry).paymentMethod}
                              {tx.notes ? ` • ${tx.notes}` : ""}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium">
                              {(tx as IncomeEntry).isRecurring ? "Recurring" : "Direct"}
                              {tx.notes ? ` • ${tx.notes}` : ""}
                            </span>
                          )}
                        </td>
                        <td className={`py-3.5 text-right font-black text-sm ${
                          isExp ? "text-[#E07A5F]" : "text-[#358E85]"
                        }`}>
                          {isExp ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 text-right pr-4">
                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  if (isExp) {
                                    onDeleteExpense(tx.id);
                                  } else {
                                    onDeleteIncome(tx.id);
                                  }
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-[#FF9A8B] hover:bg-[#F38573] text-slate-900 rounded-xl text-[10px] font-extrabold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (isExp) {
                                    onEditExpense(tx as ExpenseEntry);
                                  } else {
                                    onEditIncome(tx as IncomeEntry);
                                  }
                                }}
                                className="p-1.5 hover:bg-[#FBF7F0] rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Edit Transaction"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(tx.id)}
                                className="p-1.5 hover:bg-[#FFB7A5]/20 rounded-xl text-slate-400 hover:text-[#E07A5F] transition-colors cursor-pointer"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Toggle show all transactions if list is long and not filtering */}
            {!isFiltering && filteredTransactions.length > 8 && (
              <div className="text-center pt-2 border-t border-[#7ED4C9]/20">
                <button
                  id="dash-toggle-show-all-btn"
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="text-xs font-bold text-[#358E85] hover:text-[#4AA89E] cursor-pointer transition-colors"
                >
                  {showAllTransactions
                    ? "Show less (recent 8)"
                    : `Show all ${filteredTransactions.length} transactions`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
