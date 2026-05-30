import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// ─── Icons (inline SVG to avoid extra deps) ──────────────────────────────────

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  inquiries:  'M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm0 0v6h6M12 12v6m-3-3h6',
  gallery:    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  services:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  content:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  settings:   'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  upload:     'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  edit:       'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  plus:       'M12 4v16m8-8H4',
  close:      'M6 18L18 6M6 6l12 12',
  check:      'M5 13l4 4L19 7',
  eye:        'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  link:       'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  signout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  image:      'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  save:       'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
  refresh:    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'inquiries' | 'gallery' | 'services' | 'content' | 'settings';

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  city?: string;
  preferred_date?: string;
  message: string;
  status: 'new' | 'contacted' | 'booked' | 'closed';
}

interface GalleryItem {
  id: string;
  created_at: string;
  url: string;
  storage_path: string;
  type: 'photo' | 'video';
  caption: string;
  category: string;
  sort_order: number;
}

interface ServiceItem {
  id: string;
  title: string;
  price: string;
  short_description: string;
  description: string;
  image_url: string;
  tags: string[];
  sort_order: number;
  is_active: boolean;
}

interface ContentItem {
  key: string;
  value: string;
  label: string;
  section: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-amber-100 text-amber-800',
  contacted: 'bg-blue-100 text-blue-800',
  booked:    'bg-emerald-100 text-emerald-700',
  closed:    'bg-stone-100 text-stone-500',
};
const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', booked: 'Booked', closed: 'Closed',
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

const Btn = ({
  onClick, children, variant = 'primary', disabled = false, className = '', type = 'button'
}: {
  onClick?: () => void; children: React.ReactNode; variant?: 'primary'|'ghost'|'danger'|'accent';
  disabled?: boolean; className?: string; type?: 'button'|'submit';
}) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#1A1714] text-white hover:bg-[#2d2926]',
    accent:  'bg-[#C4A882] text-white hover:bg-[#b8976e]',
    ghost:   'border border-[#E5E0D8] text-[#1A1714]/60 hover:text-[#1A1714] hover:border-[#C4A882]',
    danger:  'border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-2xl font-semibold text-[#1A1714] tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[#1A1714]/40 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="bg-white rounded-xl border border-[#F0EDE9] p-6 flex flex-col gap-1">
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-[#1A1714]/40 font-bold">{label}</span>
  </div>
);

const EmptyState = ({ icon, message }: { icon: string; message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-[#1A1714]/25">
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="mb-4">
      <path d={icon} />
    </svg>
    <p className="text-sm tracking-widest uppercase font-medium">{message}</p>
  </div>
);

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children, wide = false }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="sticky top-0 bg-white border-b border-[#F0EDE9] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <h2 className="font-semibold text-[#1A1714]">{title}</h2>
        <button onClick={onClose} className="text-[#1A1714]/30 hover:text-[#1A1714] transition-colors">
          <Icon d={Icons.close} size={20} />
        </button>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  </div>
);

// ─── Form helpers ─────────────────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/40">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2.5 text-sm border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-[#C4A882] bg-white transition-colors text-[#1A1714]';

// ─────────────────────────────────────────────────────────────────────────────
// TAB: INQUIRIES
// ─────────────────────────────────────────────────────────────────────────────

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    setInquiries((data as Inquiry[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase.channel('contacts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('contacts').update({ status }).eq('id', id);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));
    if (selected?.id === id) setSelected(s => s ? { ...s, status: status as any } : null);
    setUpdatingId(null);
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    await supabase.from('contacts').delete().eq('id', id);
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const counts = {
    all: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    booked: inquiries.filter(i => i.status === 'booked').length,
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div>
      <SectionHeader
        title="Inquiries"
        subtitle={`${inquiries.length} total submission${inquiries.length !== 1 ? 's' : ''}`}
        action={
          <Btn variant="ghost" onClick={load}>
            <Icon d={Icons.refresh} size={14} /> Refresh
          </Btn>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={counts.all} label="Total" color="text-[#1A1714]" />
        <StatCard value={counts.new} label="New" color="text-amber-600" />
        <StatCard value={counts.contacted} label="Contacted" color="text-blue-600" />
        <StatCard value={counts.booked} label="Booked" color="text-emerald-600" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-[#F7F4F0] rounded-lg p-1 w-fit">
        {(['all','new','contacted','booked','closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${
              filter === f ? 'bg-white text-[#1A1714] shadow-sm' : 'text-[#1A1714]/40 hover:text-[#1A1714]'
            }`}
          >
            {STATUS_LABELS[f] ?? 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#1A1714]/30 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Icons.inquiries} message="No inquiries yet" />
      ) : (
        <div className="bg-white rounded-xl border border-[#F0EDE9] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE9] bg-[#FAFAF8]">
                {['Date','Client','Service','Location','Status',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inquiry => (
                <tr
                  key={inquiry.id}
                  onClick={() => setSelected(inquiry)}
                  className="border-b border-[#F0EDE9] hover:bg-[#FDFCFB] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-[#1A1714]/40 whitespace-nowrap text-xs">{fmt(inquiry.created_at)}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#1A1714]">{inquiry.name}</p>
                    <p className="text-[#1A1714]/40 text-xs">{inquiry.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#1A1714]/60 text-xs max-w-[140px] truncate">{inquiry.service || '—'}</td>
                  <td className="px-5 py-4 text-[#1A1714]/40 text-xs">{inquiry.city || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${STATUS_COLORS[inquiry.status] ?? STATUS_COLORS.new}`}>
                      {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <a href={`mailto:${inquiry.email}?subject=Re: Your Ashley M. Brows Inquiry`}
                        className="text-[10px] uppercase tracking-widest font-bold text-[#C4A882] hover:text-[#1A1714] transition-colors">
                        Reply
                      </a>
                      <span className="text-[#1A1714]/20">|</span>
                      <button onClick={() => deleteInquiry(inquiry.id)}
                        className="text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-600 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-[#F0EDE9] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-[#1A1714]">{selected.name}</h2>
                <p className="text-xs text-[#1A1714]/40">{fmt(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#1A1714]/30 hover:text-[#1A1714]">
                <Icon d={Icons.close} size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Contact */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Contact Info</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1A1714]/50">Email</span>
                    <a href={`mailto:${selected.email}`} className="text-[#C4A882] hover:underline">{selected.email}</a>
                  </div>
                  {selected.phone && (
                    <div className="flex justify-between">
                      <span className="text-[#1A1714]/50">Phone</span>
                      <a href={`tel:${selected.phone}`} className="text-[#1A1714]">{selected.phone}</a>
                    </div>
                  )}
                </div>
              </section>
              {/* Details */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Inquiry Details</p>
                <div className="space-y-2 text-sm">
                  {selected.service && <div className="flex justify-between"><span className="text-[#1A1714]/50">Service</span><span className="text-[#1A1714] font-medium">{selected.service}</span></div>}
                  {selected.city && <div className="flex justify-between"><span className="text-[#1A1714]/50">Location</span><span className="text-[#1A1714]">{selected.city}</span></div>}
                  {selected.preferred_date && <div className="flex justify-between"><span className="text-[#1A1714]/50">Preferred Date</span><span className="text-[#1A1714]">{selected.preferred_date}</span></div>}
                </div>
              </section>
              {/* Message */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Message</p>
                <div className="bg-[#FAF9F7] rounded-lg p-4 text-sm text-[#1A1714]/80 leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              </section>
              {/* Status */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['new','contacted','booked','closed'] as const).map(s => (
                    <button key={s} disabled={updatingId === selected.id} onClick={() => updateStatus(selected.id, s)}
                      className={`py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors ${
                        selected.status === s ? 'bg-[#1A1714] text-white' : 'bg-[#FAF9F7] text-[#1A1714]/50 hover:bg-[#F0EDE9] hover:text-[#1A1714]'
                      }`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[#F0EDE9] px-6 py-4 flex gap-3">
              <a href={`mailto:${selected.email}?subject=Re: Your Ashley M. Brows Inquiry`}
                className="flex-1 py-3 bg-[#C4A882] text-white text-[10px] uppercase tracking-widest font-bold text-center rounded-lg hover:bg-[#b8976e] transition-colors">
                Reply via Email
              </a>
              <button onClick={() => deleteInquiry(selected.id)}
                className="px-5 py-3 border border-red-200 text-red-400 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: GALLERY
// ─────────────────────────────────────────────────────────────────────────────

const GALLERY_CATEGORIES = ['Signature Brows', 'Lip Blush', 'Defining Liner', 'Other'];

function GalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [filterCat, setFilterCat] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_items').select('*').order('sort_order', { ascending: true });
    setItems((data as GalleryItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const isVideo = file.type.startsWith('video/');

      const { error: upErr } = await supabase.storage.from('gallery').upload(path, file, { upsert: false });
      if (upErr) { console.error(upErr); continue; }

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);

      await supabase.from('gallery_items').insert({
        url: urlData.publicUrl,
        storage_path: path,
        type: isVideo ? 'video' : 'photo',
        caption: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Other',
        sort_order: items.length + 1,
      });
    }

    await load();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!confirm(`Delete "${item.caption}"?`)) return;
    await supabase.storage.from('gallery').remove([item.storage_path]);
    await supabase.from('gallery_items').delete().eq('id', item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const saveEdit = async () => {
    if (!editItem) return;
    await supabase.from('gallery_items').update({ caption: editItem.caption, category: editItem.category }).eq('id', editItem.id);
    setItems(prev => prev.map(i => i.id === editItem.id ? editItem : i));
    setEditItem(null);
  };

  const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat);

  return (
    <div>
      <SectionHeader
        title="Gallery"
        subtitle={`${items.length} item${items.length !== 1 ? 's' : ''} — photos & videos`}
        action={
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={load}><Icon d={Icons.refresh} size={14} /> Refresh</Btn>
            <Btn variant="accent" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Icon d={Icons.upload} size={14} />
              {uploading ? 'Uploading…' : 'Upload'}
            </Btn>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          </div>
        }
      />

      {/* Category filter */}
      <div className="flex gap-1 mb-6 bg-[#F7F4F0] rounded-lg p-1 w-fit flex-wrap">
        {['All', ...GALLERY_CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-4 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${
              filterCat === c ? 'bg-white text-[#1A1714] shadow-sm' : 'text-[#1A1714]/40 hover:text-[#1A1714]'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#1A1714]/30 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Icons.gallery} message="No photos or videos yet — upload some!" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-[#F0EDE9] shadow-sm hover:shadow-md transition-all">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full aspect-square object-cover" muted playsInline />
              ) : (
                <img src={item.url} alt={item.caption} className="w-full aspect-square object-cover" />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                <div className="w-full p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditItem(item)}
                      className="p-2 bg-white/90 rounded-lg text-[#1A1714] hover:bg-white transition-colors">
                      <Icon d={Icons.edit} size={14} />
                    </button>
                    <button onClick={() => deleteItem(item)}
                      className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors">
                      <Icon d={Icons.trash} size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Caption bar */}
              <div className="px-3 py-2 border-t border-[#F0EDE9]">
                <p className="text-xs font-medium text-[#1A1714] truncate">{item.caption || 'Untitled'}</p>
                <p className="text-[10px] text-[#1A1714]/40 uppercase tracking-wider">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal title="Edit Photo / Video" onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            <img src={editItem.url} alt="" className="w-full h-48 object-cover rounded-lg" />
            <Field label="Caption">
              <input className={inputCls} value={editItem.caption} onChange={e => setEditItem({ ...editItem, caption: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })}>
                {GALLERY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <Btn variant="primary" onClick={saveEdit} className="flex-1"><Icon d={Icons.save} size={14} /> Save</Btn>
              <Btn variant="ghost" onClick={() => setEditItem(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SERVICES
// ─────────────────────────────────────────────────────────────────────────────

const blankService = (): Omit<ServiceItem, 'id'> => ({
  title: '', price: '', short_description: '', description: '',
  image_url: '', tags: [], sort_order: 0, is_active: true,
});

function ServicesTab() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSvc, setEditSvc] = useState<Partial<ServiceItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('services_cms').select('*').order('sort_order', { ascending: true });
    setServices((data as ServiceItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setIsNew(true); setEditSvc(blankService()); };
  const openEdit = (s: ServiceItem) => { setIsNew(false); setEditSvc({ ...s }); };
  const closeModal = () => { setEditSvc(null); setIsNew(false); };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editSvc) return;
    setImgUploading(true);
    const path = `services/${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from('gallery').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('gallery').getPublicUrl(path);
    setEditSvc(prev => ({ ...prev, image_url: data.publicUrl }));
    setImgUploading(false);
  };

  const save = async () => {
    if (!editSvc) return;
    setSaving(true);
    const payload = {
      title: editSvc.title ?? '',
      price: editSvc.price ?? '',
      short_description: editSvc.short_description ?? '',
      description: editSvc.description ?? '',
      image_url: editSvc.image_url ?? '',
      tags: editSvc.tags ?? [],
      sort_order: editSvc.sort_order ?? 0,
      is_active: editSvc.is_active ?? true,
    };

    if (isNew) {
      const { data } = await supabase.from('services_cms').insert(payload).select().single();
      setServices(prev => [...prev, data as ServiceItem]);
    } else {
      await supabase.from('services_cms').update(payload).eq('id', (editSvc as ServiceItem).id);
      setServices(prev => prev.map(s => s.id === (editSvc as ServiceItem).id ? { ...s, ...payload } : s));
    }
    setSaving(false);
    closeModal();
  };

  const deleteSvc = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services_cms').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const toggleActive = async (svc: ServiceItem) => {
    await supabase.from('services_cms').update({ is_active: !svc.is_active }).eq('id', svc.id);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !svc.is_active } : s));
  };

  return (
    <div>
      <SectionHeader
        title="Services"
        subtitle="Add, edit or remove services shown on the public site"
        action={
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={load}><Icon d={Icons.refresh} size={14} /> Refresh</Btn>
            <Btn variant="accent" onClick={openNew}><Icon d={Icons.plus} size={14} /> Add Service</Btn>
          </div>
        }
      />

      {loading ? (
        <div className="text-center py-20 text-[#1A1714]/30 text-sm">Loading…</div>
      ) : services.length === 0 ? (
        <EmptyState icon={Icons.services} message="No services yet — add one!" />
      ) : (
        <div className="grid gap-4">
          {services.map(svc => (
            <div key={svc.id} className={`bg-white rounded-xl border flex gap-0 overflow-hidden transition-all ${svc.is_active ? 'border-[#F0EDE9]' : 'border-[#F0EDE9] opacity-60'}`}>
              {svc.image_url && (
                <img src={svc.image_url} alt={svc.title} className="w-24 h-24 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1A1714]">{svc.title}</h3>
                      <span className="text-xs font-bold text-[#C4A882]">{svc.price}</span>
                      {!svc.is_active && (
                        <span className="text-[10px] uppercase tracking-widest bg-stone-100 text-stone-400 font-bold px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-[#1A1714]/50 line-clamp-2">{svc.short_description}</p>
                    {svc.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {svc.tags.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F7F4F0] text-[#1A1714]/50 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(svc)} title={svc.is_active ? 'Hide from site' : 'Show on site'}
                      className={`p-2 rounded-lg border transition-colors ${svc.is_active ? 'border-emerald-200 text-emerald-500 hover:bg-emerald-50' : 'border-[#E5E0D8] text-[#1A1714]/30 hover:text-[#1A1714]'}`}>
                      <Icon d={Icons.eye} size={15} />
                    </button>
                    <button onClick={() => openEdit(svc)}
                      className="p-2 rounded-lg border border-[#E5E0D8] text-[#1A1714]/50 hover:text-[#1A1714] hover:border-[#C4A882] transition-colors">
                      <Icon d={Icons.edit} size={15} />
                    </button>
                    <button onClick={() => deleteSvc(svc.id)}
                      className="p-2 rounded-lg border border-red-100 text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Icon d={Icons.trash} size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New modal */}
      {editSvc && (
        <Modal title={isNew ? 'Add Service' : 'Edit Service'} onClose={closeModal} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Service Title">
                <input className={inputCls} value={editSvc.title ?? ''} onChange={e => setEditSvc(p => ({ ...p, title: e.target.value }))} />
              </Field>
              <Field label="Price (e.g. $650)">
                <input className={inputCls} value={editSvc.price ?? ''} onChange={e => setEditSvc(p => ({ ...p, price: e.target.value }))} />
              </Field>
            </div>
            <Field label="Short Description (shown on cards)">
              <input className={inputCls} value={editSvc.short_description ?? ''} onChange={e => setEditSvc(p => ({ ...p, short_description: e.target.value }))} />
            </Field>
            <Field label="Full Description">
              <textarea className={`${inputCls} h-32 resize-none`} value={editSvc.description ?? ''} onChange={e => setEditSvc(p => ({ ...p, description: e.target.value }))} />
            </Field>
            <Field label="Tags (comma-separated)">
              <input className={inputCls}
                value={(editSvc.tags ?? []).join(', ')}
                onChange={e => setEditSvc(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
            </Field>
            <Field label="Service Image">
              <div className="flex items-center gap-3">
                {editSvc.image_url && <img src={editSvc.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#E5E0D8]" />}
                <Btn variant="ghost" onClick={() => imgRef.current?.click()} disabled={imgUploading}>
                  <Icon d={Icons.upload} size={14} /> {imgUploading ? 'Uploading…' : 'Upload Image'}
                </Btn>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
              </div>
              {!editSvc.image_url && (
                <input className={`${inputCls} mt-2`} placeholder="Or paste an image URL…"
                  value={editSvc.image_url ?? ''} onChange={e => setEditSvc(p => ({ ...p, image_url: e.target.value }))} />
              )}
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editSvc.is_active ?? true}
                  onChange={e => setEditSvc(p => ({ ...p, is_active: e.target.checked }))}
                  className="accent-[#C4A882]" />
                <span className="text-sm text-[#1A1714]/60">Show on public site</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2 border-t border-[#F0EDE9]">
              <Btn variant="primary" onClick={save} disabled={saving} className="flex-1">
                <Icon d={Icons.save} size={14} /> {saving ? 'Saving…' : isNew ? 'Add Service' : 'Save Changes'}
              </Btn>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: CONTENT
// ─────────────────────────────────────────────────────────────────────────────

function ContentTab() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('site_content').select('*').order('section');
    setItems((data as ContentItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (key: string, value: string) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, value } : i));
  };

  const saveSection = async (section: string) => {
    setSavingSection(section);
    const sectionItems = items.filter(i => i.section === section);
    for (const item of sectionItems) {
      await supabase.from('site_content').upsert({ key: item.key, value: item.value, label: item.label, section: item.section }, { onConflict: 'key' });
    }
    setSavingSection(null);
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const sections = [...new Set(items.map(i => i.section))];

  const sectionLabels: Record<string, string> = {
    hero: '🏠 Hero Section',
    about: '👤 About / Studio',
    footer: '📍 Footer',
    seo: '🔍 SEO & Meta',
  };

  return (
    <div>
      <SectionHeader
        title="Site Content"
        subtitle="Edit text that appears on the public website"
        action={<Btn variant="ghost" onClick={load}><Icon d={Icons.refresh} size={14} /> Refresh</Btn>}
      />

      {loading ? (
        <div className="text-center py-20 text-[#1A1714]/30 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">No content rows found</p>
          <p className="text-amber-700">Run the SQL migration in Supabase to seed the <code className="font-mono bg-amber-100 px-1 rounded">site_content</code> table, then refresh.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section} className="bg-white rounded-xl border border-[#F0EDE9] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0EDE9] flex items-center justify-between bg-[#FAFAF8]">
                <h3 className="font-semibold text-[#1A1714]">{sectionLabels[section] ?? section}</h3>
                <button onClick={() => saveSection(section)} disabled={savingSection === section}
                  className={`flex items-center gap-2 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${
                    saved === section ? 'bg-emerald-100 text-emerald-700' : 'bg-[#1A1714] text-white hover:bg-[#2d2926]'
                  } disabled:opacity-50`}>
                  {saved === section ? <><Icon d={Icons.check} size={13} /> Saved!</> : <><Icon d={Icons.save} size={13} /> {savingSection === section ? 'Saving…' : 'Save'}</>}
                </button>
              </div>
              <div className="p-6 space-y-4">
                {items.filter(i => i.section === section).map(item => (
                  <Field key={item.key} label={item.label}>
                    {item.value.length > 80 ? (
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        value={item.value}
                        onChange={e => update(item.key, e.target.value)}
                      />
                    ) : (
                      <input className={inputCls} value={item.value} onChange={e => update(item.key, e.target.value)} />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roleData } = await supabase.from('user_roles').select('full_name, role').eq('user_id', data.user.id).single();
      setUser({
        email: data.user.email ?? '',
        name: roleData?.full_name ?? data.user.email ?? '',
        role: roleData?.role ?? 'admin',
      });
    });
  }, []);

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Account & site configuration" />
      <div className="max-w-md space-y-6">
        {/* User card */}
        <div className="bg-white rounded-xl border border-[#F0EDE9] p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-4">Logged In As</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C4A882]/20 flex items-center justify-center text-[#C4A882] font-bold text-lg">
              {(user?.name?.[0] ?? 'A').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#1A1714]">{user?.name ?? '…'}</p>
              <p className="text-sm text-[#1A1714]/40">{user?.email ?? '…'}</p>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#C4A882] bg-[#C4A882]/10 px-2 py-0.5 rounded-full">
                {user?.role ?? 'admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-[#F0EDE9] p-6 space-y-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-4">Quick Links</p>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg border border-[#E5E0D8] hover:border-[#C4A882] transition-colors group">
            <span className="text-sm font-medium text-[#1A1714]">View Public Website</span>
            <Icon d={Icons.link} size={15} />
          </a>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-red-300 mb-4">Danger Zone</p>
          <Btn variant="danger" onClick={onSignOut}>
            <Icon d={Icons.signout} size={15} /> Sign Out
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: 'inquiries', label: 'Inquiries',  icon: Icons.inquiries },
  { id: 'gallery',   label: 'Gallery',    icon: Icons.gallery   },
  { id: 'services',  label: 'Services',   icon: Icons.services  },
  { id: 'content',   label: 'Content',    icon: Icons.content   },
  { id: 'settings',  label: 'Settings',   icon: Icons.settings  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('inquiries');
  const [inquiryCount, setInquiryCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    supabase.from('contacts').select('id, status').then(({ data }) => {
      setInquiryCount(data?.length ?? 0);
      setNewCount(data?.filter((d: any) => d.status === 'new').length ?? 0);
    });
    const channel = supabase.channel('contacts-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, async () => {
        const { data } = await supabase.from('contacts').select('id, status');
        setInquiryCount(data?.length ?? 0);
        setNewCount(data?.filter((d: any) => d.status === 'new').length ?? 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F7F4F0] font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[#1A1714] flex flex-col flex-shrink-0 h-full">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <img src="/logo.png" alt="Ashley M. Brows" className="h-14 w-auto brightness-200 opacity-90" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mt-2">Studio Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TAB_CONFIG.map(({ id, label, icon }) => {
            const isActive = tab === id;
            const badge = id === 'inquiries' && newCount > 0 ? newCount : 0;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C4A882] text-white shadow-lg shadow-[#C4A882]/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon d={icon} size={16} />
                <span className="text-[11px] uppercase tracking-widest font-bold flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-white/60 transition-colors text-left">
            <Icon d={Icons.link} size={15} />
            <span className="text-[11px] uppercase tracking-widest font-bold">View Site</span>
          </a>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-red-400 transition-colors text-left">
            <Icon d={Icons.signout} size={15} />
            <span className="text-[11px] uppercase tracking-widest font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {tab === 'inquiries' && <InquiriesTab />}
          {tab === 'gallery'   && <GalleryTab />}
          {tab === 'services'  && <ServicesTab />}
          {tab === 'content'   && <ContentTab />}
          {tab === 'settings'  && <SettingsTab onSignOut={handleSignOut} />}
        </div>
      </main>
    </div>
  );
}
