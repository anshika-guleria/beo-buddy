const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('booBuddy', {
  setMouseEvents: (ignore) => ipcRenderer.send('set-mouse-events', ignore),
  setWhisperActive: (active) => ipcRenderer.send('whisper-active', active),
  beginWindowDrag: () => ipcRenderer.send('begin-window-drag'),
  moveWindowDrag: () => ipcRenderer.send('move-window-drag'),
  endWindowDrag: () => ipcRenderer.send('end-window-drag'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setCharacter: (character) => ipcRenderer.invoke('set-character', character),
  whisper: (text) => ipcRenderer.invoke('whisper', text),
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  interact: () => ipcRenderer.send('interaction'),
  openWhisper: () => ipcRenderer.send('open-whisper'),
  onSay: (callback) => ipcRenderer.on('say', (_event, payload) => callback(payload)),
  onMood: (callback) => ipcRenderer.on('mood', (_event, mood) => callback(mood)),
  onCharacter: (callback) => ipcRenderer.on('character', (_event, character) => callback(character)),
  onNextCharacterShortcut: (callback) => ipcRenderer.on('next-character-shortcut', callback),
  onToggleMasksShortcut: (callback) => ipcRenderer.on('toggle-masks-shortcut', callback),
  onOnboarding: (callback) => ipcRenderer.on('onboarding', (_event, payload) => callback(payload)),
  onLonely: (callback) => ipcRenderer.on('lonely', callback),
  onReturnFromLonely: (callback) => ipcRenderer.on('return-from-lonely', callback),
  onOpenWhisper: (callback) => ipcRenderer.on('open-whisper', callback)
});
