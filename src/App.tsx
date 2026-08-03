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
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; eventQrId?: string; }
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
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        } else {
          if (height > maxWidth) { width = Math.round((width * maxWidth) / height); height = maxWidth; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
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
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-white mx-auto flex items-center justify-center mb-4 border border-slate-700">
          <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-wider text-white">KOMDA HUB</h1>
        <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mt-1 mb-8">GKJ Slogohimo Engine</p>

        {error && <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">{error}</div>}

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm cursor-pointer disabled:opacity-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
        </button>
      </div>
    </div>
  );
};

const DashboardView = ({ stats, events, onNavigate }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Dashboard Utama
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Ringkasan aktivitas dan status pelayanan KOMDA.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => onNavigate('members')} className="border-t-4 border-t-indigo-500">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total Anggota</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.members || 0}</p>
        </Card>
        <Card onClick={() => onNavigate('finance')} className="border-t-4 border-t-emerald-500">
          <p className="text-slate-500 text-xs font-semibold uppercase">Saldo Kas</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card onClick={() => onNavigate('inventory_sound')} className="border-t-4 border-t-amber-500">
          <p className="text-slate-500 text-xs font-semibold uppercase">Inventaris Gear</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.inventory || 0}</p>
        </Card>
        <Card onClick={() => onNavigate('calendar')} className="border-t-4 border-t-cyan-500">
          <p className="text-slate-500 text-xs font-semibold uppercase">Agenda Pelayanan</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{events?.length || 0}</p>
        </Card>
      </div>
    </div>
  );
};

const ProfileView = ({ user, members, onSaveProfile }: any) => {
  const currentMember = useMemo(() => members.find((m: Member) => m.id === user?.uid || m.contact?.toLowerCase() === user?.email?.toLowerCase()), [user, members]);
  const [formData, setFormData] = useState({
    name: currentMember?.name || user?.email?.split('@')[0] || '',
    division: currentMember?.division || 'Youth',
    contact: currentMember?.contact || user?.email || '',
    photoUrl: currentMember?.photoUrl || ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onSaveProfile(user.uid, { ...formData, role: currentMember?.role || 'Anggota', xp: currentMember?.xp || 10, qrId: currentMember?.qrId || 'MEMBER-123' });
    setSuccessMsg('Profil berhasil disimpan!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <UserCheck className="w-8 h-8 text-indigo-500" /> Profil Saya
      </h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
          <Input label="Divisi Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} />
          <Input label="Kontak WhatsApp" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} />
          {successMsg && <p className="text-emerald-500 text-xs font-bold">{successMsg}</p>}
          <Button type="submit"><Save className="w-4 h-4" /> Simpan Profil</Button>
        </form>
      </Card>
    </div>
  );
};

const MembersView = ({ members, onAdd, onDelete, onUpdateXP, currentUserRole }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });
  const [isScanning, setIsScanning] = useState(false);
  const [activeQRMember, setActiveQRMember] = useState<Member | null>(null);

  const isSuperAdmin = currentUserRole === 'Super Admin';

  useEffect(() => {
    if (!isScanning) return;
    // @ts-ignore
    if (window.Html5QrcodeScanner) {
      // @ts-ignore
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setIsScanning(false);
          const foundMember = members.find((m: Member) => m.qrId === decodedText || decodedText.includes(m.qrId || ''));
          if (foundMember) {
            onUpdateXP(foundMember.id, (foundMember.xp || 0) + 10);
            alert(`Presensi Berhasil! ${foundMember.name} mendapatkan +10 XP.`);
          } else {
            alert(`QR Code terdeteksi, namun anggota tidak ditemukan.`);
          }
        },
        () => {}
      );
      return () => { try { scanner.clear(); } catch(e) {} };
    }
  }, [isScanning, members, onUpdateXP]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" /> Leaderboard & Anggota
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsScanning(true)}><ScanLine className="w-4 h-4" /> Scan Presensi Anggota</Button>
          {isSuperAdmin && <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>}
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full relative">
            <button onClick={() => setIsScanning(false)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-lg font-bold mb-4">Scan QR Anggota</h3>
            <div id="reader" className="overflow-hidden rounded-xl"></div>
          </div>
        </div>
      )}

      {activeQRMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center relative">
            <button onClick={() => setActiveQRMember(null)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-1">KOMDA ID</h3>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeQRMember.qrId || '')}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <h4 className="text-xl font-bold">{activeQRMember.name}</h4>
            <p className="text-indigo-500 font-mono text-sm mt-1 font-bold">{activeQRMember.qrId}</p>
            <Button onClick={() => {
              const link = document.createElement('a');
              link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeQRMember.qrId || '')}`;
              link.download = `QR-${activeQRMember.name}.png`;
              link.click();
            }} variant="secondary" className="w-full mt-4"><Download className="w-4 h-4"/> Download QR</Button>
          </div>
        </div>
      )}

      {isAdding && isSuperAdmin && (
        <Card className="border-indigo-500/50">
          <form onSubmit={(e) => {
            e.preventDefault();
            onAdd({ ...formData, qrId: `MEMBER-${Math.floor(100000 + Math.random()*900000)}`, joinDate: new Date().toISOString() });
            setIsAdding(false);
          }} className="space-y-4">
            <Input label="Nama" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Select label="Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} options={[{value:'Anggota',label:'Anggota'},{value:'Super Admin',label:'Super Admin'}]} />
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      )}

      <div className="bg-white/95 dark:bg-slate-900/95 border rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-950 text-xs uppercase font-semibold">
            <tr><th className="px-6 py-4">Peringkat</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4 text-center">XP</th><th className="px-6 py-4 text-right">QR ID</th></tr>
          </thead>
          <tbody className="divide-y">
            {members.sort((a:any, b:any) => (b.xp || 0) - (a.xp || 0)).map((m: any, idx: number) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-bold">#{idx + 1}</td>
                <td className="px-6 py-4 font-semibold">{m.name}</td>
                <td className="px-6 py-4 text-center font-mono font-bold text-emerald-500">{m.xp || 0} XP</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setActiveQRMember(m)} className="text-indigo-500 text-xs font-bold flex items-center justify-end gap-1 ml-auto">
                    <QrCode className="w-4 h-4"/> Lihat QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinanceView = ({ transactions, onAdd, stats }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0], category: 'Kas Umum KOMDA' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><DollarSign className="w-8 h-8 text-emerald-500" /> Keuangan & Kas</h2>
        <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Kas</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-xs uppercase text-slate-500">Pemasukan</p><p className="text-xl font-bold text-emerald-500">Rp {(stats?.income || 0).toLocaleString('id-ID')}</p></Card>
        <Card><p className="text-xs uppercase text-slate-500">Pengeluaran</p><p className="text-xl font-bold text-rose-500">Rp {(stats?.expense || 0).toLocaleString('id-ID')}</p></Card>
        <Card><p className="text-xs uppercase text-slate-500">Saldo</p><p className="text-xl font-bold">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p></Card>
      </div>
      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd({ ...formData, amount: parseFloat(formData.amount) || 0 }); setIsAdding(false); }} className="space-y-4">
            <Select label="Jenis" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'income',label:'Pemasukan (+)'},{value:'expense',label:'Pengeluaran (-)'}]} />
            <Input label="Jumlah (Rp)" type="number" required value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} />
            <Input label="Keterangan" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
            <Button variant="emerald" type="submit">Simpan</Button>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-950 text-xs font-semibold">
            <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4 text-right">Jumlah</th></tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((t: any) => (
              <tr key={t.id}>
                <td className="px-6 py-4 text-xs font-mono">{t.date}</td>
                <td className="px-6 py-4 font-semibold">{t.description}</td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>Rp {t.amount.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const InventoryView = ({ category, items, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', condition: 'Good', quantity: 1, location: 'Gereja' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Inventaris {category}</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah</Button>
      </div>
      {isAdding && (
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); onAdd({ ...formData, category, quantity: Number(formData.quantity) }); setIsAdding(false); }} className="space-y-4">
            <Input label="Nama" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-3 gap-4">
        {items.map((i: any) => (
          <Card key={i.id} className="flex justify-between items-center">
            <div><h3 className="font-bold">{i.name}</h3><p className="text-xs text-slate-500">{i.quantity} unit • {i.location}</p></div>
            <button onClick={() => onDelete(i.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BorrowingView = ({ borrowings, inventory, onAdd, onUpdateStatus }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ itemId: '', borrowerName: '', startDate: '', endDate: '' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Peminjaman</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan</Button>
      </div>
      {isAdding && (
        <Card>
          <form onSubmit={(e) => {
            e.preventDefault();
            const g = inventory.find((x:any) => x.id === formData.itemId);
            onAdd({ ...formData, itemName: g ? g.name : 'Gear', status: 'Pending' });
            setIsAdding(false);
          }} className="space-y-4">
            <Select label="Barang" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih --'}, ...inventory.map((x:any)=>({value:x.id, label:x.name}))]} />
            <Input label="Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input label="Tgl Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tgl Kembali" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <Button type="submit">Kirim</Button>
          </form>
        </Card>
      )}
      <div className="space-y-3">
        {borrowings.map((b: any) => (
          <Card key={b.id} className="flex justify-between items-center">
            <div><p className="font-bold">{b.itemName}</p><p className="text-xs text-slate-500">Peminjam: {b.borrowerName} • Status: {b.status}</p></div>
            {b.status === 'Pending' && <Button variant="emerald" onClick={() => onUpdateStatus(b.id, 'Approved')}>Approve</Button>}
          </Card>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ events, onAdd, onUpdateXP, members }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service' });
  const [activeEventQR, setActiveEventQR] = useState<EventItem | null>(null);
  const [isEventScanning, setIsEventScanning] = useState(false);

  useEffect(() => {
    if (!isEventScanning) return;
    // @ts-ignore
    if (window.Html5QrcodeScanner) {
      // @ts-ignore
      const scanner = new Html5QrcodeScanner("event-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setIsEventScanning(false);
          if (decodedText.startsWith("MEMBER-")) {
            const foundMember = members.find((m: Member) => m.qrId === decodedText);
            if (foundMember) {
              onUpdateXP(foundMember.id, (foundMember.xp || 0) + 15);
              alert(`Check-in Agenda Berhasil! ${foundMember.name} mendapatkan +15 XP.`);
            } else {
              alert("QR Member tidak terdaftar di sistem.");
            }
          } else {
            alert("QR Code tidak valid untuk presensi acara.");
          }
        },
        () => {}
      );
      return () => { try { scanner.clear(); } catch(e) {} };
    }
  }, [isEventScanning, members, onUpdateXP]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-cyan-500" /> Agenda Gereja & QR Check-in
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEventScanning(true)}>
            <ScanLine className="w-4 h-4" /> Scan QR Check-in Peserta
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Agenda</Button>
        </div>
      </div>

      {isEventScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full relative">
            <button onClick={() => setIsEventScanning(false)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-lg font-bold mb-4">Scan QR Member untuk Check-in Agenda</h3>
            <div id="event-qr-reader" className="overflow-hidden rounded-xl"></div>
          </div>
        </div>
      )}

      {activeEventQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center relative">
            <button onClick={() => setActiveEventQR(null)} className="absolute top-4 right-4"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-1">QR CHECK-IN</h3>
            <p className="text-xs text-slate-500 mb-4">{activeEventQR.title}</p>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-cyan-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`AGENDA-${activeEventQR.id}-${activeEventQR.title}`)}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <p className="text-xs text-slate-400 mb-4">Peserta dapat menscan kode ini atau panitia menscan kartu ID member untuk mencatat kehadiran acara (+15 XP).</p>
            <Button onClick={() => {
              const link = document.createElement('a');
              link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`AGENDA-${activeEventQR.id}-${activeEventQR.title}`)}`;
              link.download = `QR-Agenda-${activeEventQR.title.replace(/\s+/g, '_')}.png`;
              link.click();
            }} variant="secondary" className="w-full"><Download className="w-4 h-4"/> Download QR Agenda</Button>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={(e) => { e.preventDefault(); onAdd({ ...formData, eventQrId: `EVT-${Math.floor(1000+Math.random()*9000)}` }); setIsAdding(false); }} className="space-y-4">
            <Input label="Judul Acara" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: any) => (
          <Card key={e.id} className="flex flex-col justify-between">
            <div>
              <Badge color="cyan">{e.type}</Badge>
              <h3 className="font-bold text-lg mt-2">{e.title}</h3>
              <p className="text-xs text-slate-500 mt-1">📅 {e.date} • ⏰ {e.time}</p>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <button onClick={() => setActiveEventQR(e)} className="text-cyan-500 text-xs font-bold flex items-center gap-1">
                <QrCode className="w-4 h-4"/> Tampilkan QR Check-in
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const WorshipSongLibraryView = ({ songs, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Database Pujian</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah</Button>
      </div>
      {isAdding && (
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); setIsAdding(false); }} className="space-y-4">
            <Input label="Judul" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-3 gap-4">
        {songs.map((s: any) => (
          <Card key={s.id}><Badge color="rose">Key: {s.key}</Badge><h3 className="font-bold mt-2">{s.title}</h3></Card>
        ))}
      </div>
    </div>
  );
};

const LiturgyBuilderView = ({ liturgies, onAdd }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Susunan Liturgi Ibadah</h2>
      <Card><p className="text-slate-500 text-sm">Gunakan menu ini untuk menyusun acara liturgi mingguan.</p></Card>
    </div>
  );
};

const PollsView = ({ polls, onAdd, onVote }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Polling & Voting</h2>
      {polls?.map((p: any) => (
        <Card key={p.id}><h3 className="font-bold">{p.question}</h3></Card>
      ))}
    </div>
  );
};

const GuestBookView = ({ guests, onAdd }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Buku Tamu Simpatisan</h2>
      <Card><p className="text-slate-500 text-sm">Daftar kehadiran jemaat baru / simpatisan.</p></Card>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [liturgies, setLiturgies] = useState<LiturgyItem[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);

  const currentUserRole = useMemo(() => {
    if (!user || !user.email) return 'Anggota';
    if (user.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) return 'Super Admin';
    const m = members.find(x => x.id === user.uid || x.contact?.toLowerCase() === user.email?.toLowerCase());
    return m ? m.role : 'Anggota';
  }, [user, members]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const getCol = (name: string) => collection(db, 'artifacts', appId, 'public', 'data', name);
    const unsubs = [
      onSnapshot(getCol('members'), s => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }) as Member))),
      onSnapshot(getCol('transactions'), s => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }) as Transaction))),
      onSnapshot(getCol('inventory'), s => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }) as InventoryItem))),
      onSnapshot(getCol('borrowings'), s => setBorrowings(s.docs.map(d => ({ id: d.id, ...d.data() }) as BorrowingRequest))),
      onSnapshot(getCol('events'), s => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() }) as EventItem))),
      onSnapshot(getCol('songs'), s => setSongs(s.docs.map(d => ({ id: d.id, ...d.data() }) as Song))),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  const handleAdd = async (col: string, data: any) => { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), data); };
  const handleDelete = async (col: string, id: string) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); };
  const handleUpdate = async (col: string, id: string, data: any) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), data); };

  const dashboardStats = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    return { members: members.length, balance: inc - exp, income: inc, expense: exp, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  if (!user) return <AuthView onAuthSuccess={(u) => setUser(u)} />;

  const NavItem = ({ icon: Icon, label, view }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium ${currentView === view ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans flex dark bg-slate-950 text-slate-100">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-lg font-black text-white">KOMDA HUB</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X className="w-5 h-5"/></button>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
          <NavItem icon={Trophy} label="Leaderboard & Anggota" view="members" />
          <NavItem icon={DollarSign} label="Keuangan Kas" view="finance" />
          <NavItem icon={CalendarIcon} label="Agenda Gereja (QR Check-in)" view="calendar" />
          <NavItem icon={Music} label="Database Lirik" view="songs" />
          <NavItem icon={FileText} label="Susunan Liturgi" view="liturgy" />
          <NavItem icon={Vote} label="Polling & Voting" view="polls" />
          <NavItem icon={BookOpen} label="Buku Tamu" view="guests" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => signOut(auth)} className="w-full py-2 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg">Keluar</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden"><Menu className="w-6 h-6"/></button>
          <span className="text-xs px-3 py-1 rounded-lg font-bold bg-purple-500/10 text-purple-400">{currentUserRole}</span>
        </header>

        {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
        {currentView === 'profile' && <ProfileView user={user} members={members} onSaveProfile={(id:string, d:any)=>setDoc(doc(db,'artifacts',appId,'public','data','members',id),d,{merge:true})} />}
        {currentView === 'members' && <MembersView members={members} onAdd={(d:any)=>handleAdd('members',d)} onDelete={(id:string)=>handleDelete('members',id)} onUpdateXP={(id:string,xp:number)=>handleUpdate('members',id,{xp})} currentUserRole={currentUserRole} />}
        {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d:any)=>handleAdd('transactions',d)} />}
        {currentView === 'calendar' && <CalendarView events={events} onAdd={(d:any)=>handleAdd('events',d)} onUpdateXP={(id:string,xp:number)=>handleUpdate('members',id,{xp})} members={members} />}
        {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d:any)=>handleAdd('songs',d)} />}
        {currentView === 'liturgy' && <LiturgyBuilderView liturgies={liturgies} onAdd={(d:any)=>handleAdd('liturgies',d)} />}
        {currentView === 'polls' && <PollsView polls={polls} onAdd={(d:any)=>handleAdd('polls',d)} />}
        {currentView === 'guests' && <GuestBookView guests={guests} onAdd={(d:any)=>handleAdd('guests',d)} />}
      </main>
    </div>
  );
}
