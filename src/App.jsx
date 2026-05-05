import React, { useState, useEffect } from 'react';
import { 
  WifiOff, Printer, Bug, Key, Monitor, HelpCircle, 
  Clock, CheckCircle, AlertCircle, ArrowRight, LogOut, MessageSquare, ShieldAlert, Activity
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
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      if (response.ok) {
        // 1. Correctly define the variable as 'data'
        const data = await response.json(); 
        
        // 2. Now data.token works perfectly
        localStorage.setItem('pillar5_token', data.token); 
        setIsAuthenticated(true);
        
        // 3. Drill down into data.user so the dashboard gets the right info
        setUser(data.user); 
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || "Login failed");
      }
    } catch (error) {
      // Log the actual error to the console so it's easier to debug in the future
      console.error("Frontend Crash:", error); 
      setLoginError("Application error. Please check the browser console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pillar5_token'); // Destroy token
    setIsAuthenticated(false);
    setUser(null);
    setLoginEmail('');
    setLoginPassword('');
  };

  // --- LOGIN SCREEN WITH FORM ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white font-bold text-2xl">P5</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Pillar 5 Portal</h1>
              <p className="text-slate-500 text-sm">Sign in to access the system</p>
            </div>
            
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{loginError}</div>}
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-slate-50" 
                  placeholder="name@pillar5.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-slate-50" 
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            <div className="mt-6 text-xs text-center text-slate-400 border-t pt-4">
              <p>Test Accounts:</p>
              <p>luyanda@pillar5.com / password123</p>
              <p>admin@pillar5.com / password123</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm flex-none">
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
// ADMIN DASHBOARD COMPONENT
// ==========================================
function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [techs, setTechs] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' or 'logs'

  useEffect(() => {
    fetchAdminTickets();
    fetchTechs();
  }, []);

  const fetchAdminTickets = async () => {
    try {
      // UPDATED: Now uses the secure JWT token instead of x-user-id
      const res = await fetch(`${API_URL}/admin/tickets`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pillar5_token')}` } 
      });
      setTickets(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchTechs = async () => {
    try {
      // UPDATED: Now uses the secure JWT token instead of x-user-id
      const res = await fetch(`${API_URL}/admin/techs`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pillar5_token')}` } 
      });
      setTechs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleTicketSelect = async (ticket) => {
    setSelectedTicket(ticket);
    setActiveTab('comments');
    try {
      // Fetch Comments
      const resComments = await fetch(`${API_URL}/tickets/${ticket.id}/comments`);
      setComments(await resComments.json());
      // Fetch Logs
      const resLogs = await fetch(`${API_URL}/tickets/${ticket.id}/logs`);
      setLogs(await resLogs.json());
    } catch (err) { console.error(err); }
  };

  const handleTicketUpdate = async (field, value, actionMessage) => {
    const updatedTicket = { ...selectedTicket, [field]: value };
    try {
      // UPDATED: Now uses the secure JWT token and includes Content-Type
      await fetch(`${API_URL}/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('pillar5_token')}` 
        },
        body: JSON.stringify({ 
          status: updatedTicket.status, 
          priority: updatedTicket.priority, 
          assigned_to: updatedTicket.assigned_to,
          user_name: user.name,
          action_description: actionMessage
        })
      });
      setSelectedTicket(updatedTicket);
      fetchAdminTickets(); // Refresh Master Queue
      // Refresh Logs
      const resLogs = await fetch(`${API_URL}/tickets/${selectedTicket.id}/logs`);
      setLogs(await resLogs.json());
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Master Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Triage Queue</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {tickets.map(t => (
              <div 
                key={t.id} onClick={() => handleTicketSelect(t)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedTicket?.id === t.id ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white text-slate-800 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono opacity-70">{t.ticket_ref}</span>
                  <div className="flex gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${t.priority === 'High' || t.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'}`}>{t.priority}</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-1">{t.category}</h3>
                <p className="text-xs opacity-70 line-clamp-1">From: {t.requester_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Action Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a ticket to begin triage.</p>
            </div>
          ) : (
            <>
              {/* Ticket Controls Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedTicket.category}</h2>
                    <p className="text-sm text-slate-600">Reported by <span className="font-semibold">{selectedTicket.requester_name}</span></p>
                  </div>
                  
                  {/* Dropdown Controls */}
                  <div className="flex gap-2">
                    <select 
                      value={selectedTicket.priority} 
                      onChange={(e) => handleTicketUpdate('priority', e.target.value, `Escalated priority to ${e.target.value}`)}
                      className="border-slate-300 rounded-lg text-xs font-medium focus:ring-slate-800"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">CRITICAL</option>
                    </select>

                    <select 
                      value={selectedTicket.assigned_to || ""} 
                      onChange={(e) => handleTicketUpdate('assigned_to', e.target.value, `Assigned ticket to a technician`)}
                      className="border-slate-300 rounded-lg text-xs font-medium focus:ring-slate-800"
                    >
                      <option value="">Unassigned</option>
                      {techs.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                    </select>

                    <select 
                      value={selectedTicket.status} 
                      onChange={(e) => handleTicketUpdate('status', e.target.value, `Changed status to ${e.target.value}`)}
                      className="border-slate-300 rounded-lg text-xs font-bold bg-slate-800 text-white focus:ring-slate-800"
                    >
                      <option value="Open">Status: Open</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Waiting on User">Status: Waiting on User</option>
                      <option value="Resolved">Status: Resolved</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 shadow-sm">
                  {selectedTicket.details}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-white">
                <button onClick={() => setActiveTab('comments')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Communication</button>
                <button onClick={() => setActiveTab('logs')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'logs' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
                  <Activity className="w-4 h-4" /> Audit Logs
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {activeTab === 'comments' ? (
                  <div className="space-y-4">
                    {comments.length === 0 ? <p className="text-center text-slate-400 text-sm mt-10">No comments yet.</p> : 
                      comments.map(c => (
                        <div key={c.id} className={`p-4 rounded-xl max-w-[85%] ${c.is_internal ? 'bg-amber-50 border border-amber-200' : c.author_role === 'Admin' ? 'bg-slate-800 text-white ml-auto' : 'bg-white border border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold">{c.author_name} {c.is_internal && <span className="ml-2 bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px]">INTERNAL NOTE</span>}</span>
                            <span className="text-[10px] opacity-60">{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm opacity-90">{c.content}</p>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.length === 0 ? <p className="text-center text-slate-400 text-sm mt-10">No activity recorded.</p> : 
                      logs.map(log => (
                        <div key={log.id} className="flex gap-4 items-start text-sm">
                          <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-none"></div>
                          <div>
                            <p className="text-slate-800"><span className="font-semibold">{log.user_name}</span> {log.action}</p>
                            <p className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Comment Input Box */}
              {activeTab === 'comments' && (
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <textarea 
                      rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type an update or internal note..." 
                      className="w-full rounded-xl border-slate-300 focus:border-slate-800 text-sm p-3 bg-slate-50"
                    />
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                        Internal Note (Hidden from employee)
                      </label>
                      <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium">Post Update</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EMPLOYEE DASHBOARD COMPONENT
// ==========================================
function EmployeeDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null); // Determines if we are chatting or submitting
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chat state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets/${user.id}`);
      setTickets(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleTicketSelect = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`${API_URL}/tickets/${ticket.id}/comments`);
      const data = await res.json();
      // Employees ONLY see public comments!
      setComments(data.filter(c => !c.is_internal));
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
      fetchTickets(); // Refresh list
      setSelectedCategory(null);
      setDetails('');
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: newComment, isInternal: false })
      });
      const commentData = await res.json();
      setComments([...comments, commentData]);
      setNewComment('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Main Interaction Area */}
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-8rem)]">
          {!selectedTicket ? (
            // SUBMIT NEW TICKET VIEW
            <div className="space-y-6 overflow-y-auto pr-2">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Need Help?</h2>
                <p className="text-slate-500 text-sm mb-6">Select a category to log an issue instantly.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {COMMON_ISSUES.map((issue) => {
                    const isSelected = selectedCategory?.id === issue.id;
                    const Icon = issue.icon;
                    return (
                      <button key={issue.id} onClick={() => setSelectedCategory(issue)} className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all border-2 group ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${issue.bg}`}>
                          <Icon className={`w-6 h-6 ${issue.color}`} />
                        </div>
                        <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{issue.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedCategory && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
                  <form onSubmit={handleSubmitTicket}>
                    <textarea rows={3} placeholder="Provide details (Room number, error messages, etc)..." className="w-full rounded-xl border-slate-200 focus:border-blue-500 text-sm p-3 border bg-slate-50" value={details} onChange={(e) => setDetails(e.target.value)} />
                    <div className="mt-4 flex justify-end gap-3">
                      <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm flex items-center gap-2">
                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            // EMPLOYEE TICKET CHAT VIEW
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{selectedTicket.category}</h2>
                  <span className="text-xs text-slate-500 font-mono">{selectedTicket.ticket_ref} • Status: {selectedTicket.status}</span>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                  + New Ticket
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 mb-6">
                  <strong>Original Report:</strong> {selectedTicket.details}
                </div>

                {comments.length === 0 ? <p className="text-center text-slate-400 text-sm mt-10">Waiting for a response from IT...</p> : 
                  comments.map(c => (
                    <div key={c.id} className={`p-4 rounded-xl max-w-[85%] ${c.author_role === 'Employee' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold opacity-90">{c.author_name}</span>
                        <span className="text-[10px] opacity-60">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm opacity-90">{c.content}</p>
                    </div>
                  ))
                }
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Reply to IT support..." className="flex-1 rounded-xl border-slate-300 focus:border-blue-500 text-sm bg-slate-50" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium">Send</button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* RIGHT COLUMN: Recent Tickets Navigation */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">My Requests</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {tickets.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">No recent tickets.</div> : tickets.map((t) => (
              <div 
                key={t.id} 
                onClick={() => handleTicketSelect(t)}
                className={`p-4 rounded-xl cursor-pointer border transition-colors ${selectedTicket?.id === t.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent border-b-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-slate-400 font-mono">{t.ticket_ref}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{t.status}</span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">{t.category}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}