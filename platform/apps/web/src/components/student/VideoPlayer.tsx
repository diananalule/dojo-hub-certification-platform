'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, VideoOff } from 'lucide-react';
import { TopicDto } from '@dojo-hub/shared';
import { youTubeEmbedUrl, youTubeId } from '@/lib/video';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * Keyed by topic.id from the parent (see CoursePlayer), so switching topics remounts
 * this component fresh — resetting currentTime/hasFiredWatched without an effect.
 */
export function VideoPlayer({ topic, onWatched, watched }: { topic: TopicDto; onWatched: () => void; watched: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const hasFiredWatched = useRef(false);

  const activeSubtitle = [...topic.subtitles].reverse().find((s) => s.timeSeconds <= currentTime);
  const ytId = youTubeId(topic.videoUrl);

  return (
    <div className="space-y-3">
      {!topic.videoUrl ? (
        // Reading/exercise lesson — no player, but the topic still completes normally
        // via "Mark as Complete" below.
        <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-navy-200 bg-navy-50 px-4 py-6 text-navy-500">
          <VideoOff className="w-5 h-5 shrink-0" />
          <span className="text-sm">This lesson has no video — work through the notes below.</span>
        </div>
      ) : (
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
        {ytId ? (
          <iframe
            key={topic.id}
            src={youTubeEmbedUrl(ytId)}
            title={topic.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <video
            ref={videoRef}
            key={topic.id}
            src={topic.videoUrl}
            controls
            className="w-full h-full"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => {
              if (!hasFiredWatched.current) {
                hasFiredWatched.current = true;
                onWatched();
              }
            }}
          />
        )}
        {activeSubtitle && !ytId && (
          <div className="absolute bottom-14 left-0 right-0 flex justify-center px-4 pointer-events-none">
            <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg max-w-lg text-center">{activeSubtitle.text}</span>
          </div>
        )}
      </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-navy-950">{topic.title}</h3>
          {topic.description && <p className="text-xs text-navy-500 mt-1">{topic.description}</p>}
        </div>
        {watched ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={onWatched} className="shrink-0 whitespace-nowrap">
            Mark as Complete
          </Button>
        )}
      </div>

      {topic.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topic.tools.map((tool) => (
            <Badge key={tool} tone="indigo">
              {tool}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
