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

  const handleOpen = () => {
    if (isPlaying || isFadingOut) return;
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          // Video playing smoothly
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
    }, 850);
  };

  if (isRemoved) return null;

  return (
    <div
      className="envelope-overlay"
      onClick={handleOpen}
      onTouchStart={handleOpen}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#f6ebd9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        cursor: 'pointer',
        overflow: 'hidden',
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
          backgroundColor: '#f6ebd9',
        }}
      >
        {/* The Clean Starting Video with its real poster image */}
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
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: '#f6ebd9',
          }}
        />

        {/* Perfectly Centered Wax Seal Glow */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: '51.8%',
              left: '49.5%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            <div
              style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                border: '2px solid rgba(212, 175, 55, 0.5)',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.55)',
                animation: 'pulse-seal-center 2s infinite ease-in-out',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
