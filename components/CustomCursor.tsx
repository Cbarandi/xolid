"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const target = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const frame = useRef<number>(0);
  const [finePointer, setFinePointer] = useState(false);
  const [dot, setDot] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFinePointer(mq.matches);
    const onChange = () => setFinePointer(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!finePointer) return;

    const tick = () => {
      const t = target.current;
      const r = ring.current;
      const lerp = 0.14;
      ring.current = {
        x: r.x + (t.x - r.x) * lerp,
        y: r.y + (t.y - r.y) * lerp,
      };
      setRingPos({ ...ring.current });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [finePointer]);

  useEffect(() => {
    if (!finePointer) return;

    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setDot({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          transform: `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.22s ease",
        }}
        aria-hidden
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
      <div
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          transform: `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.22s ease",
        }}
        aria-hidden
      >
        <div className="h-10 w-10 rounded-full border border-white/22" />
      </div>
    </>
  );
}
