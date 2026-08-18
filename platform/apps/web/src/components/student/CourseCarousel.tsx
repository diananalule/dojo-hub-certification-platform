'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Horizontally scrollable row of course cards with arrow controls, for when a
 * section has more courses than fit on screen. Arrows only appear when there is
 * actually something to scroll to, and the row stays swipeable on touch.
 */
export function CourseCarousel({ children }: { children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    // 8px tolerance: fractional widths mean scrollLeft rarely hits the exact end.
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const nudge = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    // Scroll by ~one screenful so cards land tidily rather than half-cut.
    el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <div className="relative group/row">
      {canLeft && <Arrow side="left" onClick={() => nudge(-1)} />}
      {canRight && <Arrow side="right" onClick={() => nudge(1)} />}

      <div
        ref={scroller}
        onScroll={sync}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

function Arrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Scroll to previous courses' : 'Scroll to more courses'}
      className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-black/[0.08] shadow-lg shadow-black/10
        flex items-center justify-center text-navy-700 hover:text-crimson-600 hover:scale-105
        opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-all duration-200
        ${side === 'left' ? '-left-4' : '-right-4'}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
