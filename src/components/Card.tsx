import React from 'react';

export const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);
