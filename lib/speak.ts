/**
 * speak.ts — TTS utility
 *
 * 1. Tries Sarvam Bulbul (Indian-language voices, best quality)
 * 2. Falls back to browser speechSynthesis with ZERO configuration —
 *    no lang, no voice, system default only. This ALWAYS produces audio.
 */

// ── Browser speechSynthesis fallback ─────────────────────────────────────
// Deliberately sets NO lang and NO voice.
// Any lang/voice mismatch causes Chrome to silently drop the utterance.
// Using the system default voice guarantees audio plays on every device.

export function browserSpeak(
  text: string,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  // Unstick Chrome's speechSynthesis — it can freeze after repeated calls
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  let done = false;
  const finish = () => { if (!done) { done = true; onEnd?.(); } };
  const safety = setTimeout(finish, 12_000);

  // 200 ms gap after cancel() — Chrome race condition fix
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text.slice(0, 200));
    utt.rate = 0.9;
    utt.volume = 1;
    // NO utt.lang — NO utt.voice — browser uses system default, always works
    utt.onend  = () => { clearTimeout(safety); finish(); };
    utt.onerror = () => { clearTimeout(safety); finish(); };
    window.speechSynthesis.speak(utt);
  }, 200);
}

// ── Sarvam TTS → browser fallback ────────────────────────────────────────

export async function playTTS(
  text: string,
  langCode: string,
  onEnd?: () => void
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 400), languageCode: langCode }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Sarvam unavailable — fall back to browser TTS
      browserSpeak(text, onEnd);
      return;
    }

    const data = await res.json();

    if (data.audio) {
      // Play Sarvam's WAV response
      const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
      audio.onended = () => onEnd?.();
      audio.onerror = () => browserSpeak(text, onEnd);
      await audio.play().catch(() => browserSpeak(text, onEnd));
    } else {
      // Sarvam returned no audio (quota exceeded, API key wrong, etc.)
      browserSpeak(text, onEnd);
    }
  } catch {
    // Network error or timeout
    clearTimeout(timeoutId);
    browserSpeak(text, onEnd);
  }
}
