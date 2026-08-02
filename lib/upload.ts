import { randomUUID } from 'crypto';
import {
  existsSync, mkdirSync, writeFile, readFileSync, unlinkSync,
  realpath, createReadStream
} from 'fs';
import {
  writeFile as writeFilePromise,
  readFile as readFilePromise,
  unlink as unlinkPromise,
} from 'fs/promises';
import { dirname, join, normalize, basename } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/tiff', 'image/heic', 'image/heif', 'image/bmp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.tif', '.heic', '.heif', '.bmp',
  '.mp4', '.mov', '.webm',
  '.pdf', '.doc', '.docx',
]);

const SUBDIR_RE = /^[a-zA-Z0-9_-]{0,64}$/;
const FINAL_IMAGE_EXT = 'jpg';

/** 🛡️ Magic byte identifiering (ÄKTA innehåll, inte extension!) */
function detectFileMagic(firstBytes: Buffer): { ext: string; mime: string; needsConvert: boolean } {
  const hex = firstBytes.toString('hex', 0, Math.min(16, firstBytes.length));
  if (hex.startsWith('ffd8ff')) return { ext: 'jpg', mime: 'image/jpeg', needsConvert: false };
  if (hex.startsWith('89504e470d0a1a0a')) return { ext: 'png', mime: 'image/png', needsConvert: false };
  if (hex.startsWith('52494646') && firstBytes.toString('ascii', 8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp', needsConvert: false };
  if (hex.startsWith('47494638')) return { ext: 'gif', mime: 'image/gif', needsConvert: false };
  if (hex.startsWith('49492a00') || hex.startsWith('4d4d002a')) return { ext: 'tiff', mime: 'image/tiff', needsConvert: true };
  if (firstBytes.length > 12 && firstBytes.toString('ascii', 4, 8) === 'ftyp') {
    const brand = firstBytes.toString('ascii', 8, 12);
    if (/^(heic|heix|heim|heis|hevm|hevx|mif1|msf1)/.test(brand)) {
      return { ext: 'heic', mime: 'image/heic', needsConvert: true };
    }
    return { ext: 'mp4', mime: 'video/mp4', needsConvert: false };
  }
  if (hex.startsWith('424d')) return { ext: 'bmp', mime: 'image/bmp', needsConvert: true };
  if (hex.startsWith('255044462d')) return { ext: 'pdf', mime: 'application/pdf', needsConvert: false };
  throw new Error(`Unsupported file content (magic=${hex.slice(0, 16)}). Accept images/video/PDF/DOC only.`);
}

function getFileExtension(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') throw new Error('Invalid filename');
  if (fileName.indexOf('\0') !== -1) throw new Error('Invalid filename (NUL byte)');
  const normalized = normalize(basename(fileName)).trim().toLowerCase();
  if (!normalized || normalized.startsWith('.') || normalized.includes('/') || normalized.includes('\\')) return '';
  const lastDot = normalized.lastIndexOf('.');
  if (lastDot <= 0) return '';
  return normalized.slice(lastDot);
}

export function buildUploadUrl(subDir: string, fileName: string): string {
  const s = (subDir || '').trim();
  const f = basename(normalize(fileName || ''));
  return `/uploads/${s ? `${s}/` : ''}${f}`;
}

export function normalizeUploadUrl(url: string | null | undefined): string {
  if (!url) return '';
  const t = String(url).trim();
  if (t.startsWith('/uploads/')) return t;
  if (t.startsWith('/api/uploads/')) return t.replace('/api/uploads/', '/uploads/');
  const m = t.match(/^\/(api\/)?uploads\/([^/]+)\/(.+)$/);
  if (m) return buildUploadUrl(m[2], m[3]);
  return t;
}

/** 💾 Huvudfunktion: spara uppladdad fil med auto-konvertering + auto-kontrast! */
export async function saveFile(file: File, subDir: string = ''): Promise<string> {
  const rawSub = typeof subDir === 'string' ? subDir.trim() : '';
  const cleanedSubDir = SUBDIR_RE.test(rawSub) ? rawSub : '';
  const uploadDir = join(process.cwd(), 'uploads', cleanedSubDir);
  if (!file || typeof file.arrayBuffer !== 'function') throw new Error('Invalid file');
  if (typeof file.size !== 'number' || file.size <= 0) throw new Error('Uploaded file is empty');
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('File size exceeds 150 MB limit');

  const rawName = typeof file.name === 'string' ? file.name.trim() : `upload_${Date.now()}`;
  const clientExt = getFileExtension(rawName);
  if (clientExt && !ALLOWED_EXTENSIONS.has(clientExt)) throw new Error('Unsupported file extension');

  const ab = await file.arrayBuffer();
  if (!ab || ab.byteLength < 4) throw new Error('Uploaded file is empty/corrupt');
  const buffer = Buffer.from(new Uint8Array(ab));
  const reportedMime = (typeof file.type === 'string' ? file.type : '').trim().toLowerCase();

  let detected = detectFileMagic(buffer);
  let finalBuffer: Buffer = buffer;
  let finalExt = detected.ext;

  const isLikelyVideo = reportedMime.startsWith('video/') && ['mp4','mov','webm'].includes(clientExt.replace('.',''));
  if (isLikelyVideo || detected.ext === 'mp4' || ['mp4','mov','webm'].includes(clientExt.replace('.',''))) {
    const ext = clientExt.replace('.', '') || detected.ext;
    const fileName = `${randomUUID()}.${ext}`;
    const savePath = join(uploadDir, fileName);
    await ensureDirAndWrite(savePath, finalBuffer);
    return buildUploadUrl(cleanedSubDir, fileName);
  }

  if (detected.ext === 'pdf' || ['pdf','doc','docx'].includes(clientExt.replace('.',''))) {
    const ext = detected.ext === 'pdf' ? 'pdf' : clientExt.replace('.','') || 'bin';
    const fileName = `${randomUUID()}.${ext}`;
    const savePath = join(uploadDir, fileName);
    await ensureDirAndWrite(savePath, finalBuffer);
    return buildUploadUrl(cleanedSubDir, fileName);
  }

  // ✨✨✨ BILD-hantering med AUTO KONVERTERING + AUTO KONTRAST! ✨✨✨
  try {
    const tmpIn = `/tmp/upload_conv_${process.pid}_${Date.now()}.${detected.ext}`;
    const tmpOut = `/tmp/upload_conv_${process.pid}_${Date.now()}.${FINAL_IMAGE_EXT}`;
    await writeFilePromise(tmpIn, buffer);

    // 🏆🏆🏆 MAGIC: convert + auto level + CLAHE + kontrast + sRGB!
    await execFileAsync('convert', [
      tmpIn,
      '-strip',
      '-auto-orient',
      '-auto-level',
      '-contrast-stretch', '0',
      
      '-gamma', '1.3',
      '-unsharp', '0x0.8+0.8+0.02',
      '-colorspace', 'sRGB',
      '-type', 'truecolor',
      '-depth', '8',
      '-quality', '92',
      '-define', 'jpeg:dct-method=float',
      '-sampling-factor', '4:2:0',
      tmpOut,
    ], { timeout: 180_000 });

    finalBuffer = await readFilePromise(tmpOut);
    finalExt = FINAL_IMAGE_EXT;
    try { await unlinkPromise(tmpIn); } catch {}
    try { await unlinkPromise(tmpOut); } catch {}
  } catch (e) {
    // Om konvertering misslyckas → använd original (t.ex. om ImageMagick inte finns)
    if (detected.needsConvert) throw new Error('Image auto-conversion (TIFF/HEIC → JPG) failed');
  }

  const mimeOk = !reportedMime || ALLOWED_MIME_TYPES.has(reportedMime);
  const extOk = ALLOWED_EXTENSIONS.has('.' + finalExt.toLowerCase());
  if (!(mimeOk && extOk || (!reportedMime && extOk))) throw new Error('Unsupported file');

  const fileName = `${randomUUID()}.${finalExt}`;
  const savePath = join(uploadDir, fileName);
  await ensureDirAndWrite(savePath, finalBuffer);
  return buildUploadUrl(cleanedSubDir, fileName);
}

async function ensureDirAndWrite(savePath: string, data: Buffer): Promise<void> {
  const d = dirname(savePath);
  if (!existsSync(d)) mkdirSync(d, { recursive: true, mode: 0o2775 });
  await new Promise<void>((resolve, reject) => {
    writeFile(savePath, data, { flag: 'wx', mode: 0o644 }, (err) => {
      if (!err) return resolve();
      if (err && (err as any).code === 'EEXIST') {
        writeFile(savePath, data, { mode: 0o644 }, (e2) => e2 ? reject(e2) : resolve());
      } else reject(err);
    });
  });
  const real = await new Promise<string>((res, rej) =>
    realpath(savePath, (e, r) => e ? rej(e) : res(r))
  );
  const expectedPrefix = normalize(join(process.cwd(), 'uploads'));
  if (!real.startsWith(expectedPrefix)) throw new Error('Security: path outside uploads prefix');
}
