import { json, readJson } from './supabase-client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST만 가능합니다.' });

  try {
    const body = await readJson(req);
    const expected = process.env.ADMIN_PASSWORD || '3883';
    if (String(body.password || '') !== String(expected)) {
      return json(res, 401, { ok: false, error: '비밀번호가 맞지 않습니다.' });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
}
