import { DEFAULT_PROPERTIES } from './default-properties.js';
import { getAdminClient, json, readJson, requireAdmin } from './supabase-client.js';

const TABLE = 'properties';
const PROPERTY_COLUMNS = [
  'sort_order', 'badge', 'title', 'short_title', 'location', 'landmark', 'property_type', 'deal_type',
  'deposit', 'rent', 'management', 'area', 'floor', 'direction', 'parking', 'move_in', 'approval_date',
  'rooms', 'options', 'summary', 'description', 'image_count', 'photos', 'photo_memo', 'facilities',
  'safety', 'education'
];

function normalizeProperty(input = {}) {
  const p = {};
  for (const key of PROPERTY_COLUMNS) {
    if (input[key] !== undefined) p[key] = input[key];
  }

  p.title = String(p.title || '').trim();
  if (!p.title) throw new Error('매물명은 필수입니다.');

  p.short_title = String(p.short_title || p.title).trim();
  p.location = String(p.location || '').trim();
  p.landmark = String(p.landmark || '').trim();
  p.property_type = String(p.property_type || '다가구주택 내 원룸').trim();
  p.deal_type = String(p.deal_type || '월세').trim();
  p.deposit = String(p.deposit || '').trim();
  p.rent = String(p.rent || '').trim();
  p.management = String(p.management || '계약 전 확인').trim();
  p.area = String(p.area || '계약 전 확인').trim();
  p.floor = String(p.floor || '계약 전 확인').trim();
  p.direction = String(p.direction || '계약 전 확인').trim();
  p.parking = String(p.parking || '계약 전 확인').trim();
  p.move_in = String(p.move_in || '협의 가능').trim();
  p.approval_date = String(p.approval_date || '계약 전 최종 확인').trim();
  p.rooms = String(p.rooms || '계약 전 확인').trim();
  p.options = String(p.options || '계약 전 최종 확인').trim();
  p.summary = String(p.summary || '').trim();
  p.description = String(p.description || p.summary || '').trim();
  p.badge = String(p.badge || '추천').trim();
  p.sort_order = Number.isFinite(Number(p.sort_order)) ? Number(p.sort_order) : 0;
  p.image_count = Math.max(1, Math.min(40, Number(p.image_count || 15)));
  p.photos = Array.isArray(p.photos) ? p.photos : [];
  p.photo_memo = Array.isArray(p.photo_memo) ? p.photo_memo : [];
  p.facilities = Array.isArray(p.facilities) ? p.facilities : [];
  p.safety = Array.isArray(p.safety) ? p.safety : [];
  p.education = Array.isArray(p.education) ? p.education : [];

  return p;
}

async function listProperties(supabase) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function resetDefaults(supabase) {
  const { error: deleteError } = await supabase.from(TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) throw deleteError;

  const rows = DEFAULT_PROPERTIES.map((property) => normalizeProperty(property)).map((property, index) => ({
    ...property,
    id: DEFAULT_PROPERTIES[index].id
  }));

  const { data, error } = await supabase.from(TABLE).insert(rows).select('*');
  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  try {
    const supabase = getAdminClient();

    if (req.method === 'GET') {
      const data = await listProperties(supabase);
      return json(res, 200, { ok: true, data });
    }

    requireAdmin(req);

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (body.action === 'reset-defaults') {
        const data = await resetDefaults(supabase);
        return json(res, 200, { ok: true, data });
      }

      if (body.action === 'import') {
        if (!Array.isArray(body.properties)) throw new Error('가져올 매물 배열이 없습니다.');
        const rows = body.properties.map((item) => normalizeProperty(item));
        const { error: deleteError } = await supabase.from(TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) throw deleteError;
        const { data, error } = await supabase.from(TABLE).insert(rows).select('*');
        if (error) throw error;
        return json(res, 200, { ok: true, data });
      }

      const row = normalizeProperty(body.property || body);
      const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
      if (error) throw error;
      return json(res, 201, { ok: true, data });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await readJson(req);
      const id = body.id || body.property?.id;
      if (!id) throw new Error('수정할 매물 id가 없습니다.');
      const row = normalizeProperty(body.property || body);
      const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select('*').single();
      if (error) throw error;
      return json(res, 200, { ok: true, data });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, `https://${req.headers.host}`);
      const id = url.searchParams.get('id');
      if (!id) throw new Error('삭제할 매물 id가 없습니다.');
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { ok: false, error: '지원하지 않는 요청입니다.' });
  } catch (error) {
    const status = error.statusCode || 500;
    return json(res, status, { ok: false, error: error.message || '서버 오류가 발생했습니다.' });
  }
}
