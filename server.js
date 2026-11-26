const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen3-4B:cheapest";
const HF_URL = "https://router.huggingface.co/v1/chat/completions";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: Boolean(HF_TOKEN), provider: "Hugging Face", model: HF_MODEL });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "Please send a message." });
  }
  if (!HF_TOKEN) {
    return res.status(503).json({ error: "NOVA's AI connection has not been configured by the site owner yet." });
  }

  const safe = messages
    .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-30)
    .map(m => ({ role: m.role, content: m.content.slice(0, 12000) }));

  try {
    const r = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + HF_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: "You are NOVA, a helpful, clear, friendly personal AI assistant. Be accurate, explain uncertainty, and keep responses age-appropriate." },
          ...safe
        ],
        max_tokens: 700,
        stream: false
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: data.error || "The AI provider could not answer. Check provider access and credits." });
    }
    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof reply !== "string") {
      return res.status(502).json({ error: "The AI provider returned an unexpected response." });
    }
    res.json({ reply });
  } catch (_error) {
    res.status(502).json({ error: "Could not reach the AI provider. Please try again." });
  }
});

app.listen(PORT, () => console.log("NOVA AI listening on port " + PORT));
