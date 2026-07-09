import { routes, site } from "~/lib/site";

/**
 * /llms.txt — https://llmstxt.org/
 *
 * Be honest about what this is. Google has said publicly that Search does not
 * use llms.txt. Of ~38,000 domains that publish one, ~97% received zero requests
 * for it in May 2026. Its one demonstrated consumer is IDE agents (Cursor,
 * Claude Code, Copilot) and MCP servers.
 *
 * Ship it: the cost is this file. Do NOT expect GEO lift from it, and never
 * trade semantic HTML or JSON-LD for it — those ARE consumed.
 *
 * Spec order: H1 title (the only required section) -> blockquote summary ->
 * optional prose -> `##` sections of `- [name](url): description` links. An
 * `## Optional` H2 has special meaning: its URLs may be skipped when a shorter
 * context is needed.
 *
 * `/llms-full.txt` is NOT in the spec — it's a Mintlify/Vercel convention. Add
 * one only if you have real long-form docs to concatenate.
 */
export const dynamic = "force-static";

export function GET() {
  const link = (path: string, title: string, description: string) =>
    `- [${title}](${site.url}${path === "/" ? "" : path}): ${description}`;

  const main = routes.filter((r) => !r.optional);
  const optional = routes.filter((r) => r.optional);

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Pages",
    ...main.map((r) => link(r.path, r.title, r.description)),
    ...(optional.length
      ? [
          "",
          "## Optional",
          ...optional.map((r) => link(r.path, r.title, r.description)),
        ]
      : []),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
