import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  Search,
  Home,
  Lock,
  X,
  Plus,
  Trash2,
  Store,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Menu,
  Save,
  Upload,
  Download,
  RefreshCw,
  Edit3,
  ImagePlus,
  Copy,
  AlertTriangle,
} from 'lucide-react';

const OFFICE = {
  name: '칸공인중개사사무소',
  owner: '대표공인중개사 정점식',
  phone: '010-5323-3883',
  tel: '01053233883',
  subPhone: '054-474-0367',
  address: '경상북도 구미시 인의동 991-4번지 4층',
  regNo: '제47190-2023-00014',
  blog: 'https://blog.naver.com/atm750',
  mapSearch: 'https://map.naver.com/p/search/칸공인중개사사무소%20구미',
};

const EMPTY_FORM = {
  id: '',
  sort_order: 0,
  badge: '신규 매물',
  title: '',
  short_title: '',
  location: '',
  landmark: '',
  property_type: '다가구주택 내 원룸',
  deal_type: '월세',
  deposit: '',
  rent: '',
  management: '관리비 포함',
  area: '약 30㎡',
  floor: '',
  direction: '',
  parking: '가능',
  move_in: '즉시입주 협의',
  approval_date: '계약 전 최종 확인',
  rooms: '방 1 / 욕실 1',
  options: '계약 전 최종 확인',
  summary: '',
  description: '',
  image_count: 15,
  photos: [],
  photo_memo: [],
  facilities: ['편의점', '식당가', '버스정류장'],
  safety: ['중개사 직접 확인', '실사진', '계약 전 권리 확인'],
  education: ['생활권 확인', '출퇴근 동선', '자취 수요'],
};

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').map((v) => v.trim()).filter(Boolean);
  return [];
}

function propertyToForm(property) {
  return {
    ...EMPTY_FORM,
    ...property,
    image_count: Number(property.image_count || 15),
    photos: Array.isArray(property.photos) ? property.photos : [],
    photo_memo: Array.isArray(property.photo_memo) ? property.photo_memo : [],
    facilities: normalizeArray(property.facilities),
    safety: normalizeArray(property.safety),
    education: normalizeArray(property.education),
  };
}

function formToPayload(form) {
  return {
    ...form,
    sort_order: Number(form.sort_order || 0),
    image_count: Math.max(1, Math.min(40, Number(form.image_count || 15))),
    short_title: form.short_title || form.title,
    facilities: normalizeArray(form.facilities),
    safety: normalizeArray(form.safety),
    education: normalizeArray(form.education),
    photo_memo: normalizeArray(form.photo_memo),
    photos: Array.isArray(form.photos) ? form.photos : [],
  };
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.adminPassword ? { 'x-admin-password': options.adminPassword } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({ ok: false, error: '응답을 읽을 수 없습니다.' }));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || '요청 처리 중 오류가 발생했습니다.');
  }
  return payload;
}

async function resizeImageToDataUrl(file, maxSize = 1500, quality = 0.75) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

function getPhotoCaption(property, index) {
  const photo = property.photos?.[index];
  if (photo?.caption) return photo.caption;
  return property.photo_memo?.[index] || `${property.title} 사진 ${index + 1}`;
}

function Header({ onGoHome, onOpenRequest, onOpenAdmin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { label: '매물보기', href: '#properties' },
    { label: '전화상담', href: `tel:${OFFICE.tel}` },
    { label: '블로그', href: OFFICE.blog, external: true },
    { label: '지도', href: OFFICE.mapSearch, external: true },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <button onClick={onGoHome} className="logo-btn">
          <span className="logo-mark"><Building2 /></span>
          <span>
            <strong>칸공인중개사</strong>
            <small>구미 원룸 · 투룸 · 수익형부동산</small>
          </span>
        </button>

        <nav className="nav">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
              {item.label}
            </a>
          ))}
          <button className="nav-primary" onClick={onOpenRequest}>매물의뢰하기</button>
          <button onClick={onOpenAdmin}>관리자</button>
        </nav>

        <button className="menu-btn" onClick={() => setMobileOpen((v) => !v)}><Menu /></button>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
              {item.label}
            </a>
          ))}
          <button onClick={onOpenRequest}>매물의뢰하기</button>
          <button onClick={onOpenAdmin}>관리자</button>
        </div>
      )}
    </header>
  );
}

function Hero({ onOpenRequest }) {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div>
          <div className="badge">구미 인동 · 인의동 · 진평동 · 옥계동 매물 상담</div>
          <h1>구미 원룸·투룸 찾을 때,<span>사진과 조건을 먼저 확인하세요.</span></h1>
          <p>칸공인중개사는 실사진, 실제 조건, 생활권, 출퇴근 동선, 관리비 포함 여부를 기준으로 구미 원룸 월세·투룸 월세·수익형부동산 매물을 안내합니다.</p>
          <div className="hero-actions">
            <a className="btn btn-yellow" href={`tel:${OFFICE.tel}`}><Phone /> 전화상담 {OFFICE.phone}</a>
            <a className="btn btn-ghost" href={`sms:${OFFICE.tel}`}><MessageSquare /> 문자상담</a>
            <button className="btn btn-outline" onClick={onOpenRequest}><Plus /> 매물의뢰하기</button>
          </div>
          <div className="hero-stats">
            <div><strong>실사진</strong><span>직접 확인 매물</span></div>
            <div><strong>관리비</strong><span>포함 여부 안내</span></div>
            <div><strong>출퇴근</strong><span>국가산단 동선</span></div>
          </div>
        </div>
        <div className="hero-card">
          <div className="card-top">
            <div><small>오늘의 추천</small><strong>구미 원룸 월세</strong></div>
            <span>상담 가능</span>
          </div>
          <div className="hero-photo">
            <b>대표 이미지 영역</b>
            <div><strong>100/18</strong><span>인의동 · 관리비 포함 · 즉시입주 협의</span></div>
          </div>
          <div className="mini-grid"><span>사진등록</span><span>지도</span><span>시설정보</span></div>
        </div>
      </div>
    </section>
  );
}

function SearchBar({ query, setQuery, category, setCategory }) {
  return (
    <div className="search-wrap">
      <div className="search-box">
        <label className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="지역, 원룸, 투룸, 가격으로 검색" /></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="전체">전체 매물</option>
          <option value="원룸">원룸</option>
          <option value="투룸">투룸</option>
          <option value="월세">월세</option>
        </select>
      </div>
    </div>
  );
}

function PropertyCard({ property, onSelect }) {
  const photoUrl = property.photos?.[0]?.url;
  return (
    <article className="property-card">
      <button onClick={() => onSelect(property)}>
        <div className="card-image" style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}>
          <span className="card-badge">{property.badge || '추천'}</span>
          {!photoUrl && <span className="empty-photo">KAN</span>}
          <div className="card-title-box">
            <small>{property.location}</small>
            <strong>{property.short_title || property.title}</strong>
          </div>
        </div>
        <div className="card-body">
          <div className="chips"><span>보증금 {property.deposit}</span><span>월세 {property.rent}</span><span>{property.management}</span></div>
          <h3>{property.title}</h3>
          <p>{property.summary}</p>
          <div className="card-meta"><MapPin /> {property.landmark}</div>
        </div>
      </button>
    </article>
  );
}

function PropertyList({ properties, onSelect, loading, error }) {
  return (
    <section id="properties" className="section">
      <div className="section-head">
        <div><span>KAN REAL ESTATE</span><h2>추천 매물</h2></div>
        <p>카드를 누르면 상세 사진과 조건을 볼 수 있습니다.</p>
      </div>
      {loading && <div className="notice">매물을 불러오는 중입니다.</div>}
      {error && <div className="notice error"><AlertTriangle /> {error}</div>}
      {!loading && properties.length === 0 && <div className="notice">등록된 매물이 없습니다. 관리자에서 새 매물을 등록하세요.</div>}
      <div className="property-grid">
        {properties.map((property) => <PropertyCard key={property.id} property={property} onSelect={onSelect} />)}
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return <div className="info-row"><strong>{label}</strong><span>{value || '계약 전 확인'}</span></div>;
}

function FoldSection({ title, icon: Icon, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fold">
      <button onClick={() => setOpen((v) => !v)}><span><Icon /> {title}</span>{open ? <ChevronUp /> : <ChevronDown />}</button>
      {open && <div className="fold-body">{(items || []).map((item) => <span key={item}>{item}</span>)}</div>}
    </div>
  );
}

function PropertyDetail({ property, onBack, onOpenRequest }) {
  const count = Math.max(Number(property.image_count || 15), property.photos?.length || 0, property.photo_memo?.length || 0, 1);
  const slots = Array.from({ length: count });

  return (
    <main className="detail-page">
      <section className="detail-hero">
        <div className="detail-hero-inner">
          <button onClick={onBack} className="back-btn"><Home /> 매물 목록으로</button>
          <div className="detail-grid">
            <div>
              <span className="badge solid">{property.badge}</span>
              <h1>{property.title}</h1>
              <p>{property.description}</p>
              <div className="hero-actions"><a className="btn btn-yellow" href={`tel:${OFFICE.tel}`}><Phone /> 전화상담</a><a className="btn btn-ghost" href={`sms:${OFFICE.tel}`}><MessageSquare /> 문자상담</a><button className="btn btn-outline" onClick={onOpenRequest}><Plus /> 매물의뢰</button></div>
            </div>
            <div className="price-panel"><div><small>보증금</small><strong>{property.deposit}</strong></div><div><small>월세</small><strong>{property.rent}</strong></div><div><small>관리비</small><strong>{property.management}</strong></div><div><small>입주</small><strong>{property.move_in}</strong></div></div>
          </div>
        </div>
      </section>

      <section className="detail-content">
        <aside>
          <div className="panel"><h2>매물 기본정보</h2><InfoRow label="소재지" value={property.location} /><InfoRow label="매물종류" value={property.property_type} /><InfoRow label="거래형태" value={property.deal_type} /><InfoRow label="면적" value={property.area} /><InfoRow label="층수" value={property.floor} /><InfoRow label="방/욕실" value={property.rooms} /><InfoRow label="방향" value={property.direction} /><InfoRow label="주차" value={property.parking} /><InfoRow label="사용승인일" value={property.approval_date} /><InfoRow label="옵션" value={property.options} /></div>
          <div className="panel"><h2>지도 안내</h2><a className="map-link" href={OFFICE.mapSearch} target="_blank" rel="noreferrer">네이버 지도에서 칸공인중개사 보기 <ExternalLink /></a><div className="map-placeholder"><MapPin /><strong>매물 생활권 지도 / 사무소 위치 지도</strong><span>실제 운영 시 지도 이미지를 사진 슬롯에 넣거나, 네이버 지도 링크를 함께 사용하세요.</span></div></div>
          <FoldSection title="편의시설" icon={Store} items={property.facilities} defaultOpen />
          <FoldSection title="안전시설·신뢰정보" icon={ShieldCheck} items={property.safety} />
          <FoldSection title="교육·생활수요" icon={GraduationCap} items={property.education} />
        </aside>
        <div className="photos-column">
          <div className="panel"><h2>매물 사진 {count}장</h2><p>사진은 관리자에서 매물별로 업로드할 수 있습니다.</p></div>
          {slots.map((_, index) => {
            const photo = property.photos?.[index];
            return (
              <div className="photo-card" key={index}>
                <div className="photo-frame" style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}>
                  <span>사진 {index + 1}</span>
                  {!photo?.url && <div className="photo-empty"><strong>KAN</strong><small>실제 매물 사진 영역</small></div>}
                  <b>칸공인중개사 {OFFICE.phone}</b>
                </div>
                <p>{getPhotoCaption(property, index)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function RequestModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  if (!open) return null;
  const submit = (e) => {
    e.preventDefault();
    const text = `[홈페이지 매물의뢰]\n이름: ${form.name}\n연락처: ${form.phone}\n내용: ${form.message}`;
    window.location.href = `sms:${OFFICE.tel}?body=${encodeURIComponent(text)}`;
  };
  return (
    <div className="modal-bg"><div className="modal small"><div className="modal-head"><div><span>REQUEST</span><h2>매물의뢰하기</h2></div><button onClick={onClose}><X /></button></div><form onSubmit={submit} className="form-grid"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="성함" /><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="연락처" /><textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="예: 인의동 원룸 월세 찾습니다 / 보증금 200, 월세 30 희망" rows={5} /><button className="btn btn-dark">문자로 의뢰 보내기</button></form></div></div>
  );
}

function TextAreaList({ label, value, onChange, placeholder }) {
  const text = Array.isArray(value) ? value.join('\n') : value || '';
  return <label className="field wide"><span>{label}</span><textarea value={text} onChange={(e) => onChange(e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))} placeholder={placeholder} rows={4} /></label>;
}

function PhotoManager({ form, setForm, adminPassword, propertyIdForUpload }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = useRef({});
  const count = Math.max(1, Math.min(40, Number(form.image_count || 15)));
  const photos = Array.isArray(form.photos) ? form.photos : [];
  const memo = Array.isArray(form.photo_memo) ? form.photo_memo : [];

  const updateCaption = (index, caption) => {
    const nextMemo = [...memo];
    nextMemo[index] = caption;
    const nextPhotos = [...photos];
    if (nextPhotos[index]) nextPhotos[index] = { ...nextPhotos[index], caption };
    setForm({ ...form, photo_memo: nextMemo, photos: nextPhotos });
  };

  const removePhoto = (index) => {
    const next = [...photos];
    next[index] = undefined;
    setForm({ ...form, photos: next.filter((item, itemIndex) => item || itemIndex < next.length) });
  };

  const uploadFile = async (index, file) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const result = await apiFetch('/api/upload-photo', {
        method: 'POST',
        adminPassword,
        body: JSON.stringify({ dataUrl, mimeType: 'image/jpeg', propertyId: propertyIdForUpload || 'new', index }),
      });
      const caption = memo[index] || `${form.title || '매물'} 사진 ${index + 1}`;
      const nextPhotos = [...photos];
      nextPhotos[index] = { url: result.url, caption };
      const nextMemo = [...memo];
      nextMemo[index] = caption;
      setForm({ ...form, photos: nextPhotos, photo_memo: nextMemo });
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-manager">
      <div className="admin-subhead"><h3>사진 등록</h3><p>사진은 자동 압축 후 Supabase Storage에 저장됩니다.</p></div>
      {uploading && <div className="notice">사진 업로드 중입니다.</div>}
      <div className="photo-admin-grid">
        {Array.from({ length: count }).map((_, index) => {
          const photo = photos[index];
          return (
            <div className="photo-admin" key={index}>
              <div className="photo-admin-frame" style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}>
                {!photo?.url && <ImagePlus />}
                <span>{index + 1}</span>
              </div>
              <input className="caption-input" value={memo[index] || photo?.caption || ''} onChange={(e) => updateCaption(index, e.target.value)} placeholder={`사진 ${index + 1} 설명`} />
              <div className="photo-admin-actions">
                <input ref={(el) => { fileInputRefs.current[index] = el; }} type="file" accept="image/*" hidden onChange={(e) => uploadFile(index, e.target.files?.[0])} />
                <button type="button" onClick={() => fileInputRefs.current[index]?.click()}><Upload /> 업로드</button>
                {photo?.url && <button type="button" onClick={() => removePhoto(index)}><Trash2 /> 제거</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminModal({ open, onClose, properties, setProperties, reload }) {
  const [adminPassword, setAdminPassword] = useState(sessionStorage.getItem('kan-admin-password') || '');
  const [loggedIn, setLoggedIn] = useState(Boolean(sessionStorage.getItem('kan-admin-password')));
  const [loginPassword, setLoginPassword] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [adminTab, setAdminTab] = useState('form');
  const importRef = useRef(null);

  useEffect(() => {
    if (open && !form.title && !form.id) setForm({ ...EMPTY_FORM, sort_order: properties.length + 1 });
  }, [open, properties.length]);

  if (!open) return null;

  const login = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin-login', { method: 'POST', body: JSON.stringify({ password: loginPassword }) });
      sessionStorage.setItem('kan-admin-password', loginPassword);
      setAdminPassword(loginPassword);
      setLoggedIn(true);
      setLoginPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('kan-admin-password');
    setAdminPassword('');
    setLoggedIn(false);
  };

  const editProperty = (property) => {
    setForm(propertyToForm(property));
    setAdminTab('form');
    window.setTimeout(() => document.querySelector('.admin-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const newProperty = () => {
    setForm({ ...EMPTY_FORM, sort_order: properties.length + 1 });
    setAdminTab('form');
  };

  const saveProperty = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const method = form.id ? 'PUT' : 'POST';
      const result = await apiFetch('/api/properties', {
        method,
        adminPassword,
        body: JSON.stringify(form.id ? { id: form.id, property: payload } : { property: payload }),
      });
      if (form.id) setProperties(properties.map((p) => (p.id === form.id ? result.data : p)));
      else setProperties([result.data, ...properties]);
      setForm(propertyToForm(result.data));
      alert('저장 완료했습니다.');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProperty = async (property) => {
    if (!confirm(`${property.title} 매물을 삭제하시겠습니까?`)) return;
    try {
      await apiFetch(`/api/properties?id=${encodeURIComponent(property.id)}`, { method: 'DELETE', adminPassword });
      setProperties(properties.filter((p) => p.id !== property.id));
      if (form.id === property.id) newProperty();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetDefaults = async () => {
    if (!confirm('기본 샘플 매물 3개로 초기화합니다. 현재 매물은 삭제됩니다. 진행할까요?')) return;
    try {
      const result = await apiFetch('/api/properties', { method: 'POST', adminPassword, body: JSON.stringify({ action: 'reset-defaults' }) });
      setProperties(result.data || []);
      newProperty();
      alert('초기화 완료했습니다.');
    } catch (error) {
      alert(error.message);
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(properties, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kan-properties-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file) => {
    if (!file) return;
    if (!confirm('백업 파일의 매물로 전체 교체합니다. 진행할까요?')) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await apiFetch('/api/properties', { method: 'POST', adminPassword, body: JSON.stringify({ action: 'import', properties: parsed }) });
      setProperties(result.data || []);
      alert('백업 불러오기 완료했습니다.');
    } catch (error) {
      alert(error.message);
    }
  };

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(window.location.origin);
    alert('홈페이지 주소를 복사했습니다.');
  };

  return (
    <div className="modal-bg">
      <div className="modal admin-modal">
        <div className="modal-head"><div><span>ADMIN</span><h2>관리자 매물관리</h2><p>DB 저장 + 사진 업로드까지 연결된 운영용 관리자 화면입니다.</p></div><button onClick={onClose}><X /></button></div>

        {!loggedIn ? (
          <form onSubmit={login} className="login-box"><div className="login-icon"><Lock /></div><h3>관리자 비밀번호</h3><p>초기 비밀번호는 Vercel 환경변수 ADMIN_PASSWORD 값입니다. 기본값은 3883입니다.</p><input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="비밀번호 입력" /><button className="btn btn-dark">관리자 들어가기</button></form>
        ) : (
          <>
            <div className="admin-toolbar"><button onClick={newProperty}><Plus /> 새 매물</button><button onClick={reload}><RefreshCw /> 새로고침</button><button onClick={copyPublicUrl}><Copy /> 주소복사</button><button onClick={exportBackup}><Download /> 백업 내보내기</button><button onClick={() => importRef.current?.click()}><Upload /> 백업 불러오기</button><button onClick={resetDefaults}><RefreshCw /> 기본값 초기화</button><button onClick={logout}><Lock /> 로그아웃</button><input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importBackup(e.target.files?.[0])} /></div>

            <div className="admin-tabs"><button className={adminTab === 'form' ? 'active' : ''} onClick={() => setAdminTab('form')}>매물 등록/수정</button><button className={adminTab === 'list' ? 'active' : ''} onClick={() => setAdminTab('list')}>등록 매물 목록</button></div>

            {adminTab === 'form' && (
              <form onSubmit={saveProperty} className="admin-form">
                <div className="admin-subhead"><h3>{form.id ? '매물 수정' : '새 매물 등록'}</h3><p>{form.id ? '기존 매물 내용을 수정하고 저장하세요.' : '매물 정보와 사진을 입력한 뒤 저장하세요.'}</p></div>
                <div className="form-grid two">
                  <label className="field"><span>노출순서</span><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></label>
                  <label className="field"><span>뱃지</span><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="추천 원룸" /></label>
                  <label className="field wide"><span>매물명</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="구미 인의동 원룸 월세" /></label>
                  <label className="field"><span>짧은 제목</span><input value={form.short_title} onChange={(e) => setForm({ ...form, short_title: e.target.value })} placeholder="인의동 원룸 100/18" /></label>
                  <label className="field"><span>소재지</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="경상북도 구미시 인의동" /></label>
                  <label className="field wide"><span>생활권/랜드마크</span><input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="미래로병원 뒤 / 국가산단 출퇴근 동선" /></label>
                  <label className="field"><span>매물종류</span><select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}><option>다가구주택 내 원룸</option><option>다가구주택 내 투룸</option><option>미니투룸</option><option>상가</option><option>수익형부동산</option></select></label>
                  <label className="field"><span>거래형태</span><select value={form.deal_type} onChange={(e) => setForm({ ...form, deal_type: e.target.value })}><option>월세</option><option>전세</option><option>매매</option><option>반전세</option></select></label>
                  <label className="field"><span>보증금</span><input value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="100만원" /></label>
                  <label className="field"><span>월세/가격</span><input value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="18만원" /></label>
                  <label className="field"><span>관리비</span><input value={form.management} onChange={(e) => setForm({ ...form, management: e.target.value })} /></label>
                  <label className="field"><span>면적</span><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></label>
                  <label className="field"><span>층수</span><input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></label>
                  <label className="field"><span>방향</span><input value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} /></label>
                  <label className="field"><span>주차</span><input value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} /></label>
                  <label className="field"><span>입주가능일</span><input value={form.move_in} onChange={(e) => setForm({ ...form, move_in: e.target.value })} /></label>
                  <label className="field"><span>사용승인일</span><input value={form.approval_date} onChange={(e) => setForm({ ...form, approval_date: e.target.value })} /></label>
                  <label className="field"><span>방/욕실</span><input value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} /></label>
                  <label className="field"><span>사진 수</span><input type="number" min="1" max="40" value={form.image_count} onChange={(e) => setForm({ ...form, image_count: e.target.value })} /></label>
                  <label className="field wide"><span>옵션</span><input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} /></label>
                  <label className="field wide"><span>요약문구</span><textarea required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} /></label>
                  <label className="field wide"><span>상세설명</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></label>
                  <TextAreaList label="편의시설" value={form.facilities} onChange={(v) => setForm({ ...form, facilities: v })} placeholder="한 줄에 하나씩 입력" />
                  <TextAreaList label="안전/신뢰정보" value={form.safety} onChange={(v) => setForm({ ...form, safety: v })} placeholder="한 줄에 하나씩 입력" />
                  <TextAreaList label="교육/생활수요" value={form.education} onChange={(v) => setForm({ ...form, education: v })} placeholder="한 줄에 하나씩 입력" />
                </div>
                <PhotoManager form={form} setForm={setForm} adminPassword={adminPassword} propertyIdForUpload={form.id || form.title || 'new'} />
                <button disabled={saving} className="btn btn-yellow save-btn"><Save /> {saving ? '저장 중' : '매물 저장'}</button>
              </form>
            )}

            {adminTab === 'list' && (
              <div className="admin-list">
                {properties.map((p) => <div key={p.id} className="admin-list-item"><div><strong>{p.title}</strong><span>{p.deposit} / {p.rent} · 사진 {p.photos?.length || 0}장 · 순서 {p.sort_order}</span></div><div><button onClick={() => editProperty(p)}><Edit3 /> 수정</button><button onClick={() => deleteProperty(p)}><Trash2 /> 삭제</button></div></div>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Footer({ onOpenAdmin }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div><h2>{OFFICE.name}</h2><p>구미 원룸 월세, 투룸 월세, 수익형부동산 투자 매물 상담은 칸공인중개사사무소로 문의하세요.</p><div><a href={`tel:${OFFICE.tel}`}>전화 {OFFICE.phone}</a><a href={OFFICE.blog} target="_blank" rel="noreferrer">블로그 보기</a><a href={OFFICE.mapSearch} target="_blank" rel="noreferrer">지도 보기</a></div></div>
        <div className="office-box"><strong>중개사무소 표시</strong><span>상호명: {OFFICE.name}</span><span>소재지: {OFFICE.address}</span><span>대표공인중개사: {OFFICE.owner}</span><span>등록번호: {OFFICE.regNo}</span><span>연락처: {OFFICE.phone} / {OFFICE.subPhone}</span></div>
      </div>
      <button className="admin-floating" onClick={onOpenAdmin}><Lock /> 관리자</button>
    </footer>
  );
}

export default function App() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch('/api/properties');
      setProperties(result.data || []);
      if (selected) {
        const fresh = (result.data || []).find((p) => p.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      const text = `${p.title} ${p.short_title} ${p.location} ${p.landmark} ${p.property_type} ${p.deal_type} ${p.deposit} ${p.rent}`.toLowerCase();
      const matchQuery = q ? text.includes(q) : true;
      const matchCategory = category === '전체' ? true : text.includes(category.toLowerCase());
      return matchQuery && matchCategory;
    });
  }, [properties, query, category]);

  const goHome = () => {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Header onGoHome={goHome} onOpenRequest={() => setRequestOpen(true)} onOpenAdmin={() => setAdminOpen(true)} />
      {selected ? <PropertyDetail property={selected} onBack={goHome} onOpenRequest={() => setRequestOpen(true)} /> : <><Hero onOpenRequest={() => setRequestOpen(true)} /><SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} /><PropertyList properties={filtered} onSelect={setSelected} loading={loading} error={error} /></>}
      <Footer onOpenAdmin={() => setAdminOpen(true)} />
      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
      <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} properties={properties} setProperties={setProperties} reload={loadProperties} />
    </div>
  );
}
