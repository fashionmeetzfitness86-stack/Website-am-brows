import { useState } from 'react';
import { Calendar, Users, DollarSign, Clock, Settings, Bell, ChevronRight, Search } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');

  const stats = [
    { label: 'Total Revenue', value: '$12,450', trend: '+14%', icon: <DollarSign className="w-5 h-5 text-accent" /> },
    { label: 'Upcoming Appts', value: '24', trend: '+2', icon: <Calendar className="w-5 h-5 text-accent" /> },
    { label: 'New Clients', value: '18', trend: '+5%', icon: <Users className="w-5 h-5 text-accent" /> },
    { label: 'Pending Deposits', value: '$850', trend: '-2%', icon: <Clock className="w-5 h-5 text-accent" /> },
  ];

  const appointments = [
    { id: 1, client: 'Sarah Jenkins', service: 'Signature Brows', date: 'Oct 24, 2024', time: '10:00 AM', status: 'Confirmed', deposit: 'Paid' },
    { id: 2, client: 'Elena Rodriguez', service: 'Lip Blush', date: 'Oct 24, 2024', time: '1:30 PM', status: 'Pending Deposit', deposit: 'Unpaid' },
    { id: 3, client: 'Michelle Wong', service: 'Defining Liner', date: 'Oct 25, 2024', time: '9:00 AM', status: 'Confirmed', deposit: 'Paid' },
    { id: 4, client: 'Amanda Clark', service: 'Signature Brows', date: 'Oct 26, 2024', time: '11:00 AM', status: 'Waitlist', deposit: 'N/A' },
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
          {['appointments', 'clients', 'finances', 'settings'].map(tab => (
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
          <button className="flex items-center gap-3 text-sm text-ink/60 hover:text-ink transition-colors w-full p-2">
            <div className="w-8 h-8 rounded-full bg-accent text-paper flex items-center justify-center font-bold">A</div>
            <span>Ashley Miller</span>
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
            <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink/60 hover:text-accent hover:border-accent transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-serif mb-2">Studio Overview</h2>
            <p className="text-ink/60 text-sm">Welcome back, Ashley. Here is what is happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            {stats.map(s => (
              <div key={s.label} className="p-6 bg-white border border-ink/5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent/5 rounded-lg">{s.icon}</div>
                  <span className={`text-xs font-bold ${s.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{s.trend}</span>
                </div>
                <h3 className="text-3xl font-serif mb-1">{s.value}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white border border-ink/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-ink/5 flex justify-between items-center">
              <h3 className="text-lg font-serif">Upcoming Appointments</h3>
              <button className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-ink transition-colors">View Calendar</button>
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
                  {appointments.map(appt => (
                    <tr key={appt.id} className="border-b border-ink/5 hover:bg-paper-dark/30 transition-colors">
                      <td className="p-4 font-medium">{appt.client}</td>
                      <td className="p-4 text-ink/70">{appt.service}</td>
                      <td className="p-4 text-ink/70">{appt.date} <span className="text-ink/40 ml-2">{appt.time}</span></td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'Pending Deposit' ? 'bg-amber-100 text-amber-700' : 'bg-warm-gray text-ink/50'}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-2 ${appt.deposit === 'Paid' ? 'text-green-600' : 'text-ink/40'}`}>
                          {appt.deposit === 'Paid' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                          {appt.deposit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
