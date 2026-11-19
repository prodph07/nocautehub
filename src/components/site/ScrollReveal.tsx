"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * ScrollReveal blindado: renderiza visível por padrão no SSR (nunca deixa seções invisíveis),
 * aplicando apenas uma transição suave de entrada quando o navegador suporta IntersectionObserver.
 */
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"idle" | "hidden" | "visible">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setState("visible");
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      setState("visible");
      return;
    }

    setState("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const revealClass =
    state === "hidden"
      ? "reveal-hidden"
      : state === "visible"
      ? "reveal-hidden reveal-visible"
      : "";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`${revealClass} ${className}`}
    >
      {children}
    </div>
  );
}
