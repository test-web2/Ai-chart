import React, { useState } from "react";
import { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";
import { Activity, Target, ShieldAlert, AlertTriangle, CheckCircle2, Info, Clock, TrendingUp, TrendingDown, Minus, Copy, Check } from "lucide-react";

interface Props {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: Props) {
  const isBuy = result.signal === "BUY";
  const isSell = result.signal === "SELL";
  const isWait = result.signal === "WAIT";
  const [copied, setCopied] = useState(false);

  const signalColor = isBuy
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : isSell
    ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
    : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  const signalIcon = isBuy ? <TrendingUp className="w-6 h-6" /> : isSell ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />;

  const handleCopy = () => {
    const textToCopy = `
التحليل المالي - ${result.asset || "غير معروف"} (${result.timeframe || "غير معروف"})

الإشارة: ${result.signal}
نسبة الثقة: ${result.confidenceScore}%
السعر الحالي: ${result.currentPrice || "غير معروف"}

${!isWait ? `منطقة الدخول: ${result.entryZone}
الهدف الأول: ${result.takeProfit1}
الهدف الثاني: ${result.takeProfit2}
وقف الخسارة: ${result.stopLoss}
العائد للمخاطرة: ${result.riskReward}` : ''}

الأسباب:
${result.reasons?.map(r => "- " + r).join('\n') || ""}

الإبطال:
${result.invalidation || ""}

جودة البيانات: ${result.dataQuality || ""}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors text-slate-300 text-sm font-medium shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "تم النسخ" : "نسخ التقرير"}</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">الأصل</span>
          <span className="text-lg font-bold text-slate-100">{result.asset || "غير معروف"}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">الإطار الزمني</span>
          <span className="text-lg font-bold text-slate-100">{result.timeframe || "غير معروف"}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">السعر الحالي</span>
          <span className="text-lg font-bold text-slate-100">{result.currentPrice || "غير معروف"}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-slate-500 text-sm font-medium mb-1">جودة البيانات</span>
          <span className="text-lg font-bold text-slate-100">{result.dataQuality || "متوسطة"}</span>
        </div>
      </div>

      {/* Main Signal Card */}
      <div className={cn("relative overflow-hidden rounded-3xl border p-8 flex flex-col md:flex-row items-center justify-between gap-8", signalColor)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-right gap-2">
          <div className="flex items-center gap-2 text-current opacity-80 font-semibold tracking-wider text-sm uppercase">
            <Activity className="w-4 h-4" />
            <span>إشارة السوق</span>
          </div>
          <div className="flex items-center gap-4">
            {signalIcon}
            <span className="text-5xl md:text-6xl font-black tracking-tight">{result.signal}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-white/5 backdrop-blur-sm min-w-[160px]">
          <span className="text-sm font-medium text-slate-400 mb-2">نسبة الثقة</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{result.confidenceScore}</span>
            <span className="text-xl text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* Trade Levels */}
      {!isWait && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              مستويات التداول
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">منطقة الدخول</span>
                <span className="font-semibold text-slate-100">{result.entryZone || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">الهدف الأول</span>
                <span className="font-semibold text-slate-100">{result.takeProfit1 || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">الهدف الثاني</span>
                <span className="font-semibold text-slate-100">{result.takeProfit2 || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">العائد للمخاطرة</span>
                <span className="font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{result.riskReward || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              إدارة المخاطر والإبطال
            </h3>
            
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 mb-4">
              <span className="block text-sm text-rose-400/80 mb-1 font-medium">وقف الخسارة</span>
              <span className="text-xl font-bold text-rose-300">{result.stopLoss || "N/A"}</span>
            </div>

            <div className="flex-1">
              <span className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                سيناريو الإبطال
              </span>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                {result.invalidation || "غير متوفر."}
              </p>
            </div>
          </div>
        </div>
      )}

      {isWait && (
        <div className="bg-slate-900/80 border border-amber-900/30 rounded-3xl p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
          <h3 className="text-xl font-bold text-amber-400">لا توجد إشارة واضحة</h3>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {result.invalidation || "حالة السوق الحالية غير واضحة أو المؤشرات متعارضة. من الأفضل الانتظار حتى تتضح الرؤية بشكل أفضل لتجنب المخاطرة العالية."}
          </p>
        </div>
      )}

      {/* Reasons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          الأسباب والملاحظات
        </h3>
        
        <ul className="space-y-4">
          {result.reasons?.length > 0 ? (
            result.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">{reason}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500 italic">لا توجد أسباب واضحة مقدمة.</li>
          )}
        </ul>
      </div>

      <div className="text-center pb-8 pt-4">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          هذا تحليل احتمالي مبني على البيانات المتاحة، وليس ضمانًا لنتيجة الصفقة.
        </p>
      </div>

    </div>
  );
}
