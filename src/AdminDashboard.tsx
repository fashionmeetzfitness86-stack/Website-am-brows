import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, Settings, Bell, ChevronRight, Search, Lock, Mail } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: bookingsData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (bookingsData) setBookings(bookingsData);

    const { data: contactsData } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (contactsData) setContacts(contactsData);
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

  if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-2xl">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-paper-dark p-8 border border-ink/10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-paper" />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-center mb-8">Admin Access</h2>
          {authError && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-4 bg-paper border border-ink/10 focus:border-accent outline-none text-sm transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-4 bg-paper border border-ink/10 focus:border-accent outline-none text-sm transition-colors" />
            </div>
            <button type="submit" className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors">
              Sign In
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-6 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            Return to Public Site
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.filter(b => b.deposit_status === 'Paid').reduce((acc, curr) => {
     // Assuming price comes as something like "$650"
     const num = parseInt(curr.service_price.replace(/\D/g, ''), 10) || 0;
     return acc + num;
  }, 0);

  const stats = [
    { label: 'Projected Value', value: `$${totalRevenue}`, trend: 'Based on bookings', icon: <DollarSign className="w-5 h-5 text-accent" /> },
    { label: 'Total Appts', value: bookings.length.toString(), trend: 'All time', icon: <Calendar className="w-5 h-5 text-accent" /> },
    { label: 'New Leads', value: contacts.length.toString(), trend: 'Contact forms', icon: <Users className="w-5 h-5 text-accent" /> },
    { label: 'Pending Deposits', value: bookings.filter(b => b.deposit_status === 'Unpaid').length.toString(), trend: 'Awaiting payment', icon: <Clock className="w-5 h-5 text-accent" /> },
  ];

  return (
    <div className="min-h-screen bg-paper flex font-sans text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-paper-dark border-r border-ink/10 flex flex-col">
        <div className="p-6 border-b border-ink/10">
          <h1 className="text-xl font-serif">Ashley M.</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1">Admin Studio</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['appointments', 'leads', 'finances', 'settings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-accent/10 text-accent' : 'text-ink/60 hover:bg-ink/5'}`}
            >
              <span className="capitalize">{tab}</span>
              {activeTab === tab && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-ink/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-ink/60 hover:text-ink transition-colors w-full p-2">
            <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-bold">A</div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 border-b border-ink/10 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 relative w-96">
            <Search className="w-4 h-4 absolute left-3 text-ink/40" />
            <input 
              type="text" 
              placeholder="Search clients, bookings..." 
              className="w-full pl-10 pr-4 py-2 bg-paper-dark border border-ink/10 focus:border-accent outline-none text-sm rounded-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink/60 hover:text-accent hover:border-accent transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-serif mb-2">Studio Overview</h2>
            <p className="text-ink/60 text-sm">Welcome back, Ashley. Here is your live schedule.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            {stats.map(s => (
              <div key={s.label} className="p-6 bg-white border border-ink/5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent/5 rounded-lg">{s.icon}</div>
                  <span className={`text-[9px] uppercase font-bold text-ink/40`}>{s.trend}</span>
                </div>
                <h3 className="text-3xl font-serif mb-1">{s.value}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Appointments Table */}
          {activeTab === 'appointments' && (
            <div className="bg-white border border-ink/5 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-ink/5 flex justify-between items-center">
                <h3 className="text-lg font-serif">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-dark/50 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Client</th>
                      <th className="p-4 font-bold">Service</th>
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Deposit</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-ink/40">No bookings yet.</td></tr>
                    ) : bookings.map(appt => (
                      <tr key={appt.id} className="border-b border-ink/5 hover:bg-paper-dark/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{appt.client_name}</div>
                          <div className="text-xs text-ink/50 mt-1">{appt.client_email}</div>
                          <div className="text-xs text-ink/50">{appt.client_phone}</div>
                        </td>
                        <td className="p-4 text-ink/70">
                          <div>{appt.service_name}</div>
                          <div className="text-xs mt-1 text-accent font-medium">{appt.service_price}</div>
                        </td>
                        <td className="p-4 text-ink/70">
                          <div className="font-medium">{appt.booking_date || 'N/A'}</div>
                          <div className="text-xs mt-1 text-ink/50">{appt.booking_time}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'Pending Deposit' ? 'bg-amber-100 text-amber-700' : 'bg-warm-gray text-ink/50'}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-2 ${appt.deposit_status === 'Paid' ? 'text-green-600' : 'text-ink/40'}`}>
                            {appt.deposit_status === 'Paid' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                            {appt.deposit_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="bg-white border border-ink/5 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-ink/5 flex justify-between items-center">
                <h3 className="text-lg font-serif">Contact Form Leads</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-paper-dark/50 text-[10px] uppercase tracking-widest text-ink/40">
                      <th className="p-4 font-bold">Lead</th>
                      <th className="p-4 font-bold">Interest</th>
                      <th className="p-4 font-bold">Message</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {contacts.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-ink/40">No leads yet.</td></tr>
                    ) : contacts.map(c => (
                      <tr key={c.id} className="border-b border-ink/5 hover:bg-paper-dark/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-ink/50 mt-1">{c.email}</div>
                        </td>
                        <td className="p-4 text-ink/70 max-w-[200px] truncate">{c.interested_services}</td>
                        <td className="p-4 text-ink/70 max-w-sm"><p className="line-clamp-2">{c.message}</p></td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                            {c.status}
                          </span>
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
