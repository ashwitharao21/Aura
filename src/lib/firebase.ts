import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";
import { 
  UserProfile, 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetEntry 
} from "../types";

// Zero-Crash Payload Hygiene: strips undefined properties recursively
export function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanPayload(item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    if (value !== undefined) {
      cleaned[key] = typeof value === "object" && value !== null ? cleanPayload(value) : value;
    }
  }
  return cleaned as T;
}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await syncUserProfile(user);
    }
    return user;
  } catch (error: any) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
}

export async function signOutUser() {
  await fbSignOut(auth);
}

// User Profile Synchronization
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "User",
      photoURL: user.photoURL,
      currency: "USD",
      monthlySavingsGoal: 500,
      createdAt: now,
      lastLoginAt: now,
    };
    await setDoc(userRef, cleanPayload(newProfile));
    return newProfile;
  } else {
    const data = snap.data() as UserProfile;
    await updateDoc(userRef, { lastLoginAt: now });
    return { ...data, lastLoginAt: now };
  }
}

// --- INCOME CRUD ---
export function subscribeToIncomes(userId: string, onUpdate: (incomes: IncomeEntry[]) => void, onError?: (err: Error) => void) {
  const collRef = collection(db, "users", userId, "income");
  const q = query(collRef, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as IncomeEntry));
    onUpdate(items);
  }, (err) => {
    console.error("Firestore incomes subscription error:", err);
    if (onError) onError(err);
  });
}

export async function saveIncome(userId: string, income: Omit<IncomeEntry, "id" | "createdAt">, editId?: string): Promise<string> {
  const collRef = collection(db, "users", userId, "income");
  const now = new Date().toISOString();
  if (editId) {
    const docRef = doc(db, "users", userId, "income", editId);
    await setDoc(docRef, cleanPayload({ ...income, updatedAt: now }), { merge: true });
    return editId;
  } else {
    const docRef = await addDoc(collRef, cleanPayload({ ...income, createdAt: now }));
    return docRef.id;
  }
}

export async function deleteIncome(userId: string, incomeId: string) {
  const docRef = doc(db, "users", userId, "income", incomeId);
  await deleteDoc(docRef);
}

// --- EXPENSES CRUD ---
export function subscribeToExpenses(userId: string, onUpdate: (expenses: ExpenseEntry[]) => void, onError?: (err: Error) => void) {
  const collRef = collection(db, "users", userId, "expenses");
  const q = query(collRef, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseEntry));
    onUpdate(items);
  }, (err) => {
    console.error("Firestore expenses subscription error:", err);
    if (onError) onError(err);
  });
}

export async function saveExpense(userId: string, expense: Omit<ExpenseEntry, "id" | "createdAt">, editId?: string): Promise<string> {
  const collRef = collection(db, "users", userId, "expenses");
  const now = new Date().toISOString();
  if (editId) {
    const docRef = doc(db, "users", userId, "expenses", editId);
    await setDoc(docRef, cleanPayload({ ...expense, updatedAt: now }), { merge: true });
    return editId;
  } else {
    const docRef = await addDoc(collRef, cleanPayload({ ...expense, createdAt: now }));
    return docRef.id;
  }
}

export async function deleteExpense(userId: string, expenseId: string) {
  const docRef = doc(db, "users", userId, "expenses", expenseId);
  await deleteDoc(docRef);
}

// Date helper for future month recurrence calculation
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  const day = parseInt(dayStr, 10) || 1;

  const totalMonths = (year * 12 + (month - 1)) + monthsToAdd;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;

  const maxDays = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, maxDays);

  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/**
 * Bulk generate future recurring entries for recurring incomes and expenses.
 */
export async function bulkGenerateRecurringEntries(
  userId: string,
  monthsAhead: number = 3,
  specificItem?: {
    type: "income" | "expense";
    data: (Omit<IncomeEntry, "id" | "createdAt"> | Omit<ExpenseEntry, "id" | "createdAt">);
  }
): Promise<{
  createdIncomes: number;
  createdExpenses: number;
  targetMonths: string[];
}> {
  let createdIncomes = 0;
  let createdExpenses = 0;
  const targetMonthsSet = new Set<string>();
  const now = new Date().toISOString();

  if (specificItem) {
    const baseDate = specificItem.data.date;
    for (let m = 1; m <= monthsAhead; m++) {
      const futureDate = addMonthsToDate(baseDate, m);
      const targetMonthYear = futureDate.substring(0, 7);
      targetMonthsSet.add(targetMonthYear);

      if (specificItem.type === "income") {
        const incomeColl = collection(db, "users", userId, "income");
        await addDoc(incomeColl, cleanPayload({
          ...specificItem.data,
          date: futureDate,
          isRecurring: true,
          createdAt: now,
          notes: specificItem.data.notes ? `${specificItem.data.notes} (Auto-generated recurring)` : "(Auto-generated recurring)",
        }));
        createdIncomes++;
      } else {
        const expenseColl = collection(db, "users", userId, "expenses");
        await addDoc(expenseColl, cleanPayload({
          ...specificItem.data,
          date: futureDate,
          isRecurring: true,
          createdAt: now,
          notes: specificItem.data.notes ? `${specificItem.data.notes} (Auto-generated recurring)` : "(Auto-generated recurring)",
        }));
        createdExpenses++;
      }
    }
  } else {
    // Fetch all existing recurring items
    const incomeColl = collection(db, "users", userId, "income");
    const expenseColl = collection(db, "users", userId, "expenses");

    const [incomeSnap, expenseSnap] = await Promise.all([
      getDocs(incomeColl),
      getDocs(expenseColl)
    ]);

    const recurringIncomes = incomeSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as IncomeEntry))
      .filter(i => i.isRecurring);

    const recurringExpenses = expenseSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as ExpenseEntry))
      .filter(e => e.isRecurring);

    // Group unique recurring templates by source/category + amount
    const uniqueIncomeTemplates = new Map<string, IncomeEntry>();
    for (const inc of recurringIncomes) {
      const key = `${inc.source}_${inc.amount}`;
      if (!uniqueIncomeTemplates.has(key) || inc.date > uniqueIncomeTemplates.get(key)!.date) {
        uniqueIncomeTemplates.set(key, inc);
      }
    }

    const uniqueExpenseTemplates = new Map<string, ExpenseEntry>();
    for (const exp of recurringExpenses) {
      const key = `${exp.category}_${exp.amount}_${exp.paymentMethod}`;
      if (!uniqueExpenseTemplates.has(key) || exp.date > uniqueExpenseTemplates.get(key)!.date) {
        uniqueExpenseTemplates.set(key, exp);
      }
    }

    // Generate future months
    for (let m = 1; m <= monthsAhead; m++) {
      for (const inc of Array.from(uniqueIncomeTemplates.values())) {
        const futureDate = addMonthsToDate(inc.date, m);
        const futureMonth = futureDate.substring(0, 7);
        targetMonthsSet.add(futureMonth);

        // Check if already exists in this month
        const alreadyExists = incomeSnap.docs.some(d => {
          const data = d.data() as IncomeEntry;
          return data.source === inc.source && data.amount === inc.amount && data.date.startsWith(futureMonth);
        });

        if (!alreadyExists) {
          await addDoc(incomeColl, cleanPayload({
            source: inc.source,
            amount: inc.amount,
            category: inc.category || "Income",
            date: futureDate,
            isRecurring: true,
            notes: inc.notes ? `${inc.notes} (Recurring)` : "(Recurring)",
            createdAt: now,
          }));
          createdIncomes++;
        }
      }

      for (const exp of Array.from(uniqueExpenseTemplates.values())) {
        const futureDate = addMonthsToDate(exp.date, m);
        const futureMonth = futureDate.substring(0, 7);
        targetMonthsSet.add(futureMonth);

        const alreadyExists = expenseSnap.docs.some(d => {
          const data = d.data() as ExpenseEntry;
          return data.category === exp.category && data.amount === exp.amount && data.date.startsWith(futureMonth);
        });

        if (!alreadyExists) {
          await addDoc(expenseColl, cleanPayload({
            category: exp.category,
            amount: exp.amount,
            paymentMethod: exp.paymentMethod,
            date: futureDate,
            isRecurring: true,
            notes: exp.notes ? `${exp.notes} (Recurring)` : "(Recurring)",
            createdAt: now,
          }));
          createdExpenses++;
        }
      }
    }
  }

  return {
    createdIncomes,
    createdExpenses,
    targetMonths: Array.from(targetMonthsSet).sort(),
  };
}

// --- BUDGETS CRUD ---
export function subscribeToBudgets(userId: string, onUpdate: (budgets: BudgetEntry[]) => void, onError?: (err: Error) => void) {
  const collRef = collection(db, "users", userId, "budgets");
  return onSnapshot(collRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BudgetEntry));
    onUpdate(items);
  }, (err) => {
    console.error("Firestore budgets subscription error:", err);
    if (onError) onError(err);
  });
}

export async function saveBudget(userId: string, budget: Omit<BudgetEntry, "id" | "createdAt">, editId?: string): Promise<string> {
  const collRef = collection(db, "users", userId, "budgets");
  const now = new Date().toISOString();
  if (editId) {
    const docRef = doc(db, "users", userId, "budgets", editId);
    await setDoc(docRef, cleanPayload({ ...budget, updatedAt: now }), { merge: true });
    return editId;
  } else {
    const docRef = await addDoc(collRef, cleanPayload({ ...budget, createdAt: now }));
    return docRef.id;
  }
}

export async function deleteBudget(userId: string, budgetId: string) {
  const docRef = doc(db, "users", userId, "budgets", budgetId);
  await deleteDoc(docRef);
}
