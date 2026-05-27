"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

type RecordState = "idle" | "recording" | "processing";

export default function VoiceButton({ onTranscript, disabled }: Props) {
  const { language } = useLanguage();
  const [state, setState] = useState<RecordState>("idle");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setState("processing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");
          formData.append("languageCode", language.code);

          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();
          if (data.transcript) onTranscript(data.transcript);
        } catch (err) {
          console.error("STT error", err);
        } finally {
          setState("idle");
        }
      };

      mediaRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch (err) {
      console.error("Mic error", err);
      alert("Could not access microphone. Please allow microphone permission.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
  }

  function handleClick() {
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || state === "processing"}
      title={
        state === "idle" ? `Speak in ${language.label}` :
        state === "recording" ? "Tap to stop" : "Processing..."
      }
      className={`relative p-3 rounded-xl transition-all disabled:opacity-50 ${
        state === "recording"
          ? "bg-red-500 text-white shadow-lg shadow-red-200"
          : state === "processing"
          ? "bg-indigo-100 text-indigo-600"
          : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
      }`}
    >
      {state === "recording" && (
        <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-60" />
      )}
      {state === "processing"
        ? <Loader2 size={18} className="animate-spin" />
        : state === "recording"
        ? <MicOff size={18} />
        : <Mic size={18} />
      }
    </button>
  );
}
