import React, { useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Badge } from './FormUI';
import { Task } from '../types';

export default function TaskBoardView({ tasks, onAdd, onUpdateStatus }: { tasks: Task[]; onAdd: (t: any) => void; onUpdateStatus: (id: string, status: string) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', assignee: '', status: 'To Do', event: '' });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', assignee: '', status: 'To Do', event: '' }); 
  };
  
  const renderColumn = (status: string, colorClass: string) => (
    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[300px]">
      <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 ${colorClass}`}>
        <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0].replace('text', 'bg')}`}></div> {status}
      </h3>
      <div className="space-y-3">
        {tasks.filter((t: Task) => t.status === status).map((t: Task) => (
          <Card key={t.id} className="p-3 shadow-sm">
            {t.event && <Badge color="slate">{t.event}</Badge>}
            <p className="font-bold text-sm mt-2 text-slate-900 dark:text-white">{t.title}</p>
            <div className="flex justify-between items-center mt-3 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="text-xs text-slate-500">{t.assignee || 'PIC Umum'}</span>
              <select className="text-xs bg-transparent text-indigo-500 font-bold focus:outline-none" value={t.status} onChange={(e) => onUpdateStatus(t.id, e.target.value)}>
                <option value="To Do" className="bg-white dark:bg-slate-900">To Do</option>
                <option value="In Progress" className="bg-white dark:bg-slate-900">In Progress</option>
                <option value="Done" className="bg-white dark:bg-slate-900">Done</option>
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-emerald-500" /> Papan Tugas
        </h2>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Buat Tugas</Button>
      </div>

      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Judul Tugas" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} />
            <Input label="PIC / Penanggung Jawab" value={formData.assignee} onChange={(e:any) => setFormData({...formData, assignee: e.target.value})} />
            <Input label="Untuk Acara" value={formData.event} onChange={(e:any) => setFormData({...formData, event: e.target.value})} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('To Do', 'text-slate-500')}
        {renderColumn('In Progress', 'text-amber-500')}
        {renderColumn('Done', 'text-emerald-500')}
      </div>
    </div>
  );
}
