'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BookOpen, Clock, Layers, PlayCircle } from 'lucide-react';
import { TrackSummaryDto } from '@dojo-hub/shared';
import { Badge } from '../ui/Badge';
import { TrackCover } from './TrackCover';

/**
 * Course card with an uploaded cover photo, falling back to the generated
 * illustration when no photo has been set. On desktop, hovering reveals a detail
 * panel (the pattern Udemy/Coursera use) so learners can judge a course without
 * navigating away; touch devices never trigger it and just tap through.
 */
export function TrackCard({
  track,
  href,
}: {
  track: TrackSummaryDto;
  /** Overridden on the public site, where cards lead to the preview, not the player. */
  href?: string;
}) {
  const [panel, setPanel] = useState<{ left: number; top: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lessons = track.topicCount;

  const open = () => {
    // Positive capability check: only pointer devices that genuinely hover get the
    // panel. `(hover: none)` is unreliable — some browsers report it inconsistently.
    if (!window.matchMedia('(hover: hover)').matches) return;
    timer.current = setTimeout(() => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const W = 320;
      const H = 340;
      // Flip to the card's left when there isn't room on the right, and lift the
      // panel up if it would run past the bottom of the viewport.
      const left = r.right + 12 + W > window.innerWidth ? r.left - W - 12 : r.right + 12;
      const top = Math.max(12, Math.min(r.top, window.innerHeight - H - 12));
      setPanel({ left, top });
    }, 260);
  };

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setPanel(null);
  };

  return (
    <div ref={cardRef} className="relative h-full" onMouseEnter={open} onMouseLeave={close}>
      <Link
        href={href ?? `/learning/${track.id}`}
        className="card-lift flex flex-col bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-[0_1px_2px_rgba(5,7,12,0.04)] group h-full"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-100">
          {track.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded URL from object storage
            <img
              src={track.coverImageUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <TrackCover category={track.category.name} icon={track.icon} className="h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[12px] font-mono bg-black/55 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            {track.durationWeeks}w
          </span>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-11 h-11 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="red">{track.category.name}</Badge>
            <Badge tone="gray">{track.difficulty}</Badge>
          </div>
          <h4 className="font-bold text-sm text-navy-950 group-hover:text-crimson-600 transition-colors duration-300 line-clamp-2 min-h-[2.8rem]">
            {track.title}
          </h4>
          <p className="mt-auto flex items-center gap-3 text-[12px] font-mono text-navy-400 uppercase tracking-wide pt-0.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {track.moduleCount} module{track.moduleCount === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {lessons > 0 ? `${lessons} lesson${lessons === 1 ? '' : 's'}` : 'Project-based'}
            </span>
          </p>
        </div>
      </Link>

      {panel &&
        createPortal(
          // Portalled to <body>: the carousel's `overflow-x: auto` would otherwise
          // clip this panel, cutting off the button at the bottom.
          <div
            className="hidden lg:block fixed z-50 w-80 animate-scaleUp pointer-events-none"
            style={{ left: panel.left, top: panel.top }}
          >
            <HoverDetail track={track} href={href} />
          </div>,
          document.body,
        )}
    </div>
  );
}

function HoverDetail({ track, href }: { track: TrackSummaryDto; href?: string }) {
  return (
    <div className="pointer-events-auto">
      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/15 p-5 space-y-3">
        <h4 className="font-extrabold text-navy-950 leading-snug">{track.title}</h4>
        <p className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-wide text-navy-400">
          <span className="text-crimson-600 font-bold">{track.difficulty}</span>
          <span>•</span>
          <span>{track.durationWeeks} weeks</span>
        </p>
        <p className="text-xs text-navy-600 leading-relaxed line-clamp-5">{track.description}</p>
        <ul className="space-y-1.5 pt-1">
          <li className="flex items-center gap-2 text-xs text-navy-700">
            <Layers className="w-3.5 h-3.5 shrink-0 text-crimson-600" />
            {track.moduleCount} module{track.moduleCount === 1 ? '' : 's'} of structured content
          </li>
          <li className="flex items-center gap-2 text-xs text-navy-700">
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-crimson-600" />
            {track.topicCount > 0 ? `${track.topicCount} lessons to work through` : 'Project-based assessment'}
          </li>
          <li className="flex items-center gap-2 text-xs text-navy-700">
            <Clock className="w-3.5 h-3.5 shrink-0 text-crimson-600" />
            Verifiable certificate on completion
          </li>
        </ul>
        <Link
          href={href ?? `/learning/${track.id}`}
          className="block w-full text-center bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}
