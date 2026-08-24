// Runs before every build. Family photos uploaded from an iPhone often come
// through as HEIC, which most browsers (Chrome, Firefox, Edge) can't display
// in an <img> tag. Rather than reject those uploads, we accept them in Decap
// and convert them here at build time to a .webp file with the same base
// name, which src/lib/photo.js then points <img> tags at.
import convertHeic from 'heic-convert';
import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const UPLOADS_DIR = join(process.cwd(), 'public', 'images', 'uploads');

async function findHeicFiles(dir) {
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
      files.push(...(await findHeicFiles(full)));
    } else if (/\.(heic|heif)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function needsConversion(heicPath, webpPath) {
  try {
    const [heicStat, webpStat] = await Promise.all([stat(heicPath), stat(webpPath)]);
    return heicStat.mtimeMs > webpStat.mtimeMs;
  } catch {
    return true; // webp doesn't exist yet
  }
}

async function convertOne(heicPath) {
  const webpPath = join(
    heicPath.slice(0, heicPath.length - extname(heicPath).length) + '.webp'
  );

  if (!(await needsConversion(heicPath, webpPath))) {
    console.log(`[convert-heic] Skipping ${basename(heicPath)} (already converted)`);
    return;
  }

  try {
    const inputBuffer = await readFile(heicPath);
    const pngBuffer = await convertHeic({ buffer: inputBuffer, format: 'PNG' });
    const webpBuffer = await sharp(pngBuffer).webp({ quality: 82 }).toBuffer();
    await writeFile(webpPath, webpBuffer);
    console.log(`[convert-heic] Converted ${basename(heicPath)} -> ${basename(webpPath)}`);
  } catch (err) {
    console.warn(`[convert-heic] Failed to convert ${basename(heicPath)}: ${err.message}`);
  }
}

const heicFiles = await findHeicFiles(UPLOADS_DIR);

if (heicFiles.length === 0) {
  console.log('[convert-heic] No HEIC/HEIF uploads found, nothing to convert.');
} else {
  console.log(`[convert-heic] Found ${heicFiles.length} HEIC/HEIF file(s).`);
  for (const file of heicFiles) {
    await convertOne(file);
  }
}
