import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  Users, DollarSign, Speaker, Camera, Armchair, Calendar as CalendarIcon, 
  FileText, Bell, Settings, LayoutDashboard, Plus, Trash2, Edit2, 
  CheckCircle, XCircle, Search, Menu, X, ArrowRightLeft, BookOpen,
  Trophy, MessageSquare, Radio, Sparkles, ShieldCheck, ChevronRight,
  Clock, Zap, Bot, UserCheck, Volume2, Film, Send, QrCode, Award, Activity, Image as ImageIcon, Globe,
  BotMessageSquare, Loader2
} from 'lucide-react';

const DISCORD_INVITE_CODE = 'uEac8TZxec';
const DISCORD_INVITE_URL = `https://discord.gg/${DISCORD_INVITE_CODE}`;
const CHURCH_WEBSITE_URL = 'https://www.gkjslogohimo.web.id/';

// Konfigurasi Firebase Anda
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'komda-hub-default';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'komda-hub-main';

type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'gallery' | 'discord_webhook' | 'chatbot';

interface Member {
  id: string;
  name: string;
  role: 'Super Admin' | 'Ketua' | 'Bendahara' | 'PJ Sound' | 'PJ Media' | 'Pengurus' | 'Anggota';
  division: string;
  contact: string;
  joinDate: string;
  xp: number;
  avatarUrl?: string;
  status?: 'Online' | 'Offline' | 'In Service';
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';

interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  condition: 'Good' | 'Needs Repair' | 'Broken';
  quantity: number;
  location: string;
  qrCodeId?: string;
  lastServiced?: string;
}

interface BorrowingRequest {
  id: string;
  itemId: string;
  itemName: string;
  borrowerName: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  purpose?: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  type: 'Service' | 'Meeting' | 'Youth Gathering' | 'Rehearsal';
  location: string;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string;
}

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30",
    danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20",
    discord: "bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-[#5865F2]/25",
    ghost: "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
  };
  return (
    <button disabled={disabled} type={type} onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.primary} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <input 
      {...props} 
      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <select 
      {...props}
      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm appearance-none"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">{opt.label}</option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, color = 'indigo' }: { children: React.ReactNode, color?: string }) => {
  const styles: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.indigo}`}>
      {children}
    </span>
  );
};

const DashboardView = ({ stats, events, onNavigate }: { stats: any, events: EventItem[], onNavigate: (v: View) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* JST Style Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> KOMDA Church Engine v2.5 Active
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Selamat Datang di <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">KOMDA HUB</span>
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
              Platform manajemen terpadu untuk pelayanan pemuda, inventaris multimedia, jadwal ibadah, dan koordinasi Discord komunitas gereja.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.open(CHURCH_WEBSITE_URL, '_blank')}>
              <Globe className="w-4 h-4 text-cyan-400" /> Web GKJ Slogohimo
            </Button>
            <Button variant="discord" onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}>
              <MessageSquare className="w-4 h-4" /> Community Discord
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('members')}>
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard XP
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Anggota</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.members}</div>
          <p className="text-xs text-slate-500 mt-1">Tersinkronisasi Realtime</p>
        </Card>

        <Card className="hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Kas Kasih</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            Rp {stats.balance.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-emerald-500/80 mt-1">+Rp {stats.income.toLocaleString('id-ID')} Pemasukan</p>
        </Card>

        <Card className="hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inventaris</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.inventory} Unit</div>
          <p className="text-xs text-slate-500 mt-1">Sound, Media, Properti</p>
        </Card>

        <Card className="hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Agenda Mendatang</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{events.length}</div>
          <p className="text-xs text-slate-500 mt-1">Jadwal Ibadah & Pelayanan</p>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Activity & Borrowing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Borrowings */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" /> Status Peminjaman Gear
              </h3>
              <Button variant="ghost" className="text-xs" onClick={() => onNavigate('borrowing')}>
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {stats.recentBorrowings.length > 0 ? (
                stats.recentBorrowings.map((b: BorrowingRequest) => (
                  <div key={b.id} className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                        {b.itemName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{b.itemName}</p>
                        <p className="text-xs text-slate-400">Peminjam: <span className="text-slate-200">{b.borrowerName}</span></p>
                      </div>
                    </div>
                    <Badge color={
                      b.status === 'Approved' ? 'emerald' :
                      b.status === 'Pending' ? 'amber' :
                      b.status === 'Returned' ? 'cyan' : 'rose'
                    }>
                      {b.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  Belum ada pengajuan peminjaman aktif.
                </div>
              )}
            </div>
          </Card>

          {/* Finance Snapshot */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Transaksi Kas Terakhir
              </h3>
              <Button variant="ghost" className="text-xs" onClick={() => onNavigate('finance')}>
                Keuangan <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((t: Transaction) => (
                  <div key={t.id} className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`font-mono text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  Belum ada data transaksi kas.
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* Right Column: Events & Discord Status */}
        <div className="space-y-6">
          
          {/* Discord Live Status Widget */}
          <Card className="border-[#5865F2]/30 bg-gradient-to-b from-slate-900 via-slate-900 to-[#5865F2]/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">KOMDA Bot Status</span>
              </div>
              <Badge color="indigo">Connected</Badge>
            </div>
            <p className="text-sm text-slate-300 font-medium">Discord Church Server Sync</p>
            <p className="text-xs text-slate-400 mt-1">
              Notifikasi otomatis pengumuman, pengingat pelayanan, dan peminjaman barang terhubung ke Webhook Discord.
            </p>
            <Button variant="discord" className="w-full mt-4" onClick={() => onNavigate('discord_webhook')}>
              <Send className="w-4 h-4" /> Kirim Pengumuman Discord
            </Button>
          </Card>

          {/* Agenda & Events List */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Agenda Pelayanan
              </h3>
              <Button variant="ghost" className="text-xs" onClick={() => onNavigate('calendar')}>
                Jadwal <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((e: EventItem) => (
                <div key={e.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-400">{e.type}</span>
                    <span className="text-xs text-slate-500 font-mono">{e.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{e.title}</p>
                  <p className="text-xs text-slate-400">{e.location || 'Gereja Utama'} • {e.time || '18:00 WIB'}</p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-6">Belum ada agenda pelayanan terdaftar.</p>
              )}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

const MembersView = ({ members, onAdd, onDelete }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      ...formData, 
      joinDate: new Date().toISOString(),
      xp: Number(formData.xp) || 0
    });
    setIsAdding(false);
    setFormData({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50 });
  };

  // In-memory sorting by XP descending
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  }, [members]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'purple';
      case 'Ketua': return 'indigo';
      case 'Bendahara': return 'emerald';
      case 'PJ Sound': return 'amber';
      case 'PJ Media': return 'cyan';
      case 'Pengurus': return 'indigo';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" /> Anggota & Leaderboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">Peringkat keaktifan pelayanan youth & jemaat terurut berdasarkan Poin XP.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4"/> Tambah Anggota
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Daniel Wibowo" />
            <Select label="Jabatan/Role" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} 
              options={[
                {value: 'Anggota', label: 'Anggota'}, {value: 'Pengurus', label: 'Pengurus'},
                {value: 'PJ Sound', label: 'PJ Sound System'}, {value: 'PJ Media', label: 'PJ Multimedia'},
                {value: 'Bendahara', label: 'Bendahara'}, {value: 'Ketua', label: 'Ketua / Pembina'},
                {value: 'Super Admin', label: 'Super Admin'}
              ]}
            />
            <Input label="Divisi Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} placeholder="Puji-Pujian / Sound / Media / Usher" />
            <Input label="Kontak (WhatsApp/Discord)" value={formData.contact} onChange={(e:any) => setFormData({...formData, contact: e.target.value})} placeholder="@username atau 0812..." />
            <Input label="XP Poin Keaktifan Awal" type="number" min="0" value={formData.xp} onChange={(e:any) => setFormData({...formData, xp: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Anggota</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Nama Pelayan</th>
                <th className="px-6 py-4">Jabatan & Divisi</th>
                <th className="px-6 py-4 text-center">Keaktifan (XP)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedMembers.map((member: Member, index: number) => {
                const maxXP = sortedMembers[0]?.xp || 100;
                const progressPercent = Math.min(100, Math.round(((member.xp || 0) / maxXP) * 100));

                return (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      {index === 0 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">🥇 1</span>
                      ) : index === 1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/30 font-bold">🥈 2</span>
                      ) : index === 2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/30 font-bold">🥉 3</span>
                      ) : (
                        <span className="font-mono text-slate-500 ml-2">#{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 uppercase">
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
                      <div className="text-xs text-slate-400 mt-1">{member.division || 'Umum'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 mx-auto">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-mono font-bold text-emerald-400">{member.xp || 0} XP</span>
                          <span className="text-slate-500">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDelete(member.id)} className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sortedMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada data anggota terdaftar. Tambahkan data pertama!</p>
                  </td>
                </tr>
              )}
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
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', category: 'Persembahan Kasih', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" /> Keuangan & Kas Pelayanan
          </h2>
          <p className="text-slate-400 text-sm mt-1">Pencatatan uang kas masuk, operasional pelayanan, dan pengeluaran peralatan.</p>
        </div>
        <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4"/> Catat Transaksi
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">Rp {stats.income.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-rose-500/30">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">Rp {stats.expense.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-indigo-500/30">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Sisa Kas</p>
          <p className="text-2xl font-extrabold text-white mt-1">Rp {stats.balance.toLocaleString('id-ID')}</p>
        </Card>
      </div>

      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Jenis Transaksi" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})}
              options={[{value: 'income', label: 'Pemasukan (+)'}, {value: 'expense', label: 'Pengeluaran (-)'}]} />
            <Input label="Jumlah (Rp)" type="number" required min="0" value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} placeholder="100000" />
            <Input label="Keterangan" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} placeholder="Persembahan Kasih / Pembelian Kabel XLR" />
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
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-white">{t.description}</td>
                  <td className="px-6 py-4">
                    <Badge color={t.type === 'income' ? 'emerald' : 'rose'}>
                      {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">Belum ada riwayat transaksi kas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const InventoryView = ({ category, items, onAdd, onDelete }: { category: InventoryCategory, items: InventoryItem[], onAdd: any, onDelete: any }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      category,
      quantity: Number(formData.quantity) || 1,
      qrCodeId: `QR-${category.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsAdding(false);
    setFormData({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {category === 'Sound System' && <Speaker className="w-8 h-8 text-amber-400" />}
            {category === 'Multimedia' && <Camera className="w-8 h-8 text-cyan-400" />}
            {category === 'Properti' && <Armchair className="w-8 h-8 text-indigo-400" />}
            Inventaris {category}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Daftar peralatan {category.toLowerCase()} dengan tag QR Code dan status kondisi.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4"/> Tambah Gear
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Peralatan / Barang" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="Mixer Digital Behringer X32 / Sony A6400" />
            <Input label="Jumlah Unit" type="number" required min="1" value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select label="Kondisi Alat" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})}
              options={[{value: 'Good', label: 'Baik & Siap Pakai'}, {value: 'Needs Repair', label: 'Perlu Servis'}, {value: 'Broken', label: 'Rusak / Matot'}]} />
            <Input label="Lokasi Penyimpanan" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} placeholder="Gudang Atas / Ruang Kontrol" />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Gear</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start gap-2 mb-3">
              <h3 className="text-base font-bold text-white leading-snug">{item.name}</h3>
              <Badge color={
                item.condition === 'Good' ? 'emerald' :
                item.condition === 'Needs Repair' ? 'amber' : 'rose'
              }>
                {item.condition === 'Good' ? 'Baik' : item.condition === 'Needs Repair' ? 'Servis' : 'Rusak'}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-400 mt-auto pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Jumlah Tersedia:</span>
                <span className="text-white font-bold">{item.quantity} unit</span>
              </div>
              <div className="flex justify-between">
                <span>Lokasi Penyimpanan:</span>
                <span className="text-slate-300">{item.location || 'Ruang Kontrol'}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  <QrCode className="w-3 h-3" /> {item.qrCodeId || 'QR-SYS-101'}
                </span>
                <button onClick={() => onDelete(item.id)} className="text-slate-500 hover:text-rose-400 p-1 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
            Belum ada peralatan terdaftar di kategori {category}.
          </div>
        )}
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
    onAdd({
      ...formData,
      itemName: selectedGear ? selectedGear.name : 'Unknown Gear',
      status: 'Pending'
    });
    setIsAdding(false);
    setFormData({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-indigo-400" /> Sistem Peminjaman Barang
          </h2>
          <p className="text-slate-400 text-sm mt-1">Pengajuan peminjaman alat sound, kamera, & properti dengan persetujuan PJ / Pengurus.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4"/> Ajukan Peminjaman
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Pilih Peralatan" 
              value={formData.itemId} 
              onChange={(e:any) => setFormData({...formData, itemId: e.target.value})}
              options={[
                { value: '', label: '-- Pilih Barang Inventaris --' },
                ...inventory.map((i: any) => ({ value: i.id, label: `${i.name} (${i.category})` }))
              ]}
            />
            <Input label="Nama Peminjam / Tim Pelayanan" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} placeholder="Tim Worship / Tim Multimedia" />
            <Input label="Tanggal Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tanggal Pengembalian" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <Input label="Tujuan / Acara" className="md:col-span-2" value={formData.purpose} onChange={(e:any) => setFormData({...formData, purpose: e.target.value})} placeholder="Retreat Pemuda / Ibadah Padang" />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Kirim Pengajuan</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {borrowings.map((b: BorrowingRequest) => (
          <Card key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white">{b.itemName}</p>
                <Badge color={
                  b.status === 'Approved' ? 'emerald' :
                  b.status === 'Pending' ? 'amber' :
                  b.status === 'Returned' ? 'cyan' : 'rose'
                }>
                  {b.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Peminjam: <span className="text-slate-200 font-semibold">{b.borrowerName}</span> • Tgl: {b.startDate} s/d {b.endDate}
              </p>
              {b.purpose && <p className="text-xs text-indigo-300 mt-1">Tujuan: {b.purpose}</p>}
            </div>

            <div className="flex items-center gap-2">
              {b.status === 'Pending' && (
                <>
                  <Button variant="emerald" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Approved')}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button variant="danger" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Rejected')}>
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </>
              )}
              {b.status === 'Approved' && (
                <Button variant="secondary" className="text-xs py-1.5" onClick={() => onUpdateStatus(b.id, 'Returned')}>
                  Tandai Kembalikan
                </Button>
              )}
            </div>
          </Card>
        ))}

        {borrowings.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
            Belum ada riwayat atau permohonan peminjaman.
          </div>
        )}
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-400" /> Agenda & Kalender Pelayanan
          </h2>
          <p className="text-slate-400 text-sm mt-1">Jadwal ibadah pemuda, latihan worship team, rapat pengurus, dan acara gereja.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4"/> Tambah Agenda
        </Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Acara / Pelayanan" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} placeholder="Ibadah Pemuda / Latihan Musik" />
            <Select label="Jenis Agenda" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})}
              options={[
                {value: 'Service', label: 'Ibadah Raya / Pemuda'},
                {value: 'Youth Gathering', label: 'Persekutuan / KKR'},
                {value: 'Rehearsal', label: 'Latihan Pelayanan'},
                {value: 'Meeting', label: 'Rapat Pengurus'}
              ]} 
            />
            <Input label="Tanggal Acara" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Jam / Waktu" value={formData.time} onChange={(e:any) => setFormData({...formData, time: e.target.value})} placeholder="18:00 - 20:00 WIB" />
            <Input label="Lokasi" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} placeholder="Gereja Utama / Ruang Youth" />
            <Input label="Keterangan Tambahan" value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} placeholder="Petugas: Worship Team A" />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              <Button type="submit">Simpan Agenda</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: EventItem) => (
          <Card key={e.id} className="border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <Badge color="cyan">{e.type}</Badge>
              <span className="font-mono text-xs text-slate-400">{e.date}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{e.title}</h3>
            <p className="text-xs text-indigo-400 mt-1">📍 {e.location || 'Gereja'} • ⏰ {e.time || '18:00 WIB'}</p>
            {e.description && <p className="text-xs text-slate-400 mt-2">{e.description}</p>}
          </Card>
        ))}

        {events.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
            Belum ada agenda pelayanan terdaftar.
          </div>
        )}
      </div>
    </div>
  );
};

const DiscordWebhookView = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://discord.com/api/webhooks/1532677061397844089/hHMk-YY4pzLD8Z_WUu_hwMETVUTq0klvbgCv-RPVuMapx_jzs5642I61YfG-PnGbMm65');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSendWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || !message) return;
    
    setSending(true);
    setStatus(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📢 **PENGUMUMAN KOMDA HUB**\n${message}\n\n*Dikirim dari Portal KOMDA HUB Engine*`
        })
      });

      if (response.ok) {
        setStatus('Pengumuman berhasil terkirim ke channel Discord!');
        setMessage('');
      } else {
        setStatus('Gagal mengirim ke Webhook Discord. Periksa kembali URL Webhook Anda.');
      }
    } catch (err) {
      setStatus('Terjadi kesalahan koneksi saat menghubungi Discord Webhook.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#5865F2]" /> Discord Broadcast Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">Kirim pengumuman otomatis langsung ke Server Discord Komunitas melalui Webhook API.</p>
      </div>

      <Card className="border-[#5865F2]/40 bg-gradient-to-br from-slate-900 to-[#5865F2]/10">
        <form onSubmit={handleSendWebhook} className="space-y-4">
          <Input 
            label="URL Discord Webhook Channel" 
            required 
            value={webhookUrl} 
            onChange={(e: any) => setWebhookUrl(e.target.value)} 
            placeholder="https://discord.com/api/webhooks/..."
          />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Pesan Pengumuman</label>
            <textarea 
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan pengumuman pelayanan atau jadwal ibadah di sini..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
            />
          </div>

          {status && (
            <div className={`p-3 rounded-lg text-xs font-medium ${status.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {status}
            </div>
          )}

          <Button variant="discord" type="submit" disabled={sending} className="w-full py-3">
            <Send className="w-4 h-4" /> {sending ? 'Mengirim...' : 'Kirim Broadcast Discord'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const ChatbotView = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Halo! Saya asisten AI KOMDA HUB. Ada yang bisa saya bantu terkait pelayanan atau sistem manajemen ini?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Use the injected Gemini API via Canvas fetch pattern
      const apiKey = ""; // Leave empty for Canvas injection
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [
          // Provide basic context for the bot
          {
            role: "user", 
            parts: [{ text: "System prompt: Anda adalah asisten AI yang ramah dan membantu untuk KOMDA HUB, sebuah sistem manajemen komunitas gereja. Tugas Anda adalah membantu anggota dengan pertanyaan seputar pelayanan, inventaris, atau fitur aplikasi. Jawab dengan singkat, sopan, dan gunakan bahasa Indonesia yang baik." }]
          },
          {
            role: "model",
            parts: [{ text: "Baik, saya mengerti. Saya siap membantu." }]
          },
          // Append chat history
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          // Add new user message
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        const botReply = result.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'model', text: botReply }]);
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, saya sedang mengalami gangguan koneksi. Silakan coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BotMessageSquare className="w-8 h-8 text-indigo-400" /> Asisten AI KOMDA
        </h2>
        <p className="text-slate-400 text-sm mt-1">Tanya jawab seputar panduan sistem, ide pelayanan, atau fitur komunitas.</p>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-indigo-500/20 bg-slate-900/50">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.role === 'model' && (
                   <div className="flex items-center gap-2 mb-2">
                     <Bot className="w-4 h-4 text-indigo-400" />
                     <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">KOMDA AI</span>
                   </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-5 py-4 shadow-md flex items-center gap-3">
                 <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                 <span className="text-sm text-slate-400 animate-pulse">Sedang mengetik...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu pada Asisten AI..."
              className="w-full bg-slate-900 border border-slate-700 rounded-full pl-6 pr-14 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // 1. Firebase Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Data Fetching via Firestore Snapshots (Guarded by user auth)
  useEffect(() => {
    if (!user) return;

    const getColRef = (colName: string) => collection(db, 'artifacts', appId, 'public', 'data', colName);

    const unsubMembers = onSnapshot(getColRef('members'), 
      (snapshot) => setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member))),
      (err) => console.error("Error fetching members:", err)
    );

    const unsubTransactions = onSnapshot(getColRef('transactions'), 
      (snapshot) => setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))),
      (err) => console.error("Error fetching transactions:", err)
    );

    const unsubInventory = onSnapshot(getColRef('inventory'), 
      (snapshot) => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))),
      (err) => console.error("Error fetching inventory:", err)
    );

    const unsubBorrowings = onSnapshot(getColRef('borrowings'), 
      (snapshot) => setBorrowings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BorrowingRequest))),
      (err) => console.error("Error fetching borrowings:", err)
    );

    const unsubEvents = onSnapshot(getColRef('events'), 
      (snapshot) => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem))),
      (err) => console.error("Error fetching events:", err)
    );

    return () => {
      unsubMembers(); unsubTransactions(); unsubInventory(); unsubBorrowings(); unsubEvents();
    };
  }, [user]);

  // Document Handlers
  const handleAddDoc = async (colName: string, data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleDeleteDoc = async (colName: string, docId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const handleUpdateBorrowStatus = async (borrowId: string, status: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'borrowings', borrowId), { status });
    } catch (e) {
      console.error("Error updating borrowing status: ", e);
    }
  };

  // Derived Stats
  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      members: members.length,
      balance: income - expense,
      income,
      expense,
      inventory: inventory.length,
      recentTransactions: [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
      recentBorrowings: [...borrowings].slice(0, 5)
    };
  }, [members, transactions, inventory, borrowings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">Loading KOMDA HUB Engine...</p>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900/90 border-r border-slate-800/80 z-50 backdrop-blur-xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">KOMDA HUB</h1>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block -mt-1">Church Engine</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Utama</div>
          <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
          <NavItem icon={Trophy} label="Anggota & Leaderboard" view="members" isActive={currentView === 'members'} />
          <NavItem icon={DollarSign} label="Kas & Keuangan" view="finance" isActive={currentView === 'finance'} />

          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 pt-4">Inventaris Gear</div>
          <NavItem icon={Speaker} label="Sound System" view="inventory_sound" isActive={currentView === 'inventory_sound'} />
          <NavItem icon={Camera} label="Multimedia" view="inventory_media" isActive={currentView === 'inventory_media'} />
          <NavItem icon={Armchair} label="Properti & panggung" view="inventory_property" isActive={currentView === 'inventory_property'} />

          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 pt-4">Operasional</div>
          <NavItem icon={ArrowRightLeft} label="Peminjaman Gear" view="borrowing" isActive={currentView === 'borrowing'} />
          <NavItem icon={CalendarIcon} label="Agenda Pelayanan" view="calendar" isActive={currentView === 'calendar'} />
          <NavItem icon={MessageSquare} label="Discord Broadcast" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
          
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 pt-4">Asisten</div>
          <NavItem icon={BotMessageSquare} label="Chatbot AI" view="chatbot" isActive={currentView === 'chatbot'} />
        </nav>

        {}
        <div className="p-4 space-y-3 border-t border-slate-800/60 bg-slate-950/30">
          <a 
            href={CHURCH_WEBSITE_URL}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 px-3 rounded-xl transition-all shadow-lg text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            Website GKJ Slogohimo
          </a>
          <a 
            href={DISCORD_INVITE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white py-2 px-3 rounded-xl transition-all shadow-lg shadow-[#5865F2]/20 text-xs font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            Join Discord Server
          </a>
          
          <div className="flex items-center gap-2.5 px-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400 truncate">Online Sync Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Topbar */}
        <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari data pelayanan..." 
                className="bg-slate-950/80 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors w-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge color="emerald">Online</Badge>
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentView === 'dashboard' && (
            <DashboardView stats={dashboardStats} events={events} onNavigate={(v) => setCurrentView(v)} />
          )}

          {currentView === 'members' && (
            <MembersView 
              members={members} 
              onAdd={(data:any) => handleAddDoc('members', data)}
              onDelete={(id:string) => handleDeleteDoc('members', id)}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView 
              transactions={transactions} 
              stats={dashboardStats}
              onAdd={(data:any) => handleAddDoc('transactions', data)}
            />
          )}

          {currentView === 'inventory_sound' && (
            <InventoryView 
              category="Sound System" 
              items={inventory.filter(i => i.category === 'Sound System')}
              onAdd={(data:any) => handleAddDoc('inventory', data)}
              onDelete={(id:string) => handleDeleteDoc('inventory', id)}
            />
          )}

          {currentView === 'inventory_media' && (
            <InventoryView 
              category="Multimedia" 
              items={inventory.filter(i => i.category === 'Multimedia')}
              onAdd={(data:any) => handleAddDoc('inventory', data)}
              onDelete={(id:string) => handleDeleteDoc('inventory', id)}
            />
          )}

          {currentView === 'inventory_property' && (
            <InventoryView 
              category="Properti" 
              items={inventory.filter(i => i.category === 'Properti')}
              onAdd={(data:any) => handleAddDoc('inventory', data)}
              onDelete={(id:string) => handleDeleteDoc('inventory', id)}
            />
          )}

          {currentView === 'borrowing' && (
            <BorrowingView 
              borrowings={borrowings}
              inventory={inventory}
              onAdd={(data:any) => handleAddDoc('borrowings', data)}
              onUpdateStatus={handleUpdateBorrowStatus}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView 
              events={events}
              onAdd={(data:any) => handleAddDoc('events', data)}
            />
          )}

          {currentView === 'discord_webhook' && (
            <DiscordWebhookView />
          )}

          {currentView === 'chatbot' && (
            <ChatbotView />
          )}
        </div>
      </main>
    </div>
  );
}
