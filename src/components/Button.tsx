import React from 'react';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: any) {
  const baseStyle =
    'px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    emerald:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/30',
    danger:
      'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20',
    discord:
      'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-[#5865F2]/25',
    ghost: 'hover:bg-slate-800 text-slate-400 hover:text-slate-200',
  };
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
