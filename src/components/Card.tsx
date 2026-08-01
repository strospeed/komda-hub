import React from 'react';

function Card({
  children,
  className = '',
  onClik,
}: {
  children: React.ReactNode;
  className?: string;
  onClik?: () => void;
}) {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden ${className}`}
      onClick={onClik}
    >
      {children}
    </div>
  );
}

export default Card;
