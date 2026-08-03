import Link from 'next/link';
import { TrackSummaryDto } from '@dojo-hub/shared';
import { Badge } from '../ui/Badge';
import { TrackCover } from './TrackCover';

export function TrackCard({ track }: { track: TrackSummaryDto }) {
  return (
    <Link
      href={`/learning/${track.id}`}
      className="card-lift block bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-[0_1px_2px_rgba(5,7,12,0.04)] group"
    >
      <div className="relative">
        <TrackCover category={track.category.name} icon={track.icon} />
        <div className="absolute inset-0 bg-crimson-600/0 group-hover:bg-crimson-600/10 transition-colors duration-500 pointer-events-none" />
        <span className="absolute top-2 right-2 text-[10px] font-mono bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          {track.durationWeeks}w
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge tone="red">{track.category.name}</Badge>
          <Badge tone="gray">{track.difficulty}</Badge>
        </div>
        <h4 className="font-bold text-sm text-navy-950 group-hover:text-crimson-600 transition-colors duration-300 line-clamp-2">{track.title}</h4>
        <p className="text-xs text-navy-500 line-clamp-2">{track.description}</p>
        <p className="text-[10px] font-mono text-navy-400 uppercase pt-1 tracking-wide">
          {track.moduleCount} module{track.moduleCount === 1 ? '' : 's'}
          {track.topicCount > 0 ? ` • ${track.topicCount} lesson${track.topicCount === 1 ? '' : 's'}` : ' • project-based'}
        </p>
      </div>
    </Link>
  );
}
