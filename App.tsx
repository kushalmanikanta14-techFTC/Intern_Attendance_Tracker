import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Users, 
  UserPlus, 
  BarChart3, 
  ChevronLeft, 
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trash2
} from 'lucide-react';
import { storageService, Intern, AttendanceRecord } from './services/storageService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { cn } from './lib/utils';

// --- Components ---

const Card = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string, key?: string | number }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow",
      className
    )}
  >
    {children}
  </motion.div>
);

const Button = ({ children, onClick, variant = 'primary', className, disabled }: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string,
  disabled?: boolean
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full py-4 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium text-slate-600 ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
    />
  </div>
);

// --- Screens ---

const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 mb-6">
            <ClipboardCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">InternTrack</h1>
          <p className="text-slate-500">Attendance Management System</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">
          <Input 
            label="Admin/Intern Name" 
            placeholder="Enter your name" 
            value={name} 
            onChange={setName} 
          />
          <Button onClick={() => name && onLogin(name)}>
            Get Started
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onNavigate, onLogout }: any) => {
  const menuItems = [
    { id: 'track', title: 'Attendance Track', icon: ClipboardCheck, color: 'bg-emerald-500' },
    { id: 'details', title: 'Intern Details', icon: Users, color: 'bg-blue-500' },
    { id: 'add', title: 'Add Intern', icon: UserPlus, color: 'bg-amber-500' },
    { id: 'report', title: 'Attendance Report', icon: BarChart3, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-slate-500 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold text-slate-900">{user}</h2>
        </div>
        <button onClick={onLogout} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} onClick={() => onNavigate(item.id)} className="flex flex-col items-center text-center space-y-4 py-8">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
              <item.icon size={28} />
            </div>
            <span className="font-semibold text-slate-700 leading-tight">{item.title}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AttendanceTrack = ({ onBack }: { onBack: () => void }) => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'P' | 'A' | 'H'>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const internsData = await storageService.getInterns();
      setInterns(internsData);
      
      const attendanceData = await storageService.getAttendance();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const todayAttendance: Record<string, 'P' | 'A' | 'H'> = {};
      attendanceData.forEach(record => {
        if (record.date === today) {
          todayAttendance[record.internId] = record.status;
        }
      });
      setAttendance(todayAttendance);
    };
    loadData();
  }, []);

  const handleStatusChange = (id: string, status: 'P' | 'A' | 'H') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    setLoading(true);
    const date = format(new Date(), 'yyyy-MM-dd');
    const records: AttendanceRecord[] = Object.entries(attendance).map(([internId, status]) => {
      const intern = interns.find(i => i.id === internId);
      const internName = intern?.name || 'Unknown';
      return {
        internId,
        internName,
        name: internName,
        date,
        status: status as 'P' | 'A' | 'H'
      };
    });

    await storageService.saveAttendance(records);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Attendance Track</h2>
      </header>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3 text-indigo-700 mb-4">
          <Calendar size={20} />
          <span className="font-medium">{format(new Date(), 'MMMM do, yyyy')}</span>
        </div>

        {interns.map((intern, index) => (
          <div key={intern.id || `intern-${index}`} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <span className="font-bold text-slate-800 text-lg">{intern.name || 'Unknown Intern'}</span>
            <div className="flex gap-2">
              {['P', 'A', 'H'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(intern.id, status as any)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all border-2",
                    attendance[intern.id] === status 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  )}
                >
                  {status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Half Day'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <Button 
          onClick={handleSave} 
          disabled={loading || Object.keys(attendance).length === 0}
        >
          {loading ? 'Syncing with Sheets...' : 'Save Attendance'}
        </Button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 />
            <span className="font-medium">Attendance synced successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  loading?: boolean
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Delete'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const InternDetails = ({ onBack }: { onBack: () => void }) => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchInterns = async () => {
    setLoading(true);
    const data = await storageService.getInterns();
    setInterns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleDelete = async () => {
    if (!selectedIntern) return;
    setDeleting(true);
    await storageService.deleteIntern(selectedIntern.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    setSelectedIntern(null);
    fetchInterns();
  };

  if (selectedIntern) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ConfirmModal 
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Delete Intern"
          message={`Are you sure you want to delete ${selectedIntern.name}? This action cannot be undone.`}
        />
        <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedIntern(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">Intern Profile</h2>
          </div>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl shadow-xl shadow-indigo-100">
              {selectedIntern.name?.charAt(0) || '?'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{selectedIntern.name || 'Unknown Intern'}</h3>
              <p className="text-indigo-600 font-medium">{selectedIntern.college || 'N/A'} • {selectedIntern.branch || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone Number</p>
                    <p className="text-slate-700 font-medium">{selectedIntern.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="text-slate-700 font-medium">{selectedIntern.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Home Address</p>
                    <p className="text-slate-700 font-medium">{selectedIntern.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internship Period</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 mb-1">Start Date</p>
                  <p className="text-slate-700 font-bold">{selectedIntern.doj || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 mb-1">End Date</p>
                  <p className="text-slate-700 font-bold">{selectedIntern.endDate || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Intern Details</h2>
      </header>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Fetching interns...</p>
          </div>
        ) : interns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Users size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">No interns found</p>
              <p className="text-slate-500 text-sm">Add your first intern to get started</p>
            </div>
          </div>
        ) : (
          interns.map((intern, index) => (
            <motion.div 
              key={intern.id || `intern-detail-${index}`} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedIntern(intern)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-indigo-200 transition-all"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {intern.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">{intern.name || 'Unknown Intern'}</h3>
                <p className="text-slate-500 text-sm">{intern.college || 'N/A'} • {intern.branch || 'N/A'}</p>
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ChevronLeft size={18} className="rotate-180" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const AddIntern = ({ onBack }: { onBack: () => void }) => {
  const [form, setForm] = useState({
    name: '',
    college: '',
    branch: '',
    doj: '',
    endDate: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await storageService.addIntern(form);
    setLoading(false);
    setSuccess(true);
    setForm({ name: '', college: '', branch: '', doj: '', endDate: '', phone: '', email: '', address: '' });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Add New Intern</h2>
      </header>

      <div className="flex-1 p-6 space-y-5 overflow-y-auto pb-32">
        <Input label="Full Name" value={form.name} onChange={(v: any) => setForm({...form, name: v})} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="College" value={form.college} onChange={(v: any) => setForm({...form, college: v})} />
          <Input label="Branch / Stream" value={form.branch} onChange={(v: any) => setForm({...form, branch: v})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="DOJ" type="date" value={form.doj} onChange={(v: any) => setForm({...form, doj: v})} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(v: any) => setForm({...form, endDate: v})} />
        </div>
        <Input label="Phone" type="tel" value={form.phone} onChange={(v: any) => setForm({...form, phone: v})} />
        <Input label="Email" type="email" value={form.email} onChange={(v: any) => setForm({...form, email: v})} />
        <Input label="Address" value={form.address} onChange={(v: any) => setForm({...form, address: v})} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0">
        <Button onClick={handleSubmit} disabled={loading || !form.name}>
          {loading ? 'Adding to Sheets...' : 'Submit Intern Details'}
        </Button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 />
            <span className="font-medium">Intern added successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AttendanceReport = ({ onBack }: { onBack: () => void }) => {
  const [stats, setStats] = useState<any[]>([]);
  const [summary, setSummary] = useState({ top: '', low: '' });

  useEffect(() => {
    const loadData = async () => {
      const interns = await storageService.getInterns();
      const attendance = await storageService.getAttendance();

      const internStats = interns.map(intern => {
        const records = attendance.filter(r => r.internId === intern.id);
        const presentCount = records.filter(r => r.status === 'P').length;
        const halfDayCount = records.filter(r => r.status === 'H').length;
        const score = presentCount + (halfDayCount * 0.5);
        return { name: intern.name, score };
      }).sort((a, b) => b.score - a.score);

      setStats(internStats);
      if (internStats.length > 0) {
        setSummary({
          top: internStats[0].name,
          low: internStats[internStats.length - 1].name
        });
      }
    };
    loadData();
  }, []);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Attendance Report</h2>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Top Intern</p>
            <p className="text-indigo-600 font-bold text-lg truncate">{summary.top || 'N/A'}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Lowest</p>
            <p className="text-amber-600 font-bold text-lg truncate">{summary.low || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Attendance Score Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Performance Overview</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="score"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [screen, setScreen] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('intern_track_user');
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('intern_track_user', name);
    setUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('intern_track_user');
    setUser(null);
    setScreen('dashboard');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl relative">
      <AnimatePresence mode="wait">
        {screen === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard user={user} onNavigate={setScreen} onLogout={handleLogout} />
          </motion.div>
        )}
        {screen === 'track' && (
          <motion.div key="track" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <AttendanceTrack onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
        {screen === 'details' && (
          <motion.div key="details" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <InternDetails onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
        {screen === 'add' && (
          <motion.div key="add" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <AddIntern onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
        {screen === 'report' && (
          <motion.div key="report" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            <AttendanceReport onBack={() => setScreen('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
