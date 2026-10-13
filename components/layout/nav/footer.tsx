"use client";
import React from "react";
import Link from "next/link";
import { useLayout } from "../layout-context";
import SubscribeForm from "@/components/newsletter/subscribe-form";
import { NEWSPAPER_NAME } from "@/lib/newsletter";

export const Footer = () => {
  const { globalSettings } = useLayout();
  const header = globalSettings?.header;
  const footer = globalSettings?.footer;
  const name = header?.name || NEWSPAPER_NAME;

  return (
    <footer className="site-footer mt-16 border-t border-[var(--rule)] bg-[var(--paper)]">
      <SubscribeForm />
      <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <div className="flex flex-col gap-4 border-t border-[var(--ink)] pt-5 font-meta text-xs text-[var(--ink-muted)] md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {name}
              {footer?.contactEmail && (
                <>
                  {" · "}Questions for the board?{" "}
                  <a href={`mailto:${footer.contactEmail}`} className="text-[var(--ink-soft)] underline underline-offset-2">
                    {footer.contactEmail}
                  </a>
                </>
              )}
            </p>
            {footer?.note && <p className="max-w-xl">{footer.note}</p>}
          </div>
          <nav className="flex gap-5 uppercase tracking-[0.12em]">
            <Link href="/issues" className="hover:text-[var(--ink)]">Archive</Link>
            {/* Plain anchor: /admin is the TinaCMS app, not a Next.js route */}
            <a href="/admin" className="hover:text-[var(--ink)]">Board login</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};
