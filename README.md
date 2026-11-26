# NOVA AI

A ChatGPT-style personal assistant that runs locally on your computer. The browser stores chat history locally, and the app sends prompts to Ollama running on your own computer. It does not use a cloud AI API.

## Requirements
- Node.js 18 or newer
- [Ollama](https://ollama.com/) installed and running

## Setup
1. Install Ollama from https://ollama.com/.
2. Download a starter model:
   ```bash
   ollama pull llama3.2:3b
   ```
3. In this project folder, install dependencies:
   ```bash
   npm install
   ```
4. Start NOVA:
   ```bash
   npm start
   ```
5. Open http://localhost:3000.

Ollama normally listens at http://127.0.0.1:11434. Set the OLLAMA_URL environment variable if your local Ollama service uses a different address.

## Privacy
- Chat history is stored in this browser's local storage.
- Messages are sent to the Ollama service configured on your computer.
- No cloud AI API key is required.
- Clearing browser site data clears saved chats. Other people with access to your browser profile may be able to see them.

GitHub stores the source code; it does not host or run the AI app.
