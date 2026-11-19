"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { GalleryImage } from "@/types/tenant";

interface GallerySectionProps {
  images: GalleryImage[];
}

export function GallerySection({ images }: GallerySectionProps) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelected(img)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-brand-primary/60 transition text-left bg-[#141414]"
          >
            <img
              src={img.url}
              alt={img.caption}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-primary text-white mb-1.5">
                {img.category}
              </span>
              <p className="text-xs sm:text-sm text-neutral-100 font-medium leading-snug">
                {img.caption}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Fechar foto"
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selected.url}
              alt={selected.caption}
              className="w-full max-h-[75vh] object-contain rounded-2xl border border-white/10"
            />
            <p className="text-center text-sm text-neutral-200 mt-3">
              {selected.caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

