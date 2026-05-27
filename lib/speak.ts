/**
 * speak.ts — Robust client-side TTS
 *
 * Flow:
 *  1. playTTS()  → call /api/tts (Sarvam Bulbul, best Indian voices)
 *                  timeout after 8 s so we never hang
 *  2. On any failure → browserSpeak() (window.speechSynthesis)
 *     - waits for voices to load before speaking
 *     - picks best voice for the language; falls back to English
 *     - safety timeout so UI never stays stuck
 *
 * IMPORTANT: call unlockAudio() during a user-gesture (e.g. mic tap) BEFORE
 * any async work, so Chrome allows audio.play() later.
 * VoiceButton already does this automatically.
 */

// ── Voice picker ────────────────────────────────────────────────────────────

function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefix = langCode.split("-")[0];
  return (
    voices.find(v => v.lang === langCode) ??          // exact: hi-IN
    voices.find(v => v.lang.startsWith(prefix + "-")) ?? // hi-*
    voices.find(v => v.lang.startsWith("en")) ??      // any English
    voices[0] ??                                       // absolute fallback
    null
  );
}

// ── Browser speechSynthesis ─────────────────────────────────────────────────

export function browserSpeak(
  text: string,
  langCode: string,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  let done = false;
  const finish = () => { if (!done) { done = true; onEnd?.(); } };

  // Safety net — unblock UI after 12 s regardless
  const safety = setTimeout(finish, 12_000);

  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.lang = langCode;
    utt.rate = 0.9;

    const voice = pickVoice(langCode);
    if (voice) utt.voice = voice;

    utt.onend  = () => { clearTimeout(safety); finish(); };
    utt.onerror = () => { clearTimeout(safety); finish(); };

    window.speechSynthesis.speak(utt);
  };

  // Voices may not be ready on first render — wait for them
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Small gap after cancel() prevents Chrome's silent-drop bug
    setTimeout(doSpeak, 120);
  } else {
    // Wait for voices to load (fires once on most browsers)
    let fired = false;
    const onLoaded = () => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.onvoiceschanged = null;
      setTimeout(doSpeak, 120);
    };
    window.speechSynthesis.onvoiceschanged = onLoaded;
    // Fallback in case onvoiceschanged never fires
    setTimeout(onLoaded, 600);
  }
}

// ── Sarvam TTS with browser fallback ───────────────────────────────────────

export async function playTTS(
  text: string,
  langCode: string,
  onEnd?: () => void
): Promise<void> {
  // 8-second timeout — Sarvam sometimes hangs on cold start
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
      browserSpeak(text, langCode, onEnd);
      return;
    }

    const data = await res.json();

    if (data.audio) {
      const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
      audio.onended = () => onEnd?.();
      audio.onerror = () => browserSpeak(text, langCode, onEnd);
      // If autoplay still blocked (shouldn't be after unlockAudio) → browser fallback
      await audio.play().catch(() => browserSpeak(text, langCode, onEnd));
    } else {
      // Sarvam returned no audio (missing API key, quota exceeded, etc.)
      browserSpeak(text, langCode, onEnd);
    }
  } catch {
    clearTimeout(timeoutId);
    browserSpeak(text, langCode, onEnd);
  }
}
