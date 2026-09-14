import React, { useRef, useState } from 'react';
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

  const handlePlayEnvelope = () => {
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
          console.warn('Video play catch:', err);
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
    }, 900);
  };

  if (isRemoved) return null;

  return (
    <div
      className="envelope-overlay"
      onClick={handlePlayEnvelope}
      onTouchStart={handlePlayEnvelope}
      style={{
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        willChange: 'opacity',
        cursor: 'pointer',
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
          backgroundColor: '#000000',
        }}
      >
        {/* Real Starting Video Poster Image (Guarantees immediate display on all phones) */}
        {!isPlaying && (
          <img
            src="/assets/starting_vid_poster.jpg"
            alt="Wedding Invitation Envelope"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 5,
              display: 'block',
              backgroundColor: '#000000',
            }}
          />
        )}

        {/* The Starting Envelope Opening Video */}
        <video
          key={config.video.startingVidUrl}
          ref={videoRef}
          src={config.video.startingVidUrl}
          poster="/assets/starting_vid_poster.jpg"
          playsInline
          muted
          autoPlay={false}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleFinish}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            zIndex: isPlaying ? 10 : 2,
            backgroundColor: '#000000',
          }}
        />

        {/* Subtle pulsing glow over the wax seal to invite tap */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              boxShadow: '0 0 35px rgba(212, 175, 55, 0.65)',
              animation: 'pulse-seal 2s infinite ease-in-out',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          />
        )}
      </div>
    </div>
  );
};


