import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let hover = false;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };
    const updateTextCursor = (target: Element | null) => {
      const isTextField = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("contenteditable") === "true");
      cursor.classList.toggle("cursor-hidden", isTextField);
      if (isTextField) hover = false;
    };
    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      updateTextCursor(e.target as Element);
    });
    document.addEventListener("scroll", () => {
      updateTextCursor(document.elementFromPoint(mousePos.x, mousePos.y));
    }, true);
    requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      requestAnimationFrame(loop);
    });
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const element = target.closest("[data-cursor]") as HTMLElement | null;
      if (element) {
        if (element.dataset.cursor === "icons") {
          const rect = element.getBoundingClientRect();
          cursor.classList.add("cursor-icons");
          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      }
      if (target.closest("[data-cursor-section='bright']")) {
        cursor.classList.add("cursor-bright");
      }
    };
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element;
      const related = e.relatedTarget as Element | null;
      if (related && target.contains(related)) return;
      const element = target.closest("[data-cursor]");
      if (element && !(related && related.closest("[data-cursor]") === element)) {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      }
      const bright = target.closest("[data-cursor-section='bright']");
      if (bright && !(related && related.closest("[data-cursor-section='bright']") === bright)) {
        cursor.classList.remove("cursor-bright");
      }
    };
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [enabled]);

  if (!enabled) return null;
  return createPortal(
    <div className="cursor-main" ref={cursorRef}></div>,
    document.body
  );
};

export default Cursor;