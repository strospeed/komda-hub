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
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`} />
    </button>
    <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

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
    utama: true, pelayanan: false, inventaris: false, sistem: false
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

  const handleLogout = async () => { try { await signOut(auth); } catch (e) { console.error(e); } };

  const handleAddDoc = async (colName: string, data: any) => { if (user) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), data); };
  const handleDeleteDoc = async (colName: string, docId: string) => { 
    if (currentUserRole !== 'Super Admin') { alert("Akses ditolak! Hanya Super Admin yang dapat menghapus data."); return; }
    if (user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId)); 
  };
  const handleUpdateDoc = async (colName: string, docId: string, data: any) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), data); };

  const handleSaveProfile = async (targetId: string, profileData: any) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', user.uid);
    await setDoc(docRef, { ...profileData, contact: (profileData.contact || user.email || '').toLowerCase() }, { merge: true });
  };

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

  if (!user) return <AuthView onAuthSuccess={(u) => setUser(u)} />;

  const NavItem = ({ icon: Icon, label, view, isActive }: any) => (
    <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}>
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
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-4 custom-scrollbar">
          <NavGroup title="Utama" isOpen={expandedMenus.utama} onToggle={() => toggleMenu('utama')}>
            <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" isActive={currentView === 'dashboard'} />
            <NavItem icon={Users} label="Anggota & QR ID" view="members" isActive={currentView === 'members'} />
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
          </NavGroup>

          <NavGroup title="Sistem & Notifikasi" isOpen={expandedMenus.sistem} onToggle={() => toggleMenu('sistem')}>
            <NavItem icon={CalendarIcon} label="Agenda Gereja" view="calendar" isActive={currentView === 'calendar'} />
            <NavItem icon={MessageSquare} label="Discord Broadcast" view="discord_webhook" isActive={currentView === 'discord_webhook'} />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button onClick={handleLogout} className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-500/20">
            <LogOut className="w-3.5 h-3.5" /> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main 
        className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto text-slate-900 dark:text-slate-100 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: isDarkMode 
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url('${DARK_WALLPAPER}')`
            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.50), rgba(241, 245, 249, 0.65)), url('${LIGHT_WALLPAPER}')`
        }}
      >
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
            Role: {currentUserRole}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="text-xs font-bold">{currentMemberProfile?.name || user.email?.split('@')[0]}</span>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <button onClick={() => { setCurrentView('profile'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" /> Profil Saya
                  </button>
                  <button onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1 relative z-10">
          {currentView === 'dashboard' && <DashboardView stats={dashboardStats} events={events} onNavigate={setCurrentView} />}
          {currentView === 'profile' && <ProfileView user={user} members={members} onSaveProfile={handleSaveProfile} />}
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
