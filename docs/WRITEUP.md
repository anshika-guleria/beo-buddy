# Boo-buddy: write-up draft

## 1. What it is

Boo-buddy is a tiny desktop ghost who offers gentle, context-aware encouragement using a model that runs locally. It is a playful pet, a small experiment in open AI, and a reminder that software can feel personal without sending your data away.

**Demo GIF:** TODO — add a real capture of Boo-buddy in action.

## 2. Why open innovation matters here

Boo-buddy works with Wi-Fi turned off because the language model runs on the same machine. Nothing in the app is sent to a remote service, there are no API keys or accounts, and the software costs $0 to run apart from the user's hardware and electricity. You can swap models, edit the personality prompt, and keep using the app even if a hosted service shuts down.

## 3. How I used Gemma

I chose Gemma because it is an open-weight model that can be run locally with Ollama. I tried `gemma3:1b` and `gemma3:4b`, alongside `llama3.2:1b` and `qwen2.5:1.5b`.

Run `npm run compare` with those models installed to generate the measured comparison in [model-comparison.md](./model-comparison.md). Do not publish placeholder values as results.

**Prompt tweaks needed for Gemma:** TODO — record prompt changes observed during real testing.

## 4. Live site

TODO — add the free GitHub Pages URL (`https://YOUR-NAME.github.io/boo-buddy/`). A custom `.tech` domain is optional and may cost money; it is not required to publish or use this project.

## 5. Narration

Record the demo voiceover yourself or use a free local recording tool; no paid narration service is required. The app itself stays offline. See [NARRATION.md](./NARRATION.md).

## 6. How I built it

See [SESSIONS.md](./SESSIONS.md) for links to the shared coding sessions and what changed by hand.

## 7. Where open beat closed

TODO — describe what local models made possible, and where a hosted closed service would have been more convenient.

## 8. What's next

TODO — add real next steps after trying the app on supported platforms.
