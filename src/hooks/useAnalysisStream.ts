"use client";

import { useState, useCallback } from "react";

type StreamStatus = "idle" | "streaming" | "done" | "error";

export function useAnalysisStream() {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const startStream = useCallback(async (payload: object) => {
    setOutput("");
    setStatus("streaming");
    setStatusMessage("Başlatılıyor...");

    try {
      const response = await fetch("/api/analysis/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setStatus("error");
        setStatusMessage("API hatası");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setStatus("error");
        setStatusMessage("Stream okunamadı");
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "status") setStatusMessage(event.message);
            if (event.type === "chunk") setOutput((prev) => prev + event.text);
            if (event.type === "done") setStatus("done");
            if (event.type === "error") {
              setStatus("error");
              setStatusMessage(event.message);
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      setStatus((prev) => (prev === "streaming" ? "done" : prev));
    } catch (err) {
      setStatus("error");
      setStatusMessage(String(err));
    }
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setStatus("idle");
    setStatusMessage("");
  }, []);

  return { output, status, statusMessage, startStream, reset };
}
