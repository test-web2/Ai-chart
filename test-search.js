const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6JJ5RToWcNfsxp0uFX7-QBL-akzBzTRoo9rZp9MeiURag" });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Get the current live price of Gold (XAUUSD) and output JSON with { price: string }",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    console.log("SUCCESS:", res.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
