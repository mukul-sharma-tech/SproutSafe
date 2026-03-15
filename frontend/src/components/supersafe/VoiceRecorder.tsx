import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadVoiceMessage } from "@/api/superSafe";
import { toast } from "sonner";

type RecorderState = "idle" | "recording" | "recorded" | "uploading";

export function VoiceRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [previewUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      toast.error("Unable to access microphone. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const saveRecording = async () => {
    if (!previewUrl) return;
    setState("uploading");
    try {
      const resp = await fetch(previewUrl);
      const blob = await resp.blob();
      const formData = new FormData();
      formData.append("file", blob, "warning.webm");
      await uploadVoiceMessage(formData);
      toast.success("Voice message saved");
      setState("idle");
    } catch {
      toast.error("Failed to save voice message");
      setState("recorded");
    }
  };

  const resetRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setState("idle");
  };

  const isRecording = state === "recording";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {state === "idle" && (
          <Button type="button" variant="outline" onClick={startRecording}>
            Start Recording
          </Button>
        )}
        {state === "recording" && (
          <Button type="button" variant="destructive" onClick={stopRecording}>
            Stop Recording
          </Button>
        )}
        {state === "recorded" && (
          <>
            <Button type="button" variant="outline" onClick={startRecording}>
              Re-record
            </Button>
            <Button type="button" onClick={saveRecording}>
              Save Message
            </Button>
          </>
        )}
        {state === "uploading" && (
          <Button type="button" disabled>
            Saving...
          </Button>
        )}
        {previewUrl && state !== "recording" && (
          <Button type="button" variant="ghost" onClick={resetRecording}>
            Clear
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        This message will play when your child opens a blocked website. Recording is optional.
      </p>
      {previewUrl && (
        <audio className="mt-1 w-full" controls src={previewUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
      {!("MediaRecorder" in window) && (
        <p className="text-xs text-red-500 mt-1">
          Voice recording is not supported in this browser.
        </p>
      )}
    </div>
  );
}

