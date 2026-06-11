import React from "react";
import { Terminal, Trash2, StopCircle, Play, Loader, ShieldAlert } from "lucide-react";

interface ConsoleTerminalProps {
  logs: string[];
  errors: string[];
  onClear: () => void;
  isRunning: boolean;
  onRun: () => void;
  pyodideStatus: "loading" | "ready" | "error";
  language: "en" | "ar";
}

export default function ConsoleTerminal({
  logs,
  errors,
  onClear,
  isRunning,
  onRun,
  pyodideStatus,
  language,
}: ConsoleTerminalProps) {
  const isAr = language === "ar";

  return (
    <div className="flex flex-col h-full bg-[#070b09] border border-[#1b2f22] rounded-xl overflow-hidden font-mono text-sm shadow-inner shadow-black/80">
      {/* Terminal Title Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a100d] border-b border-[#1b2f22]">
        <div className="flex items-center space-x-2">
          {/* Mock Red/Yellow/Green Unix Dots */}
          <div className="flex space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/50 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/50 block" />
            <span className="w-3 h-3 rounded-full bg-green-500/50 block" />
          </div>
          <Terminal className="w-4 h-4 text-[#30f28a]" />
          <span className="font-semibold text-gray-300 select-none">
            {isAr ? "مخرجات النظام (Terminal)" : "Execution Terminal"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Clear terminal btn */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-md hover:bg-[#121d17] hover:text-red-400 text-gray-500 transition-colors"
            title={isAr ? "مسح الشاشة" : "Clear Output"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main console logger screen */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 select-text min-h-[160px] text-gray-100 placeholder-teal-800">
        {/* Loading / Ready status notifications */}
        {pyodideStatus === "loading" && (
          <div className="flex items-center space-x-2 p-2 bg-[#0c1811] text-[#30f28a] border border-[#173824]/50 rounded-lg text-xs">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span>
              {isAr
                ? "جاري تحميل محرك بايثون بالمتصفح (بيئة WebAssembly)..."
                : "Initializing Python WebAssembly environment in sandbox..."}
            </span>
          </div>
        )}

        {pyodideStatus === "error" && (
          <div className="flex items-center space-x-2 p-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded-lg text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>
              {isAr
                ? "فشل تشغيل محرك بايثون. يرجى إعادة تحميل الصفحة."
                : "Failed to initialize Python WASM engine. Please reload the tab."}
            </span>
          </div>
        )}

        {pyodideStatus === "ready" && logs.length === 0 && errors.length === 0 && !isRunning && (
          <div className="text-gray-500 italic text-xs py-1">
            {isAr
              ? "# بانتظار تنفيذ الأوامر.. اضغط على 'تشغيل الكود' في الأعلى لرؤية النتائج."
              : "# Waiting for execution.. Click 'Run Code' above to view outputs."}
          </div>
        )}

        {/* Standard print logs */}
        {logs.map((log, idx) => (
          <div key={`log-${idx}`} className="whitespace-pre-wrap text-emerald-300/90 leading-relaxed font-mono">
            {log}
          </div>
        ))}

        {/* Traceback & execution mistakes */}
        {errors.map((error, idx) => (
          <div key={`err-${idx}`} className="text-red-400 font-mono whitespace-pre-wrap bg-red-950/20 px-3 py-2 border-l-2 border-red-500 rounded my-1 text-xs leading-relaxed">
            {error}
          </div>
        ))}

        {/* Active compilation spinner */}
        {isRunning && (
          <div className="flex items-center space-x-2 text-[#ffd43b] text-xs py-1">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span className="italic">
              {isAr ? "جاري تشغيل كود البايثون..." : "Executing script..."}
            </span>
          </div>
        )}
      </div>

      {/* Stdin Helper Notice */}
      <div className="bg-[#090e0c] px-4 py-1.5 text-[11px] text-gray-500 border-t border-[#121c16] flex items-center justify-between">
        <span>
          {isAr
            ? "* يدعم المنفذ دوال بايثون القياسية ومكتباتها بالكامل"
            : "* Standard input redirection & library imports are active"}
        </span>
        <span className="text-[#30f28a]/40">Python WASM 3.12</span>
      </div>
    </div>
  );
}
