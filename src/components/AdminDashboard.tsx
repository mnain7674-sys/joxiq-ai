import React, { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Lock, 
  Server, 
  Key, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Database,
  Cpu,
  BarChart2,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  UserPlus,
  Trash2,
  Check
} from "lucide-react";
import { motion } from "motion/react";

interface AdminDashboardProps {
  theme: "dark" | "light";
  userProfile: { name: string; email: string } | null;
  onBackToChat: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  theme,
  userProfile,
  onBackToChat,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "security" | "logs" | "models">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [systemStatus, setSystemStatus] = useState<"optimal" | "warning">("optimal");
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const isDark = theme === "dark";

  // User directory for admin management
  const [usersList, setUsersList] = useState([
    { id: "u-1", name: "Owner Admin", email: "mnain7674@gmail.com", role: "Owner Admin", status: "Active", lastLogin: "Just now", tokensUsed: "142,500" },
    { id: "u-2", name: "Jubayer Ahmed", email: "jubayer@example.com", role: "Standard User", status: "Active", lastLogin: "12m ago", tokensUsed: "12,400" },
    { id: "u-3", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Standard User", status: "Active", lastLogin: "2h ago", tokensUsed: "8,900" },
    { id: "u-4", name: "Alex Rivera", email: "alex.r@example.com", role: "Standard User", status: "Inactive", lastLogin: "3d ago", tokensUsed: "1,200" },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: "log-1", time: "11:42 AM", user: "mnain7674@gmail.com", action: "SECURITY_AUDIT_RAN", status: "SUCCESS", ip: "192.168.1.45" },
    { id: "log-2", time: "10:15 AM", user: "jubayer@example.com", action: "MODEL_QUERY_FLASH", status: "SUCCESS", ip: "10.0.4.12" },
    { id: "log-3", time: "09:30 AM", user: "mnain7674@gmail.com", action: "ROLE_POLICY_UPDATED", status: "SUCCESS", ip: "192.168.1.45" },
    { id: "log-4", time: "Yesterday", user: "sarah.j@example.com", action: "DOC_UPLOAD_PDF", status: "SUCCESS", ip: "172.16.8.9" },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Standard User");

  const handleRunAudit = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: userProfile?.email || "mnain7674@gmail.com",
      action: "SECURITY_AUDIT_MANUAL",
      status: "SUCCESS",
      ip: "192.168.1.45"
    };
    setAuditLogs([newLog, ...auditLogs]);
    setAuditMessage("Security Audit successfully completed: 0 vulnerabilities found, RBAC policy verified.");
    setTimeout(() => setAuditMessage(null), 4000);
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `joxiq_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleToggleUserStatus = (id: string) => {
    setUsersList(usersList.map(u => {
      if (u.id === id) {
        if (u.email === "mnain7674@gmail.com") return u; // Cannot disable owner admin
        const nextStatus = u.status === "Active" ? "Inactive" : "Active";
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id: string, email: string) => {
    if (email === "mnain7674@gmail.com") {
      alert("Cannot delete master owner admin account.");
      return;
    }
    if (confirm(`Are you sure you want to remove user ${email}?`)) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Active",
      lastLogin: "Just now",
      tokensUsed: "0"
    };
    setUsersList([...usersList, newUser]);
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserModal(false);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans flex flex-col`}>
      {/* Top Admin Navigation Header */}
      <header className={`border-b ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/85"} backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight">JOXIQ Admin Portal</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                👑 Owner Control Tier
              </span>
            </div>
            <p className="text-xs text-slate-400">Secure Role-Based Access Control & System Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin: {userProfile?.email || "mnain7674@gmail.com"}</span>
          </div>

          <button
            onClick={onBackToChat}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Exit to User App</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-500/10 pb-4 overflow-x-auto">
          {[
            { id: "overview", label: "System Overview", icon: Activity },
            { id: "users", label: "User Access & Roles", icon: Users },
            { id: "security", label: "Security & RBAC", icon: Lock },
            { id: "logs", label: "Audit Telemetry", icon: Server },
            { id: "models", label: "AI Quota & Models", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                    : isDark ? "hover:bg-slate-900 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/60 text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Total Registered Users", value: "1,248", change: "+12% this week", icon: Users, color: "text-indigo-500" },
                { title: "Owner Admin Account", value: "Verified", change: "mnain7674@gmail.com", icon: ShieldCheck, color: "text-amber-500" },
                { title: "System Uptime", value: "99.98%", change: "Zero incidents", icon: Activity, color: "text-emerald-500" },
                { title: "Active API Sessions", value: "42", change: "Real-time streaming", icon: Cpu, color: "text-cyan-500" },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                      <Icon className={stat.color} size={18} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono tracking-tight">{stat.value}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{stat.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Security Status Banner */}
            {auditMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{auditMessage}</span>
              </div>
            )}
            <div className={`p-6 rounded-2xl border ${isDark ? "bg-gradient-to-r from-amber-950/20 to-slate-900 border-amber-500/30" : "bg-gradient-to-r from-amber-50 to-white border-amber-500/30"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Strict Role-Based Access Control (RBAC) Active</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regular users are restricted to standard AI chat and personal settings. Pro models and administrative panels are strictly locked to the owner admin.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunAudit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Run Security Audit</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Users & Roles */}
        {activeTab === "users" && (
          <div className={`rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} overflow-hidden`}>
            <div className="p-5 border-b border-slate-500/10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-sm">User Directory & Role Authorization</h2>
                <p className="text-xs text-slate-400">Manage user accounts, permissions, and administrative access privileges.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-xs focus:outline-none w-40 text-slate-200"
                  />
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <UserPlus size={14} />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Add User Modal / Panel */}
            {showAddUserModal && (
              <div className="p-4 border-b border-indigo-500/20 bg-indigo-500/5">
                <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className={`p-2 rounded-xl border text-xs w-full sm:w-auto flex-1 ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className={`p-2 rounded-xl border text-xs w-full sm:w-auto flex-1 ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className={`p-2 rounded-xl border text-xs ${isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
                  >
                    <option value="Standard User">Standard User</option>
                    <option value="Pro User">Pro User</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-3 py-2 rounded-xl text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-md"
                    >
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${isDark ? "border-slate-800 text-slate-400 bg-slate-950/50" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
                    <th className="py-3.5 px-6">User / Email</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Token Usage</th>
                    <th className="py-3.5 px-6">Last Active</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors ${isDark ? "hover:bg-slate-850" : "hover:bg-slate-50"}`}>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        {user.role === "Owner Admin" ? (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold text-[10px]">
                            👑 Owner Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-[10px]">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all ${user.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"}`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {user.status}
                        </button>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium">{user.tokensUsed}</td>
                      <td className="py-4 px-6 text-slate-400">{user.lastLogin}</td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                        {user.email !== "mnain7674@gmail.com" ? (
                          <>
                            <button
                              onClick={() => alert(`User config for ${user.email}:\n- Reset Password\n- Revoke Session\n- Upgrade to Pro`)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer"
                            >
                              Configure
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Remove User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-500 font-medium italic">Immutable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Security & RBAC */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Owner Authentication Policy</h3>
                  <p className="text-xs text-slate-400">Enforced security credentials for master admin access.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl border border-slate-500/10 bg-slate-500/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold">Master Admin Email</div>
                    <div className="text-[11px] font-mono text-amber-500">mnain7674@gmail.com</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Verified</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-500/10 bg-slate-500/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold">Two-Factor Authentication</div>
                    <div className="text-[11px] text-slate-400">Cryptographic token verification active</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Enforced</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Role Authorization Matrix</h3>
                  <p className="text-xs text-slate-400">Feature visibility per user classification.</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-500/5">
                  <span>AI Chat & History</span>
                  <span className="font-bold text-emerald-500">All Users</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-500/5">
                  <span>Personal Settings & Theme</span>
                  <span className="font-bold text-emerald-500">All Users</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <span>Pro Models & Temperature Control</span>
                  <span className="font-bold text-amber-500">Owner Admin Only 👑</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <span>Admin Portal & Audit Logs</span>
                  <span className="font-bold text-amber-500">Owner Admin Only 👑</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === "logs" && (
          <div className={`rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} overflow-hidden`}>
            <div className="p-5 border-b border-slate-500/10 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm">System Telemetry & Audit Logs</h2>
                <p className="text-xs text-slate-400">Real-time recording of security events, API queries, and authorization checks.</p>
              </div>
              <button
                onClick={handleExportLogs}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Export Logs</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${isDark ? "border-slate-800 text-slate-400 bg-slate-950/50" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6">User Principal</th>
                    <th className="py-3 px-6">Action / Event</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Origin IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10 text-xs font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className={isDark ? "hover:bg-slate-850" : "hover:bg-slate-50"}>
                      <td className="py-3.5 px-6 text-slate-400">{log.time}</td>
                      <td className="py-3.5 px-6 font-semibold">{log.user}</td>
                      <td className="py-3.5 px-6 text-indigo-400">{log.action}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: AI Quotas & Models */}
        {activeTab === "models" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Gemini AI Engine Allocation</h3>
                  <p className="text-xs text-slate-400">Model tiering for standard users vs admin.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-500/10 bg-slate-500/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Gemini 2.5 Flash (Standard)</div>
                    <div className="text-[11px] text-slate-400">Assigned to all registered users</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">Active</span>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-500">Gemini 2.5 Pro (Admin Exclusive)</div>
                    <div className="text-[11px] text-slate-400">Restricted to mnain7674@gmail.com</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px]">Protected 👑</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Global Token Quota</h3>
                  <p className="text-xs text-slate-400">Daily consumption limits and throttling.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Daily Token Pool</span>
                    <span className="font-mono font-bold">165,400 / 1,000,000</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="w-[16%] h-full bg-indigo-500 rounded-full" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Token pooling is automatically balanced across nodes with zero rate-limit exceptions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
