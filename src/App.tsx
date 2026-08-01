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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqNuViryXML4war1pXTjxm9l6VIqGhB0A",
  authDomain: "komda-hub.firebaseapp.com",
  projectId: "komda-hub",
  storageBucket: "komda-hub.firebasestorage.app",
  messagingSenderId: "170131110544",
  appId: "1:170131110544:web:4238f2d853b83deae8f615",
  measurementId: "G-Y1WRHPFVFJ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "komda-hub-main";

type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'chatbot';

interface Member {
  id: string;
  name: string;
  role: string;
  division: string;
  contact: string;
  joinDate: string;
  xp: number;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';

interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  condition: string;
  quantity: number;
  location: string;
  qrCodeId?: string;
}

interface BorrowingRequest {
  id: string;
  itemId: string;
  itemName: string;
  borrowerName: string;
  startDate: string;
  endDate: string;
  status: string;
  purpose?: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  type: string;
  location: string;
}

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30",
    danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20",
    discord: "bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-[#5865F2]/25",
    ghost: "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
  };
  return (
    <button disabled={disabled} type={type} onClick={onClick} className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <input 
      {...props} 
      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
    <select 
      {...props}
      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm appearance-none"
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
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.indigo}`}>
      {children}
    </span>
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof (window as any).__initial_auth_token !== 'undefined' && (window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
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

  useEffect(() => {
    if (!user) return;
    const getColRef = (colName: string) => collection(db, 'artifacts', appId, 'public', 'data', colName);

    const unsubMembers = onSnapshot(getColRef('members'), (snapshot) => setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member))), () => {});
    const unsubTransactions = onSnapshot(getColRef('transactions'), (snapshot) => setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))), () => {});
    const unsubInventory = onSnapshot(getColRef('inventory'), (snapshot) => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))), () => {});
    const unsubBorrowings = onSnapshot(getColRef('borrowings'), (snapshot) => setBorrowings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BorrowingRequest))), () => {});
    const unsubEvents = onSnapshot(getColRef('events'), (snapshot) => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem))), () => {});

    return () => {
      unsubMembers(); unsubTransactions(); unsubInventory(); unsubBorrowings(); unsubEvents();
    };
  }, [user]);

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

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return {
      members: members.length,
      balance: income - expense,
      income,
      expense,
      inventory: inventory.length,
    };
  }, [members, transactions, inventory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">Loading KOMDA HUB Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">KOMDA HUB</h1>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">GKJ Slogohimo</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto">
          <button onClick={() => {setCurrentView('dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => {setCurrentView('members'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'members' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Trophy className="w-4 h-4" /> Anggota & Leaderboard
          </button>
          <button onClick={() => {setCurrentView('finance'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'finance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <DollarSign className="w-4 h-4" /> Keuangan Kas
          </button>
          <button onClick={() => {setCurrentView('inventory_sound'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'inventory_sound' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Speaker className="w-4 h-4" /> Inventaris Sound
          </button>
          <button onClick={() => {setCurrentView('calendar'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <CalendarIcon className="w-4 h-4" /> Agenda Pelayanan
          </button>
          <button onClick={() => {setCurrentView('chatbot'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${currentView === 'chatbot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BotMessageSquare className="w-4 h-4" /> Asisten AI
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold text-white capitalize">Portal Pelayanan Pemuda</h2>
          <Badge color="emerald">Online Live</Badge>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8">
                <h2 className="text-3xl font-extrabold text-white">Selamat Datang di KOMDA HUB</h2>
                <p className="text-slate-400 mt-2 text-sm">Sistem manajemen terpadu jemaat & pemuda GKJ Slogohimo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Total Anggota</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.members}</p>
                </Card>
                <Card>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Saldo Kas</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">Rp {stats.balance.toLocaleString('id-ID')}</p>
                </Card>
                <Card>
                  <p className="text-xs uppercase text-slate-400 font-semibold">Total Inventaris</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">{stats.inventory} Unit</p>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'members' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Daftar Anggota</h2>
              <div className="space-y-3">
                {members.map(m => (
                  <Card key={m.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.role} • {m.division}</p>
                    </div>
                    <Button variant="danger" onClick={() => handleDeleteDoc('members', m.id)}><Trash2 className="w-4 h-4" /></Button>
                  </Card>
                ))}
                {members.length === 0 && <p className="text-slate-500 text-sm">Belum ada anggota. Tambahkan data.</p>}
              </div>
            </div>
          )}

          {currentView === 'finance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Keuangan Kas</h2>
              <div className="space-y-3">
                {transactions.map(t => (
                  <Card key={t.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{t.description}</p>
                      <p className="text-xs text-slate-400">{t.date}</p>
                    </div>
                    <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} Rp {t.amount?.toLocaleString('id-ID')}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Agenda Pelayanan</h2>
              <div className="space-y-3">
                {events.map(e => (
                  <Card key={e.id}>
                    <p className="text-xs text-indigo-400 font-bold">{e.type}</p>
                    <h3 className="text-lg font-bold text-white">{e.title}</h3>
                    <p className="text-xs text-slate-400">{e.date} • {e.location}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentView === 'chatbot' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Asisten AI</h2>
              <Card><p className="text-sm text-slate-300">Asisten siap membantu koordinasi pelayanan gereja.</p></Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
