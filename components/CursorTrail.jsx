"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, summary, [role=button]";

export default function CursorTrail() {
  const arrowRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return undefined;

    const root = document.documentElement;
    let frameId = 0;
    let pressTimeoutId;

    root.classList.add("has-cursor-trail");

    const move = (event) => {
      const { clientX, clientY, target } = event;
      const interactive =
        target instanceof Element && target.closest(INTERACTIVE_SELECTOR);

      root.classList.toggle("cursor-target", Boolean(interactive));

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (arrowRef.current) {
          arrowRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        }
      });
    };

    const press = () => {
      root.classList.remove("cursor-press");
      // Force a fresh animation when clicks happen in quick succession.
      void root.offsetWidth;
      root.classList.add("cursor-press");
      window.clearTimeout(pressTimeoutId);
      pressTimeoutId = window.setTimeout(
        () => root.classList.remove("cursor-press"),
        360
      );
    };

    const leave = () => root.classList.add("cursor-out");
    const enter = () => root.classList.remove("cursor-out");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(pressTimeoutId);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      root.classList.remove("has-cursor-trail", "cursor-target", "cursor-press", "cursor-out");
    };
  }, []);

  return (
    <div className="cursor-trail" aria-hidden="true">
      <svg
        ref={arrowRef}
        className="cursor-trail__arrow"
        viewBox="0 0 32 32"
        role="presentation"
      >
        <path
          d="M3 2.5v24.7l7.3-6.5 4.8 8.8 3.9-2.1-4.8-8.7h11.7L3 2.5Z"
          fill="#050505"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
}
