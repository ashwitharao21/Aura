import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Plus, 
  MessageSquare, 
  RefreshCw, 
  ChevronDown,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { 
  ChatMessage, 
  ChatSession, 
  FinancialContextSnapshot 
} from "../types";

interface ChatFloatingWidgetProps {
  userId: string;
  financialContext: FinancialContextSnapshot;
  chatSessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => Promise<string>;
  onSendMessage: (text: string) => Promise<void>;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export const ChatFloatingWidget: React.FC<ChatFloatingWidgetProps> = ({
  userId,
  financialContext,
  chatSessions,
  activeSessionId,
  messages,
  isLoadingMessages,
  onSelectSession,
  onCreateSession,
  onSendMessage,
  isOpen,
  onToggle,
}) => {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isGenerating, isOpen]);

  // Suggested prompt pills
  const suggestedPrompts = [
    "Analyze my spending habits and suggest cost cuts",
    "What's my remaining budget for essentials?",
    "Can I afford a ₹3,500 purchase this month?",
    "How does my savings rate compare to the 20% goal?",
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
      setErrorBanner(err?.message || "Failed to generate AI response. Please try again.");
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

  const currentSession = chatSessions.find(s => s.id === activeSessionId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Floating Chat Window */}
      {isOpen && (
        <div 
          id="aura-chatbot-window"
          className={`pointer-events-auto bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out mb-4 ${
            isExpanded 
              ? "w-[92vw] sm:w-[640px] md:w-[720px] h-[85vh] max-h-[750px]" 
              : "w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh]"
          }`}
          style={{
            boxShadow: "0 20px 45px -10px rgba(74, 168, 158, 0.25), 0 0 25px 0 rgba(198, 185, 224, 0.35)",
          }}
        >
          {/* Header */}
          <div className="bg-white/95 border-b border-[#7ED4C9]/30 px-4 py-3.5 flex items-center justify-between backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Logo with Calm Clarity gradient */}
              <div className="w-8 h-8 rounded-xl bg-aura-gradient p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-[#4AA89E]">
                  <Sparkles className="w-4 h-4 fill-[#7ED4C9]/40 text-[#4AA89E]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Aura AI
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40">
                    Gemini 3.6
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ED4C9] animate-pulse" />
                  <span>See your money's energy</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Session Switcher Button */}
              <div className="relative">
                <button
                  id="chatbot-sessions-toggle-btn"
                  onClick={() => setShowSessionsDropdown(!showSessionsDropdown)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Consultation History"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu */}
                {showSessionsDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#7ED4C9]/30 rounded-2xl shadow-xl p-2 z-20 animate-fade-in text-xs">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 px-2 font-bold text-slate-700">
                      <span>Past Consultations</span>
                      <button
                        onClick={async () => {
                          setShowSessionsDropdown(false);
                          await onCreateSession();
                        }}
                        className="text-[10px] font-bold text-[#4AA89E] hover:text-[#358E85] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> New
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {chatSessions.length === 0 ? (
                        <div className="text-slate-400 text-center py-2 text-[11px]">
                          No previous sessions yet.
                        </div>
                      ) : (
                        chatSessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => {
                              onSelectSession(session.id);
                              setShowSessionsDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex flex-col gap-0.5 ${
                              session.id === activeSessionId
                                ? "bg-[#7ED4C9]/20 text-[#358E85] font-bold"
                                : "hover:bg-[#FBF7F0] text-slate-700"
                            }`}
                          >
                            <span className="truncate">{session.title || "Financial Consultation"}</span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expand / Minimize */}
              <button
                id="chatbot-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                id="chatbot-close-btn"
                onClick={() => onToggle(false)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini Financial Context Banner */}
          <div className="bg-[#7ED4C9]/10 border-b border-[#7ED4C9]/25 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
            <div className="flex items-center gap-3">
              <span>
                Earned: <strong className="text-[#358E85]">₹{financialContext.totalIncome.toFixed(0)}</strong>
              </span>
              <span>
                Spent: <strong className="text-[#E07A5F]">₹{financialContext.totalExpenses.toFixed(0)}</strong>
              </span>
              <span>
                Net: <strong className={financialContext.netSavings >= 0 ? "text-[#358E85]" : "text-rose-600"}>
                  {financialContext.netSavings >= 0 ? "+" : ""}₹{financialContext.netSavings.toFixed(0)}
                </strong>
              </span>
            </div>

            <button
              onClick={() => onCreateSession()}
              className="text-[10px] font-bold text-[#4AA89E] hover:text-[#358E85] flex items-center gap-0.5 cursor-pointer"
              title="Start a fresh chat topic"
            >
              <Plus className="w-3 h-3" /> New Topic
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* Welcoming Message if empty */}
            {messages.length === 0 && (
              <div className="text-center py-6 px-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-aura-gradient p-0.5 mx-auto shadow-md">
                  <div className="w-full h-full bg-[#FBF7F0] rounded-[14px] flex items-center justify-center text-[#4AA89E]">
                    <Bot className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Welcome to Aura Financial Advisory
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-1 max-w-xs mx-auto leading-relaxed">
                    I have full real-time awareness of your logged incomes, categorised expenses, and monthly budget limits. How can I guide you today?
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5 text-left pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1">
                    Suggested Quick Inquiries
                  </p>
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left p-2.5 rounded-xl bg-white border border-[#7ED4C9]/30 hover:border-[#7ED4C9] hover:bg-white text-slate-700 text-[11px] font-medium transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                    >
                      <span className="line-clamp-1">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-[#4AA89E] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-aura-gradient p-0.5 shrink-0 shadow-2xs mt-0.5">
                      <div className="w-full h-full bg-white rounded-[8px] flex items-center justify-center text-[#4AA89E]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl p-3 shadow-2xs leading-relaxed text-xs ${
                      isUser
                        ? "bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] text-slate-900 font-medium rounded-tr-xs"
                        : "bg-white border border-[#7ED4C9]/35 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal">
                      {msg.text}
                    </div>
                    <div
                      className={`text-[9px] mt-1.5 font-medium ${
                        isUser ? "text-slate-800/70 text-right" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing / Generating Indicator */}
            {isGenerating && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-aura-gradient p-0.5 shrink-0 shadow-2xs">
                  <div className="w-full h-full bg-white rounded-[8px] flex items-center justify-center text-[#4AA89E]">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                </div>
                <div className="bg-white border border-[#7ED4C9]/35 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ED4C9] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9E0] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB7A5] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Analyzing financial data...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorBanner && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
                <span>{errorBanner}</span>
                <button
                  onClick={() => setErrorBanner(null)}
                  className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/95 border-t border-[#7ED4C9]/30 p-3 shrink-0 backdrop-blur-md">
            <div className="relative flex items-center gap-2">
              <textarea
                id="chatbot-floating-input"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aura about budgets, savings, or spending..."
                disabled={isGenerating}
                className="w-full bg-[#FBF7F0] border border-[#7ED4C9]/40 focus:border-[#4AA89E] focus:ring-1 focus:ring-[#4AA89E] rounded-xl py-2.5 pl-3.5 pr-11 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none resize-none max-h-24 transition-all"
              />

              <button
                id="chatbot-floating-send-btn"
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#FF9A8B] hover:bg-[#F38573] active:scale-95 disabled:opacity-40 text-slate-900 font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5 text-slate-900" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 pt-1.5">
              <span>Press Enter to send</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-[#4AA89E]" />
                User-Isolated Firestore State
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Trigger Icon Button */}
      <button
        id="aura-chatbot-trigger-btn"
        onClick={() => onToggle(!isOpen)}
        className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full bg-aura-gradient shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer p-0.5"
        style={{
          boxShadow: "0 10px 25px -4px rgba(74, 168, 158, 0.4), 0 4px 12px 0 rgba(198, 185, 224, 0.4)",
        }}
        title="Open Aura AI Financial Chatbot"
        aria-label="Open Aura AI Financial Chatbot"
      >
        {/* Inner soothing core */}
        <div className="w-full h-full rounded-full bg-[#FBF7F0] flex items-center justify-center transition-colors group-hover:bg-white">
          {isOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#358E85]" />
              {/* Pulsing Sparkle badge */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9A8B] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9A8B]" />
              </span>
            </div>
          )}
        </div>

        {/* Hover Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-[#FBF7F0] text-xs font-bold whitespace-nowrap shadow-xl animate-fade-in pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#7ED4C9]" />
            <span>Chat with Aura Advisor</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900" />
          </div>
        )}
      </button>
    </div>
  );
};
