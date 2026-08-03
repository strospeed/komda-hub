import React, { useState, useEffect } from 'react';
import { Heart, Send, MessageSquare } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './FormUI';
import { Prayer } from '../types';
import { PERMANENT_DISCORD_WEBHOOK_URL } from '../constants';

export default function PrayerWallView({ prayers, onAdd, onPray }: { prayers: Prayer[]; onAdd: (p: any) => void; onPray: (id: string, count: number) => void }) {
  const [content, setContent] = useState('');
  const [supportedPrayers, setSupportedPrayers] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('komda_supported_prayers');
      if (saved) setSupportedPrayers(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handlePrayClick = (prayerId: string, currentCount: number) => {
    if (supportedPrayers.includes(prayerId)) return;
    onPray(prayerId, currentCount);
    const updated = [...supportedPrayers, prayerId];
    setSupportedPrayers(updated);
    try { localStorage.setItem('komda_supported_prayers', JSON.stringify(updated)); } catch (e) {}
  };

  const handleSendToDiscord = async (prayer: Prayer) => {
    try {
      const discordMsg = `🙏 **POKOK DOA JEMAAT**\n\n> "${prayer.content}"\n\n❤️ **Dukungan Doa:** ${prayer.prayCount} orang`;
      await fetch(PERMANENT_DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: discordMsg }) });
      alert('Pokok doa dibagikan ke Discord!');
    } catch (err) { alert('Gagal mengirim ke Discord.'); }
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd({ author: 'Jemaat', content, date: new Date().toISOString(), prayCount: 0 }); 
    setContent(''); 
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <Heart className="w-8 h-8 text-rose-500" /> Direktori Doa
      </h2>
      <Card className="bg-gradient-to-r from-rose-500/10 to-transparent">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input placeholder="Tuliskan pokok doa Anda..." value={content} onChange={(e:any) => setContent(e.target.value)} required />
          <Button type="submit" variant="danger" className="mt-6"><Send className="w-4 h-4"/></Button>
        </form>
      </Card>
      <div className="space-y-4">
        {prayers.map((p: Prayer) => {
          const isSupported = supportedPrayers.includes(p.id);
          return (
            <Card key={p.id} className="relative space-y-4">
              <p className="text-slate-800 dark:text-slate-200 italic text-base">"{p.content}"</p>
              <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                <span>📅 {p.date ? new Date(p.date).toLocaleDateString() : '-'}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSendToDiscord(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20">
                    <MessageSquare className="w-3.5 h-3.5" /> Kirim ke Discord
                  </button>
                  <button onClick={() => handlePrayClick(p.id, p.prayCount)} disabled={isSupported} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold ${isSupported ? 'bg-rose-500/20 text-rose-500 cursor-not-allowed border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <Heart className={`w-4 h-4 ${isSupported ? 'fill-rose-500 text-rose-500' : ''}`} /> 
                    {isSupported ? `Didukung (${p.prayCount})` : `Mendukung (${p.prayCount})`}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
