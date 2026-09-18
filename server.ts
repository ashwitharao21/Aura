import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Top-Level Request Deserialization Guarantee: Mount body parsers FIRST
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fail until configured.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash"
];

// Reusable generation helper with fallback ladder and recoverable error handling
async function generateWithFallback(systemInstruction: string, prompt: string, historyMessages: Array<{ role: string; content: string }> = []) {
  const ai = getAIClient();
  let lastError: Error | null = null;

  // Format contents array for multi-turn if provided
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  
  if (historyMessages && historyMessages.length > 0) {
    for (const msg of historyMessages) {
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }
  }

  // Append latest user prompt
  contents.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1500,
        },
      });

      if (response && response.text) {
        return {
          text: response.text,
          modelUsed: model,
        };
      }
    } catch (err: any) {
      console.warn(`Attempt with model ${model} failed:`, err?.message || err);
      lastError = err;
      // Continue to next fallback model in the ladder
    }
  }

  throw lastError || new Error("Failed to generate content across all fallback models in the ladder.");
}

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Financial Advisor Endpoint (Multi-turn Contextual Conversation)
app.post("/api/ai/advisor", async (req, res) => {
  try {
    // Defensive payload ingestion with null-safe destructuring
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];
    const context = (body.context && typeof body.context === "object") ? body.context : {};

    if (!message) {
      return res.status(400).json({ error: "Missing required 'message' in request body." });
    }

    const {
      month = new Date().toISOString().substring(0, 7),
      currency = "INR",
      totalIncome = 0,
      totalExpenses = 0,
      netSavings = 0,
      savingsRate = "0%",
      categories = [],
      budgets = [],
      recentTransactions = [],
    } = context;

    const formattedCategories = categories.map((c: any) => `- ${c.name}: ₹${Number(c.total || 0).toFixed(2)} (${c.percentage || 0}%)`).join("\n") || "No expense records yet.";
    const formattedBudgets = budgets.map((b: any) => `- ${b.category}: Limit ₹${Number(b.limit || 0).toFixed(2)}, Spent: ₹${Number(b.spent || 0).toFixed(2)} (${b.percentage || 0}%), Remaining: ₹${Number(b.remaining || 0).toFixed(2)} [${b.status}]`).join("\n") || "No budgets set yet.";
    const formattedRecentTx = recentTransactions.slice(0, 15).map((t: any) => `[${t.type.toUpperCase()}] ${t.date} | ${t.category || t.source}: ₹${Number(t.amount || 0).toFixed(2)} (${t.paymentMethod || 'Direct'})${t.notes ? ` - ${t.notes}` : ''}`).join("\n") || "No recent transactions.";

    const systemInstruction = `You are "Aura", an expert, empathetic, and highly analytical certified Personal Financial Advisor and Expense Strategist.
You have real-time access to the user's authentic financial records for the current period (${month}) in currency Indian Rupee (₹, INR). Always use ₹ (Indian Rupee) for all amounts and currency references.

=== USER'S LIVE FINANCIAL CONTEXT ===
- Month: ${month}
- Currency: ₹ (INR)
- Total Income: ₹${Number(totalIncome).toFixed(2)}
- Total Expenses: ₹${Number(totalExpenses).toFixed(2)}
- Net Savings: ₹${Number(netSavings).toFixed(2)}
- Savings Rate: ${savingsRate}

Category Breakdown:
${formattedCategories}

Budget Adherence & Limits:
${formattedBudgets}

Recent Transactions (Latest 15):
${formattedRecentTx}
======================================

ADVISORY RULES & GUIDELINES:
1. Ground every answer in the actual numbers provided above. Calculate exact remaining budgets, category percentages, and overspending areas when asked. Always display monetary values in Indian Rupees (₹).
2. If the user asks about a specific category (e.g. Dining Out, Groceries), quote the exact spent amount, budget limit, and whether they are on track.
3. Be encouraging yet clear about financial discipline. Suggest 2-3 specific, realistic cost-saving or re-allocation tips when overspending is detected.
4. Format responses cleanly with markdown: use bolding for amounts (e.g., **₹1,500**), bullet points for recommendations, and concise paragraphs.
5. If the user asks a forward-looking question (e.g. "Can I afford X?"), calculate the remaining net buffer after all expenses and budgets, and provide an objective recommendation.
6. Keep answers structured, conversational, and direct. Avoid generic filler.`;

    const result = await generateWithFallback(systemInstruction, message, history);

    return res.json({
      reply: result.text,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while generating financial advice.",
    });
  }
});

// Quick Financial Audit / Insight Generator Endpoint
app.post("/api/ai/audit", async (req, res) => {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const context = (body.context && typeof body.context === "object") ? body.context : {};

    const {
      month = new Date().toISOString().substring(0, 7),
      totalIncome = 0,
      totalExpenses = 0,
      netSavings = 0,
      savingsRate = "0%",
      categories = [],
      budgets = [],
    } = context;

    const systemInstruction = `You are a financial diagnostic analyst. Output a concise JSON assessment of the user's financial health based strictly on the provided data.
You must respond with valid JSON ONLY matching this format:
{
  "healthScore": 85,
  "status": "Healthy" | "Attention Needed" | "Critical",
  "headline": "Brief 1-sentence executive summary",
  "keyHighlights": ["Point 1", "Point 2", "Point 3"],
  "topRiskCategory": "Category Name or None",
  "actionableTip": "One high-impact recommendation"
}`;

    const prompt = `Analyze this financial status for ${month}:
- Total Income: ₹${Number(totalIncome).toFixed(2)}
- Total Expenses: ₹${Number(totalExpenses).toFixed(2)}
- Net Savings: ₹${Number(netSavings).toFixed(2)} (Savings Rate: ${savingsRate})
- Category Expenses: ${JSON.stringify(categories)}
- Budgets: ${JSON.stringify(budgets)}

Provide the JSON diagnostic report.`;

    const result = await generateWithFallback(systemInstruction, prompt);
    let parsedData = null;
    try {
      const cleanJson = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      parsedData = {
        healthScore: netSavings >= 0 ? 80 : 45,
        status: netSavings >= 0 ? "Healthy" : "Attention Needed",
        headline: netSavings >= 0 ? "You are maintaining positive cash flow this month." : "Expenses currently exceed recorded income.",
        keyHighlights: [
          `Total income: ₹${Number(totalIncome).toFixed(2)} vs expenses ₹${Number(totalExpenses).toFixed(2)}`,
          `Savings rate is ${savingsRate}`,
        ],
        topRiskCategory: categories[0]?.name || "None",
        actionableTip: "Monitor non-essential categories to increase your monthly savings buffer.",
      };
    }

    return res.json({
      audit: parsedData,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("AI Audit error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate financial audit.",
    });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FinanceTracker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
