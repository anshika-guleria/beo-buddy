# 👻 Boo-buddy

### A tiny desktop ghost with a soft spot for your tiny wins.

Boo-buddy is a floating desktop companion powered by a local AI model running on [Ollama](https://ollama.com/). It can cheer you on, react when you poke it, answer a whisper, and get sleepy after midnight.

> **Free to use. No paid services, subscriptions, API keys, or accounts required.**
> Internet access is needed to download the app dependencies and a model. After setup, Boo-buddy and its downloaded model can run offline.

<p align="center">
  <b>🌙 A shy ghost · 🧡 Local AI · 🔒 Your prompts stay on your machine · ✨ Plain JavaScript</b>
</p>

---

## ✨ Contents

- [Quick start](#-quick-start)
- [Meet Boo-buddy](#-meet-boo-buddy)
- [Choose a model](#-choose-a-model)
- [Privacy and offline use](#-privacy-and-offline-use)
- [Build the installer](#-build-the-installer)
- [Optional website](#-optional-website)
- [Project map](#-project-map)

---

## 🚀 Quick start

These steps work on Windows, macOS, and Linux. PowerShell examples are shown.

### 1. Install the prerequisites

- **Node.js 22:** download it from [nodejs.org](https://nodejs.org/).
- **Ollama:** install it from [ollama.com/download](https://ollama.com/download).

### 2. Download the default model

In PowerShell or Terminal, run:

```powershell
ollama pull gemma3:1b
```

### 3. Install and launch Boo-buddy

Open a terminal in the project folder and run:

```powershell
npm install
npm start
```

Download an installer from [Releases](https://github.com/anshika-guleria/beo-buddy/releases) to use Boo-buddy without running it from source. Ollama and a model are still required.

---

## 👻 Meet Boo-buddy

Boo-buddy is a floating desktop ghost with six friends: **Boo-ddy** (pink and shy), **Violet** (lavender), **Pumpkin** (autumn orange), **Batty** (spooky blue), **Cozy** (comforting green), and **Whisper** (quiet berry). Each has colorful Día de los Muertos sugar-skull art and a classic-face version.

Click Boo-buddy to chat, or drag it to a new spot. It checks in at adjustable intervals and wanders after five minutes without interaction. Its moods include cheery, sleepy, spooked, lonely, proud, spooky, and marigold; they respond to the time, your interactions, and clipboard text you choose to share. The tray lets you pick a mood, set quiet hours, mute Boo-buddy, and choose when it checks in.

### Controls

| Action | How |
|---|---|
| Change friend | **Ctrl+Shift+G** (Windows/Linux) or **Command+Shift+G** (macOS), or choose **Pick a friend** in the tray |
| Toggle sugar-skull art | **Ctrl+Shift+M** (Windows/Linux) or **Command+Shift+M** (macOS) |
| Dance with a short festive tune | **Ctrl+Shift+D** (Windows/Linux) or **Command+Shift+D** (macOS); lasts 10 seconds |
| Open the shortcut guide | Click the candle; press **Escape** to close |
| Share clipboard text | Choose **Show my clipboard** in the tray or press **Ctrl+Shift+B** (Windows/Linux) / **Command+Shift+B** (macOS) |

Clipboard text is read only when you choose to share it; up to 300 characters go to your local model.

---

## 🧠 Choose a model

Choose one of these models from the tray menu:

| Model | Notes |
|---|---|
| `gemma3:1b` | Default |
| `gemma3:4b` | Larger model |
| `llama3.2:1b` | Alternative |
| `qwen2.5:1.5b` | Alternative |

Download a model before selecting it:

```powershell
ollama pull qwen2.5:1.5b
```

---

## 🔒 Privacy and offline use

Ollama runs the selected model on your computer; chat is sent to its local service, not a hosted AI API. Boo-buddy does not read your screen. Clipboard text is shared only when you ask. After downloading the app and model, you can use Boo-buddy offline.

---

## 📦 Build the installer

From the project directory, install dependencies and build for your current operating system:

```powershell
npm install
npm run dist
```

The installer appears in `dist/`. `electron-builder` is already included as a development dependency. GitHub release builds run for version tags matching `v*`.

---

## 🌐 Optional website

The landing page is in [`site/`](site/) and is deployed with the GitHub Pages workflow.

---

## 🧰 Project map

| File/folder | What lives there |
|---|---|
| `main.js` | Electron window, tray menu, settings, character selection, mood timers, local Ollama requests |
| `preload.js` | Small, controlled IPC bridge between Electron and the UI |
| `renderer/` | Pet HTML, CSS animations, renderer JavaScript, and ghost artwork |
| `renderer/ghosts/` | Six sugar-skull designs and their classic-face versions |
| `renderer/fonts/` | Bundled Nunito font files and their open font license |
| `site/` | Static landing page for GitHub Pages |
| `docs/` | Ollama and AI guide and project write-up |
| `.github/workflows/` | Release builds and GitHub Pages deployment |

## 🛠️ Built with

Electron · JavaScript · HTML · CSS · Ollama
