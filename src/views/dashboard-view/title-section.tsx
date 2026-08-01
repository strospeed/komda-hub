import { Sparkles } from 'lucide-react';
import React from 'react';

const TitleSection = ({
  title,
  className,
}: {
  title: string;
  className: string;
}) => {
  return (
    <div>
      <div className={className}>
        <Sparkles className="w-3.5 h-3.5" /> {title}
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Selamat Datang di{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          KOMDA HUB
        </span>
      </h2>
      <p className="text-slate-400 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
        Platform manajemen terpadu untuk pelayanan pemuda, inventaris
        multimedia, jadwal ibadah, dan koordinasi Discord komunitas gereja.
      </p>
    </div>
  );
};

export default TitleSection;
