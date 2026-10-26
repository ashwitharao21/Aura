import React, { useState, useMemo } from "react";
import { 
  ArrowDownCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Trash2, 
  Repeat, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Sparkles,
  X,
  ArrowUpDown,
  RotateCcw
} from "lucide-react";
import { IncomeEntry } from "../types";
import { INCOME_SOURCES, getIncomeSourceMeta } from "../data/categories";

interface IncomeViewProps {
  incomes: IncomeEntry[];
  selectedMonth: string;
  onOpenAddModal: (type: "income") => void;
  onEditIncome: (income: IncomeEntry) => void;
  onDeleteIncome: (id: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  selectedMonth,
  onOpenAddModal,
  onEditIncome,
  onDeleteIncome,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort incomes in real-time
  const filteredIncomes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = incomes.filter((item) => {
      const matchesSearch = !q ||
        item.source.toLowerCase().includes(q) ||
        (item.category ? item.category.toLowerCase().includes(q) : false) ||
        (item.notes ? item.notes.toLowerCase().includes(q) : false) ||
        (item.tag ? item.tag.toLowerCase().includes(q) : false) ||
        item.date.includes(q) ||
        item.amount.toString().includes(q);
      const matchesSource = selectedSource === "all" || item.source === selectedSource;
      return matchesSearch && matchesSource;
    });

    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [incomes, searchQuery, selectedSource, sortBy]);

  const totalFilteredIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredIncomes]);

  const isFiltering = searchQuery.trim().length > 0 || selectedSource !== "all";

  // Source breakdown calculation
  const sourceTotals = useMemo(() => {
    const map: Record<string, number> = {};
    incomes.forEach((item) => {
      map[item.source] = (map[item.source] || 0) + item.amount;
    });
    return map;
  }, [incomes]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#358E85] mb-1">
            <ArrowDownCircle className="w-4 h-4 text-[#4AA89E]" />
            <span>Income Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Income Streams &amp; Earnings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track salaries, freelance payouts, dividends, and business cashflow.
          </p>
        </div>

        <button
          id="add-income-main-btn"
          onClick={() => onOpenAddModal("income")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 border border-[#4AA89E]/40"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>+ Log Income Source</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Total Monthly Income</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#358E85] tracking-tight">
              ₹{totalFilteredIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Income Entries</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {filteredIncomes.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#C6B9E0]/35 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Recurring Streams</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#6B5A96] tracking-tight">
              {incomes.filter(i => i.isRecurring).length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Sources Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSource("all")}
          className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            selectedSource === "all"
              ? "bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] text-slate-900 shadow-xs border border-[#4AA89E]/40"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30"
          }`}
        >
          All Sources ({incomes.length})
        </button>
        {INCOME_SOURCES.map((src) => {
          const count = incomes.filter(i => i.source === src.name).length;
          if (count === 0 && selectedSource !== src.name) return null;
          return (
            <button
              key={src.name}
              onClick={() => setSelectedSource(src.name)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedSource === src.name
                  ? "bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] text-slate-900 shadow-xs border border-[#4AA89E]/40"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30"
              }`}
            >
              {src.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search & Selectors */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="income-search-input"
            type="text"
            placeholder="Search description, notes, category, or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              id="clear-income-search-btn"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Source / Category Filter */}
          <select
            id="income-source-filter"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer"
          >
            <option value="all">All Sources ({incomes.length})</option>
            {INCOME_SOURCES.map((src) => (
              <option key={src.name} value={src.name}>
                {src.name}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            id="income-sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* Reset Filters Shortcut */}
          {isFiltering && (
            <button
              id="reset-income-filters-header-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedSource("all");
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold text-[#358E85] bg-[#7ED4C9]/20 hover:bg-[#7ED4C9]/35 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <div className="text-xs text-slate-500 font-bold whitespace-nowrap pl-1">
            Showing {filteredIncomes.length} of {incomes.length}
          </div>
        </div>
      </div>

      {/* Incomes Table / List */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl shadow-xs overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center mx-auto mb-3">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No income records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedSource !== "all"
                ? "Try clearing filters to view all income entries."
                : "Log your first income entry to start tracking your cashflow."}
            </p>
            {isFiltering ? (
              <button
                id="reset-income-empty-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSource("all");
                }}
                className="mt-4 px-4 py-2 bg-[#7ED4C9]/25 hover:bg-[#7ED4C9]/40 text-[#358E85] border border-[#7ED4C9]/50 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => onOpenAddModal("income")}
                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-sm cursor-pointer border border-[#4AA89E]/40"
              >
                + Add Income Entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#7ED4C9]/20 text-slate-600 font-bold bg-[#FBF7F0]/60">
                  <th className="py-3.5 pl-5">Source</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5">Notes</th>
                  <th className="py-3.5 text-right">Amount</th>
                  <th className="py-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map((item) => {
                  const meta = getIncomeSourceMeta(item.source);
                  const Icon = meta.icon;
                  return (
                    <tr key={item.id} className="hover:bg-[#FBF7F0]/80 transition-colors group">
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-2xl ${meta.bgColor} ${meta.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-800">{item.source}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {item.date}
                      </td>
                      <td className="py-3.5">
                        {item.isRecurring ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/40">
                            <Repeat className="w-3 h-3" />
                            Recurring
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBF7F0] text-slate-600 border border-slate-200">
                            One-time
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-500 max-w-xs truncate font-medium">
                        {item.notes || "—"}
                      </td>
                      <td className="py-3.5 text-right font-black text-[#358E85] text-sm">
                        +₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right pr-5">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onDeleteIncome(item.id);
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
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditIncome(item)}
                              className="p-1.5 hover:bg-[#FBF7F0] rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Edit Income"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 hover:bg-[#FFB7A5]/20 rounded-xl text-slate-400 hover:text-[#E07A5F] transition-colors cursor-pointer"
                              title="Delete Income"
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
        )}
      </div>
    </div>
  );
};
