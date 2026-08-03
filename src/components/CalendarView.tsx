import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, MessageSquare } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select } from './FormUI';
import { PERMANENT_DISCORD_WEBHOOK_URL } from '../constants';

export default function CalendarView({ events, onAdd }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service', description: '' });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', date: '', time: '18:00 WIB', location: 'Gereja', type: 'Service', description: '' }); 
  };

  const handleSendToDiscord = async (evt: any) => {
    try {
      const msg = `📅 **AGENDA PELAYANAN**\n\n📌 **Acara:** ${evt.title}\n📍 **Lokasi:** ${evt.location}\n⏰ **Waktu:** ${evt.date} (${evt.time})`;
      await fetch(PERMANENT_DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: msg }) });
      alert('Berhasil dikirim ke Discord!');
    } catch (e) { alert('Gagal mengirim webhook.'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-cyan-500" /> Agenda Pelayanan
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Agenda</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Acara" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Select label="Jenis" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'Service',label:'Ibadah'},{value:'Youth',label:'Pemuda'},{value:'Rehearsal',label:'Latihan'}]} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <Input label="Waktu" value={formData.time} onChange={(e:any) => setFormData({...formData, time: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e: any) => (
          <Card key={e.id} className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-500">{e.date} • {e.time}</span>
              <h3 className="font-bold text-lg mt-1">{e.title}</h3>
              <p className="text-xs text-slate-500 mt-1">📍 {e.location}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => handleSendToDiscord(e)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5865F2]/10 text-[#5865F2]">
                <MessageSquare className="w-3.5 h-3.5" /> Kirim ke Discord
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
