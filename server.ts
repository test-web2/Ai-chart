import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, model, imageBase64 } = req.body;
      const apiKey = "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag" || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const formattedHistory = history ? history.map((h: any) => {
        const parts: any[] = [];
        if (h.imageBase64) {
          try {
            const base64Data = h.imageBase64.split(",")[1];
            const mimeType = h.imageBase64.split(";")[0].split(":")[1];
            parts.push({ inlineData: { data: base64Data, mimeType } });
          } catch (e) {
            console.error("Error parsing history image", e);
          }
        }
        parts.push({ text: h.content || "" });
        return {
          role: h.role === "model" ? "model" : "user",
          parts
        };
      }) : [];

      const currentParts: any[] = [];
      if (imageBase64) {
        try {
          const base64Data = imageBase64.split(",")[1];
          const mimeType = imageBase64.split(";")[0].split(":")[1];
          currentParts.push({ inlineData: { data: base64Data, mimeType } });
        } catch (e) {
          console.error("Error parsing current image", e);
        }
      }
      if (message) {
        currentParts.push({ text: message });
      }
      
      formattedHistory.push({ role: "user", parts: currentParts });

      const response = await ai.models.generateContent({
        model: model || "gemini-3.1-pro-preview",
        contents: formattedHistory,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat Error:", error);
      const msg = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") 
        ? "لقد تجاوزت الحد المسموح للاستخدام المجاني للنموذج (Quota Exceeded). يرجى المحاولة لاحقاً أو تغيير النموذج." 
        : error?.status === "UNAVAILABLE" || error?.message?.includes("503")
        ? "عذراً، هذا النموذج يواجه ضغطاً عالياً حالياً (503). يرجى اختيار نموذج آخر من القائمة أو المحاولة لاحقاً."
        : error.message || "An error occurred during chat.";
      res.status(500).json({ error: msg });
    }
  });

  // AI Chart Analyzer Route
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const apiKey = "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag" || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `أنت محلل مالي متقدم وخبير في التداول والتحليل الفني (Price Action & Indicators).
مهمتك هي تحليل صورة شارت التداول المرفقة بدقة شديدة وتقديم تحليل احتمالي، وليس ضمانًا 100%.

القواعد الصارمة (Anti-Hallucination):
- لا تخمن أي معلومة غير واضحة. إذا كان الأصل، أو الإطار الزمني، أو السعر غير ظاهر، اكتب "UNKNOWN" أو "المعلومة غير واضحة في الصورة".
- لا تستخدم أي مؤشر غير موجود في الصورة.
- لا تخترع قمم أو قيعان أو مقاومات غير موجودة.
- لا تجبر النظام على إعطاء BUY أو SELL إذا كانت الإشارات متعارضة. في هذه الحالة، يجب أن تكون الإشارة "WAIT".
- إذا كانت جودة الصورة منخفضة جداً بحيث لا يمكن تحليل الشارت، يجب أن تعيد imageQualityStatus كـ "INSUFFICIENT" وتوقف التحليل.
- الرد يجب أن يكون بتنسيق JSON فقط بناءً على المخطط المحدد.

نظام التحليل:
1. تحليل حركة السعر (Price Action): الهياكل، الدعوم/المقاومات، القمم والقيعان.
2. التحليل الفني: المؤشرات الظاهرة فقط (RSI, MACD, Volume, EMA, إلخ).
3. السيناريوهات: تقييم السيناريو الصاعد، الهابط، والمحايد وتحديد الأقوى.

يجب أن تُخرج النتائج بناءً على هذا المخطط:
- asset: اسم الأصل (إن وُجد) باللغة العربية.
- timeframe: الإطار الزمني (إن وُجد) باللغة العربية (مثل: ٤ ساعات، يومي).
- currentPrice: السعر الحالي أو أقرب سعر ظاهر.
- imageQualityStatus: حالة جودة الصورة ("GOOD" أو "INSUFFICIENT").
- signal: الإشارة النهائية ويجب أن تكون بالإنجليزية ("BUY" أو "SELL" أو "WAIT").
- confidenceScore: نسبة الثقة كعدد صحيح (مثال: 78).
- entryZone: منطقة الدخول المقترحة باللغة العربية (مثال: بين ١٠٠ و ١٠٥).
- stopLoss: وقف الخسارة المنطقي لإبطال السيناريو باللغة العربية.
- takeProfit1: الهدف الأول باللغة العربية.
- takeProfit2: الهدف الثاني باللغة العربية.
- riskReward: نسبة العائد للمخاطرة.
- reasons: قائمة بأسباب هذا القرار باللغة العربية الفصحى وبشرح واضح.
- invalidation: شرح لمتى يصبح هذا التحليل لاغيًا باللغة العربية الفصحى.
- dataQuality: تعليق على وضوح البيانات المتوفرة في الشارت باللغة العربية.

تأكد من أن جميع الحقول النصية (ما عدا signal و imageQualityStatus) مكتوبة باللغة العربية الفصحى بشكل دقيق واحترافي. حلل الصورة المرفقة بتركيز عالٍ وأعطني الرد.`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          asset: { type: Type.STRING },
          timeframe: { type: Type.STRING },
          currentPrice: { type: Type.STRING },
          imageQualityStatus: { type: Type.STRING, description: "GOOD or INSUFFICIENT" },
          signal: { type: Type.STRING, description: "BUY, SELL, or WAIT" },
          confidenceScore: { type: Type.INTEGER },
          entryZone: { type: Type.STRING },
          stopLoss: { type: Type.STRING },
          takeProfit1: { type: Type.STRING },
          takeProfit2: { type: Type.STRING },
          riskReward: { type: Type.STRING },
          reasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          invalidation: { type: Type.STRING },
          dataQuality: { type: Type.STRING },
        },
        required: [
          "asset",
          "timeframe",
          "currentPrice",
          "imageQualityStatus",
          "signal",
          "confidenceScore",
          "entryZone",
          "stopLoss",
          "takeProfit1",
          "takeProfit2",
          "riskReward",
          "reasons",
          "invalidation",
          "dataQuality"
        ],
      };

      const attemptGeneration = async (modelName: string, useThinking: boolean) => {
        const config: any = {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        };
        // Removed thinkingConfig to prevent proxy timeouts
        return await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
          config,
        });
      };

      let response;
      try {
        response = await attemptGeneration("gemini-3.1-pro-preview", true);
      } catch (err1: any) {
        console.warn("Primary model (gemini-3.1-pro-preview) failed:", err1.message);
        if (err1?.status === "RESOURCE_EXHAUSTED" || err1?.message?.includes("429") || err1?.status === "NOT_FOUND" || err1?.message?.includes("404") || err1?.status === "UNAVAILABLE" || err1?.message?.includes("503")) {
          try {
             response = await attemptGeneration("gemini-3.8-flash", false);
          } catch (err2: any) {
             console.warn("Secondary model (gemini-3.8-flash) failed:", err2.message);
             if (err2?.status === "RESOURCE_EXHAUSTED" || err2?.message?.includes("429") || err2?.status === "NOT_FOUND" || err2?.message?.includes("404") || err2?.status === "UNAVAILABLE" || err2?.message?.includes("503")) {
                response = await attemptGeneration("gemini-3.1-flash-lite", false);
             } else {
                throw err2;
             }
          }
        } else {
          throw err1;
        }
      }

      const text = response.text;
      if (!text) {
        throw new Error("No response generated.");
      }

      const jsonResult = JSON.parse(text);
      res.json(jsonResult);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      const msg = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") 
        ? "عذراً، لقد تجاوزت الحد المسموح للاستخدام المجاني للنموذج (Quota Exceeded). يرجى المحاولة بعد قليل." 
        : error?.status === "UNAVAILABLE" || error?.message?.includes("503")
        ? "عذراً، الخوادم تواجه ضغطاً عالياً حالياً (503 Service Unavailable). يرجى المحاولة لاحقاً."
        : error.message || "An error occurred during analysis.";
      res.status(500).json({ error: msg });
    }
  });

  // Live Recommendations Route
  app.get("/api/live-recommendations", async (req, res) => {
    try {
      const apiKey = "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag" || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Fetch real market data from Binance API
      const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "GBPUSDT", "AUDUSDT", "XAUTUSDT"];
      let marketDataText = "";
      
      for (const sym of symbols) {
        try {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
          const data = await response.json();
          let label = sym;
          if (sym === "XAUTUSDT") label = "XAUUSD (الذهب)";
          if (sym === "GBPUSDT") label = "GBPUSD (الجنيه الإسترليني)";
          if (sym === "AUDUSDT") label = "AUDUSD (الدولار الأسترالي)";
          if (sym === "BTCUSDT") label = "BTCUSD (البيتكوين)";
          if (sym === "ETHUSDT") label = "ETHUSD (الإيثيريوم)";
          if (sym === "SOLUSDT") label = "SOLUSD (سولانا)";
          
          marketDataText += `
          الأصل: ${label}
          السعر الحالي: ${data.lastPrice}
          التغير في 24 ساعة: ${data.priceChangePercent}%
          أعلى سعر في 24 ساعة: ${data.highPrice}
          أدنى سعر في 24 ساعة: ${data.lowPrice}
          حجم التداول: ${data.volume}
          -------------------`;
        } catch (e) {
          console.error(`Error fetching data for ${sym}:`, e);
        }
      }

      // Fetch USDJPY
      try {
        const erRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const erData = await erRes.json();
        if (erData && erData.rates && erData.rates.JPY) {
          marketDataText += `
          الأصل: USDJPY (الدولار مقابل الين)
          السعر الحالي: ${erData.rates.JPY}
          -------------------`;
        }
      } catch (e) {
        console.error("Error fetching USDJPY:", e);
      }

      const prompt = `أنت محلل أسواق مالية محترف ومستشار تداول. 
      بناءً على بيانات الأسعار الحية التالية التي تعكس وضع السوق الآن مباشر:
      ${marketDataText}
      
      قم بتقديم توصيات تداول دقيقة جداً لكل أصل مالي مذكور أعلاه (كريبتو، فوركس، ذهب).
      يجب أن تكون التوصيات باللغة العربية الفصحى. بالنسبة للأصول التي لا تحتوي على تغير 24 ساعة (مثل USDJPY)، اعتمد على معرفتك بخبرات السوق الحالية لتقديم أقرب توصية دقيقة (سكالبينج أو تداول يومي).
      
      أخرج النتيجة كمصفوفة (Array) من كائنات JSON.`;

      const responseSchema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            asset: { type: Type.STRING },
            signal: { type: Type.STRING, description: "BUY, SELL, or WAIT" },
            confidenceScore: { type: Type.INTEGER },
            entryZone: { type: Type.STRING },
            takeProfit1: { type: Type.STRING },
            takeProfit2: { type: Type.STRING },
            stopLoss: { type: Type.STRING },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["asset", "signal", "confidenceScore", "entryZone", "takeProfit1", "takeProfit2", "stopLoss", "reasons"]
        }
      };

      const attemptLiveGen = async (modelName: string) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
      };

      let result;
      try {
        result = await attemptLiveGen("gemini-3.1-pro-preview");
      } catch (err1: any) {
        if (err1?.status === "RESOURCE_EXHAUSTED" || err1?.message?.includes("429") || err1?.status === "UNAVAILABLE" || err1?.message?.includes("503")) {
          try {
            result = await attemptLiveGen("gemini-3.8-flash");
          } catch (err2: any) {
            if (err2?.status === "RESOURCE_EXHAUSTED" || err2?.message?.includes("429") || err2?.status === "UNAVAILABLE" || err2?.message?.includes("503")) {
              result = await attemptLiveGen("gemini-3.1-flash-lite");
            } else {
              throw err2;
            }
          }
        } else {
          throw err1;
        }
      }
      
      res.json(JSON.parse(result.text || "[]"));
    } catch (error: any) {
      console.error("Live Recommendations Error:", error);
      const isQuota = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429");
      const isBusy = error?.status === "UNAVAILABLE" || error?.message?.includes("503");
      const msg = isQuota ? "لقد تجاوزت الحد المسموح للنموذج المجاني، يرجى المحاولة بعد دقيقة." : 
                  isBusy ? "الخوادم تواجه ضغطاً، يرجى المحاولة بعد قليل." : 
                  "فشل في جلب التوصيات المباشرة. يرجى المحاولة لاحقاً.";
      res.status(500).json({ error: msg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
