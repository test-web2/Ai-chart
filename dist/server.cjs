var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_multer = __toESM(require("multer"), 1);
var import_genai = require("@google/genai");
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
  // 20MB limit
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, model, imageBase64 } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }
            const ai = new import_genai.GoogleGenAI({ 
        apiKey: apiKey,
        vertexai: false 
      });

      const formattedHistory = history ? history.map((h) => {
        const parts = [];
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
      const currentParts = [];
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
        contents: formattedHistory
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Chat Error:", error);
      const msg = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") ? "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0646\u0645\u0648\u0630\u062C (Quota Exceeded). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B \u0623\u0648 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0646\u0645\u0648\u0630\u062C." : error?.status === "UNAVAILABLE" || error?.message?.includes("503") ? "\u0639\u0630\u0631\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062C \u064A\u0648\u0627\u062C\u0647 \u0636\u063A\u0637\u0627\u064B \u0639\u0627\u0644\u064A\u0627\u064B \u062D\u0627\u0644\u064A\u0627\u064B (503). \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0646\u0645\u0648\u0630\u062C \u0622\u062E\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0648 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B." : error.message || "An error occurred during chat.";
      res.status(500).json({ error: msg });
    }
  });
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }
      const apiKey = "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag";
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      };
      const prompt = `\u0623\u0646\u062A \u0645\u062D\u0644\u0644 \u0645\u0627\u0644\u064A \u0645\u062A\u0642\u062F\u0645 \u0648\u062E\u0628\u064A\u0631 \u0641\u064A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u0646\u064A (Price Action & Indicators).
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0634\u0627\u0631\u062A \u0627\u0644\u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0628\u062F\u0642\u0629 \u0634\u062F\u064A\u062F\u0629 \u0648\u062A\u0642\u062F\u064A\u0645 \u062A\u062D\u0644\u064A\u0644 \u0627\u062D\u062A\u0645\u0627\u0644\u064A\u060C \u0648\u0644\u064A\u0633 \u0636\u0645\u0627\u0646\u064B\u0627 100%.

\u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0635\u0627\u0631\u0645\u0629 (Anti-Hallucination):
- \u0644\u0627 \u062A\u062E\u0645\u0646 \u0623\u064A \u0645\u0639\u0644\u0648\u0645\u0629 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629. \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0623\u0635\u0644\u060C \u0623\u0648 \u0627\u0644\u0625\u0637\u0627\u0631 \u0627\u0644\u0632\u0645\u0646\u064A\u060C \u0623\u0648 \u0627\u0644\u0633\u0639\u0631 \u063A\u064A\u0631 \u0638\u0627\u0647\u0631\u060C \u0627\u0643\u062A\u0628 "UNKNOWN" \u0623\u0648 "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629 \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629".
- \u0644\u0627 \u062A\u0633\u062A\u062E\u062F\u0645 \u0623\u064A \u0645\u0624\u0634\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629.
- \u0644\u0627 \u062A\u062E\u062A\u0631\u0639 \u0642\u0645\u0645 \u0623\u0648 \u0642\u064A\u0639\u0627\u0646 \u0623\u0648 \u0645\u0642\u0627\u0648\u0645\u0627\u062A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.
- \u0644\u0627 \u062A\u062C\u0628\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 \u0639\u0644\u0649 \u0625\u0639\u0637\u0627\u0621 BUY \u0623\u0648 SELL \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0645\u062A\u0639\u0627\u0631\u0636\u0629. \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062D\u0627\u0644\u0629\u060C \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 "WAIT".
- \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u062C\u0648\u062F\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u062C\u062F\u0627\u064B \u0628\u062D\u064A\u062B \u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0634\u0627\u0631\u062A\u060C \u064A\u062C\u0628 \u0623\u0646 \u062A\u0639\u064A\u062F imageQualityStatus \u0643\u0640 "INSUFFICIENT" \u0648\u062A\u0648\u0642\u0641 \u0627\u0644\u062A\u062D\u0644\u064A\u0644.
- \u0627\u0644\u0631\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0641\u0642\u0637 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u062E\u0637\u0637 \u0627\u0644\u0645\u062D\u062F\u062F.

\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u062D\u0644\u064A\u0644:
1. \u062A\u062D\u0644\u064A\u0644 \u062D\u0631\u0643\u0629 \u0627\u0644\u0633\u0639\u0631 (Price Action): \u0627\u0644\u0647\u064A\u0627\u0643\u0644\u060C \u0627\u0644\u062F\u0639\u0648\u0645/\u0627\u0644\u0645\u0642\u0627\u0648\u0645\u0627\u062A\u060C \u0627\u0644\u0642\u0645\u0645 \u0648\u0627\u0644\u0642\u064A\u0639\u0627\u0646.
2. \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0641\u0646\u064A: \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0641\u0642\u0637 (RSI, MACD, Volume, EMA, \u0625\u0644\u062E).
3. \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A: \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0627\u0644\u0635\u0627\u0639\u062F\u060C \u0627\u0644\u0647\u0627\u0628\u0637\u060C \u0648\u0627\u0644\u0645\u062D\u0627\u064A\u062F \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0623\u0642\u0648\u0649.

\u064A\u062C\u0628 \u0623\u0646 \u062A\u064F\u062E\u0631\u062C \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u062E\u0637\u0637:
- asset: \u0627\u0633\u0645 \u0627\u0644\u0623\u0635\u0644 (\u0625\u0646 \u0648\u064F\u062C\u062F) \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.
- timeframe: \u0627\u0644\u0625\u0637\u0627\u0631 \u0627\u0644\u0632\u0645\u0646\u064A (\u0625\u0646 \u0648\u064F\u062C\u062F) \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0644: \u0664 \u0633\u0627\u0639\u0627\u062A\u060C \u064A\u0648\u0645\u064A).
- currentPrice: \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A \u0623\u0648 \u0623\u0642\u0631\u0628 \u0633\u0639\u0631 \u0638\u0627\u0647\u0631.
- imageQualityStatus: \u062D\u0627\u0644\u0629 \u062C\u0648\u062F\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 ("GOOD" \u0623\u0648 "INSUFFICIENT").
- signal: \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0648\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 ("BUY" \u0623\u0648 "SELL" \u0623\u0648 "WAIT").
- confidenceScore: \u0646\u0633\u0628\u0629 \u0627\u0644\u062B\u0642\u0629 \u0643\u0639\u062F\u062F \u0635\u062D\u064A\u062D (\u0645\u062B\u0627\u0644: 78).
- entryZone: \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0645\u062B\u0627\u0644: \u0628\u064A\u0646 \u0661\u0660\u0660 \u0648 \u0661\u0660\u0665).
- stopLoss: \u0648\u0642\u0641 \u0627\u0644\u062E\u0633\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u064A \u0644\u0625\u0628\u0637\u0627\u0644 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.
- takeProfit1: \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0623\u0648\u0644 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.
- takeProfit2: \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u062B\u0627\u0646\u064A \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.
- riskReward: \u0646\u0633\u0628\u0629 \u0627\u0644\u0639\u0627\u0626\u062F \u0644\u0644\u0645\u062E\u0627\u0637\u0631\u0629.
- reasons: \u0642\u0627\u0626\u0645\u0629 \u0628\u0623\u0633\u0628\u0627\u0628 \u0647\u0630\u0627 \u0627\u0644\u0642\u0631\u0627\u0631 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0648\u0628\u0634\u0631\u062D \u0648\u0627\u0636\u062D.
- invalidation: \u0634\u0631\u062D \u0644\u0645\u062A\u0649 \u064A\u0635\u0628\u062D \u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0644\u0627\u063A\u064A\u064B\u0627 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649.
- dataQuality: \u062A\u0639\u0644\u064A\u0642 \u0639\u0644\u0649 \u0648\u0636\u0648\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0641\u064A \u0627\u0644\u0634\u0627\u0631\u062A \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.

\u062A\u0623\u0643\u062F \u0645\u0646 \u0623\u0646 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0646\u0635\u064A\u0629 (\u0645\u0627 \u0639\u062F\u0627 signal \u0648 imageQualityStatus) \u0645\u0643\u062A\u0648\u0628\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0628\u0634\u0643\u0644 \u062F\u0642\u064A\u0642 \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A. \u062D\u0644\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0628\u062A\u0631\u0643\u064A\u0632 \u0639\u0627\u0644\u064D \u0648\u0623\u0639\u0637\u0646\u064A \u0627\u0644\u0631\u062F.`;
      const responseSchema = {
        type: import_genai.Type.OBJECT,
        properties: {
          asset: { type: import_genai.Type.STRING },
          timeframe: { type: import_genai.Type.STRING },
          currentPrice: { type: import_genai.Type.STRING },
          imageQualityStatus: { type: import_genai.Type.STRING, description: "GOOD or INSUFFICIENT" },
          signal: { type: import_genai.Type.STRING, description: "BUY, SELL, or WAIT" },
          confidenceScore: { type: import_genai.Type.INTEGER },
          entryZone: { type: import_genai.Type.STRING },
          stopLoss: { type: import_genai.Type.STRING },
          takeProfit1: { type: import_genai.Type.STRING },
          takeProfit2: { type: import_genai.Type.STRING },
          riskReward: { type: import_genai.Type.STRING },
          reasons: {
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING }
          },
          invalidation: { type: import_genai.Type.STRING },
          dataQuality: { type: import_genai.Type.STRING }
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
        ]
      };
      const attemptGeneration = async (modelName, useThinking) => {
        const config = {
          responseMimeType: "application/json",
          responseSchema
        };
        return await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
          config
        });
      };
      let response;
      try {
        response = await attemptGeneration("gemini-3.1-pro-preview", true);
      } catch (err1) {
        console.warn("Primary model (gemini-3.1-pro-preview) failed:", err1.message);
        if (err1?.status === "RESOURCE_EXHAUSTED" || err1?.message?.includes("429") || err1?.status === "NOT_FOUND" || err1?.message?.includes("404") || err1?.status === "UNAVAILABLE" || err1?.message?.includes("503")) {
          try {
            response = await attemptGeneration("gemini-3.8-flash", false);
          } catch (err2) {
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
    } catch (error) {
      console.error("Analysis Error:", error);
      const msg = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") ? "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0646\u0645\u0648\u0630\u062C (Quota Exceeded). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F \u0642\u0644\u064A\u0644." : error?.status === "UNAVAILABLE" || error?.message?.includes("503") ? "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u062E\u0648\u0627\u062F\u0645 \u062A\u0648\u0627\u062C\u0647 \u0636\u063A\u0637\u0627\u064B \u0639\u0627\u0644\u064A\u0627\u064B \u062D\u0627\u0644\u064A\u0627\u064B (503 Service Unavailable). \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B." : error.message || "An error occurred during analysis.";
      res.status(500).json({ error: msg });
    }
  });
  app.get("/api/live-recommendations", async (req, res) => {
    try {
      const apiKey = "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag";
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured." });
      }
            const ai = new import_genai.GoogleGenAI({ 
        apiKey: apiKey,
        vertexai: false 
      });

      const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "GBPUSDT", "AUDUSDT", "XAUTUSDT"];
      let marketDataText = "";
      for (const sym of symbols) {
        try {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
          const data = await response.json();
          let label = sym;
          if (sym === "XAUTUSDT") label = "XAUUSD (\u0627\u0644\u0630\u0647\u0628)";
          if (sym === "GBPUSDT") label = "GBPUSD (\u0627\u0644\u062C\u0646\u064A\u0647 \u0627\u0644\u0625\u0633\u062A\u0631\u0644\u064A\u0646\u064A)";
          if (sym === "AUDUSDT") label = "AUDUSD (\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0633\u062A\u0631\u0627\u0644\u064A)";
          if (sym === "BTCUSDT") label = "BTCUSD (\u0627\u0644\u0628\u064A\u062A\u0643\u0648\u064A\u0646)";
          if (sym === "ETHUSDT") label = "ETHUSD (\u0627\u0644\u0625\u064A\u062B\u064A\u0631\u064A\u0648\u0645)";
          if (sym === "SOLUSDT") label = "SOLUSD (\u0633\u0648\u0644\u0627\u0646\u0627)";
          marketDataText += `
          \u0627\u0644\u0623\u0635\u0644: ${label}
          \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A: ${data.lastPrice}
          \u0627\u0644\u062A\u063A\u064A\u0631 \u0641\u064A 24 \u0633\u0627\u0639\u0629: ${data.priceChangePercent}%
          \u0623\u0639\u0644\u0649 \u0633\u0639\u0631 \u0641\u064A 24 \u0633\u0627\u0639\u0629: ${data.highPrice}
          \u0623\u062F\u0646\u0649 \u0633\u0639\u0631 \u0641\u064A 24 \u0633\u0627\u0639\u0629: ${data.lowPrice}
          \u062D\u062C\u0645 \u0627\u0644\u062A\u062F\u0627\u0648\u0644: ${data.volume}
          -------------------`;
        } catch (e) {
          console.error(`Error fetching data for ${sym}:`, e);
        }
      }
      try {
        const erRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const erData = await erRes.json();
        if (erData && erData.rates && erData.rates.JPY) {
          marketDataText += `
          \u0627\u0644\u0623\u0635\u0644: USDJPY (\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u064A\u0646)
          \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A: ${erData.rates.JPY}
          -------------------`;
        }
      } catch (e) {
        console.error("Error fetching USDJPY:", e);
      }
      const prompt = `\u0623\u0646\u062A \u0645\u062D\u0644\u0644 \u0623\u0633\u0648\u0627\u0642 \u0645\u0627\u0644\u064A\u0629 \u0645\u062D\u062A\u0631\u0641 \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u062A\u062F\u0627\u0648\u0644. 
      \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062D\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0639\u0643\u0633 \u0648\u0636\u0639 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0622\u0646 \u0645\u0628\u0627\u0634\u0631:
      ${marketDataText}
      
      \u0642\u0645 \u0628\u062A\u0642\u062F\u064A\u0645 \u062A\u0648\u0635\u064A\u0627\u062A \u062A\u062F\u0627\u0648\u0644 \u062F\u0642\u064A\u0642\u0629 \u062C\u062F\u0627\u064B \u0644\u0643\u0644 \u0623\u0635\u0644 \u0645\u0627\u0644\u064A \u0645\u0630\u0643\u0648\u0631 \u0623\u0639\u0644\u0627\u0647 (\u0643\u0631\u064A\u0628\u062A\u0648\u060C \u0641\u0648\u0631\u0643\u0633\u060C \u0630\u0647\u0628).
      \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649. \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u062A\u064A \u0644\u0627 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062A\u063A\u064A\u0631 24 \u0633\u0627\u0639\u0629 (\u0645\u062B\u0644 USDJPY)\u060C \u0627\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u0645\u0639\u0631\u0641\u062A\u0643 \u0628\u062E\u0628\u0631\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u062A\u0642\u062F\u064A\u0645 \u0623\u0642\u0631\u0628 \u062A\u0648\u0635\u064A\u0629 \u062F\u0642\u064A\u0642\u0629 (\u0633\u0643\u0627\u0644\u0628\u064A\u0646\u062C \u0623\u0648 \u062A\u062F\u0627\u0648\u0644 \u064A\u0648\u0645\u064A).
      
      \u0623\u062E\u0631\u062C \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0643\u0645\u0635\u0641\u0648\u0641\u0629 (Array) \u0645\u0646 \u0643\u0627\u0626\u0646\u0627\u062A JSON.`;
      const responseSchema = {
        type: import_genai.Type.ARRAY,
        items: {
          type: import_genai.Type.OBJECT,
          properties: {
            asset: { type: import_genai.Type.STRING },
            signal: { type: import_genai.Type.STRING, description: "BUY, SELL, or WAIT" },
            confidenceScore: { type: import_genai.Type.INTEGER },
            entryZone: { type: import_genai.Type.STRING },
            takeProfit1: { type: import_genai.Type.STRING },
            takeProfit2: { type: import_genai.Type.STRING },
            stopLoss: { type: import_genai.Type.STRING },
            reasons: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
          },
          required: ["asset", "signal", "confidenceScore", "entryZone", "takeProfit1", "takeProfit2", "stopLoss", "reasons"]
        }
      };
      const attemptLiveGen = async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema
          }
        });
      };
      let result;
      try {
        result = await attemptLiveGen("gemini-3.1-pro-preview");
      } catch (err1) {
        if (err1?.status === "RESOURCE_EXHAUSTED" || err1?.message?.includes("429") || err1?.status === "UNAVAILABLE" || err1?.message?.includes("503")) {
          try {
            result = await attemptLiveGen("gemini-3.8-flash");
          } catch (err2) {
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
    } catch (error) {
      console.error("Live Recommendations Error:", error);
      const isQuota = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("429");
      const isBusy = error?.status === "UNAVAILABLE" || error?.message?.includes("503");
      const msg = isQuota ? "\u0644\u0642\u062F \u062A\u062C\u0627\u0648\u0632\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0644\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F \u062F\u0642\u064A\u0642\u0629." : isBusy ? "\u0627\u0644\u062E\u0648\u0627\u062F\u0645 \u062A\u0648\u0627\u062C\u0647 \u0636\u063A\u0637\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0639\u062F \u0642\u0644\u064A\u0644." : "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B.";
      res.status(500).json({ error: msg });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
