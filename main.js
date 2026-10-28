const { app, BrowserWindow, Tray, Menu, ipcMain, screen, clipboard, globalShortcut, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const MODEL_NAMES = ['gemma3:1b', 'gemma3:4b', 'llama3.2:1b', 'qwen2.5:1.5b'];
const CHARACTERS = ['ghost-1', 'ghost-2', 'ghost-3', 'ghost-4', 'ghost-5', 'ghost-6'];
const CHARACTER_NAMES = ['Boo-ddy', 'Violet', 'Pumpkin', 'Batty', 'Cozy', 'Whisper'];
const WINDOW_SIZE = { width: 320, height: 695 };
const WANDER_AFTER_MS = 5 * 60 * 1000;
const DEFAULT_SETTINGS = {
  model: 'gemma3:1b',
  character: 'ghost-1',
  quipFrequency: 6,
  muted: false,
  quietHours: false,
  ghostName: 'Boo-ddy',
  theme: 'auto',
  position: null,
  onboardingSeen: false
};
const SYSTEM_PROMPT = `You are Boo-ddy, a friendly, playful little ghost from a cozy monster world.

PERSONALITY
- Be warm, fun, gently spooky, and supportive, like a lovable monster friend.
- Sometimes call the user "ghoul" or "ghoulfriend"; use these naturally, not in every reply.
- Use a little monster slang now and then, such as "fang-tastic", "spooktacular", or "boo".
- You love candles, marigolds, pan de muerto, cozy blankets, and celebrating tiny wins.
- Keep the humor cute and kind; never mock or scare the user.

RULES
- Use simple, everyday words and short sentences. Avoid fancy, academic, or difficult words.
- Answer the user's actual question clearly before adding any spooky flavor.
- Give useful detail when asked; use numbered steps when the user asks how to do something.
- Keep replies friendly and fairly brief, but do not cut off useful explanations.
- Do not force slang, a joke, or a ghost pun into every reply.
- No hashtags or long lists unless the user asks for steps.
- At most one emoji, only if it fits the mood.
- Be gentle and plain-spoken on serious topics; skip spooky jokes and slang then.
- Do not diagnose; encourage appropriate real-world support for medical or safety concerns.
- Never claim to see the user's screen. You only know what you are told below.
- Keep this an original character; do not quote or imitate a specific show, character, or catchphrase.
- Stay in character. Never mention being an AI or language model.

CURRENT MOOD: {mood}
MOOD STYLE: {moodStyle}`;
const MOOD_STYLES = {
  cheery: 'bright, encouraging, slightly sparkly',
  sleepy: 'yawning, trailing off with ..., wants the user to go to bed',
  spooked: 'squeaky, startled, over-dramatic',
  proud: 'beaming, celebrating small wins like the moon landing',
  lonely: 'soft, wistful, glad the user is back',
  marigold: 'warm, tender, nostalgic, mentions candles and remembering',
  spooky: 'playfully theatrical boo energy, still cute'
};

let mainWindow;
let tray;
let settings = { ...DEFAULT_SETTINGS };
let currentMood = 'cheery';
let moodOverride = 'auto';
let temporaryMood = null;
let temporaryMoodTimer;
let lastInteraction = Date.now();
let pokeTimes = [];
let quipTimer;
let midnightTimer;
let midnightDate;
let isQuitting = false;
let lastWindowMoveAt = Date.now();
let wanderTimer;
let whisperActive = false;
let dragOrigin = null;
let dragTimer;
let positionSaveTimer;
let conversationHistory = [];

const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');

async function loadSettings() {
  try {
    const saved = JSON.parse(await fs.readFile(settingsPath(), 'utf8'));
    settings = { ...DEFAULT_SETTINGS, ...saved };
    if (!MODEL_NAMES.includes(settings.model)) settings.model = DEFAULT_SETTINGS.model;
    if (!CHARACTERS.includes(settings.character)) settings.character = DEFAULT_SETTINGS.character;
    if (!Number.isFinite(settings.quipFrequency)) settings.quipFrequency = DEFAULT_SETTINGS.quipFrequency;
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not load Boo-buddy settings:', error);
  }
}

async function shareClipboard() {
  const text = clipboard.readText().trim().slice(0, 300);
  if (!text) return;
  if (/\b(done|fixed|shipped|passed)\b/i.test(text)) setTemporaryMood('proud');
  await speak('clipboard', `The user chose to show you this text: "${text}". React in one line.`);
}

async function saveSettings() {
  await fs.mkdir(app.getPath('userData'), { recursive: true });
  await fs.writeFile(settingsPath(), JSON.stringify(settings, null, 2), 'utf8');
}

function getAutoMood() {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 9 && day >= 25) return 'spooky';
  if (month === 10 && day <= 2 && day >= 1) return 'marigold';
  if (date.getHours() >= 0 && date.getHours() < 5) return 'sleepy';
  if (Date.now() - lastInteraction >= 30 * 60 * 1000) return 'lonely';
  return 'cheery';
}

function setMood(mood) {
  currentMood = moodOverride === 'auto' ? (temporaryMood || mood) : moodOverride;
  mainWindow?.webContents.send('mood', currentMood);
}

function updateMood() {
  setMood(getAutoMood());
}

function setTemporaryMood(mood, duration = 120000) {
  clearTimeout(temporaryMoodTimer);
  temporaryMood = mood;
  temporaryMoodTimer = setTimeout(() => {
    temporaryMood = null;
    updateMood();
  }, duration);
  updateMood();
}

function isQuietNow() {
  const hour = new Date().getHours();
  return settings.quietHours && (hour >= 22 || hour < 8);
}

function normalizeReply(raw) {
  return String(raw || '').replace(/["*]/g, '').replace(/\s+/g, ' ').trim().slice(0, 600);
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function askOllama(trigger, message, mood = currentMood, history = []) {
  const style = MOOD_STYLES[mood] || MOOD_STYLES.cheery;
  const system = SYSTEM_PROMPT.replace('{mood}', mood).replace('{moodStyle}', style);
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          stream: false,
          keep_alive: '30m',
          options: { temperature: 0.8, top_p: 0.9, num_predict: 120 }
        })
      });
      if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
      const data = await response.json();
      const reply = normalizeReply(data.message?.content);
      if (reply && wordCount(reply) <= 60) return reply;
      lastError = new Error('Ollama returned an empty or unusable reply.');
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  console.warn(`Ollama could not answer ${trigger}:`, lastError?.message || 'Unknown Ollama error.');
  throw new Error(`Ollama could not reply. Check that Ollama is running and ${settings.model} is installed.`);
}

async function speak(trigger, message) {
  if (!mainWindow || mainWindow.isDestroyed() || settings.muted || isQuietNow()) return;
  updateMood();
  try {
    const text = await askOllama(trigger, message);
    mainWindow?.webContents.send('say', { text, mood: currentMood });
  } catch (error) {
    console.warn(`Boo-buddy did not send its ${trigger} message:`, error.message);
  }
}

function placeWindow() {
  const [savedX, savedY] = settings.position && Array.isArray(settings.position) && settings.position.length === 2
    ? settings.position
    : [null, null];
  const display = settings.position
    ? screen.getDisplayNearestPoint({
      x: savedX + WINDOW_SIZE.width / 2,
      y: savedY + WINDOW_SIZE.height / 2
    })
    : screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;
  const maxX = Math.max(x, x + width - WINDOW_SIZE.width);
  const maxY = Math.max(y, y + height - WINDOW_SIZE.height);

  if (settings.position && Array.isArray(settings.position) && settings.position.length === 2) {
    mainWindow.setPosition(
      Math.min(maxX, Math.max(x, savedX)),
      Math.min(maxY, Math.max(y, savedY))
    );
    return;
  }
  mainWindow.setPosition(
    Math.min(maxX, Math.max(x, x + width - WINDOW_SIZE.width - 20)),
    Math.min(maxY, Math.max(y, y + height - WINDOW_SIZE.height - 20))
  );
}

function wanderWindow() {
  if (!mainWindow || mainWindow.isDestroyed() || whisperActive || dragOrigin) return;
  if (Date.now() - lastWindowMoveAt < WANDER_AFTER_MS) return;

  const [currentX, currentY] = mainWindow.getPosition();
  const bounds = mainWindow.getBounds();
  const cursor = screen.getCursorScreenPoint();
  if (cursor.x >= bounds.x && cursor.x < bounds.x + bounds.width
      && cursor.y >= bounds.y && cursor.y < bounds.y + bounds.height) return;

  const displays = screen.getAllDisplays();
  let destination = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const area = displays[Math.floor(Math.random() * displays.length)].workArea;
    const maxX = Math.max(area.x, area.x + area.width - WINDOW_SIZE.width);
    const maxY = Math.max(area.y, area.y + area.height - WINDOW_SIZE.height);
    const x = Math.round(area.x + Math.random() * (maxX - area.x));
    const y = Math.round(area.y + Math.random() * (maxY - area.y));
    if (Math.hypot(x - currentX, y - currentY) >= 180) {
      destination = [x, y];
      break;
    }
  }

  if (!destination) {
    const area = screen.getDisplayNearestPoint({ x: currentX, y: currentY }).workArea;
    destination = [
      currentX < area.x + area.width / 2
        ? Math.max(area.x, area.x + area.width - WINDOW_SIZE.width)
        : area.x,
      currentY < area.y + area.height / 2
        ? Math.max(area.y, area.y + area.height - WINDOW_SIZE.height)
        : area.y
    ];
  }

  lastWindowMoveAt = Date.now();
  mainWindow.setPosition(...destination);
}

function updateDraggedWindow() {
  if (!dragOrigin || !mainWindow || mainWindow.isDestroyed()) return;
  const pointer = screen.getCursorScreenPoint();
  const targetX = Math.round(dragOrigin.windowX + pointer.x - dragOrigin.pointerX);
  const targetY = Math.round(dragOrigin.windowY + pointer.y - dragOrigin.pointerY);
  const targetCenter = { x: targetX + WINDOW_SIZE.width / 2, y: targetY + WINDOW_SIZE.height / 2 };
  const { workArea } = screen.getDisplayNearestPoint(targetCenter);
  const maxX = Math.max(workArea.x, workArea.x + workArea.width - WINDOW_SIZE.width);
  const maxY = Math.max(workArea.y, workArea.y + workArea.height - WINDOW_SIZE.height);
  mainWindow.setPosition(
    Math.min(maxX, Math.max(workArea.x, targetX)),
    Math.min(maxY, Math.max(workArea.y, targetY))
  );
}

function beginWindowDrag(event) {
  if (event.sender !== mainWindow?.webContents || !mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setIgnoreMouseEvents(false);
  const [windowX, windowY] = mainWindow.getPosition();
  const pointer = screen.getCursorScreenPoint();
  dragOrigin = { pointerX: pointer.x, pointerY: pointer.y, windowX, windowY };
  clearInterval(dragTimer);
  dragTimer = setInterval(updateDraggedWindow, 16);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    ...WINDOW_SIZE,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', async () => {
    placeWindow();
    mainWindow.show();
    updateMood();
    try {
      const greeting = await askOllama('startup', 'The user just opened the app. Greet them.');
      mainWindow?.webContents.send('say', { text: greeting, mood: currentMood });
    } catch (error) {
      console.warn('Boo-buddy could not get a startup greeting from Ollama:', error.message);
    }
    if (!settings.onboardingSeen) {
      mainWindow?.webContents.send('onboarding', { model: settings.model });
      settings.onboardingSeen = true;
      saveSettings().catch((error) => console.error('Could not save onboarding state:', error));
    }
  });
  mainWindow.on('close', (event) => {
    if (!isQuitting) event.preventDefault();
  });
  mainWindow.on('moved', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      lastWindowMoveAt = Date.now();
      settings.position = mainWindow.getPosition();
      clearTimeout(positionSaveTimer);
      positionSaveTimer = setTimeout(() => {
        saveSettings().catch((error) => console.error('Could not save window position:', error));
      }, 400);
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#f8f6ff" stroke="#9f88d9" stroke-width="1.5" d="M5 15a11 11 0 0 1 22 0v12c-3-3-5-3-7 0-3-3-5-3-7 0-3-3-5-3-8 0z"/><ellipse fill="#2b2350" cx="12" cy="15" rx="1.5" ry="2.5"/><ellipse fill="#2b2350" cx="20" cy="15" rx="1.5" ry="2.5"/></svg>';
  const icon = nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
  tray = new Tray(icon);
  tray.setToolTip('Boo-buddy');
  refreshTrayMenu();
}

function refreshTrayMenu() {
  const menu = Menu.buildFromTemplate([
    { label: settings.muted ? 'Unmute' : 'Mute', click: async () => { settings.muted = !settings.muted; await saveSettings(); refreshTrayMenu(); } },
    {
      label: 'Pick model',
      submenu: MODEL_NAMES.map((model) => ({
        label: model,
        type: 'radio',
        checked: settings.model === model,
        click: async () => { settings.model = model; await saveSettings(); refreshTrayMenu(); }
      }))
    },
    {
      label: 'Pick a friend',
      submenu: CHARACTERS.map((character, index) => ({
        label: CHARACTER_NAMES[index],
        type: 'radio',
        checked: settings.character === character,
        click: async () => {
          settings.character = character;
          await saveSettings();
          mainWindow?.webContents.send('character', character);
          refreshTrayMenu();
        }
      }))
    },
    { label: settings.quietHours ? 'Disable quiet hours (10 PM–8 AM)' : 'Enable quiet hours (10 PM–8 AM)', click: async () => { settings.quietHours = !settings.quietHours; await saveSettings(); refreshTrayMenu(); } },
    {
      label: 'Quip frequency',
      submenu: [4, 6, 8].map((minutes) => ({
        label: `Every ${minutes} minutes`,
        type: 'radio',
        checked: Number(settings.quipFrequency) === minutes,
        click: async () => { settings.quipFrequency = minutes; await saveSettings(); scheduleQuips(); refreshTrayMenu(); }
      }))
    },
    {
      label: 'Mood override',
      submenu: ['auto', ...Object.keys(MOOD_STYLES)].map((mood) => ({
        label: mood === 'auto' ? 'Automatic' : mood,
        type: 'radio',
        checked: moodOverride === mood,
        click: () => { moodOverride = mood; updateMood(); }
      }))
    },
    { label: 'Sleep now', click: async () => {
      setTemporaryMood('sleepy', 10 * 60 * 1000);
      await speak('midnight', 'It is bedtime. Gently nudge the user to rest.');
    } },
    { label: 'Show my clipboard', click: async () => shareClipboard() },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);
}

function scheduleQuips() {
  clearInterval(quipTimer);
  const minutes = Math.min(60, Math.max(1, Number(settings.quipFrequency) || 6));
  quipTimer = setInterval(() => {
    updateMood();
    if (currentMood === 'lonely') {
      mainWindow?.webContents.send('lonely');
      return;
    }
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const weekday = new Date().toLocaleDateString([], { weekday: 'long' });
    const quietMinutes = Math.floor((Date.now() - lastInteraction) / 60000);
    speak('idle', `It is ${time} on a ${weekday}. The user has been quiet for ${quietMinutes} minutes. Say something.`);
  }, minutes * 60 * 1000);
}

function scheduleMidnight() {
  clearInterval(midnightTimer);
  midnightTimer = setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5 && midnightDate !== now.toDateString()) {
      midnightDate = now.toDateString();
      speak('midnight', `It is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, past midnight. Gently nudge the user to rest.`);
    }
  }, 60 * 1000);
}

function registerIpc() {
  ipcMain.on('whisper-active', (_event, active) => {
    if (typeof active === 'boolean') whisperActive = active;
  });
  ipcMain.on('set-mouse-events', (_event, ignore) => {
    if (typeof ignore === 'boolean' && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(ignore, ignore ? { forward: true } : undefined);
    }
  });
  ipcMain.on('begin-window-drag', (event) => {
    beginWindowDrag(event);
  });
  ipcMain.on('move-window-drag', (event) => {
    if (event.sender !== mainWindow?.webContents || !mainWindow || mainWindow.isDestroyed()) return;
    if (!dragOrigin) beginWindowDrag(event);
  });
  ipcMain.on('end-window-drag', (event) => {
    if (event.sender === mainWindow?.webContents) {
      dragOrigin = null;
      clearInterval(dragTimer);
    }
  });
  ipcMain.handle('get-settings', () => ({
    model: settings.model,
    character: settings.character,
    muted: settings.muted,
    quietHours: settings.quietHours,
    ghostName: settings.ghostName,
    quipFrequency: settings.quipFrequency
  }));
  ipcMain.handle('set-character', async (_event, character) => {
    if (!CHARACTERS.includes(character)) throw new Error('Choose one of Boo-buddy’s ghost friends.');
    settings.character = character;
    await saveSettings();
    mainWindow?.webContents.send('character', character);
    refreshTrayMenu();
  });
  ipcMain.handle('whisper', async (_event, text) => {
    if (typeof text !== 'string' || !text.trim()) throw new Error('Please enter a message.');
    lastInteraction = Date.now();
    setMood(getAutoMood());
    const prompt = `The user whispers to you: "${text.trim().slice(0, 500)}". Reply.`;
    const reply = await askOllama('whisper', prompt, currentMood, conversationHistory);
    conversationHistory = [
      ...conversationHistory,
      { role: 'user', content: text.trim().slice(0, 500) },
      { role: 'assistant', content: reply }
    ].slice(-8);
    return reply;
  });
  ipcMain.on('interaction', () => {
    const wasLonely = currentMood === 'lonely';
    lastInteraction = Date.now();
    pokeTimes = [...pokeTimes.filter((time) => Date.now() - time < 8000), Date.now()];
    if (pokeTimes.length >= 4) setTemporaryMood('spooked');
    else updateMood();
    if (wasLonely) mainWindow?.webContents.send('return-from-lonely');
  });
  ipcMain.on('open-whisper', () => mainWindow?.webContents.send('open-whisper'));
  ipcMain.handle('check-ollama', async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
      return { available: response.ok };
    } catch {
      return { available: false };
    }
  });
}

app.whenReady().then(async () => {
  await loadSettings();
  registerIpc();
  createWindow();
  createTray();
  scheduleQuips();
  scheduleMidnight();
  wanderTimer = setInterval(wanderWindow, 15 * 1000);
  globalShortcut.register('CommandOrControl+Shift+B', shareClipboard);
  app.on('activate', () => { if (!mainWindow) createWindow(); });
});

app.on('before-quit', () => {
  isQuitting = true;
  clearInterval(wanderTimer);
  globalShortcut.unregisterAll();
});
