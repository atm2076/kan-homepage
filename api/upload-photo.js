import crypto from 'node:crypto';
import { getAdminClient, json, readJson, requireAdmin } from './supabase-client.js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'property-photos';

function extFromMime(mimeType = '') {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  return 'jpg';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST만 가능합니다.' });

  try {
    requireAdmin(req);
    const supabase = getAdminClient();
    const body = await readJson(req);
    const { dataUrl, mimeType = 'image/jpeg', propertyId = 'new', index = 0 } = body;

    if (!dataUrl || !String(dataUrl).includes('base64,')) {
      throw new Error('사진 데이터가 없습니다.');
    }

    const base64 = String(dataUrl).split('base64,').pop();
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 8 * 1024 * 1024) {
      throw new Error('사진 용량이 큽니다. 자동 압축 후 다시 시도하세요.');
    }

    const safePropertyId = String(propertyId || 'new').replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${safePropertyId}/${Date.now()}-${index}-${crypto.randomBytes(4).toString('hex')}.${extFromMime(mimeType)}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: '3600'
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return json(res, 200, { ok: true, url: data.publicUrl, path: fileName });
  } catch (error) {
    const status = error.statusCode || 500;
    return json(res, status, { ok: false, error: error.message || '사진 업로드 오류' });
  }
}
