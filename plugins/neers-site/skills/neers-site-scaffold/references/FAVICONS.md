# Favicons

Run this when the user hands you a logo — an SVG, anywhere. Nothing in the project
depends on it, so there is no rush and nothing fails while it's missing.

## Ask two things first

1. **Does the mark carry the brand colour?** A favicon is 16px on a browser tab. A mark
   that is pure `currentColor` will rasterize black, which is legible but anonymous.
   Recommend at least one shape in the brand colour.
2. **Same icon in light and dark?** Most brands ship one. If the mark is dark ink on
   transparent, it vanishes on a dark tab strip — see below.

Then read the SVG and fix these before generating anything:

- **`color="#…"` on the root.** Rasterizers have no CSS context, so `currentColor`
  resolves to its initial value — pure black — with no error. Browsers ignore the
  attribute.
- **`var(--color-…)` doesn't survive rasterization.** Give any accent shape a literal
  `fill` too, or it falls back.
- **A square-ish `viewBox`.** Favicons are 1:1; a wide wordmark letterboxes. Use the
  symbol, not the wordmark.
- **No `--` inside an XML comment.** It's malformed XML and SVGO throws.

## Generate

`SRC` is wherever the user's file is. Nothing is installed — both tools publish real
binaries, so `bunx` fetches them into bun's cache and leaves the project alone.

```bash
SRC=path/to/logo.svg
BG="#0B0B0F"   # opaque brand background; keep the quotes or the shell eats the #

mkdir -p src/app public
cp "$SRC" src/app/icon.svg

bunx sharp-cli -i "$SRC" -o src/app/icon.png resize 96 96

# Apple composites alpha onto black, so flatten.
bunx sharp-cli -i "$SRC" -o src/app/apple-icon.png resize 180 180 -- flatten "$BG"

# 16/32/48/64/128/256, each rendered natively from the vector.
bunx svg-to-ico "$SRC" src/app/favicon.ico

bunx sharp-cli -i "$SRC" -o public/icon-192.png resize 192 192
bunx sharp-cli -i "$SRC" -o public/icon-512.png resize 512 512

# Maskable: mark at 410px (80%), 51px padding each side. 410+51+51 = 512.
bunx sharp-cli -i "$SRC" -o public/icon-maskable-512.png \
  resize 410 410 -- flatten "$BG" -- extend 51 51 51 51 --background "$BG"
```

Next 16 emits the `<link>` tags for everything under `app/` automatically. There is
nothing to register.

## One icon, both themes

Put the media query inside `app/icon.svg`. A tab strip is the only place it matters, and
the raster icons are never shown there.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .ink { fill: #1c1b1a }
    @media (prefers-color-scheme: dark) { .ink { fill: #f5f4f2 } }
  </style>
  <path class="ink" d="…" />
  <circle cx="26" cy="24" r="2.5" fill="#5b5bd6" />
</svg>
```

The accent shape keeps its literal colour in both themes — that's the point of an accent.

Re-run the commands whenever the mark changes.
