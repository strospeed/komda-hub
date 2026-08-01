import React from 'react';

import {
  Activity,
  ArrowRightLeft,
  BookOpen,
  CalendarIcon,
  ChevronRight,
  Clock,
  DollarSign,
  Send,
  Users,
} from 'lucide-react';
import {
  Badge,
  BorrowingRequest,
  EventItem,
  Transaction,
  View,
} from '../../App';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TitleSection from './title-section';

function DashboardView({
  stats,
  events,
  onNavigate,
}: {
  stats: any;
  events: EventItem[];
  onNavigate: (v: View) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* JST Style Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <TitleSection
          title="KOMDA Church Engine v2.5 Active"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="hover:border-indigo-500/40 transition-colors"
          onClik={() => onNavigate('members')}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Anggota
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats.members}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tersinkronisasi Realtime
          </p>
        </Card>

        <Card className="hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saldo Kas Kasih
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            Rp {stats.balance.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-emerald-500/80 mt-1">
            +Rp {stats.income.toLocaleString('id-ID')} Pemasukan
          </p>
        </Card>

        <Card className="hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inventaris
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats.inventory} Unit
          </div>
          <p className="text-xs text-slate-500 mt-1">Sound, Media, Properti</p>
        </Card>

        <Card className="hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Agenda Mendatang
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {events.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Jadwal Ibadah & Pelayanan
          </p>
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
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" /> Status
                Peminjaman Gear
              </h3>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => onNavigate('borrowing')}
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {stats.recentBorrowings.length > 0 ? (
                stats.recentBorrowings.map((b: BorrowingRequest) => (
                  <div
                    key={b.id}
                    className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                        {b.itemName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {b.itemName}
                        </p>
                        <p className="text-xs text-slate-400">
                          Peminjam:{' '}
                          <span className="text-slate-200">
                            {b.borrowerName}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      color={
                        b.status === 'Approved'
                          ? 'emerald'
                          : b.status === 'Pending'
                            ? 'amber'
                            : b.status === 'Returned'
                              ? 'cyan'
                              : 'rose'
                      }
                    >
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
                <Activity className="w-5 h-5 text-emerald-400" /> Transaksi Kas
                Terakhir
              </h3>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => onNavigate('finance')}
              >
                Keuangan <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((t: Transaction) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">
                        {t.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(t.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {t.type === 'income' ? '+' : '-'} Rp{' '}
                      {t.amount.toLocaleString('id-ID')}
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  KOMDA Bot Status
                </span>
              </div>
              <Badge color="indigo">Connected</Badge>
            </div>
            <p className="text-sm text-slate-300 font-medium">
              Discord Church Server Sync
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Notifikasi otomatis pengumuman, pengingat pelayanan, dan
              peminjaman barang terhubung ke Webhook Discord.
            </p>
            <Button
              variant="discord"
              className="w-full mt-4"
              onClick={() => onNavigate('discord_webhook')}
            >
              <Send className="w-4 h-4" /> Kirim Pengumuman Discord
            </Button>
          </Card>

          {/* Agenda & Events List */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Agenda Pelayanan
              </h3>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => onNavigate('calendar')}
              >
                Jadwal <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((e: EventItem) => (
                <div
                  key={e.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-400">
                      {e.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {e.date}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">{e.title}</p>
                  <p className="text-xs text-slate-400">
                    {e.location || 'Gereja Utama'} • {e.time || '18:00 WIB'}
                  </p>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-6">
                  Belum ada agenda pelayanan terdaftar.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
