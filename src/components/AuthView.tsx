import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, LogIn } from 'lucide-react';
import { auth, db } from '../App';
import { LOGO_URL, OWNER_EMAIL, appId } from '../constants';
import { Button } from './Button';
import { Input } from './FormUI';

export default function AuthView({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // @ts-ignore
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const isOwner = email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

        // @ts-ignore
        const memberRef = doc(db, 'artifacts', appId, 'public', 'data', 'members', userCred.user.uid);
        await setDoc(memberRef, {
          name: name.trim() || email.split('@')[0],
          role: isOwner ? 'Super Admin' : 'Anggota',
          division: isOwner ? 'Pengurus Inti' : 'Youth',
          contact: email.trim().toLowerCase(),
          joinDate: new Date().toISOString(),
          xp: 10,
          qrId: `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`,
          photoUrl: ''
        });

        onAuthSuccess(userCred.user);
      } else {
        // @ts-ignore
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCred.user);
      }
    } catch (err: any) {
      setError(err.message || 'Autentikasi gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-white mx-auto flex items-center justify-center mb-4 border border-slate-700">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">KOMDA HUB</h1>
          <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mt-1">GKJ Slogohimo Engine</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button 
            type="button" 
            onClick={() => { setIsRegister(false); setError(''); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Masuk (Login)
          </button>
          <button 
            type="button" 
            onClick={() => { setIsRegister(true); setError(''); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Buat Akun (Register)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input 
              label="Nama Lengkap" 
              type="text" 
              required={isRegister}
              value={name} 
              onChange={(e: any) => setName(e.target.value)} 
              placeholder="Nama Lengkap Anda" 
            />
          )}

          <Input 
            label="Email Gereja / Pribadi" 
            type="email" 
            required 
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
            placeholder="nama@email.com" 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
            {loading ? 'Memproses...' : (isRegister ? <><UserPlus className="w-4 h-4"/> Buat Akun & Daftar Anggota</> : <><LogIn className="w-4 h-4"/> Masuk ke Sistem</>)}
          </Button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          Sistem Manajemen Terpadu Pemuda & Remaja GKJ Slogohimo
        </p>
      </div>
    </div>
  );
}
