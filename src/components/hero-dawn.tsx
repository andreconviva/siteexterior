"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const soften = (value: number) => value * value * (3 - 2 * value);

export function HeroDawn({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const scene = track?.querySelector<HTMLElement>(".hero");
    const action = scene?.querySelector<HTMLAnchorElement>(".hero-content a");
    if (!track || !scene || !action) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start = 0;
    let distance = 1;
    let previous = -1;

    const update = () => {
      frame = 0;
      const progress = reducedMotion.matches ? 0 : clamp((window.scrollY - start) / distance);
      if (progress === previous) return;
      previous = progress;

      // Finish the dawn before releasing the scene, leaving a moment to see the light.
      const daylight = soften(clamp(progress / 0.85));
      const fade = soften(clamp(progress / 0.65));
      scene.style.setProperty("--dawn", daylight.toFixed(4));
      scene.style.setProperty("--hero-copy-opacity", (1 - fade).toFixed(4));
      scene.style.setProperty("--hero-copy-y", (-24 * fade).toFixed(2) + "px");
      scene.toggleAttribute("data-copy-hidden", fade > 0.98);
      if (fade > 0.98) action.tabIndex = -1;
      else action.removeAttribute("tabindex");
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      // On short screens, let all the copy enter view before the scene pins.
      const stickyTop = Math.min(0, window.innerHeight - scene.offsetHeight);
      scene.style.setProperty("--hero-sticky-top", stickyTop + "px");
      start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
      distance = Math.max(1, track.offsetHeight - scene.offsetHeight);
      previous = -1;
      schedule();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    resizeObserver.observe(scene);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    reducedMotion.addEventListener("change", measure);
    measure();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  return <div className="hero-scroll" ref={trackRef}>{children}</div>;
}
