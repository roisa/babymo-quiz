// Single source of truth for the GitHub Pages base path. Use this whenever you
// build a runtime URL to a /public asset or an internal route, so the app works
// both at the apex (basePath "") and under /babymo-quiz/.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/babymo-quiz";

/** Prefix a public-asset or route path with the configured base path. */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return path; // external / data URLs untouched
  return `${BASE_PATH}${path}`;
}
