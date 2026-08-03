import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Save } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './FormUI';
import { OWNER_EMAIL } from '../constants';

export default function ProfileView({ user, members, onSaveProfile }: any) {
  const currentMember = useMemo(() => {
    if (!user) return null;
    return members.find((m: any) => m.id === user.uid || m.contact?.toLowerCase() === user.email?.toLowerCase());
  }, [user, members]);

  const [formData, setFormData] = useState({
    name: currentMember?.name || user?.email?.split('@')[0] || '',
    division: currentMember?.division || (user?.email?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'Pengurus Inti' : 'Youth'),
    contact: currentMember?.contact || user?.email || '',
    photoUrl: currentMember?.photoUrl || ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onSaveProfile(user.uid, formData);
    setSuccessMsg('Profil berhasil disimpan!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <UserCheck className="w-8 h-8 text-indigo-500" /> Profil Saya
      </h2>
      <Card className="border-indigo-500/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nama Lengkap" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
          <Input label="Email Akun" disabled value={user?.email || ''} />
          <Input label="Divisi Pelayanan" value={formData.division} onChange={(e:any) => setFormData({...formData, division: e.target.value})} />
          {successMsg && <div className="p-3 bg-emerald-500/10 text-emerald-500 text-xs rounded-xl font-semibold text-center">{successMsg}</div>}
          <div className="flex justify-end"><Button type="submit"><Save className="w-4 h-4" /> Simpan Profil</Button></div>
        </form>
      </Card>
    </div>
  );
}
