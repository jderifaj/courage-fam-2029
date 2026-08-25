// Every upload under /images/uploads/ gets a resized, compressed .opt.webp
// derivative at build time (scripts/optimize-images.mjs) — full-resolution
// phone photos are multiple megabytes and would make the page painfully
// slow otherwise. Static assets outside that folder (placeholders, the
// team logo) are already reasonably sized and are left alone.
export function resolvePhoto(photo) {
  if (!photo.startsWith('/images/uploads/')) return photo;
  return photo.replace(/\.[^./]+$/, '.opt.webp');
}
