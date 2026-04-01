import type { ComponentChildren } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { Header } from './Header';
import { CrawlBar } from './CrawlBar';
import { ScanlineOverlay } from './ScanlineOverlay';
import bgMusic from '../../assets/audio/background.mp3';
import volumeOnIcon from '../../assets/images/icons/volume-on.png';
import volumeOffIcon from '../../assets/images/icons/volume-off.png';

interface ShellProps {
  children: ComponentChildren;
}

export function Shell({ children }: ShellProps) {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1.0;
  }, []);

  const toggleMute = (e: Event) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.muted = true;
    }
    setMuted(!muted);
  };

  return (
    <>
      <div class="ws4000-shell">
        <audio ref={audioRef} src={bgMusic} loop muted preload="auto" />
        <main class="ws4000-content">
          <Header />
          <button class="audio-toggle" onClick={toggleMute} type="button" aria-label={muted ? 'Unmute' : 'Mute'}>
            <span class="audio-toggle__label">Music</span>
            <img src={muted ? volumeOffIcon : volumeOnIcon} alt={muted ? 'Sound off' : 'Sound on'} />
          </button>
          {children}
          <CrawlBar />
        </main>
      </div>
      <ScanlineOverlay />
    </>
  );
}
