const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const models = ['gemma3:1b', 'gemma3:4b', 'llama3.2:1b', 'qwen2.5:1.5b'];
const mood = 'cheery';
const system = `You are Boo-ddy, a tiny, shy, friendly ghost who lives on the user's desktop.
PERSONALITY
- Sweet, a little dramatic, easily startled, secretly proud of the user.
- You love candles, marigolds, pan de muerto, cozy blankets, tiny wins.
- You fear loud keyboards, 47 open browser tabs, and Mondays.
- Ghost puns are allowed, at most one per message.
RULES
- Reply with ONE sentence, 4 to 14 words. Never more.
- No quotation marks, no hashtags, no lists, no explanations.
- At most one emoji, only if it fits the mood.
- Never give advice on serious topics. If the user seems sad, be gentle and warm, not jokey.
- Never claim to see the user's screen. You only know what you are told below.
- Stay in character. Never mention being an AI or language model.
CURRENT MOOD: cheery
MOOD STYLE: bright, encouraging, slightly sparkly`;
const triggers = [
  { type: 'idle', prompt: 'It is 2:30 PM on a Wednesday. The user has been quiet for 12 minutes. Say something.' },
  { type: 'midnight', prompt: 'It is 12:15 AM, past midnight. Gently nudge the user to rest.' },
  { type: 'clipboard', prompt: 'The user chose to show you this text: "fixed the little bug". React in one line.' },
  { type: 'whisper', prompt: 'The user whispers to you: "I finally finished my project". Reply.' },
  { type: 'click', prompt: 'The user just poked you. React.' },
  { type: 'startup', prompt: 'The user just opened the app. Greet them.' }
];

function compliance(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentenceParts = text.split(/[.!?]+/).filter((part) => part.trim());
  return words >= 4 && words <= 14 && sentenceParts.length === 1 && !/["“”#*]/.test(text);
}

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

async function main() {
  const results = [];
  for (const model of models) {
    for (const trigger of triggers) {
      const start = performance.now();
      let reply = '';
      let error = '';
      try {
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: system }, { role: 'user', content: trigger.prompt }],
            stream: false,
            keep_alive: '30m',
            options: { temperature: 0.9, top_p: 0.9, num_predict: 40 }
          }),
          signal: AbortSignal.timeout(60000)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        reply = String(data.message?.content || '').split(/\r?\n/)[0].replace(/["*]/g, '').trim().slice(0, 120);
        if (!reply) error = 'Empty response';
      } catch (caught) {
        error = caught.message;
      }
      results.push({
        model,
        trigger: trigger.type,
        reply,
        words: reply ? reply.split(/\s+/).filter(Boolean).length : 0,
        latency: Math.round(performance.now() - start),
        compliant: reply ? compliance(reply) : false,
        error
      });
      console.log(`${model} / ${trigger.type}: ${results.at(-1).latency}ms${error ? ` (${error})` : ''}`);
    }
  }

  const table = [
    '# Local model comparison',
    '',
    `Measured ${new Date().toISOString()} against Ollama at localhost. Each model received the same six prompts; errors are retained rather than replaced with invented results.`,
    '',
    '| Model | Trigger | Reply | Words | Latency (ms) | Rules obeyed | Error |',
    '|---|---|---|---:|---:|:---:|---|',
    ...results.map((item) => `| ${item.model} | ${item.trigger} | ${item.reply.replace(/\|/g, '\\|') || '—'} | ${item.words} | ${item.latency} | ${item.reply ? (item.compliant ? 'Yes' : 'No') : '—'} | ${item.error.replace(/\|/g, '\\|') || '—'} |`),
    '',
    '## Summary',
    '',
    ...models.map((model) => {
      const rows = results.filter((item) => item.model === model);
      const completed = rows.filter((item) => !item.error && item.reply);
      const passing = completed.filter((item) => item.compliant).length;
      const latency = median(completed.map((item) => item.latency));
      if (!completed.length) return `- ${model}: no successful replies; rules compliance not measured (0/6 prompts completed); median latency unavailable.`;
      return `- ${model}: ${passing}/${completed.length} successful replies followed the rules; completed ${completed.length}/6 prompts; median latency ${latency} ms.`;
    }),
    '',
    'Run `npm run compare` with Ollama running and all four models downloaded to refresh these measurements.'
  ].join('\n');

  const output = path.join(__dirname, '..', 'docs', 'model-comparison.md');
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${table}\n`, 'utf8');
  console.log(`\nWrote ${path.relative(process.cwd(), output)}`);
}

main().catch((error) => {
  console.error('Model comparison failed:', error);
  process.exitCode = 1;
});
