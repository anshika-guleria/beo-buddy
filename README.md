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
- [Troubleshooting](#-troubleshooting)
- [Build the installer](#-build-the-installer)
- [Optional website](#-optional-website)
- [Project map](#-project-map)

---

## 🚀 Quick start

These steps work on Windows, macOS, and Linux. PowerShell examples are shown.

### 1. Install the free prerequisites

- **Node.js 22.12 or newer:** download the LTS version from [nodejs.org](https://nodejs.org/).
- **Ollama:** install it from [ollama.com/download](https://ollama.com/download).

Node.js runs Boo-buddy and installs its development dependencies. Ollama runs the language model on your computer.

### 2. Download the default model

Open PowerShell or Terminal and run:

```powershell
ollama pull gemma3:1b
```

This downloads Gemma 3 1B. Check that the model is installed with:

```powershell
ollama list
```

Ollama usually starts in the background when installed. If it is not running, start it in a separate terminal and leave that terminal open:

```powershell
ollama serve
```

If Ollama reports that the port is already in use, it is likely already running.

### 3. Install and launch Boo-buddy

Open a terminal in the project folder. For example, if it is in your Downloads folder:

```powershell
cd "$HOME\Downloads\Boo-buddy"
npm install
npm start
```

Run `npm install` once after getting the project. Later, launch it with `npm start`.

Boo-buddy appears near the bottom-right of your screen. Its tray icon is in the Windows notification area (check the `^` hidden-icons menu if needed) or the macOS menu bar.

### Using the Windows installer

If you already have **Boo-buddy Setup 1.0.0.exe**, run it and follow the prompts. Ollama and a model are still required; install Ollama and run `ollama pull gemma3:1b` before launching Boo-buddy.

For detailed Ollama setup, model selection, AI usage, and privacy information, see the [Ollama and AI guide](docs/ollama-ai-guide.md).

---

## 👻 Meet Boo-buddy

Boo-buddy has six selectable ghost friends and a handful of moods:

| Mood | Boo-buddy's vibe |
|---|---|
| ✨ **Cheery** | A little sparkle and encouragement |
| 🌙 **Sleepy** | Yawns between midnight and 5 AM |
| 😱 **Spooked** | Gets startled by repeated pokes |
| 💜 **Lonely** | Offers a soft hello when you return |
| 🎃 **Spooky** | Halloween glow from October 25–31 |

### Controls

| Action | How |
|---|---|
| Poke Boo-buddy and open the whisper box | Click the ghost |
| Move Boo-buddy | Drag the ghost |
| Change ghost | **Ctrl+Shift+G** (Windows/Linux) or **Command+Shift+G** (macOS); the tray also has **Pick a friend** |
| Toggle the sugar-skull masks | **Ctrl+Shift+M** (Windows/Linux) or **Command+Shift+M** (macOS) |
| View the ghost shortcuts | Click the candle; press **Escape** to close the guide |
| Share clipboard text | Choose **Show my clipboard** in the tray or press **Ctrl+Shift+B** (Windows/Linux) / **Command+Shift+B** (macOS) |

The clipboard is read only after you explicitly choose to share it, and at most 300 characters are sent to the local model.

Each ghost has coordinated colors, a signature prop, a sugar-skull mask option, and a classic face option. The masks have large floral eyes, colorful face-paint details, a small smile, and one large flower on the upper-right of the head. The candle flickers when masks are on and gently smokes when they are off. Movement is intentionally gentle: a slow idle float and a soft squash when you poke the character.

---

## 🧠 Choose a model

`gemma3:1b` is the recommended starting point. Other models available in the tray menu:

| Model | Notes |
|---|---|
| `gemma3:1b` | Default; smaller and a good starting point |
| `gemma3:4b` | Larger Gemma; may need more memory and run more slowly |
| `llama3.2:1b` | Alternative small model |
| `qwen2.5:1.5b` | Alternative compact model |

Download a model before selecting it. For example:

```powershell
ollama pull qwen2.5:1.5b
```

Then choose **Pick model** from the tray menu. All listed models are free to download and run locally; model size affects download size, memory use, and response speed.

### Compare models

To compare the four listed models on your computer, download them and run:

```powershell
ollama pull gemma3:1b
ollama pull gemma3:4b
ollama pull llama3.2:1b
ollama pull qwen2.5:1.5b
npm run compare
```

The script sends six prompts per model to your local Ollama server and records actual replies, response times, word counts, and rule compliance in [`docs/model-comparison.md`](docs/model-comparison.md). Keep Ollama running during the comparison. If a model is missing or Ollama is unavailable, the report records the error rather than inventing results.

---

## 🔒 Privacy and offline use

- Ollama chat requests go from Electron's main process to `http://localhost:11434` on your computer.
- Boo-buddy does not use a paid AI API, remote AI service, analytics, accounts, or API keys.
- The app does not read your screen or window titles.
- Clipboard text is read only after you explicitly choose **Show my clipboard** or press its shortcut; at most 300 characters are sent to the local model.
- Internet access is needed for initial downloads (Ollama, Node.js, npm packages, and the model). Once installed and downloaded, the app and model can work with Wi-Fi off.
- Your computer's hardware and electricity are still needed; model downloads use disk space and may use significant memory.

---

## 🛟 Troubleshooting

### Boo-buddy says Ollama isn't running

1. Make sure the Ollama app is open.
2. Run `ollama list` and confirm `gemma3:1b` is listed.
3. If necessary, start Ollama with `ollama serve` in another terminal.
4. If the model is missing, run `ollama pull gemma3:1b`.

Boo-buddy requires Ollama for AI replies. It does not substitute prewritten quips when Ollama is unavailable or the selected model returns an unusable reply. Check that Ollama is running and the selected model is installed, then try again.

### `ollama` or `npm` is not recognized

Install Ollama and Node.js using the links above, then close and reopen your terminal so it picks up the updated PATH. Check the installations with:

```powershell
ollama --version
node --version
npm --version
```

### The ghost is slow or the model does not fit

`gemma3:4b` needs more memory than `gemma3:1b`. Switch to `gemma3:1b` in the tray menu. The first reply after starting a model may take longer while Ollama loads it.

### Linux: transparent window looks blank

Try launching with:

```sh
npm start -- --enable-transparent-visuals --disable-gpu
```

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

The static landing page is in [`site/`](site/). GitHub Pages can host it at a free `github.io` address; a custom domain is optional and may cost money. You do not need to buy a domain to use Boo-buddy or publish the project.

### Publish with GitHub Pages

1. Push the project to a GitHub repository and update the example `YOUR-NAME` links in `site/index.html`.
2. If you do not own a custom domain, remove the placeholder `site/CNAME` file before publishing.
3. In repository settings, open **Pages** and enable GitHub Actions as the publishing source.
4. Push to the `main` branch. The workflow publishes `site/` to `https://YOUR-NAME.github.io/boo-buddy/`.

You can optionally configure a domain you already own in GitHub Pages settings; purchasing one is not required.

---

## 🧰 Project map

| File/folder | What lives there |
|---|---|
| `main.js` | Electron window, tray menu, settings, character selection, mood timers, local Ollama requests |
| `preload.js` | Small, controlled IPC bridge between Electron and the UI |
| `renderer/` | Pet HTML, CSS animations, renderer JavaScript, and ghost artwork |
| `renderer/ghosts/` | Six masked ghost designs and their classic-face versions |
| `renderer/fonts/` | Bundled Nunito font files and their open font license |
| `scripts/compare-models.js` | Local model measurement script |
| `site/` | Static landing page for GitHub Pages |
| `docs/` | Ollama and AI guide, write-up, demo narration, sessions template, and comparison output |
| `.github/workflows/` | Release builds and GitHub Pages deployment |

## 🛠️ Built with

Electron · Vanilla JavaScript · HTML · CSS · Inline SVG · Ollama · Gemma

No frontend framework, Python, paid service, or remote inference API is required.

The six ghost illustrations are adapted from the `tap-the-ghosts.html` artwork provided with this project. Check the original artwork's license and include any required attribution before redistributing this app.
