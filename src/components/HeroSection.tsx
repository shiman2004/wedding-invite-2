import React, { useEffect, useRef } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

export const HeroSection: React.FC = () => {
  const { config } = useWeddingConfig();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isDrawing = false;

    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 1422;
    };

    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Smooth bottom 20% alpha fade
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.78, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      animId = requestAnimationFrame(drawFrame);
    };

    const startVideo = () => {
      video.play().catch(() => {});
    };

    const handleCanPlay = () => {
      if (!isDrawing) {
        isDrawing = true;
        drawFrame();
      }
      startVideo();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    if (video.readyState >= 2) {
      handleLoadedMetadata();
      handleCanPlay();
    }

    startVideo();

    const handleTouch = () => {
      if (video.paused) startVideo();
    };
    document.addEventListener('touchstart', handleTouch, { once: true });
    document.addEventListener('click', handleTouch, { once: true });

    return () => {
      cancelAnimationFrame(animId);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('click', handleTouch);
    };
  }, [config.video.bgVideoUrl]);

  return (
    <section className="hero-section">
      {/* Hidden Source Video */}
      <video
        key={config.video.bgVideoUrl}
        ref={videoRef}
        src={config.video.bgVideoUrl}
        muted
        playsInline
        loop
        preload="auto"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          visibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Canvas with Real-time Alpha Fade */}
      <div className="hero-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="hero-fade-canvas"
        />
      </div>

      {/* Overlay Typography - Dynamic from Admin Config */}
      <div className="hero-typography-overlay">
        <div className="hero-names-block">
          <h1 className="hero-name-script">{config.names.bride}</h1>
          <span className="hero-ampersand-italic">&</span>
          <h1 className="hero-name-script">{config.names.groom}</h1>
        </div>

        <p className="hero-date-text">{config.date.displayDate}</p>
        <p className="hero-time-text">{config.date.displayTime}</p>
      </div>
    </section>
  );
};
