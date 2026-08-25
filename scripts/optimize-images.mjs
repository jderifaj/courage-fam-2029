// Runs before every build. Family/coach photos come in through Decap exactly
// as parents upload them — often multi-megabyte, full-resolution phone
// photos (sometimes HEIC, which browsers can't even render). Rather than
// make parents resize their own photos, we do it here: every upload under
// public/images/uploads gets a resized, compressed .opt.webp derivative,
// and src/lib/photo.js points <img> tags at that derivative instead of the
// original. The original stays untouched in the repo.
import convertHeic from 'heic-convert';
import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const UPLOADS_DIR = join(process.cwd(), 'public', 'images', 'uploads');
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 78;

const HEIC_RE = /\.(heic|heif)$/i;
const SUPPORTED_RE = /\.(heic|heif|jpe?g|png|webp|gif)$/i;
const OPTIMIZED_SUFFIX = '.opt.webp';

async function findImages(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findImages(full)));
    } else if (SUPPORTED_RE.test(entry.name) && !entry.name.endsWith(OPTIMIZED_SUFFIX)) {
      files.push(full);
    }
  }
  return files;
}

function optimizedPathFor(sourcePath) {
  return sourcePath.slice(0, sourcePath.length - extname(sourcePath).length) + OPTIMIZED_SUFFIX;
}

async function needsOptimization(sourcePath, optimizedPath) {
  try {
    const [sourceStat, optimizedStat] = await Promise.all([stat(sourcePath), stat(optimizedPath)]);
    return sourceStat.mtimeMs > optimizedStat.mtimeMs;
  } catch {
    return true; // optimized version doesn't exist yet
  }
}

async function optimizeOne(sourcePath) {
  const optimizedPath = optimizedPathFor(sourcePath);

  if (!(await needsOptimization(sourcePath, optimizedPath))) {
    console.log(`[optimize-images] Skipping ${basename(sourcePath)} (already optimized)`);
    return;
  }

  try {
    const inputBuffer = await readFile(sourcePath);
    const sharpInput = HEIC_RE.test(sourcePath)
      ? await convertHeic({ buffer: inputBuffer, format: 'PNG' })
      : inputBuffer;

    const webpBuffer = await sharp(sharpInput)
      .rotate() // apply EXIF orientation, then strip it, so photos don't end up sideways
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    await writeFile(optimizedPath, webpBuffer);
    console.log(
      `[optimize-images] ${basename(sourcePath)} (${(inputBuffer.length / 1024).toFixed(0)}KB) -> ` +
        `${basename(optimizedPath)} (${(webpBuffer.length / 1024).toFixed(0)}KB)`
    );
  } catch (err) {
    console.warn(`[optimize-images] Failed to optimize ${basename(sourcePath)}: ${err.message}`);
  }
}

const images = await findImages(UPLOADS_DIR);

if (images.length === 0) {
  console.log('[optimize-images] No uploaded images found, nothing to optimize.');
} else {
  console.log(`[optimize-images] Found ${images.length} uploaded image(s).`);
  for (const file of images) {
    await optimizeOne(file);
  }
}
