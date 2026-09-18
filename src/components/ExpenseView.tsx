import React, { useState, useMemo } from "react";
import { 
  ArrowUpCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Trash2, 
  Tag, 
  CreditCard, 
  ArrowUpDown, 
  SlidersHorizontal,
  Repeat,
  X
} from "lucide-react";
import { ExpenseEntry } from "../types";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, getCategoryMeta } from "../data/categories";

interface ExpenseViewProps {
  expenses: ExpenseEntry[];
  selectedMonth: string;
  onOpenAddModal: (type: "expense") => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  selectedMonth,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort expenses in real-time
  const processedExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = expenses.filter((item) => {
      const matchesSearch = !q ||
        item.category.toLowerCase().includes(q) ||
        item.paymentMethod.toLowerCase().includes(q) ||
        (item.notes ? item.notes.toLowerCase().includes(q) : false) ||
        item.date.includes(q) ||
        item.amount.toString().includes(q);
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesPayment = selectedPaymentMethod === "all" || item.paymentMethod === selectedPaymentMethod;
      return matchesSearch && matchesCategory && matchesPayment;
    });

    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, searchQuery, selectedCategory, selectedPaymentMethod, sortBy]);

  const totalFilteredExpense = useMemo(() => {
    return processedExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [processedExpenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#E07A5F] mb-1">
            <ArrowUpCircle className="w-4 h-4 text-[#FF9A8B]" />
            <span>Expense Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Daily Expenses &amp; Outflows
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track category spending, payment channels, and receipt notes in real-time.
          </p>
        </div>

        <button
          id="add-expense-main-btn"
          onClick={() => onOpenAddModal("expense")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 border border-[#FF9A8B]/60"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>+ Record Daily Expense</span>
        </button>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs hover:border-[#FF9A8B]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Total Filtered Spend</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#E07A5F] tracking-tight">
              ₹{totalFilteredExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Total Transactions</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {processedExpenses.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Average Per Transaction</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#358E85] tracking-tight">
              ₹{processedExpenses.length > 0 ? (totalFilteredExpense / processedExpenses.length).toFixed(2) : "0.00"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#C6B9E0]/35 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Recurring Outflows</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#6B5A96] tracking-tight">
              {expenses.filter(e => e.isRecurring).length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] text-slate-900 shadow-xs border border-[#FF9A8B]/60"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30"
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((cat) => {
          const count = expenses.filter(e => e.category === cat.name).length;
          if (count === 0 && selectedCategory !== cat.name) return null;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] text-slate-900 shadow-xs border border-[#FF9A8B]/60"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search & Selectors */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="expense-search-input"
            type="text"
            placeholder="Search note content, category, or payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              id="clear-expense-search-btn"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment Method Filter */}
          <select
            id="expense-payment-method-filter"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.name} value={pm.name}>
                {pm.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            id="expense-sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#4AA89E] cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl shadow-xs overflow-hidden">
        {processedExpenses.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/45 flex items-center justify-center mx-auto mb-3">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No expenses found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all" || selectedPaymentMethod !== "all"
                ? "Try clearing filters to view all expense transactions."
                : "Record your daily purchases to start tracking your outflow."}
            </p>
            <button
              onClick={() => onOpenAddModal("expense")}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-sm cursor-pointer border border-[#FF9A8B]/60"
            >
              + Add Expense Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#7ED4C9]/20 text-slate-600 font-bold bg-[#FBF7F0]/60">
                  <th className="py-3.5 pl-5">Category</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Payment Method</th>
                  <th className="py-3.5">Notes</th>
                  <th className="py-3.5 text-right">Amount</th>
                  <th className="py-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedExpenses.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  const Icon = meta.icon;
                  return (
                    <tr key={item.id} className="hover:bg-[#FBF7F0]/80 transition-colors group">
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-2xl ${meta.bgColor} ${meta.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800">{item.category}</span>
                              {item.isRecurring && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/40">
                                  <Repeat className="w-2.5 h-2.5" />
                                  <span>Recurring</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {item.date}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FBF7F0] text-slate-700 border border-[#7ED4C9]/30">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 max-w-xs truncate font-medium">
                        {item.notes || "—"}
                      </td>
                      <td className="py-3.5 text-right font-black text-[#E07A5F] text-sm">
                        -₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right pr-5">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onDeleteExpense(item.id);
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
                              onClick={() => onEditExpense(item)}
                              className="p-1.5 hover:bg-[#FBF7F0] rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 hover:bg-[#FFB7A5]/20 rounded-xl text-slate-400 hover:text-[#E07A5F] transition-colors cursor-pointer"
                              title="Delete Expense"
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
