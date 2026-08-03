import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Plus, Trash2, QrCode, ScanLine, X, ShieldAlert, Edit2, Download, ImageIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select, Badge } from './FormUI';
import { Member } from '../types';

export default function MembersView({ members, onAdd, onDelete, onUpdateXP, onUpdateMember, currentUserRole }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50, photoUrl: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [activeQRMember, setActiveQRMember] = useState<Member | null>(null);
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ role: 'Anggota', division: 'Youth' });
  const [isCompressing, setIsCompressing] = useState(false);

  const isSuperAdmin = currentUserRole === 'Super Admin';

  const compressImage = (file: File, maxWidth = 250, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          } else {
            if (height > maxWidth) { width = Math.round((width * maxWidth) / height); height = maxWidth; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (!isScanning) return;
    const scannerId = "reader";
    // @ts-ignore
    if (window.Html5QrcodeScanner) {
      // @ts-ignore
      const scanner = new Html5QrcodeScanner(scannerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setIsScanning(false);
          const foundMember = members.find((m: Member) => m.qrId === decodedText || decodedText.includes(m.qrId || ''));
          if (foundMember) {
            onUpdateXP(foundMember.id, (foundMember.xp || 0) + 10);
            alert(`Berhasil! Kehadiran ${foundMember.name} dicatat (+10 XP).`);
          } else {
            alert(`QR Code terdeteksi, tetapi anggota tidak terdaftar.`);
          }
        },
        () => {}
      );
      return () => { try { scanner.clear(); } catch (e) {} };
    }
  }, [isScanning, members, onUpdateXP]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      } catch (err) {
        console.error("Gagal memproses gambar:", err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) { alert("Akses ditolak! Hanya Super Admin yang dapat menambah anggota."); return; }
    const qrId = `MEMBER-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, joinDate: new Date().toISOString(), xp: Number(formData.xp) || 0, qrId });
    setIsAdding(false);
    setFormData({ name: '', role: 'Anggota', division: 'Youth', contact: '', xp: 50, photoUrl: '' });
  };

  const sortedMembers = useMemo(() => [...members].sort((a, b) => (b.xp || 0) - (a.xp || 0)), [members]);
  const getRoleColor = (role: string) => role === 'Super Admin' ? 'purple' : role === 'Ketua' || role === 'Pengurus' ? 'indigo' : role === 'Bendahara' ? 'emerald' : role === 'PJ Sound' ? 'amber' : role === 'PJ Media' ? 'cyan' : 'slate';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" /> Anggota & Kartu ID
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsScanning(true)}><ScanLine className="w-4 h-4" /> Scan Presensi</Button>
          {isSuperAdmin && <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Anggota</Button>}
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>Anda login sebagai <b>{currentUserRole}</b>. Penambahan anggota dikunci khusus untuk Super Admin.</span>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full relative">
            <button onClick={() => setIsScanning(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
            <div id="reader" className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950"></div>
          </div>
        </div>
      )}

      {activeQRMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center relative">
            <button onClick={() => setActiveQRMember(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-1">KOMDA ID</h3>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 my-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/#member=${activeQRMember.qrId || 'MEMBER-DEFAULT'}`)}`} alt="QR" className="w-44 h-44 object-contain" />
            </div>
            <h4 className="text-xl font-bold">{activeQRMember.name}</h4>
            <p className="text-indigo-600 font-mono text-sm mt-1">{activeQRMember.qrId}</p>
          </div>
        </div>
      )}

      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-100 dark:bg-slate-950 text-xs uppercase border-b border-slate-200 dark:border-slate-800">
            <tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">Nama & ID</th><th className="px-6 py-4">Jabatan</th><th className="px-6 py-4 text-center">XP</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedMembers.map((member: Member, index: number) => (
              <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4 font-mono">#{index + 1}</td>
                <td className="px-6 py-4 font-semibold">
                  <div>{member.name}</div>
                  <button onClick={() => setActiveQRMember(member)} className="text-[10px] text-indigo-500 hover:underline">Lihat QR ID</button>
                </td>
                <td className="px-6 py-4"><Badge color={getRoleColor(member.role)}>{member.role}</Badge></td>
                <td className="px-6 py-4 text-center font-mono font-bold text-emerald-500">{member.xp || 0} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
