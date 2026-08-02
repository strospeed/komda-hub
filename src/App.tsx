import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
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
  FileText, LayoutDashboard, Plus, Trash2, CheckCircle, XCircle,
  Menu, X, ArrowRightLeft, Trophy, MessageSquare, Sparkles, Send,
  QrCode, Download, Sun, Moon, Music, CalendarDays, Heart, ListTodo, ScanLine, Info, ChevronDown
} from 'lucide-react';

export const DISCORD_INVITE_CODE = 'uEac8TZxec';
export const DISCORD_INVITE_URL = `https://discord.gg/${DISCORD_INVITE_CODE}`;
export const CHURCH_WEBSITE_URL = 'https://www.gkjslogohimo.web.id/';

const LOGO_URL = "https://scontent.cdninstagram.com/v/t51.82787-19/670185764_18404537299198608_3466022258141293919_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=108&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=fT8-QoF7sGAQ7kNvwG0YQl8&_nc_oc=AdriMEhEnYQIPNWxsshVgq4awx68DrA7n_3KkfQFiP0zhIhNCEfLmo2s5-U-E-Ye6cw&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=stV9ZRyT4yRV4ZTzPFPOrg&_nc_ss=7b6a8&oh=00_AQHN3R0HJWbuIvSDRWDJ2WbmT8UNXJQY__b5tuHSxuvyjw&oe=6A751827";

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

export type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'songs' | 'rota' | 'prayers' | 'tasks';

interface Member { id: string; name: string; role: string; division: string; contact: string; joinDate: string; xp: number; qrId?: string; }
export interface Transaction { id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; category: string; }
type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';
interface InventoryItem { id: string; name: string; category: InventoryCategory; condition: 'Good' | 'Needs Repair' | 'Broken'; quantity: number; location: string; qrCodeId?: string; }
export interface BorrowingRequest { id: string; itemId: string; itemName: string; borrowerName: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Returned'; purpose?: string; }
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; }
export interface Song { id: string; title: string; key: string; lyrics: string; }
export interface Rota { id: string; date: string; event: string; wl: string; musicians: string; multimedia: string; }
export interface Prayer { id: string; author: string; content: string; date: string; prayCount: number; }
export interface Task { id: string; title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done'; event: string; }

// Komponen Card dengan warna dinamis manual agar aman dari bug CDN Tailwind
const Card = ({ children, className = '', onClick, isDark }: any) => (
  <div onClick={onClick} className={`${isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'} border rounded-2xl p-5 shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1' : ''} ${className}`}>
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

const Input = ({ label, isDark, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <input {...props} className={`w-full ${isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-lg px-4 py-2.5 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm`} />
  </div>
);

const Select = ({ label, options, isDark, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <select {...props} className={`w-full ${isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm appearance-none`}>
      {options.map((opt: any) => <option key={opt.value} value={opt.value} className={`${isDark ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-900'}`}>{opt.label}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, isDark, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <textarea {...props} className={`w-full ${isDark ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-lg px-4 py-2.5 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm`} />
  </div>
);

export const Badge = ({ children, color = 'indigo' }: { children: React.ReactNode; color?: string; }) => {
  const styles: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.indigo}`}>{children}</span>;
};

const DashboardView = ({ stats, events, onNavigate, isDark }: any) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight flex items-center gap-3`}>
          <LayoutDashboard className="w-8 h-8 text-indigo-500" /> Dashboard Utama
        </h2>
        <p className="text-slate-400 text-sm mt-1">Ringkasan aktivitas dan status pelayanan KOMDA.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card isDark={isDark} onClick={() => onNavigate('members')} className="border-t-4 border-t-indigo-500">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Anggota</p>
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>{stats.members}</p>
        </Card>
        <Card isDark={isDark} onClick={() => onNavigate('finance')} className="border-t-4 border-t-emerald-500">
           <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Kas</p>
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>Rp {stats.balance.toLocaleString('id-ID')}</p>
        </Card>
        <Card isDark={isDark} onClick={() => onNavigate('inventory_sound')} className="border-t-4 border-t-amber-500">
          <div className="flex items-center gap-3 mb-2">
            <Speaker className="w-5 h-5 text-amber-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Inventaris Gear</p>
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>{stats.inventory}</p>
        </Card>
        <Card isDark={isDark} onClick={() => onNavigate('calendar')} className="border-t-4 border-t-cyan-500">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-5 h-5 text-cyan-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Agenda Pelayanan</p>
          </div>
          <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>{events.length}</p>
        </Card>
    </div>
  </div>
);

const MembersView = ({ members, onAdd, onDelete, onUpdateXP, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });
  const [selectedQR, setSelectedQR] = useState<Member | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    const scannerId = "reader";
    // @ts-ignore
    if (window.Html5QrcodeScanner) {
      // @ts-ignore
      const scanner = new Html5QrcodeScanner(scannerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setIsScanning(false);
          const foundMember = members.find((m: Member) => m.qrId === decodedText);
          if (foundMember) {
            onUpdateXP(foundMember.id, (foundMember.xp || 0) + 10);
            alert(`Berhasil! Kehadiran ${foundMember.name} dicatat (+10 XP).`);
          } else {
            alert(`QR Code terdeteksi: "${decodedText}", tetapi anggota tidak terdaftar.`);
          }
        },
        () => {}
      );
      return () => { try { scanner.clear(); } catch (e) {} };
    }
  }, [isScanning, members, onUpdateXP]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qrId = `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, joinDate: new Date().toISOString(), xp: Number(formData.xp) || 0, qrId });
    setIsAdding(false);
    setFormData({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0)), [members]);
  const getRoleColor = (role: string) => role === 'Super Admin' ? 'purple' : role === 'Ketua' || role === 'Pengurus' ? 'indigo' : role === 'Bendahara' ? 'emerald' : role === 'PJ Sound' ? 'amber' : role === 'PJ Media' ? 'cyan' : 'slate';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight flex items-center gap-3`}>
            <Trophy className="w-8 h-8 text-amber-500" /> Anggota & Kartu ID
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manajemen anggota, XP pelayanan, dan ID QR Code (Absensi).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsScanning(true)}><ScanLine className="w-4 h-4" /> Scan Presensi</Button>
          <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-3xl p-6 max-w-md w-full shadow-2xl relative`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Arahkan Kamera ke QR Code</h3>
              <button onClick={() => setIsScanning(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            <div id="reader" className="overflow-hidden rounded-xl bg-slate-950"></div>
          </div>
        </div>
      )}

      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative`}>
            <button onClick={() => setSelectedQR(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black uppercase tracking-wider mb-1">KOMDA ID</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">{selectedQR.division} Division</p>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQR.qrId || 'MEMBER-DEFAULT'}`} alt="QR" className="w-48 h-48 object-contain" />
            </div>
            <h4 className="text-xl font-bold">{selectedQR.name}</h4>
            <p className="text-indigo-400 font-mono text-sm mt-2 font-bold tracking-widest">{selectedQR.qrId || 'MEMBER-XXXXXX'}</p>
            <div className="mt-6">
              <Button onClick={() => onUpdateXP(selectedQR.id, (selectedQR.xp || 0) + 10)} variant="emerald" className="w-full">
                <CheckCircle className="w-4 h-4" /> Hadir (+10 XP)
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card isDark={isDark} className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isDark={isDark} label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Select isDark={isDark} label="Jabatan/Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} options={[{value:'Anggota',label:'Anggota'},{value:'Pengurus',label:'Pengurus'},{value:'PJ Sound',label:'PJ Sound'},{value:'PJ Media',label:'PJ Media'},{value:'Bendahara',label:'Bendahara'},{value:'Ketua',label:'Ketua'},{value:'Super Admin',label:'Super Admin'}]} />
            <Input isDark={isDark} label="Divisi" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} />
            <Input isDark={isDark} label="Kontak" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} />
            <Input isDark={isDark} label="XP Poin" type="number" min="0" value={formData.xp} onChange={(e:any) => setFormData({...formData, xp: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Card>
      )}

      <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden shadow-xl`}>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <thead className={`${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'} font-semibold text-xs uppercase tracking-wider border-b`}>
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Nama & ID</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4 text-center">XP</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {sortedMembers.map((member: Member, index: number) => {
                const maxXP = sortedMembers[0]?.xp || 100;
                const progressPercent = Math.min(100, Math.round(((member.xp || 0) / maxXP) * 100));
                return (
                  <tr key={member.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4 font-bold">#{index + 1}</td>
                    <td className={`px-6 py-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <div>{member.name}</div>
                      <button onClick={() => setSelectedQR(member)} className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono mt-0.5">
                        <QrCode className="w-3 h-3"/> Tampilkan QR ID
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getRoleColor(member.role)}>{member.role}</Badge>
                      <div className="text-xs text-slate-400 mt-1">{member.division}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 mx-auto">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-mono font-bold text-emerald-400">{member.xp || 0} XP</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-slate-950' : 'bg-slate-200'} rounded-full h-1.5 overflow-hidden`}>
                          <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDelete(member.id)} className="text-slate-400 hover:text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
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

const FinanceView = ({ transactions, onAdd, stats, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', category: 'Persembahan', date: new Date().toISOString().split('T')[0] });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, amount: parseFloat(formData.amount) || 0 });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', category: 'Persembahan', date: new Date().toISOString().split('T')[0] });
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}><DollarSign className="w-8 h-8 text-emerald-500" /> Keuangan & Kas</h2>
        <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Transaksi</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card isDark={isDark}><p className="text-slate-400 text-xs font-semibold uppercase">Pemasukan</p><p className="text-2xl font-extrabold text-emerald-400 mt-1">Rp {stats.income.toLocaleString('id-ID')}</p></Card>
        <Card isDark={isDark}><p className="text-slate-400 text-xs font-semibold uppercase">Pengeluaran</p><p className="text-2xl font-extrabold text-rose-400 mt-1">Rp {stats.expense.toLocaleString('id-ID')}</p></Card>
        <Card isDark={isDark}><p className="text-slate-400 text-xs font-semibold uppercase">Saldo</p><p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>Rp {stats.balance.toLocaleString('id-ID')}</p></Card>
      </div>
      {isAdding && (
        <Card isDark={isDark} className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select isDark={isDark} label="Jenis" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'income',label:'Pemasukan (+)'},{value:'expense',label:'Pengeluaran (-)'}]} />
            <Input isDark={isDark} label="Jumlah (Rp)" type="number" required value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} />
            <Input isDark={isDark} label="Keterangan" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
            <Input isDark={isDark} label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button variant="emerald" type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
    </div>
  );
};

const InventoryView = ({ category, items, onAdd, onDelete, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', condition: 'Good', quantity: 1, location: 'Gereja' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, category, quantity: Number(formData.quantity) || 1, qrCodeId: `QR-${Math.floor(1000 + Math.random() * 9000)}` });
    setIsAdding(false);
    setFormData({ name: '', condition: 'Good', quantity: 1, location: 'Gereja' });
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventaris {category}</h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
      </div>
      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isDark={isDark} label="Nama Gear" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input isDark={isDark} label="Jumlah" type="number" required value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select isDark={isDark} label="Kondisi" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})} options={[{value:'Good',label:'Baik'},{value:'Needs Repair',label:'Perlu Servis'},{value:'Broken',label:'Rusak'}]} />
            <Input isDark={isDark} label="Lokasi" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} isDark={isDark}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h3>
              <Badge color={item.condition === 'Good' ? 'emerald' : 'amber'}>{item.condition}</Badge>
            </div>
            <p className="text-xs text-slate-400">Jumlah: {item.quantity} unit • Lokasi: {item.location}</p>
            <div className="mt-4 flex justify-end"><button onClick={() => onDelete(item.id)} className="text-rose-400 p-1"><Trash2 className="w-4 h-4"/></button></div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BorrowingView = ({ borrowings, inventory, onAdd, onUpdateStatus, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ itemId: '', borrowerName: '', startDate: '', endDate: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gear = inventory.find((i:any) => i.id === formData.itemId);
    onAdd({ ...formData, itemName: gear ? gear.name : 'Gear', status: 'Pending' });
    setIsAdding(false);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Peminjaman</h2><Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan</Button></div>
      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select isDark={isDark} label="Barang" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih --'}, ...inventory.map((i:any)=>({value:i.id, label:i.name}))]} />
            <Input isDark={isDark} label="Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input isDark={isDark} label="Mulai" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input isDark={isDark} label="Selesai" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <div className="md:col-span-2 flex justify-end"><Button type="submit">Kirim</Button></div>
          </form>
        </Card>
      )}
      <div className="space-y-3">
        {borrowings.map((b:any)=>(
          <Card key={b.id} isDark={isDark} className="flex justify-between items-center">
            <div><p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.itemName}</p><p className="text-xs text-slate-400">Peminjam: {b.borrowerName}</p></div>
            <div className="flex gap-2">
              {b.status === 'Pending' && <><Button variant="emerald" onClick={()=>onUpdateStatus(b.id, 'Approved')}>Approve</Button><Button variant="danger" onClick={()=>onUpdateStatus(b.id, 'Rejected')}>Reject</Button></>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ events, onAdd, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00', location: 'Gereja', type: 'Service' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Agenda</h2><Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah</Button></div>
      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={(e)=>{e.preventDefault(); onAdd(formData); setIsAdding(false);}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isDark={isDark} label="Judul" required value={formData.title} onChange={(e:any)=>setFormData({...formData, title:e.target.value})} />
            <Input isDark={isDark} label="Tanggal" type="date" required value={formData.date} onChange={(e:any)=>setFormData({...formData, date:e.target.value})} />
            <div className="md:col-span-2 flex justify-end"><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e:any)=>(
          <Card key={e.id} isDark={isDark}><h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.title}</h3><p className="text-xs text-indigo-400">{e.date} • {e.location}</p></Card>
        ))}
      </div>
    </div>
  );
};

const DiscordWebhookView = ({ isDark }: any) => (
  <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
    <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Discord Broadcast</h2>
    <Card isDark={isDark}>
      <Input isDark={isDark} label="Webhook URL" />
      <Textarea isDark={isDark} label="Pesan" rows={4} />
      <Button variant="discord" className="w-full"><Send className="w-4 h-4" /> Kirim</Button>
    </Card>
  </div>
);

const WorshipSongLibraryView = ({ songs, onAdd, onDelete, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [transposeStep, setTransposeStep] = useState(0);
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });

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
        <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}>
          <Music className="w-8 h-8 text-rose-500" /> Database Pujian
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Lagu</Button>
      </div>

      {selectedSong && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative`}>
            <button onClick={() => { setSelectedSong(null); setTransposeStep(0); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"><X className="w-6 h-6"/></button>
            <div className="flex justify-between items-center mb-4">
              <Badge color="rose">Original Key: {selectedSong.key}</Badge>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setTransposeStep(prev => prev - 1)} className="px-2.5 py-1 text-xs font-bold bg-slate-700 rounded-lg">-</button>
                <button onClick={() => setTransposeStep(0)} className="px-2.5 py-1 text-xs font-bold text-slate-300">Reset</button>
                <button onClick={() => setTransposeStep(prev => prev + 1)} className="px-2.5 py-1 text-xs font-bold bg-slate-700 rounded-lg">+</button>
              </div>
            </div>
            <h3 className="text-2xl font-black mb-4">{selectedSong.title}</h3>
            <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border`}>
              <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {getTransformedLyrics(selectedSong.lyrics || '')}
              </pre>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <Button variant="danger" onClick={() => { if(confirm('Hapus?')) { onDelete(selectedSong.id); setSelectedSong(null); } }}>Hapus</Button>
              <Button variant="secondary" onClick={() => setSelectedSong(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={(e)=>{e.preventDefault(); onAdd(formData); setIsAdding(false); setFormData({title:'', key:'C', lyrics:''});}} className="space-y-4">
            <div className="flex gap-4">
              <Input isDark={isDark} label="Judul" required value={formData.title} onChange={(e:any)=>setFormData({...formData, title:e.target.value})} className="flex-1" />
              <Input isDark={isDark} label="Key" required value={formData.key} onChange={(e:any)=>setFormData({...formData, key:e.target.value})} className="w-24" />
            </div>
            <Textarea isDark={isDark} label="Lirik & Chord [C]" rows={6} value={formData.lyrics} onChange={(e:any)=>setFormData({...formData, lyrics:e.target.value})} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={()=>setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {songs.map((s:any)=>(
          <Card key={s.id} isDark={isDark} onClick={()=>{setSelectedSong(s); setTransposeStep(0);}} className="cursor-pointer">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h3>
            <p className="text-xs text-slate-400 mt-2 font-mono line-clamp-3">{s.lyrics}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MinistryRotaView = ({ schedules, onAdd, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ date: '', event: 'Ibadah', wl: '', musicians: '', multimedia: '' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Jadwal Petugas</h2><Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Rota</Button></div>
      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={(e)=>{e.preventDefault(); onAdd(formData); setIsAdding(false);}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isDark={isDark} label="Tanggal" type="date" required value={formData.date} onChange={(e:any)=>setFormData({...formData, date:e.target.value})} />
            <Input isDark={isDark} label="Acara" required value={formData.event} onChange={(e:any)=>setFormData({...formData, event:e.target.value})} />
            <div className="md:col-span-2 flex justify-end"><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="space-y-4">
        {schedules.map((s:any)=>(
          <Card key={s.id} isDark={isDark}><Badge color="indigo">{s.event}</Badge><p className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.date}</p></Card>
        ))}
      </div>
    </div>
  );
};

const PrayerWallView = ({ prayers, onAdd, onPray, isDark }: any) => {
  const [content, setContent] = useState('');
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Direktori Doa</h2>
      <Card isDark={isDark}>
        <form onSubmit={(e)=>{e.preventDefault(); onAdd({ author:'Jemaat', content, date:new Date().toISOString(), prayCount:0 }); setContent('');}} className="flex gap-2">
          <Input isDark={isDark} placeholder="Pokok doa..." value={content} onChange={(e:any)=>setContent(e.target.value)} required />
          <Button type="submit" variant="danger" className="mt-0"><Send className="w-4 h-4"/></Button>
        </form>
      </Card>
      <div className="space-y-4">
        {prayers.map((p:any)=>(
          <Card key={p.id} isDark={isDark}>
            <p className="italic mb-4">"{p.content}"</p>
            <button onClick={()=>onPray(p.id, p.prayCount)} className="flex items-center gap-1.5 text-rose-400 font-bold text-xs"><Heart className="w-4 h-4 fill-rose-500" /> Dukung ({p.prayCount})</button>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TaskBoardView = ({ tasks, onAdd, onUpdateStatus, isDark }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', assignee: '', status: 'To Do', event: 'Umum' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Papan Tugas</h2><Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tugas</Button></div>
      {isAdding && (
        <Card isDark={isDark}>
          <form onSubmit={(e)=>{e.preventDefault(); onAdd(formData); setIsAdding(false);}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input isDark={isDark} label="Judul" required value={formData.title} onChange={(e:any)=>setFormData({...formData, title:e.target.value})} />
            <div className="md:col-span-2 flex justify-end"><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['To Do', 'In Progress', 'Done'].map((status)=>(
          <div key={status} className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100'} rounded-2xl p-4 min-h-[300px]`}>
            <h3 className="font-bold text-sm uppercase mb-4">{status}</h3>
            <div className="space-y-3">
              {tasks.filter((t:any)=>t.status === status).map((t:any)=>(
                <Card key={t.id} isDark={isDark} className="p-3">
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.title}</p>
                  <select className="text-xs bg-transparent text-indigo-400 mt-2 font-bold focus:outline-none" value={t.status} onChange={(e)=>onUpdateStatus(t.id, e.target.value)}>
                    <option value="To Do" className="bg-slate-900">To Do</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Done" className="bg-slate-900">Done</option>
                  </select>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NavGroup = ({ title, isOpen, onToggle, children, isDark }: any) => (
  <div className="mb-2">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
      <span>{title}</span>
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
    </button>
    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>{children}</div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ utama: true, pelayanan: false, inventaris: false, sistem: false });
  const toggleMenu = (key: string) => setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Rota[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (error) {} };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setLoading(false); });
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

  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); };
  const handleUpdateDoc = async (colName: string, docId: string, data: any) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), data); };

  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { members: members.length, balance: income - expense, income, expense, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all text-sm font-medium ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r z-50 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>KOMDA HUB</h1>
              <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest block -mt-1">Church Engine</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
          <NavGroup title="Utama" isOpen={expandedMenus.utama} onToggle={() => toggleMenu('utama')} isDark={isDarkMode}>
            <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
            <NavItem icon={Trophy} label="Anggota & QR ID" view="members" isActive={currentView === 'members'} />
            <NavItem icon={DollarSign} label="Kas & Keuangan" view="finance" isActive={currentView === 'finance'} />
          </NavGroup>

          <NavGroup title="Pelayanan & Rohani" isOpen={expandedMenus.pelayanan} onToggle={() => toggleMenu('pelayanan')} isDark={isDarkMode}>
            <NavItem icon={CalendarDays} label="Jadwal Petugas" view="rota" isActive={currentView === 'rota'} />
            <NavItem icon={Music} label="Database Lirik" view="songs" isActive={currentView === 'songs'} />
            <NavItem icon={Heart} label="Direktori Doa" view="prayers" isActive={currentView === 'prayers'} />
            <NavItem icon={ListTodo} label="Papan Tugas" view="tasks" isActive={currentView === 'tasks'} />
          </NavGroup>

          <NavGroup title="Inventaris" isOpen={expandedMenus.inventaris} onToggle={() => toggleMenu('inventaris')} isDark={isDarkMode}>
            <NavItem icon={Speaker} label="Sound System" view="inventory_sound" isActive={currentView === 'inventory_sound'} />
            <NavItem icon={Camera} label="Multimedia" view="inventory_media" isActive={currentView === 'inventory_media'} />
            <NavItem icon={Armchair} label="Properti" view="inventory_property" isActive={currentView === 'inventory_property'} />
            <NavItem icon={ArrowRightLeft} label="Peminjaman" view="borrowing" isActive={currentView === 'borrowing'} />
          </NavGroup>

          <NavGroup title="Sistem" isOpen={expandedMenus.sistem} onToggle={() => toggleMenu('sistem')} isDark={isDarkMode}>
            <NavItem icon={CalendarIcon} label="Agenda" view="calendar" isActive={currentView === 'calendar'} />
            <NavItem icon={MessageSquare} label="Discord" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
          </NavGroup>
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <header className={`backdrop-blur-xl border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
            <button onClick={() => setCurrentView('dashboard')} className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className={`text-sm font-black tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>KOMDA HUB</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-700'} transition-colors`}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Badge color="emerald">Online</Badge>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} isDark={isDarkMode} />}
          {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} onUpdateXP={(id: string, newXp: number) => handleUpdateDoc('members', id, { xp: newXp })} isDark={isDarkMode} />}
          {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} isDark={isDarkMode} />}
          {currentView === 'inventory_sound' && <InventoryView category="Sound System" items={inventory.filter(i => i.category === 'Sound System')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} isDark={isDarkMode} />}
          {currentView === 'inventory_media' && <InventoryView category="Multimedia" items={inventory.filter(i => i.category === 'Multimedia')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} isDark={isDarkMode} />}
          {currentView === 'inventory_property' && <InventoryView category="Properti" items={inventory.filter(i => i.category === 'Properti')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} isDark={isDarkMode} />}
          {currentView === 'borrowing' && <BorrowingView borrowings={borrowings} inventory={inventory} onAdd={(d: any) => handleAddDoc('borrowings', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('borrowings', id, { status: s })} isDark={isDarkMode} />}
          {currentView === 'calendar' && <CalendarView events={events} onAdd={(d: any) => handleAddDoc('events', d)} isDark={isDarkMode} />}
          {currentView === 'discord_webhook' && <DiscordWebhookView isDark={isDarkMode} />}
          {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d: any) => handleAddDoc('songs', d)} onDelete={(id: string) => handleDeleteDoc('songs', id)} isDark={isDarkMode} />}
          {currentView === 'rota' && <MinistryRotaView schedules={schedules} onAdd={(d: any) => handleAddDoc('schedules', d)} isDark={isDarkMode} />}
          {currentView === 'prayers' && <PrayerWallView prayers={prayers} onAdd={(d: any) => handleAddDoc('prayers', d)} onPray={(id: string, current: number) => handleUpdateDoc('prayers', id, { prayCount: current + 1 })} isDark={isDarkMode} />}
          {currentView === 'tasks' && <TaskBoardView tasks={tasks} onAdd={(d: any) => handleAddDoc('tasks', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('tasks', id, { status: s })} isDark={isDarkMode} />}
        </div>
      </main>
    </div>
  );
}
