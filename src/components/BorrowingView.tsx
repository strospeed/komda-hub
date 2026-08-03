import React, { useState } from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select, Badge } from './FormUI';

export default function BorrowingView({ borrowings, inventory, onAdd, onUpdateStatus }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGear = inventory.find((i: any) => i.id === formData.itemId);
    onAdd({ ...formData, itemName: selectedGear ? selectedGear.name : 'Unknown Gear', status: 'Pending' });
    setIsAdding(false); 
    setFormData({ itemId: '', borrowerName: '', startDate: '', endDate: '', purpose: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-indigo-500" /> Peminjaman Gear
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Ajukan Pinjam</Button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Pilih Barang" value={formData.itemId} onChange={(e:any) => setFormData({...formData, itemId: e.target.value})} options={[{value:'',label:'-- Pilih Gear --'}, ...inventory.map((i:any) => ({value:i.id, label:i.name}))]} />
            <Input label="Nama Peminjam" required value={formData.borrowerName} onChange={(e:any) => setFormData({...formData, borrowerName: e.target.value})} />
            <Input label="Tgl Pinjam" type="date" required value={formData.startDate} onChange={(e:any) => setFormData({...formData, startDate: e.target.value})} />
            <Input label="Tgl Kembali" type="date" required value={formData.endDate} onChange={(e:any) => setFormData({...formData, endDate: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Kirim Pengajuan</Button></div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {borrowings.map((b: any) => (
          <Card key={b.id} className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{b.itemName}</p>
                <Badge color={b.status === 'Approved' ? 'emerald' : b.status === 'Pending' ? 'amber' : b.status === 'Returned' ? 'cyan' : 'rose'}>{b.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">Peminjam: {b.borrowerName} • {b.startDate} s/d {b.endDate}</p>
            </div>
            <div className="flex gap-2">
              {b.status === 'Pending' && (<><Button variant="emerald" className="text-xs py-1" onClick={() => onUpdateStatus(b.id, 'Approved')}>Approve</Button><Button variant="danger" className="text-xs py-1" onClick={() => onUpdateStatus(b.id, 'Rejected')}>Reject</Button></>)}
              {b.status === 'Approved' && <Button variant="secondary" className="text-xs py-1" onClick={() => onUpdateStatus(b.id, 'Returned')}>Kembalikan</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
