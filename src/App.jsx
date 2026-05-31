import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Home,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  School,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '3883';
const LOCAL_STORAGE_KEY = 'kan-homepage-listings-v1';

const AREAS = ['전체', '인의동', '진평동', '구평동', '옥계동', '석적', '북삼'];
const TYPES = ['전체', '원룸 월세', '미니투룸 월세', '투룸 월세', '다가구 매매', '상가 임대'];

const sampleListings = [
  {
    id: 'sample-1',
    title: '구미 인의동 원룸 월세',
    headline: '200/30 관리비포함 · 리모델링 풀옵션',
    price: '보증금 200만원 / 월세 30만원',
    deposit: 200,
    monthly: 30,
    manageFee: '관리비 포함',
    area: '인의동',
    location: '경북 구미시 인의동 로데오거리 생활권',
    summary: '리모델링 풀옵션, 인동 로데오거리 인근, 공단 출퇴근 동선 보기 좋은 원룸입니다.',
    type: '원룸 월세',
    status: '즉시입주 협의',
    tags: ['관리비포함', '풀옵션', '직장인추천', '공단출퇴근'],
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    ],
    facilities: ['편의점 도보권', '인동 상권 인접', '버스 이용 편리', '식당·카페 생활권'],
    safety: ['공동현관', 'CCTV', '밝은 골목 생활권'],
    education: ['경운대 통학권', '인의초 생활권', '학원가 접근 가능'],
  },
  {
    id: 'sample-2',
    title: '구미 진평동 미니투룸 월세',
    headline: '500/45 관리비포함 · 강동병원 인근',
    price: '보증금 500만원 / 월세 45만원',
    deposit: 500,
    monthly: 45,
    manageFee: '관리비 포함',
    area: '진평동',
    location: '경북 구미시 진평동 강동병원 인근',
    summary: '방 분리형 구조, 국가산단 출퇴근 동선, 깔끔한 내부 컨디션의 미니투룸입니다.',
    type: '미니투룸 월세',
    status: '입주일 협의',
    tags: ['분리형', '관리비포함', '강동병원', '국가산단'],
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=1200&auto=format&fit=crop',
    ],
    facilities: ['강동병원 인근', '마트 접근 좋음', '먹자골목 생활권', '버스정류장 인근'],
    safety: ['주차공간', 'CCTV', '현관 보안'],
    education: ['초중고 생활권', '학원가 차량 이동권'],
  },
  {
    id: 'sample-3',
    title: '구미 옥계동 원룸 월세',
    headline: '200/30 관리비포함 · 4공단 출퇴근 추천',
    price: '보증금 200만원 / 월세 30만원',
    deposit: 200,
    monthly: 30,
    manageFee: '관리비 포함',
    area: '옥계동',
    location: '경북 구미시 옥계동 4공단 생활권',
    summary: '월 부담을 줄이기 좋은 조건, 공단 출퇴근과 옥계 생활권을 함께 보기 좋은 원룸입니다.',
    type: '원룸 월세',
    status: '즉시입주 가능',
    tags: ['월세30만원대', '관리비포함', '4공단', '가성비'],
    photos: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560440021-33f9b867899d?q=80&w=1200&auto=format&fit=crop',
    ],
    facilities: ['옥계 상권 차량권', '공단 출퇴근 동선', '마트·편의점 접근'],
    safety: ['주차 편리', 'CCTV 확인', '주거 밀집 생활권'],
    education: ['금오공대 차량권', '옥계 학원가 접근'],
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function toDbListing(item) {
  return {
    title: item.title,
    headline: item.headline,
    price: item.price,
    deposit: Number(item.deposit || 0),
    monthly: Number(item.monthly || 0),
    manage_fee: item.manageFee,
    area: item.area,
    location: item.location,
    summary: item.summary,
    type: item.type,
    status: item.status,
    tags: item.tags || [],
    photos: item.photos || [],
    facilities: item.facilities || [],
    safety: item.safety || [],
    education: item.education || [],
    sort_order: item.sortOrder || 0,
  };
}

function fromDbListing(item) {
  return {
    id: item.id,
    title: item.title || '',
    headline: item.headline || '',
    price: item.price || '',
    deposit: item.deposit || 0,
    monthly: item.monthly || 0,
    manageFee: item.manage_fee || '관리비 포함',
    area: item.area || '',
    location: item.location || '',
    summary: item.summary || '',
    type: item.type || '',
    status: item.status || '',
    tags: item.tags || [],
    photos: item.photos || [],
    facilities: item.facilities || [],
    safety: item.safety || [],
    education: item.education || [],
    sortOrder: item.sort_order || 0,
  };
}

function parseLines(value, fallback = []) {
  const lines = String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : fallback;
}

function InfoChip({ children, tone = 'light' }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold shadow-sm', tone === 'dark' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white text-slate-700 ring-1 ring-slate-200')}>
      {children}
    </span>
  );
}

function SectionToggle({ icon: Icon, title, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span className="flex items-center gap-2 text-sm font-black text-slate-900"><Icon size={18} className="text-blue-600" /> {title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 py-4">
              <ul className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                {items.map((item, idx) => <li key={idx} className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold">• {item}</li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadModal({ mode, listing, onClose }) {
  const [sent, setSent] = useState(false);
  const title = mode === 'request' ? '매물의뢰하기' : '매물상담신청';
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-blue-600">KAN REAL ESTATE</p>
            <h2 className="text-2xl font-black text-slate-950">{title}</h2>
            {listing && <p className="mt-1 text-sm font-semibold text-slate-500">{listing.title} · {listing.headline}</p>}
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X size={20} /></button>
        </div>
        {sent ? (
          <div className="rounded-3xl bg-blue-50 p-6 text-center">
            <CheckCircle2 className="mx-auto text-blue-600" size={44} />
            <p className="mt-3 text-xl font-black text-slate-950">접수되었습니다</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">현재는 화면 예시입니다. 실제 상담 접수 저장은 다음 단계에서 DB 테이블을 추가로 연결하면 됩니다.</p>
            <button onClick={onClose} className="mt-5 rounded-2xl bg-slate-900 px-6 py-3 font-black text-white">닫기</button>
          </div>
        ) : (
          <div className="grid gap-3">
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" placeholder="성함" />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" placeholder="연락처" />
            <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500">
              <option>원룸 월세 문의</option>
              <option>투룸 월세 문의</option>
              <option>다가구 매매 문의</option>
              <option>매물 의뢰</option>
              <option>투자 상담</option>
            </select>
            <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" placeholder="원하는 지역, 보증금/월세, 입주일, 문의 내용을 적어주세요." />
            <button onClick={() => setSent(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white shadow-lg hover:bg-blue-700"><Send size={18} /> 접수하기</button>
            <a href="tel:010-5323-3883" className="rounded-2xl bg-slate-100 py-4 text-center font-black text-slate-900 hover:bg-slate-200">전화가 빠르면 바로 상담하기</a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ListingDetail({ listing, onClose, onLead }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="mx-auto max-w-6xl rounded-[2rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[2rem] border-b bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-black text-blue-600">실사진 중심 상세보기</p>
            <h2 className="text-xl font-black text-slate-950 md:text-2xl">{listing.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200"><X size={22} /></button>
        </div>
        <div className="p-5 md:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100">
              <img src={listing.photos[0]} alt={listing.title} className="h-[360px] w-full object-cover md:h-[500px]" />
            </div>
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="mb-4 flex flex-wrap gap-2">{listing.tags.map((tag) => <InfoChip key={tag} tone="dark">#{tag}</InfoChip>)}</div>
              <p className="text-sm font-bold text-blue-300">{listing.headline}</p>
              <h3 className="mt-2 text-3xl font-black leading-tight">{listing.price}</h3>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4"><b>관리비</b><br />{listing.manageFee}</div>
                <div className="rounded-2xl bg-white/10 p-4"><b>위치</b><br />{listing.location}</div>
                <div className="rounded-2xl bg-white/10 p-4"><b>입주</b><br />{listing.status}</div>
              </div>
              <button onClick={() => onLead('consult', listing)} className="mt-5 w-full rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-500">이 매물 상담신청</button>
              <a href="tel:010-5323-3883" className="mt-3 block w-full rounded-2xl bg-white py-4 text-center font-black text-slate-950 hover:bg-slate-100">전화상담 010-5323-3883</a>
            </div>
          </div>
          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><Sparkles className="text-blue-600" /> 핵심 요약</h3>
            <p className="mt-3 leading-8 text-slate-700">{listing.summary}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {listing.photos.map((photo, idx) => (
              <div key={idx} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200">
                <img src={photo} alt={`${listing.title} 사진 ${idx + 1}`} className="h-72 w-full object-cover" />
                <div className="px-4 py-3 text-sm font-bold text-slate-700">{idx + 1}. {listing.area} {listing.type} 실사진</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 font-black text-slate-950"><MapPin size={20} className="text-blue-600" /> 지도 위치 영역</div>
              <div className="grid h-72 place-items-center rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-blue-50 text-center text-sm font-bold text-slate-500">
                네이버지도 또는 카카오지도 연결 영역<br />매물 생활권 지도 + 칸공인중개사 위치 지도 구성 권장
              </div>
            </div>
            <div className="grid gap-3">
              <SectionToggle icon={Store} title="편의시설" items={listing.facilities} />
              <SectionToggle icon={ShieldCheck} title="안전시설" items={listing.safety} />
              <SectionToggle icon={School} title="교육시설" items={listing.education} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminLogin({ onLogin, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLogin();
    } else {
      setError('비밀번호가 맞지 않습니다.');
    }
  };
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.form onSubmit={submit} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-xs font-black text-blue-600">KAN ADMIN</p><h2 className="text-xl font-black text-slate-950">관리자 잠금 해제</h2></div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2"><X size={20} /></button>
        </div>
        <label className="text-sm font-black text-slate-700">관리자 비밀번호</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg outline-none focus:border-blue-500" autoFocus />
        {error && <p className="mt-2 text-sm font-bold text-red-500">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-slate-950 py-3 font-black text-white hover:bg-black">관리자 모드 열기</button>
        <p className="mt-3 text-center text-xs text-slate-400">임시 비밀번호: {ADMIN_PASSWORD}</p>
      </motion.form>
    </div>
  );
}

function AdminPanel({ listings, onAdd, onDelete, onClose, storageMode }) {
  const [form, setForm] = useState({
    title: '', headline: '', price: '', deposit: '', monthly: '', manageFee: '관리비 포함', area: '인의동', location: '', summary: '', type: '원룸 월세', status: '즉시입주 협의', photoUrls: '', tags: '실사진\n직접확인\n상담가능', facilities: '주변 편의시설 확인', safety: '보안시설 확인', education: '교육시설 확인',
  });
  const [saving, setSaving] = useState(false);

  const addListing = async () => {
    if (!form.title || !form.price) return alert('매물 제목과 가격은 꼭 입력해주세요.');
    setSaving(true);
    const item = {
      id: `local-${Date.now()}`,
      title: form.title,
      headline: form.headline || form.price,
      price: form.price,
      deposit: Number(form.deposit || 0),
      monthly: Number(form.monthly || 0),
      manageFee: form.manageFee,
      area: form.area,
      location: form.location || '위치 상담 시 안내',
      summary: form.summary || '상세 내용은 상담 시 안내드립니다.',
      type: form.type,
      status: form.status,
      tags: parseLines(form.tags, ['실사진', '직접확인', '상담가능']),
      photos: parseLines(form.photoUrls, ['https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=1200&auto=format&fit=crop']),
      facilities: parseLines(form.facilities, ['주변 편의시설 확인']),
      safety: parseLines(form.safety, ['보안시설 확인']),
      education: parseLines(form.education, ['교육시설 확인']),
      sortOrder: Date.now(),
    };
    await onAdd(item);
    setSaving(false);
    setForm({ title: '', headline: '', price: '', deposit: '', monthly: '', manageFee: '관리비 포함', area: '인의동', location: '', summary: '', type: '원룸 월세', status: '즉시입주 협의', photoUrls: '', tags: '실사진\n직접확인\n상담가능', facilities: '주변 편의시설 확인', safety: '보안시설 확인', education: '교육시설 확인' });
  };

  return (
    <div className="fixed inset-0 z-[65] overflow-y-auto bg-slate-950/85 px-4 py-6 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl rounded-[2rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[2rem] border-b bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div><p className="text-xs font-black text-blue-600">대표님 전용 · {storageMode}</p><h2 className="text-xl font-black text-slate-950">관리자 매물관리</h2></div>
          <button onClick={onClose} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black hover:bg-slate-200"><LogOut size={18} /> 나가기</button>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-[430px_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2 font-black text-slate-950"><Plus size={20} className="text-blue-600" /> 매물 등록</div>
            <div className="grid gap-3">
              <input className="rounded-2xl border px-4 py-3" placeholder="매물 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="rounded-2xl border px-4 py-3" placeholder="한 줄 문구 예: 200/30 관리비포함" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
              <input className="rounded-2xl border px-4 py-3" placeholder="가격 예: 보증금 200만원 / 월세 30만원" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><input className="rounded-2xl border px-4 py-3" placeholder="보증금 숫자" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /><input className="rounded-2xl border px-4 py-3" placeholder="월세 숫자" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} /></div>
              <input className="rounded-2xl border px-4 py-3" placeholder="관리비" value={form.manageFee} onChange={(e) => setForm({ ...form, manageFee: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><select className="rounded-2xl border px-4 py-3" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>{AREAS.filter(a => a !== '전체').map(a => <option key={a}>{a}</option>)}</select><select className="rounded-2xl border px-4 py-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.filter(t => t !== '전체').map(t => <option key={t}>{t}</option>)}</select></div>
              <input className="rounded-2xl border px-4 py-3" placeholder="위치" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input className="rounded-2xl border px-4 py-3" placeholder="입주 상태" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              <textarea className="min-h-24 rounded-2xl border px-4 py-3" placeholder="핵심 설명" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              <textarea className="min-h-24 rounded-2xl border px-4 py-3" placeholder="사진 URL 여러 개. 한 줄에 하나씩" value={form.photoUrls} onChange={(e) => setForm({ ...form, photoUrls: e.target.value })} />
              <textarea className="min-h-20 rounded-2xl border px-4 py-3" placeholder="태그. 한 줄에 하나씩" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <button disabled={saving} onClick={addListing} className="rounded-2xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-60">{saving ? '등록 중...' : '매물 등록하기'}</button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><div className="font-black text-slate-950">등록 매물 목록</div><div className="text-xs font-bold text-slate-500">총 {listings.length}개</div></div>
            <div className="grid gap-3">
              {listings.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-3xl border border-slate-200 p-3">
                  <img src={item.photos[0]} alt={item.title} className="h-20 w-24 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate font-black text-slate-950">{item.title}</p><p className="text-sm font-bold text-blue-600">{item.price}</p><p className="truncate text-xs text-slate-500">{item.summary}</p></div>
                  <button onClick={() => onDelete(item.id)} className="rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ListingCard({ listing, onClick }) {
  return (
    <motion.button whileHover={{ y: -5 }} onClick={onClick} className="group overflow-hidden rounded-[2rem] bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-2xl">
      <div className="relative overflow-hidden">
        <img src={listing.photos[0]} alt={listing.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{listing.type}</div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 backdrop-blur">{listing.area}</div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur"><Camera size={14} /> 사진 {listing.photos.length}장</div>
      </div>
      <div className="p-5">
        <p className="text-sm font-black text-blue-600">{listing.headline}</p>
        <h3 className="mt-1 text-xl font-black text-slate-950">{listing.title}</h3>
        <p className="mt-2 font-black text-slate-800">{listing.price}</p>
        <p className="mt-1 text-sm font-bold text-slate-500">{listing.manageFee} · {listing.status}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{listing.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">{listing.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">#{tag}</span>)}</div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">상세보기 <ArrowRight size={17} className="transition group-hover:translate-x-1" /></div>
      </div>
    </motion.button>
  );
}

export default function App() {
  const [listings, setListings] = useState(sampleListings);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('전체');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [lead, setLead] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const storageMode = hasSupabaseConfig ? 'Supabase DB 저장' : '브라우저 임시 저장';

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      if (hasSupabaseConfig) {
        const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) setListings(data.map(fromDbListing));
        if (error) console.error(error);
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) setListings(JSON.parse(saved));
      }
      setLoading(false);
    }
    loadListings();
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig && !loading) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
  }, [listings, loading]);

  const addListing = async (item) => {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('listings').insert(toDbListing(item)).select('*').single();
      if (error) return alert(`등록 실패: ${error.message}`);
      setListings((prev) => [fromDbListing(data), ...prev]);
      return;
    }
    setListings((prev) => [item, ...prev]);
  };

  const deleteListing = async (id) => {
    if (!confirm('이 매물을 삭제할까요?')) return;
    if (hasSupabaseConfig && !String(id).startsWith('sample-') && !String(id).startsWith('local-')) {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) return alert(`삭제 실패: ${error.message}`);
    }
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredListings = useMemo(() => listings.filter((item) => {
    const matchArea = areaFilter === '전체' || item.area === areaFilter;
    const matchType = typeFilter === '전체' || item.type === typeFilter;
    const target = `${item.title} ${item.area} ${item.type} ${item.summary} ${item.price} ${(item.tags || []).join(' ')}`.toLowerCase();
    const matchKeyword = !keyword || target.includes(keyword.toLowerCase());
    return matchArea && matchType && matchKeyword;
  }), [listings, areaFilter, typeFilter, keyword]);

  const onLead = (mode, listing = null) => setLead({ mode, listing });

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">K</div><div><p className="text-base font-black leading-4">칸공인중개사</p><p className="text-xs font-bold text-slate-500">구미 원룸·투룸·다가구매매</p></div></div>
          <nav className="hidden items-center gap-2 md:flex"><a href="#listings" className="rounded-full px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100">매물보기</a><a href="#invest" className="rounded-full px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100">투자상담</a><a href="#trust" className="rounded-full px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100">중개사정보</a><button onClick={() => onLead('request')} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-black text-white hover:bg-black">매물의뢰</button></nav>
          <button className="rounded-2xl bg-slate-100 p-3 md:hidden" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20} /></button>
        </div>
        <AnimatePresence>{mobileMenu && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t bg-white md:hidden"><div className="grid gap-2 px-5 py-4"><a href="#listings" className="rounded-2xl bg-slate-50 px-4 py-3 font-black">매물보기</a><a href="#invest" className="rounded-2xl bg-slate-50 px-4 py-3 font-black">투자상담</a><button onClick={() => onLead('request')} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white">매물의뢰</button></div></motion.div>}</AnimatePresence>
      </header>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb_0,transparent_38%),radial-gradient(circle_at_bottom_right,#0f172a_0,transparent_42%)]" />
        <img src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop" alt="칸공인중개사 배경" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2"><InfoChip tone="dark">구미 원룸 월세</InfoChip><InfoChip tone="dark">구미 다가구매매</InfoChip><InfoChip tone="dark">수익형 부동산 투자</InfoChip></div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">구미 방 찾기,<br />사진 보고 바로 상담하세요</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">원룸·미니투룸·투룸 월세부터 다가구 매매까지, 실사진·가격·생활권을 먼저 보여드리고 빠르게 상담 연결합니다.</p>
            <div className="mt-8 grid gap-3 sm:flex"><a href="tel:010-5323-3883" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-2xl shadow-blue-950/30 hover:bg-blue-500"><Phone size={20} /> 전화상담</a><button onClick={() => onLead('request')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-slate-950 shadow-2xl hover:bg-slate-100"><Home size={20} /> 매물의뢰하기</button></div>
          </div>
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950"><div className="flex items-center justify-between"><div><p className="text-xs font-black text-blue-600">빠른 매물 찾기</p><h2 className="text-2xl font-black">조건만 고르면 바로 검색</h2></div><SlidersHorizontal className="text-blue-600" /></div><div className="mt-4 grid gap-3"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3"><Search size={18} className="text-slate-400" /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 인의동 원룸, 관리비포함, 30만원대" className="w-full bg-transparent text-sm font-semibold outline-none" /></div><div className="grid grid-cols-2 gap-3"><select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black outline-none">{AREAS.map((a) => <option key={a}>{a}</option>)}</select><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black outline-none">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div><a href="#listings" className="rounded-2xl bg-slate-950 py-4 text-center font-black text-white hover:bg-black">매물 {filteredListings.length}개 보기</a></div></div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-white"><div className="rounded-3xl bg-white/10 p-4"><p className="text-2xl font-black">실사진</p><p className="text-xs font-bold text-slate-300">중심 안내</p></div><div className="rounded-3xl bg-white/10 p-4"><p className="text-2xl font-black">빠른</p><p className="text-xs font-bold text-slate-300">전화 연결</p></div><div className="rounded-3xl bg-white/10 p-4"><p className="text-2xl font-black">구미</p><p className="text-xs font-bold text-slate-300">지역 전문</p></div></div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="grid gap-4 md:grid-cols-4"><div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-2"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Building2 /></div><div><p className="text-2xl font-black">구미 생활권별 매물</p><p className="text-sm font-bold text-slate-500">인의동·진평동·구평동·옥계동 중심</p></div></div></div><div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm"><Camera className="text-blue-300" /><p className="mt-3 text-xl font-black">실사진 우선</p><p className="text-sm text-slate-300">사진 보고 문의 결정</p></div><div className="rounded-[2rem] bg-blue-600 p-5 text-white shadow-sm"><Clock3 /><p className="mt-3 text-xl font-black">빠른 상담</p><p className="text-sm text-blue-100">전화·문자 바로 연결</p></div></section>

        <section id="listings" className="mt-12"><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-black text-blue-600">추천 매물 {filteredListings.length}개</p><h2 className="text-3xl font-black text-slate-950 md:text-4xl">오늘 볼 수 있는 매물</h2></div><div className="flex flex-wrap gap-2">{AREAS.map((area) => <button key={area} onClick={() => setAreaFilter(area)} className={cn('rounded-full px-4 py-2 text-sm font-black', areaFilter === area ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200')}>{area}</button>)}</div></div><div className="mb-6 flex flex-wrap gap-2">{TYPES.map((type) => <button key={type} onClick={() => setTypeFilter(type)} className={cn('rounded-full px-4 py-2 text-sm font-black', typeFilter === type ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200')}>{type}</button>)}</div>{filteredListings.length === 0 ? <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><p className="text-xl font-black">조건에 맞는 매물이 없습니다</p><p className="mt-2 text-sm font-semibold text-slate-500">검색어를 줄이거나 전체 지역으로 다시 확인해보세요.</p></div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredListings.map((listing) => <ListingCard key={listing.id} listing={listing} onClick={() => setSelectedListing(listing)} />)}</div>}</section>

        <section id="invest" className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl"><p className="text-sm font-black text-blue-300">투자자 상담</p><h2 className="mt-2 text-3xl font-black leading-tight">구미 다가구매매는 수익 구조부터 봅니다</h2><p className="mt-4 leading-8 text-slate-300">매매가만 보는 것이 아니라 월세수익, 보증금, 공실률, 수리상태, 주차, 임대수요까지 함께 검토합니다.</p><button onClick={() => onLead('consult')} className="mt-6 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white hover:bg-blue-500">투자매물 상담신청</button></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><Wallet className="text-blue-600" /><p className="mt-4 text-xl font-black">월세수익</p><p className="mt-2 text-sm leading-6 text-slate-500">보증금·월세·실수익 구조 확인</p></div><div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><Building2 className="text-blue-600" /><p className="mt-4 text-xl font-black">임대수요</p><p className="mt-2 text-sm leading-6 text-slate-500">공단·대학·생활권 수요 분석</p></div><div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><ShieldCheck className="text-blue-600" /><p className="mt-4 text-xl font-black">리스크</p><p className="mt-2 text-sm leading-6 text-slate-500">수리·공실·권리관계 체크</p></div></div></section>

        <section id="trust" className="mt-14 rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200"><div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center"><div><p className="text-sm font-black text-blue-600">중개대상물 표시·광고 신뢰정보</p><h2 className="mt-2 text-3xl font-black">칸공인중개사사무소</h2><p className="mt-4 leading-8 text-slate-600">실사진, 직접 확인 매물, 법적 표시사항을 기준으로 구미 지역 원룸·투룸·다가구 매매 상담을 진행합니다.</p></div><div className="grid gap-3 text-sm font-bold text-slate-700 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4">상호명<br /><b className="text-slate-950">칸공인중개사사무소</b></div><div className="rounded-2xl bg-slate-50 p-4">대표공인중개사<br /><b className="text-slate-950">정점식</b></div><div className="rounded-2xl bg-slate-50 p-4">주소<br /><b className="text-slate-950">경상북도 구미시 인의동 991-4번지 4층</b></div><div className="rounded-2xl bg-slate-50 p-4">등록번호<br /><b className="text-slate-950">제47190-2023-00014</b></div><div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">연락처<br /><b className="text-slate-950">010-5323-3883 / 054-474-0367</b></div></div></div></section>
      </main>

      <footer className="border-t bg-white px-5 py-10 text-center text-sm text-slate-500"><p className="font-black text-slate-900">칸공인중개사사무소</p><p className="mt-1">경상북도 구미시 인의동 991-4번지 4층 · 대표공인중개사 정점식</p><p>등록번호 제47190-2023-00014 · 010-5323-3883 / 054-474-0367</p></footer>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/90 p-3 backdrop-blur-xl md:hidden"><div className="mx-auto grid max-w-md grid-cols-2 gap-2"><a href="tel:010-5323-3883" className="rounded-2xl bg-blue-600 py-3 text-center text-sm font-black text-white">전화상담</a><button onClick={() => onLead('request')} className="rounded-2xl bg-slate-950 py-3 text-sm font-black text-white">매물의뢰</button></div></div>
      <button onClick={() => setShowAdminLogin(true)} className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl hover:bg-black md:bottom-5"><Lock size={17} /> 관리자</button>
      <AnimatePresence>{selectedListing && <ListingDetail listing={selectedListing} onClose={() => setSelectedListing(null)} onLead={onLead} />}</AnimatePresence>
      <AnimatePresence>{showAdminLogin && <AdminLogin onClose={() => setShowAdminLogin(false)} onLogin={() => { setShowAdminLogin(false); setAdminOpen(true); }} />}</AnimatePresence>
      <AnimatePresence>{adminOpen && <AdminPanel listings={listings} onAdd={addListing} onDelete={deleteListing} onClose={() => setAdminOpen(false)} storageMode={storageMode} />}</AnimatePresence>
      <AnimatePresence>{lead && <LeadModal mode={lead.mode} listing={lead.listing} onClose={() => setLead(null)} />}</AnimatePresence>
      <div className="fixed left-4 bottom-20 z-20 hidden rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-500 shadow-lg ring-1 ring-slate-200 md:block">저장 방식: {storageMode}</div>
    </div>
  );
}
