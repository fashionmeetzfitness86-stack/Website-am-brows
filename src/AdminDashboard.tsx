import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { uploadImage } from './lib/uploadImage';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface ServiceRow {
  id: string;
  sort_order: number;
  title: string;
  price: string;
  short_description: string;
  description: string;
  image_url: string;
  tags: string[];
  variants: Array<{ title: string; price: string; image: string; description: string }>;
  process: Array<{ step: string; description: string }>;
  testimonials: Array<{ author: string; text: string }>;
}

interface GalleryRow {
  id: string;
  sort_order: number;
  image_url: string;
  title: string;
  category: string;
  description: string;
}

type Tab = 'inquiries' | 'services' | 'gallery';

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-amber-100 text-amber-800',
  contacted: 'bg-blue-100 text-blue-800',
  booked:    'bg-green-100 text-green-800',
  closed:    'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', booked: 'Booked', closed: 'Closed',
};

// ─── Root component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('inquiries');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="fixed inset-y-0 left-0 w-56 bg-[#1A1714] flex flex-col z-30">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Ashley M.</p>
              <p className="text-[#C4A882] text-[10px] uppercase tracking-widest">Studio Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {([
            { key: 'inquiries', label: 'Inquiries' },
            { key: 'services',  label: 'Services & Prices' },
            { key: 'gallery',   label: 'Gallery' },
          ] as Array<{ key: Tab; label: string }>).map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${
                tab === item.key
                  ? 'bg-[#C4A882] text-white font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/" target="_blank" className="block w-full text-center px-3 py-2 text-white/40 hover:text-white text-xs transition-colors">
            View Website ↗
          </a>
          <button onClick={handleSignOut} className="w-full px-3 py-2 text-white/40 hover:text-red-400 text-xs transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-56 p-8">
        {tab === 'inquiries' && <InquiriesPane />}
        {tab === 'services'  && <ServicesPane />}
        {tab === 'gallery'   && <GalleryPane />}
      </main>
    </div>
  );
}

// ─── Inquiries pane ──────────────────────────────────────────────────────────

function InquiriesPane() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (!error) setInquiries((data as Inquiry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase.channel('contacts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as Inquiry['status'] } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Inquiry['status'] } : prev);
    }
    setUpdatingId(null);
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return;
    await supabase.from('contacts').delete().eq('id', id);
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);
  const counts = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    booked: inquiries.filter(i => i.status === 'booked').length,
  };
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1714]">{filter === 'all' ? 'All Inquiries' : STATUS_LABELS[filter]}</h1>
          <p className="text-sm text-[#1A1714]/50 mt-1">{filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}</p>
        </div>
        <div className="flex gap-2">
          {(['all','new','contacted','booked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold rounded ${filter === f ? 'bg-[#1A1714] text-white' : 'bg-white text-[#1A1714]/50 hover:bg-[#F0EDE9]'}`}>
              {f === 'all' ? 'All' : STATUS_LABELS[f]} ({f === 'all' ? counts.total : counts[f as 'new'|'contacted'|'booked']})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 text-[#1A1714]/30">
          <p className="text-sm font-medium">No inquiries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0EDE9]">
                {['Date','Name','Service','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inquiry => (
                <tr key={inquiry.id} onClick={() => setSelected(inquiry)} className="border-b border-[#F0EDE9] hover:bg-[#FAF9F7] cursor-pointer">
                  <td className="px-5 py-4 text-[#1A1714]/50 whitespace-nowrap">{fmt(inquiry.created_at)}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#1A1714]">{inquiry.name}</p>
                    <p className="text-[#1A1714]/40 text-xs">{inquiry.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#1A1714]/70">{inquiry.service || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${STATUS_COLORS[inquiry.status] ?? STATUS_COLORS.new}`}>
                      {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <a href={`mailto:${inquiry.email}?subject=Re: Your Ashley M. Brows Inquiry`}
                      className="text-[10px] uppercase tracking-widest font-bold text-[#C4A882] hover:text-[#1A1714]">Reply</a>
                    <span className="text-[#1A1714]/20 mx-2">|</span>
                    <button onClick={() => deleteInquiry(inquiry.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#F0EDE9] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-[#1A1714]">{selected.name}</h2>
                <p className="text-xs text-[#1A1714]/40">{fmt(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#1A1714]/30 hover:text-[#1A1714] text-xl">&times;</button>
            </div>
            <div className="px-6 py-6 space-y-6">
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Contact</p>
                <p className="text-sm"><a href={`mailto:${selected.email}`} className="text-[#C4A882]">{selected.email}</a></p>
                {selected.phone && <p className="text-sm mt-1"><a href={`tel:${selected.phone}`}>{selected.phone}</a></p>}
              </section>
              {(selected.service || selected.city || selected.preferred_date) && (
                <section>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Details</p>
                  {selected.service && <p className="text-sm"><span className="text-[#1A1714]/50">Service:</span> {selected.service}</p>}
                  {selected.city && <p className="text-sm"><span className="text-[#1A1714]/50">Location:</span> {selected.city}</p>}
                  {selected.preferred_date && <p className="text-sm"><span className="text-[#1A1714]/50">Preferred:</span> {selected.preferred_date}</p>}
                </section>
              )}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Message</p>
                <div className="bg-[#FAF9F7] rounded p-4 text-sm whitespace-pre-wrap">{selected.message}</div>
              </section>
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['new','contacted','booked','closed'] as const).map(s => (
                    <button key={s} disabled={updatingId === selected.id} onClick={() => updateStatus(selected.id, s)}
                      className={`py-2.5 text-[10px] uppercase tracking-widest font-bold rounded ${
                        selected.status === s ? 'bg-[#1A1714] text-white' : 'bg-[#FAF9F7] text-[#1A1714]/50 hover:bg-[#F0EDE9]'
                      }`}>{STATUS_LABELS[s]}</button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Services pane ───────────────────────────────────────────────────────────

function ServicesPane() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_services').select('*').order('sort_order');
    if (!error) setRows((data as ServiceRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (row: ServiceRow) => {
    setSavingId(row.id);
    const { error } = await supabase.from('site_services').update({
      title: row.title,
      price: row.price,
      short_description: row.short_description,
      description: row.description,
      image_url: row.image_url,
      tags: row.tags,
      variants: row.variants,
      process: row.process,
      updated_at: new Date().toISOString(),
    }).eq('id', row.id);
    setSavingId(null);
    if (error) { alert('Save failed: ' + error.message); return; }
    setRows(prev => prev.map(r => r.id === row.id ? row : r));
    setEditing(null);
    setSavedId(row.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1714]">Services & Prices</h1>
        <p className="text-sm text-[#1A1714]/50 mt-1">Edits appear on the live site within seconds.</p>
      </div>

      <div className="grid gap-4">
        {rows.map(row => (
          <div key={row.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-5 p-5">
              <img src={row.image_url} alt="" className="w-20 h-20 object-cover rounded shrink-0 bg-[#F0EDE9]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-semibold text-[#1A1714]">{row.title}</h3>
                  <span className="text-[#C4A882] font-semibold">{row.price}</span>
                </div>
                <p className="text-sm text-[#1A1714]/60 mt-1 truncate">{row.short_description}</p>
                <p className="text-xs text-[#1A1714]/30 mt-1">{row.tags.join(' · ')}</p>
              </div>
              <button
                onClick={() => setEditing(row)}
                className="px-4 py-2 bg-[#1A1714] text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[#C4A882]"
              >Edit</button>
              {savedId === row.id && <span className="text-emerald-600 text-xs font-semibold">Saved ✓</span>}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ServiceEditModal
          row={editing}
          saving={savingId === editing.id}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </>
  );
}

function ServiceEditModal({ row, saving, onClose, onSave }: {
  row: ServiceRow; saving: boolean; onClose: () => void; onSave: (r: ServiceRow) => void;
}) {
  const [draft, setDraft] = useState<ServiceRow>(row);
  const set = (patch: Partial<ServiceRow>) => setDraft(d => ({ ...d, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-16 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#F0EDE9] px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="font-semibold text-[#1A1714]">Edit Service: {row.title}</h2>
          <button onClick={onClose} className="text-[#1A1714]/30 hover:text-[#1A1714] text-xl">&times;</button>
        </div>

        <div className="px-6 py-6 space-y-5">
          <Field label="Title" value={draft.title} onChange={v => set({ title: v })} />
          <Field label="Price (display)" value={draft.price} onChange={v => set({ price: v })} placeholder="$650 or $650+" />
          <ImageUploader label="Main photo" value={draft.image_url} onChange={v => set({ image_url: v })} folder="services" />
          <Field label="Short description" value={draft.short_description} onChange={v => set({ short_description: v })} multiline />
          <Field label="Full description" value={draft.description} onChange={v => set({ description: v })} multiline rows={5} />
          <Field
            label="Tags (comma-separated)"
            value={draft.tags.join(', ')}
            onChange={v => set({ tags: v.split(',').map(t => t.trim()).filter(Boolean) })}
          />

          {Array.isArray(draft.variants) && draft.variants.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 mb-3">Variants ({draft.variants.length})</p>
              <div className="space-y-3">
                {draft.variants.map((v, i) => (
                  <div key={i} className="bg-[#FAF9F7] rounded p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => set({ variants: draft.variants.filter((_, j) => j !== i) })}
                      className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600"
                    >Remove</button>
                    <Field label="Variant title" value={v.title} onChange={x => set({ variants: draft.variants.map((vv, j) => j === i ? { ...vv, title: x } : vv) })} />
                    <Field label="Variant price" value={v.price} onChange={x => set({ variants: draft.variants.map((vv, j) => j === i ? { ...vv, price: x } : vv) })} />
                    <ImageUploader label="Variant photo" value={v.image} onChange={x => set({ variants: draft.variants.map((vv, j) => j === i ? { ...vv, image: x } : vv) })} folder="services" />
                    <Field label="Variant description" value={v.description} onChange={x => set({ variants: draft.variants.map((vv, j) => j === i ? { ...vv, description: x } : vv) })} multiline rows={3} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => set({ variants: [...draft.variants, { title: '', price: '', image: '', description: '' }] })}
                className="mt-3 text-[10px] uppercase tracking-widest font-bold text-[#C4A882] hover:text-[#1A1714]"
              >+ Add variant</button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#F0EDE9] px-6 py-4 flex gap-3 rounded-b-lg">
          <button onClick={onClose} className="px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 hover:text-[#1A1714]">Cancel</button>
          <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className="flex-1 py-3 bg-[#C4A882] text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[#b8976e] disabled:opacity-50"
          >{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery pane ────────────────────────────────────────────────────────────

function GalleryPane() {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_gallery').select('*').order('sort_order');
    if (!error) setRows((data as GalleryRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (row: GalleryRow) => {
    const { error } = await supabase.from('site_gallery').update({
      title: row.title,
      category: row.category,
      description: row.description,
      image_url: row.image_url,
      sort_order: row.sort_order,
      updated_at: new Date().toISOString(),
    }).eq('id', row.id);
    if (error) { alert('Save failed: ' + error.message); return; }
    setEditing(null);
    load();
  };

  const create = async (row: Omit<GalleryRow, 'id'>) => {
    const { error } = await supabase.from('site_gallery').insert({
      title: row.title,
      category: row.category,
      description: row.description,
      image_url: row.image_url,
      sort_order: row.sort_order,
    });
    if (error) { alert('Add failed: ' + error.message); return; }
    setCreating(false);
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this gallery item?')) return;
    const { error } = await supabase.from('site_gallery').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" /></div>;

  const nextSortOrder = rows.length ? Math.max(...rows.map(r => r.sort_order)) + 10 : 10;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1714]">Gallery</h1>
          <p className="text-sm text-[#1A1714]/50 mt-1">{rows.length} items. Edits appear on the live site within seconds.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-5 py-2.5 bg-[#C4A882] text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[#b8976e]"
        >+ Add item</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(row => (
          <div key={row.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
            <div className="aspect-[4/3] bg-[#F0EDE9] overflow-hidden">
              <img src={row.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-[9px] uppercase tracking-widest font-bold text-[#C4A882]">{row.category}</p>
              <h3 className="font-semibold text-[#1A1714] mt-1">{row.title}</h3>
              <p className="text-xs text-[#1A1714]/50 mt-1 line-clamp-2">{row.description}</p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => setEditing(row)} className="text-[10px] uppercase tracking-widest font-bold text-[#C4A882] hover:text-[#1A1714]">Edit</button>
                <button onClick={() => remove(row.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <GalleryEditModal
          row={editing}
          isNew={false}
          onClose={() => setEditing(null)}
          onSave={save as any}
        />
      )}

      {creating && (
        <GalleryEditModal
          row={{ id: '', sort_order: nextSortOrder, image_url: '', title: '', category: 'Signature Brows', description: '' }}
          isNew
          onClose={() => setCreating(false)}
          onSave={create as any}
        />
      )}
    </>
  );
}

function GalleryEditModal({ row, isNew, onClose, onSave }: {
  row: GalleryRow; isNew: boolean; onClose: () => void; onSave: (r: any) => void;
}) {
  const [draft, setDraft] = useState<GalleryRow>(row);
  const set = (patch: Partial<GalleryRow>) => setDraft(d => ({ ...d, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-16 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-[#F0EDE9] flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1714]">{isNew ? 'Add Gallery Item' : 'Edit Gallery Item'}</h2>
          <button onClick={onClose} className="text-[#1A1714]/30 hover:text-[#1A1714] text-xl">&times;</button>
        </div>
        <div className="px-6 py-6 space-y-5">
          <ImageUploader label="Photo" value={draft.image_url} onChange={v => set({ image_url: v })} folder="gallery" />
          <Field label="Title" value={draft.title} onChange={v => set({ title: v })} />
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 mb-2">Category</label>
            <select
              value={draft.category}
              onChange={e => set({ category: e.target.value })}
              className="w-full p-3 bg-white border border-[#F0EDE9] rounded text-sm"
            >
              <option>Signature Brows</option>
              <option>Lip Blush</option>
              <option>Defining Liner</option>
              <option>Tooth Gems</option>
            </select>
          </div>
          <Field label="Caption (under the title)" value={draft.description} onChange={v => set({ description: v })} placeholder="3 Hour Procedure · Nano Strokes" />
          <Field label="Sort order (lower = first)" value={String(draft.sort_order)} onChange={v => set({ sort_order: parseInt(v) || 0 })} />
        </div>
        <div className="px-6 py-4 border-t border-[#F0EDE9] flex gap-3">
          <button onClick={onClose} className="px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 hover:text-[#1A1714]">Cancel</button>
          <button
            onClick={() => onSave(draft)}
            className="flex-1 py-3 bg-[#C4A882] text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[#b8976e]"
          >{isNew ? 'Add to gallery' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Image uploader ──────────────────────────────────────────────────────────

function ImageUploader({ label, value, onChange, folder }: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'services' | 'gallery';
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setErr('Image too large (max 8 MB).'); return; }
    setUploading(true); setErr(null);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e: any) {
      setErr(e?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 mb-2">{label}</label>

      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="/path/photo.jpg or paste URL"
          className="flex-1 p-3 bg-white border border-[#F0EDE9] rounded text-sm focus:border-[#C4A882] outline-none"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[#1A1714] text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[#C4A882] disabled:opacity-50 whitespace-nowrap"
        >
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>

      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}

      {value && (
        <div className="mt-3 aspect-[4/3] bg-[#F0EDE9] rounded overflow-hidden max-w-xs">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

// ─── Field helper ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, multiline, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; rows?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/50 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3 bg-white border border-[#F0EDE9] rounded text-sm leading-relaxed focus:border-[#C4A882] outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 bg-white border border-[#F0EDE9] rounded text-sm focus:border-[#C4A882] outline-none"
        />
      )}
    </div>
  );
}
