import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Textarea } from './FormUI';
import { PERMANENT_DISCORD_WEBHOOK_URL } from '../constants';

export default function DiscordWebhookView() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: string | null; text: string }>({ type: null, text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(PERMANENT_DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: message }) });
      if (res.ok || res.status === 204) { setStatus({ type: 'success', text: 'Berhasil dikirim ke Discord!' }); setMessage(''); }
      else { setStatus({ type: 'error', text: 'Gagal mengirim.' }); }
    } catch (e) { setStatus({ type: 'error', text: 'Kesalahan jaringan.' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-[#5865F2]" /> Discord Broadcast
      </h2>
      <Card className="border-[#5865F2]/40">
        <form onSubmit={handleSend} className="space-y-4">
          <Textarea label="Pesan Broadcast" rows={5} value={message} onChange={(e:any) => setMessage(e.target.value)} required />
          {status.type && <div className={`p-3 rounded-lg text-xs font-semibold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{status.text}</div>}
          <Button variant="discord" type="submit" className="w-full" disabled={isLoading}><Send className="w-4 h-4" /> Kirim</Button>
        </form>
      </Card>
    </div>
  );
}
