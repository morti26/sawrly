import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('backend enforces the free creator media limits', async () => {
  const [photoRoute, videoRoute] = await Promise.all([
    read('app/api/media/photo/route.ts'),
    read('app/api/media/video/route.ts'),
  ]);

  assert.match(photoRoute, /MAX_FREE_CREATOR_IMAGES\s*=\s*8/);
  assert.match(videoRoute, /MAX_FREE_CREATOR_VIDEOS\s*=\s*4/);
});

test('server derives video duration from file and enforces one minute', async () => {
  const [uploadHelper, videoRoute, genericUploadRoute] = await Promise.all([
    read('lib/upload.ts'),
    read('app/api/media/video/route.ts'),
    read('app/api/upload/route.ts'),
  ]);

  assert.match(uploadHelper, /execFileAsync\(\s*'ffprobe'/);
  assert.match(videoRoute, /probeVideoDurationSeconds\(file\)/);
  assert.match(videoRoute, /MAX_FREE_VIDEO_DURATION_SECONDS\s*=\s*60/);
  assert.doesNotMatch(videoRoute, /formData\.get\(['"]durationSeconds['"]\)/);
  assert.match(genericUploadRoute, /probeVideoDurationSeconds\(file\)/);
  assert.match(genericUploadRoute, /MAX_VIDEO_DURATION_SECONDS\s*=\s*60/);
});
