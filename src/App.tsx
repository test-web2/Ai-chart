import React, { useState, useEffect } from "react";
import { Uploader } from "./components/Uploader";
import { AnalysisResultCard } from "./components/AnalysisResultCard";
import { Dashboard } from "./components/Dashboard";
import { Chat } from "./components/Chat";
import { LiveSignals } from "./components/LiveSignals";
import { AnalysisResult, HistoryItem } from "./types";
import { Activity, LayoutDashboard, LineChart, AlertCircle, MessageSquare, Zap } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analyzer" | "dashboard" | "chat" | "live">("analyzer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai_chart_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem("ai_chart_history", JSON.stringify(history));
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ai_chart_history");
  };

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "حدث خطأ أثناء التحليل");
      }

      const data: AnalysisResult = await res.json();
      
      if (data.imageQualityStatus === "INSUFFICIENT") {
         setError("Image Quality: Insufficient - جودة الصورة منخفضة، يرجى رفع صورة أوضح.");
         setIsAnalyzing(false);
         return;
      }

      setCurrentResult(data);

      // Create a blob URL for preview in history (note: these expire on reload, but good for current session)
      const imageObjUrl = URL.createObjectURL(file);

      const newItem: HistoryItem = {
        ...data,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        imageObjUrl,
      };

      setHistory((prev) => [newItem, ...prev]);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-cairo selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none mb-1">AI Chart Analyzer</h1>
              <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Pro Vision System</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab("analyzer")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                activeTab === "analyzer"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">التحليل</span>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                activeTab === "dashboard"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">السجل والإحصائيات</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                activeTab === "chat"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">مساعد الذكاء الاصطناعي</span>
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                activeTab === "live"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">توصيات السوق الحية</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === "analyzer" ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            
            {!currentResult && !isAnalyzing && (
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-100 leading-tight">
                  تحليل الشارت بذكاء اصطناعي متطور
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  ارفع صورة لشارت التداول وسنقوم بتحليل Price Action والمؤشرات لتقديم سيناريو احتمالي دقيق مدعوم بالأدلة.
                </p>
              </div>
            )}

            <Uploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {error && (
              <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {currentResult && !isAnalyzing && (
              <div className="pt-4 border-t border-slate-800/50 mt-12">
                <div className="text-center mb-8">
                  <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm font-bold mb-4">
                    تم تحليل الشارت بنجاح
                  </span>
                </div>
                <AnalysisResultCard result={currentResult} />
              </div>
            )}

          </div>
        ) : activeTab === "dashboard" ? (
          <Dashboard history={history} onClearHistory={clearHistory} />
        ) : activeTab === "chat" ? (
          <Chat />
        ) : (
          <LiveSignals />
        )}
      </main>
    </div>
  );
}

