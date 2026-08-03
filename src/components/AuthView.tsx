import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../App';
import { LOGO_URL, OWNER_EMAIL, appId } from '../constants';
import { Button } from './Button';
import { Input } from './FormUI'; // Diimpor dari FormUI, bukan Button

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
      setError(err.message || 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white mx-auto flex items-center justify-center mb-4">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white">KOMDA HUB</h1>
          <p className="text-xs text-indigo-400 font-bold mt-1">GKJ Slogohimo Engine</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button type="button" onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${!isRegister ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Masuk</button>
          <button type="button" onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${isRegister ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Daftar</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && <Input label="Nama Lengkap" value={name} onChange={(e:any) => setName(e.target.value)} required />}
          <Input label="Email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e:any) => setPassword(e.target.value)} required />
          {error && <div className="text-rose-400 text-xs">{error}</div>}
          <Button type="submit" className="w-full py-3">{loading ? 'Memproses...' : (isRegister ? 'Buat Akun' : 'Masuk')}</Button>
        </form>
      </div>
    </div>
  );
}
