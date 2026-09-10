import React, { useState } from "react";
import { HistoryItem } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, Minus, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export function Dashboard({ history, onClearHistory }: Props) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const total = history.length;
  const buys = history.filter((h) => h.signal === "BUY").length;
  const sells = history.filter((h) => h.signal === "SELL").length;
  const waits = history.filter((h) => h.signal === "WAIT").length;

  const validScores = history.map((h) => h.confidenceScore).filter((s) => !isNaN(s) && s > 0);
  const avgConfidence = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">الإجمالي</span>
          </div>
          <span className="text-4xl font-black text-slate-100">{total}</span>
        </div>

        <div className="bg-slate-900 border border-emerald-900/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <span className="font-medium">شراء (BUY)</span>
          </div>
          <span className="text-4xl font-black text-emerald-100">{buys}</span>
        </div>

        <div className="bg-slate-900 border border-rose-900/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
            <TrendingDown className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <span className="font-medium">بيع (SELL)</span>
          </div>
          <span className="text-4xl font-black text-rose-100">{sells}</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/30 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
            <Minus className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <span className="font-medium">انتظار (WAIT)</span>
          </div>
          <span className="text-4xl font-black text-amber-100">{waits}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <span className="font-medium">متوسط الثقة</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-blue-100">{avgConfidence}</span>
            <span className="text-lg text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">سجل التحليلات</h2>
            <Clock className="w-5 h-5 text-slate-500 hidden sm:block" />
          </div>
          {history.length > 0 && (
            isConfirmingDelete ? (
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-full border border-rose-900/50">
                <span className="text-xs text-slate-400 px-2 font-medium">تأكيد الحذف؟</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setIsConfirmingDelete(false);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors shadow-sm"
                >
                  نعم
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">حذف السجل</span>
              </button>
            )
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <BarChart3 className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 font-medium text-lg">لا يوجد تحليلات سابقة</p>
            <p className="text-slate-500 text-sm mt-1">قم برفع شارت للبدء</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {history.map((item) => {
              const date = new Date(item.timestamp);
              
              const isBuy = item.signal === "BUY";
              const isSell = item.signal === "SELL";
              
              const signalColor = isBuy
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : isSell
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20";

              return (
                <div key={item.id} className="p-4 md:p-6 hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  {item.imageObjUrl ? (
                    <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700">
                      <img src={item.imageObjUrl} alt="Chart thumbnail" className="w-full h-full object-cover opacity-80" />
                    </div>
                  ) : (
                    <div className="w-full md:w-32 h-20 rounded-xl bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-1 w-full text-center md:text-right">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                      <h4 className="font-bold text-lg text-slate-200 truncate">{item.asset || "أصل غير معروف"}</h4>
                      <span className="text-sm text-slate-500">{date.toLocaleString("ar-SA", { dir: "ltr" })}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2 md:mt-0 text-sm text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded-md">{item.timeframe || "غير معروف"}</span>
                      {item.signal !== 'WAIT' && (
                         <>
                          <span>دخول: <span className="text-slate-200">{item.entryZone}</span></span>
                          <span className="text-slate-600">•</span>
                          <span>هدف 1: <span className="text-slate-200">{item.takeProfit1}</span></span>
                         </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-center">
                    <div className={cn("px-4 py-2 rounded-xl border font-bold flex flex-col items-center min-w-[80px]", signalColor)}>
                      <span className="text-xs opacity-70 uppercase tracking-wider mb-0.5">{item.signal}</span>
                      <span className="text-lg">{item.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
