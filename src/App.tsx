import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, setDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  Users, DollarSign, Speaker, Camera, Armchair, Calendar as CalendarIcon,
  LayoutDashboard, MessageSquare, Music, CalendarDays, Heart, ListTodo, ChevronDown, LogOut, Sun, Moon, UserCheck
} from 'lucide-react';

import { firebaseConfig, appId, OWNER_EMAIL, LOGO_URL, LIGHT_WALLPAPER, DARK_WALLPAPER } from './constants';
import { View, Member, Transaction, InventoryItem, BorrowingRequest, EventItem, Song, Rota, Prayer, Task } from './types';

// Importing View components
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import ProfileView from './components/ProfileView';
import MembersView from './components/MembersView';
import FinanceView from './components/FinanceView';
import InventoryView from './components/InventoryView';
import BorrowingView from './components/BorrowingView';
import CalendarView from './components/CalendarView';
import DiscordWebhookView from './components/DiscordWebhookView';
import WorshipSongLibraryView from './components/WorshipSongLibraryView';
import MinistryRotaView from './components/MinistryRotaView';
import PrayerWallView from './components/PrayerWallView';
import TaskBoardView from './components/TaskBoardView';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const NavGroup = ({ title, isOpen, onToggle, children }: any) => (
  <div className="mb-2">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors group">
      <span>{title}</span>
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
    </button>
    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
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
  const [selectedGearQR, setSelectedGearQR] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Custom mouse scroll behavior logic
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const currentUserRole = useMemo(() => {
    if (!user || !user.email) return 'Anggota';
    const emailLower = user.email.trim().toLowerCase();
    if (emailLower === OWNER_EMAIL.toLowerCase()) return 'Super Admin';
    const matchedMember = members.find(m => m.id === user.uid || m.contact?.toLowerCase() === emailLower);
    return matchedMember ? matchedMember.role : 'Anggota';
  }, [user, members]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    utama: true, pelayanan: false, inventaris: false, sistem: false
  });

  const toggleMenu = (key: string) => setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));

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
      onSnapshot(getColRef('tasks'), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }) as Task)))
    ];
    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const handleLogout = async () => { await signOut(auth); };
  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); };
  const handleUpdateDoc = async (colName: string, docId: string, data: any) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), data); };
  const handleSaveProfile = async (targetId: string, profileData: any) => { if (user) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', user.uid), { ...profileData }, { merge: true }); };

  const dashboardStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { members: members.length, balance: income - expense, income, expense, inventory: inventory.length };
  }, [members, transactions, inventory]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <AuthView onAuthSuccess={(u) => setUser(u)} />;

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/95 dark:bg-slate-900 z-50 border-r border-slate-200 dark:border-slate-800 flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 font-black text-xl">KOMDA HUB</div>
        <NavGroup title="Utama" isOpen={expandedMenus.utama} onToggle={() => toggleMenu('utama')}>
          <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
          <NavItem icon={Users} label="Anggota" view="members" isActive={currentView === 'members'} />
          <NavItem icon={DollarSign} label="Keuangan" view="finance" isActive={currentView === 'finance'} />
        </NavGroup>
        <NavGroup title="Pelayanan" isOpen={expandedMenus.pelayanan} onToggle={() => toggleMenu('pelayanan')}>
          <NavItem icon={CalendarDays} label="Jadwal" view="rota" isActive={currentView === 'rota'} />
          <NavItem icon={Music} label="Lirik" view="songs" isActive={currentView === 'songs'} />
          <NavItem icon={Heart} label="Doa" view="prayers" isActive={currentView === 'prayers'} />
          <NavItem icon={ListTodo} label="Tugas" view="tasks" isActive={currentView === 'tasks'} />
        </NavGroup>
        <button onClick={handleLogout} className="mt-auto p-4 text-xs font-bold flex items-center gap-2"><LogOut className="w-4 h-4"/> Keluar</button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
        {currentView === 'members' && <MembersView members={members} onAdd={(d: any) => handleAddDoc('members', d)} onDelete={(id: string) => handleDeleteDoc('members', id)} onUpdateXP={(id: string, n: number) => handleUpdateDoc('members', id, { xp: n })} currentUserRole={currentUserRole} />}
        {currentView === 'finance' && <FinanceView transactions={transactions} stats={dashboardStats} onAdd={(d: any) => handleAddDoc('transactions', d)} />}
        {currentView === 'songs' && <WorshipSongLibraryView songs={songs} onAdd={(d: any) => handleAddDoc('songs', d)} onDelete={(id: string) => handleDeleteDoc('songs', id)} />}
        {currentView === 'rota' && <MinistryRotaView schedules={schedules} onAdd={(d: any) => handleAddDoc('schedules', d)} />}
        {currentView === 'prayers' && <PrayerWallView prayers={prayers} onAdd={(d: any) => handleAddDoc('prayers', d)} onPray={(id: string, n: number) => handleUpdateDoc('prayers', id, { prayCount: n + 1 })} />}
        {currentView === 'tasks' && <TaskBoardView tasks={tasks} onAdd={(d: any) => handleAddDoc('tasks', d)} onUpdateStatus={(id: string, s: string) => handleUpdateDoc('tasks', id, { status: s })} />}
      </main>
    </div>
  );
}
