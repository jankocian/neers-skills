// SVGR (next.config.ts turbopack rule) turns `import Mark from "./x.svg"` into a
// React component. Without this declaration TypeScript types the import as a
// string and every SVG import fails to typecheck.
declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const ReactComponent: FC<SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}
