/**
 * speak.ts — Robust client-side TTS
 *
 * Priority order:
 *  1. Sarvam Bulbul (/api/tts) — best Indian-language quality
 *  2. window.speechSynthesis   — browser built-in fallback
 *
 * Key fix: utt.lang MUST match the selected voice's lang.
 * Setting utt.lang="hi-IN" while utt.voice is an English voice causes
 * Chrome to silently drop the utterance (no audio, no error event).
 */

// ── Pick best available voice ─────────────────────────────────────────────

function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefix = langCode.split("-")[0]; // "hi" from "hi-IN"
  return (
    voices.find(v => v.lang === langCode) ??               // exact: hi-IN
    voices.find(v => v.lang.startsWith(prefix + "-")) ??   // hi-*
    voices.find(v => v.lang.startsWith("en")) ??           // any English
    voices[0] ??                                            // absolute fallback
    null
  );
}

// ── Browser speechSynthesis ───────────────────────────────────────────────

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

  // One-shot finish guard
  let done = false;
  const finish = () => { if (!done) { done = true; onEnd?.(); } };

  // Safety net — unblock UI after 12 s no matter what
  const safety = setTimeout(finish, 12_000);

  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.rate = 0.9;

    const voice = pickVoice(langCode);
    if (voice) {
      utt.voice = voice;
      // CRITICAL: lang must match the voice's actual language.
      // Mismatching (e.g. lang="hi-IN" + English voice) causes Chrome to
      // silently drop the utterance with no audio and no error event.
      utt.lang = voice.lang;
    }
    // If no voice found at all, don't set lang — Chrome uses system default

    utt.onend  = () => { clearTimeout(safety); finish(); };
    utt.onerror = () => { clearTimeout(safety); finish(); };

    window.speechSynthesis.speak(utt);
  };

  // Voices load asynchronously on first page visit
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setTimeout(doSpeak, 120); // brief gap after cancel() avoids Chrome race
  } else {
    let fired = false;
    const onLoaded = () => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.onvoiceschanged = null;
      setTimeout(doSpeak, 120);
    };
    window.speechSynthesis.onvoiceschanged = onLoaded;
    setTimeout(onLoaded, 700); // fallback if onvoiceschanged never fires
  }
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
      browserSpeak(text, langCode, onEnd);
      return;
    }

    const data = await res.json();

    if (data.audio) {
      const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
      audio.onended = () => onEnd?.();
      audio.onerror = () => browserSpeak(text, langCode, onEnd);
      await audio.play().catch(() => browserSpeak(text, langCode, onEnd));
    } else {
      browserSpeak(text, langCode, onEnd);
    }
  } catch {
    clearTimeout(timeoutId);
    browserSpeak(text, langCode, onEnd);
  }
}
