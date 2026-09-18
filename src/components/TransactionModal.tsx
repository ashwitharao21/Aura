import React, { useState, useEffect } from "react";
import { 
  X, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart,
  Repeat,
  Sparkles,
  CalendarRange,
  Check
} from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from "../data/categories";
import { ExpenseEntry, IncomeEntry, BudgetEntry } from "../types";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "expense" | "income" | "budget";
  editItem?: ExpenseEntry | IncomeEntry | BudgetEntry | null;
  selectedMonth: string; // YYYY-MM
  onSaveExpense: (expense: Omit<ExpenseEntry, "id" | "createdAt">, editId?: string, bulkMonths?: number) => Promise<void>;
  onSaveIncome: (income: Omit<IncomeEntry, "id" | "createdAt">, editId?: string, bulkMonths?: number) => Promise<void>;
  onSaveBudget: (budget: Omit<BudgetEntry, "id" | "createdAt">, editId?: string) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type: initialType,
  editItem,
  selectedMonth,
  onSaveExpense,
  onSaveIncome,
  onSaveBudget,
}) => {
  const [activeType, setActiveType] = useState<"expense" | "income" | "budget">(initialType);
  
  // Form fields
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].name);
  const [source, setSource] = useState<string>(INCOME_SOURCES[0].name);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].name);
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [autoGenerateFuture, setAutoGenerateFuture] = useState<boolean>(false);
  const [futureMonthsCount, setFutureMonthsCount] = useState<number>(3);
  const [budgetMonth, setBudgetMonth] = useState<string>(selectedMonth);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setActiveType(initialType);
    if (editItem) {
      if ("paymentMethod" in editItem) {
        // Expense item
        setActiveType("expense");
        setAmount(String(editItem.amount));
        setCategory(editItem.category);
        setPaymentMethod(editItem.paymentMethod);
        setDate(editItem.date);
        setNotes(editItem.notes || "");
        setIsRecurring(Boolean(editItem.isRecurring));
        setAutoGenerateFuture(false);
      } else if ("source" in editItem) {
        // Income item
        setActiveType("income");
        setAmount(String(editItem.amount));
        setSource(editItem.source);
        setDate(editItem.date);
        setNotes(editItem.notes || "");
        setIsRecurring(Boolean(editItem.isRecurring));
        setAutoGenerateFuture(false);
      } else if ("limit" in editItem) {
        // Budget item
        setActiveType("budget");
        setAmount(String(editItem.limit));
        setCategory(editItem.category);
        setBudgetMonth(editItem.monthYear);
      }
    } else {
      // Reset defaults for fresh entry
      setAmount("");
      setNotes("");
      setIsRecurring(false);
      setAutoGenerateFuture(false);
      setFutureMonthsCount(3);
      setDate(new Date().toISOString().substring(0, 10));
      setBudgetMonth(selectedMonth);
      if (initialType === "expense") setCategory(EXPENSE_CATEGORIES[0].name);
      if (initialType === "income") setSource(INCOME_SOURCES[0].name);
      if (initialType === "budget") setCategory(EXPENSE_CATEGORIES[0].name);
    }
    setFormError(null);
  }, [isOpen, initialType, editItem, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid positive amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      const bulkMonthsToCreate = (isRecurring && autoGenerateFuture && !editItem) ? futureMonthsCount : undefined;

      if (activeType === "expense") {
        await onSaveExpense(
          {
            amount: numAmount,
            category,
            paymentMethod,
            date,
            notes: notes.trim() || undefined,
            isRecurring,
          },
          editItem?.id,
          bulkMonthsToCreate
        );
      } else if (activeType === "income") {
        await onSaveIncome(
          {
            amount: numAmount,
            source,
            category: "Income",
            date,
            notes: notes.trim() || undefined,
            isRecurring,
          },
          editItem?.id,
          bulkMonthsToCreate
        );
      } else if (activeType === "budget") {
        await onSaveBudget(
          {
            category,
            limit: numAmount,
            monthYear: budgetMonth,
          },
          editItem?.id
        );
      }
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setFormError(err?.message || "Failed to save record. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white border border-[#7ED4C9]/35 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#7ED4C9]/20 flex items-center justify-between bg-[#FBF7F0]/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {activeType === "expense" && <ArrowUpCircle className="w-5 h-5 text-[#FF9A8B]" />}
            {activeType === "income" && <ArrowDownCircle className="w-5 h-5 text-[#4AA89E]" />}
            {activeType === "budget" && <PieChart className="w-5 h-5 text-[#358E85]" />}
            <h2 className="text-base font-extrabold text-slate-900">
              {editItem ? `Edit ${activeType}` : `Record ${activeType === "budget" ? "Monthly Budget" : activeType}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#FBF7F0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector (Only if not editing) */}
        {!editItem && (
          <div className="p-4 bg-[#FBF7F0]/70 border-b border-[#7ED4C9]/20 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveType("expense")}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === "expense"
                  ? "bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] text-slate-900 border border-[#FF9A8B]/60 shadow-xs"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveType("income")}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === "income"
                  ? "bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] text-slate-900 border border-[#4AA89E]/40 shadow-xs"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveType("budget")}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeType === "budget"
                  ? "bg-gradient-to-r from-[#B3E5DF] to-[#7ED4C9] text-slate-900 border border-[#7ED4C9]/50 shadow-xs"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Budget</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-[#FFB7A5]/25 border border-[#FF9A8B]/60 text-[#E07A5F] text-xs font-bold rounded-2xl">
              {formError}
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {activeType === "budget" ? "Monthly Spending Limit (₹)" : "Amount (₹)"}
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
              <input
                id="transaction-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-9 pr-4 text-sm font-black text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Expense Category Dropdown */}
          {activeType === "expense" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="expense-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name} className="bg-white text-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Budget Category Dropdown & Month */}
          {activeType === "budget" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Expense Category</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="budget-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name} className="bg-white text-slate-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Month</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="budget-month-input"
                    type="month"
                    value={budgetMonth}
                    onChange={(e) => setBudgetMonth(e.target.value)}
                    required
                    className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Income Source Dropdown */}
          {activeType === "income" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Income Source</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="income-source-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src.name} value={src.name} className="bg-white text-slate-900">
                      {src.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Payment Method (Expense only) */}
          {activeType === "expense" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="expense-payment-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.name} value={pm.name} className="bg-white text-slate-900">
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date Picker (Income & Expense) */}
          {activeType !== "budget" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="transaction-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Notes & Optional Tag (Income & Expense) */}
          {activeType !== "budget" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  id="transaction-notes-input"
                  rows={2}
                  placeholder={
                    activeType === "expense"
                      ? "e.g. Monthly Netflix subscription, Electric bill, Grocery run"
                      : "e.g. Monthly salary from Tech Corp, Freelance design retainer"
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Recurring Toggle for BOTH Expense and Income */}
          {activeType !== "budget" && (
            <div className="pt-1 pb-1 space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-[#FBF7F0] border border-[#7ED4C9]/35 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${
                    isRecurring 
                      ? (activeType === "income" ? "bg-[#7ED4C9]/25 text-[#358E85]" : "bg-[#FFB7A5]/30 text-[#E07A5F]") 
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <label htmlFor="recurring-toggle" className="text-xs font-extrabold text-slate-900 cursor-pointer block">
                      {activeType === "expense" ? "Recurring Monthly Expense" : "Recurring Monthly Income"}
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {activeType === "expense"
                        ? "For subscriptions, rent, insurance, or monthly utility bills"
                        : "For monthly salary, rental earnings, or regular retainers"}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="recurring-toggle"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    activeType === "income" ? "peer-checked:bg-[#4AA89E]" : "peer-checked:bg-[#FF9A8B]"
                  }`} />
                </label>
              </div>

              {/* Future Months Bulk Generation Helper Sub-Card */}
              {isRecurring && !editItem && (
                <div className="p-3.5 bg-[#C6B9E0]/20 border border-[#C6B9E0]/45 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-[#6B5A96] shrink-0" />
                      <span className="text-xs font-extrabold text-[#6B5A96]">
                        Bulk-Generate for Future Months
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B5A96] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenerateFuture}
                        onChange={(e) => setAutoGenerateFuture(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#6B5A96] focus:ring-[#6B5A96]"
                      />
                      <span>Enable</span>
                    </label>
                  </div>

                  {autoGenerateFuture && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-700 font-semibold">Generate for upcoming:</span>
                        <select
                          value={futureMonthsCount}
                          onChange={(e) => setFutureMonthsCount(parseInt(e.target.value, 10))}
                          className="bg-white border border-[#C6B9E0]/50 rounded-xl py-1 px-2.5 text-xs font-bold text-[#6B5A96] outline-none cursor-pointer"
                        >
                          <option value={1}>Next 1 Month</option>
                          <option value={3}>Next 3 Months (Quarter)</option>
                          <option value={6}>Next 6 Months (Half Year)</option>
                          <option value={12}>Next 12 Months (Full Year)</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-[#6B5A96] font-medium">
                        Automatically adds this recurring {activeType} to your future monthly ledgers on the same day of each month.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#7ED4C9]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#FBF7F0] rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-transaction-btn"
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                activeType === "income"
                  ? "bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 border border-[#4AA89E]/40"
                  : activeType === "budget"
                  ? "bg-gradient-to-r from-[#B3E5DF] to-[#7ED4C9] hover:from-[#7ED4C9] hover:to-[#4AA89E] text-slate-900 border border-[#7ED4C9]/50"
                  : "bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 border border-[#FF9A8B]/60"
              }`}
            >
              {isSubmitting 
                ? "Saving..." 
                : autoGenerateFuture && isRecurring
                ? `Save & Bulk-Generate (${futureMonthsCount + 1} mos)`
                : editItem 
                ? "Update Record" 
                : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

