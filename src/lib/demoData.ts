import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc,
  writeBatch 
} from "firebase/firestore";
import { db, cleanPayload } from "./firebase";
import { 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetEntry, 
  ChatMessage, 
  ChatSession,
  ExpenseCategory,
  IncomeSource,
  PaymentMethod 
} from "../types";

export interface DemoDataset {
  incomes: Array<Omit<IncomeEntry, "id" | "createdAt">>;
  expenses: Array<Omit<ExpenseEntry, "id" | "createdAt">>;
  budgets: Array<Omit<BudgetEntry, "id" | "createdAt">>;
  chatSession: {
    title: string;
    messages: Array<Omit<ChatMessage, "id">>;
  };
}

export function getSampleMonthStrings() {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1; // 1-12

  const formatYM = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

  const currentYM = formatYM(curYear, curMonth);
  
  // Prev month 1
  let prev1M = curMonth - 1;
  let prev1Y = curYear;
  if (prev1M < 1) {
    prev1M = 12;
    prev1Y -= 1;
  }
  const prev1YM = formatYM(prev1Y, prev1M);

  // Prev month 2
  let prev2M = prev1M - 1;
  let prev2Y = prev1Y;
  if (prev2M < 1) {
    prev2M = 12;
    prev2Y -= 1;
  }
  const prev2YM = formatYM(prev2Y, prev2M);

  return { currentYM, prev1YM, prev2YM };
}

export function buildDemoFinancialData(customMonth?: string): DemoDataset {
  const { currentYM, prev1YM, prev2YM } = getSampleMonthStrings();
  const targetMonth = customMonth || currentYM;

  const padDay = (day: number) => String(day).padStart(2, "0");

  const incomes: Array<Omit<IncomeEntry, "id" | "createdAt">> = [
    // Current Month Incomes
    {
      source: "Salary",
      amount: 85000,
      category: "Primary Income",
      date: `${targetMonth}-01`,
      notes: "Monthly tech company direct payroll deposit",
      isRecurring: true,
    },
    {
      source: "Freelance",
      amount: 24500,
      category: "Design & Dev",
      date: `${targetMonth}-10`,
      notes: "Fintech mobile UI dashboard design retainer",
      isRecurring: false,
    },
    {
      source: "Investments",
      amount: 4200,
      category: "Dividends",
      date: `${targetMonth}-15`,
      notes: "Nifty 50 Index & bluechip quarterly dividends",
      isRecurring: false,
    },
    {
      source: "Rental",
      amount: 12000,
      category: "Real Estate",
      date: `${targetMonth}-05`,
      notes: "Rental income from 1BHK apartment unit",
      isRecurring: true,
    },

    // Previous Month 1 Incomes (for Reports Historical Analysis)
    {
      source: "Salary",
      amount: 85000,
      category: "Primary Income",
      date: `${prev1YM}-01`,
      notes: "Monthly payroll",
      isRecurring: true,
    },
    {
      source: "Freelance",
      amount: 18000,
      category: "Design & Dev",
      date: `${prev1YM}-12`,
      notes: "Brand design & icon set contract",
      isRecurring: false,
    },
    {
      source: "Rental",
      amount: 12000,
      category: "Real Estate",
      date: `${prev1YM}-05`,
      notes: "Rental income",
      isRecurring: true,
    },

    // Previous Month 2 Incomes
    {
      source: "Salary",
      amount: 85000,
      category: "Primary Income",
      date: `${prev2YM}-01`,
      notes: "Monthly payroll",
      isRecurring: true,
    },
    {
      source: "Rental",
      amount: 12000,
      category: "Real Estate",
      date: `${prev2YM}-05`,
      notes: "Rental income",
      isRecurring: true,
    },
  ];

  const expenses: Array<Omit<ExpenseEntry, "id" | "createdAt">> = [
    // Current Month Expenses
    {
      category: "Housing & Rent",
      amount: 22000,
      paymentMethod: "Bank Transfer",
      date: `${targetMonth}-02`,
      notes: "Monthly residential apartment rent & society maintenance",
      tag: "Fixed Living",
      isRecurring: true,
    },
    {
      category: "Groceries & Food",
      amount: 3450,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-03`,
      notes: "Monthly staples, grains, olive oil & pantry bulk restock",
      tag: "Essentials",
      isRecurring: false,
    },
    {
      category: "Groceries & Food",
      amount: 2150,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-09`,
      notes: "Organic fresh vegetables, fruits, Greek yogurt & greens",
      tag: "Essentials",
      isRecurring: false,
    },
    {
      category: "Groceries & Food",
      amount: 1850,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-16`,
      notes: "Artisanal cheeses, fresh sourdough & gourmet pantry ingredients",
      tag: "Essentials",
      isRecurring: false,
    },
    {
      category: "Dining Out",
      amount: 1450,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-06`,
      notes: "Dinner at Coastal Curry Bistro with colleagues",
      tag: "Social",
      isRecurring: false,
    },
    {
      category: "Dining Out",
      amount: 850,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-12`,
      notes: "Weekend cafe pour-over coffee & cinnamon brioche",
      tag: "Lifestyle",
      isRecurring: false,
    },
    {
      category: "Dining Out",
      amount: 680,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-18`,
      notes: "Weekday sushi delivery via Swiggy",
      tag: "Convenience",
      isRecurring: false,
    },
    {
      category: "Utilities & Bills",
      amount: 2800,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-04`,
      notes: "Electricity utility bill & water municipal charges",
      tag: "Bills",
      isRecurring: true,
    },
    {
      category: "Utilities & Bills",
      amount: 1299,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-08`,
      notes: "High-speed 300 Mbps Fiber broadband & WiFi router",
      tag: "Bills",
      isRecurring: true,
    },
    {
      category: "Transportation",
      amount: 1800,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-07`,
      notes: "Monthly Metro smart card recharge & Uber cab commutes",
      tag: "Commute",
      isRecurring: true,
    },
    {
      category: "Transportation",
      amount: 1200,
      paymentMethod: "Debit Card",
      date: `${targetMonth}-14`,
      notes: "Vehicle fuel refill & airport expressway toll FASTag",
      tag: "Commute",
      isRecurring: false,
    },
    {
      category: "Shopping & Apparel",
      amount: 3850,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-11`,
      notes: "Breathable linen shirt & formal work trousers",
      tag: "Wardrobe",
      isRecurring: false,
    },
    {
      category: "Subscriptions",
      amount: 1199,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-05`,
      notes: "Netflix Premium 4K + Spotify Family + iCloud storage bundle",
      tag: "Entertainment",
      isRecurring: true,
    },
    {
      category: "Subscriptions",
      amount: 1500,
      paymentMethod: "Bank Transfer",
      date: `${targetMonth}-03`,
      notes: "Cult.fit Elite Gym & Yoga monthly access membership",
      tag: "Fitness",
      isRecurring: true,
    },
    {
      category: "Healthcare & Medical",
      amount: 1250,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-13`,
      notes: "Monthly multivitamins, Omega-3 supplements & first aid",
      tag: "Health",
      isRecurring: false,
    },
    {
      category: "Personal Care",
      amount: 950,
      paymentMethod: "Digital Wallet / UPI",
      date: `${targetMonth}-15`,
      notes: "Haircut, styling & organic beard grooming oil",
      tag: "Grooming",
      isRecurring: false,
    },
    {
      category: "Entertainment & Leisure",
      amount: 1100,
      paymentMethod: "Credit Card",
      date: `${targetMonth}-17`,
      notes: "IMAX weekend cinema movie tickets with popcorn",
      tag: "Leisure",
      isRecurring: false,
    },

    // Previous Month 1 Expenses (for multi-month comparison)
    {
      category: "Housing & Rent",
      amount: 22000,
      paymentMethod: "Bank Transfer",
      date: `${prev1YM}-02`,
      notes: "Apartment Rent",
      isRecurring: true,
    },
    {
      category: "Groceries & Food",
      amount: 7200,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev1YM}-08`,
      notes: "Total monthly groceries & organic produce",
      isRecurring: false,
    },
    {
      category: "Dining Out",
      amount: 3100,
      paymentMethod: "Credit Card",
      date: `${prev1YM}-15`,
      notes: "Dining out & weekend cafes",
      isRecurring: false,
    },
    {
      category: "Utilities & Bills",
      amount: 3950,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev1YM}-05`,
      notes: "Electricity, Water & Fiber WiFi",
      isRecurring: true,
    },
    {
      category: "Transportation",
      amount: 2800,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev1YM}-10`,
      notes: "Metro card & fuel",
      isRecurring: true,
    },
    {
      category: "Shopping & Apparel",
      amount: 4500,
      paymentMethod: "Credit Card",
      date: `${prev1YM}-20`,
      notes: "Footwear & accessories",
      isRecurring: false,
    },
    {
      category: "Subscriptions",
      amount: 2699,
      paymentMethod: "Credit Card",
      date: `${prev1YM}-04`,
      notes: "Gym + Streaming",
      isRecurring: true,
    },

    // Previous Month 2 Expenses
    {
      category: "Housing & Rent",
      amount: 22000,
      paymentMethod: "Bank Transfer",
      date: `${prev2YM}-02`,
      notes: "Apartment Rent",
      isRecurring: true,
    },
    {
      category: "Groceries & Food",
      amount: 6850,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev2YM}-07`,
      notes: "Monthly groceries",
      isRecurring: false,
    },
    {
      category: "Dining Out",
      amount: 2800,
      paymentMethod: "Credit Card",
      date: `${prev2YM}-14`,
      notes: "Dining & coffee",
      isRecurring: false,
    },
    {
      category: "Utilities & Bills",
      amount: 3800,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev2YM}-06`,
      notes: "Utilities",
      isRecurring: true,
    },
    {
      category: "Transportation",
      amount: 2500,
      paymentMethod: "Digital Wallet / UPI",
      date: `${prev2YM}-11`,
      notes: "Commute",
      isRecurring: true,
    },
  ];

  const budgets: Array<Omit<BudgetEntry, "id" | "createdAt">> = [
    {
      category: "Housing & Rent",
      limit: 25000,
      monthYear: targetMonth,
    },
    {
      category: "Groceries & Food",
      limit: 9000,
      monthYear: targetMonth,
    },
    {
      category: "Dining Out",
      limit: 4000,
      monthYear: targetMonth,
    },
    {
      category: "Utilities & Bills",
      limit: 4500,
      monthYear: targetMonth,
    },
    {
      category: "Transportation",
      limit: 3500,
      monthYear: targetMonth,
    },
    {
      category: "Shopping & Apparel",
      limit: 5000,
      monthYear: targetMonth,
    },
    {
      category: "Subscriptions",
      limit: 3000,
      monthYear: targetMonth,
    },
    {
      category: "Entertainment & Leisure",
      limit: 2500,
      monthYear: targetMonth,
    },
  ];

  const chatSession = {
    title: "Monthly Cashflow & Budget Strategy",
    messages: [
      {
        role: "user" as const,
        content: "Hi Aura! Can you analyze my current spending distribution and tell me if I'm on track with my monthly savings goal?",
        timestamp: `${targetMonth}-10T10:15:00.000Z`,
      },
      {
        role: "assistant" as const,
        content: `Hello! I've conducted a comprehensive audit of your **${targetMonth}** financial records. Here is the calm clarity breakdown:

### 🌟 Financial Aura Overview
- **Total Inflow:** **₹1,25,700** across Salary (₹85,000), Freelance (₹24,500), Dividends (₹4,200), and Rental (₹12,000).
- **Total Outflow:** **₹43,478** across 17 recorded transactions.
- **Net Surplus:** **+₹82,222** (Healthy **65.4%** savings rate).

### 🎯 Key Observations:
1. **Housing & Rent (₹22,000):** Consuming **17.5%** of your income, comfortably within the recommended 30% threshold.
2. **Groceries & Food (₹7,450 / ₹9,000 budget):** You have utilized **82.8%** of your grocery limit with **₹1,550** remaining buffer.
3. **Dining Out (₹2,980 / ₹4,000 budget):** You are at **74.5%** of budget. With 2 weeks left, pacing dinner outings to once a week will ensure you stay green.

Keep maintaining this positive trajectory! Let me know if you'd like an allocation plan for your surplus into SIPs or contingency emergency funds.`,
        timestamp: `${targetMonth}-10T10:15:05.000Z`,
        modelUsed: "gemini-3.6-flash",
      }
    ]
  };

  return { incomes, expenses, budgets, chatSession };
}

/**
 * Seeds the active user's Firestore collections with authentic demo records.
 */
export async function seedUserFirestoreWithDemoData(
  userId: string, 
  customMonth?: string
): Promise<{
  incomesCount: number;
  expensesCount: number;
  budgetsCount: number;
  sessionCreated: boolean;
}> {
  const dataset = buildDemoFinancialData(customMonth);
  const now = new Date().toISOString();

  // 1. Seed Income entries
  const incomeColl = collection(db, "users", userId, "income");
  for (const inc of dataset.incomes) {
    await addDoc(incomeColl, cleanPayload({
      ...inc,
      createdAt: now,
    }));
  }

  // 2. Seed Expense entries
  const expenseColl = collection(db, "users", userId, "expenses");
  for (const exp of dataset.expenses) {
    await addDoc(expenseColl, cleanPayload({
      ...exp,
      createdAt: now,
    }));
  }

  // 3. Seed Budgets
  const budgetColl = collection(db, "users", userId, "budgets");
  for (const bud of dataset.budgets) {
    await addDoc(budgetColl, cleanPayload({
      ...bud,
      createdAt: now,
    }));
  }

  // 4. Seed sample AI Consultation session
  try {
    const chatColl = collection(db, "users", userId, "chat_sessions");
    const sessionDoc = await addDoc(chatColl, cleanPayload({
      title: dataset.chatSession.title,
      createdAt: now,
      updatedAt: now,
      lastMessageSnippet: dataset.chatSession.messages[dataset.chatSession.messages.length - 1]?.content.substring(0, 80) + "..."
    }));

    const messagesColl = collection(db, "users", userId, "chat_sessions", sessionDoc.id, "messages");
    for (const msg of dataset.chatSession.messages) {
      await addDoc(messagesColl, cleanPayload(msg));
    }
  } catch (err) {
    console.error("Non-fatal: could not seed sample chat session:", err);
  }

  return {
    incomesCount: dataset.incomes.length,
    expensesCount: dataset.expenses.length,
    budgetsCount: dataset.budgets.length,
    sessionCreated: true,
  };
}

/**
 * Deletes all user's transactions and budgets from Firestore to reset clean.
 */
export async function clearUserFirestoreData(userId: string): Promise<void> {
  const colls = ["income", "expenses", "budgets"];
  for (const c of colls) {
    const collRef = collection(db, "users", userId, c);
    const snap = await getDocs(collRef);
    const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, "users", userId, c, d.id)));
    await Promise.all(deletePromises);
  }
}
