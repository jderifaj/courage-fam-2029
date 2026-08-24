// HEIC/HEIF uploads are converted to a same-named .webp file at build time
// by scripts/convert-heic.mjs. Browsers can't render HEIC directly, so any
// photo path ending in .heic/.heif should point at its .webp sibling instead.
export function resolvePhoto(photo) {
  return photo.replace(/\.(heic|heif)$/i, '.webp');
}
