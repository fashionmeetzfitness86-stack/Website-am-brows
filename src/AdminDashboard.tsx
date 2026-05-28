import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

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

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-amber-100 text-amber-800',
  contacted: 'bg-blue-100 text-blue-800',
  booked:    'bg-green-100 text-green-800',
  closed:    'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  new:       'New',
  contacted: 'Contacted',
  booked:    'Booked',
  closed:    'Closed',
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin] Failed to load inquiries:', error.message);
    } else {
      setInquiries((data as Inquiry[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Real-time updates ──────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('contacts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as Inquiry['status'] } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Inquiry['status'] } : prev);
    }
    setUpdatingId(null);
  };

  // ── Delete inquiry ─────────────────────────────────────────────────────────
  const deleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry? This cannot be undone.')) return;
    await supabase.from('contacts').delete().eq('id', id);
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const counts = {
    total:     inquiries.length,
    new:       inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    booked:    inquiries.filter(i => i.status === 'booked').length,
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAF9F7]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
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
          {[
            { label: 'Inquiries',    count: counts.total },
            { label: 'New',          count: counts.new,       filter: 'new'       },
            { label: 'Contacted',    count: counts.contacted,  filter: 'contacted' },
            { label: 'Booked',       count: counts.booked,    filter: 'booked'    },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setFilter(item.filter ?? 'all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm transition-colors ${
                (filter === (item.filter ?? 'all'))
                  ? 'bg-[#C4A882] text-white font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                (filter === (item.filter ?? 'all')) ? 'bg-white/20' : 'bg-white/10'
              }`}>{item.count}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            className="block w-full text-center px-3 py-2 text-white/40 hover:text-white text-xs transition-colors"
          >
            View Website ↗
          </a>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-white/40 hover:text-red-400 text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="ml-56 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1A1714]">
            {filter === 'all' ? 'All Inquiries' : STATUS_LABELS[filter]}
          </h1>
          <p className="text-sm text-[#1A1714]/50 mt-1">
            {filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}
            {filter !== 'all' && ` · ${counts.new} new total`}
          </p>
        </div>

        {/* Stat cards */}
        {filter === 'all' && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total',     value: counts.total,     color: 'border-[#C4A882]' },
              { label: 'New',       value: counts.new,       color: 'border-amber-400' },
              { label: 'Contacted', value: counts.contacted, color: 'border-blue-400'  },
              { label: 'Booked',    value: counts.booked,    color: 'border-green-400' },
            ].map(card => (
              <div key={card.label} className={`bg-white rounded-lg p-5 border-l-4 ${card.color} shadow-sm`}>
                <p className="text-3xl font-semibold text-[#1A1714]">{card.value}</p>
                <p className="text-xs uppercase tracking-widest font-bold text-[#1A1714]/40 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 border-2 border-[#C4A882] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-[#1A1714]/30">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium">No {filter !== 'all' ? filter : ''} inquiries yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE9]">
                  {['Date', 'Name', 'Service', 'City', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inquiry => (
                  <tr
                    key={inquiry.id}
                    onClick={() => setSelected(inquiry)}
                    className="border-b border-[#F0EDE9] hover:bg-[#FAF9F7] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 text-[#1A1714]/50 whitespace-nowrap">{fmt(inquiry.created_at)}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1A1714]">{inquiry.name}</p>
                      <p className="text-[#1A1714]/40 text-xs">{inquiry.email}</p>
                    </td>
                    <td className="px-5 py-4 text-[#1A1714]/70">{inquiry.service || '—'}</td>
                    <td className="px-5 py-4 text-[#1A1714]/50">{inquiry.city || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${STATUS_COLORS[inquiry.status] ?? STATUS_COLORS.new}`}>
                        {STATUS_LABELS[inquiry.status] ?? inquiry.status}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${inquiry.email}?subject=Re: Your Ashley M. Brows Inquiry`}
                          className="text-[10px] uppercase tracking-widest font-bold text-[#C4A882] hover:text-[#1A1714] transition-colors"
                        >
                          Reply
                        </a>
                        <span className="text-[#1A1714]/20">|</span>
                        <button
                          onClick={() => deleteInquiry(inquiry.id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-red-300 hover:text-red-600 transition-colors"
                        >
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
      </main>

      {/* ── Detail panel ──────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col">

            {/* Panel header */}
            <div className="sticky top-0 bg-white border-b border-[#F0EDE9] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-[#1A1714]">{selected.name}</h2>
                <p className="text-xs text-[#1A1714]/40">{fmt(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#1A1714]/30 hover:text-[#1A1714] text-xl leading-none">&times;</button>
            </div>

            {/* Panel body */}
            <div className="flex-1 px-6 py-6 space-y-6">

              {/* Contact info */}
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

              {/* Inquiry details */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Inquiry Details</p>
                <div className="space-y-2 text-sm">
                  {selected.service && (
                    <div className="flex justify-between">
                      <span className="text-[#1A1714]/50">Service</span>
                      <span className="text-[#1A1714] font-medium">{selected.service}</span>
                    </div>
                  )}
                  {selected.city && (
                    <div className="flex justify-between">
                      <span className="text-[#1A1714]/50">Location</span>
                      <span className="text-[#1A1714]">{selected.city}</span>
                    </div>
                  )}
                  {selected.preferred_date && (
                    <div className="flex justify-between">
                      <span className="text-[#1A1714]/50">Preferred Date</span>
                      <span className="text-[#1A1714]">{selected.preferred_date}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Message */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Message</p>
                <div className="bg-[#FAF9F7] rounded p-4 text-sm text-[#1A1714]/80 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </section>

              {/* Status */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1714]/30 mb-3">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['new', 'contacted', 'booked', 'closed'] as const).map(s => (
                    <button
                      key={s}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`py-2.5 text-[10px] uppercase tracking-widest font-bold rounded transition-colors ${
                        selected.status === s
                          ? 'bg-[#1A1714] text-white'
                          : 'bg-[#FAF9F7] text-[#1A1714]/50 hover:bg-[#F0EDE9] hover:text-[#1A1714]'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Panel footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#F0EDE9] px-6 py-4 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: Your Ashley M. Brows Inquiry`}
                className="flex-1 py-3 bg-[#C4A882] text-white text-[10px] uppercase tracking-widest font-bold text-center rounded hover:bg-[#b8976e] transition-colors"
              >
                Reply via Email
              </a>
              <button
                onClick={() => deleteInquiry(selected.id)}
                className="px-5 py-3 border border-red-200 text-red-400 text-[10px] uppercase tracking-widest font-bold rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
