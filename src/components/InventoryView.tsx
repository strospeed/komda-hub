import React, { useState } from 'react';
import { Speaker, Camera, Armchair, Plus, Trash2, QrCode, X, Download } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select, Badge } from './FormUI';

export default function InventoryView({ category, items, onAdd, onDelete, selectedGearQR, setSelectedGearQR }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qrCodeId = `QR-${category.substring(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    onAdd({ ...formData, category, quantity: Number(formData.quantity) || 1, qrCodeId });
    setIsAdding(false);
    setFormData({ name: '', condition: 'Good', quantity: 1, location: 'Ruang Sound/Media' });
  };

  const handleDownloadGearQR = (name: string, qrCodeId: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/#gear=${qrCodeId}`)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-Gear-${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          {category === 'Sound System' && <Speaker className="w-8 h-8 text-amber-500" />}
          {category === 'Multimedia' && <Camera className="w-8 h-8 text-cyan-500" />}
          {category === 'Properti' && <Armchair className="w-8 h-8 text-indigo-500" />}
          Inventaris {category}
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Gear</Button>
      </div>

      {selectedGearQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center relative">
            <button onClick={() => setSelectedGearQR(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-6 h-6"/></button>
            <h3 className="text-2xl font-black mb-1">GEAR ID</h3>
            <div className="bg-white p-4 rounded-2xl inline-block border-4 border-indigo-100 my-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/#gear=${selectedGearQR.qrCodeId}`)}`} alt="QR" className="w-48 h-48 object-contain" />
            </div>
            <h4 className="text-xl font-bold">{selectedGearQR.name}</h4>
            <p className="text-indigo-600 font-mono text-sm mt-1">{selectedGearQR.qrCodeId}</p>
            <Button onClick={() => handleDownloadGearQR(selectedGearQR.name, selectedGearQR.qrCodeId)} variant="secondary" className="w-full mt-4">
              <Download className="w-4 h-4" /> Download QR
            </Button>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Peralatan" required value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Jumlah Unit" type="number" required min="1" value={formData.quantity} onChange={(e:any) => setFormData({...formData, quantity: e.target.value})} />
            <Select label="Kondisi" value={formData.condition} onChange={(e:any) => setFormData({...formData, condition: e.target.value})} options={[{value:'Good',label:'Baik'},{value:'Needs Repair',label:'Perlu Servis'},{value:'Broken',label:'Rusak'}]} />
            <Input label="Lokasi" value={formData.location} onChange={(e:any) => setFormData({...formData, location: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-base">{item.name}</h3>
                <Badge color={item.condition === 'Good' ? 'emerald' : item.condition === 'Needs Repair' ? 'amber' : 'rose'}>{item.condition}</Badge>
              </div>
              <p className="text-xs text-slate-500">📍 {item.location} • 📦 {item.quantity} unit</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedGearQR(item)} className="text-xs text-indigo-600 font-mono flex items-center gap-1 font-bold">
                <QrCode className="w-3.5 h-3.5" /> Lihat QR
              </button>
              <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
