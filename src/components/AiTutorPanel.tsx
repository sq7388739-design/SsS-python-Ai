import React, { useState, useRef, useEffect } from "react";
import { Sparkles, HelpCircle, BookOpen, AlertCircle, Send, Check, Copy, Flame, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiTutorPanelProps {
  code: string;
  lastExecutionError: string | null;
  language: "en" | "ar";
  onApplyCode: (newCode: string) => void;
}

export default function AiTutorPanel({
  code,
  lastExecutionError,
  language,
  onApplyCode,
}: AiTutorPanelProps) {
  const isAr = language === "ar";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: isAr
        ? "أهلاً بك! أنا مساعد الذكاء الاصطناعي الذكي لتعلم لغة بايثون. أستطيع شرح الأكواد البرمجية، وتحليل مسببات الأخطاء وإرشادك لكتابة برامج بايثون احترافية. اسألني أي سؤال!"
        : "Hello! I am your AI Python programming tutor. I can explain code logic, troubleshoot traceback execution bugs, or generate custom algorithms for you. Ask me anything!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to message bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // General Call to backend Express Gemini API
  const callGeminiApi = async (type: string, additionalParams: any = {}) => {
    setIsGenerating(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          code,
          lang: language,
          ...additionalParams,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve AI advice from backend.");
      }

      return data.response;
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Could not connect to AI services. Set up your Gemini Secrets key.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMsg = inputValue.trim();
    setInputValue("");

    // Setup chat update
    const updatedHistory = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(updatedHistory);

    const reply = await callGeminiApi("chat", {
      message: userMsg,
      history: updatedHistory.slice(-6), // Send last few messages for flow context
    });

    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }
  };

  const handleExplainCode = async () => {
    if (isGenerating) return;
    
    // Add temporary message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: isAr ? "اشرح لي الكود المكتوب حالياً" : "Explain my current Python code" },
    ]);

    const reply = await callGeminiApi("explain");
    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }
  };

  const handleDebugError = async () => {
    if (isGenerating || !lastExecutionError) return;

    setMessages((prev) => [
      ...prev,
      { 
        role: "user", 
        content: isAr 
          ? `ساعدني في حل هذا الخطأ الإجرائي:\n${lastExecutionError}` 
          : `Help me troubleshoot this traceback crash:\n${lastExecutionError}` 
      },
    ]);

    const reply = await callGeminiApi("debug", { error: lastExecutionError });
    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to extract python code blocks from AI's markdown response to let users import them instantly
  const renderMessageContent = (text: string, msgIdx: number) => {
    // Basic Markdown format parser to divide text from code blocks nicely
    const parts = text.split(/(```python|```py|```[\s\S]*?```)/g);
    let isInsideCode = false;

    return (
      <div className="space-y-2 mt-1 select-text">
        {parts.map((part, partIdx) => {
          if (part.startsWith("```")) {
            isInsideCode = !isInsideCode;
            
            // Extract code and language tag
            const content = part
              .replace(/```python\n|```py\n|```/g, "")
              .replace(/\n```$/, "")
              .trim();
            
            if (content) {
              const codeBlockId = `${msgIdx}-${partIdx}`;
              return (
                <div key={codeBlockId} className="my-2.5 rounded-lg border border-[#1b2f22] bg-[#050806] overflow-hidden text-left" dir="ltr">
                  <div className="bg-[#090f0c] px-3 py-1.5 border-b border-[#1b2f22] flex items-center justify-between text-xs text-gray-500 font-mono select-none">
                    <span>python</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(content, codeBlockId)}
                        className="hover:text-[#30f28a] flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedIndex === codeBlockId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === codeBlockId ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ" : "Copy")}</span>
                      </button>
                      <button
                        onClick={() => onApplyCode(content)}
                        className="hover:text-[#ffd43b] flex items-center space-x-1 border-l border-[#1c2e24] pl-2 cursor-pointer"
                        title={isAr ? "استيراد هذا الكود للمحرر بالكامل" : "Apply code directly to active editor"}
                      >
                        <Flame className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{isAr ? "استيراد" : "Insert"}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 text-[12px] font-mono leading-relaxed overflow-x-auto text-emerald-300">
                    <code>{content}</code>
                  </pre>
                </div>
              );
            }
            return null;
          }

          // Render normal paragraphs and list items simply
          const lines = part.split("\n");
          return (
            <div key={`part-${partIdx}`} className="text-gray-300 text-sm leading-relaxed space-y-1">
              {lines.map((line, lineIdx) => {
                if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                  return (
                    <li key={lineIdx} className="list-disc pl-4 pr-1 ml-2 text-emerald-100/90">
                      {line.replace(/^[\s*-]+/, "").trim()}
                    </li>
                  );
                }
                if (line.trim().startsWith("# ") || line.trim().startsWith("## ")) {
                  return (
                    <h4 key={lineIdx} className="text-sm font-bold text-[#30f28a] mt-2 border-b border-[#133020] pb-1 font-display">
                      {line.replace(/^#+\s+/, "").trim()}
                    </h4>
                  );
                }
                return line.trim() ? <p key={lineIdx} className="my-1.5">{line}</p> : null;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f0d] border border-[#1b2f22] rounded-xl overflow-hidden shadow-xl" dir={isAr ? "rtl" : "ltr"}>
      {/* Header bar area */}
      <div className="bg-[#121c16] px-4 py-3 border-b border-[#1c2e24] flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-[#133020] p-1.5 rounded-lg border border-[#30f28a]/30">
            <Sparkles className="w-4 h-4 text-[#30f28a] animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-[#30f28a] text-[14px] font-display flex items-center gap-1">
              {isAr ? "المُعلم الذكي بايثون" : "AI Python Mentor"}
            </h3>
            <p className="text-[11px] text-gray-500">
              {isAr ? "مدعوم بنموذج الذكاء الاصطناعي الفائق" : "Powered by Gemini AI Engine"}
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setMessages([
              {
                role: "assistant",
                content: isAr
                  ? "تمت إعادة تشغيل الجلسة التعليمية بنجاح! اسألني ومستعد للإجابة الفورية لك."
                  : "Python Tutor Session restarted successfully! How can I assist you now?",
              },
            ]);
          }}
          className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#1c2e24] transition-colors"
          title={isAr ? "مسح الجلسة" : "Restart Chat"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI Quick helper actions */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#0a110e]/60 border-b border-[#1c2e24]/70 select-none text-[12px]">
        <button
          onClick={handleExplainCode}
          disabled={isGenerating || !code.trim()}
          className="flex items-center justify-center space-x-1.5 space-x-reverse px-2 py-1.5 bg-[#121f18] hover:bg-[#1a3024] text-emerald-300 hover:text-white rounded-lg border border-[#1c3224] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#30f28a]" />
          <span>{isAr ? "شرح الكود الحالي" : "Explain Code"}</span>
        </button>

        <button
          onClick={handleDebugError}
          disabled={isGenerating || !lastExecutionError}
          className={`flex items-center justify-center space-x-1.5 space-x-reverse px-2 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            lastExecutionError 
              ? "bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/40 hover:text-white animate-pulse" 
              : "bg-[#121f18] border-[#1c3224] text-gray-500"
          }`}
        >
          <AlertCircle className={`w-3.5 h-3.5 ${lastExecutionError ? "text-red-400" : "text-gray-500"}`} />
          <span>{isAr ? "تحليل وحل الخطأ" : "Debug Error"}</span>
        </button>
      </div>

      {/* Messages dialogue output */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0f0d]">
        {messages.map((msg, idx) => (
          <div
            key={`msg-${idx}`}
            className={`flex flex-col max-w-[85%] ${
              msg.role === "user" 
                ? "mr-auto ml-0 text-left bg-[#131f18] border border-[#1b2c21] rounded-l-2xl rounded-tr-2xl p-3" 
                : "ml-auto mr-0 text-right bg-[#0f1512] border border-[#15241b] rounded-r-2xl rounded-tl-2xl p-3.5"
            }`}
          >
            <div className="flex items-center space-x-1.5 space-x-reverse mb-1 text-[11px] font-semibold text-gray-400">
              {msg.role === "user" ? (
                <span className="text-emerald-400">{isAr ? "أنت" : "You"}</span>
              ) : (
                <span className="text-[#30f28a] flex items-center gap-1 font-display">
                  <Sparkles className="w-3 h-3" />
                  {isAr ? "المعلم بايثون" : "Python Tutor"}
                </span>
              )}
            </div>
            
            {renderMessageContent(msg.content, idx)}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center space-x-2 bg-[#0f1512] border border-[#1c2e24] text-gray-400 p-3.5 rounded-r-2xl rounded-tl-2xl max-w-[70%] ml-auto select-none spin-loader">
            <span className="flex space-x-1 space-x-reverse items-center py-1">
              <span className="w-2 h-2 bg-[#30f28a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#30f28a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#30f28a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="text-xs text-gray-500 mr-2">
              {isAr ? "جاري التفكير والتوليد برمجياً..." : "Tutor is drafting analysis..."}
            </span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-red-950/20 text-red-400 text-xs rounded-lg border border-red-900/50 flex flex-col gap-2 leading-relaxed">
            <span className="font-bold">{isAr ? "تحذير الاتصال:" : "Connection Alert:"}</span>
            <span>{errorStatus}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input messaging bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#121c16] border-t border-[#1c2e24] flex items-center space-x-2 space-x-reverse">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isAr 
              ? "اسأل عن أي خوارزمية، دالة أو موضوع في بايثون..." 
              : "Ask about list slicing, classes, sets, map functions..."
          }
          className="flex-1 bg-[#0a0f0d] border border-[#1d3024] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#30f28a] transition-all font-sans"
          disabled={isGenerating}
        />
        <button
          type="submit"
          disabled={isGenerating || !inputValue.trim()}
          className="bg-[#133020] hover:bg-[#1a442d] text-[#30f28a] border border-[#30f28a]/40 p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
