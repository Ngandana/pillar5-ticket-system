import React, { useState, useEffect } from 'react';
import { 
  WifiOff, Printer, Bug, Key, Monitor, HelpCircle, 
  Clock, CheckCircle, AlertCircle, ArrowRight, LogOut
} from 'lucide-react';

const COMMON_ISSUES = [
  { id: 'network', title: 'No Internet', icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50', priority: 'High' },
  { id: 'printer', title: 'Printer Issue', icon: Printer, color: 'text-blue-500', bg: 'bg-blue-50', priority: 'Medium' },
  { id: 'software', title: 'Software Error', icon: Bug, color: 'text-orange-500', bg: 'bg-orange-50', priority: 'Medium' },
  { id: 'access', title: 'Password Reset', icon: Key, color: 'text-emerald-500', bg: 'bg-emerald-50', priority: 'High' },
  { id: 'hardware', title: 'Hardware Broken', icon: Monitor, color: 'text-purple-500', bg: 'bg-purple-50', priority: 'High' },
  { id: 'other', title: 'Other Issue', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-50', priority: 'Low' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([
    { id: 'TKT-1042', category: 'Printer Issue', details: 'Paper jam on floor 2', status: 'In Progress', date: '2026-04-28' },
    { id: 'TKT-1039', category: 'Password Reset', details: 'Locked out of email', status: 'Resolved', date: '2026-04-25' },
  ]);

  useEffect(() => {
    const savedSession = localStorage.getItem('pillar5_session');
    if (savedSession) {
      setIsAuthenticated(true);
      setUser({ name: 'Alex Developer', role: 'Employee' });
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('pillar5_session', 'active');
    setIsAuthenticated(true);
    setUser({ name: 'Alex Developer', role: 'Employee' });
  };

  const handleLogout = () => {
    localStorage.removeItem('pillar5_session');
    setIsAuthenticated(false);
    setUser(null);
    setSelectedCategory(null);
    setDetails('');
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
        category: selectedCategory.title,
        details: details || 'No additional details provided.',
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
      };
      setTickets([newTicket, ...tickets]);
      setSelectedCategory(null);
      setDetails('');
      setIsSubmitting(false);
    }, 800);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">P5</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Pillar 5 Support</h1>
            <p className="text-slate-500 mb-8">Sign in to report issues and track requests.</p>
            <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
              Sign In with Company SSO <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">P5</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">IT Support</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">What do you need help with?</h2>
              <p className="text-slate-500 text-sm mb-6">Select a category below to log an issue instantly.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {COMMON_ISSUES.map((issue) => {
                  const isSelected = selectedCategory?.id === issue.id;
                  const Icon = issue.icon;
                  return (
                    <button key={issue.id} onClick={() => setSelectedCategory(issue)} className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200 border-2 text-center group ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 ${issue.bg}`}>
                        <Icon className={`w-6 h-6 ${issue.color}`} />
                      </div>
                      <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{issue.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCategory && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <selectedCategory.icon className={`w-5 h-5 ${selectedCategory.color}`} />
                    Additional Details for: {selectedCategory.title}
                  </h3>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">Priority: {selectedCategory.priority}</span>
                </div>
                <form onSubmit={handleSubmitTicket}>
                  <textarea rows={3} placeholder="Where are you located? Are there any error messages? (Optional)" className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border bg-slate-50 transition-colors placeholder:text-slate-400" value={details} onChange={(e) => setDetails(e.target.value)} />
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => { setSelectedCategory(null); setDetails(''); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSubmitting ? 'Submitting...' : 'Submit Ticket'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800">My Recent Tickets</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No recent tickets found.</div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-slate-400 font-mono">{ticket.id}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(ticket.status)}`}>{getStatusIcon(ticket.status)} {ticket.status}</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm mb-1">{ticket.category}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{ticket.details}</p>
                      <div className="text-[11px] text-slate-400 font-medium">Submitted: {ticket.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}