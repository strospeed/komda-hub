import React, { useState, useMemo, useEffect } from 'react';
import { Music, Plus, Trash2, X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Textarea, Badge } from './FormUI'; // Pastikan diimpor sesuai lokasi file input/badge Anda
import { Song } from '../types';

export default function WorshipSongLibraryView({ songs, onAdd, onDelete }: { songs: Song[]; onAdd: (s: any) => void; onDelete: (id: string) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [transposeStep, setTransposeStep] = useState(0);
  const [formData, setFormData] = useState({ title: '', key: 'C', lyrics: '' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onAdd(formData); 
    setIsAdding(false); 
    setFormData({ title: '', key: 'C', lyrics: '' }); 
  };

  const transposeChord = (chord: string, semitones: number): string => {
    const CHORDS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    const [, root, modifier] = match;
    let index = CHORDS.indexOf(root);
    if (index === -1) return chord;
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    return CHORDS[newIndex] + modifier;
  };

  const getTransformedLyrics = (lyrics: string) => {
    if (transposeStep === 0) return lyrics;
    return lyrics.replace(/\[(.*?)\]/g, (match, chordGroup) => {
      const transposed = chordGroup.split(' ').map((c: string) => transposeChord(c, transposeStep)).join(' ');
      return `[${transposed}]`;
    });
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((s: Song) => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lyrics.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage) || 1;
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSongs.slice(start, start + itemsPerPage);
  }, [filteredSongs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-500" /> Database Pujian
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Koleksi lirik, chord lagu pujian, dan fitur transpose nada.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Tambah Lagu</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="w-full sm:w-80">
          <Input 
            placeholder="Cari judul lagu atau lirik..." 
            value={searchQuery} 
            onChange={(e: any) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Menampilkan {paginatedSongs.length} dari total {filteredSongs.length} lagu {searchQuery && `(hasil pencarian "${searchQuery}")`}
        </div>
      </div>

      {selectedSong && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => { setSelectedSong(null); setTransposeStep(0); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><X className="w-6 h-6"/></button>
            
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge color="rose">Original Key: {selectedSong.key}</Badge>
                {transposeStep !== 0 && <Badge color="indigo">Transpose: {transposeStep > 0 ? `+${transposeStep}` : transposeStep}</Badge>}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-xs font-bold px-2 text-slate-500">Chord:</span>
                <button onClick={() => setTransposeStep(prev => prev - 1)} className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg shadow">-</button>
                <button onClick={() => setTransposeStep(0)} className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">Reset</button>
                <button onClick={() => setTransposeStep(prev => prev + 1)} className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg shadow">+</button>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedSong.title}</h3>
            
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {getTransformedLyrics(selectedSong.lyrics || 'Tidak ada lirik.')}
              </pre>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="danger" onClick={() => { if (confirm('Hapus lagu?')) { onDelete(selectedSong.id); setSelectedSong(null); } }}>
                <Trash2 className="w-4 h-4" /> Hapus Lagu
              </Button>
              <Button onClick={() => { setSelectedSong(null); setTransposeStep(0); }} variant="secondary">Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <Card className="border-rose-500/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input label="Judul Lagu" required value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} className="flex-1" />
              <Input label="Nada Dasar" required value={formData.key} onChange={(e:any) => setFormData({...formData, key: e.target.value})} className="w-24" />
            </div>
            <Textarea label="Lirik & Chord (Cth: [C] [G])" rows={6} value={formData.lyrics} onChange={(e:any) => setFormData({...formData, lyrics: e.target.value})} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button type="submit">Simpan</Button></div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paginatedSongs.map((s: Song) => (
          <Card key={s.id} onClick={() => { setSelectedSong(s); setTransposeStep(0); }} className="group relative overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all">
            <div className="absolute top-0 right-0 bg-rose-500 text-white font-bold text-xs px-3 py-1 rounded-bl-xl shadow-md">Key: {s.key}</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2 pr-8">{s.title}</h3>
            <p className="text-xs text-slate-500 mt-3 font-mono whitespace-pre-wrap line-clamp-4">{s.lyrics || 'Lirik belum tersedia.'}</p>
          </Card>
        ))}
        {paginatedSongs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic">
            Tidak ada lagu yang ditemukan sesuai pencarian.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="secondary" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            ← Sebelumnya
          </Button>
          
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Halaman {currentPage} dari {totalPages}
          </span>

          <Button 
            variant="secondary" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Berikutnya →
          </Button>
        </div>
      )}
    </div>
  );
}
