/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  syncUserProfile, 
  subscribeToIncomes, 
  subscribeToExpenses, 
  subscribeToBudgets, 
  saveIncome, 
  deleteIncome, 
  saveExpense, 
  deleteExpense, 
  saveBudget, 
  deleteBudget, 
  bulkGenerateRecurringEntries
} from "./lib/firebase";
import { 
  UserProfile, 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetEntry, 
  BudgetStatus 
} from "./types";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { IncomeView } from "./components/IncomeView";
import { ExpenseView } from "./components/ExpenseView";
import { BudgetView } from "./components/BudgetView";
import { ReportsView } from "./components/ReportsView";
import { TransactionModal } from "./components/TransactionModal";
import { ToastContainer, ToastMessage } from "./components/Toast";

export default function App() {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Navigation & Selected Month
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Data Collections
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"expense" | "income" | "budget">("expense");
  const [editItem, setEditItem] = useState<ExpenseEntry | IncomeEntry | BudgetEntry | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: "success" | "error" | "info" | "warning" | "danger",
    message: string,
    options?: {
      title?: string;
      details?: string;
      badge?: string;
      duration?: number;
    }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options?.duration || (type === "warning" || type === "danger" ? 6500 : 4000);
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        message,
        title: options?.title,
        details: options?.details,
        badge: options?.badge,
        duration,
      },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          setUser(profile);
        } catch (err) {
          console.error("Error syncing profile:", err);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "User",
            photoURL: fbUser.photoURL,
            currency: "INR",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setIncomes([]);
        setExpenses([]);
        setBudgets([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to User's Firestore Data
  useEffect(() => {
    if (!user) return;

    const unsubs = [
      subscribeToIncomes(user.uid, (data) => setIncomes(data)),
      subscribeToExpenses(user.uid, (data) => setExpenses(data)),
      subscribeToBudgets(user.uid, (data) => setBudgets(data)),
    ];

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [user]);

  // Filtered Records for Selected Month
  const currentMonthIncomes = useMemo(() => {
    return incomes.filter((i) => i.date.startsWith(selectedMonth));
  }, [incomes, selectedMonth]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter((b) => b.monthYear === selectedMonth);
  }, [budgets, selectedMonth]);

  // Calculated Metrics
  const totalIncome = useMemo(() => {
    return currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [currentMonthIncomes]);

  const totalExpenses = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category Expense Totals
  const categoryExpensesMap = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [currentMonthExpenses]);

  // Computed Budget Statuses
  const budgetStatuses: BudgetStatus[] = useMemo(() => {
    return currentMonthBudgets.map((b) => {
      const spent = categoryExpensesMap[b.category] || 0;
      const remaining = b.limit - spent;
      const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      
      let status: BudgetStatus["status"] = "safe";
      if (percentage > 100) status = "exceeded";
      else if (percentage >= 90) status = "danger";
      else if (percentage >= 70) status = "warning";

      return {
        category: b.category,
        limit: b.limit,
        spent,
        remaining,
        percentage,
        status,
      };
    });
  }, [currentMonthBudgets, categoryExpensesMap]);

  // CRUD Handlers
  const handleSaveExpense = async (
    expenseData: Omit<ExpenseEntry, "id" | "createdAt">, 
    editId?: string,
    bulkMonths?: number
  ) => {
    if (!user) return;
    
    // Save to Firestore
    await saveExpense(user.uid, expenseData, editId);
    
    if (bulkMonths && bulkMonths > 0) {
      const result = await bulkGenerateRecurringEntries(user.uid, bulkMonths, {
        type: "expense",
        data: expenseData
      });
      addToast(
        "success", 
        `Expense saved and bulk-generated across ${result.createdExpenses} future month(s) (${result.targetMonths.join(", ")}).`
      );
    } else {
      addToast("success", editId ? "Expense updated successfully." : "Expense recorded successfully.");
    }

    // Evaluate budget threshold for this category & month
    const expenseMonth = expenseData.date.substring(0, 7);
    const matchingBudget = budgets.find(
      (b) => b.category === expenseData.category && b.monthYear === expenseMonth
    );

    if (matchingBudget && matchingBudget.limit > 0) {
      const otherExpenses = expenses.filter(
        (e) => e.date.startsWith(expenseMonth) && e.category === expenseData.category && (!editId || e.id !== editId)
      );
      const priorSpend = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
      const newTotalSpend = priorSpend + expenseData.amount;
      const percentage = Math.round((newTotalSpend / matchingBudget.limit) * 100);

      // Stagger alert toast slightly so user clearly sees both confirmation and budget status
      setTimeout(() => {
        if (newTotalSpend > matchingBudget.limit) {
          const overAmount = newTotalSpend - matchingBudget.limit;
          addToast(
            "danger",
            `Budget exceeded for ${expenseData.category}! Total spend has reached ₹${newTotalSpend.toFixed(2)} (${percentage}% of your ₹${matchingBudget.limit.toFixed(2)} limit).`,
            {
              title: "🚨 Budget Limit Exceeded",
              badge: `${percentage}% Used`,
              details: `You are ₹${overAmount.toFixed(2)} over budget for ${expenseMonth}.`,
              duration: 7500,
            }
          );
        } else if (newTotalSpend === matchingBudget.limit) {
          addToast(
            "danger",
            `100% of your ₹${matchingBudget.limit.toFixed(2)} budget for ${expenseData.category} has now been reached.`,
            {
              title: "⚠️ 100% Budget Limit Reached",
              badge: "100% Used",
              details: `Zero balance remaining for ${expenseData.category} in ${expenseMonth}. Any further spend will exceed your budget.`,
              duration: 7500,
            }
          );
        } else if (newTotalSpend >= matchingBudget.limit * 0.9) {
          const remaining = matchingBudget.limit - newTotalSpend;
          addToast(
            "warning",
            `High spending alert: ${expenseData.category} has reached ${percentage}% of your ₹${matchingBudget.limit.toFixed(2)} budget.`,
            {
              title: "⚠️ Budget Warning (90%+)",
              badge: `${percentage}% Used`,
              details: `Only ₹${remaining.toFixed(2)} remaining for ${expenseData.category} before reaching the ₹${matchingBudget.limit.toFixed(2)} monthly limit.`,
              duration: 7000,
            }
          );
        }
      }, 300);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    await deleteExpense(user.uid, id);
    addToast("info", "Expense removed.");
  };

  const handleSaveIncome = async (
    incomeData: Omit<IncomeEntry, "id" | "createdAt">, 
    editId?: string,
    bulkMonths?: number
  ) => {
    if (!user) return;
    await saveIncome(user.uid, incomeData, editId);

    if (bulkMonths && bulkMonths > 0) {
      const result = await bulkGenerateRecurringEntries(user.uid, bulkMonths, {
        type: "income",
        data: incomeData
      });
      addToast(
        "success", 
        `Income stream saved and bulk-generated across ${result.createdIncomes} future month(s) (${result.targetMonths.join(", ")}).`
      );
    } else {
      addToast("success", editId ? "Income updated successfully." : "Income stream logged successfully.");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!user) return;
    await deleteIncome(user.uid, id);
    addToast("info", "Income stream removed.");
  };

  const handleSaveBudget = async (budgetData: Omit<BudgetEntry, "id" | "createdAt">, editId?: string) => {
    if (!user) return;
    await saveBudget(user.uid, budgetData, editId);
    addToast("success", editId ? "Budget limit updated." : "Category budget limit set.");
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    await deleteBudget(user.uid, id);
    addToast("info", "Category budget deleted.");
  };

  // Modal Openers
  const handleOpenAddModal = (type: "expense" | "income" | "budget") => {
    setModalType(type);
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: ExpenseEntry) => {
    setModalType("expense");
    setEditItem(expense);
    setIsModalOpen(true);
  };

  const handleEditIncome = (income: IncomeEntry) => {
    setModalType("income");
    setEditItem(income);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: BudgetEntry) => {
    setModalType("budget");
    setEditItem(budget);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center text-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-aura-gradient p-0.5 shadow-md animate-pulse">
          <div className="w-full h-full bg-[#FBF7F0] rounded-[14px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#4AA89E] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-4">Connecting to Cloud Firestore &amp; Auth...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onSignIn={signInWithGoogle} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-slate-900 flex flex-col font-sans selection:bg-[#7ED4C9]/30 selection:text-[#1E293B]">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        user={user}
        onSignOut={signOutUser}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === "dashboard" && (
          <DashboardView
            selectedMonth={selectedMonth}
            incomes={currentMonthIncomes}
            expenses={currentMonthExpenses}
            budgetStatuses={budgetStatuses}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netSavings={netSavings}
            savingsRate={savingsRate}
            onOpenAddModal={handleOpenAddModal}
            onNavigateTab={setCurrentTab}
            onEditExpense={handleEditExpense}
            onEditIncome={handleEditIncome}
            onDeleteExpense={handleDeleteExpense}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {currentTab === "income" && (
          <IncomeView
            incomes={currentMonthIncomes}
            selectedMonth={selectedMonth}
            onOpenAddModal={handleOpenAddModal}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {currentTab === "expenses" && (
          <ExpenseView
            expenses={currentMonthExpenses}
            selectedMonth={selectedMonth}
            onOpenAddModal={handleOpenAddModal}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === "budgets" && (
          <BudgetView
            budgets={budgets}
            budgetStatuses={budgetStatuses}
            selectedMonth={selectedMonth}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netSavings={netSavings}
            savingsRate={savingsRate}
            onOpenAddModal={handleOpenAddModal}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === "reports" && (
          <ReportsView
            selectedMonth={selectedMonth}
            incomes={currentMonthIncomes}
            expenses={currentMonthExpenses}
            budgetStatuses={budgetStatuses}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netSavings={netSavings}
            savingsRate={savingsRate}
            allIncomes={incomes}
            allExpenses={expenses}
            allBudgets={budgets}
          />
        )}
      </main>

      {/* Shared Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        editItem={editItem}
        selectedMonth={selectedMonth}
        onSaveExpense={handleSaveExpense}
        onSaveIncome={handleSaveIncome}
        onSaveBudget={handleSaveBudget}
      />

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
