# 👻 Boo-buddy

### A tiny desktop ghost with a soft spot for your tiny wins.

Boo-buddy is a cute floating desktop pet powered by an AI model running **locally on your computer** with Ollama. It can cheer you on, react when you poke it, answer a little whisper, and get sleepy after midnight.

> **Free to use. No paid services, subscriptions, API keys, or accounts required.**
> You will need an internet connection once to download the app dependencies and a model. After that, Boo-buddy and its downloaded model can run offline.

<p align="center">
  <b>🌙 A shy ghost · 🧡 Local AI · 🔒 Your prompts stay on your machine · ✨ Plain JavaScript</b>
</p>

---

## 🪄 Quick start

Follow these steps on Windows, macOS, or Linux. Windows PowerShell examples are shown below.

### 1. Install the free prerequisites

- **Node.js 20 or newer:** install the LTS version from [nodejs.org](https://nodejs.org/).
- **Ollama:** install it from [ollama.com/download](https://ollama.com/download).

Both are free. Ollama runs the language model on your computer; Node.js is needed to run the project and install its development dependencies.

### 2. Download Boo-buddy's model

Open PowerShell (Windows) or Terminal (macOS/Linux) and run:

```powershell
ollama pull gemma3:1b
```

This downloads Gemma 3 1B, Boo-buddy's default model. The download can take a little while. You can check that it is installed with:

```powershell
ollama list
```

If Ollama isn't already running in the background, start it in a separate terminal and leave that terminal open:

```powershell
ollama serve
```

If Ollama says the port is already in use, it is probably running already—continue to the next step.

### 3. Install and start Boo-buddy

Open a terminal in the Boo-buddy project folder. In PowerShell, if the folder is in your Downloads folder, for example:

```powershell
cd "$HOME\Downloads\Boo-buddy"
npm install
npm start
```

Run `npm install` once after getting the project. Later, start Boo-buddy from the same folder with:

```powershell
npm start
```

Boo-buddy appears near the bottom-right of your screen. Its tray icon is in the Windows notification area (you may need to open the `^` hidden-icons menu). On macOS, look in the menu bar.

### Want the ready-made Windows installer?

If you already have the installer, double-click **Boo-buddy Setup 1.0.0.exe** and follow its prompts. You still need Ollama and a model: install Ollama, run `ollama pull gemma3:1b`, and then open Boo-buddy from the Start menu.

For step-by-step Ollama setup, model selection, AI usage, privacy details, and troubleshooting, see the [Ollama and AI guide](docs/ollama-ai-guide.md).

---

## 👻 Meet your ghost

| Mood | Boo-buddy's vibe |
|---|---|
| ✨ **Cheery** | A little sparkle and encouragement |
| 🌙 **Sleepy** | Yawns between midnight and 5 AM |
| 😱 **Spooked** | Gets startled by repeated pokes |
| 🏆 **Proud** | Celebrates a tiny win in text you choose to share |
| 💜 **Lonely** | Offers a soft hello when you return |
| 🎃 **Spooky** | Halloween glow from October 25–31 |
| 🌼 **Marigold** | Warm candlelight from November 1–2 |

### Pick your ghost

Click the bat-wing bow beside the character to cycle through six ghost stickers adapted from the `tap-the-ghosts.html` artwork supplied for this project: Boo-ddy, Violet, Pumpkin, Batty, Cozy, and Whisper. Each click changes to the next ghost, and your choice is saved. You can also choose a design from the tray's **Pick a friend** menu.

The stickers have different Halloween colors and costumes. The movement is intentionally gentle: a slow idle float and one soft squash when you poke the character.

### How to interact

- **Click the ghost:** give it a gentle poke and open the whisper box.
- **Tray icon:** mute, select a model, set quiet hours, choose a mood for a demo, ask Boo to sleep, explicitly share clipboard text, or quit.
- **Clipboard shortcut:** `Ctrl+Shift+B` on Windows/Linux or `Command+Shift+B` on macOS. This shares up to 300 characters only when you press the shortcut.

The ghost floats above other windows and ignores clicks when you are not interacting with it. Move it by dragging.

---

## 🧠 Choosing a model

The default `gemma3:1b` is the recommended quick start. Other models available in the tray menu are:

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

Then choose **Pick model** from Boo-buddy's tray menu. Model size affects download size, memory use, and response speed; all listed choices are free to download and run locally.

### Compare the models

To measure the four listed models on your own computer, download them and run:

```powershell
ollama pull gemma3:1b
ollama pull gemma3:4b
ollama pull llama3.2:1b
ollama pull qwen2.5:1.5b
npm run compare
```

The script sends six prompts per model to your local Ollama server and records actual replies, response times, word counts, and rule compliance in [`docs/model-comparison.md`](docs/model-comparison.md). Keep Ollama running during the comparison. If a model is missing or Ollama is unavailable, the report records the error instead of inventing results.

---

## 🛟 Troubleshooting

### Boo-buddy says Ollama isn't running

1. Make sure the Ollama app is open.
2. In PowerShell, run `ollama list` and confirm `gemma3:1b` is listed.
3. If necessary, start Ollama with `ollama serve` in another terminal.
4. If the model is missing, run `ollama pull gemma3:1b`.

Boo-buddy requires Ollama for AI replies. It will not substitute prewritten quips if Ollama is unavailable or the selected model returns an unusable reply; check that Ollama is running and the selected model is installed, then try again.

### `ollama` or `npm` is not recognized

Install Ollama and Node.js using the links above, then close and reopen your terminal so it picks up the updated PATH. Check the installs with:

```powershell
ollama --version
node --version
npm --version
```

### The ghost is slow or the model does not fit

The larger `gemma3:4b` needs more memory than `gemma3:1b`. Switch back to `gemma3:1b` in the tray menu. The first reply after starting a model may take longer while Ollama loads it.

### Linux: transparent window looks blank

Try launching with:

```sh
npm start -- --enable-transparent-visuals --disable-gpu
```

---

## 🔒 Privacy, offline use, and cost

- All Ollama chat requests go from Electron's main process to `http://localhost:11434` on your own computer.
- Boo-buddy does not use a paid AI API, remote AI service, analytics, accounts, or API keys.
- The app does not read your screen or window titles.
- Clipboard text is read only after you explicitly choose **Show my clipboard** or press the shortcut; at most 300 characters are sent to the local model.
- Internet access is needed for initial downloads (Ollama, Node.js, npm packages, and the model). Once installed/downloaded, the app and model can work with Wi-Fi off.
- Your computer's hardware and electricity are still needed; model downloads use disk space and may use significant memory.

---

## 📦 Build the installer yourself

From the project directory, install dependencies and build for your current operating system:

```powershell
npm install
npm run dist
```

The build appears in `dist/`. electron-builder is already included as a development dependency. GitHub release builds run for version tags matching `v*`.

## 🌐 Optional free website

The static landing page is in [`site/`](site/). GitHub Pages can host it at a free `github.io` address; a custom domain is optional and may cost money. You do not need to buy a domain to use Boo-buddy or publish the project. For setup details, see the GitHub Pages section below.

### Publish the page with GitHub Pages

1. Push the project to a GitHub repository and update the example `YOUR-NAME` links in `site/index.html`.
2. If you do not own a custom domain, remove the placeholder `site/CNAME` file before publishing.
3. In the repository, open **Settings → Pages** and enable GitHub Actions as the publishing source.
4. Push to the `main` branch. The workflow publishes `site/` to `https://YOUR-NAME.github.io/boo-buddy/`.

You can optionally configure a domain you already own in GitHub Pages settings; purchasing one is not required.

---

## 🧰 Project map

| File/folder | What lives there |
|---|---|
| `main.js` | Electron window, tray menu, settings, character selection, mood timers, local Ollama requests |
| `preload.js` | Small, controlled IPC bridge between Electron and the UI |
| `renderer/ghosts/` | Six separate SVG ghost stickers used by the character switch |
| `renderer/` | Pet HTML, CSS animations, and renderer JavaScript |
| `renderer/fonts/` | Bundled Nunito font files and their open font license |
| `scripts/compare-models.js` | Local model measurement script |
| `site/` | Static landing page for GitHub Pages |
| `docs/` | Ollama and AI guide, write-up draft, demo narration, sessions template, comparison output |
| `.github/workflows/` | Release builds and GitHub Pages deployment |

## 🛠️ Stack

Electron · Vanilla JavaScript · HTML · CSS · Inline SVG · Ollama · Gemma

No frontend framework, Python, paid service, or remote inference API is required.

The six ghost illustrations are adapted from the `tap-the-ghosts.html` artwork provided with this project. Check the original artwork's license and include any required attribution before redistributing this app.
