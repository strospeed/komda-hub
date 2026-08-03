import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import {
  Users, DollarSign, Speaker, Camera, Armchair, Calendar as CalendarIcon,
  LayoutDashboard, Plus, Trash2, Menu, X, ArrowRightLeft, Trophy, MessageSquare, Send,
  QrCode, Download, Sun, Moon, Music, CalendarDays, Heart, ListTodo, ScanLine, Printer, Image as ImageIcon, ChevronDown, ShieldAlert, LogOut, UserCheck, Save, Edit2, FileText, Monitor, CheckSquare, Vote, BookOpen, ExternalLink, Award, AlertTriangle
} from 'lucide-react';

export const DISCORD_INVITE_URL = `https://discord.gg/GwXdWBTapD`;
export const CHURCH_WEBSITE_URL = 'https://gkjslogohimo.web.id/';
export const CHURCH_EMAIL = 'gkj.slogohimo.wng@gmail.com';
export const CHURCH_FB_URL = 'https://www.facebook.com/gkj.slogohimo';
export const CHURCH_IG_URL = 'https://www.instagram.com/komdagkjslogohimo/?hl=id';
export const CHURCH_TIKTOK_URL = 'https://www.tiktok.com/@komdagkjslogohimo';
export const CHURCH_YT_URL = 'https://www.youtube.com/@GKJSLOGOHIMO';
export const PERMANENT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1532677061397844089/hHMk-YY4pzLD8Z_WUu_hwMETVUTq0klvbgCv-RPVuMapx_jzs5642I61YfG-PnGbMm65';

const OWNER_EMAIL = 'mariodimasputra01@gmail.com'; 

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

export type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'songs' | 'rota' | 'prayers' | 'tasks' | 'profile' | 'liturgy' | 'polls' | 'guests';

interface Member { id: string; name: string; role: string; division: string; contact: string; joinDate: string; xp: number; qrId?: string; photoUrl?: string; }
export interface Transaction { id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; category?: string; receiptUrl?: string; }
type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';
interface InventoryItem { id: string; name: string; category: InventoryCategory; condition: 'Good' | 'Needs Repair' | 'Broken'; quantity: number; location: string; qrCodeId?: string; }
export interface BorrowingRequest { id: string; itemId: string; itemName: string; borrowerName: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Returned'; purpose?: string; checkInCondition?: string; checkOutCondition?: string; }
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; }
export interface Song { id: string; title: string; key: string; lyrics: string; }
export interface Rota { id: string; date: string; event: string; wl: string; musicians: string; multimedia: string; }
export interface Prayer { id: string; author: string; content: string; date: string; prayCount: number; }
export interface Task { id: string; title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done'; event: string; }
export interface LiturgyItem { id: string; title: string; date: string; theme: string; preacher: string; wl: string; items: { order: number; time: string; activity: string; leader: string; songTitle?: string; }[]; }
export interface PollItem { id: string; question: string; options: { text: string; votes: number; }[]; voters: string[]; isOpen: boolean; }
export interface GuestItem { id: string; name: string; contact: string; churchOrigin: string; visitDate: string; notes: string; }

const compressImage = (file: File, maxWidth = 250, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || '';
      const isOwner = email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

      const memberRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', user.uid);
      await setDoc(memberRef, {
        name: user.displayName || email.split('@')[0],
        role: isOwner ? 'Super Admin' : 'Anggota',
        division: isOwner ? 'Pengurus Inti' : 'Youth',
        contact: email.toLowerCase(),
        joinDate: new Date().toISOString(),
        xp: 10,
        qrId: `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`,
        photoUrl: user.photoURL || ''
      }, { merge: true });

      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Autentikasi dengan Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-white mx-auto flex items-center justify-center mb-4 border border-slate-700">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-wider text-white">KOMDA HUB</h1>
        <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mt-1 mb-8">GKJ Slogohimo Engine</p>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {loading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}
        </button>

        <p className="text-center text-[11px] text-slate-500 mt-8">
          Sistem Manajemen Terpadu Pemuda & Remaja GKJ Slogohimo
        </p>
      </div>
    </div>
  );
};

const DashboardView = ({ stats, events, onNavigate }: any) => {
  const totalFinancialFlow = (stats?.income || 0) + (stats?.expense || 0);
  const incomePercent = totalFinancialFlow > 0 ? Math.round(((stats?.income || 0) / totalFinancialFlow) * 100) : 50;
  const expensePercent = totalFinancialFlow > 0 ? Math.round(((stats?.expense || 0) / totalFinancialFlow) * 100) : 50;

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
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.members || 0}</p>
          </Card>
          <Card onClick={() => onNavigate('finance')} className="border-t-4 border-t-emerald-500 dark:border-emerald-500/30">
             <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Kas</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p>
          </Card>
          <Card onClick={() => onNavigate('inventory_sound')} className="border-t-4 border-t-amber-500 dark:border-amber-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Speaker className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Inventaris Gear</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.inventory || 0}</p>
          </Card>
          <Card onClick={() => onNavigate('calendar')} className="border-t-4 border-t-cyan-500 dark:border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Agenda Pelayanan</p>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{events?.length || 0}</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card onClick={() => onNavigate('finance')} className="border-indigo-500/30 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Diagram Arus Keuangan Kas</h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Klik untuk detail →</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Pemasukan</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Rp {(stats?.income || 0).toLocaleString('id-ID')} ({incomePercent}%)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Pengeluaran</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Rp {(stats?.expense || 0).toLocaleString('id-ID')} ({expensePercent}%)</span>
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

        <Card className="border-indigo-500/30 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
              🌐 Tautan Resmi
            </h3>
            <div className="space-y-2 text-xs">
              <a href={CHURCH_WEBSITE_URL} target="_blank" rel="noreferrer" className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors truncate">
                🌍 Website: {CHURCH_WEBSITE_URL}
              </a>
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-[#5865F2]/10 text-[#5865F2] font-semibold transition-colors truncate">
                💬 Komunitas Discord
              </a>
              <a href={CHURCH_IG_URL} target="_blank" rel="noreferrer" className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-rose-500/10 text-rose-500 font-semibold transition-colors truncate">
                📸 Instagram KOMDA
              </a>
              <a href={CHURCH_YT_URL} target="_blank" rel="noreferrer" className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-red-500/10 text-red-500 font-semibold transition-colors truncate">
                📺 YouTube Channel
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ProfileView = ({ user, members, onSaveProfile }: any) => {
  const currentMember = useMemo(() => {
    if (!user) return null;
    return members.find((m: Member) => m.id === user.uid || m.contact?.toLowerCase() === user.email?.toLowerCase());
  }, [user, members]);

  const [formData, setFormData] = useState({
    name: currentMember?.name || user?.email?.split('@')[0] || '',
    division: currentMember?.division || (user?.email?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'Pengurus Inti' : 'Youth'),
    contact: currentMember?.contact || user?.email || '',
    photoUrl: currentMember?.photoUrl || ''
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      } catch (err) {
        console.error("Gagal memproses gambar:", err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isOwner = user.email?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
    const payload = {
      name: formData.name.trim() || user.email?.split('@')[0] || 'User',
      role: currentMember?.role || (isOwner ? 'Super Admin' : 'Anggota'),
      division: formData.division,
      contact: (formData.contact || user.email || '').toLowerCase(),
      joinDate: currentMember?.joinDate || new Date().toISOString(),
      xp: currentMember?.xp ?? 10,
      qrId: currentMember?.qrId || `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`,
      photoUrl: formData.photoUrl 
    };

    await onSaveProfile(user.uid, payload);
    setSuccessMsg('Profil berhasil disimpan & disinkronkan ke menu Anggota!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Kalkulasi Badge Pencapaian (Achievements) Berdasarkan XP & Riwayat
  const userXP = currentMember?.xp || 10;
  const achievements = [
    { title: 'Veteran Pelayanan', desc: 'Mencapai total 100+ XP', unlocked: userXP >= 100, icon: '⭐' },
    { title: 'Anggota Aktif', desc: 'Mencapai total 50+ XP', unlocked: userXP >= 50, icon: '🔥' },
    { title: 'Pendatang Baru', desc: 'Bergabung di KOMDA HUB', unlocked: true, icon: '🌱' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-indigo-500" /> Profil & Pencapaian
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Kelola informasi pribadi, foto, dan lihat lencana pencapaian Anda.</p>
      </div>

      <Card className="border-indigo-500/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500 shadow-md flex items-center justify-center flex-shrink-0">
              {isCompressing ? (
                 <span className="text-xs font-bold text-slate-500">Loading...</span>
              ) : formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-indigo-600 uppercase">{formData.name ? formData.name.substring(0, 2) : 'US'}</span>
              )}
            </div>

            <div className="w-full text-center sm:text-left">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Ganti Foto Profil</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isCompressing} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-all cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Email Akun (Login)" disabled value={user?.email || ''} />
            <Input label="Divisi / Departemen Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} placeholder="Cth: Puji-Pujian / Multimedia" />
            <Input label="Kontak (WhatsApp / Discord)" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} placeholder="@username atau 0812..." />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">KOMDA ID & XP Poin</span>
              <span className="font-mono font-bold text-indigo-500 text-sm">{currentMember?.qrId || 'MEMBER-NEW'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-semibold">Poin Keaktifan</span>
              <span className="font-mono font-bold text-emerald-500 text-sm">{userXP} XP</span>
            </div>
          </div>

          {/* Lencana Pencapaian */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Lencana / Badge Pencapaian
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {achievements.map((ach, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center ${ach.unlocked ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50'}`}>
                  <span className="text-2xl mb-1">{ach.icon}</span>
                  <p className="font-bold text-xs">{ach.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl font-semibold text-center">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={isCompressing}>
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
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ role: 'Anggota', division: 'Youth' });
  const [isCompressing, setIsCompressing] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Akses ditolak! Hanya Super Admin.");
      return;
    }
    const qrId = `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, joinDate: new Date().toISOString(), xp: Number(formData.xp) || 0, qrId });
    setIsAdding(false);
    setFormData({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50, photoUrl: '' });
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0)), [members]);
  const getRoleColor = (role: string) => role === 'Super Admin' ? 'purple' : role === 'Ketua' || role === 'Pengurus' ? 'indigo' : role === 'Bendahara' ? 'emerald' : role === 'PJ Sound' ? 'amber' : role === 'PJ Media' ? 'cyan' : 'slate';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" /> Papan Peringkat & Anggota
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Leaderboard keaktifan anggota berdasarkan perolehan XP pelayanan.</p>
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

      {editingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Role Anggota</h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onUpdateMember(editingMember.id, editForm); setEditingMember(null); }} className="space-y-4">
              <Select label="Jabatan / Role" value={editForm.role} onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })} options={[{ value: 'Anggota', label: 'Anggota' }, { value: 'Pengurus', label: 'Pengurus' }, { value: 'PJ Sound', label: 'PJ Sound System' }, { value: 'PJ Media', label: 'PJ Multimedia' }, { value: 'Bendahara', label: 'Bendahara' }, { value: 'Ketua', label: 'Ketua' }, { value: 'Super Admin', label: 'Super Admin' }]} />
              <Input label="Divisi" value={editForm.division} onChange={(e: any) => setEditForm({ ...editForm, division: e.target.value })} />
              <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setEditingMember(null)}>Batal</Button><Button type="submit">Simpan</Button></div>
            </form>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Arahkan Kamera ke QR Code</h3>
              <button onClick={() => setIsScanning(false)} className="text-slate-400"><X className="w-6 h-6"/></button>
            </div>
            <div id="reader" className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950"></div>
          </div>
        </div>
      )}

      {activeQRMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveQRMember(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">KOMDA ID</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{activeQRMember.division} Division</p>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/#member=${activeQRMember.qrId || 'MEMBER-DEFAULT'}`)}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{activeQRMember.name}</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-1 font-bold tracking-widest">{activeQRMember.qrId || 'MEMBER-XXXXXX'}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={() => {
                const link = document.createElement('a');
                link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeQRMember.qrId || '')}`;
                link.download = `QR-${activeQRMember.name}.png`;
                link.click();
              }} variant="secondary" className="w-full">
                <Download className="w-4 h-4" /> Download QR Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && isSuperAdmin && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
              <Select label="Jabatan/Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} options={[{value:'Anggota',label:'Anggota'},{value:'Pengurus',label:'Pengurus'},{value:'PJ Sound',label:'PJ Sound System'},{value:'PJ Media',label:'PJ Multimedia'},{value:'Bendahara',label:'Bendahara'},{value:'Super Admin',label:'Super Admin'}]} />
              <Input label="Divisi" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} />
              <Input label="Kontak" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Peringkat (Leaderboard)</th>
                <th className="px-6 py-4">Anggota</th>
                <th className="px-6 py-4">Role & Divisi</th>
                <th className="px-6 py-4 text-center">XP Keaktifan</th>
                {isSuperAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedMembers.map((member: Member, index: number) => {
                const maxXP = sortedMembers[0]?.xp || 100;
                const progressPercent = Math.min(100, Math.round(((member.xp || 0) / maxXP) * 100));
                return (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      {index === 0 ? <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-amber-500/20 text-amber-500 font-bold text-xs gap-1">🥇 Juara 1</span> : 
                       index === 1 ? <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-slate-500/20 text-slate-400 font-bold text-xs gap-1">🥈 Juara 2</span> : 
                       index === 2 ? <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-orange-500/20 text-orange-500 font-bold text-xs gap-1">🥉 Juara 3</span> : 
                       <span className="font-mono text-slate-500 ml-2"># {index + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border flex items-center justify-center font-bold text-indigo-500 uppercase flex-shrink-0">
                          {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name.substring(0, 2)}
                        </div>
                        <div>
                          <div>{member.name}</div>
                          <button onClick={() => setActiveQRMember(member)} className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1 font-mono mt-0.5">
                            <QrCode className="w-3 h-3"/> Lihat QR ID
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getRoleColor(member.role)}>{member.role}</Badge>
                      <div className="text-xs text-slate-500 mt-1">{member.division || 'Umum'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 mx-auto">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-mono font-bold text-emerald-500">{member.xp || 0} XP</span>
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
                          <button onClick={() => { setEditingMember(member); setEditForm({ role: member.role, division: member.division }); }} className="p-2 text-slate-400 hover:text-indigo-500"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => onDelete(member.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button>
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
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Kas Umum KOMDA', receiptUrl: '' });
  const [isCompressing, setIsCompressing] = useState(false);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file, 400, 0.7);
        setFormData(prev => ({ ...prev, receiptUrl: compressedBase64 }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, amount: parseFloat(formData.amount) || 0 });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Kas Umum KOMDA', receiptUrl: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-500" /> Keuangan & Persembahan Digital
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Kas / Persembahan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">Rp {(stats?.income || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-rose-500/30">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-500 mt-1">Rp {(stats?.expense || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-indigo-500/30">
          <p className="text-slate-500 text-xs font-semibold uppercase">Saldo Akhir</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p>
        </Card>
      </div>

      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Jenis Transaksi" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'income',label:'Pemasukan / Persembahan (+)'},{value:'expense',label:'Pengeluaran / Belanja (-)'}]} />
              <Select label="Kategori Kas / Divisi" value={formData.category} onChange={(e:any) => setFormData({...formData, category: e.target.value})} options={[{value:'Kas Umum KOMDA',label:'Kas Umum KOMDA'},{value:'Persembahan Ibadah Pemuda',label:'Persembahan Ibadah Pemuda'},{value:'Dana Khusus Natal / Paskah',label:'Dana Khusus Natal / Paskah'},{value:'Bidang Baksos / Diakonia',label:'Bidang Baksos / Diakonia'}]} />
              <Input label="Jumlah (Rp)" type="number" required min="0" value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} />
              <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
              <Input label="Keterangan / Sumber" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} className="md:col-span-2" />
              
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Unggah Bukti Transfer / Nota Belanja (Opsional)</label>
                <input type="file" accept="image/*" onChange={handleReceiptUpload} disabled={isCompressing} className="w-full text-xs text-slate-500 file:py-2 file:px-4 file:rounded-lg file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-500/10 dark:file:text-emerald-400 cursor-pointer" />
                {formData.receiptUrl && <p className="text-xs text-emerald-500 mt-1 font-semibold">✓ Nota/Bukti transfer berhasil dilampirkan.</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button variant="emerald" type="submit">Simpan Transaksi</Button></div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs border-b">
              <tr><th className="px-6 py-4">Tanggal & Kategori</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4">Bukti / Nota</th><th className="px-6 py-4 text-right">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono text-slate-500">{t.date}</div>
                    <Badge color="purple">{t.category || 'Kas Umum'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t.description}</td>
                  <td className="px-6 py-4">
                    {t.receiptUrl ? (
                      <a href={t.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-500 font-bold hover:underline">
                        <ImageIcon className="w-4 h-4"/> Lihat Nota
                      </a>
                    ) : <span className="text-xs text-slate-400">Tanpa Nota</span>}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}</td>
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {category === 'Sound System' && <Speaker className="w-8 h-8 text-amber-500" />}
            {category === 'Multimedia' && <Camera className="w-8 h-8 text-cyan-500" />}
            {category === 'Properti' && <Armchair className="w-8 h-8 text-indigo-500" />}
            Inventaris {category}
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
      </div>

      {selectedGearQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border">
            <button onClick={() => setSelectedGearQR(null)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-1">GEAR ID</h3>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedGearQR.qrCodeId || '')}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <h4 className="text-xl font-bold">{selectedGearQR.name}</h4>
            <p className="text-indigo-500 font-mono text-sm mt-1 font-bold">{selectedGearQR.qrCodeId}</p>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Peralatan" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Jumlah Unit" type="number" required min="1" value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select label="Kondisi Alat" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})} options={[{value:'Good',label:'Baik & Siap Pakai'},{value:'Needs Repair',label:'Perlu Servis'},{value:'Broken',label:'Rusak'}]} />
            <Input label="Lokasi" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="flex flex-col">
            <div className="flex justify-between items-start gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
              <Badge color={item.condition === 'Good' ? 'emerald' : item.condition === 'Needs Repair' ? 'amber' : 'rose'}>{item.condition}</Badge>
            </div>
            <div className="space-y-2 text-xs text-slate-500 mt-auto pt-2 border-t">
              <div className="flex justify-between"><span>Jumlah:</span><span className="font-bold text-slate-900 dark:text-white">{item.quantity} unit</span></div>
              <div className="flex justify-between"><span>Lokasi:</span><span>{item.location}</span></div>
              <div className="flex justify-between items-center pt-1">
                <button onClick={() => setSelectedGearQR(item)} className="text-indigo-500 font-bold flex items-center gap-1"><QrCode className="w-3.5 h-3.5"/> QR Code</button>
                <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button>
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
  const [formData, setFormData] = useState({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '', checkOutCondition: 'Baik & Normal' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGear = inventory.find((i: any) => i.id === formData.itemId);
    onAdd({ ...formData, itemName: selectedGear ? selectedGear.name : 'Gear', status: 'Pending' });
    setIsAdding(false);
    setFormData({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '', checkOutCondition: 'Baik & Normal' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><ArrowRightLeft className="w-8 h-8 text-indigo-500" /> Peminjaman & Check-in Kondisi</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan Peminjaman</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Pilih Peralatan" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih Alat --'}, ...inventory.map((i:any) => ({value:i.id, label:i.name}))]} />
            <Input label="Nama Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input label="Tgl Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tgl Kembali" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <Input label="Kondisi Fisik Saat Keluar (Check-out)" value={formData.checkOutCondition} onChange={(e:any) => setFormData({...formData, checkOutCondition: e.target.value})} />
            <Input label="Keperluan / Acara" value={formData.purpose} onChange={(e:any) => setFormData({...formData, purpose: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Kirim Pengajuan</Button></div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {borrowings.map((b: any) => {
          // Cek tanggal jatuh tempo untuk Notifikasi Otomatis
          const today = new Date();
          const endDate = new Date(b.endDate);
          const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          const isNearDue = b.status === 'Approved' && diffDays <= 2 && diffDays >= 0;

          return (
            <Card key={b.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isNearDue ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white text-base">{b.itemName}</p>
                  <Badge color={b.status === 'Approved' ? 'emerald' : b.status === 'Pending' ? 'amber' : b.status === 'Returned' ? 'cyan' : 'rose'}>{b.status}</Badge>
                  {isNearDue && <Badge color="amber">⚠️ Mendekati Tenggat Waktu ({diffDays} hari lagi)</Badge>}
                </div>
                <p className="text-xs text-slate-500">Peminjam: <b>{b.borrowerName}</b> • {b.startDate} s/d {b.endDate}</p>
                <p className="text-xs text-slate-400">Check-out Kondisi: {b.checkOutCondition || 'Baik'}</p>
              </div>

              <div className="flex gap-2 items-center">
                {b.status === 'Pending' && (
                  <>
                    <Button variant="emerald" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Approved')}>Approve</Button>
                    <Button variant="danger" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Rejected')}>Reject</Button>
                  </>
                )}
                {b.status === 'Approved' && (
                  <Button variant="secondary" className="text-xs py-1.5" onClick={() => {
                    const cond = prompt("Masukkan kondisi fisik saat dikembalikan (Check-in):", "Baik / Normal tanpa ada kerusakan");
                    if (cond !== null) onUpdateStatus(b.id, 'Returned', cond);
                  }}>Selesaikan / Kembali</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const CalendarView = ({ events, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service', description: '' });
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-cyan-500" /> Agenda Pelayanan
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Agenda</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); setIsAdding(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Acara" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Select label="Jenis" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'Service',label:'Ibadah'},{value:'Youth',label:'Pemuda'},{value:'Rehearsal',label:'Latihan'}]} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Jam" value={formData.time} onChange={(e:any) => setFormData({...formData, time: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: any) => (
          <Card key={e.id} className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Badge color="cyan">{e.type}</Badge>
                <span className="font-mono text-xs text-slate-500">{e.date}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{e.title}</h3>
              <p className="text-xs text-indigo-500 mt-2">📍 {e.location} • ⏰ {e.time}</p>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <button onClick={() => {
                fetch(PERMANENT_DISCORD_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content: `📅 **AGENDA KOMDA:** ${e.title} (${e.date} jam ${e.time}) di ${e.location}` })
                }).then(() => alert('Terkirim ke Discord!'));
              }} className="text-xs text-[#5865F2] font-bold flex items-center gap-1 hover:underline">
                <MessageSquare className="w-3.5 h-3.5" /> Kirim ke Discord
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const WorshipSongLibraryView = ({ songs, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-500" /> Database Lirik & Proyektor (Presenter Mode)
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Lagu</Button>
      </div>

      {isPresenterMode && selectedSong && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
          <button onClick={() => setIsPresenterMode(false)} className="absolute top-6 right-6 text-white bg-slate-800 p-3 rounded-full hover:bg-slate-700"><X className="w-8 h-8"/></button>
          <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4">Live Presenter Mode • Key: {selectedSong.key}</span>
          <h2 className="text-3xl font-black text-white mb-8">{selectedSong.title}</h2>
          <div className="max-w-4xl w-full max-h-[70vh] overflow-y-auto px-4">
            <p className="text-3xl md:text-5xl font-extrabold text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
              {selectedSong.lyrics.replace(/\[(.*?)\]/g, '')}
            </p>
          </div>
        </div>
      )}

      {selectedSong && !isPresenterMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border">
            <button onClick={() => setSelectedSong(null)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-2">{selectedSong.title}</h3>
            <Badge color="rose">Key: {selectedSong.key}</Badge>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl my-4 font-mono text-sm whitespace-pre-wrap">
              {selectedSong.lyrics}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="primary" onClick={() => setIsPresenterMode(true)}>
                <Monitor className="w-4 h-4" /> Buka Tampilan Proyektor (Presenter)
              </Button>
              <Button variant="secondary" onClick={() => setSelectedSong(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-rose-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); setIsAdding(false); setFormData({ title: '', key: 'C', lyrics: '' }); }} className="space-y-4">
            <div className="flex gap-4">
              <Input label="Judul Lagu" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} className="flex-1" />
              <Input label="Nada Dasar" required value={formData.key} onChange={(e:any) => setFormData({...formData, key: e.target.value})} className="w-24" />
            </div>
            <Textarea label="Lirik" rows={6} value={formData.lyrics} onChange={(e:any) => setFormData({...formData, lyrics: e.target.value})} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {songs.map((s: Song) => (
          <Card key={s.id} onClick={() => setSelectedSong(s)} className="cursor-pointer hover:border-rose-500/50">
            <Badge color="rose">Key: {s.key}</Badge>
            <h3 className="font-bold text-lg mt-2">{s.title}</h3>
            <p className="text-xs text-slate-500 mt-2 line-clamp-3 font-mono">{s.lyrics}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const LiturgyBuilderView = ({ liturgies, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [theme, setTheme] = useState('');
  const [preacher, setPreacher] = useState('');
  const [wl, setWl] = useState('');
  const [items, setItems] = useState<{ order: number; time: string; activity: string; leader: string; }[]>([]);

  const addItem = () => setItems([...items, { order: items.length + 1, time: '10 Menit', activity: 'Pujian Pembuka', leader: 'WL' }]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><FileText className="w-8 h-8 text-indigo-500" /> Susunan Liturgi Ibadah (Order of Service)</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Liturgi Baru</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd({ title, date, theme, preacher, wl, items }); setIsAdding(false); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Judul Ibadah" required value={title} onChange={(e:any) => setTitle(e.target.value)} placeholder="Ibadah Pemuda Raya" />
              <Input label="Tanggal" type="date" required value={date} onChange={(e:any) => setDate(e.target.value)} />
              <Input label="Tema Ibadah" value={theme} onChange={(e:any) => setTheme(e.target.value)} />
              <Input label="Pengkhotbah / Pendeta" value={preacher} onChange={(e:any) => setPreacher(e.target.value)} />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-sm mb-2">Susunan Acara</h3>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <span className="font-mono font-bold text-xs">#{item.order}</span>
                  <input className="bg-slate-50 dark:bg-slate-950 border rounded p-2 text-xs flex-1" placeholder="Nama Acara/Pujian" value={item.activity} onChange={(e) => {
                    const newItems = [...items]; newItems[idx].activity = e.target.value; setItems(newItems);
                  }} />
                  <input className="bg-slate-50 dark:bg-slate-950 border rounded p-2 text-xs w-32" placeholder="Petugas" value={item.leader} onChange={(e) => {
                    const newItems = [...items]; newItems[idx].leader = e.target.value; setItems(newItems);
                  }} />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addItem} className="mt-2"><Plus className="w-3.5 h-3.5"/> Tambah Baris Acara</Button>
            </div>

            <div className="flex justify-end gap-2 pt-4"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan Liturgi</Button></div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {liturgies?.map((l: LiturgyItem) => (
          <Card key={l.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Badge color="indigo">{l.date}</Badge>
                <h3 className="text-lg font-bold mt-1">{l.title}</h3>
                <p className="text-xs text-slate-500">Tema: {l.theme || '-'} • Pengkhotbah: {l.preacher || '-'}</p>
              </div>
              <Button variant="secondary" onClick={() => {
                const text = ` liturgical: ${l.title} (${l.date})\nTema: ${l.theme}\n\n` + l.items?.map((i:any) => `${i.order}. ${i.activity} (${i.leader})`).join('\n');
                navigator.clipboard.writeText(text);
                alert('Susunan liturgi disalin ke clipboard!');
              }}>Salin Teks</Button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs space-y-1">
              {l.items?.map((i:any, idx:number) => (
                <div key={idx} className="flex justify-between py-1 border-b last:border-0 border-slate-200 dark:border-slate-800">
                  <span><b>#{i.order}</b> {i.activity}</span>
                  <span className="text-slate-500 font-mono">Petugas: {i.leader}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PollsView = ({ polls, onAdd, onVote }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><Vote className="w-8 h-8 text-emerald-500" /> Polling & Voting Kepengurusan</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Polling</Button>
      </div>

      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd({ question, options: options.filter(o => o.trim() !== '').map(o => ({ text: o, votes: 0 })), voters: [], isOpen: true }); setIsAdding(false); }} className="space-y-4">
            <Input label="Pertanyaan Polling" required value={question} onChange={(e:any) => setQuestion(e.target.value)} placeholder="Mau pilih tema retret mana?" />
            <label className="block text-xs font-semibold uppercase">Pilihan Opsi:</label>
            {options.map((opt, idx) => (
              <Input key={idx} value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }} placeholder={`Opsi ${idx + 1}`} />
            ))}
            <Button type="button" variant="secondary" onClick={() => setOptions([...options, ''])}><Plus className="w-3.5 h-3.5"/> Tambah Opsi</Button>
            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button variant="emerald" type="submit">Publikasikan Polling</Button></div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {polls?.map((p: PollItem) => {
          const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <Card key={p.id} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.question}</h3>
              <div className="space-y-2">
                {p.options.map((opt, idx) => {
                  const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  return (
                    <div key={idx} onClick={() => onVote(p.id, idx)} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all" style={{ width: `${percent}%` }}></div>
                      <div className="flex justify-between items-center relative z-10 text-xs font-bold">
                        <span>{opt.text}</span>
                        <span className="font-mono">{opt.votes} suara ({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 text-right">Total suara masuk: {totalVotes}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const GuestBookView = ({ guests, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', churchOrigin: 'GKJ Slogohimo', visitDate: new Date().toISOString().split('T')[0], notes: '' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><BookOpen className="w-8 h-8 text-cyan-500" /> Buku Tamu & Absensi Simpatisan</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Tamu Baru</Button>
      </div>

      {isAdding && (
        <Card className="border-cyan-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); setIsAdding(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Kontak / WhatsApp" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} />
            <Input label="Asal Gereja / Komunitas" value={formData.churchOrigin} onChange={(e:any) => setFormData({...formData, churchOrigin: e.target.value})} />
            <Input label="Tanggal Kunjungan" type="date" value={formData.visitDate} onChange={(e:any) => setFormData({...formData, visitDate: e.target.value})} />
            <Textarea label="Catatan / Kesan" value={formData.notes} onChange={(e:any) => setFormData({...formData, notes: e.target.value})} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan Tamu</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guests?.map((g: GuestItem) => (
          <Card key={g.id}>
            <Badge color="cyan">{g.visitDate}</Badge>
            <h3 className="font-bold text-lg mt-2">{g.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Asal: {g.churchOrigin}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{g.contact}</p>
            {g.notes && <p className="text-xs italic bg-slate-50 dark:bg-slate-950 p-2 rounded mt-3">"{g.notes}"</p>}
          </Card>
        ))}
      </div>
    </div>
  );
};

const NavGroup = ({ title, isOpen, onToggle, children }: any) => {
  return (
    <div className="mb-2">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors group">
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
      </button>
      <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
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

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Rota[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [liturgies, setLiturgies] = useState<LiturgyItem[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [selectedGearQR, setSelectedGearQR] = useState<InventoryItem | null>(null);

  const currentUserRole = useMemo(() => {
    if (!user || !user.email) return 'Anggota';
    const emailLower = user.email.trim().toLowerCase();
    if (emailLower === OWNER_EMAIL.toLowerCase()) return 'Super Admin';
    const matchedMember = members.find(m => m.id === user.uid || m.contact?.toLowerCase() === emailLower);
    if (matchedMember && matchedMember.role === 'Super Admin') return 'Super Admin';
    return matchedMember ? matchedMember.role : 'Anggota';
  }, [user, members]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    utama: true,
    pelayanan: true,
    inventaris: true,
    sistem: true
  });

  const toggleMenu = (key: string) => setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const currentMemberProfile = useMemo(() => {
    if (!user) return null;
    return members.find((m: Member) => m.id === user.uid || m.contact?.toLowerCase() === user.email?.toLowerCase());
  }, [user, members]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

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
      onSnapshot(getColRef('tasks'), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }) as Task))),
      onSnapshot(getColRef('liturgies'), s => setLiturgies(s.docs.map(d => ({ id: d.id, ...d.data() }) as LiturgyItem))),
      onSnapshot(getColRef('polls'), s => setPolls(s.docs.map(d => ({ id: d.id, ...d.data() }) as PollItem))),
      onSnapshot(getColRef('guests'), s => setGuests(s.docs.map(d => ({ id: d.id, ...d.data() }) as GuestItem)))
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); };
  const handleUpdateDoc = async (colName: string, docId: string, data: any) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), data); };

  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { members: members.length, balance: income - expense, income, expense, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-sm font-semibold tracking-wider">Loading KOMDA HUB Engine...</p>
    </div>
  );

  if (!user) return <AuthView onAuthSuccess={(u) => setUser(u)} />;

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}>
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">KOMDA HUB</h1>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block -mt-1">Church Engine</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
          <NavGroup title="Utama" isOpen={expandedMenus.utama} onToggle={() => toggleMenu('utama')}>
            <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
            <NavItem icon={Trophy} label="Anggota & Leaderboard" view="members" isActive={currentView === 'members'} />
            <NavItem icon={DollarSign} label="Keuangan & Persembahan" view="finance" isActive={currentView === 'finance'} />
          </NavGroup>

          <NavGroup title="Pelayanan & Ibadah" isOpen={expandedMenus.pelayanan} onToggle={() => toggleMenu('pelayanan')}>
            <NavItem icon={CalendarDays} label="Jadwal Petugas" view="rota" isActive={currentView === 'rota'} />
            <NavItem icon={FileText} label="Susunan Liturgi" view="liturgy" isActive={currentView === 'liturgy'} />
            <NavItem icon={Music} label="Database Lirik & Proyektor" view="songs" isActive={currentView === 'songs'} />
            <NavItem icon={Heart} label="Direktori Doa" view="prayers" isActive={currentView === 'prayers'} />
            <NavItem icon={ListTodo} label="Papan Tugas" view="tasks" isActive={currentView === 'tasks'} />
          </NavGroup>

          <NavGroup title="Inventaris & Logistik" isOpen={expandedMenus.inventaris} onToggle={() => toggleMenu('inventaris')}>
            <NavItem icon={Speaker} label="Sound System" view="inventory_sound" isActive={currentView === 'inventory_sound'} />
            <NavItem icon={Camera} label="Multimedia" view="inventory_media" isActive={currentView === 'inventory_media'} />
            <NavItem icon={Armchair} label="Properti" view="inventory_property" isActive={currentView === 'inventory_property'} />
            <NavItem icon={ArrowRightLeft} label="Peminjaman & Check-in" view="borrowing" isActive={currentView === 'borrowing'} />
          </NavGroup>

          <NavGroup title="Komunitas & Sistem" isOpen={expandedMenus.sistem} onToggle={() => toggleMenu('sistem')}>
            <NavItem icon={CalendarIcon} label="Agenda Gereja" view="calendar" isActive={currentView === 'calendar'} />
            <NavItem icon={Vote} label="Polling & Voting" view="polls" isActive={currentView === 'polls'} />
            <NavItem icon={BookOpen} label="Buku Tamu Simpatisan" view="guests" isActive={currentView === 'guests'} />
            <NavItem icon={MessageSquare} label="Discord Broadcast" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <button onClick={() => signOut(auth)} className="w-full py-2 px-3 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 border border-rose-500/20">
            <LogOut className="w-3.5 h-3.5" /> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main 
        className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url('${DARK_WALLPAPER}')` }}
      >
        <header className="bg-slate-900/85 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
            <span className="text-sm font-black tracking-widest uppercase text-white">KOMDA HUB • GKJ SLOGOHIMO</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-lg font-bold border bg-purple-500/10 text-purple-400 border-purple-500/30">
              {currentUserRole}
            </span>

            <button onClick={() => setCurrentView('profile')} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {currentMemberProfile?.photoUrl ? <img src={currentMemberProfile.photoUrl} alt="P" className="w-full h-full object-cover" /> : user.email?.substring(0,2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline-block">{currentMemberProfile?.name || user.email?.split('@')[0]}</span>
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1 relative z-10">
          {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
          {currentView === 'profile' && <ProfileView user={user} members={members} onSaveProfile={(id:string, d:any) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', user.uid), d, {merge:true})} />}
          {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} onUpdateXP={(id: string, newXp: number) => handleUpdateDoc('members', id, { xp: newXp })} onUpdateMember={(id: string, data: any) => handleUpdateDoc('members', id, data)} currentUserRole={currentUserRole} />}
          {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} />}
          {currentView === 'inventory_sound' && <InventoryView category="Sound System" items={inventory.filter(i => i.category === 'Sound System')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          {currentView === 'inventory_media' && <InventoryView category="Multimedia" items={inventory.filter(i => i.category === 'Multimedia')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          {currentView === 'inventory_property' && <InventoryView category="Properti" items={inventory.filter(i => i.category === 'Properti')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} selectedGearQR={selectedGearQR} setSelectedGearQR={setSelectedGearQR} />}
          {currentView === 'borrowing' && <BorrowingView borrowings={borrowings} inventory={inventory} onAdd={(d: any) => handleAddDoc('borrowings', d)} onUpdateStatus={(id: string, s: string, cond?: string) => handleUpdateDoc('borrowings', id, { status: s, checkInCondition: cond || 'Baik' })} />}
          {currentView === 'calendar' && <CalendarView events={events} onAdd={(d: any) => handleAddDoc('events', d)} />}
          {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d: any) => handleAddDoc('songs', d)} onDelete={(id: string) => handleDeleteDoc('songs', id)} />}
          {currentView === 'liturgy' && <LiturgyBuilderView liturgies={liturgies} onAdd={(d: any) => handleAddDoc('liturgies', d)} />}
          {currentView === 'polls' && <PollsView polls={polls} onAdd={(d: any) => handleAddDoc('polls', d)} onVote={async (pollId: string, optIdx: number) => {
            const poll = polls.find(p => p.id === pollId);
            if (!poll) return;
            if (poll.voters?.includes(user.uid)) { alert('Anda sudah memberikan suara pada polling ini!'); return; }
            const newOpts = [...poll.options];
            newOpts[optIdx].votes += 1;
            await handleUpdateDoc('polls', pollId, { options: newOpts, voters: [...(poll.voters || []), user.uid] });
          }} />}
          {currentView === 'guests' && <GuestBookView guests={guests} onAdd={(d: any) => handleAddDoc('guests', d)} />}
        </div>
      </main>
    </div>
  );
}
