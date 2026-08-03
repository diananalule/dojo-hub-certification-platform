'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Rect {
  offset: number;
  size: number;
}

/**
 * Drives a single "sliding pill" highlight that glides between sibling nav/tab
 * items on hover, with a short delay before it starts moving (so quick cursor
 * passes don't cause flicker) and a spring-like easing on the move itself.
 *
 * Usage: register each item's DOM node via `registerItem(id)`, call `focusItem(id)`
 * on mouse enter, and either `release()` (hide entirely — for nav rails that already
 * show a persistent "active" state some other way) or `restTo(id)` (glide back to a
 * resting/selected item — for tab bars) on mouse leave of the whole group.
 */
export function useSlidingIndicator(direction: 'vertical' | 'horizontal' = 'horizontal') {
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(
    (el: HTMLElement): Rect =>
      direction === 'horizontal' ? { offset: el.offsetLeft, size: el.offsetWidth } : { offset: el.offsetTop, size: el.offsetHeight },
    [direction],
  );

  const registerItem = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(id, el);
      else itemRefs.current.delete(id);
    },
    [],
  );

  const clearTimers = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const focusItem = useCallback(
    (id: string, opts?: { immediate?: boolean }) => {
      const el = itemRefs.current.get(id);
      if (!el) return;
      clearTimers();
      setVisible(true);
      if (opts?.immediate) {
        setRect(measure(el));
      } else {
        showTimer.current = setTimeout(() => setRect(measure(el)), 70);
      }
    },
    [measure],
  );

  const release = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setVisible(false), 200);
  }, []);

  const restTo = useCallback(
    (id: string) => {
      clearTimers();
      const el = itemRefs.current.get(id);
      if (el) hideTimer.current = setTimeout(() => setRect(measure(el)), 40);
    },
    [measure],
  );

  useEffect(() => () => clearTimers(), []);

  const indicatorStyle: React.CSSProperties = rect
    ? direction === 'horizontal'
      ? { transform: `translateX(${rect.offset}px)`, width: rect.size, opacity: visible ? 1 : 0 }
      : { transform: `translateY(${rect.offset}px)`, height: rect.size, opacity: visible ? 1 : 0 }
    : { opacity: 0 };

  return { registerItem, focusItem, release, restTo, indicatorStyle };
}
