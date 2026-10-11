import type { SavedTemplate } from "./templateTypes";

const STORAGE_KEY = "chatgptFormatter.customTemplates";

/**
 * Custom templates persist per-device via localStorage. This is simpler
 * than Office roaming settings and sufficient for "remember what I made
 * on this machine" - it does not sync between devices.
 */
export function loadCustomTemplates(): SavedTemplate[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: SavedTemplate[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage may be unavailable (e.g. private browsing); formatting
    // still works, the custom template just won't persist.
  }
}
