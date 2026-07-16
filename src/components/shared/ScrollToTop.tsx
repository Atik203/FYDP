import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full',
        'bg-[#3b5bdb] text-white shadow-[0_4px_16px_rgba(59,91,219,0.4)]',
        'hover:bg-[#2d4ab8] hover:shadow-[0_6px_24px_rgba(59,91,219,0.55)]',
        'transition-all duration-300 ease-in-out',
        'dark:shadow-[0_4px_16px_rgba(59,91,219,0.25)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none',
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}