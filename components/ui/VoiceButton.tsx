"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type Props = {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
  disabled?: boolean;
};

type State = "idle" | "listening";

export default function VoiceButton({ onTranscript, onInterim, disabled }: Props) {
  const { language } = useLanguage();
  const [state, setState] = useState<State>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // Track the last interim text so we can send it if isFinal never fires
  const lastInterimRef = useRef("");

  // Stop recognition if language changes mid-session
  useEffect(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, [language.code]);

  // ── Audio unlock ────────────────────────────────────────────────────────
  // Must run synchronously inside a click handler (user-gesture context).
  // Touches the audio system NOW so Chrome allows audio.play() later,
  // even after 5+ seconds of async API calls.
  function unlockAudio() {
    // 1. Unlock HTMLAudioElement (Sarvam WAV playback)
    try {
      const a = new Audio();
      a.volume = 0;
      a.play().catch(() => {});
    } catch {}

    // 2. Unlock Web Audio API context
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

  // ── Speech recognition ──────────────────────────────────────────────────
  function startListening() {
    // @ts-expect-error - webkit prefix
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Please use Google Chrome for voice input.");
      return;
    }

    lastInterimRef.current = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SpeechRec() as any;
    rec.lang = language.code;   // hi-IN, mr-IN, ta-IN …
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setState("listening");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (final += t) : (interim += t);
      }
      if (interim) {
        lastInterimRef.current = interim;
        onInterim?.(interim);
      }
      if (final) {
        lastInterimRef.current = "";
        onInterim?.("");
        onTranscript(final);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      console.error("Speech error:", e.error);
      setState("idle");
      onInterim?.("");
      lastInterimRef.current = "";
      if (e.error === "not-allowed")
        alert("Microphone blocked. Allow it in Chrome → Settings → Privacy → Microphone.");
      // Removed "no-speech" alert — it was annoying; just silently reset
    };

    rec.onend = () => {
      setState("idle");
      // isFinal sometimes never fires (network hiccup, pause timeout).
      // If we have unsent interim text, send it now so the message goes through.
      const pending = lastInterimRef.current.trim();
      lastInterimRef.current = "";
      if (pending) {
        onInterim?.("");
        onTranscript(pending);
      } else {
        onInterim?.("");
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setState("idle");
    onInterim?.("");
  }

  function handleClick() {
    if (disabled) return;
    if (state === "idle") {
      unlockAudio(); // synchronous — must happen in click handler
      startListening();
    } else {
      stopListening();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={state === "listening" ? "Tap to stop" : `Speak in ${language.nativeLabel}`}
      className={`
        relative flex flex-col items-center justify-center
        w-14 h-14 rounded-full shrink-0
        transition-all duration-200 active:scale-95
        ${state === "listening"
          ? "bg-red-500 shadow-lg shadow-red-200"
          : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {state === "listening" && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
          <span className="absolute -inset-1.5 rounded-full border-2 border-red-300 animate-pulse opacity-50" />
        </>
      )}
      {state === "listening"
        ? <MicOff size={22} className="text-white relative z-10" />
        : <Mic    size={22} className="text-white relative z-10" />
      }
    </button>
  );
}
