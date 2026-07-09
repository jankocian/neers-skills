"use client";

import { useEffect, useState } from "react";

import { SECTIONS, type SectionId } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";

/** Sticky scrollspy — highlights the section currently in view. */
function SectionNav() {
  const [active, setActive] = useState<SectionId>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Sections" className="flex flex-col gap-0.5">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            active === s.id
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

export { SectionNav };
