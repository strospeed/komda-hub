import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Users, DollarSign, Speaker, Camera, Armchair, Calendar as CalendarIcon,
  LayoutDashboard, Plus, Trash2, Menu, X, ArrowRightLeft, Trophy, MessageSquare, Send,
  QrCode, Download, Sun, Moon, Music, CalendarDays, Heart, ListTodo, ScanLine, Printer, Image as ImageIcon, ChevronDown, ShieldAlert, LogOut, UserPlus, LogIn, PieChart, UserCheck, Save, Edit2
} from 'lucide-react';

export const DISCORD_INVITE_URL = `https://discord.gg/GwXdWBTapD`;
export const CHURCH_WEBSITE_URL = 'https://gkjslogohimo.web.id/';
export const CHURCH_EMAIL = 'gkj.slogohimo.wng@gmail.com';
export const CHURCH_FB_URL = 'https://www.facebook.com/gkj.slogohimo';
export const CHURCH_IG_URL = 'https://www.instagram.com/komdagkjslogohimo/?hl=id';
export const CHURCH_TIKTOK_URL = 'https://www.tiktok.com/@komdagkjslogohimo';
export const CHURCH_YT_URL = 'https://www.youtube.com/@GKJSLOGOHIMO';
export const PERMANENT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1532677061397844089/hHMk-YY4pzLD8Z_WUu_hwMETVUTq0klvbgCv-RPVuMapx_jzs5642I61YfG-PnGbMm65';

// Tuliskan email owner / admin utama di sini:
const OWNER_EMAIL = 'mariodimaputra01@gmail.com'; // Ganti dengan email owner yang sebenarnya

const LOGO_URL = "https://scontent.cdninstagram.com/v/t51.82787-19/670185764_18404537299198608_3466022258141293919_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=108&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=fT8-QoF7sGAQ7kNvwG0YQl8&_nc_oc=AdriMEhEnYQIPNWxsshVgq4awx68DrA7n_3KkfQFiP0zhIhNCEfLmo2s5-U-E-Ye6cw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=stV9ZRyT4yRV4ZTzPFPOrg&_nc_ss=7b6a8&oh=00_AQHN3R0HJWbuIvSDRWDJ2WbmT8UNXJQY__b5tuHSxuvyjw&oe=6A751827";

const LIGHT_WALLPAPER = "https://cdn.phototourl.com/free/2026-08-02-a73c9136-d84c-458e-9a24-5dd81573907f.png";
const DARK_WALLPAPER = "https://cdn.phototourl.com/free/2026-08-02-1d051970-5df8-430e-bfbc-7a6058ad168c.png";

const firebaseConfig = {
  apiKey: 'AIzaSyAqNuViryXML4war1pXTjxm9l6VIqGhB0A',
  authDomain: 'komda-hub.firebaseapp.com',
  projectId: 'komda-hub',
  storageBucket: 'komda-hub.firebasestorage.app',
  messagingSenderId: '170131110544',
  appId: '1:170131110544:web:4238f2d853b83deae8f615',
  measurementId: 'G-Y1WRHPFVFJ',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'komda-hub-main';

export type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'songs' | 'rota' | 'prayers' | 'tasks' | 'profile';

interface Member { id: string; name: string; role: string; division: string; contact: string; joinDate: string; xp: number; qrId?: string; photoUrl?: string; }
export interface Transaction { id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; }
type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';
interface InventoryItem { id: string; name: string; category: InventoryCategory; condition: 'Good' | 'Needs Repair' | 'Broken'; quantity: number; location: string; qrCodeId?: string; }
export interface BorrowingRequest { id: string; itemId: string; itemName: string; borrowerName: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Returned'; purpose?: string; }
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; }
export interface Song { id: string; title: string; key: string; lyrics: string; }
export interface Rota { id: string; date: string; event: string; wl: string; musicians: string; multimedia: string; }
export interface Prayer { id: string; author: string; content: string; date: string; prayCount: number; }
export interface Task { id: string; title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done'; event: string; }

const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
    discord: 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md'
  };
  return (
    <button className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">{label}</label>}
    <input {...props} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">{label}</label>}
    <select {...props} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm appearance-none">
      {options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">{opt.label}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">{label}</label>}
    <textarea {...props} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
  </div>
);

export const Badge = ({ children, color = 'indigo' }: { children: React.ReactNode; color?: string; }) => {
  const styles: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.indigo}`}>{children}</span>;
};

const AuthView = ({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const isOwner = email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

        const memberRef = collection(db, 'artifacts', appId, 'public', 'data', 'members');
        await addDoc(memberRef, {
          name: name.trim() || email.split('@')[0],
          role: isOwner ? 'Super Admin' : 'Anggota',
          division: isOwner ? 'Pengurus Inti' : 'Youth',
          contact: email,
          joinDate: new Date().toISOString(),
          xp: 10,
          qrId: `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`,
          photoUrl: ''
        });

        onAuthSuccess(userCred.user);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCred.user);
      }
    } catch (err: any) {
      setError(err.message || 'Autentikasi gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-white mx-auto flex items-center justify-center mb-4 border border-slate-700">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">KOMDA HUB</h1>
          <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mt-1">GKJ Slogohimo Engine</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button 
            type="button" 
            onClick={() => { setIsRegister(false); setError(''); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Masuk (Login)
          </button>
          <button 
            type="button" 
            onClick={() => { setIsRegister(true); setError(''); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Buat Akun (Register)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input 
              label="Nama Lengkap" 
              type="text" 
              required={isRegister}
              value={name} 
              onChange={(e: any) => setName(e.target.value)} 
              placeholder="Nama Lengkap Anda" 
            />
          )}

          <Input 
            label="Email Gereja / Pribadi" 
            type="email" 
            required 
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
            placeholder="nama@email.com" 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
            {loading ? 'Memproses...' : (isRegister ? <><UserPlus className="w-4 h-4"/> Buat Akun & Daftar Anggota</> : <><LogIn className="w-4 h-4"/> Masuk ke Sistem</>)}
          </Button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          Sistem Manajemen Terpadu Pemuda & Remaja GKJ Slogohimo
        </p>
      </div>
    </div>
  );
};

const DashboardView = ({ stats, events, onNavigate }: any) => {
  const totalFinancialFlow = stats.income + stats.expense;
  const incomePercent = totalFinancialFlow > 0 ? Math.round((stats.income / totalFinancialFlow) * 100) : 50;
  const expensePercent = totalFinancialFlow > 0 ? Math.round((stats.expense / totalFinancialFlow) * 100) : 50;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Dashboard Utama
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Ringkasan aktivitas dan status pelayanan KOMDA.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card onClick={() => onNavigate('members')} className="border-t-4 border-t-indigo-500 dark:border-indigo-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Anggota</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.members}</p>
          </Card>
          <Card onClick={() => onNavigate('finance')} className="border-t-4 border-t-emerald-500 dark:border-emerald-500/30">
             <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Kas</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {stats.balance.toLocaleString('id-ID')}</p>
          </Card>
          <Card onClick={() => onNavigate('inventory_sound')} className="border-t-4 border-t-amber-500 dark:border-amber-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Speaker className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Inventaris Gear</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.inventory}</p>
          </Card>
          <Card onClick={() => onNavigate('calendar')} className="border-t-4 border-t-cyan-500 dark:border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Agenda Pelayanan</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{events.length}</p>
          </Card>
      </div>

      <Card onClick={() => onNavigate('finance')} className="border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PieChart className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Diagram Arus Keuangan Kas</h3>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Klik untuk detail →</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Pemasukan</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">Rp {stats.income.toLocaleString('id-ID')} ({incomePercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Pengeluaran</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">Rp {stats.expense.toLocaleString('id-ID')} ({expensePercent}%)</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-4 overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-800">
              <div className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${incomePercent}%` }} title={`Pemasukan: ${incomePercent}%`}></div>
              <div className="bg-rose-500 h-full rounded-r-full transition-all duration-500" style={{ width: `${expensePercent}%` }} title={`Pengeluaran: ${expensePercent}%`}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProfileView = ({ user, members, onUpdateMember }: any) => {
  const currentMember = useMemo(() => {
    if (!user || !user.email) return null;
    return members.find((m: Member) => m.contact?.toLowerCase() === user.email.toLowerCase());
  }, [user, members]);

  const [formData, setFormData] = useState({
    name: currentMember?.name || '',
    division: currentMember?.division || 'Youth',
    contact: currentMember?.contact || user?.email || '',
    photoUrl: currentMember?.photoUrl || ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentMember) {
      setFormData({
        name: currentMember.name || '',
        division: currentMember.division || 'Youth',
        contact: currentMember.contact || user?.email || '',
        photoUrl: currentMember.photoUrl || ''
      });
    }
  }, [currentMember, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) {
      alert("Data profil anggota tidak ditemukan di database.");
      return;
    }
    onUpdateMember(currentMember.id, formData);
    setSuccessMsg('Profil berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-indigo-500" /> Profil Saya
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Kelola informasi pribadi, foto, dan data pelayanan Anda.</p>
      </div>

      <Card className="border-indigo-500/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500 shadow-md flex items-center justify-center flex-shrink-0">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-indigo-600 uppercase">{formData.name ? formData.name.substring(0, 2) : 'US'}</span>
              )}
            </div>

            <div className="w-full text-center sm:text-left">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Ganti Foto Profil</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-all cursor-pointer" />
              <p className="text-[11px] text-slate-400 mt-1">Format gambar: JPG, PNG (Maks disarankan ukuran kecil).</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Email Akun (Login)" disabled value={user?.email || ''} />
            <Input label="Divisi / Departemen Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} placeholder="Cth: Puji-Pujian / Multimedia" />
            <Input label="Kontak (WhatsApp / Discord)" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} placeholder="@username atau 0812..." />
          </div>

          {currentMember && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">KOMDA ID & XP Poin</span>
                <span className="font-mono font-bold text-indigo-500 text-sm">{currentMember.qrId || 'MEMBER-XXXXXX'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">Poin Keaktifan</span>
                <span className="font-mono font-bold text-emerald-500 text-sm">{currentMember.xp || 0} XP</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl font-semibold text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit">
              <Save className="w-4 h-4" /> Simpan Perubahan Profil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const MembersView = ({ members, onAdd, onDelete, onUpdateXP, onUpdateMember, currentUserRole }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50, photoUrl: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [activeQRMember, setActiveQRMember] = useState<Member | null>(null);
  
  // State untuk Modal Edit Role/Divisi Anggota oleh Super Admin
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ role: 'Anggota', division: 'Youth' });

  const isSuperAdmin = currentUserRole === 'Super Admin';

  useEffect(() => {
    if (!isScanning) return;
    const scannerId = "reader";
    // @ts-ignore
    if (window.Html5QrcodeScanner) {
      // @ts-ignore
      const scanner = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setIsScanning(false);
          const foundMember = members.find((m: Member) => m.qrId === decodedText || decodedText.includes(m.qrId || ''));
          if (foundMember) {
            onUpdateXP(foundMember.id, (foundMember.xp || 0) + 10);
            alert(`Berhasil! Kehadiran ${foundMember.name} dicatat (+10 XP).`);
          } else {
            alert(`QR Code terdeteksi, tetapi anggota tidak terdaftar.`);
          }
        },
        () => {}
      );
      return () => {
        try { scanner.clear(); } catch (e) {}
      };
    }
  }, [isScanning, members, onUpdateXP]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Akses ditolak! Hanya Super Admin yang dapat menambah anggota / mengatur hak akses.");
      return;
    }
    const qrId = `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, joinDate: new Date().toISOString(), xp: Number(formData.xp) || 0, qrId });
    setIsAdding(false);
    setFormData({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50, photoUrl: '' });
  };

  const handleOpenEdit = (member: Member) => {
    if (!isSuperAdmin) return;
    setEditingMember(member);
    setEditForm({ role: member.role || 'Anggota', division: member.division || 'Youth' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember.id, editForm);
    setEditingMember(null);
  };

  const handleDownloadQR = (name: string, qrId: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/#member=${qrId}`)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-Member-${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0)), [members]);
  const getRoleColor = (role: string) => role === 'Super Admin' ? 'purple' : role === 'Ketua' || role === 'Pengurus' ? 'indigo' : role === 'Bendahara' ? 'emerald' : role === 'PJ Sound' ? 'amber' : role === 'PJ Media' ? 'cyan' : 'slate';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" /> Anggota & Kartu ID
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Manajemen anggota, XP pelayanan, dan ID QR Code (Absensi).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsScanning(true)}>
            <ScanLine className="w-4 h-4" /> Scan Presensi
          </Button>
          {isSuperAdmin && (
            <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>
          )}
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>Anda login sebagai <b>{currentUserRole}</b>. Penambahan anggota dan pengaturan role dikunci khusus untuk Super Admin.</span>
        </div>
      )}

      {/* Modal Edit Role / Divisi oleh Super Admin */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Role Anggota</h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-2">
                <p className="text-xs text-slate-500 font-semibold">Nama Anggota:</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{editingMember.name}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{editingMember.contact}</p>
              </div>

              <Select 
                label="Jabatan / Role" 
                value={editForm.role} 
                onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })} 
                options={[
                  { value: 'Anggota', label: 'Anggota' },
                  { value: 'Pengurus', label: 'Pengurus' },
                  { value: 'PJ Sound', label: 'PJ Sound System' },
                  { value: 'PJ Media', label: 'PJ Multimedia' },
                  { value: 'Bendahara', label: 'Bendahara' },
                  { value: 'Ketua', label: 'Ketua / Pembina' },
                  { value: 'Super Admin', label: 'Super Admin' }
                ]} 
              />

              <Input 
                label="Divisi / Departemen Pelayanan" 
                value={editForm.division} 
                onChange={(e: any) => setEditForm({ ...editForm, division: e.target.value })} 
                placeholder="Cth: Youth / Multimedia / Puji-Pujian" 
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setEditingMember(null)}>Batal</Button>
                <Button type="submit">Simpan Perubahan Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Arahkan Kamera ke QR Code</h3>
              <button onClick={() => setIsScanning(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            <div id="reader" className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950"></div>
          </div>
        </div>
      )}

      {activeQRMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveQRMember(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">KOMDA ID</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{activeQRMember.division} Division</p>
            
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {activeQRMember.photoUrl ? (
                  <img src={activeQRMember.photoUrl} alt={activeQRMember.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-indigo-600 uppercase">{activeQRMember.name.substring(0, 2)}</span>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/#member=${activeQRMember.qrId || 'MEMBER-DEFAULT'}`)}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{activeQRMember.name}</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-1 font-bold tracking-widest">{activeQRMember.qrId || 'MEMBER-XXXXXX'}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={() => handleDownloadQR(activeQRMember.name, activeQRMember.qrId || 'MEMBER')} variant="secondary" className="w-full">
                <Download className="w-4 h-4" /> Download QR Code
              </Button>
              {isSuperAdmin && (
                <Button onClick={() => { onUpdateXP(activeQRMember.id, (activeQRMember.xp || 0) + 10); setActiveQRMember(null); }} variant="emerald" className="w-full">
                  <QrCode className="w-4 h-4" /> Hadir (+10 XP)
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdding && isSuperAdmin && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Daniel Wibowo" />
              <Select label="Jabatan/Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} options={[{value:'Anggota',label:'Anggota'},{value:'Pengurus',label:'Pengurus'},{value:'PJ Sound',label:'PJ Sound System'},{value:'PJ Media',label:'PJ Multimedia'},{value:'Bendahara',label:'Bendahara'},{value:'Ketua',label:'Ketua / Pembina'},{value:'Super Admin',label:'Super Admin'}]} />
              <Input label="Divisi Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} placeholder="Puji-Pujian / Sound / Media" />
              <Input label="Kontak (WA/Discord)" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} placeholder="@username atau 0812..." />
              <Input label="XP Poin" type="number" min="0" value={formData.xp} onChange={(e:any) => setFormData({...formData, xp: e.target.value})} />
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Foto Profil</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    {formData.photoUrl ? <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Anggota</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Nama & ID</th>
                <th className="px-6 py-4">Jabatan & Divisi</th>
                <th className="px-6 py-4 text-center">Keaktifan (XP)</th>
                {isSuperAdmin && <th className="px-6 py-4 text-right">Aksi Super Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedMembers.map((member: Member, index: number) => {
                const maxXP = sortedMembers[0]?.xp || 100;
                const progressPercent = Math.min(100, Math.round(((member.xp || 0) / maxXP) * 100));
                return (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      {index === 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">🥇 1</span> : 
                       index === 1 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-400/20 text-slate-600 dark:text-slate-300 font-bold">🥈 2</span> : 
                       index === 2 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-amber-700/20 text-orange-700 dark:text-amber-600 font-bold">🥉 3</span> : 
                       <span className="font-mono text-slate-500 dark:text-slate-400 ml-2">#{index + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase flex-shrink-0">
                          {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name.substring(0, 2)}
                        </div>
                        <div>
                          <div>{member.name}</div>
                          <button onClick={() => setActiveQRMember(member)} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono mt-0.5 font-semibold">
                            <QrCode className="w-3 h-3"/> Tampilkan QR ID
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getRoleColor(member.role)}>{member.role}</Badge>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{member.division || 'Umum'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 mx-auto">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{member.xp || 0} XP</span>
                          <span className="text-slate-500">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEdit(member)} 
                            title="Edit Role / Divisi"
                            className="text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDelete(member.id)} 
                            title="Hapus Anggota"
                            className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinanceView = ({ transactions, onAdd, stats }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, amount: parseFloat(formData.amount) || 0, category: 'Kas Umum' });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleExportExcel = () => {
    let excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr><td colspan="5" style="font-size: 16px; font-weight: bold; text-align: center;">BUKU KAS - KOMDA HUB</td></tr>
          <tr><td colspan="5" style="font-size: 11px; text-align: center;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</td></tr>
          <tr><td colspan="5"></td></tr>
          <tr style="background-color: #4338ca; color: white; font-weight: bold; text-align: center;">
            <th style="padding: 6px; border: 1px solid #000;">Tanggal</th>
            <th style="padding: 6px; border: 1px solid #000;">Keterangan</th>
            <th style="padding: 6px; border: 1px solid #000;">Pemasukan (Rp)</th>
            <th style="padding: 6px; border: 1px solid #000;">Pengeluaran (Rp)</th>
            <th style="padding: 6px; border: 1px solid #000;">Saldo Akhir (Rp)</th>
          </tr>
    `;

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;

    sortedTransactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      excelHTML += `
        <tr>
          <td style="border: 1px solid #000; text-align: center; mso-number-format:'\@';">${t.date}</td>
          <td style="border: 1px solid #000;">${t.description}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${t.type === 'income' ? amount : '-'}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${t.type === 'expense' ? amount : '-'}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${runningBalance}</td>
        </tr>
      `;
    });

    const totalIncome = sortedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = sortedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    excelHTML += `
          <tr style="background-color: #1e293b; color: white; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #000; text-align: right;">TOTAL KESELURUHAN:</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${totalIncome}</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${totalExpense}</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${runningBalance}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_KOMDA_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up pada browser untuk mencetak PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuangan KOMDA GKJ Slogohimo</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
          .header p { margin: 5px 0 0; color: #666; font-size: 12px; }
          .summary { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px; }
          .summary-card { flex: 1; border: 1px solid #ccc; padding: 12px; border-radius: 6px; text-align: center; }
          .summary-card h3 { margin: 0; font-size: 11px; color: #555; text-transform: uppercase; }
          .summary-card p { margin: 6px 0 0; font-size: 16px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background-color: #f4f4f4; }
          .text-right { text-align: right; }
          .income { color: #047857; font-weight: bold; }
          .expense { color: #b91c1c; font-weight: bold; }
          .footer { margin-top: 40px; text-align: right; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Keuangan KOMDA HUB</h1>
          <p>GKJ Slogohimo • Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Pemasukan</h3>
            <p style="color: #047857;">Rp ${stats.income.toLocaleString('id-ID')}</p>
          </div>
          <div class="summary-card">
            <h3>Total Pengeluaran</h3>
            <p style="color: #b91c1c;">Rp ${stats.expense.toLocaleString('id-ID')}</p>
          </div>
          <div class="summary-card">
            <h3>Saldo Akhir Kas</h3>
            <p>Rp ${stats.balance.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Jenis</th>
              <th class="text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
                <td><b>${t.description}</b></td>
                <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                <td class="text-right ${t.type === 'income' ? 'income' : 'expense'}">
                  ${t.type === 'income' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Bendahara KOMDA GKJ Slogohimo</p>
          <br><br>
          <p><b>( ............................................ )</b></p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-500 dark:text-emerald-400" /> Keuangan & Kas
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportExcel}><Download className="w-4 h-4" /> Export Excel</Button>
          <Button variant="secondary" onClick={handleExportPDF}><Printer className="w-4 h-4" /> Export PDF</Button>
          <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Transaksi</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Rp {stats.income.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-rose-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">Rp {stats.expense.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-indigo-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Kas</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {stats.balance.toLocaleString('id-ID')}</p>
        </Card>
      </div>
      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Jenis Transaksi" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'income',label:'Pemasukan (+)'},{value:'expense',label:'Pengeluaran (-)'}]} />
            <Input label="Jumlah (Rp)" type="number" required min="0" value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} placeholder="100000" />
            <Input label="Keterangan" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button variant="emerald" type="submit">Simpan Transaksi</Button></div>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
              <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4">Jenis</th><th className="px-6 py-4 text-right">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-xs font-mono">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t.description}</td>
                  <td className="px-6 py-4"><Badge color={t.type === 'income' ? 'emerald' : 'rose'}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Badge></td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const InventoryView = ({ category, items, onAdd, onDelete, selectedGearQR, setSelectedGearQR }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qrCodeId = `QR-${category.substring(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, category, quantity: Number(formData.quantity) || 1, qrCodeId });
    setIsAdding(false);
    setFormData({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });
  };

  const handleDownloadGearQR = (name: string, qrCodeId: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/#gear=${qrCodeId}`)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-Gear-${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {category === 'Sound System' && <Speaker className="w-8 h-8 text-amber-500 dark:text-amber-400" />}
            {category === 'Multimedia' && <Camera className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />}
            {category === 'Properti' && <Armchair className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
            Inventaris {category}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
        </div>
      </div>

      {selectedGearQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setSelectedGearQR(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">GEAR ID</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{selectedGearQR.category}</p>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/#gear=${selectedGearQR.qrCodeId || 'GEAR-DEFAULT'}`)}`} alt="QR" className="w-48 h-48 object-contain" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedGearQR.name}</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-2 font-bold tracking-widest">{selectedGearQR.qrCodeId || 'GEAR-XXXXXX'}</p>
            <div className="mt-4 text-xs text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
              <div>📍 <b>Lokasi:</b> {selectedGearQR.location}</div>
              <div>📦 <b>Jumlah:</b> {selectedGearQR.quantity} unit</div>
              <div>⚡ <b>Kondisi:</b> {selectedGearQR.condition}</div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={() => handleDownloadGearQR(selectedGearQR.name, selectedGearQR.qrCodeId || 'GEAR')} variant="secondary" className="w-full">
                <Download className="w-4 h-4" /> Download QR Code
              </Button>
              <Button onClick={() => setSelectedGearQR(null)} variant="ghost" className="w-full">Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Peralatan" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Jumlah Unit" type="number" required min="1" value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select label="Kondisi Alat" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})} options={[{value:'Good',label:'Baik & Siap Pakai'},{value:'Needs Repair',label:'Perlu Servis'},{value:'Broken',label:'Rusak / Matot'}]} />
            <Input label="Lokasi Penyimpanan" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan Gear</Button></div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.name}</h3>
              <Badge color={item.condition === 'Good' ? 'emerald' : item.condition === 'Needs Repair' ? 'amber' : 'rose'}>{item.condition === 'Good' ? 'Baik' : item.condition === 'Needs Repair' ? 'Servis' : 'Rusak'}</Badge>
            </div>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between"><span>Jumlah:</span><span className="text-slate-900 dark:text-white font-bold">{item.quantity} unit</span></div>
              <div className="flex justify-between"><span>Lokasi:</span><span className="text-slate-700 dark:text-slate-300">{item.location}</span></div>
              <div className="flex justify-between items-center pt-1">
                <button onClick={() => setSelectedGearQR(item)} className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors font-semibold">
                  <QrCode className="w-3.5 h-3.5" /> Tampilkan QR
                </button>
                <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BorrowingView = ({ borrowings, inventory, onAdd, onUpdateStatus }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGear = inventory.find((i: any) => i.id === formData.itemId);
    onAdd({ ...formData, itemName: selectedGear ? selectedGear.name : 'Unknown Gear', status: 'Pending' });
    setIsAdding(false); setFormData({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><ArrowRightLeft className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Sistem Peminjaman</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan</Button>
      </div>
      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Pilih Peralatan" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih Barang --'}, ...inventory.map((i:any) => ({value:i.id, label:i.name}))]} />
            <Input label="Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input label="Tgl Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tgl Kembali" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Kirim</Button></div>
          </form>
        </Card>
      )}
      <div className="space-y-3">
        {borrowings.map((b: any) => (
          <Card key={b.id} className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2"><p className="font-bold text-slate-900 dark:text-white">{b.itemName}</p><Badge color={b.status === 'Approved' ? 'emerald' : b.status === 'Pending' ? 'amber' : b.status === 'Returned' ? 'cyan' : 'rose'}>{b.status}</Badge></div>
              <p className="text-xs text-slate-500 mt-1">Peminjam: {b.borrowerName} • Tgl: {b.startDate} s/d {b.endDate}</p>
            </div>
            <div className="flex gap-2">
              {b.status === 'Pending' && (<><Button variant="emerald" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Approved')}>Approve</Button><Button variant="danger" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Rejected')}>Reject</Button></>)}
              {b.status === 'Approved' && <Button variant="secondary" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Returned')}>Kembali</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ events, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service', description: '' });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service', description: '' }); 
  };

  const isEventPast = (eventDateStr: string) => {
    if (!eventDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const handleSendEventToDiscord = async (evt: any) => {
    try {
      const discordMsg = `📅 **AGENDA PELAYANAN KOMDA HUB**\n\n📌 **Acara:** ${evt.title}\n🏷️ **Jenis:** ${evt.type}\n📍 **Lokasi:** ${evt.location}\n⏰ **Waktu:** ${evt.date} (${evt.time})`;
      
      const response = await fetch(PERMANENT_DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: discordMsg })
      });

      if (response.ok || response.status === 204) {
        alert('Agenda acara berhasil dikirim ke Discord!');
      } else {
        alert('Gagal mengirim ke Discord.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400" /> Agenda Pelayanan
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Acara" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Select label="Jenis" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'Service',label:'Ibadah'},{value:'Youth',label:'Pemuda'},{value:'Rehearsal',label:'Latihan'}]} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Jam" value={formData.time} onChange={(e:any) => setFormData({...formData, time: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: any) => {
          const past = isEventPast(e.date);
          return (
            <Card key={e.id} className={`${past ? 'opacity-75 border-slate-300 dark:border-slate-800' : ''} flex flex-col justify-between`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Badge color={past ? 'slate' : 'cyan'}>{e.type}</Badge>
                    {past && <Badge color="rose">Selesai</Badge>}
                  </div>
                  <span className="font-mono text-xs text-slate-500">{e.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{e.title}</h3>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">📍 {e.location} • ⏰ {e.time}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={() => handleSendEventToDiscord(e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors border border-[#5865F2]/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Kirim ke Discord
                </button>
              </div>
            </Card>
          );
        })}
        {events.length === 0 && <p className="col-span-full text-slate-500 italic">Belum ada agenda pelayanan tercatat.</p>}
      </div>
    </div>
  );
};

const DiscordWebhookView = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setStatus({ type: null, text: '' });

    try {
      const response = await fetch(PERMANENT_DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });

      if (response.ok || response.status === 204) {
        setStatus({ type: 'success', text: 'Pesan berhasil dikirim ke Discord!' });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: 'Gagal mengirim pesan ke Discord.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-[#5865F2]" /> Discord Broadcast
      </h2>
      
      <Card className="border-[#5865F2]/40">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Webhook Tujuan:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[280px] sm:max-w-md">Kanal Resmi KOMDA</span>
          </div>

          <Textarea label="Pesan Broadcast" rows={5} value={message} onChange={(e:any) => setMessage(e.target.value)} placeholder="Tulis pengumuman..." required />

          {status.type && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
              {status.text}
            </div>
          )}

          <Button variant="discord" type="submit" className="w-full" disabled={isLoading}>
            <Send className="w-4 h-4" /> {isLoading ? 'Mengirim...' : 'Kirim Pesan ke Discord'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const WorshipSongLibraryView = ({ songs, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [transposeStep, setTransposeStep] = useState(0);
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', key: 'C', lyrics: '' }); 
  };

  const transposeChord = (chord: string, semitones: number): string => {
    const CHORDS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    const [, root, modifier] = match;
    let index = CHORDS.indexOf(root);
    if (index === -1) return chord;
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    return CHORDS[newIndex] + modifier;
  };

  const getTransformedLyrics = (lyrics: string) => {
    if (transposeStep === 0) return lyrics;
    return lyrics.replace(/\[(.*?)\]/g, (match, chordGroup) => {
      const transposed = chordGroup.split(' ').map((c: string) => transposeChord(c, transposeStep)).join(' ');
      return `[${transposed}]`;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Music className="w-8 h-8 text-rose-500" /> Database Pujian
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Lagu</Button>
      </div>

      {selectedSong && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => { setSelectedSong(null); setTransposeStep(0); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><X className="w-6 h-6"/></button>
            
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge color="rose">Original Key: {selectedSong.key}</Badge>
                {transposeStep !== 0 && <Badge color="indigo">Transpose: {transposeStep > 0 ? `+${transposeStep}` : transposeStep}</Badge>}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-xs font-bold px-2 text-slate-500">Chord:</span>
                <button onClick={() => setTransposeStep(prev => prev - 1)} className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg shadow">-</button>
                <button onClick={() => setTransposeStep(0)} className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">Reset</button>
                <button onClick={() => setTransposeStep(prev => prev + 1)} className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg shadow">+</button>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedSong.title}</h3>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {getTransformedLyrics(selectedSong.lyrics || 'Tidak ada lirik.')}
              </pre>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="danger" onClick={() => { if (confirm('Hapus lagu?')) { onDelete(selectedSong.id); setSelectedSong(null); } }}>
                <Trash2 className="w-4 h-4" /> Hapus Lagu
              </Button>
              <Button onClick={() => { setSelectedSong(null); setTransposeStep(0); }} variant="secondary">Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-rose-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input label="Judul Lagu" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} className="flex-1" />
              <Input label="Nada Dasar" required value={formData.key} onChange={(e:any) => setFormData({...formData, key: e.target.value})} className="w-24" />
            </div>
            <Textarea label="Lirik & Chord (Cth: [C] [G])" rows={6} value={formData.lyrics} onChange={(e:any) => setFormData({...formData, lyrics: e.target.value})} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {songs.map((s: Song) => (
          <Card key={s.id} onClick={() => { setSelectedSong(s); setTransposeStep(0); }} className="group relative overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all">
            <div className="absolute top-0 right-0 bg-rose-500 text-white font-bold text-xs px-3 py-1 rounded-bl-xl shadow-md">Key: {s.key}</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2 pr-8">{s.title}</h3>
            <p className="text-xs text-slate-500 mt-3 font-mono whitespace-pre-wrap line-clamp-4">{s.lyrics || 'Lirik belum tersedia.'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MinistryRotaView = ({ schedules, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ date: '', event: 'Ibadah Pemuda', wl: '', musicians: '', multimedia: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd(formData); setIsAdding(false); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><CalendarDays className="w-8 h-8 text-indigo-500" /> Jadwal Petugas</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Rota</Button>
      </div>
      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Acara" required value={formData.event} onChange={(e:any) => setFormData({...formData, event: e.target.value})} />
            <Input label="Worship Leader (WL)" value={formData.wl} onChange={(e:any) => setFormData({...formData, wl: e.target.value})} />
            <Input label="Pemusik" value={formData.musicians} onChange={(e:any) => setFormData({...formData, musicians: e.target.value})} />
            <Input label="Multimedia & Sound" className="md:col-span-2" value={formData.multimedia} onChange={(e:any) => setFormData({...formData, multimedia: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="space-y-4">
        {schedules.map((s: Rota) => (
          <Card key={s.id} className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/4 border-r border-slate-200 dark:border-slate-800 pr-4">
              <Badge color="indigo">{s.event}</Badge>
              <p className="font-bold mt-2 text-slate-900 dark:text-white">{new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
              <div><span className="font-semibold text-slate-500 block mb-1">🎤 WL</span>{s.wl || '-'}</div>
              <div><span className="font-semibold text-slate-500 block mb-1">🎹 Pemusik</span>{s.musicians || '-'}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-500 block mb-1">💻 Media & Sound</span>{s.multimedia || '-'}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PrayerWallView = ({ prayers, onAdd, onPray }: any) => {
  const [content, setContent] = useState('');
  const [supportedPrayers, setSupportedPrayers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('komda_supported_prayers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handlePrayClick = (prayerId: string, currentCount: number) => {
    if (supportedPrayers.includes(prayerId)) return;
    onPray(prayerId, currentCount);
    const updated = [...supportedPrayers, prayerId];
    setSupportedPrayers(updated);
    try { localStorage.setItem('komda_supported_prayers', JSON.stringify(updated)); } catch (e) {}
  };

  const handleSendToDiscord = async (prayer: Prayer) => {
    try {
      const discordMsg = `🙏 **POKOK DOA JEMAAT - KOMDA HUB**\n\n> "${prayer.content}"\n\n❤️ **Dukungan Doa:** ${prayer.prayCount} orang\n📅 **Tanggal:** ${new Date(prayer.date).toLocaleDateString('id-ID')}`;
      
      const response = await fetch(PERMANENT_DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: discordMsg })
      });

      if (response.ok || response.status === 204) {
        alert('Pokok doa berhasil dibagikan ke Discord!');
      } else {
        alert('Gagal mengirim ke Discord.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd({ author: 'Jemaat', content, date: new Date().toISOString(), prayCount: 0 }); 
    setContent(''); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><Heart className="w-8 h-8 text-rose-500" /> Direktori Doa</h2>
      <Card className="bg-gradient-to-r from-rose-500/10 to-transparent">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input placeholder="Tuliskan pokok doa Anda..." value={content} onChange={(e:any) => setContent(e.target.value)} required />
          <Button type="submit" variant="danger" className="mt-6"><Send className="w-4 h-4"/></Button>
        </form>
      </Card>
      <div className="space-y-4">
        {prayers.map((p: Prayer) => {
          const isSupported = supportedPrayers.includes(p.id);
          return (
            <Card key={p.id} className="relative space-y-4">
              <p className="text-slate-800 dark:text-slate-200 italic text-base">"{p.content}"</p>
              
              <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                <span>📅 {new Date(p.date).toLocaleDateString()}</span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSendToDiscord(p)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors border border-[#5865F2]/20"
                    title="Kirim pokok doa dan jumlah dukungan ke Discord"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Kirim ke Discord
                  </button>

                  <button 
                    onClick={() => handlePrayClick(p.id, p.prayCount)} 
                    disabled={isSupported}
                    className={`flex items-center gap-1.5 transition-colors px-3.5 py-1.5 rounded-full font-bold ${
                      isSupported ? 'bg-rose-500/20 text-rose-500 cursor-not-allowed border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSupported ? 'fill-rose-500 text-rose-500' : ''}`} /> 
                    {isSupported ? `Didukung (${p.prayCount})` : `Mendukung (${p.prayCount})`}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const TaskBoardView = ({ tasks, onAdd, onUpdateStatus }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', assignee: '', status: 'To Do', event: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd(formData); setIsAdding(false); };
  
  const renderColumn = (status: string, colorClass: string) => (
    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[300px]">
      <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 ${colorClass}`}><div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0].replace('text', 'bg')}`}></div> {status}</h3>
      <div className="space-y-3">
        {tasks.filter((t: Task) => t.status === status).map((t: Task) => (
          <Card key={t.id} className="p-3 shadow-sm">
            <Badge color="slate">{t.event}</Badge>
            <p className="font-bold text-sm mt-2 text-slate-900 dark:text-white">{t.title}</p>
            <div className="flex justify-between items-center mt-3 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-xs text-slate-500">{t.assignee}</span>
              <select className="text-xs bg-transparent text-indigo-500 font-bold focus:outline-none" value={t.status} onChange={(e) => onUpdateStatus(t.id, e.target.value)}>
                <option value="To Do" className="bg-white dark:bg-slate-900">To Do</option>
                <option value="In Progress" className="bg-white dark:bg-slate-900">In Progress</option>
                <option value="Done" className="bg-white dark:bg-slate-900">Done</option>
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><ListTodo className="w-8 h-8 text-emerald-500" /> Papan Tugas</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Tugas</Button>
      </div>
      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Judul Tugas" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Input label="PIC" value={formData.assignee} onChange={(e:any) => setFormData({...formData, assignee: e.target.value})} />
            <Input label="Untuk Acara" value={formData.event} onChange={(e:any) => setFormData({...formData, event: e.target.value})} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('To Do', 'text-slate-500')}
        {renderColumn('In Progress', 'text-amber-500')}
        {renderColumn('Done', 'text-emerald-500')}
      </div>
    </div>
  );
};

const NavGroup = ({ title, isOpen, onToggle, children }: any) => {
  return (
    <div className="mb-2">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors group">
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
      </button>
      <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUserRole = useMemo(() => {
    if (!user || !user.email) return 'Anggota';
    return user.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'Super Admin' : 'Anggota';
  }, [user]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    utama: true,
    pelayanan: false,
    inventaris: false,
    sistem: false
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }))
  };

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Rota[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedGearQR, setSelectedGearQR] = useState<InventoryItem | null>(null);

  const currentMemberProfile = useMemo(() => {
    if (!user || !user.email) return null;
    return members.find((m: Member) => m.contact?.toLowerCase() === user.email?.toLowerCase());
  }, [user, members]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const getColRef = (colName: string) => collection(db, 'artifacts', appId, 'public', 'data', colName);
    
    const unsubs = [
      onSnapshot(getColRef('members'), s => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }) as Member))),
      onSnapshot(getColRef('transactions'), s => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }) as Transaction))),
      onSnapshot(getColRef('inventory'), s => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }) as InventoryItem))),
      onSnapshot(getColRef('borrowings'), s => setBorrowings(s.docs.map(d => ({ id: d.id, ...d.data() }) as BorrowingRequest))),
      onSnapshot(getColRef('events'), s => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() }) as EventItem))),
      onSnapshot(getColRef('songs'), s => setSongs(s.docs.map(d => ({ id: d.id, ...d.data() }) as Song))),
      onSnapshot(getColRef('schedules'), s => setSchedules(s.docs.map(d => ({ id: d.id, ...d.data() }) as Rota))),
      onSnapshot(getColRef('prayers'), s => setPrayers(s.docs.map(d => ({ id: d.id, ...d.data() }) as Prayer))),
      onSnapshot(getColRef('tasks'), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }) as Task)))
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { 
    if (currentUserRole !== 'Super Admin') {
      alert("Akses ditolak! Hanya Super Admin yang dapat menghapus data.");
      return;
    }
    if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); 
  };
  const handleUpdateDoc = async (colName: string, docId: string, data: any) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), data); };

  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { members: members.length, balance: income - expense, income, expense, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-sm font-semibold tracking-wider">Loading KOMDA HUB Engine...</p>
    </div>
  );

  if (!user) {
    return <AuthView onAuthSuccess={(u) => setUser(u)} />;
  }

  const NavItem = ({ icon: Icon, label, view, isActive, colorClass = "text-slate-500 dark:text-slate-400" }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white shadow-lg' : `${colorClass} hover:bg-slate-100 dark:hover:bg-slate-800/60`}`}>
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-slate-900 dark:text-white">KOMDA HUB</h1>
              <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest block -mt-1">Church Engine</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4 custom-scrollbar">
          <NavGroup title="Utama" isOpen={expandedMenus.utama} onToggle={() => toggleMenu('utama')}>
            <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
            <NavItem icon={Trophy} label="Anggota & QR ID" view="members" isActive={currentView === 'members'} />
            <NavItem icon={DollarSign} label="Kas & Keuangan" view="finance" isActive={currentView === 'finance'} />
          </NavGroup>

          <NavGroup title="Pelayanan & Rohani" isOpen={expandedMenus.pelayanan} onToggle={() => toggleMenu('pelayanan')}>
            <NavItem icon={CalendarDays} label="Jadwal Petugas" view="rota" isActive={currentView === 'rota'} />
            <NavItem icon={Music} label="Database Lirik" view="songs" isActive={currentView === 'songs'} />
            <NavItem icon={Heart} label="Direktori Doa" view="prayers" isActive={currentView === 'prayers'} />
            <NavItem icon={ListTodo} label="Papan Tugas" view="tasks" isActive={currentView === 'tasks'} />
          </NavGroup>

          <NavGroup title="Inventaris & Logistik" isOpen={expandedMenus.inventaris} onToggle={() => toggleMenu('inventaris')}>
            <NavItem icon={Speaker} label="Sound System" view="inventory_sound" isActive={currentView === 'inventory_sound'} />
            <NavItem icon={Camera} label="Multimedia" view="inventory_media" isActive={currentView === 'inventory_media'} />
            <NavItem icon={Armchair} label="Properti" view="inventory_property" isActive={currentView === 'inventory_property'} />
            <NavItem icon={ArrowRightLeft} label="Sistem Peminjaman" view="borrowing" isActive={currentView === 'borrowing'} />
          </NavGroup>

          <NavGroup title="Sistem & Notifikasi" isOpen={expandedMenus.sistem} onToggle={() => toggleMenu('sistem')}>
            <NavItem icon={CalendarIcon} label="Agenda Gereja" view="calendar" isActive={currentView === 'calendar'} />
            <NavItem icon={MessageSquare} label="Discord Broadcast" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] text-slate-500 truncate font-mono" title={user.email || ''}>{user.email}</span>
          </div>
          <button onClick={handleLogout} className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-500/20">
            <LogOut className="w-3.5 h-3.5" /> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main 
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto text-slate-900 dark:text-slate-100 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: isDarkMode 
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url('${DARK_WALLPAPER}')`
            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.50), rgba(241, 245, 249, 0.65)), url('${LIGHT_WALLPAPER}')`
        }}
      >
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><Menu className="w-6 h-6" /></button>
            <button onClick={() => setCurrentView('dashboard')} className="hidden sm:flex items-center gap-2 group transition-all">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">KOMDA HUB</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border hidden sm:inline-block ${
              currentUserRole === 'Super Admin' 
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' 
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
            }`}>
              Role: {currentUserRole}
            </span>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Menu Profil Kanan Atas dengan Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {currentMemberProfile?.photoUrl ? (
                    <img src={currentMemberProfile.photoUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentMemberProfile?.name ? currentMemberProfile.name.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline-block max-w-[110px] truncate">
                  {currentMemberProfile?.name || user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentMemberProfile?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setCurrentView('profile'); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-500" /> Profil Saya
                  </button>
                  <button 
                    onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1 relative z-10">
          {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
          {currentView === 'profile' && <ProfileView user={user} members={members} onUpdateMember={(id: string, data: any) => handleUpdateDoc('members', id, data)} />}
          {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} onUpdateXP={(id: string, newXp: number) => handleUpdateDoc('members', id, { xp: newXp })} onUpdateMember={(id: string, data: any) => handleUpdateDoc('members', id, data)} currentUserRole={currentUserRole} />}
          {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} />}
          
          {currentView === 'inventory_sound' && <InventoryView category="Sound System" items={inventory.filter(i => i.category === 'Sound System')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          {currentView === 'inventory_media' && <InventoryView category="Multimedia" items={inventory.filter(i => i.category === 'Multimedia')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          {currentView === 'inventory_property' && <InventoryView category="Properti" items={inventory.filter(i => i.category === 'Properti')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          
          {currentView === 'borrowing' && <BorrowingView borrowings={borrowings} inventory={inventory} onAdd={(d: any) => handleAddDoc('borrowings', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('borrowings', id, { status: s })} />}
          {currentView === 'calendar' && <CalendarView events={events} onAdd={(d: any) => handleAddDoc('events', d)} />}
          {currentView === 'discord_webhook' && <DiscordWebhookView />}
          
          {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d: any) => handleAddDoc('songs', d)} onDelete={(id: string) => handleDeleteDoc('songs', id)} />}
          {currentView === 'rota' && <MinistryRotaView schedules={schedules} onAdd={(d: any) => handleAddDoc('schedules', d)} />}
          {currentView === 'prayers' && <PrayerWallView prayers={prayers} onAdd={(d: any) => handleAddDoc('prayers', d)} onPray={(id: string, current: number) => handleUpdateDoc('prayers', id, { prayCount: current + 1 })} />}
          {currentView === 'tasks' && <TaskBoardView tasks={tasks} onAdd={(d: any) => handleAddDoc('tasks', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('tasks', id, { status: s })} />}
        </div>
      </main>
    </div>
  );
}
