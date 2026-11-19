"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { optimizeImageToWebP } from "@/lib/image-optimizer";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "general",
  placeholder = "https://... ou faça upload (.webp automático)",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploading(true);
    setError("");

    try {
      const webpFile = await optimizeImageToWebP(rawFile, 1600, 0.82);
      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no upload");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-neutral-300">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 disabled:opacity-60 transition"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? "Convertendo..." : "Upload .webp"}</span>
        </button>
      </div>

      {value && (
        <div className="flex items-center gap-2 pt-1">
          <img
            src={value}
            alt="Preview"
            className="w-12 h-9 rounded object-cover border border-white/15 bg-neutral-900"
          />
          <span className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
            <ImageIcon className="w-3 h-3 shrink-0" />
            {value}
          </span>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

