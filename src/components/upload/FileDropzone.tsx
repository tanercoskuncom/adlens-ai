"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface UploadedFile {
  file: File;
  platform: "META" | "GOOGLE" | "UNKNOWN";
  status: "pending" | "detecting" | "ready" | "error";
  error?: string;
}

interface FileDropzoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // MB
}

const ACCEPTED_EXTENSIONS = ["xlsx", "csv", "xls"];

export function FileDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 50,
}: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = useCallback(
    async (file: File): Promise<"META" | "GOOGLE" | "UNKNOWN"> => {
      // Server-side detection via API
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/detect", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          return data.platform;
        }
      } catch {
        // Fallback: filename-based detection
      }

      const name = file.name.toLowerCase();
      if (
        name.includes("meta") ||
        name.includes("facebook") ||
        name.includes("instagram")
      )
        return "META";
      if (name.includes("google") || name.includes("adwords")) return "GOOGLE";
      return "UNKNOWN";
    },
    []
  );

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];

      for (const file of Array.from(fileList)) {
        // Extension check
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !ACCEPTED_EXTENSIONS.includes(ext)) {
          newFiles.push({
            file,
            platform: "UNKNOWN",
            status: "error",
            error: "Desteklenmeyen dosya formatı. .xlsx, .csv veya .xls yükleyin.",
          });
          continue;
        }

        // Size check
        if (file.size > maxSize * 1024 * 1024) {
          newFiles.push({
            file,
            platform: "UNKNOWN",
            status: "error",
            error: `Dosya boyutu ${maxSize}MB limitini aşıyor.`,
          });
          continue;
        }

        newFiles.push({
          file,
          platform: "UNKNOWN",
          status: "detecting",
        });
      }

      // Max files check
      const total = files.length + newFiles.length;
      if (total > maxFiles) {
        alert(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
        return;
      }

      const combined = [...files, ...newFiles];
      onFilesChange(combined);

      // Detect platforms for pending files
      const updated = await Promise.all(
        combined.map(async (f) => {
          if (f.status !== "detecting") return f;
          const platform = await detectPlatform(f.file);
          return {
            ...f,
            platform,
            status: platform === "UNKNOWN" ? ("error" as const) : ("ready" as const),
            error:
              platform === "UNKNOWN"
                ? "Platform tanınamadı. Meta veya Google Ads export dosyası olduğundan emin olun."
                : undefined,
          };
        })
      );

      onFilesChange(updated);
    },
    [files, onFilesChange, detectPlatform, maxFiles, maxSize]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const platformConfig = {
    META: { label: "Meta Ads", color: "bg-blue-100 text-blue-700" },
    GOOGLE: { label: "Google Ads", color: "bg-red-100 text-red-700" },
    UNKNOWN: { label: "Bilinmiyor", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-blue-400 bg-blue-50 scale-[1.01]"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        }`}
      >
        <Upload
          className={`w-12 h-12 mx-auto mb-3 transition-colors ${
            dragOver ? "text-blue-400" : "text-gray-300"
          }`}
        />
        <p className="text-gray-600 font-medium">
          Dosyaları sürükleyin veya tıklayın
        </p>
        <p className="text-sm text-gray-400 mt-1">
          .xlsx, .csv — Max {maxSize}MB — Meta Ads veya Google Ads export
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-lg ${
                f.status === "error" ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet
                  className={`w-5 h-5 shrink-0 ${
                    f.status === "error" ? "text-red-400" : "text-gray-400"
                  }`}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {f.file.name}
                  </span>
                  {f.error && (
                    <span className="text-xs text-red-500">{f.error}</span>
                  )}
                </div>
                {f.status === "ready" && (
                  <>
                    <Badge className={platformConfig[f.platform].color}>
                      {platformConfig[f.platform].label}
                    </Badge>
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  </>
                )}
                {f.status === "detecting" && (
                  <span className="text-xs text-gray-400 animate-pulse">
                    Tespit ediliyor...
                  </span>
                )}
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
