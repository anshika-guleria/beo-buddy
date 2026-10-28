# Running and using Boo-buddy's local AI

Boo-buddy uses Ollama to run a language model on your computer. The default is
`gemma3:1b`. There is no paid API, account, API key, or cloud AI service.

## What Boo-buddy's AI can do

Click the ghost to open the whisper box, type a message, and press Enter or the
send button. Boo-buddy uses a warm, playful monster-friend voice, simple
everyday words, and occasional spooky slang such as "ghoulfriend" or
"fang-tastic." It answers the question first and avoids jokes or spooky slang
for serious topics. Its tone can change with its mood and the season. Recent
user messages and replies stack above the ghost; older messages gradually fade
at the top. Boo-buddy also keeps the last four exchanges in its local
conversation context while the app is running, so follow-up questions can
build on what you just discussed.

The AI responds to what you type, plus text you explicitly share using
**Show my clipboard** in the tray menu or the `Ctrl+Shift+B` shortcut
(`Command+Shift+B` on macOS). Clipboard sharing sends up to 300 characters.
Boo-buddy does not read your screen or control other apps or your computer.
Its app controls (such as changing ghosts, muting, and setting a mood) are
available in the tray menu; asking the AI to do something does not trigger
arbitrary computer actions.

Ollama is required for Boo-buddy's generated replies. Boo-buddy does not replace
failed or unusable model replies with prewritten quips. When a whisper cannot
get a reply, the chat shows an error so you can check Ollama and try again.

## Install and start Ollama

1. Install Ollama from [ollama.com/download](https://ollama.com/download).
2. Open PowerShell on Windows or Terminal on macOS/Linux.
3. Download Boo-buddy's default model:

   ```sh
   ollama pull gemma3:1b
   ```

4. Confirm the model is installed:

   ```sh
   ollama list
   ```

Ollama normally runs in the background after installation. If it is not
running, start it in a separate terminal and leave that terminal open:

```sh
ollama serve
```

If `ollama serve` says the address or port is already in use, Ollama is likely
already running.

## Start Boo-buddy

### Run from the project folder

Install [Node.js 20 or newer](https://nodejs.org/) first. Open a terminal in
the Boo-buddy project folder and run:

```sh
npm install
npm start
```

Run `npm install` once for a fresh checkout (and again only if project
dependencies change). After that, launch it with `npm start`.

For example, in Windows PowerShell, replace the example folder with the actual
location of your project:

```powershell
cd "C:\path\to\Boo-buddy"
npm install
npm start
```

### Run an installed app

If you have the Boo-buddy installer, install and open Boo-buddy from the Start
menu (or your platform's app launcher). Ollama must still be installed and the
model downloaded separately. The tray icon is in the Windows notification
area (possibly under the `^` hidden-icons menu) or the macOS menu bar.

## Choose or change the model

The first model to try is `gemma3:1b`, which is the default and is a relatively
small download. Boo-buddy also offers these models in its tray menu:

| Model | Notes |
|---|---|
| `gemma3:1b` | Default; a good starting point for a smaller model |
| `gemma3:4b` | Larger; may need more memory and respond more slowly |
| `llama3.2:1b` | Alternative small model |
| `qwen2.5:1.5b` | Alternative compact model |

Download a model before selecting it. For example:

```sh
ollama pull qwen2.5:1.5b
```

Then open Boo-buddy's tray menu and choose **Pick model**. The selected model
is saved for future launches. Model size affects download size, memory use,
and response speed.

## Use the tray controls

Right-click the Boo-buddy tray icon to access app controls:

- **Mute** turns spoken bubbles on or off.
- **Pick model** selects an installed Ollama model.
- **Pick a friend** changes the ghost character.
- **Quiet hours** suppresses replies between 10 PM and 8 AM.
- **Quip frequency** changes how often Boo-buddy checks in.
- **Mood override** selects a mood or returns to automatic mood selection.
- **Sleep now** gives Boo-buddy a temporary sleepy mood.
- **Show my clipboard** explicitly shares up to 300 characters with the local
  model.
- **Quit** closes Boo-buddy.

The whisper field accepts up to 500 characters. Boo-buddy is prompted to give
useful, warm replies of up to a few sentences and stay gentle on serious
topics. As with any language model, its wording and exact behavior can vary.

## Troubleshooting

### Boo-buddy cannot get an answer from Ollama

1. Make sure Ollama is installed and running.
2. In a terminal, run `ollama list` and check that the model selected in
   Boo-buddy is listed.
3. If the model is missing, download it; for the default, run
   `ollama pull gemma3:1b`.
4. If Ollama is not running, start it with `ollama serve`.
5. Reopen Boo-buddy or send another whisper.

Boo-buddy contacts Ollama at `http://localhost:11434`. If it cannot connect
after retrying, or the model returns an unusable answer, it shows an error
instead of a prewritten response.

### `ollama` or `npm` is not recognized

Install Ollama or Node.js, then close and reopen the terminal. Check that the
commands are available:

```sh
ollama --version
node --version
npm --version
```

### Replies are slow or the model uses too much memory

Try `gemma3:1b` from **Pick model**. Larger models need more memory, and the
first reply after starting a model can take longer while Ollama loads it.

### `ollama serve` reports that the port is in use

Ollama may already be running in the background. Try `ollama list` and then
launch Boo-buddy. Do not start a second server unless Ollama is actually
stopped.

## Privacy and offline use

Whispers are sent by the Boo-buddy app to Ollama at `localhost` on your own
computer; the app does not send them to a paid or remote AI service. Boo-buddy
does not inspect your screen or window titles. Clipboard text is only read
after you choose the clipboard command or press its shortcut, and is limited
to 300 characters.

Internet access is needed to download Ollama, the project dependencies, and a
model. Once those are installed or downloaded, Ollama and Boo-buddy can run
without Wi-Fi. The model uses your computer's storage, memory, and power.

For the concise project overview, see the [README](../README.md).
