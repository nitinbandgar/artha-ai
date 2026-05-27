"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type State = "idle" | "recording" | "processing";

// Pick the best supported MIME type for this browser
function getSupportedMime(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export default function VoiceButton({ onTranscript, disabled }: Props) {
  const { language } = useLanguage();
  const [state, setState] = useState<State>("idle");
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-stop after 30s
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  useEffect(() => {
    if (seconds >= 30) stopRecording();
  }, [seconds]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getSupportedMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setState("processing");

        const mime = chunksRef.current[0]?.type || "audio/webm";
        const ext = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunksRef.current, { type: mime });

        try {
          const formData = new FormData();
          formData.append("file", blob, `audio.${ext}`);
          formData.append("languageCode", language.code);

          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();
          if (data.transcript?.trim()) {
            onTranscript(data.transcript.trim());
          } else {
            onTranscript(""); // signal failure silently
          }
        } catch (err) {
          console.error("STT error", err);
          onTranscript("");
        } finally {
          setState("idle");
        }
      };

      mediaRef.current = recorder;
      recorder.start(250); // collect chunks every 250ms
      setState("recording");
    } catch (err) {
      console.error("Mic access error", err);
      alert(`Could not access microphone.\n\nPlease allow microphone permission in your browser settings and try again.`);
      setState("idle");
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
  }

  function handleClick() {
    if (disabled || state === "processing") return;
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={
        state === "idle" ? `Tap to speak in ${language.nativeLabel}` :
        state === "recording" ? "Tap to stop recording" :
        "Processing your voice..."
      }
      className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-200 shadow-lg
        ${state === "recording"
          ? "bg-red-500 shadow-red-200"
          : state === "processing"
          ? "bg-indigo-400 shadow-indigo-200"
          : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    >
      {/* Pulse rings when recording */}
      {state === "recording" && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
          <span className="absolute -inset-2 rounded-full border-2 border-red-300 animate-pulse opacity-60" />
        </>
      )}

      {/* Icon */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        {state === "processing"
          ? <Loader2 size={22} className="text-white animate-spin" />
          : <Mic size={22} className="text-white" />
        }
        {state === "recording" && (
          <span className="text-[9px] text-white font-bold tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </span>
        )}
      </div>
    </button>
  );
}
