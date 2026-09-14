import React, { useRef, useState, useEffect } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

interface EnvelopeIntroProps {
  onOpen: () => void;
}

export const EnvelopeIntro: React.FC<EnvelopeIntroProps> = ({ onOpen }) => {
  const { config } = useWeddingConfig();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      if (video.currentTime === 0) {
        video.currentTime = 0.01;
      }
    };

    video.addEventListener('loadeddata', handleLoaded);
    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
    };
  }, [config.video.startingVidUrl]);

  const handlePlayMiddleSeal = () => {
    if (isPlaying || isFadingOut) return;
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          // Playing smoothly
        })
        .catch((err) => {
          console.warn('Video playback error:', err);
          handleFinish();
        });
    } else {
      handleFinish();
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || hasFinishedRef.current) return;

    if (video.duration && video.currentTime >= video.duration - 0.35) {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);
    onOpen();
    setTimeout(() => {
      setIsRemoved(true);
    }, 1000);
  };

  if (isRemoved) return null;

  return (
    <div
      className="envelope-overlay"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        willChange: 'opacity',
      }}
    >
      <div
        className="envelope-stage"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: 'var(--color-parchment)',
        }}
      >
        
        {/* The Starting Video (Configurable) */}
        <video
          key={config.video.startingVidUrl}
          ref={videoRef}
          src={config.video.startingVidUrl}
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleFinish}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: 'translateZ(0)',
          }}
        />

        {/* Clickable Middle Seal Hotspot */}
        {!isPlaying && (
          <div
            onClick={handlePlayMiddleSeal}
            onTouchStart={handlePlayMiddleSeal}
            role="button"
            aria-label="Click middle seal to play"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Subtle gentle pulse ring to invite the tap on the seal */}
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.55)',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.45)',
                animation: 'pulse-seal 2s infinite ease-in-out',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};
