import React, { useEffect, useRef, useState } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  autoPlayTrigger?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ autoPlayTrigger }) => {
  const { config } = useWeddingConfig();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = config.music.volume ?? 0.6;
    }
  }, [config.music.volume]);

  // Handle auto-play on first interaction or when invitation opened
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.volume = config.music.volume ?? 0.6;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    };

    if (autoPlayTrigger && audioRef.current && !isPlaying) {
      audioRef.current.volume = config.music.volume ?? 0.6;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [autoPlayTrigger, isPlaying, config.music.volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  };

  return (
    <>
      <audio
        key={config.music.musicUrl}
        ref={audioRef}
        src={config.music.musicUrl}
        loop
        preload="auto"
      />

      <button
        onClick={togglePlay}
        className={`floating-audio-btn ${isPlaying ? 'pulse-ring' : ''}`}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isPlaying ? (
          <Pause size={22} color="#ffffff" />
        ) : (
          <Play size={22} color="#ffffff" style={{ marginLeft: '2px' }} />
        )}
      </button>
    </>
  );
};
