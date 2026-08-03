import React, { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Badge } from './FormUI';
import { Rota } from '../types';

export default function MinistryRotaView({ schedules, onAdd }: { schedules: Rota[]; onAdd: (r: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ date: '', event: 'Ibadah Pemuda', wl: '', musicians: '', multimedia: '' });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ date: '', event: 'Ibadah Pemuda', wl: '', musicians: '', multimedia: '' }); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-indigo-500" /> Jadwal Petugas
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Rota</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Acara" required value={formData.event} onChange={(e:any) => setFormData({...formData, event: e.target.value})} />
            <Input label="Worship Leader (WL)" value={formData.wl} onChange={(e:any) => setFormData({...formData, wl: e.target.value})} />
            <Input label="Pemusik" value={formData.musicians} onChange={(e:any) => setFormData({...formData, musicians: e.target.value})} />
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
              <p className="font-bold mt-2 text-slate-900 dark:text-white">{s.date ? new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
              <div><span className="font-semibold text-slate-500 block mb-1">🎤 WL</span>{s.wl || '-'}</div>
              <div><span className="font-semibold text-slate-500 block mb-1">🎹 Pemusik</span>{s.musicians || '-'}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-500 block mb-1">💻 Media & Sound</span>{s.multimedia || '-'}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
