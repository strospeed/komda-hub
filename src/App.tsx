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

const Card = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick} 
    className={`bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1' : ''} ${className}`}
  >
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
    {label && <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <input {...props} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <select {...props} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm appearance-none">
      {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <textarea {...props} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
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
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.indigo}`}>{children}</span>;
};

const DashboardView = ({ stats, events, onNavigate }: any) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Dashboard Utama
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ringkasan aktivitas dan status pelayanan KOMDA.</p>
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
  </div>
);

const MembersView = ({ members, onAdd, onDelete, onUpdateXP }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });
  const [selectedQR, setSelectedQR] = useState<Member | null>(null);

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
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" /> Anggota & Kartu ID
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manajemen anggota, XP pelayanan, dan ID QR Code (Absensi).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => alert('Fitur kamera pemindai (Scan Presensi) siap diintegrasikan!')}>
            <ScanLine className="w-4 h-4" /> Scan Presensi
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>
        </div>
      </div>

      {/* Modal QR Code */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setSelectedQR(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">KOMDA ID</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{selectedQR.division} Division</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 shadow-inner mb-6">
              {/* Dummy Visual QR Representation */}
              <QrCode className="w-48 h-48 text-slate-900" />
            </div>
            
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedQR.name}</h4>
            <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-2 font-bold tracking-widest">{selectedQR.qrId || 'MEMBER-XXXXXX'}</p>
            
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => onUpdateXP(selectedQR.id, (selectedQR.xp || 0) + 10)} variant="emerald" className="w-full">
                <CheckCircle className="w-4 h-4" /> Hadir (+10 XP)
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Daniel Wibowo" />
            <Select label="Jabatan/Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} options={[{value:'Anggota',label:'Anggota'},{value:'Pengurus',label:'Pengurus'},{value:'PJ Sound',label:'PJ Sound System'},{value:'PJ Media',label:'PJ Multimedia'},{value:'Bendahara',label:'Bendahara'},{value:'Ketua',label:'Ketua / Pembina'},{value:'Super Admin',label:'Super Admin'}]} />
            <Input label="Divisi Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} placeholder="Puji-Pujian / Sound / Media" />
            <Input label="Kontak (WA/Discord)" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} placeholder="@username atau 0812..." />
            <Input label="XP Poin" type="number" min="0" value={formData.xp} onChange={(e:any) => setFormData({...formData, xp: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Anggota</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Nama & ID</th>
                <th className="px-6 py-4">Jabatan & Divisi</th>
                <th className="px-6 py-4 text-center">Keaktifan (XP)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedMembers.map((member: Member, index: number) => {
                const maxXP = sortedMembers[0]?.xp || 100;
                const progressPercent = Math.min(100, Math.round(((member.xp || 0) / maxXP) * 100));
                return (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      {index === 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-bold">🥇 1</span> : 
                       index === 1 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-400/20 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-400/30 font-bold">🥈 2</span> : 
                       index === 2 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-amber-700/20 text-orange-700 dark:text-amber-600 border border-orange-200 dark:border-amber-700/30 font-bold">🥉 3</span> : 
                       <span className="font-mono text-slate-400 dark:text-slate-500 ml-2">#{index + 1}</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {member.name.substring(0, 2)}
                        </div>
                        <div>
                          <div>{member.name}</div>
                          <button onClick={() => setSelectedQR(member)} className="text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono mt-0.5">
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
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDelete(member.id)} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

const FinanceView = ({ transactions, onAdd, stats }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', category: 'Persembahan Kasih', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, amount: parseFloat(formData.amount) || 0 });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', category: 'Persembahan Kasih', date: new Date().toISOString().split('T')[0] });
  };

  const handleExportExcel = () => {
    let excelHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1"><tr><td colspan="5" style="font-size: 16px; font-weight: bold; text-align: center;">BUKU KAS - KOMDA HUB</td></tr><tr style="background-color: #4338ca; color: white; font-weight: bold; text-align: center;"><th>Tanggal</th><th>Keterangan</th><th>Pemasukan (Rp)</th><th>Pengeluaran (Rp)</th><th>Saldo Akhir (Rp)</th></tr>`;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    sortedTransactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') runningBalance += amount; else runningBalance -= amount;
      excelHTML += `<tr><td>${t.date}</td><td>${t.description}</td><td style="text-align: right;">${t.type === 'income' ? amount : '-'}</td><td style="text-align: right;">${t.type === 'expense' ? amount : '-'}</td><td style="text-align: right;">${runningBalance}</td></tr>`;
    });
    excelHTML += `</table></body></html>`;
    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Buku_Kas_${new Date().toISOString().split('T')[0]}.xls`; a.click();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0; let tableRows = '';
    sortedTransactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') runningBalance += amount; else runningBalance -= amount;
      tableRows += `<tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${t.date}</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${t.description}</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.type === 'income' ? 'Rp ' + amount.toLocaleString('id-ID') : '-'}</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.type === 'expense' ? 'Rp ' + amount.toLocaleString('id-ID') : '-'}</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">Rp ${runningBalance.toLocaleString('id-ID')}</td></tr>`;
    });
    const htmlContent = `<html><head><title>Laporan Keuangan KOMDA</title><style>body { font-family: sans-serif; padding: 20px; color: #1e293b; } h1 { text-align: center; } .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; } table { width: 100%; border-collapse: collapse; } th { background-color: #4f46e5; color: white; padding: 12px; border: 1px solid #cbd5e1; } .summary { margin-top: 20px; padding: 15px; background: #f8fafc; border: 1px solid #cbd5e1; font-weight: bold; } @media print { button { display: none; } }</style></head><body><h1>Laporan Kas & Keuangan</h1><div class="subtitle">Dicetak: ${new Date().toLocaleDateString('id-ID')}</div><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Pemasukan</th><th>Pengeluaran</th><th>Saldo</th></tr></thead><tbody>${tableRows}</tbody></table><div class="summary">Saldo Akhir: Rp ${stats.balance.toLocaleString('id-ID')}</div><script>window.onload=()=>{setTimeout(()=>{window.print();window.close();},500);}</script></body></html>`;
    printWindow.document.write(htmlContent); printWindow.document.close();
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
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded text-slate-600 hover:text-indigo-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 transition-all"><FileText className="w-4 h-4" /> Excel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded text-slate-600 hover:text-rose-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 transition-all"><Download className="w-4 h-4" /> PDF</button>
          </div>
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
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
              <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4">Jenis</th><th className="px-6 py-4 text-right">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-xs font-mono">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold">{t.description}</td>
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

const InventoryView = ({ category, items, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, category, quantity: Number(formData.quantity) || 1, qrCodeId: `QR-${category.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` });
    setIsAdding(false);
    setFormData({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });
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
          <Button variant="secondary" onClick={() => alert('Fitur Scan Barcode siap diintegrasikan!')}><ScanLine className="w-4 h-4"/> Scan Alat</Button>
          <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
        </div>
      </div>
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
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between"><span>Jumlah:</span><span className="text-slate-900 dark:text-white font-bold">{item.quantity} unit</span></div>
              <div className="flex justify-between"><span>Lokasi:</span><span className="text-slate-700 dark:text-slate-300">{item.location}</span></div>
              <div className="flex justify-between items-center pt-1">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20"><QrCode className="w-3 h-3" /> {item.qrCodeId}</span>
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
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd(formData); setIsAdding(false); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><CalendarIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400" /> Agenda Pelayanan</h2>
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
        {events.map((e: any) => (
          <Card key={e.id}>
            <div className="flex justify-between mb-2"><Badge color="cyan">{e.type}</Badge><span className="font-mono text-xs">{e.date}</span></div>
            <h3 className="font-bold text-slate-900 dark:text-white">{e.title}</h3>
            <p className="text-xs text-indigo-500 mt-1">📍 {e.location} • ⏰ {e.time}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DiscordWebhookView = () => {
  const [webhookUrl, setWebhookUrl] = useState(''); const [message, setMessage] = useState('');
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3"><MessageSquare className="w-8 h-8 text-[#5865F2]" /> Discord Broadcast</h2>
      <Card className="border-[#5865F2]/40">
        <form className="space-y-4">
          <Input label="URL Webhook" value={webhookUrl} onChange={(e:any) => setWebhookUrl(e.target.value)} />
          <Textarea label="Pesan" rows={4} value={message} onChange={(e:any) => setMessage(e.target.value)} />
          <Button variant="discord" type="button" className="w-full"><Send className="w-4 h-4" /> Kirim</Button>
        </form>
      </Card>
    </div>
  );
};

const WorshipSongLibraryView = ({ songs, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null); // State untuk modal lirik aktif
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', key: 'C', lyrics: '' }); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Music className="w-8 h-8 text-rose-500" /> Database Pujian
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Lagu</Button>
      </div>

      {/* Modal Detail Lirik & Chord */}
      {selectedSong && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setSelectedSong(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"
            >
              <X className="w-6 h-6"/>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Badge color="rose">Key: {selectedSong.key}</Badge>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedSong.title}</h3>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedSong.lyrics || 'Tidak ada lirik atau chord yang dicatat.'}
              </pre>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedSong(null)} variant="secondary">Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-rose-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input label="Judul Lagu" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} className="flex-1" />
              <Input label="Nada Dasar (Key)" required value={formData.key} onChange={(e:any) => setFormData({...formData, key: e.target.value})} className="w-24" />
            </div>
            <Textarea label="Lirik & Chord" rows={6} value={formData.lyrics} onChange={(e:any) => setFormData({...formData, lyrics: e.target.value})} placeholder="[Intro] C G Am F..." />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {songs.map((s: Song) => (
          <Card 
            key={s.id} 
            onClick={() => setSelectedSong(s)} 
            className="group relative overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all"
          >
            <div className="absolute top-0 right-0 bg-rose-500 text-white font-bold text-xs px-3 py-1 rounded-bl-xl shadow-md">Key: {s.key}</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2 pr-8">{s.title}</h3>
            <p className="text-xs text-slate-500 mt-3 font-mono whitespace-pre-wrap line-clamp-4">{s.lyrics || 'Lirik belum tersedia.'}</p>
            <div className="mt-4 text-xs font-semibold text-rose-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Klik untuk buka lirik & chord →
            </div>
          </Card>
        ))}
        {songs.length === 0 && <p className="col-span-full text-slate-500 italic">Belum ada lagu. Tambahkan repertoar pujian pertama!</p>}
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
            <Input label="Pemusik (Keyboard, Gitar, dll)" value={formData.musicians} onChange={(e:any) => setFormData({...formData, musicians: e.target.value})} />
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
              <div><span className="font-semibold text-slate-500 block mb-1">🎤 Worship Leader</span>{s.wl || '-'}</div>
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
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAdd({ author: 'Anonim / Jemaat', content, date: new Date().toISOString(), prayCount: 0 }); setContent(''); };
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
        {prayers.map((p: Prayer) => (
          <Card key={p.id} className="relative">
            <p className="text-slate-800 dark:text-slate-200 italic mb-4">"{p.content}"</p>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{new Date(p.date).toLocaleDateString()}</span>
              <button onClick={() => onPray(p.id, p.prayCount)} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-bold">
                <Heart className={`w-4 h-4 ${p.prayCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} /> Mendukung ({p.prayCount})
              </button>
            </div>
          </Card>
        ))}
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
          <Card key={t.id} className="p-3 shadow-sm hover:shadow-md cursor-grab">
            <Badge color="slate">{t.event}</Badge>
            <p className="font-bold text-sm mt-2 text-slate-900 dark:text-white">{t.title}</p>
            <div className="flex justify-between items-center mt-3 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-xs text-slate-500">{t.assignee}</span>
              <select className="text-xs bg-transparent text-indigo-500 font-bold focus:outline-none" value={t.status} onChange={(e) => onUpdateStatus(t.id, e.target.value)}>
                <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
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
            <Input label="Penanggung Jawab (PIC)" value={formData.assignee} onChange={(e:any) => setFormData({...formData, assignee: e.target.value})} />
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
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors group"
      >
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

  // State untuk mengontrol dropdown menu mana yang sedang terbuka
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    utama: true,
    pelayanan: false,
    inventaris: false,
    sistem: false
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  // New Data States
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Rota[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark'); else root.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (error) { console.error(error); } };
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-sm font-semibold tracking-wider">Loading KOMDA HUB Engine...</p>
    </div>
  );

  const NavItem = ({ icon: Icon, label, view, isActive, colorClass = "text-slate-500 dark:text-slate-400" }: any) => (
    <button
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive ? 'bg-indigo-600 text-white shadow-lg' : `${colorClass} hover:bg-slate-100 dark:hover:bg-slate-800/60`
      }`}
    >
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex transition-colors duration-300">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/80 z-50 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-black tracking-wider">KOMDA HUB</h1>
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
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><Menu className="w-6 h-6" /></button>
            <button onClick={() => setCurrentView('dashboard')} className="hidden sm:flex items-center gap-2 group transition-all">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><Sparkles className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-black tracking-widest uppercase group-hover:text-indigo-500 transition-colors">KOMDA HUB</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Badge color="emerald">Online</Badge>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
          {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} onUpdateXP={(id: string, newXp: number) => handleUpdateDoc('members', id, { xp: newXp })} />}
          {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} />}
          
          {currentView === 'inventory_sound' && <InventoryView category="Sound System" items={inventory.filter(i => i.category === 'Sound System')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
          {currentView === 'inventory_media' && <InventoryView category="Multimedia" items={inventory.filter(i => i.category === 'Multimedia')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
          {currentView === 'inventory_property' && <InventoryView category="Properti" items={inventory.filter(i => i.category === 'Properti')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
          
          {currentView === 'borrowing' && <BorrowingView borrowings={borrowings} inventory={inventory} onAdd={(d: any) => handleAddDoc('borrowings', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('borrowings', id, { status: s })} />}
          {currentView === 'calendar' && <CalendarView events={events} onAdd={(d: any) => handleAddDoc('events', d)} />}
          {currentView === 'discord_webhook' && <DiscordWebhookView />}
          
          {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d: any) => handleAddDoc('songs', d)} />}
          {currentView === 'rota' && <MinistryRotaView schedules={schedules} onAdd={(d: any) => handleAddDoc('schedules', d)} />}
          {currentView === 'prayers' && <PrayerWallView prayers={prayers} onAdd={(d: any) => handleAddDoc('prayers', d)} onPray={(id: string, current: number) => handleUpdateDoc('prayers', id, { prayCount: current + 1 })} />}
          {currentView === 'tasks' && <TaskBoardView tasks={tasks} onAdd={(d: any) => handleAddDoc('tasks', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('tasks', id, { status: s })} />}
        </div>
      </main>
    </div>
  );
}
