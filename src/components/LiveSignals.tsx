import React, { useState, useEffect } from "react";
import { LiveRecommendation } from "@/types";
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, Activity, LineChart as LineChartIcon, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const getTVSymbol = (assetName: string) => {
  const name = assetName.toUpperCase();
  if (name.includes("BTC")) return "BINANCE:BTCUSDT";
  if (name.includes("ETH")) return "BINANCE:ETHUSDT";
  if (name.includes("SOL")) return "BINANCE:SOLUSDT";
  if (name.includes("XAU") || name.includes("ذهب")) return "OANDA:XAUUSD";
  if (name.includes("GBP")) return "FX:GBPUSD";
  if (name.includes("AUD")) return "FX:AUDUSD";
  if (name.includes("JPY") || name.includes("ين")) return "FX:USDJPY";
  return "BINANCE:BTCUSDT"; // default fallback
};

export function LiveSignals() {
  const [recommendations, setRecommendations] = useState<LiveRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartTheme, setChartTheme] = useState<"dark" | "light">("dark");

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/live-recommendations");
      if (!response.ok) throw new Error("فشل في جلب التوصيات.");
      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedSymbol) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedSymbol]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            التوصيات المباشرة (Live Signals)
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            توصيات دقيقة تعتمد على بيانات السوق الحية لحظة بلحظة لأسواق العملات الرقمية.
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحديث...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              تحديث الآن
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && recommendations.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-slate-400">لا توجد توصيات حالياً.</p>
        </div>
      )}

      {isLoading && recommendations.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-80 animate-pulse">
              <div className="h-6 bg-slate-800 rounded-full w-1/3 mb-4"></div>
              <div className="h-10 bg-slate-800 rounded-2xl w-full mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded-full w-full"></div>
                <div className="h-4 bg-slate-800 rounded-full w-5/6"></div>
                <div className="h-4 bg-slate-800 rounded-full w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => {
          const isBuy = rec.signal === "BUY";
          const isSell = rec.signal === "SELL";
          const isWait = rec.signal === "WAIT";

          const signalColor = isBuy
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : isSell
            ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
            : "text-amber-400 bg-amber-500/10 border-amber-500/20";

          const signalIcon = isBuy ? <TrendingUp className="w-5 h-5" /> : isSell ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />;

          return (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{rec.asset}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">نسبة الثقة:</span>
                    <span className={cn("font-bold text-sm", rec.confidenceScore > 75 ? "text-emerald-400" : "text-amber-400")}>
                      {rec.confidenceScore}%
                    </span>
                  </div>
                </div>
                <div className={cn("px-4 py-2 rounded-full border flex items-center gap-2 font-bold", signalColor)}>
                  {signalIcon}
                  {rec.signal === "BUY" ? "شراء" : rec.signal === "SELL" ? "بيع" : "انتظار"}
                </div>
              </div>

              {!isWait ? (
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                      <span className="block text-xs text-slate-500 mb-1">منطقة الدخول</span>
                      <span className="text-sm font-semibold text-slate-200">{rec.entryZone}</span>
                    </div>
                    <div className="bg-rose-950/20 rounded-xl p-3 border border-rose-900/30">
                      <span className="block text-xs text-rose-500/80 mb-1">وقف الخسارة</span>
                      <span className="text-sm font-semibold text-rose-300">{rec.stopLoss}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-900/30">
                    <span className="block text-xs text-emerald-500/80 mb-1">الأهداف</span>
                    <div className="flex justify-between text-sm font-semibold text-emerald-300">
                      <span>{rec.takeProfit1}</span>
                      <span>{rec.takeProfit2}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500/50 mb-3" />
                  <p className="text-sm text-slate-400">الوضع حالياً غير مناسب للدخول. يرجى الانتظار.</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800/50">
                <span className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">الأسباب</span>
                <ul className="space-y-1.5 mb-4">
                  {rec.reasons?.slice(0, 2).map((reason, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedSymbol(getTVSymbol(rec.asset))}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-colors text-sm font-bold"
                >
                  <LineChartIcon className="w-4 h-4" />
                  عرض الشارت المباشر
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* TradingView Modal */}
      {selectedSymbol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-blue-400" />
                الشارت المباشر: {selectedSymbol.split(':')[1]}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartTheme(prev => prev === "dark" ? "light" : "dark")}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors flex items-center gap-2"
                  title="تغيير المظهر"
                >
                  {chartTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedSymbol(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 w-full h-full relative">
              <iframe
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=${selectedSymbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=${chartTheme}&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=ar`}
                className="absolute inset-0 w-full h-full border-none"
                title="TradingView Chart"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
