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
      videoRef.current.muted = true;
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          // Playing smoothly
        })
        .catch((err) => {
          console.warn('Video playback error on mobile:', err);
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
      onClick={handlePlayMiddleSeal}
      onTouchStart={handlePlayMiddleSeal}
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        willChange: 'opacity',
        cursor: isPlaying ? 'default' : 'pointer',
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
        {/* Skip button in top corner for instant entry */}
        {!isPlaying && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 30,
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(134, 103, 57, 0.3)',
              color: 'var(--color-oud)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(6px)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Open Invitation ✉️
          </button>
        )}

        {/* The Starting Video */}
        <video
          key={config.video.startingVidUrl}
          ref={videoRef}
          src={config.video.startingVidUrl}
          playsInline
          muted
          autoPlay={false}
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

        {/* Interactive Tap Prompt & Wax Seal */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              zIndex: 20,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            {/* Glowing Center Wax Ring */}
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: '50%',
                  border: '2px solid rgba(212, 175, 55, 0.55)',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
                  animation: 'pulse-seal 2s infinite ease-in-out',
                }}
              />
              <span style={{ fontSize: '38px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>
                ✉️
              </span>
            </div>

            {/* Tap Prompt Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(134, 103, 57, 0.35)',
                padding: '8px 18px',
                borderRadius: '30px',
                boxShadow: '0 4px 16px rgba(134, 103, 57, 0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                  color: 'var(--color-oud)',
                  textTransform: 'uppercase',
                }}
              >
                Tap to Open Invitation
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

