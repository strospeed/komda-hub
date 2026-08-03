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
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-indigo-500" /> Dashboard Utama
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => onNavigate('members')} className="border-t-4 border-indigo-500">
          <Users className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="text-xs font-semibold uppercase text-slate-500">Total Anggota</p>
          <p className="text-2xl font-extrabold mt-1">{stats?.members || 0}</p>
        </Card>
        <Card onClick={() => onNavigate('finance')} className="border-t-4 border-emerald-500">
          <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-xs font-semibold uppercase text-slate-500">Saldo Kas</p>
          <p className="text-2xl font-extrabold mt-1">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card onClick={() => onNavigate('inventory_sound')} className="border-t-4 border-amber-500">
          <Speaker className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-xs font-semibold uppercase text-slate-500">Inventaris Gear</p>
          <p className="text-2xl font-extrabold mt-1">{stats?.inventory || 0}</p>
        </Card>
        <Card onClick={() => onNavigate('calendar')} className="border-t-4 border-cyan-500">
          <CalendarIcon className="w-5 h-5 text-cyan-500 mb-2" />
          <p className="text-xs font-semibold uppercase text-slate-500">Agenda</p>
          <p className="text-2xl font-extrabold mt-1">{events?.length || 0}</p>
        </Card>
      </div>
    </div>
  );
}
