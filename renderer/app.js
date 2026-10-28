const pet = document.querySelector('.pet');
const ghost = document.getElementById('ghost-wrap');
const chatHistory = document.getElementById('chat-history');
const whisperForm = document.getElementById('whisper-form');
const whisperInput = document.getElementById('whisper-input');
const whisperSend = whisperForm.querySelector('button[type="submit"]');
const whisperClose = document.getElementById('whisper-close');
const onboarding = document.getElementById('onboarding');
const petName = document.getElementById('pet-name');
const characterImage = document.getElementById('character-art');
const candleButton = document.getElementById('candle-button');
const shortcutHelp = document.getElementById('shortcut-help');
const friendNames = {
  'ghost-1': 'Boo-ddy',
  'ghost-2': 'Violet',
  'ghost-3': 'Pumpkin',
  'ghost-4': 'Batty',
  'ghost-5': 'Cozy',
  'ghost-6': 'Whisper'
};
let dragPointer = null;
let suppressGhostClick = false;
let paintedMasksEnabled = true;

function openWhisperBox() {
  pet.classList.add('chat-open');
  whisperForm.classList.add('open');
  window.booBuddy.setMouseEvents(false);
  window.booBuddy.setWhisperActive(true);
  whisperInput.focus();
}

function closeWhisperBox() {
  pet.classList.remove('chat-open');
  whisperForm.classList.remove('open');
  window.booBuddy.setWhisperActive(false);
  updateMousePassThrough();
}

function updateMousePassThrough() {
  const needsMouse = Boolean(dragPointer)
    || whisperForm.classList.contains('open')
    || !shortcutHelp.hidden
    || pet.matches(':hover');
  window.booBuddy.setMouseEvents(!needsMouse);
}

function showBubble(text) {
  return addChatMessage(text, 'assistant');
}

function addChatMessage(text, sender, pending = false) {
  const message = document.createElement('div');
  message.className = `chat-message chat-message-${sender}${pending ? ' chat-message-pending' : ''}`;
  message.textContent = text;
  chatHistory.append(message);
  while (chatHistory.children.length > 12) chatHistory.firstElementChild.remove();
  return message;
}

function setPetMood(mood) {
  for (const className of pet.classList) {
    if (className.startsWith('mood-')) pet.classList.remove(className);
  }
  pet.classList.add(`mood-${mood}`);
}

window.booBuddy.onSay(({ text, mood }) => {
  setPetMood(mood);
  showBubble(text);
});
window.booBuddy.onMood(setPetMood);
window.booBuddy.onCharacter((character) => setCharacter(character));
window.booBuddy.onNextCharacterShortcut(() => cycleCharacter());
window.booBuddy.onToggleMasksShortcut(() => setMasksEnabled(!paintedMasksEnabled));
window.booBuddy.onLonely(() => { pet.classList.add('mood-lonely'); });
window.booBuddy.onReturnFromLonely(() => { pet.classList.remove('mood-lonely'); showBubble('You came back! I saved you a tiny heart.'); });
window.booBuddy.onOpenWhisper(openWhisperBox);

window.booBuddy.onOnboarding(async ({ model }) => {
  const settings = await window.booBuddy.getSettings();
  petName.textContent = settings.character === 'ghost' ? settings.ghostName || friendNames.ghost : friendNames[settings.character] || friendNames.ghost;
  setCharacter(settings.character);
  const status = await window.booBuddy.checkOllama();
  if (!status.available) {
    onboarding.hidden = false;
    onboarding.innerHTML = `I need Ollama to reply. Start it and try <code>ollama pull ${model}</code>. <button type="button">Got it</button>`;
    onboarding.querySelector('button').addEventListener('click', () => { onboarding.hidden = true; });
  }
});

function setCharacter(character) {
  if (!friendNames[character]) return;
  pet.dataset.character = character;
  petName.textContent = friendNames[character];
  characterImage.src = `ghosts/${character}${paintedMasksEnabled ? '' : '-classic'}.svg`;
  characterImage.alt = `${friendNames[character]}, a cute Halloween ghost`;
}

function setMasksEnabled(enabled) {
  paintedMasksEnabled = enabled;
  candleButton.classList.toggle('masks-off', !paintedMasksEnabled);
  setCharacter(pet.dataset.character);
}

function toggleShortcutHelp() {
  shortcutHelp.hidden = !shortcutHelp.hidden;
  candleButton.setAttribute('aria-expanded', String(!shortcutHelp.hidden));
  if (!shortcutHelp.hidden) window.booBuddy.setMouseEvents(false);
  else updateMousePassThrough();
}

async function cycleCharacter() {
  const characters = Object.keys(friendNames);
  const current = pet.dataset.character || characters[0];
  const next = characters[(characters.indexOf(current) + 1) % characters.length];
  setCharacter(next);
  try {
    await window.booBuddy.setCharacter(next);
    showBubble(`${friendNames[next]} is here to keep you company!`);
  } catch (error) {
    console.error('Could not save the selected ghost:', error);
    setCharacter(current);
    showBubble(error.message || 'I could not switch friends just now.');
  }
}

candleButton.addEventListener('click', toggleShortcutHelp);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !shortcutHelp.hidden) toggleShortcutHelp();
});

window.booBuddy.getSettings().then(({ character }) => setCharacter(character)).catch((error) => {
  console.error('Could not load Boo-buddy character setting:', error);
});

candleButton.addEventListener('mouseenter', () => window.booBuddy.setMouseEvents(false));
candleButton.addEventListener('pointerdown', () => window.booBuddy.setMouseEvents(false));
ghost.addEventListener('mouseenter', () => window.booBuddy.setMouseEvents(false));
ghost.addEventListener('pointerdown', () => {
  window.booBuddy.setMouseEvents(false);
  ghost.classList.remove('poke');
  void ghost.offsetWidth;
  ghost.classList.add('poke');
});
ghost.addEventListener('dragstart', (event) => event.preventDefault());
ghost.addEventListener('animationend', (event) => {
  if (event.animationName === 'squish') ghost.classList.remove('poke');
});
whisperForm.addEventListener('mouseenter', () => window.booBuddy.setMouseEvents(false));
whisperForm.addEventListener('mouseleave', () => {
  if (whisperForm.classList.contains('open')) window.booBuddy.setMouseEvents(false);
});
ghost.addEventListener('click', (event) => {
  if (suppressGhostClick) {
    event.preventDefault();
    suppressGhostClick = false;
    return;
  }
  window.booBuddy.interact();
  openWhisperBox();
});
whisperForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = whisperInput.value.trim();
  if (!text || whisperSend.disabled) return;
  whisperInput.value = '';
  whisperSend.disabled = true;
  whisperForm.setAttribute('aria-busy', 'true');
  addChatMessage(text, 'user');
  const pendingMessage = addChatMessage('Let me think...', 'assistant', true);
  try { pendingMessage.textContent = await window.booBuddy.whisper(text); pendingMessage.classList.remove('chat-message-pending'); }
  catch (error) { pendingMessage.textContent = error.message || 'My thoughts got tangled; try again?'; pendingMessage.classList.remove('chat-message-pending'); }
  finally {
    whisperSend.disabled = false;
    whisperForm.removeAttribute('aria-busy');
    if (whisperForm.classList.contains('open')) whisperInput.focus();
  }
});
whisperClose.addEventListener('click', closeWhisperBox);
whisperInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeWhisperBox();
  }
});
ghost.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || whisperForm.classList.contains('open')) return;
  window.booBuddy.setMouseEvents(false);
  dragPointer = {
    id: event.pointerId,
    startX: event.screenX,
    startY: event.screenY,
    moved: false
  };
  window.booBuddy.beginWindowDrag();
  ghost.setPointerCapture(event.pointerId);
});
ghost.addEventListener('pointermove', (event) => {
  if (!dragPointer || event.pointerId !== dragPointer.id || !(event.buttons & 1)) return;
  const deltaX = event.screenX - dragPointer.startX;
  const deltaY = event.screenY - dragPointer.startY;
  if (!dragPointer.moved && Math.hypot(deltaX, deltaY) < 4) return;
  dragPointer.moved = true;
  window.booBuddy.moveWindowDrag();
});
function finishGhostDrag(event) {
  if (!dragPointer || event.pointerId !== dragPointer.id) return;
  const wasDragged = dragPointer.moved;
  dragPointer = null;
  window.booBuddy.endWindowDrag();
  if (ghost.hasPointerCapture(event.pointerId)) ghost.releasePointerCapture(event.pointerId);
  if (wasDragged) {
    event.preventDefault();
    suppressGhostClick = true;
    setTimeout(() => { suppressGhostClick = false; }, 0);
  }
  updateMousePassThrough();
}
ghost.addEventListener('pointercancel', (event) => {
  if (!dragPointer || event.pointerId !== dragPointer.id) return;
  dragPointer = null;
  window.booBuddy.endWindowDrag();
  updateMousePassThrough();
});
ghost.addEventListener('pointerup', finishGhostDrag);
pet.addEventListener('mouseenter', () => window.booBuddy.setMouseEvents(false));
pet.addEventListener('mouseleave', () => {
  if (!dragPointer && !whisperForm.classList.contains('open') && shortcutHelp.hidden) window.booBuddy.setMouseEvents(true);
});
