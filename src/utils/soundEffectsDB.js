import { set, get, del } from 'idb-keyval';

// 🟢 AUDIO TYPE UTILITIES
// Use these instead of inline type checks to ensure consistency

/**
 * Check if an audio item is a music track
 * @param {Object} item - Audio item with type property
 * @returns {boolean}
 */
export function isMusicTrack(item) {
  return item?.type === 'music';
}

/**
 * Check if an audio item is a sound effect
 * @param {Object} item - Audio item with type property
 * @returns {boolean}
 */
export function isSoundEffect(item) {
  return !item?.type || item.type === 'effect';
}

/**
 * Filter an array to only music tracks
 * @param {Array} items - Array of audio items
 * @returns {Array}
 */
export function filterMusicTracks(items) {
  return (items || []).filter(isMusicTrack);
}

/**
 * Filter an array to only sound effects
 * @param {Array} items - Array of audio items
 * @returns {Array}
 */
export function filterSoundEffects(items) {
  return (items || []).filter(isSoundEffect);
}

// 🟢 SOUND EFFECTS
const SOUND_KEYS_INDEX = 'sound-effects-list';

export async function saveSoundEffect(name, blob, type = "effect") {
  const key = `sound-${Date.now()}`;
  await set(key, blob);

  const existingList = (await get(SOUND_KEYS_INDEX)) || [];
  const newList = [...existingList, { key, name, type }];
  await set(SOUND_KEYS_INDEX, newList);
}


export async function getAllSoundEffects() {
  const list = (await get(SOUND_KEYS_INDEX)) || [];
  return Promise.all(
    list.map(async ({ key, name, type, role }) => {
      const blob = await get(key);
      return {
        key,
        name,
        blob,
        type: type || "effect",
        role, // <-- keep the role so the UI can show the 🏆/💀 badge
      };
    })
  );
}



export async function deleteSoundEffect(nameToDelete) {
  const list = (await get(SOUND_KEYS_INDEX)) || [];
  const updatedList = list.filter(({ name }) => name !== nameToDelete);
  const removedItems = list.filter(({ name }) => name === nameToDelete);

  await Promise.all(removedItems.map(({ key }) => del(key)));
  await set(SOUND_KEYS_INDEX, updatedList);
}

// 🟢 GENERAL ASSET STORAGE (Background, Hint Sound, Track)
export async function saveAsset(key, blob) {
  await set(key, blob);
}
export async function getAsset(key) {
  return await get(key);
}
export async function deleteAsset(key) {
  await del(key);
}

// 🟢 HINT LIST
const HINT_KEY = 'hint-list';

export async function saveHints(hintArray) {
  await set(HINT_KEY, hintArray);
}
export async function getHints() {
  return await get(HINT_KEY) || [];
}
export async function deleteHintByIndex(index) {
  const hints = await getHints();
  const newHints = hints.filter((_, i) => i !== index);
  await saveHints(newHints);
}
export async function updateHintByIndex(index, newText) {
  const hints = await getHints();
  hints[index] = newText;
  await saveHints(hints);
}

// Rename by updating the index list (no blob rewrite needed)
export async function updateSoundEffectName(oldName, newName) {
  const list = (await get(SOUND_KEYS_INDEX)) || [];
  const trimmed = (newName || "").trim();

  if (!trimmed || trimmed === oldName) return;

  // Optional: avoid duplicate names (same-case check)
  if (list.some(item => item.name === trimmed)) {
    throw new Error("NAME_TAKEN");
  }

  const updatedList = list.map(item =>
    item.name === oldName ? { ...item, name: trimmed } : item
  );

  await set(SOUND_KEYS_INDEX, updatedList);
}

// --- Add near your other imports/utilities ---
/**
 * Role is one of: 'victory' | 'defeat' | undefined
 * We persist it in the SOUND_KEYS_INDEX entries as a 'role' field.
 */

export async function setEndRoleByName(role, name) {
  if (!role || !name) return;
  const list = (await get(SOUND_KEYS_INDEX)) || [];

  // Clear previous owner of this role, then assign to the matching name
  const updated = list.map(item => {
    if (item.role === role) return { ...item, role: undefined };
    if (item.name === name) return { ...item, role };
    return item;
  });

  await set(SOUND_KEYS_INDEX, updated);
}

export async function clearEndRole(role) {
  const list = (await get(SOUND_KEYS_INDEX)) || [];
  const updated = list.map(item => (item.role === role ? { ...item, role: undefined } : item));
  await set(SOUND_KEYS_INDEX, updated);
}

export async function getEndEffect(role) {
  const list = (await get(SOUND_KEYS_INDEX)) || [];
  const entry = list.find(item => item.role === role);
  if (!entry) return null;

  // Return the same shape as getAllSoundEffects() items
  const blob = await get(entry.key);
  return { ...entry, blob }; // { key, name, type, role, blob }
}

// 🟢 SESSION HISTORY
const SESSIONS_KEY = 'session-history';

/**
 * Save a completed session
 * @param {Object} session - Session data
 * @param {string} session.result - 'victory' or 'defeat'
 * @param {number} session.roomDuration - Configured room duration in seconds
 * @param {number} session.timeRemaining - Time remaining when session ended (seconds)
 * @param {number} session.hintsGiven - Number of hints sent during session
 * @param {Date} session.date - Session end date/time
 */
export async function saveSession(session) {
  const sessions = (await get(SESSIONS_KEY)) || [];
  const newSession = {
    id: `session-${Date.now()}`,
    date: new Date().toISOString(),
    ...session,
  };
  sessions.push(newSession);
  await set(SESSIONS_KEY, sessions);
  return newSession;
}

/**
 * Get all saved sessions
 * @returns {Promise<Array>} Array of session objects
 */
export async function getAllSessions() {
  return (await get(SESSIONS_KEY)) || [];
}

/**
 * Delete a session by ID
 * @param {string} sessionId - Session ID to delete
 */
export async function deleteSession(sessionId) {
  const sessions = (await get(SESSIONS_KEY)) || [];
  const filtered = sessions.filter(s => s.id !== sessionId);
  await set(SESSIONS_KEY, filtered);
}

/**
 * Clear all session history
 */
export async function clearAllSessions() {
  await set(SESSIONS_KEY, []);
}
