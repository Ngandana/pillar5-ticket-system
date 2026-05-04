import React, { useState, useEffect } from 'react';
import { 
  WifiOff, Printer, Bug, Key, Monitor, HelpCircle, 
  Clock, CheckCircle, AlertCircle, ArrowRight, LogOut, MessageSquare, ShieldAlert
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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

  // Check persistent login
  useEffect(() => {
    const savedUser = localStorage.getItem('pillar5_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setUser(parsedUser);
    }
  }, []);

  const handleLogin = async (email) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const userData = await response.json();
      localStorage.setItem('pillar5_user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pillar5_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">P5</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Pillar 5 Portal</h1>
            <p className="text-slate-500 mb-8">Select your role to continue.</p>
            
            <div className="space-y-3">
              <button onClick={() => handleLogin('luyanda@pillar5.com')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-between">
                <span>Log in as Employee</span> <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => handleLogin('admin@pillar5.com')} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-between">
                <span>Log in as Tech Admin</span> <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
        </div>
      </div>
    );
  }

  // --- ROUTER: DIRECT TO CORRECT DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${user.role === 'Admin' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                <span className="text-white font-bold text-xs">P5</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">
                {user.role === 'Admin' ? 'Tech Support Portal' : 'IT Support'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">
                {user.name} <span className="text-xs bg-slate-100 px-2 py-1 rounded-full ml-2">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {user.role === 'Admin' ? <AdminDashboard user={user} /> : <EmployeeDashboard user={user} />}
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD COMPONENT (PHASE 2)
// ==========================================
function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    fetchAdminTickets();
  }, []);

  const fetchAdminTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tickets`);
      const data = await res.json();
      setTickets(data);
    } catch (err) { console.error(err); }
  };

  const handleTicketSelect = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`${API_URL}/tickets/${ticket.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await fetch(`${API_URL}/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, priority: selectedTicket.priority, assigned_to: user.id })
      });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      fetchAdminTickets(); // Refresh master list
    } catch (err) { console.error(err); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: newComment, isInternal })
      });
      const commentData = await res.json();
      setComments([...comments, commentData]);
      setNewComment('');
      setIsInternal(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* LEFT COLUMN: Master Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[80vh]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Master Queue</h2>
            <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{tickets.length} Active</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleTicketSelect(t)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedTicket?.id === t.id ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white text-slate-800 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-mono ${selectedTicket?.id === t.id ? 'text-slate-300' : 'text-slate-500'}`}>{t.ticket_ref}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${t.status === 'Open' ? 'bg-orange-100 text-orange-700' : t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {t.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{t.category}</h3>
                <p className={`text-xs line-clamp-1 ${selectedTicket?.id === t.id ? 'text-slate-400' : 'text-slate-500'}`}>From: {t.requester_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Details & Action Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[80vh]">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a ticket from the queue to view details.</p>
            </div>
          ) : (
            <>
              {/* Ticket Header & Controls */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedTicket.category}</h2>
                    <p className="text-sm text-slate-600">Reported by <span className="font-semibold">{selectedTicket.requester_name}</span> on {new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                  </div>
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 focus:ring-slate-800 focus:border-slate-800"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Waiting on User">Status: Waiting on User</option>
                    <option value="Resolved">Status: Resolved</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700">
                  {selectedTicket.details}
                </div>
              </div>

              {/* Chat / Comments Section */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {comments.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">No activity on this ticket yet.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className={`p-4 rounded-xl max-w-[85%] ${c.is_internal ? 'bg-amber-50 border border-amber-200' : c.author_role === 'Admin' ? 'bg-slate-800 text-white ml-auto' : 'bg-white border border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold ${c.author_role === 'Admin' && !c.is_internal ? 'text-slate-300' : 'text-slate-800'}`}>
                          {c.author_name} {c.is_internal && <span className="ml-2 bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px] uppercase">Internal Note</span>}
                        </span>
                        <span className={`text-[10px] ${c.author_role === 'Admin' && !c.is_internal ? 'text-slate-400' : 'text-slate-400'}`}>
                          {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className={`text-sm ${c.author_role === 'Admin' && !c.is_internal ? 'text-slate-200' : 'text-slate-600'}`}>{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <textarea 
                    rows={2} 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type an update or internal note..." 
                    className="w-full rounded-xl border-slate-300 focus:border-slate-800 focus:ring-slate-800 text-sm p-3"
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                      Make this an Internal Note (hidden from user)
                    </label>
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                      Post Update
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EMPLOYEE DASHBOARD COMPONENT (PHASE 1)
// ==========================================
function EmployeeDashboard({ user }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => { fetchTickets(user.id); }, [user.id]);

  const fetchTickets = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${userId}`);
      const data = await res.json();
      setTickets(data);
    } catch (err) { console.error(err); }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, category: selectedCategory.title, details, priority: selectedCategory.priority })
      });
      const newTicket = await res.json();
      setTickets([newTicket, ...tickets]);
      setSelectedCategory(null);
      setDetails('');
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Submission form */}
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
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmitTicket}>
                <textarea rows={3} placeholder="Where are you located? Are there any error messages? (Optional)" className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border bg-slate-50 transition-colors" value={details} onChange={(e) => setDetails(e.target.value)} />
                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setSelectedCategory(null); setDetails(''); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm flex items-center gap-2">
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'} {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Right Col: Recent Tickets */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800">My Recent Tickets</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {tickets.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">No recent tickets.</div> : tickets.map((t) => (
                <div key={t.id} className="p-5 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-slate-400 font-mono">{t.ticket_ref}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100">{t.status}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">{t.category}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{t.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}