import React, { useState } from 'react';
import { DollarSign, Plus, Download, Printer } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input, Select, Badge } from './FormUI';
import { Transaction } from '../types';

export default function FinanceView({ transactions, onAdd, stats }: { transactions: Transaction[]; onAdd: (t: any) => void; stats: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, amount: parseFloat(formData.amount) || 0, category: 'Kas Umum' });
    setIsAdding(false);
    setFormData({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleExportExcel = () => {
    let excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr><td colspan="5" style="font-size: 16px; font-weight: bold; text-align: center;">BUKU KAS - KOMDA HUB</td></tr>
          <tr><td colspan="5" style="font-size: 11px; text-align: center;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</td></tr>
          <tr><td colspan="5"></td></tr>
          <tr style="background-color: #4338ca; color: white; font-weight: bold; text-align: center;">
            <th style="padding: 6px; border: 1px solid #000;">Tanggal</th>
            <th style="padding: 6px; border: 1px solid #000;">Keterangan</th>
            <th style="padding: 6px; border: 1px solid #000;">Pemasukan (Rp)</th>
            <th style="padding: 6px; border: 1px solid #000;">Pengeluaran (Rp)</th>
            <th style="padding: 6px; border: 1px solid #000;">Saldo Akhir (Rp)</th>
          </tr>
    `;

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;

    sortedTransactions.forEach((t: any) => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      excelHTML += `
        <tr>
          <td style="border: 1px solid #000; text-align: center; mso-number-format:'\@';">${t.date}</td>
          <td style="border: 1px solid #000;">${t.description}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${t.type === 'income' ? amount : '-'}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${t.type === 'expense' ? amount : '-'}</td>
          <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${runningBalance}</td>
        </tr>
      `;
    });

    const totalIncome = sortedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = sortedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    excelHTML += `
          <tr style="background-color: #1e293b; color: white; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #000; text-align: right;">TOTAL KESELURUHAN:</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${totalIncome}</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${totalExpense}</td>
            <td style="border: 1px solid #000; text-align: right; mso-number-format:'#,##0';">${runningBalance}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Kas_KOMDA_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up pada browser untuk mencetak PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuangan KOMDA GKJ Slogohimo</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
          .header p { margin: 5px 0 0; color: #666; font-size: 12px; }
          .summary { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px; }
          .summary-card { flex: 1; border: 1px solid #ccc; padding: 12px; border-radius: 6px; text-align: center; }
          .summary-card h3 { margin: 0; font-size: 11px; color: #555; text-transform: uppercase; }
          .summary-card p { margin: 6px 0 0; font-size: 16px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background-color: #f4f4f4; }
          .text-right { text-align: right; }
          .income { color: #047857; font-weight: bold; }
          .expense { color: #b91c1c; font-weight: bold; }
          .footer { margin-top: 40px; text-align: right; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Keuangan KOMDA HUB</h1>
          <p>GKJ Slogohimo • Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Pemasukan</h3>
            <p style="color: #047857;">Rp ${(stats?.income || 0).toLocaleString('id-ID')}</p>
          </div>
          <div class="summary-card">
            <h3>Total Pengeluaran</h3>
            <p style="color: #b91c1c;">Rp ${(stats?.expense || 0).toLocaleString('id-ID')}</p>
          </div>
          <div class="summary-card">
            <h3>Saldo Akhir Kas</h3>
            <p>Rp ${(stats?.balance || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Jenis</th>
              <th class="text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
                <td><b>${t.description}</b></td>
                <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                <td class="text-right ${t.type === 'income' ? 'income' : 'expense'}">
                  ${t.type === 'income' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Bendahara KOMDA GKJ Slogohimo</p>
          <br><br>
          <p><b>( ............................................ )</b></p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-500 dark:text-emerald-400" /> Keuangan & Kas
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportExcel}><Download className="w-4 h-4" /> Export Excel</Button>
          <Button variant="secondary" onClick={handleExportPDF}><Printer className="w-4 h-4" /> Export PDF</Button>
          <Button variant="emerald" onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Catat Transaksi</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Rp {(stats?.income || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-rose-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">Rp {(stats?.expense || 0).toLocaleString('id-ID')}</p>
        </Card>
        <Card className="border-indigo-500/30">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Kas</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Rp {(stats?.balance || 0).toLocaleString('id-ID')}</p>
        </Card>
      </div>
      {isAdding && (
        <Card className="border-emerald-500/50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Jenis Transaksi" value={formData.type} onChange={(e:any) => setFormData({...formData, type: e.target.value})} options={[{value:'income',label:'Pemasukan (+)'},{value:'expense',label:'Pengeluaran (-)'}]} />
            <Input label="Jumlah (Rp)" type="number" required min="0" value={formData.amount} onChange={(e:any) => setFormData({...formData, amount: e.target.value})} placeholder="100000" />
            <Input label="Keterangan" required value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
            <Input label="Tanggal" type="date" required value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2"><Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button><Button variant="emerald" type="submit">Simpan Transaksi</Button></div>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
              <tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4">Jenis</th><th className="px-6 py-4 text-right">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: Transaction) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-xs font-mono">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{t.description}</td>
                  <td className="px-6 py-4"><Badge color={t.type === 'income' ? 'emerald' : 'rose'}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Badge></td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
