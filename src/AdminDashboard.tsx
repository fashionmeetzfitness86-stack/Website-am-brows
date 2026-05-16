import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Calendar, Users, DollarSign, Clock, Bell, ChevronRight, Search, Lock, Mail, Check, X, RefreshCw, TrendingUp, AlertCircle, UserPlus, Trash2, ShieldCheck, Printer, Pencil } from 'lucide-react';
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

// ─── Signed-URL photo thumbnail (private bucket) ──────────────────────────────
function getStoragePath(url: string): string | null {
  if (!url) return null;
  const match = url.match(/booking-photos\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}

function ModalPhoto({ url, label }: { url: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!url) return;
    const path = getStoragePath(url);
    if (!path) { setSrc(url); return; }
    supabase.storage.from('booking-photos').createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSrc(data.signedUrl); else setErr(true); })
      .catch(() => setErr(true));
  }, [url]);
  return (
    <div className="flex-1">
      <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1.5">{label}</p>
      <div className="aspect-square rounded-lg overflow-hidden border border-ink/10 bg-paper-dark flex items-center justify-center">
        {err ? (
          <span className="text-[10px] text-ink/30 uppercase font-bold tracking-widest">Unavailable</span>
        ) : src ? (
          <img src={src} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        )}
      </div>
    </div>
  );
}

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
  // Edit member panel state
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [memberMsg, setMemberMsg] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
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

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  const markAllRead = async () => {
    if (!session) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
    const role = data?.role ?? null;
    setUserRole(role);
    setRoleChecked(true);
    if (role === 'super_admin') fetchTeam();
    // Fetch notifications for this user and subscribe to new ones
    fetchNotifications(userId);
    const channel = supabase
      .channel('notifications-' + userId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const fetchTeam = async () => {
    const { data } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
    if (data) setTeamMembers(data);
  };

  const handleCreateStaff = async (e: any) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPassword) {
      setTeamError('Full name, email, and password are all required.');
      return;
    }
    if (newStaffPassword.length < 8) {
      setTeamError('Password must be at least 8 characters.');
      return;
    }
    if (!confirm(`Create a staff account for ${newStaffName} (${newStaffEmail})?\n\nThey will be able to log in immediately with the password you set.`)) return;

    setTeamLoading(true); setTeamError(''); setTeamSuccess('');
    const { data, error } = await supabase.functions.invoke('create-staff-user', {
      body: { email: newStaffEmail, full_name: newStaffName, password: newStaffPassword },
    });

    if (error || data?.error) {
      const msg = data?.error || error?.message || 'Unknown error';
      // Give a clear action if the edge function isn't deployed yet
      setTeamError(
        msg.includes('Failed to send') || msg.includes('Function not found')
          ? 'Edge Function not deployed. Run: npx supabase functions deploy create-staff-user'
          : msg
      );
    } else {
      setTeamSuccess(`✓ Account created for ${newStaffEmail}. Share their credentials so they can log in at /login.`);
      setNewStaffEmail(''); setNewStaffName(''); setNewStaffPassword('');
      fetchTeam();
    }
    setTeamLoading(false);
  };

  const handleRemoveStaff = async (userId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from staff? They will lose access to the dashboard instantly.`)) return;
    setTeamLoading(true); setTeamError(''); setTeamSuccess('');
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (error) {
      setTeamError('Failed to remove staff user: ' + error.message);
    } else {
      setTeamSuccess(`${memberEmail} has been removed from staff.`);
      setSelectedMember(null);
      fetchTeam();
    }
    setTeamLoading(false);
  };

  const openEditMember = (m: any) => {
    setSelectedMember(m);
    setEditName(m.full_name || '');
    setEditEmail(m.email || '');
    setEditRole(m.role || 'staff');
    setEditPassword('');
    setMemberMsg('');
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;
    setMemberLoading(true); setMemberMsg('');
    const body: any = { user_id: selectedMember.user_id };
    if (editName !== selectedMember.full_name) body.full_name = editName;
    if (editEmail !== selectedMember.email) body.email = editEmail;
    if (editRole !== selectedMember.role) body.role = editRole;
    if (editPassword.trim()) body.password = editPassword.trim();

    const { data, error } = await supabase.functions.invoke('update-staff-user', { body });
    if (error || data?.error) {
      setMemberMsg('Error: ' + (data?.error || error?.message));
    } else {
      setMemberMsg('Member updated successfully.');
      setEditPassword('');
      fetchTeam();
    }
    setMemberLoading(false);
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

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this consultation request? This action cannot be undone.")) return;
    setActionLoading(true);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    setActionLoading(false);
    if (error) {
      setActionMsg('Failed to delete booking: ' + error.message);
    } else {
      setSelectedBooking(null);
      fetchData();
    }
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
            {/* Bell with live badge */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifPanel(v => !v); if (!showNotifPanel) markAllRead(); }}
                className="w-9 h-9 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:text-accent hover:border-accent transition-colors relative">
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-12 w-80 bg-white border border-ink/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ink/5">
                      <p className="text-[10px] uppercase font-bold tracking-widest">Notifications</p>
                      {notifications.length > 0 && (
                        <button onClick={() => { setNotifications([]); supabase.from('notifications').delete().eq('user_id', session.user.id); }}
                          className="text-[10px] uppercase tracking-widest text-ink/40 hover:text-red-500 transition-colors">Clear all</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-6 h-6 mx-auto text-ink/20 mb-2" />
                          <p className="text-xs text-ink/40">No notifications yet</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 p-3 border-b border-ink/5 last:border-0 hover:bg-paper-dark/30 transition-colors ${!n.read ? 'bg-accent/5' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-accent' : 'bg-ink/20'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold">{n.title}</p>
                            <p className="text-xs text-ink/50 leading-relaxed mt-0.5">{n.body}</p>
                            <p className="text-[10px] text-ink/30 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                          </div>
                          <button onClick={() => clearNotification(n.id)} className="text-ink/20 hover:text-red-400 transition-colors flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                          <tr key={b.id} onClick={() => openBooking(b)} className="border-b border-ink/5 hover:bg-paper-dark/20 transition-colors cursor-pointer">
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
                               <select value={b.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); handleStatusChange(b.id, e.target.value); }}
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
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Password</label>
                    <input type="password" value={newStaffPassword} onChange={e=>setNewStaffPassword(e.target.value)} required minLength={8}
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="Min. 8 characters" />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <button type="submit" disabled={teamLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-accent text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink transition-colors disabled:opacity-50 w-fit">
                      {teamLoading ? 'Creating account…' : <><UserPlus className="w-4 h-4" /> Create Staff Account</>}
                    </button>
                    <p className="text-xs text-ink/40">You set the email and password. Share credentials with the staff member — they can log in at <strong>/login</strong> immediately.</p>
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
                      <th className="p-4 font-bold">Email Alerts</th>
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
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              const next = !m.email_notifications;
                              await supabase.from('user_roles').update({ email_notifications: next }).eq('user_id', m.user_id);
                              fetchTeam();
                            }}
                            title={m.role === 'super_admin' ? 'Super admin always receives alerts' : (m.email_notifications ? 'Disable email alerts' : 'Enable email alerts')}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              m.email_notifications || m.role === 'super_admin' ? 'bg-emerald-400' : 'bg-gray-200'
                            } ${m.role === 'super_admin' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            disabled={m.role === 'super_admin'}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              m.email_notifications || m.role === 'super_admin' ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                          <p className="text-[10px] text-ink/30 mt-1">
                            {m.role === 'super_admin' ? 'Always on' : (m.email_notifications ? 'On' : 'Off')}
                          </p>
                        </td>
                        <td className="p-4 text-xs text-ink/40">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {m.role !== 'super_admin' ? (
                              <>
                                <button onClick={() => openEditMember(m)}
                                  className="flex items-center gap-1.5 text-xs text-ink/50 hover:text-accent transition-colors font-medium">
                                  <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => handleRemoveStaff(m.user_id, m.email)}
                                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-ink/30">Owner</span>
                            )}
                          </div>
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

      {/* Slide-over / Modal for Booking Details */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-ink/20 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-ink/10 flex flex-col z-10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-ink/8">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Consultation Request</p>
                  <h3 className="text-2xl font-serif">{selectedBooking.client_name}</h3>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Action Msg */}
                <AnimatePresence>
                  {actionMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`p-3 text-xs font-bold uppercase tracking-widest ${actionMsg.startsWith('Error') || actionMsg.startsWith('Failed') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {actionMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Client Info */}
                <section>
                  <div className="flex justify-between items-end mb-3 border-b border-ink/5 pb-2">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40">Client Details</h4>
                    <button onClick={() => window.open(`/admin/print/${selectedBooking.id}`, '_blank')} 
                      className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1 hover:text-ink transition-colors">
                      <Printer className="w-3.5 h-3.5" /> View / Print Document
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="opacity-40 block text-xs">Email</span>{selectedBooking.client_email}</div>
                    <div><span className="opacity-40 block text-xs">Phone</span>{selectedBooking.client_phone}</div>
                    <div><span className="opacity-40 block text-xs">Service</span>{selectedBooking.service_name}</div>
                    <div><span className="opacity-40 block text-xs">Requested</span>{selectedBooking.booking_date} @ {selectedBooking.booking_time}</div>
                  </div>
                </section>

                {/* Intake Preview */}
                <section className="bg-paper-dark p-4 rounded-xl border border-ink/5 text-sm space-y-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40">Quick Intake Preview</h4>
                  <div><span className="opacity-40 block text-[10px] uppercase font-bold tracking-wider">Health Conditions</span><p className="mt-0.5">{selectedBooking.health_conditions || 'None'}</p></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="opacity-40 block text-[10px] uppercase font-bold tracking-wider">Previous PMU</span><p className="mt-0.5">{selectedBooking.previous_pmu || 'No / Not specified'}</p></div>
                    <div><span className="opacity-40 block text-[10px] uppercase font-bold tracking-wider">Skin Type</span><p className="mt-0.5">{selectedBooking.skin_type || 'Not specified'}</p></div>
                  </div>
                  {selectedBooking.notes && <div><span className="opacity-40 block text-[10px] uppercase font-bold tracking-wider">Client Notes</span><p className="italic mt-0.5">"{selectedBooking.notes}"</p></div>}
                  {(selectedBooking.current_area_photo_url || selectedBooking.reference_photo_url) && (
                    <div className="pt-2">
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Client Photos</p>
                      <div className="flex gap-3">
                        {selectedBooking.current_area_photo_url && (
                          <ModalPhoto url={selectedBooking.current_area_photo_url} label="Current Brows/Lips" />
                        )}
                        {selectedBooking.reference_photo_url && (
                          <ModalPhoto url={selectedBooking.reference_photo_url} label="Reference Goal" />
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* Confirm Date/Time */}
                <section className="bg-paper-dark p-4 border border-ink/5 rounded-xl space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40">Confirm Appointment</h4>
                  
                  <button onClick={handleApproveTime} disabled={actionLoading}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                    <Check className="w-4 h-4" /> Approve Requested Time
                  </button>

                  <div className="pt-3 border-t border-ink/5">
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Or set custom time</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" placeholder="Date (e.g. Nov 15, 2024)" value={confirmDate} onChange={e=>setConfirmDate(e.target.value)}
                        className="w-full p-2 border border-ink/10 text-xs focus:border-accent outline-none" />
                      <input type="text" placeholder="Time (e.g. 10:00 AM)" value={confirmTime} onChange={e=>setConfirmTime(e.target.value)}
                        className="w-full p-2 border border-ink/10 text-xs focus:border-accent outline-none" />
                    </div>
                    <button onClick={handleConfirmTime} disabled={actionLoading || !confirmDate || !confirmTime}
                      className="w-full py-2 bg-ink text-paper text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                      Save Confirmed Time
                    </button>
                  </div>
                </section>

                {/* Communication */}
                <section>
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-3 border-b border-ink/5 pb-2">Communication</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleSendEmail('confirmation')} disabled={actionLoading}
                      className="flex-1 py-2 border border-ink/10 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-accent transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Send Confirmation Email
                    </button>
                  </div>
                  {selectedBooking.email_confirmation_sent && (
                     <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-1"><Check className="w-3 h-3"/> Email sent</p>
                  )}
                </section>

                {/* Admin Notes */}
                <section>
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-3 border-b border-ink/5 pb-2">Admin Notes (Private)</h4>
                  <textarea rows={3} value={notesEdit} onChange={e=>setNotesEdit(e.target.value)} placeholder="Internal staff notes..."
                    className="w-full p-3 border border-ink/10 text-sm focus:border-accent outline-none resize-none mb-2" />
                  <button onClick={handleSaveNotes} disabled={actionLoading}
                    className="w-full py-2 border border-ink/10 text-xs font-bold uppercase tracking-widest hover:border-accent transition-colors">
                    Save Notes
                  </button>
                </section>

                {/* Actions */}
                <section className="pt-4 border-t border-ink/5 flex gap-2">
                  <button onClick={handleCancelRequest} disabled={actionLoading}
                    className="flex-1 py-2 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors">
                    Cancel Request
                  </button>
                  <button onClick={() => handleDeleteBooking(selectedBooking.id)} disabled={actionLoading}
                    className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </section>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Staff Member Panel ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)} className="absolute inset-0 bg-ink/20 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-ink/10 flex flex-col z-10 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-ink/8">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Edit Staff Member</p>
                  <h3 className="text-xl font-serif">{selectedMember.full_name || selectedMember.email}</h3>
                </div>
                <button onClick={() => setSelectedMember(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Feedback message */}
                <AnimatePresence>
                  {memberMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`p-3 text-xs font-bold uppercase tracking-widest ${memberMsg.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {memberMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info Section */}
                <section className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 border-b border-ink/5 pb-2">Profile Information</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Full Name</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Email Address</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="jane@example.com" />
                  </div>
                </section>

                {/* Access Level */}
                <section className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 border-b border-ink/5 pb-2">Access Level</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['staff', 'super_admin'].map(r => (
                      <button key={r} onClick={() => setEditRole(r)}
                        className={`py-3 px-4 border-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          editRole === r
                            ? r === 'super_admin' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-accent bg-accent/10 text-accent'
                            : 'border-ink/10 text-ink/40 hover:border-ink/30'
                        }`}>
                        {r === 'super_admin' ? '👑 Super Admin' : '👤 Staff'}
                      </button>
                    ))}
                  </div>
                  <div className={`p-3 rounded-lg text-xs leading-relaxed ${editRole === 'super_admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {editRole === 'super_admin'
                      ? '⚠️ Super Admin has full access — can manage team, all bookings, and invite/remove staff.'
                      : 'Staff can view and manage bookings but cannot add/remove team members or change roles.'}
                  </div>
                </section>

                {/* Password Reset */}
                <section className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-40 border-b border-ink/5 pb-2">Reset Password</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">New Password</label>
                    <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                      className="w-full p-3 border border-ink/10 focus:border-accent outline-none text-sm rounded-lg" placeholder="Leave blank to keep current" minLength={6} />
                    <p className="text-[10px] text-ink/40 pt-1">Min 6 characters. Leave blank if you don't want to change it.</p>
                  </div>
                </section>

                {/* Save */}
                <button onClick={handleUpdateMember} disabled={memberLoading}
                  className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {memberLoading ? 'Saving…' : <><Check className="w-4 h-4" /> Save Changes</>}
                </button>

                {/* Danger Zone */}
                <section className="pt-4 border-t border-red-100">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-red-400 mb-3">Danger Zone</h4>
                  <button onClick={() => { handleRemoveStaff(selectedMember.user_id, selectedMember.email); }}
                    className="w-full py-3 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Remove from Staff
                  </button>
                </section>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
