import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Calendar, Users, DollarSign, Clock, Bell, ChevronRight, Search, Lock, Mail, Check, X, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  'Confirmed':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending Deposit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Cancelled':       'bg-red-50 text-red-600 border-red-200',
  'Failed':          'bg-red-50 text-red-600 border-red-200',
  'Waitlist':        'bg-purple-50 text-purple-700 border-purple-200',
};
const DEPOSIT_STYLES: Record<string, string> = {
  'Paid':     'bg-emerald-50 text-emerald-700',
  'Unpaid':   'bg-amber-50 text-amber-700',
  'Failed':   'bg-red-50 text-red-600',
  'Refunded': 'bg-gray-100 text-gray-500',
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ cols }: { cols: number; key?: string | number }) => (
  <tr className="border-b border-ink/5">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-ink/5 rounded animate-pulse w-3/4" />
        {i === 0 && <div className="h-3 bg-ink/5 rounded animate-pulse w-1/2 mt-2" />}
      </td>
    ))}
  </tr>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, loading }: { label: string; value: string; sub: string; icon: ReactNode; loading: boolean; key?: string | number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-white border border-ink/5 rounded-xl shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-accent/8 rounded-lg">{icon}</div>
      <span className="text-[9px] uppercase font-bold text-ink/30 tracking-widest">{sub}</span>
    </div>
    {loading
      ? <div className="h-9 bg-ink/5 rounded animate-pulse w-20 mb-2" />
      : <h3 className="text-3xl font-serif mb-1">{value}</h3>}
    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{label}</p>
  </motion.div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) => (
  <div className="py-20 text-center">
    <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-4 text-ink/30">{icon}</div>
    <p className="font-serif text-xl mb-2">{title}</p>
    <p className="text-sm text-ink/40">{subtitle}</p>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [session, setSession] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [depositFilter, setDepositFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      setInitialLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
    ]);
    if (b) setBookings(b);
    if (c) setContacts(c);
    setDataLoading(false);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Filtered bookings ──────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (statusFilter !== 'All') list = list.filter(b => b.status === statusFilter);
    if (depositFilter !== 'All') list = list.filter(b => b.deposit_status === depositFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.client_name?.toLowerCase().includes(q) ||
        b.client_email?.toLowerCase().includes(q) ||
        b.service_name?.toLowerCase().includes(q) ||
        b.booking_date?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, searchQuery, statusFilter, depositFilter]);

  // ── Filtered contacts ──────────────────────────────────────────────────────
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const confirmedRevenue = bookings
    .filter(b => b.deposit_status === 'Paid')
    .reduce((acc, b) => acc + (parseInt(b.service_price?.replace(/\D/g, ''), 10) || 0), 0);

  const stats = [
    { label: 'Confirmed Revenue', value: `$${confirmedRevenue.toLocaleString()}`, sub: 'Paid deposits', icon: <DollarSign className="w-5 h-5 text-accent" /> },
    { label: 'Total Bookings', value: bookings.length.toString(), sub: 'All time', icon: <Calendar className="w-5 h-5 text-accent" /> },
    { label: 'New Leads', value: contacts.length.toString(), sub: 'Contact forms', icon: <Users className="w-5 h-5 text-accent" /> },
    { label: 'Pending Deposits', value: bookings.filter(b => b.deposit_status === 'Unpaid').length.toString(), sub: 'Awaiting payment', icon: <Clock className="w-5 h-5 text-accent" /> },
  ];

  // ── Loading state ──────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Loading Studio</p>
        </div>
      </div>
    );
  }

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-paper-dark p-10 border border-ink/10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-paper" />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-center mb-2">Studio Admin</h2>
          <p className="text-center text-ink/40 text-sm mb-8">Ashley M. Brows back office</p>
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full p-4 bg-paper border border-ink/10 focus:border-accent outline-none text-sm transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full p-4 bg-paper border border-ink/10 focus:border-accent outline-none text-sm transition-colors" />
            </div>
            <button type="submit" className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors">
              Sign In
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-6 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity py-2">
            ← Return to Public Site
          </button>
        </div>
      </div>
    );
  }

  const TABS = ['appointments', 'leads'];

  return (
    <div className="min-h-screen bg-[#fafaf8] flex font-sans text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-ink/8 flex flex-col fixed top-0 bottom-0 left-0 z-10">
        <div className="p-6 border-b border-ink/8">
          <h1 className="text-lg font-serif">Ashley M. Brows</h1>
          <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">Studio Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-accent/10 text-accent' : 'text-ink/50 hover:bg-ink/5 hover:text-ink'}`}
            >
              <span className="capitalize">{tab === 'appointments' ? 'Bookings' : 'Leads'}</span>
              {activeTab === tab && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-ink/8 space-y-2">
          <button onClick={fetchData} disabled={dataLoading}
            className="w-full flex items-center gap-2 text-xs text-ink/40 hover:text-ink transition-colors p-2 rounded-lg hover:bg-ink/5">
            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-ink/50 hover:text-ink transition-colors w-full p-2 rounded-lg hover:bg-ink/5">
            <div className="w-7 h-7 rounded-full bg-accent text-paper flex items-center justify-center font-bold text-xs">A</div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="h-16 border-b border-ink/8 flex items-center justify-between px-8 bg-white sticky top-0 z-10">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
            <input
              type="text"
              placeholder="Search clients, services, dates…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-paper-dark border border-ink/10 focus:border-accent outline-none text-sm rounded-lg transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {dataLoading && <span className="text-[10px] uppercase tracking-widest text-ink/40 animate-pulse">Syncing…</span>}
            <button className="w-9 h-9 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:text-accent hover:border-accent transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-serif mb-1">Studio Overview</h2>
              <p className="text-ink/50 text-sm">Welcome back, Ashley.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink/30">
              <TrendingUp className="w-4 h-4" />
              Live Data
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            {stats.map(s => (
              <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} loading={dataLoading} />
            ))}
          </div>

          {/* Bookings Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-white border border-ink/8 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-ink/8 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-serif">
                  Bookings
                  {filteredBookings.length !== bookings.length && (
                    <span className="ml-2 text-sm text-ink/40">({filteredBookings.length} of {bookings.length})</span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {/* Status filter */}
                  <div className="flex gap-1 bg-paper-dark rounded-lg p-1">
                    {['All', 'Confirmed', 'Pending Deposit', 'Cancelled'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-md transition-all ${statusFilter === s ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {/* Deposit filter */}
                  <div className="flex gap-1 bg-paper-dark rounded-lg p-1">
                    {['All', 'Paid', 'Unpaid'].map(d => (
                      <button key={d} onClick={() => setDepositFilter(d)}
                        className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-md transition-all ${depositFilter === d ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-dark/40 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Client</th>
                      <th className="p-4 font-bold">Service</th>
                      <th className="p-4 font-bold">Appointment</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Deposit</th>
                      <th className="p-4 font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {dataLoading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                      : filteredBookings.length === 0
                        ? (
                          <tr>
                            <td colSpan={6}>
                              <EmptyState
                                icon={<Calendar className="w-7 h-7" />}
                                title={bookings.length === 0 ? 'No bookings yet' : 'No matching bookings'}
                                subtitle={bookings.length === 0 ? 'Bookings will appear here once clients complete the form.' : 'Try adjusting your search or filters.'}
                              />
                            </td>
                          </tr>
                        )
                        : filteredBookings.map(b => (
                          <tr key={b.id} className="border-b border-ink/5 hover:bg-paper-dark/20 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold">{b.client_name}</div>
                              <div className="text-xs text-ink/50 mt-0.5">{b.client_email}</div>
                              <div className="text-xs text-ink/40">{b.client_phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-ink/80">{b.service_name}</div>
                              <div className="text-xs mt-0.5 text-accent font-bold">{b.service_price}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{b.booking_date || '—'}</div>
                              <div className="text-xs mt-0.5 text-ink/50">{b.booking_time || '—'}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[b.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                {b.status === 'Confirmed' && <Check className="w-3 h-3 mr-1" />}
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${DEPOSIT_STYLES[b.deposit_status] || 'bg-gray-50 text-gray-500'}`}>
                                {b.deposit_status === 'Paid' && <Check className="w-3 h-3 mr-1" />}
                                {b.deposit_status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-ink/40">
                              {b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="bg-white border border-ink/8 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-ink/8 flex items-center justify-between">
                <h3 className="text-lg font-serif">
                  Contact Leads
                  {filteredContacts.length !== contacts.length && (
                    <span className="ml-2 text-sm text-ink/40">({filteredContacts.length} of {contacts.length})</span>
                  )}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-dark/40 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Lead</th>
                      <th className="p-4 font-bold">Interest</th>
                      <th className="p-4 font-bold">Message</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Received</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {dataLoading
                      ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                      : filteredContacts.length === 0
                        ? (
                          <tr>
                            <td colSpan={5}>
                              <EmptyState
                                icon={<Mail className="w-7 h-7" />}
                                title={contacts.length === 0 ? 'No leads yet' : 'No matching leads'}
                                subtitle={contacts.length === 0 ? 'Contact form submissions will appear here.' : 'Try adjusting your search.'}
                              />
                            </td>
                          </tr>
                        )
                        : filteredContacts.map(c => (
                          <tr key={c.id} className="border-b border-ink/5 hover:bg-paper-dark/20 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold">{c.name}</div>
                              <div className="text-xs text-ink/50 mt-0.5">{c.email}</div>
                            </td>
                            <td className="p-4 text-ink/70 max-w-[160px]">
                              <p className="truncate">{c.interested_services || '—'}</p>
                            </td>
                            <td className="p-4 text-ink/70 max-w-sm">
                              <p className="line-clamp-2 text-xs leading-relaxed">{c.message}</p>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                {c.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-ink/40">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
