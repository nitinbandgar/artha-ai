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

  // Stop recognition if language changes mid-session
  useEffect(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, [language.code]);

  function startListening() {
    // @ts-expect-error - webkit prefix
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Please use Google Chrome for voice input.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SpeechRec() as any;
    rec.lang = language.code;          // hi-IN, mr-IN, ta-IN …
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
      if (interim && onInterim) onInterim(interim);
      if (final) {
        onInterim?.("");          // clear interim
        onTranscript(final);     // fire auto-send
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      console.error("Speech error:", e.error);
      setState("idle");
      onInterim?.("");
      if (e.error === "not-allowed")
        alert("Microphone blocked. Allow it in Chrome → Settings → Privacy → Microphone.");
      else if (e.error === "no-speech")
        alert("No speech detected. Please try again.");
    };

    rec.onend = () => {
      setState("idle");
      onInterim?.("");
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
    state === "idle" ? startListening() : stopListening();
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
