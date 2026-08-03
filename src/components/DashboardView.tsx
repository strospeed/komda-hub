import React from 'react';
import { LayoutDashboard, Users, DollarSign, Speaker, Calendar as CalendarIcon, PieChart } from 'lucide-react';
import { Card } from './Card';
import { CHURCH_WEBSITE_URL, DISCORD_INVITE_URL, CHURCH_IG_URL, CHURCH_YT_URL } from '../constants';

export default function DashboardView({ stats, events, onNavigate }: any) {
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
              <PieChart className="w-6 h-6 text-indigo-500" />
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
}
