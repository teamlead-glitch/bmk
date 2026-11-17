'use client';

/* eslint-disable @next/next/no-img-element -- YouTube thumbnail */
import { useEffect, useState } from 'react';

/**
 * YouTube background (home-banner "video_url"): the video's thumbnail first, then a muted,
 * looping, control-free embed that fades in once loaded. Reduced motion keeps the thumbnail.
 * youtube-nocookie.com: no YouTube cookies until a visitor interacts with the player.
 */
export function HeroYouTube({ id }: { id: string }) {
  const [play, setPlay] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  useEffect(() => {
    // Mounted on the client only, so the server HTML (and the LCP) is just the thumbnail
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once after hydration
    setPlay(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id, // loop needs the playlist set to the same video
    controls: '0',
    playsinline: '1',
    rel: '0',
    disablekb: '1',
    iv_load_policy: '3',
    modestbranding: '1',
  });

  return (
    <div className="hero-yt-frame absolute inset-0">
      <img
        src={thumb}
        alt=""
        className="size-full object-cover"
        fetchPriority="high"
        onLoad={(e) => {
          // maxresdefault is missing on some videos: YouTube then serves a 120×90 grey image
          if (e.currentTarget.naturalWidth <= 120 && !thumb.includes('hqdefault')) setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }}
        onError={() => !thumb.includes('hqdefault') && setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
      />
      {play && (
        <iframe
          className={`hero-yt ${loaded ? 'is-loaded' : ''}`}
          src={`https://www.youtube-nocookie.com/embed/${id}?${params}`}
          title="Background video"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
