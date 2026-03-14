/**
 * ImageKit URL transformation utility.
 *
 * ImageKit supports URL-based transformations by inserting `/tr:...` into the URL path.
 * This utility takes a raw ImageKit URL and appends transformation parameters
 * to optimize image delivery (resize, quality, format).
 *
 * Example:
 *   optimizeImage("https://ik.imagekit.io/id/path/img.jpg", { w: 500, q: 80 })
 *   → "https://ik.imagekit.io/id/path/tr:w-500,q-80,f-auto/img.jpg"
 */

interface ImageKitTransformOptions {
  /** Width in pixels */
  w?: number;
  /** Height in pixels */
  h?: number;
  /** Quality 1-100 (default: auto) */
  q?: number;
  /** Focus area for crop: center, face, auto, etc. */
  fo?: "center" | "face" | "auto" | "top" | "bottom";
  /** Crop mode */
  c?: "maintain_ratio" | "force" | "at_least" | "at_max";
  /** Blur (1-100) */
  bl?: number;
}

/**
 * Checks if a URL is an ImageKit URL
 */
function isImageKitUrl(url: string): boolean {
  return url.includes("ik.imagekit.io");
}

/**
 * Appends ImageKit URL transformations to an image URL.
 * If the URL is not from ImageKit, returns the URL unchanged.
 *
 * By default, appends `f-auto` (automatic WebP/AVIF format negotiation).
 */
export function optimizeImage(
  url: string,
  options: ImageKitTransformOptions = {},
): string {
  if (!url || !isImageKitUrl(url)) return url;

  const transforms: string[] = [];

  if (options.w) transforms.push(`w-${options.w}`);
  if (options.h) transforms.push(`h-${options.h}`);
  if (options.q) transforms.push(`q-${options.q}`);
  if (options.fo) transforms.push(`fo-${options.fo}`);
  if (options.c) transforms.push(`c-${options.c}`);
  if (options.bl) transforms.push(`bl-${options.bl}`);

  // Always add auto format (serves WebP/AVIF when browser supports)
  transforms.push("f-auto");

  if (transforms.length === 0) return url;

  const trStr = `tr:${transforms.join(",")}`;

  // ImageKit URL format: https://ik.imagekit.io/<id>/<path>/<file>
  // Transform format: https://ik.imagekit.io/<id>/<path>/tr:w-500,q-80/<file>
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const fileName = pathParts.pop()!;
  urlObj.pathname = [...pathParts, trStr, fileName].join("/");

  return urlObj.toString();
}

// ─── Preset helpers for common sizes ────────────────────────────────────────

/** Card thumbnail on homepage (~800px max width, aspect-video) */
export function thumbCard(url: string): string {
  return optimizeImage(url, { w: 800, q: 90 });
}

/** Gallery main image (detail page inline view ~800px) */
export function galleryMain(url: string): string {
  return optimizeImage(url, { w: 900, q: 80 });
}

/** Gallery thumbnail strip (~400px) */
export function galleryThumb(url: string): string {
  return optimizeImage(url, { w: 400, q: 80 });
}

/** Fullscreen lightbox (full resolution, high quality) */
export function galleryFull(url: string): string {
  return optimizeImage(url, { w: 1920, q: 90 });
}

/** OG / Social sharing image (1200×630) */
export function ogImage(url: string): string {
  return optimizeImage(url, { w: 1200, h: 630, q: 80, c: "maintain_ratio" });
}

/** Admin form thumbnail preview (~300px) */
export function adminThumb(url: string): string {
  return optimizeImage(url, { w: 300, q: 70 });
}
