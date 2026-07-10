/**
 * Baseline-free layout auditing. Runs inside the page via `page.evaluate()`.
 *
 * Three findings, and only three. Each is *always* a bug, on any page, at any width —
 * so there is no severity tier and nothing to triage. Anything merely usually a
 * mistake (a `line-clamp`, a deliberate ellipsis, an `object-cover` crop) was removed:
 * it fired on correct pages, and a check people learn to ignore is worse than none.
 *
 * Contrast and touch-target size are NOT here. axe owns them, and it knows the
 * exceptions a geometry check doesn't.
 *
 * The caller must `settle(page)` first — measuring before fonts, images and entrance
 * animations have finished produces phantom findings.
 */

export type Finding = {
  kind: string;
  selector: string;
  detail: Record<string, unknown>;
};

/**
 * Serialised with `Function.prototype.toString()` and re-evaluated in the browser,
 * so it has NO access to module scope. Every constant it needs is declared in its own
 * body; a module-level `const` used here is a runtime ReferenceError, not a type error.
 *
 * @param cheap Skip everything but the scrollbar check.
 */
export function layoutAudit(cheap = false): Finding[] {
  /** Elements that legitimately have text content and a 0x0 box. */
  const NON_RENDERED = new Set([
    "TITLE",
    "DESC",
    "SCRIPT",
    "STYLE",
    "TEMPLATE",
    "NOSCRIPT",
    "OPTION",
    "BR",
  ]);

  const out: Finding[] = [];
  const de = document.documentElement;
  const vw = de.clientWidth;

  const sel = (el: Element): string => {
    if (el.id) return `#${el.id}`;
    const cls =
      typeof el.className === "string" && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
        : "";
    return `${el.tagName.toLowerCase()}${cls}`;
  };

  const depth = (el: Element): number => {
    let d = 0;
    let p = el.parentElement;
    while (p) {
      d++;
      p = p.parentElement;
    }
    return d;
  };

  const all = Array.from(document.querySelectorAll<HTMLElement>("body *"));

  // 1. An unwanted horizontal scrollbar. The only overflow that is always a bug.
  //
  //    A wide element is not itself a bug — that's routine inside overflow-clip /
  //    overflow-hidden / a scroll container. So culprits are reported only when the
  //    document actually scrolls, and only for elements no ancestor clips. Outermost
  //    only; children are carried along. A negative `left` never scrolls LTR.
  if (de.scrollWidth > de.clientWidth) {
    const visible = all.filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    const clipped = (el: Element) => {
      let p = el.parentElement;
      while (p) {
        if (getComputedStyle(p).overflowX !== "visible") return true;
        p = p.parentElement;
      }
      return false;
    };

    const culprits: Element[] = [];
    for (const el of visible
      .filter((el) => el.getBoundingClientRect().right > vw + 1)
      .filter((el) => !clipped(el))
      .sort((a, b) => depth(a) - depth(b))) {
      if (!culprits.some((c) => c.contains(el))) culprits.push(el);
    }

    out.push({
      kind: "document-overflow-x",
      selector: culprits.map(sel).join(", ") || "html",
      detail: {
        by: de.scrollWidth - de.clientWidth,
        vw,
        culprits: culprits.map((el) => ({
          selector: sel(el),
          overflowBy: Math.round(el.getBoundingClientRect().right - vw),
        })),
      },
    });
  }

  if (cheap) return out;

  // 2. Something that carries meaning rendered no box — a component that returned
  //    nothing, an icon that failed to import.
  for (const el of all) {
    // SVG elements preserve tagName case: an inline <title> is "title".
    if (NON_RENDERED.has(el.tagName.toUpperCase())) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const meaningful =
      !!el.textContent?.trim() ||
      // toUpperCase: an inline <svg> reports lowercase "svg".
      ["IMG", "SVG", "VIDEO", "BUTTON", "INPUT", "A"].includes(
        el.tagName.toUpperCase(),
      );
    if (!meaningful) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) {
      out.push({
        kind: "zero-size",
        selector: sel(el),
        detail: { width: r.width, height: r.height },
      });
    }
  }

  // 3. A broken image.
  for (const img of Array.from(document.images)) {
    if (img.complete && img.naturalWidth === 0) {
      out.push({
        kind: "img-broken",
        selector: sel(img),
        detail: { src: img.src },
      });
    }
  }

  return out;
}
