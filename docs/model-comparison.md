# Local model comparison

Measured 2026-10-28T05:48:44.757Z against Ollama at localhost. Each model received the same six prompts; errors are retained rather than replaced with invented results.

| Model | Trigger | Reply | Words | Latency (ms) | Rules obeyed | Error |
|---|---|---|---:|---:|:---:|---|
| gemma3:1b | idle | — | 0 | 193 | — | fetch failed |
| gemma3:1b | midnight | — | 0 | 6 | — | fetch failed |
| gemma3:1b | clipboard | — | 0 | 5 | — | fetch failed |
| gemma3:1b | whisper | — | 0 | 5 | — | fetch failed |
| gemma3:1b | click | — | 0 | 6 | — | fetch failed |
| gemma3:1b | startup | — | 0 | 4 | — | fetch failed |
| gemma3:4b | idle | — | 0 | 5 | — | fetch failed |
| gemma3:4b | midnight | — | 0 | 4 | — | fetch failed |
| gemma3:4b | clipboard | — | 0 | 8 | — | fetch failed |
| gemma3:4b | whisper | — | 0 | 5 | — | fetch failed |
| gemma3:4b | click | — | 0 | 4 | — | fetch failed |
| gemma3:4b | startup | — | 0 | 4 | — | fetch failed |
| llama3.2:1b | idle | — | 0 | 3 | — | fetch failed |
| llama3.2:1b | midnight | — | 0 | 3 | — | fetch failed |
| llama3.2:1b | clipboard | — | 0 | 3 | — | fetch failed |
| llama3.2:1b | whisper | — | 0 | 3 | — | fetch failed |
| llama3.2:1b | click | — | 0 | 3 | — | fetch failed |
| llama3.2:1b | startup | — | 0 | 4 | — | fetch failed |
| qwen2.5:1.5b | idle | — | 0 | 3 | — | fetch failed |
| qwen2.5:1.5b | midnight | — | 0 | 3 | — | fetch failed |
| qwen2.5:1.5b | clipboard | — | 0 | 4 | — | fetch failed |
| qwen2.5:1.5b | whisper | — | 0 | 5 | — | fetch failed |
| qwen2.5:1.5b | click | — | 0 | 3 | — | fetch failed |
| qwen2.5:1.5b | startup | — | 0 | 3 | — | fetch failed |

## Summary

- gemma3:1b: no successful replies; rules compliance not measured (0/6 prompts completed); median latency unavailable.
- gemma3:4b: no successful replies; rules compliance not measured (0/6 prompts completed); median latency unavailable.
- llama3.2:1b: no successful replies; rules compliance not measured (0/6 prompts completed); median latency unavailable.
- qwen2.5:1.5b: no successful replies; rules compliance not measured (0/6 prompts completed); median latency unavailable.

Run `npm run compare` with Ollama running and all four models downloaded to refresh these measurements.
