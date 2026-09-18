import React, { useState } from "react";
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  ArrowRight,
  Wallet,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Percent,
  Target
} from "lucide-react";
import { BudgetEntry, BudgetStatus, ExpenseEntry } from "../types";
import { EXPENSE_CATEGORIES, getCategoryMeta } from "../data/categories";

interface BudgetViewProps {
  budgets: BudgetEntry[];
  budgetStatuses: BudgetStatus[];
  selectedMonth: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: string;
  onOpenAddModal: (type: "budget") => void;
  onEditBudget: (budget: BudgetEntry) => void;
  onDeleteBudget: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  budgetStatuses,
  selectedMonth,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  onOpenAddModal,
  onEditBudget,
  onDeleteBudget,
  onNavigateTab,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Format month
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const totalBudgetLimit = budgetStatuses.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const overallPercentage = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  const overspentBudgets = budgetStatuses.filter(b => b.status === "exceeded");

  // Income vs Spending Progress Bar calculations
  const spendOfIncomePercentage = totalIncome > 0 
    ? (totalExpenses / totalIncome) * 100 
    : totalExpenses > 0 ? 100 : 0;

  const savingsOfIncomePercentage = totalIncome > 0 
    ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0;

  const isOverIncome = totalIncome > 0 ? totalExpenses > totalIncome : totalExpenses > 0;
  const isHealthySavings = parseFloat(savingsRate) >= 20;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B5A96] mb-1">
            <PieChart className="w-4 h-4 text-[#8E7BB5]" />
            <span>Budget Planning &amp; Limits</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Spending &amp; Budgets for {monthName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track category spending caps and visualize your overall cashflow savings progress against monthly income.
          </p>
        </div>

        <button
          id="set-budget-main-btn"
          onClick={() => onOpenAddModal("budget")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 border border-[#FF9A8B]/60"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>+ Set Category Limit</span>
        </button>
      </div>

      {/* VISUALIZATION COMPONENT: Overall Monthly Spending vs Income Savings Progress Tracker */}
      <div 
        id="savings-progress-visualization"
        className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isOverIncome 
                ? "bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/50" 
                : isHealthySavings 
                ? "bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/45" 
                : "bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/45"
            }`}>
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Overall Monthly Saving Progress
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOverIncome 
                    ? "bg-[#FFB7A5]/20 text-[#E07A5F] border-[#FFB7A5]/40" 
                    : isHealthySavings 
                    ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40" 
                    : "bg-[#C6B9E0]/20 text-[#6B5A96] border-[#C6B9E0]/40"
                }`}>
                  {isOverIncome ? "Deficit Alert" : isHealthySavings ? "Strong Savings" : "Moderate Savings"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total monthly spending outflow measured against earned monthly income inflows
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Net Cashflow Savings
            </span>
            <span className={`text-xl font-black tracking-tight ${netSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
              {netSavings >= 0 ? "+" : ""}₹{netSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1.5">
              ({savingsRate} saved)
            </span>
          </div>
        </div>

        {/* Progress Bar & Comparative Track */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Spending vs Income Burn Rate:
              </span>
              <span className={`font-extrabold ${isOverIncome ? "text-[#E07A5F]" : "text-slate-700"}`}>
                {spendOfIncomePercentage.toFixed(1)}% of Income Spent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Retained Buffer:</span>
              <span className="font-extrabold text-[#358E85]">
                {savingsOfIncomePercentage.toFixed(1)}% Preserved
              </span>
            </div>
          </div>

          {/* Layered Visual Progress Bar */}
          <div className="relative w-full bg-[#FBF7F0] h-5 rounded-full overflow-hidden p-0.5 border border-[#7ED4C9]/35">
            {/* 50% & 80% Benchmark Tick Markers */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 z-10 pointer-events-none" title="50% Needs Baseline" />
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-[#FFB7A5] z-10 pointer-events-none" title="80% Caution Threshold" />

            {/* Spent portion */}
            <div
              className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-slate-900 shadow-inner ${
                isOverIncome
                  ? "bg-[#FF9A8B]"
                  : spendOfIncomePercentage > 80
                  ? "bg-[#FFB7A5]"
                  : "bg-[#7ED4C9]"
              }`}
              style={{ width: `${Math.min(spendOfIncomePercentage, 100)}%` }}
            >
              {spendOfIncomePercentage > 15 && (
                <span>{spendOfIncomePercentage.toFixed(0)}%</span>
              )}
            </div>
          </div>

          {/* Benchmark Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5 font-semibold text-[#E07A5F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9A8B] inline-block" />
              Spent: ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="hidden sm:inline-block text-slate-400 text-[10px]">
              • 50% Recommended Essentials • 80% Maximum Spend Cap
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#358E85]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7ED4C9] inline-block" />
              Income: ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 3-Column Comparative Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7ED4C9]/20 text-[#358E85] shrink-0">
              <ArrowDownCircle className="w-4 h-4 text-[#4AA89E]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">Total Monthly Inflow</span>
              <span className="text-sm font-black text-[#358E85]">
                ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#FBF7F0] border border-[#FFB7A5]/35 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFB7A5]/25 text-[#E07A5F] shrink-0">
              <ArrowUpCircle className="w-4 h-4 text-[#E07A5F]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">Total Monthly Outflow</span>
              <span className="text-sm font-black text-[#E07A5F]">
                ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#FBF7F0] border border-[#C6B9E0]/35 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#C6B9E0]/25 text-[#6B5A96] shrink-0">
              <Target className="w-4 h-4 text-[#8E7BB5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">Saving Rate Status</span>
              <span className={`text-sm font-black ${isHealthySavings ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                {savingsRate} {isHealthySavings ? "(Target Met)" : "(Below 20% Goal)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#C6B9E0]/35 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Total Planned Category Budgets</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#6B5A96] tracking-tight">
              ₹{totalBudgetLimit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs hover:border-[#FF9A8B]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Category Budgets Spent</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalBudgetSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-2">({overallPercentage}%)</span>
          </div>
        </div>

        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all">
          <span className="text-xs font-semibold text-slate-500">Total Remaining Allowance</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#358E85] tracking-tight">
              ₹{totalRemaining.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Category Budget Utilization Bar */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800">Category Budgets Spent vs Planned Target</span>
          <span className="font-bold text-slate-600">{overallPercentage}% of total limit consumed</span>
        </div>
        <div className="w-full bg-[#FBF7F0] h-3 rounded-full overflow-hidden border border-[#7ED4C9]/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 100
                ? "bg-[#FF9A8B]"
                : overallPercentage > 80
                ? "bg-[#FFB7A5]"
                : "bg-[#7ED4C9]"
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Overspent Alerts Banner (if any) */}
      {overspentBudgets.length > 0 && (
        <div className="bg-[#FFB7A5]/20 border border-[#FFB7A5]/45 rounded-3xl p-5 shadow-xs flex items-start gap-3 text-slate-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#E07A5F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-[#E07A5F]">Overspend Alert in {overspentBudgets.length} {overspentBudgets.length === 1 ? "Category" : "Categories"}:</p>
            <p className="text-slate-600 font-medium">
              {overspentBudgets.map(b => `${b.category} (₹${b.spent.toFixed(0)} / ₹${b.limit.toFixed(0)})`).join(", ")}.
              Ask the Aura AI Chatbot for dynamic rebalancing suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetStatuses.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-[#7ED4C9]/50 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No category budgets defined for {monthName}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create monthly spending caps (e.g. ₹5,000 for Groceries, ₹3,000 for Dining Out) to track your limits in real-time.
            </p>
            <button
              onClick={() => onOpenAddModal("budget")}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-sm cursor-pointer border border-[#FF9A8B]/60"
            >
              + Create Category Budget
            </button>
          </div>
        ) : (
          budgetStatuses.map((status) => {
            const rawBudget = budgets.find(b => b.category === status.category && b.monthYear === selectedMonth);
            const meta = getCategoryMeta(status.category);
            const Icon = meta.icon;
            const isOver = status.spent > status.limit;

            return (
              <div 
                key={status.category}
                className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs space-y-4 hover:border-[#7ED4C9]/70 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-2xl ${meta.bgColor} ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{status.category}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status.status === "safe"
                            ? "bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40"
                            : status.status === "warning"
                            ? "bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/40"
                            : "bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/40"
                        }`}>
                          {status.status.toUpperCase()} ({status.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {rawBudget && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditBudget(rawBudget)}
                          className="p-1 hover:bg-[#FBF7F0] rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Edit Limit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBudget(rawBudget.id)}
                          className="p-1 hover:bg-[#FFB7A5]/20 rounded-xl text-slate-400 hover:text-[#E07A5F] transition-colors cursor-pointer"
                          title="Delete Limit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Spent: </span>
                      <span className={`font-black ${isOver ? "text-[#E07A5F]" : "text-slate-900"}`}>
                        ₹{status.spent.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Limit: </span>
                      <span className="font-bold text-slate-700">
                        ₹{status.limit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-[#FBF7F0] h-2.5 rounded-full overflow-hidden border border-[#7ED4C9]/25">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-[#FF9A8B]"
                          : status.percentage > 80
                          ? "bg-[#FFB7A5]"
                          : "bg-[#7ED4C9]"
                      }`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Remaining Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {isOver ? "Over budget by" : "Remaining buffer"}
                  </span>
                  <span className={`font-extrabold ${isOver ? "text-[#E07A5F]" : "text-[#358E85]"}`}>
                    ₹{Math.abs(status.remaining).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

