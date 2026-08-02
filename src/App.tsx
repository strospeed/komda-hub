import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
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
  FileText, LayoutDashboard, Plus, Trash2, CheckCircle, XCircle, Search,
  Menu, X, ArrowRightLeft, Trophy, MessageSquare, Sparkles, Bot, Send,
  QrCode, Globe, BotMessageSquare, Loader2, Download, Sun, Moon
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

export type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'chatbot';

interface Member { id: string; name: string; role: string; division: string; contact: string; joinDate: string; xp: number; }
export interface Transaction { id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; category: string; }
type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';
interface InventoryItem { id: string; name: string; category: InventoryCategory; condition: 'Good' | 'Needs Repair' | 'Broken'; quantity: number; location: string; qrCodeId?: string; }
export interface BorrowingRequest { id: string; itemId: string; itemName: string; borrowerName: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Returned'; purpose?: string; }
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; }

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

const MembersView = ({ members, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, joinDate: new Date().toISOString(), xp: Number(formData.xp) || 0 });
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
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" /> Anggota & Leaderboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Peringkat keaktifan pelayanan youth & jemaat.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>
      </div>

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
                <th className="px-6 py-4">Nama Pelayan</th>
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
                          <div className="text-xs text-slate-500 font-normal">{member.contact || 'No Contact'}</div>
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
    let runningBalance = 0;
    let tableRows = '';

    sortedTransactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') runningBalance += amount; else runningBalance -= amount;
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${t.date}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${t.description}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.type === 'income' ? 'Rp ' + amount.toLocaleString('id-ID') : '-'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${t.type === 'expense' ? 'Rp ' + amount.toLocaleString('id-ID') : '-'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">Rp ${runningBalance.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Keuangan KOMDA</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; }
            h1 { text-align: center; color: #0f172a; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background-color: #4f46e5; color: white; padding: 12px 8px; border: 1px solid #cbd5e1; text-transform: uppercase; font-size: 12px; }
            .summary { margin-top: 20px; padding: 15px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 8px; font-weight: bold; }
            @media print {
              @page { margin: 1cm; size: A4 portrait; }
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Laporan Kas & Keuangan KOMDA</h1>
          <div class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="summary">
            Saldo Akhir saat ini: Rp ${stats.balance.toLocaleString('id-ID')}
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
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
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pencatatan uang kas masuk dan pengeluaran.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded text-slate-600 hover:text-indigo-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
              <FileText className="w-4 h-4" /> Excel
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded text-slate-600 hover:text-rose-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
          <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4" /> Catat Transaksi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Rp {stats.income.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-rose-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">Rp {stats.expense.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-indigo-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Sisa Kas</p>
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
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button variant="emerald" type="submit">Simpan Transaksi</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t.description}</td>
                  <td className="px-6 py-4"><Badge color={t.type === 'income' ? 'emerald' : 'rose'}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Badge></td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </td>
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
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daftar peralatan {category.toLowerCase()} dengan tag QR Code.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Peralatan" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Jumlah Unit" type="number" required min="1" value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select label="Kondisi Alat" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})} options={[{value:'Good',label:'Baik & Siap Pakai'},{value:'Needs Repair',label:'Perlu Servis'},{value:'Broken',label:'Rusak / Matot'}]} />
            <Input label="Lokasi Penyimpanan" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Gear</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.name}</h3>
              <Badge color={item.condition === 'Good' ? 'emerald' : item.condition === 'Needs Repair' ? 'amber' : 'rose'}>
                {item.condition === 'Good' ? 'Baik' : item.condition === 'Needs Repair' ? 'Servis' : 'Rusak'}
              </Badge>
            </div>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between">
                <span>Jumlah Tersedia:</span>
                <span className="text-slate-900 dark:text-white font-bold">{item.quantity} unit</span>
              </div>
              <div className="flex justify-between">
                <span>Lokasi Penyimpanan:</span>
                <span className="text-slate-700 dark:text-slate-300">{item.location || 'Ruang Kontrol'}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                  <QrCode className="w-3 h-3" /> {item.qrCodeId || 'QR-SYS-101'}
                </span>
                <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-500 p-1 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
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
    setIsAdding(false);
    setFormData({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Sistem Peminjaman
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pengajuan peminjaman alat sound, kamera, & properti.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan Peminjaman</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Pilih Peralatan" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih Barang --'}, ...inventory.map((i:any) => ({value:i.id, label:i.name}))]} />
            <Input label="Nama Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input label="Tgl Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tgl Kembali" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Kirim Pengajuan</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {borrowings.map((b: any) => (
          <Card key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{b.itemName}</p>
                <Badge color={b.status === 'Approved' ? 'emerald' : b.status === 'Pending' ? 'amber' : b.status === 'Returned' ? 'cyan' : 'rose'}>{b.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Peminjam: <span className="text-slate-700 dark:text-slate-200 font-semibold">{b.borrowerName}</span> • Tgl: {b.startDate} s/d {b.endDate}</p>
            </div>
            <div className="flex items-center gap-2">
              {b.status === 'Pending' && (
                <><Button variant="emerald" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Approved')}><CheckCircle className="w-3.5 h-3.5" /> Approve</Button><Button variant="danger" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Rejected')}><XCircle className="w-3.5 h-3.5" /> Reject</Button></>
              )}
              {b.status === 'Approved' && (
                <Button variant="secondary" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Returned')}>Tandai Kembali</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CalendarView = ({ events, onAdd }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00 WIB', location: 'Gereja Utama', type: 'Service', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setIsAdding(false);
    setFormData({ title: '', date: '', time: '18:00 WIB', location: 'Gereja Utama', type: 'Service', description: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400" /> Agenda Pelayanan
          </h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Agenda</Button>
      </div>
      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Acara" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Select label="Jenis Agenda" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'Service',label:'Ibadah'},{value:'Youth Gathering',label:'Persekutuan'},{value:'Rehearsal',label:'Latihan'}]} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Jam" value={formData.time} onChange={(e:any) => setFormData({...formData, time: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Agenda</Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: any) => (
          <Card key={e.id}>
            <div className="flex justify-between items-start mb-2"><Badge color="cyan">{e.type}</Badge><span className="font-mono text-xs text-slate-400">{e.date}</span></div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{e.title}</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">📍 {e.location || 'Gereja'} • ⏰ {e.time || '18:00 WIB'}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const DiscordWebhookView = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#5865F2]" /> Discord Broadcast
        </h2>
      </div>
      <Card className="border-[#5865F2]/40 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-[#5865F2]/10">
        <form className="space-y-4">
          <Input label="URL Discord Webhook" value={webhookUrl} onChange={(e:any) => setWebhookUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Pesan</label>
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
          </div>
          <Button variant="discord" type="button" className="w-full py-3"><Send className="w-4 h-4" /> Kirim Broadcast</Button>
        </form>
      </Card>
    </div>
  );
};

const ChatbotView = () => (
  <div className="flex flex-col h-[60vh] max-w-4xl mx-auto">
    <div className="mb-4">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
        <BotMessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Asisten AI KOMDA
      </h2>
    </div>
    <Card className="flex-1 flex flex-col p-0 overflow-hidden border-indigo-200 dark:border-indigo-500/20 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-slate-400 italic text-sm">
        (Simulasi AI Chatbot - Fitur ini memerlukan API Key valid)
      </div>
    </Card>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) { console.error('Auth error:', error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const getColRef = (colName: string) => collection(db, 'artifacts', appId, 'public', 'data', colName);
    
    const unsubMembers = onSnapshot(getColRef('members'), (snapshot) => setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Member)));
    const unsubTransactions = onSnapshot(getColRef('transactions'), (snapshot) => setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction)));
    const unsubInventory = onSnapshot(getColRef('inventory'), (snapshot) => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem)));
    const unsubBorrowings = onSnapshot(getColRef('borrowings'), (snapshot) => setBorrowings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BorrowingRequest)));
    const unsubEvents = onSnapshot(getColRef('events'), (snapshot) => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventItem)));

    return () => { unsubMembers(); unsubTransactions(); unsubInventory(); unsubBorrowings(); unsubEvents(); };
  }, [user]);

  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); };
  const handleUpdateBorrowStatus = async (borrowId: string, status: string) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'borrowings', borrowId), { status }); };

  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { members: members.length, balance: income - expense, income, expense, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-sm font-semibold tracking-wider">Loading KOMDA HUB Engine...</p>
    </div>
  );

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" /><span>{label}</span>
    </button>
  );

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 flex transition-colors duration-300">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

        {/* Sidebar Navigation */}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/80 z-50 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-slate-900 dark:text-white">KOMDA HUB</h1>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-widest block -mt-1">Church Engine</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Utama</div>
            <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
            <NavItem icon={Trophy} label="Anggota & Leaderboard" view="members" isActive={currentView === 'members'} />
            <NavItem icon={DollarSign} label="Kas & Keuangan" view="finance" isActive={currentView === 'finance'} />
            
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 pt-4">Inventaris Gear</div>
            <NavItem icon={Speaker} label="Sound System" view="inventory_sound" isActive={currentView === 'inventory_sound'} />
            <NavItem icon={Camera} label="Multimedia" view="inventory_media" isActive={currentView === 'inventory_media'} />
            <NavItem icon={Armchair} label="Properti & panggung" view="inventory_property" isActive={currentView === 'inventory_property'} />
            
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 pt-4">Operasional</div>
            <NavItem icon={ArrowRightLeft} label="Peminjaman Gear" view="borrowing" isActive={currentView === 'borrowing'} />
            <NavItem icon={CalendarIcon} label="Agenda Pelayanan" view="calendar" isActive={currentView === 'calendar'} />
            <NavItem icon={MessageSquare} label="Discord Broadcast" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
            <NavItem icon={BotMessageSquare} label="Chatbot AI" view="chatbot" isActive={currentView === 'chatbot'} />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Topbar */}
          <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Mengganti input pencarian dengan Label Navigasi ke Dashboard */}
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="hidden sm:flex items-center gap-2 group transition-all duration-300"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase group-hover:text-indigo-500 transition-colors">
                  KOMDA HUB
                </span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Tema"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Badge color="emerald">Online</Badge>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">AD</div>
            </div>
          </header>

          {/* Dynamic Views */}
          <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1">
            {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
            {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} />}
            {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} />}
            
            {currentView === 'inventory_sound' && <InventoryView category="Sound System" items={inventory.filter(i => i.category === 'Sound System')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
            {currentView === 'inventory_media' && <InventoryView category="Multimedia" items={inventory.filter(i => i.category === 'Multimedia')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
            {currentView === 'inventory_property' && <InventoryView category="Properti" items={inventory.filter(i => i.category === 'Properti')} onAdd={(d: any) => handleAddDoc('inventory', d)} onDelete={(id: string) => handleDeleteDoc('inventory', id)} />}
            
            {currentView === 'borrowing' && <BorrowingView borrowings={borrowings} inventory={inventory} onAdd={(d: any) => handleAddDoc('borrowings', d)} onUpdateStatus={handleUpdateBorrowStatus} />}
            {currentView === 'calendar' && <CalendarView events={events} onAdd={(d: any) => handleAddDoc('events', d)} />}
            {currentView === 'discord_webhook' && <DiscordWebhookView />}
            {currentView === 'chatbot' && <ChatbotView />}
          </div>
        </main>
      </div>
    </div>
  );
}
