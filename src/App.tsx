return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar tetap sticky/fixed di samping */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* ... isi sidebar ... */}
      </aside>

      {/* Gunakan min-h-screen agar area konten bisa di-scroll mouse ke bawah */}
      <main 
        className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto text-slate-900 dark:text-slate-100 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: isDarkMode 
            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.92)), url('${DARK_WALLPAPER}')`
            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.50), rgba(241, 245, 249, 0.65)), url('${LIGHT_WALLPAPER}')`
        }}
      >
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
          {/* ... header ... */}
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1 relative z-10">
          {/* ... konten views ... */}
        </div>
      </main>
    </div>
  );
