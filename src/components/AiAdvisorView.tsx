import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { 
  ChatMessage, 
  ChatSession, 
  FinancialContextSnapshot 
} from "../types";

interface AiAdvisorViewProps {
  userId: string;
  financialContext: FinancialContextSnapshot;
  chatSessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => Promise<string>;
  onSendMessage: (text: string) => Promise<void>;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  userId,
  financialContext,
  chatSessions,
  activeSessionId,
  messages,
  isLoadingMessages,
  onSelectSession,
  onCreateSession,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Suggested prompt pills
  const suggestedPrompts = [
    "How much did I spend on dining out and food this month?",
    "What's my remaining budget for utilities & groceries?",
    "Analyze my spending habits and suggest 3 high-impact cost cuts.",
    "Can I afford a ₹4,000 expense this month without breaking my budget?",
  ];

  const handleSend = async (promptToSend?: string) => {
    const text = (promptToSend || inputText).trim();
    if (!text || isGenerating) return;

    setErrorBanner(null);
    setInputText("");
    setIsGenerating(true);

    try {
      await onSendMessage(text);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setErrorBanner(err?.message || "Failed to generate response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row gap-4 animate-fade-in text-slate-900">
      {/* Left Sidebar: Past Consultation Sessions & Financial Context Summary */}
      <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
        {/* New Session Button */}
        <button
          id="new-chat-session-btn"
          onClick={onCreateSession}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-[#4AA89E]/40"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>New AI Consultation Session</span>
        </button>

        {/* Live Context Snapshot Widget */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-[#358E85]">
              <Zap className="w-3.5 h-3.5 text-[#4AA89E]" />
              Live Context Fed to Gemini
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{financialContext.month}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-2xl bg-[#FBF7F0] border border-[#7ED4C9]/30">
              <p className="text-slate-500">Income</p>
              <p className="font-extrabold text-[#358E85]">₹{financialContext.totalIncome.toFixed(0)}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FBF7F0] border border-[#FFB7A5]/35">
              <p className="text-slate-500">Expenses</p>
              <p className="font-extrabold text-[#E07A5F]">₹{financialContext.totalExpenses.toFixed(0)}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FBF7F0] border border-[#7ED4C9]/30">
              <p className="text-slate-500">Net Buffer</p>
              <p className={`font-extrabold ${financialContext.netSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                ₹{financialContext.netSavings.toFixed(0)}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FBF7F0] border border-[#C6B9E0]/35">
              <p className="text-slate-500">Budgets Active</p>
              <p className="font-extrabold text-[#6B5A96]">{financialContext.budgets.length} Targets</p>
            </div>
          </div>
        </div>

        {/* Past Sessions List */}
        <div className="flex-1 bg-white border border-[#7ED4C9]/35 rounded-3xl p-4 shadow-xs overflow-y-auto flex flex-col space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E7BB5]" />
            Consultation History
          </span>

          {chatSessions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No saved chat sessions.
            </div>
          ) : (
            chatSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-2.5 rounded-2xl text-xs font-medium transition-all flex items-start gap-2.5 cursor-pointer ${
                  activeSessionId === session.id
                    ? "bg-[#7ED4C9]/20 text-slate-900 border border-[#7ED4C9]/60 shadow-xs"
                    : "text-slate-600 hover:bg-[#FBF7F0] hover:text-slate-900 border border-transparent"
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeSessionId === session.id ? "text-[#358E85]" : "text-slate-400"}`} />
                <div className="truncate flex-1">
                  <p className="font-bold text-slate-800 truncate">{session.title}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{session.lastMessageSnippet || "Active session"}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Main Pane */}
      <div className="flex-1 bg-white border border-[#7ED4C9]/35 rounded-3xl shadow-xs flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-[#7ED4C9]/20 flex items-center justify-between bg-[#FBF7F0]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7ED4C9] to-[#4AA89E] text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">Aura AI Advisor</h3>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#7ED4C9]/30 text-[#358E85] border border-[#7ED4C9]/50">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Contextually grounded in your financial records</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#358E85]" />
            <span className="hidden sm:inline">Encrypted per User</span>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorBanner && (
            <div className="p-3 bg-[#FFB7A5]/20 border border-[#FFB7A5]/50 text-[#E07A5F] text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E07A5F] shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {messages.length === 0 && (
            <div className="py-10 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Welcome to Your AI Financial Advisor</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  I analyze your actual logged incomes (₹{financialContext.totalIncome.toFixed(0)}),
                  expenses (₹{financialContext.totalExpenses.toFixed(0)}), and category budgets to give you
                  precise, actionable financial strategies.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="pt-2 text-left space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Try asking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="p-3 text-left rounded-2xl bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 hover:border-[#4AA89E]/60 text-xs text-slate-700 transition-all active:scale-98 cursor-pointer"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? "bg-[#FBF7F0] text-[#358E85] border border-[#7ED4C9]/40"
                      : "bg-gradient-to-tr from-[#7ED4C9] to-[#4AA89E] text-slate-900 shadow-xs"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4 text-[#358E85]" /> : <Bot className="w-4 h-4 text-slate-900" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] text-slate-900 font-bold rounded-tr-none shadow-xs border border-[#4AA89E]/40"
                      : "bg-[#FBF7F0]/70 border border-[#7ED4C9]/30 text-slate-800 rounded-tl-none space-y-2 whitespace-pre-wrap font-medium"
                  }`}
                >
                  {msg.content}
                  <div className={`text-[10px] mt-1 text-right ${isUser ? "text-slate-700" : "text-slate-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#7ED4C9] to-[#4AA89E] text-slate-900 shrink-0 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-slate-900 animate-pulse" />
              </div>
              <div className="bg-[#FBF7F0]/70 border border-[#7ED4C9]/30 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2 h-2 rounded-full bg-[#4AA89E] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#7ED4C9] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#FF9A8B] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 font-medium">Analyzing your finances with Gemini 3.6 Flash...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#7ED4C9]/20 bg-[#FBF7F0]/40">
          <div className="flex items-end gap-2 bg-white border border-[#7ED4C9]/40 focus-within:border-[#4AA89E] focus-within:ring-1 focus-within:ring-[#4AA89E] rounded-2xl p-2 transition-all shadow-xs">
            <textarea
              id="ai-prompt-input"
              rows={2}
              placeholder="Ask anything about your expenses, budgets, or savings in rupees..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none resize-none px-2 py-1 leading-relaxed font-medium"
            />
            <button
              id="send-ai-prompt-btn"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isGenerating}
              className="p-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] disabled:opacity-40 text-slate-900 font-extrabold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 border border-[#4AA89E]/40"
              title="Send to Advisor"
            >
              <Send className="w-4 h-4 text-slate-900" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            All AI interactions are recorded and isolated in Firestore under your user identity.
          </p>
        </div>
      </div>
    </div>
  );
};
