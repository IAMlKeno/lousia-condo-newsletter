"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLayout } from "../layout-context";
import { NEWSPAPER_NAME } from "@/lib/newsletter";

export const Header = () => {
  const { globalSettings } = useLayout();
  const header = globalSettings?.header;
  const nav = (header?.nav ?? []).filter(Boolean);
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (href?: string | null) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="site-header sticky top-0 z-30 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-[var(--ink)] sm:text-xl">
          {header?.name || NEWSPAPER_NAME}
        </Link>

        <ul className="hidden items-center gap-7 font-meta text-[0.8rem] uppercase tracking-[0.12em] md:flex">
          {nav.map((item, index) => (
            <li key={index}>
              <Link
                href={item!.href!}
                className={`py-1 transition-colors hover:text-[var(--ink)] ${
                  isActive(item!.href) ? "border-b border-[var(--accent)] text-[var(--ink)]" : "text-[var(--ink-muted)]"
                }`}
              >
                {item!.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="#subscribe" className="btn-ink !py-1.5 !text-[0.75rem] uppercase tracking-[0.12em]">
              Subscribe
            </a>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="-mr-2 p-2 text-[var(--ink)] md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-[var(--rule)] px-4 pb-4 pt-2 font-meta text-sm uppercase tracking-[0.12em] md:hidden">
          {nav.map((item, index) => (
            <li key={index}>
              <Link
                href={item!.href!}
                onClick={() => setOpen(false)}
                className={`block py-2.5 ${isActive(item!.href) ? "text-[var(--accent)]" : "text-[var(--ink-soft)]"}`}
              >
                {item!.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="#subscribe" onClick={() => setOpen(false)} className="block py-2.5 text-[var(--ink)]">
              Subscribe by email
            </a>
          </li>
        </ul>
      )}
    </header>
  );
};
