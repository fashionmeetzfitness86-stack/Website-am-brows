import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Calendar, Users, DollarSign, Clock, Bell, ChevronRight, Search, Lock, Mail, Check, X, RefreshCw, TrendingUp, AlertCircle, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  'New Request':   'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review':  'bg-amber-50 text-amber-700 border-amber-200',
  'Confirmed':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rescheduled':   'bg-purple-50 text-purple-700 border-purple-200',
  'Completed':     'bg-teal-50 text-teal-700 border-teal-200',
  'Cancelled':     'bg-red-50 text-red-600 border-red-200',
  'No Show':       'bg-gray-100 text-gray-500 border-gray-200',
};
const ALL_STATUSES = ['New Request','Under Review','Confirmed','Rescheduled','Completed','Cancelled','No Show'];


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
  const [userRole, setUserRole] = useState<string | null>(null);
  // roleChecked prevents a flash of "Access Denied" while the role is being fetched
  const [roleChecked, setRoleChecked] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  // Team management state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState('');
  const [teamSuccess, setTeamSuccess] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  // Booking detail panel state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('');
  const [notesEdit, setNotesEdit] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Await role fetch before clearing initialLoading so we never flash
    // "Access Denied" for a valid user whose role hasn't loaded yet.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
        await fetchRole(session.user.id);
      }
      setInitialLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Signed out — reset role state
        setUserRole(null);
        setRoleChecked(false);
      } else {
        fetchData();
        fetchRole(session.user.id);
      }
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

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
    // SECURITY: Default to null — not 'staff'. Any user without an approved
    // user_roles row is denied access, even if they have a valid Auth session.
    const role = data?.role ?? null;
    setUserRole(role);
    setRoleChecked(true);
    if (role === 'super_admin') fetchTeam();
  };

  const fetchTeam = async () => {
    const { data } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
    if (data) setTeamMembers(data);
  };

  const handleCreateStaff = async (e: any) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to create a new staff account for ${newStaffName} (${newStaffEmail})? They will immediately be granted access to the admin dashboard.`)) return;
    
    setTeamLoading(true); setTeamError(''); setTeamSuccess('');
    const { data, error } = await supabase.functions.invoke('create-staff-user', {
      body: { email: newStaffEmail, full_name: newStaffName, password: newStaffPassword },
    });
    
    if (error || data?.error) {
      setTeamError(data?.error || error?.message || 'Failed to create staff user. Make sure the create-staff-user Edge Function is deployed with the SUPABASE_SERVICE_ROLE_KEY secret.');
    } else {
      setTeamSuccess(`Staff user ${newStaffEmail} created successfully!`);
      setNewStaffEmail(''); setNewStaffName(''); setNewStaffPassword('');
      fetchTeam();
    }
    setTeamLoading(false);
  };

  const handleRemoveStaff = async (userId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from staff? This will also delete their login account.`)) return;
    setTeamLoading(true); setTeamError(''); setTeamSuccess('');
    const { data, error } = await supabase.functions.invoke('remove-staff-user', {
      body: { user_id: userId },
    });
    if (error || data?.error) {
      setTeamError(data?.error || 'Failed to remove staff user. Please try again.');
    } else {
      const msg = data?.warning
        ? `Role removed. Note: ${data.warning}`
        : `${memberEmail} has been removed and their account deleted.`;
      setTeamSuccess(msg);
      fetchTeam();
    }
    setTeamLoading(false);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    fetchData();
  };

  // Open detail panel and pre-fill fields
  const openBooking = (b: any) => {
    setSelectedBooking(b);
    setConfirmDate(b.confirmed_date || b.booking_date || '');
    setConfirmTime(b.confirmed_time || b.booking_time || '');
    setNotesEdit(b.admin_notes || '');
    setActionMsg('');
  };

  // Approve the client's requested date/time as-is
  const handleApproveTime = async () => {
    if (!selectedBooking) return;
    setActionLoading(true); setActionMsg('');
    const { error } = await supabase.from('bookings').update({
      confirmed_date: selectedBooking.booking_date,
      confirmed_time: selectedBooking.booking_time,
      status: 'Confirmed',
    }).eq('id', selectedBooking.id);
    if (!error) {
      const updated = { ...selectedBooking, confirmed_date: selectedBooking.booking_date, confirmed_time: selectedBooking.booking_time, status: 'Confirmed' };
      setSelectedBooking(updated);
      fetchData();
      setActionMsg('Requested time approved and marked Confirmed.');
    } else { setActionMsg('Error: ' + error.message); }
    setActionLoading(false);
  };

  // Save admin-specified confirmed date/time
  const handleConfirmTime = async () => {
    if (!selectedBooking || !confirmDate || !confirmTime) return;
    setActionLoading(true); setActionMsg('');
    const { error } = await supabase.from('bookings').update({
      confirmed_date: confirmDate,
      confirmed_time: confirmTime,
      status: 'Confirmed',
    }).eq('id', selectedBooking.id);
    if (!error) {
      const updated = { ...selectedBooking, confirmed_date: confirmDate, confirmed_time: confirmTime, status: 'Confirmed' };
      setSelectedBooking(updated);
      fetchData();
      setActionMsg('Confirmed date/time saved. Status set to Confirmed.');
    } else { setActionMsg('Error: ' + error.message); }
    setActionLoading(false);
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setActionLoading(true); setActionMsg('');
    const { error } = await supabase.from('bookings').update({ admin_notes: notesEdit }).eq('id', selectedBooking.id);
    if (!error) {
      setSelectedBooking({ ...selectedBooking, admin_notes: notesEdit });
      fetchData();
      setActionMsg('Notes saved.');
    } else { setActionMsg('Error: ' + error.message); }
    setActionLoading(false);
  };

  // Send confirmation email
  const handleSendEmail = async (emailType: string) => {
    if (!selectedBooking) return;
    if (!selectedBooking.confirmed_date) { setActionMsg('Set a confirmed date/time first before sending email.'); return; }
    setActionLoading(true); setActionMsg('');
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: { booking_id: selectedBooking.id, email_type: emailType },
    });
    if (error || data?.error) {
      setActionMsg('Email failed: ' + (data?.error || error?.message));
    } else {
      const updated = { ...selectedBooking, email_confirmation_sent: true };
      setSelectedBooking(updated);
      fetchData();
      setActionMsg(`Confirmation email sent to ${selectedBooking.client_email}`);
    }
    setActionLoading(false);
  };

  // Cancel a request
  const handleCancelRequest = async () => {
    if (!selectedBooking || !confirm('Cancel this consultation request?')) return;
    setActionLoading(true);
    await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', selectedBooking.id);
    setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
    fetchData();
    setActionMsg('Request cancelled.');
    setActionLoading(false);
  };

  // Mark completed
  const handleMarkCompleted = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    await supabase.from('bookings').update({ status: 'Completed' }).eq('id', selectedBooking.id);
    setSelectedBooking({ ...selectedBooking, status: 'Completed' });
    fetchData();
    setActionMsg('Marked as Completed.');
    setActionLoading(false);
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  // ── Filtered bookings ──────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (statusFilter !== 'All') list = list.filter(b => b.status === statusFilter);
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
  }, [bookings, searchQuery, statusFilter]);

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
  const stats = [
    { label: 'Total Requests', value: bookings.length.toString(), sub: 'All time', icon: <Calendar className="w-5 h-5 text-accent" /> },
    { label: 'New Requests', value: bookings.filter(b => b.status === 'New Request').length.toString(), sub: 'Awaiting review', icon: <Bell className="w-5 h-5 text-accent" /> },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length.toString(), sub: 'Appointments', icon: <Check className="w-5 h-5 text-accent" /> },
    { label: 'New Leads', value: contacts.length.toString(), sub: 'Contact forms', icon: <Users className="w-5 h-5 text-accent" /> },
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

  // ── Access denied — logged in but no approved role ────────────────────────
  if (session && roleChecked && !userRole) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-paper-dark p-10 border border-red-200 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif mb-2">Access Denied</h2>
          <p className="text-ink/50 text-sm mb-8">
            Your account does not have permission to access the studio dashboard.
            Contact the studio owner to be added as a staff member.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }


  const TABS = userRole === 'super_admin'
    ? ['appointments', 'leads', 'team']
    : ['appointments', 'leads'];

  const TAB_LABELS: Record<string, string> = { appointments: 'Requests', leads: 'Leads', team: 'Team' };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex font-sans text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-ink/8 flex flex-col fixed top-0 bottom-0 left-0 z-10">
        <div className="p-6 border-b border-ink/8 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Ashley Brows" className="h-20 w-auto mb-2" />
          <p className="text-[9px] uppercase tracking-widest font-bold opacity-30">Studio Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-accent/10 text-accent' : 'text-ink/50 hover:bg-ink/5 hover:text-ink'}`}
            >
              <span>{TAB_LABELS[tab]}</span>
              {tab === 'team' && <ShieldCheck className="w-4 h-4 opacity-40" />}
              {activeTab === tab && tab !== 'team' && <ChevronRight className="w-4 h-4" />}
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
              <p className="text-ink/50 text-sm">Consultation Requests Dashboard</p>
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
                    {['All', 'New Request', 'Confirmed', 'Cancelled'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-md transition-all ${statusFilter === s ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}>
                        {s}
                      </button>
                    ))}
                  </div></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-dark/40 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Client</th>
                      <th className="p-4 font-bold">Service</th>
                      <th className="p-4 font-bold">Appointment</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Notes</th>
                      <th className="p-4 font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {dataLoading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                      : filteredBookings.length === 0
                        ? (
                          <tr>
                            <td colSpan={7}>
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
                               <select value={b.status} onChange={e => handleStatusChange(b.id, e.target.value)}
                                 className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-1 outline-none cursor-pointer ${STATUS_STYLES[b.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                 {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                               </select>
                             </td>
                             <td className="p-4 text-xs text-ink/40 max-w-[120px]">
                               <p className="truncate">{b.notes || '—'}</p>
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

          {/* Team Tab — super_admin only */}
          {activeTab === 'team' && userRole === 'super_admin' && (
            <div className="space-y-8">
              {/* Invite form */}
              <div className="bg-white border border-ink/8 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-serif">Invite Staff Member</h3>
                </div>
                <AnimatePresence>
                  {teamError && (
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{teamError}
                    </motion.div>
                  )}
                  {teamSuccess && (
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Check className="w-4 h-4" />{teamSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleCreateStaff} className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Full Name</label>
                    <input value={newStaffName} onChange={e=>setNewStaffName(e.target.value)} required
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email</label>
                    <input type="email" value={newStaffEmail} onChange={e=>setNewStaffEmail(e.target.value)} required
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Temp Password</label>
                    <input type="password" value={newStaffPassword} onChange={e=>setNewStaffPassword(e.target.value)} required minLength={8}
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="Min 8 characters" />
                  </div>
                  <div className="md:col-span-3">
                    <button type="submit" disabled={teamLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors disabled:opacity-50">
                      {teamLoading ? 'Creating…' : <><UserPlus className="w-4 h-4" /> Add Staff Member</>}
                    </button>
                    <p className="text-xs text-ink/40 mt-2">Staff can view and edit bookings. Share the temp password with them — they can change it after logging in.</p>
                  </div>
                </form>
              </div>

              {/* Current team */}
              <div className="bg-white border border-ink/8 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-ink/8">
                  <h3 className="text-lg font-serif">Current Team ({teamMembers.length})</h3>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-paper-dark/40 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Member</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Added</th>
                      <th className="p-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {teamMembers.length === 0 ? (
                      <tr><td colSpan={4}><EmptyState icon={<Users className="w-6 h-6" />} title="No team members yet" subtitle="Invite your first staff member above." /></td></tr>
                    ) : teamMembers.map(m => (
                      <tr key={m.id} className="border-b border-ink/5 hover:bg-paper-dark/20 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold">{m.full_name || '—'}</div>
                          <div className="text-xs text-ink/50 mt-0.5">{m.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            m.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {m.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-ink/40">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-4">
                          {m.role !== 'super_admin' && (
                            <button onClick={() => handleRemoveStaff(m.user_id, m.email)}
                              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                          {m.role === 'super_admin' && <span className="text-xs text-ink/30">Owner</span>}
                        </td>
                      </tr>
                    ))}
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
