'use client';
import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

// Printable area of a US Letter page with 0.5in margins, in CSS pixels.
const PAGE_WIDTH = 7.5 * 96;
const PAGE_HEIGHT = 10 * 96 - 6; // small safety margin for rounding

function sheet(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.newspaper-sheet');
}

// Lays the sheet out at print width, then shrinks it (if needed) so the whole
// issue lands on one page. When it shrinks, the sheet is widened by the same
// factor so the scaled result still spans the full page width.
export function prepareForPrint() {
  const el = sheet();
  if (!el) return;
  document.documentElement.classList.add('print-mode');
  el.style.removeProperty('zoom');
  el.style.width = `${PAGE_WIDTH}px`;

  let scale = 1;
  for (let i = 0; i < 6; i++) {
    const height = el.scrollHeight;
    const next = Math.min(1, PAGE_HEIGHT / height);
    if (Math.abs(next - scale) < 0.003 && height * scale <= PAGE_HEIGHT) break;
    scale = next;
    el.style.width = `${PAGE_WIDTH / scale}px`;
  }
  // Final guard: never overflow, even if the last pass grew slightly.
  scale = Math.min(scale, PAGE_HEIGHT / el.scrollHeight);
  el.style.setProperty('zoom', String(scale));
}

export function cleanupAfterPrint() {
  const el = sheet();
  document.documentElement.classList.remove('print-mode');
  if (el) {
    el.style.removeProperty('zoom');
    el.style.removeProperty('width');
  }
}

export default function PrintButton() {
  useEffect(() => {
    // Also handles Ctrl/Cmd+P and the browser's own Print menu.
    window.addEventListener('beforeprint', prepareForPrint);
    window.addEventListener('afterprint', cleanupAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', prepareForPrint);
      window.removeEventListener('afterprint', cleanupAfterPrint);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        prepareForPrint();
        window.print();
      }}
      className="btn-outline"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print this issue
    </button>
  );
}
