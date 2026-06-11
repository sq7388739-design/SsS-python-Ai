import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  HelpCircle, 
  BookOpen, 
  Settings, 
  Sparkles, 
  Flame, 
  Loader, 
  Languages, 
  FileCode, 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle as HintIcon, 
  FolderOpen,
  Save,
  Trash2,
  Database,
  Code
} from "lucide-react";
import { BuiltInTemplates, BuiltInChallenges, Challenge, TestResult } from "./types";
import ConsoleTerminal from "./components/ConsoleTerminal";
import AiTutorPanel from "./components/AiTutorPanel";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function App() {
  const [language, setLanguage] = useState<"en" | "ar">("ar");
  const [currentCode, setCurrentCode] = useState<string>("");
  const [stdoutLogs, setStdoutLogs] = useState<string[]>([]);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyodideStatus, setPyodideStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastExecutionError, setLastExecutionError] = useState<string | null>(null);

  // Variable Memory Inspectors
  const [visualArray, setVisualArray] = useState<any[] | null>(null);
  const [visualStack, setVisualStack] = useState<any[] | null>(null);
  const [visualQueue, setVisualQueue] = useState<any[] | null>(null);
  const [memoryInspectors, setMemoryInspectors] = useState<{ key: string; value: string }[]>([]);

  // Challenges State
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeTestResults, setChallengeTestResults] = useState<TestResult[]>([]);
  const [hintsUsed, setHintsUsed] = useState<{ [id: string]: string }>({});
  const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);

  // Line numbering sync
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState<number>(1);

  const isAr = language === "ar";

  // Initialize Pyodide 
  useEffect(() => {
    async function initPyodide() {
      try {
        if (typeof window.loadPyodide === "undefined") {
          throw new Error("Pyodide loading script missing from index.html header.");
        }
        
        // Setup initial Wasm parameters
        const py = await window.loadPyodide({
          stdout: (text: string) => {
            // Collected at execution runtime dynamically
          },
          stderr: (text: string) => {
            // Collected err runtime dynamically
          }
        });

        // Preload standard math, datetime, collections, random
        await py.loadPackage([]);
        setPyodide(py);
        setPyodideStatus("ready");

        // Load welcome code
        const welcomeTemplate = BuiltInTemplates.find(t => t.id === "welcome");
        if (welcomeTemplate) {
          setCurrentCode(welcomeTemplate.code);
        }
      } catch (err) {
        console.error("Pyodide error launch:", err);
        setPyodideStatus("error");
      }
    }
    initPyodide();
  }, []);

  // Update line numbering count whenever template / code changes
  useEffect(() => {
    const lines = currentCode.split("\n").length;
    setLineCount(lines || 1);
  }, [currentCode]);

  // Handle switching learning topics or challenges
  const handleSelectTemplate = (templateId: string) => {
    const template = BuiltInTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedChallengeId(null);
      setChallengeTestResults([]);
      setCurrentCode(template.code);
      // Reset variables visualizers
      setVisualArray(null);
      setVisualStack(null);
      setVisualQueue(null);
      setMemoryInspectors([]);
    }
  };

  const handleSelectChallenge = (challengeId: string) => {
    const challenge = BuiltInChallenges.find(c => c.id === challengeId);
    if (challenge) {
      setSelectedChallengeId(challengeId);
      setChallengeTestResults([]);
      // Check for saved local progress
      const saved = localStorage.getItem(`python_saved_challenge_${challengeId}`);
      setCurrentCode(saved || challenge.initialCode);
      // Reset variable visualizers
      setVisualArray(null);
      setVisualStack(null);
      setVisualQueue(null);
      setMemoryInspectors([]);
    }
  };

  const handleSaveProgress = () => {
    if (selectedChallengeId) {
      localStorage.setItem(`python_saved_challenge_${selectedChallengeId}`, currentCode);
    } else {
      localStorage.setItem(`python_saved_sandbox_sandbox`, currentCode);
    }
    alert(isAr ? "💾 تم حفظ الكود الحالي بنجاح في جهازك!" : "💾 Active code state cached successfully!");
  };

  const handleResetChallenge = () => {
    if (selectedChallengeId) {
      const challenge = BuiltInChallenges.find(c => c.id === selectedChallengeId);
      if (challenge) {
        setCurrentCode(challenge.initialCode);
        setChallengeTestResults([]);
        localStorage.removeItem(`python_saved_challenge_${selectedChallengeId}`);
      }
    } else {
      const welcomeTemplate = BuiltInTemplates.find(t => t.id === "welcome");
      if (welcomeTemplate) {
        setCurrentCode(welcomeTemplate.code);
      }
    }
  };

  // Run python script inside sandbox
  const runPythonCode = async () => {
    if (!pyodide || isRunning) return;
    setIsRunning(true);
    setStdoutLogs([]);
    setErrorLogs([]);
    setLastExecutionError(null);

    let outputBuffer: string[] = [];
    pyodide.setStdout({
      batched: (text: string) => {
        outputBuffer.push(text);
        setStdoutLogs(prev => [...prev, text]);
      }
    });

    pyodide.setStderr({
      batched: (text: string) => {
        setErrorLogs(prev => [...prev, text]);
        setLastExecutionError(text);
      }
    });

    try {
      let codeToRun = currentCode;
      const isChallengeActive = !!selectedChallengeId;
      const challengeObj = BuiltInChallenges.find(c => c.id === selectedChallengeId);

      if (isChallengeActive && challengeObj) {
        // Inject Assert test runner module alongside code
        codeToRun = `${currentCode}\n${challengeObj.testRunnerPython}`;
      }

      await pyodide.runPythonAsync(codeToRun);

      // Extract details about global RAM allocations dynamically to populate Visual Board
      try {
        const globals = pyodide.globals;
        
        // arrays
        if (globals.has("numbers")) {
          const numbersObj = globals.get("numbers");
          setVisualArray(numbersObj.toJs ? numbersObj.toJs() : numbersObj);
        } else if (globals.has("arr")) {
          const arrObj = globals.get("arr");
          setVisualArray(arrObj.toJs ? arrObj.toJs() : arrObj);
        } else {
          setVisualArray(null);
        }

        // stack list
        if (globals.has("stack")) {
          const stObj = globals.get("stack");
          setVisualStack(stObj.toJs ? stObj.toJs() : stObj);
        } else {
          setVisualStack(null);
        }

        // queue collections / lists
        if (globals.has("queue")) {
          try {
            const listConv = pyodide.runPython("list(queue)");
            setVisualQueue(listConv.toJs());
          } catch(e) {
            const qObj = globals.get("queue");
            setVisualQueue(qObj.toJs ? qObj.toJs() : qObj);
          }
        } else {
          setVisualQueue(null);
        }

        // Numeric float variables check
        const inspectors: { key: string; value: string }[] = [];
        ["radius", "area", "even_numbers", "today", "name", "speed"].forEach(key => {
          if (globals.has(key)) {
            try {
              const val = globals.get(key);
              inspectors.push({ key, value: String(val) });
            } catch(e) {}
          }
        });
        setMemoryInspectors(inspectors);

      } catch (inspectError) {
        console.warn("Global Memory inspection failed :", inspectError);
      }

      // Check assert configurations and outputs for Challenge grade
      if (isChallengeActive) {
        const fullOutput = outputBuffer.join("\n");
        if (fullOutput.includes("---TEST_RESULTS_START---")) {
          const startMarker = "---TEST_RESULTS_START---";
          const endMarker = "---TEST_RESULTS_END---";
          const jsonStr = fullOutput.substring(
            fullOutput.indexOf(startMarker) + startMarker.length,
            fullOutput.indexOf(endMarker)
          ).trim();
          
          try {
            const parsedTests = JSON.parse(jsonStr);
            setChallengeTestResults(parsedTests);
          } catch(err) {
            console.error("Test assert results parsing error:", err);
          }
        }
      }

    } catch (err: any) {
      console.error("Pyodide run execution failed:", err);
      setErrorLogs(prev => [...prev, err.message || String(err)]);
      setLastExecutionError(err.message || String(err));
    } finally {
      setIsRunning(false);
    }
  };

  // AI Hint generation endpoint caller
  const handleRequestHint = async () => {
    if (!selectedChallengeId || isGeneratingHint) return;
    const challenge = BuiltInChallenges.find(c => c.id === selectedChallengeId);
    if (!challenge) return;

    setIsGeneratingHint(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "suggest_challenge_hint",
          code: currentCode,
          challengeTitle: challenge.titleEn,
          challengeDescription: challenge.descriptionEn,
          lang: language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to contact Gemini engine.");
      }

      setHintsUsed(prev => ({
        ...prev,
        [selectedChallengeId]: data.response,
      }));
    } catch(err: any) {
      console.error(err);
      alert(isAr ? "فشل الاتصال لتوليد تلميح. يرجى تفعيل مفتاح Secrets لـ Gemini." : "Failed to fetch hint. Ensure GEMINI_API_KEY is configured.");
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const handleApplyImportedCode = (newCode: string) => {
    setCurrentCode(newCode);
  };

  return (
    <div className="min-h-screen bg-[#040806] text-gray-100 flex flex-col font-sans selection:bg-[#30f28a]/30 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Main Navigation Header */}
      <header className="bg-[#0a100d] border-b border-[#133020] px-4 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 space-x-reverse">
          {/* Logo Brand Icon */}
          <div className="bg-[#12261b] p-2 rounded-xl border border-[#30f28a]/40 shadow-inner flex items-center justify-center animate-pulse">
            <Code className="w-5 h-5 text-[#30f28a]" />
          </div>
          <div>
            <h1 className="font-bold text-gray-100 text-lg md:text-xl font-display tracking-tight flex items-center gap-2">
              <span>{isAr ? "تعلم بايثون بمساعده SsS-Ai" : "Learn Python with SsS-AI"}</span>
              <span className="text-[11px] font-mono bg-[#143d25] border border-[#30f28a]/30 px-2 py-0.5 rounded-full text-[#30f28a] uppercase tracking-widest hidden md:inline">WASM Engine</span>
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {isAr ? "اكتب، شغل برامج بايثون حقيقية بالكامل في متصفحك، وتعلم عبر المساعد الشخصي الذكي" : "Code, execute true Python inside a sandboxed WASM compiler, and interact with our AI Tutor."}
            </p>
          </div>
        </div>

        {/* Action controls header */}
        <div className="flex items-center space-x-3 space-x-reverse select-none">
          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(l => (l === "en" ? "ar" : "en"))}
            className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 bg-[#121c16] border border-[#1c2e24] hover:border-[#30f28a]/50 text-gray-300 hover:text-white rounded-lg transition-all text-xs cursor-pointer font-medium"
            title={isAr ? "Switch to English" : "تغيير للعربية"}
          >
            <Languages className="w-4 h-4 text-[#30f28a]" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body divided into Sidebars & Editors */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 p-4 max-w-full">
        {/* Left Side: Navigation pane for Topics / Challenges (Grid: 3 cols) */}
        <div className="xl:col-span-3 space-y-4 flex flex-col h-full select-none">
          {/* Topics selection card */}
          <div className="bg-[#0a0f0d] border border-[#1b2f22] rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display flex items-center space-x-1.5 space-x-reverse">
              <FolderOpen className="w-4 h-4 text-[#ffd43b]" />
              <span>{isAr ? "دروس ونماذج تطبيقية" : "Interactive Python Lessons"}</span>
            </h2>

            <div className="space-y-1.5 overflow-y-auto max-h-[180px] pr-1">
              {BuiltInTemplates.map(template => {
                const isActive = !selectedChallengeId && currentCode.includes(template.titleEn) || currentCode.includes(template.titleAr);
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex flex-col cursor-pointer ${
                      isActive 
                        ? "bg-[#133020] border-[#30f28a]/40 text-[#30f28a]" 
                        : "bg-[#111915]/50 border-[#1c2e24] hover:bg-[#121f18] text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span className="font-bold">{isAr ? template.titleAr : template.titleEn}</span>
                    <span className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                      {isAr ? template.descriptionAr : template.descriptionEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive challenges grader Selection card */}
          <div className="bg-[#0a0f0d] border border-[#1b2f22] rounded-2xl p-4 shadow-xl flex-1 flex flex-col space-y-3 min-h-[300px]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display flex items-center space-x-1.5 space-x-reverse">
              <Trophy className="w-4 h-4 text-[#ffd43b]" />
              <span>{isAr ? "التحديات البرمجية المباشرة" : "WASM Coding Challenges"}</span>
            </h2>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {BuiltInChallenges.map(challenge => {
                const isActive = selectedChallengeId === challenge.id;
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleSelectChallenge(challenge.id)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer ${
                      isActive 
                        ? "bg-[#133020] border-[#30f28a]/50 text-[#30f28a]" 
                        : "bg-[#111915]/50 border-[#1c2e24] hover:bg-[#121f18] text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">{isAr ? challenge.titleAr : challenge.titleEn}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        challenge.difficultyEn === "Easy" 
                          ? "bg-green-950 text-green-400 border border-green-900/40" 
                          : challenge.difficultyEn === "Medium"
                          ? "bg-amber-950 text-amber-400 border border-amber-900/40"
                          : "bg-red-950 text-red-400 border border-red-900/40"
                      }`}>
                        {isAr ? challenge.difficultyAr : challenge.difficultyEn}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 leading-normal line-clamp-2 text-left-reverse">
                      {isAr ? challenge.descriptionAr : challenge.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Section: Code Editor, Variable memory inspector, and Output Console (Grid: 5 cols) */}
        <div className="xl:col-span-5 space-y-4 flex flex-col h-full">
          {/* Main IDE editor viewport */}
          <div className="bg-[#0a0f0d] border border-[#1b2f22] rounded-2xl p-4 shadow-xl flex flex-col space-y-3 relative-parent flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse select-none">
                <FileCode className="w-5 h-5 text-[#30f28a]" />
                <span className="font-bold text-xs md:text-sm tracking-wide text-gray-200 font-display">
                  {selectedChallengeId 
                    ? (isAr ? "محرر التحدي (Interactive Solver)" : "Challenge Solution Workspace")
                    : (isAr ? "محرر الأكواد النشط (Sandbox Editor)" : "Interactive Coding Workspace")}
                </span>
              </div>

              {/* Action buttons (Run, Clear, Save) */}
              <div className="flex items-center space-x-2 space-x-reverse select-none">
                <button
                  onClick={handleSaveProgress}
                  className="p-2 bg-[#121c16] hover:bg-[#1a3024] text-gray-400 hover:text-white border border-[#1c2e24] hover:border-[#30f28a]/40 rounded-lg transition-all cursor-pointer"
                  title={isAr ? "حفظ مؤقت محلي" : "Save locally to browser Storage"}
                >
                  <Save className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetChallenge}
                  className="p-2 bg-[#121c16] hover:bg-red-950/20 text-gray-400 hover:text-red-400 border border-[#1c2e24] hover:border-red-900/40 rounded-lg transition-all cursor-pointer"
                  title={isAr ? "استعادة الكود الأصلي" : "Reset Workspace Code"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={runPythonCode}
                  disabled={pyodideStatus !== "ready" || isRunning}
                  className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-[#133020] hover:bg-[#1a442d] disabled:bg-[#111] disabled:text-gray-600 disabled:border-transparent text-[#30f28a] hover:text-white rounded-lg border border-[#30f28a]/40 hover:border-[#30f28a]/80 shadow-md shadow-[#30f28a]/10 hover:shadow-[#30f28a]/20 transition-all font-semibold font-display text-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-[#30f28a] group-hover:fill-white text-transparent" />
                  )}
                  <span>{isRunning ? (isAr ? "جاري التشغيل..." : "Running...") : (isAr ? "تشغيل الكود" : "Run Code")}</span>
                </button>
              </div>
            </div>

            {/* Simulated Live IDE Layout with syncing line numbers */}
            <div className="flex-1 bg-[#060a08] border border-[#15241a] rounded-xl overflow-hidden flex min-h-[350px] relative">
              {/* Line numbers on left gutter */}
              <div className="bg-[#080d0a] border-r border-[#15241a] text-right font-mono text-xs text-gray-600 select-none px-2.5 py-4 leading-relaxed flex flex-col items-end min-w-[36px]">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea code field */}
              <textarea
                ref={codeTextareaRef}
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                placeholder={
                  isAr 
                    ? "# اكتب كود البايثون هنا ليتم تجميعه فوراً...\n# اكتب دالة print لرؤية المخرجات بالأسفل" 
                    : "# Enter your python script here to evaluate...\n# e.g.: print('Hello World')"
                }
                spellCheck={false}
                className="flex-1 bg-transparent p-4 text-emerald-100 font-mono text-xs md:text-sm leading-relaxed focus:outline-none resize-none whitespace-pre overflow-x-auto select-text selection:bg-[#30f28a]/40"
                dir="ltr"
              />
            </div>
          </div>

          {/* Variables and lists memory Visualizations live container */}
          {(visualArray || visualStack || visualQueue || memoryInspectors.length > 0) && (
            <div className="bg-[#0a0f0d] border border-[#1b2f22] rounded-2xl p-4 shadow-xl select-none">
              <div className="flex items-center space-x-2 space-x-reverse mb-3">
                <Database className="w-4 h-4 text-[#ffd43b]" />
                <span className="font-bold text-xs uppercase tracking-wider text-gray-400 font-display">
                  {isAr ? "مفتش بنية البيانات والذاكرة النشط (Live Memory Inspector)" : "Active Memory Inspector"}
                </span>
              </div>

              {/* Active list visualizer */}
              {visualArray && (
                <div className="p-3 bg-[#0c1310] border border-[#1b2c21]/80 rounded-xl my-2">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-display">
                    {isAr ? "📊 تمثيل مصفوفة القائمة (List Array Representation)" : "📊 List Array Visualizer"}
                  </h4>
                  <div className="flex items-end justify-center space-x-2 h-20 px-4">
                    {visualArray.map((num: any, idx: number) => {
                      const numericVal = Number(num) || 0;
                      const maxElement = Math.max(...visualArray.map(n => Number(n) || 1));
                      const percentHeight = Math.min(100, Math.max(15, (numericVal / maxElement) * 100));
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 max-w-[32px]">
                          <div 
                            style={{ height: `${percentHeight}%` }} 
                            className="w-full bg-gradient-to-t from-[#133020] to-[#30f28a] rounded-t border-t border-[#30f28a]/30 shadow shadow-[#30f28a]/10"
                          />
                          <span className="text-[10px] font-mono text-gray-300 mt-1">{num}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stack visualizer */}
              {visualStack && (
                <div className="p-3 bg-[#0c1310] border border-[#1b2c21]/80 rounded-xl my-2">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-display">
                    {isAr ? "📥 محاكاة مكدس البيانات (Stack LIFO Layout)" : "📥 Stack LIFO Memory Visualizer"}
                  </h4>
                  <div className="flex flex-col-reverse justify-center space-y-1 space-y-reverse max-w-xs mx-auto">
                    {visualStack.map((item: any, idx: number) => (
                      <div key={idx} className="bg-[#121c16] border border-[#30f28a]/30 rounded-md px-2.5 py-1 flex items-center justify-between text-[11px] font-mono text-emerald-300 shadow-sm">
                        <span>{item}</span>
                        <span className="text-gray-500 text-[9px]">Index [{idx}]{idx === visualStack.length - 1 ? " (TOP)" : ""}</span>
                      </div>
                    ))}
                    {visualStack.length === 0 && (
                      <div className="text-center text-[10px] text-gray-500 italic">Stack is empty</div>
                    )}
                  </div>
                </div>
              )}

              {/* Queue visualizer */}
              {visualQueue && (
                <div className="p-3 bg-[#0c1310] border border-[#1b2c21]/80 rounded-xl my-2">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 font-display">
                    {isAr ? "👥 محاكاة طابور الانتظار (Queue FIFO Layout)" : "👥 Queue FIFO Memory Visualizer"}
                  </h4>
                  <div className="flex items-center justify-start space-x-2 overflow-x-auto">
                    {visualQueue.map((item: any, idx: number) => (
                      <div key={idx} className="bg-[#121c16] border border-[#ffd43b]/30 rounded px-2 py-1 flex flex-col items-center justify-center text-[11px] font-mono text-yellow-300 shadow-sm min-w-[50px]">
                        <span className="text-[8px] text-gray-500">[{idx}] {idx === 0 ? "FRONT" : idx === visualQueue.length - 1 ? "REAR" : ""}</span>
                        <span className="mt-0.5">{item}</span>
                      </div>
                    ))}
                    {visualQueue.length === 0 && (
                      <div className="text-center text-[10px] text-gray-500 italic w-full">Queue is empty</div>
                    )}
                  </div>
                </div>
              )}

              {/* Numeric Memory fields list chips */}
              {memoryInspectors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {memoryInspectors.map(({ key, value }) => (
                    <div key={key} className="bg-[#121c16] border border-[#1c3224] rounded-lg px-2.5 py-1 flex items-center space-x-2 space-x-reverse text-xs">
                      <span className="font-mono text-gray-500">{key}:</span>
                      <span className="font-mono text-[#30f28a] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Console output display terminal board */}
          <ConsoleTerminal
            logs={stdoutLogs}
            errors={errorLogs}
            onClear={() => {
              setStdoutLogs([]);
              setErrorLogs([]);
            }}
            isRunning={isRunning}
            onRun={runPythonCode}
            pyodideStatus={pyodideStatus}
            language={language}
          />

          {/* Interactive automated test suite outputs if coding challenge Selected */}
          {selectedChallengeId && (
            <div className="bg-[#0a0f0d] border border-[#1b2f22] rounded-2xl p-4 shadow-xl select-none">
              <div className="flex items-center justify-between mb-3 border-b border-[#1c2e24] pb-2">
                <div className="flex items-center space-x-2 space-x-reverse font-display">
                  <Trophy className="w-4 h-4 text-[#ffd43b]" />
                  <span className="font-bold text-xs md:text-sm text-gray-200">
                    {isAr ? "نتائج الاختبارات التلقائية" : "Automated Validation Cases"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRequestHint}
                  disabled={isGeneratingHint}
                  className="text-[11px] font-semibold text-[#ffd43b] hover:text-[#fff] flex items-center space-x-1 space-x-reverse bg-[#2c260f]/60 hover:bg-[#3d3314] px-2.5 py-1 border border-[#ffd43b]/20 hover:border-[#ffd43b]/50 rounded-lg transition-all cursor-pointer"
                >
                  <HintIcon className="w-3.5 h-3.5" />
                  <span>{isGeneratingHint ? (isAr ? "جاري توليد التلميح..." : "Analyzing code...") : (isAr ? "طلب تلميح ذكي" : "Ask AI Hint")}</span>
                </button>
              </div>

              {/* Live generated hint explanation card */}
              {hintsUsed[selectedChallengeId] && (
                <div className="bg-[#1a170d] border border-[#ffd43b]/20 rounded-xl p-3 mb-3 text-xs leading-relaxed text-yellow-105 select-text">
                  <div className="font-bold text-[#ffd43b] mb-1 font-display flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    <span>{isAr ? "تلميح الذكاء الاصطناعي الممتاز" : "Tutor Guided Strategy Hint"}</span>
                  </div>
                  <p className="text-yellow-200/90 whitespace-pre-line">{hintsUsed[selectedChallengeId]}</p>
                </div>
              )}

              {/* List of test asserts outcomes */}
              <div className="space-y-1.5">
                {challengeTestResults.length > 0 ? (
                  challengeTestResults.map((tRes, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-[#0d120f] border border-[#1b2f22] rounded-xl text-xs">
                      <div className="flex items-center space-x-2 space-x-reverse font-mono text-gray-300">
                        <span>{tRes.passed ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}</span>
                        <span>{tRes.testExpr}</span>
                      </div>
                      <div className="font-mono text-[11px] text-gray-500">
                        {isAr ? "المتوقع:" : "Expected:"} <span className="text-emerald-400 font-semibold">{String(tRes.expected)}</span>{" | "}
                        {isAr ? "الفعلي:" : "Returned:"} <span className={tRes.passed ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{String(tRes.actual)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs py-4 text-gray-500 italic bg-[#0b100d] rounded-xl border border-dashed border-[#1c2e24]">
                    {isAr 
                      ? "بانتظار تشغيل الكود البرمجي لمطابقة الاختبارات... اضغط على زر 'تشغيل الكود' بالأعلى للتحقق والتأكد." 
                      : "Click the 'Run Code' button above to execute assertions and retrieve test grades."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: AI Tutor Sidekick panel (Grid: 4 cols) */}
        <div className="xl:col-span-4 h-full">
          <AiTutorPanel
            code={currentCode}
            lastExecutionError={lastExecutionError}
            language={language}
            onApplyCode={handleApplyImportedCode}
          />
        </div>
      </main>
    </div>
  );
}
