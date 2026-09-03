"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; delay?: number };

export function Reveal({ children, className, delay = 0, style, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const motionStyle: CSSProperties = {
    ...style,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 580ms cubic-bezier(.4,0,.2,1) ${delay}s, transform 580ms cubic-bezier(.4,0,.2,1) ${delay}s`,
  };
  return <div ref={ref} className={className} style={motionStyle} {...props}>{children}</div>;
}
