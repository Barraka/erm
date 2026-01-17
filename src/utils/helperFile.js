import { getAsset, saveAsset } from "./soundEffectsDB";

// 🧠 Default values
export const defaultHints = [
  "Check under the rug.",
  "Try using the UV flashlight.",
  "Count the number of objects in the room.",
  "The code is related to the painting.",
  "What’s the third digit of the keypad?",
  "Look for a repeating pattern.",
  "Think outside the box — literally.",
  "Something's hidden behind the poster.",
  "Try the drawer again.",
  "Maybe the colors are a clue.",
];

export async function saveSetting(key, value) {
  await saveAsset(key, value);
}

export async function getSetting(key) {
  return await getAsset(key);
}

export function formatHint(text) {
  return text.trim().replace(/\s+/g, " ");
}


// 🔄 Utility: Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// 🎵 Utility: Play audio
export const playAudio = (src, loop = false) => {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.play();
  return audio;
};
