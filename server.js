const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error("Ollama unavailable");
    const data = await r.json();
    res.json({ ok: true, models: (data.models || []).map(m => m.name) });
  } catch {
    res.status(503).json({ ok: false, message: "Ollama is not running." });
  }
});

app.post("/api/chat", async (req, res) => {
  const { messages, model } = req.body || {};
  if (!Array.isArray(messages) || !messages.length)
    return res.status(400).json({ error: "Please send a message." });

  const safe = messages
    .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
    .slice(-30)
    .map(m => ({ role: m.role, content: m.content.slice(0, 12000) }));

  try {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: typeof model === "string" && model.trim() ? model.trim() : "llama3.2:3b",
        messages: [
          { role: "system", content: "You are NOVA, a helpful, clear, friendly personal AI assistant. Be accurate, explain uncertainty, and keep responses age-appropriate." },
          ...safe
        ],
        stream: false
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error || "The local model could not answer." });
    res.json({ reply: data.message?.content || "I couldn't generate a response." });
  } catch {
    res.status(503).json({ error: "Cannot reach Ollama. Start Ollama on this computer and try again." });
  }
});

app.listen(PORT, () => console.log(`NOVA AI running at http://localhost:${PORT}`));
