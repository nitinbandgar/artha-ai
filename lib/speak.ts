/**
 * speak.ts — TTS utility
 *
 * The core problem with browser audio:
 * Chrome only allows audio.play() within ~1 second of a user gesture.
 * Our API calls (Sarvam, Claude) take 2-8 seconds — gesture window is gone.
 *
 * Fix: call unlockAudio() synchronously at the START of every user-gesture
 * handler (mic tap, send button, 🔊 button) BEFORE any await.
 * Chrome marks the page as "audio allowed" for the session once any audio
 * context is touched during a gesture.
 *
 * playTTS() also calls it internally so the 🔊 button works standalone.
 */

// ── Audio unlock — call this synchronously inside a click/tap handler ─────

export function unlockAudio(): void {
  try { new Audio().play().catch(() => {}); } catch {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx() as AudioContext;
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume().catch(() => {});
    }
  } catch {}
}

// ── Browser speechSynthesis (zero-config — system default voice always works)

export function browserSpeak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume(); // un-stick Chrome if frozen

  let done = false;
  const finish = () => { if (!done) { done = true; onEnd?.(); } };
  const safety = setTimeout(finish, 12_000);

  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text.slice(0, 200));
    utt.rate = 0.9;
    utt.volume = 1;
    // NO lang, NO voice — system default, always produces audio
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
  // Unlock audio HERE — before the first await.
  // If playTTS() is called from a click handler (🔊 button), we're still
  // in the gesture context at this point. This keeps audio permitted
  // for the entire session even after the slow Sarvam fetch completes.
  unlockAudio();

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
      browserSpeak(text, onEnd);
      return;
    }

    const data = await res.json();

    if (data.audio) {
      const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
      audio.onended = () => onEnd?.();
      audio.onerror = () => browserSpeak(text, onEnd);
      await audio.play().catch(() => browserSpeak(text, onEnd));
    } else {
      browserSpeak(text, onEnd);
    }
  } catch {
    clearTimeout(timeoutId);
    browserSpeak(text, onEnd);
  }
}
