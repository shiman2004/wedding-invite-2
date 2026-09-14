import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

interface ScratchItemProps {
  label: string;
  value: string;
}

const ScratchItem: React.FC<ScratchItemProps> = ({ label, value }) => {
  const { config } = useWeddingConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratchedEnough, setIsScratchedEnough] = useState(false);
  const hasTriggeredRevealRef = useRef(false);

  // Initialize canvas with dynamic theme gold shimmer texture
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = 94;
    const height = 94;
    const dpr = window.devicePixelRatio || 2;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // 1. Luxury Gold / Sand Gradient matching active theme
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, config.theme.parchment);
    gradient.addColorStop(0.3, config.theme.oudLight);
    gradient.addColorStop(0.6, config.theme.oud);
    gradient.addColorStop(0.85, config.theme.oudLight);
    gradient.addColorStop(1, config.theme.oud);

    // Rounded rectangle clip
    const radius = 14;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Subtle luxury diagonal pattern lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // 3. Shimmer highlight radial spot
    const radial = ctx.createRadialGradient(width * 0.35, height * 0.35, 2, width * 0.35, height * 0.35, 45);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    radial.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
    radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.35, 45, 0, Math.PI * 2);
    ctx.fill();

    // 4. Subtle gold border line
    ctx.strokeStyle = config.theme.oud;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Delicate sparkle icon in center of unscratched state
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', width / 2, height / 2);
  }, [config.theme]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const triggerFullReveal = useCallback(() => {
    if (hasTriggeredRevealRef.current) return;
    hasTriggeredRevealRef.current = true;
    setIsScratchedEnough(true);
    setTimeout(() => {
      setIsRevealed(true);
    }, 450);
  }, []);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dpr = window.devicePixelRatio || 2;
    const currentPoint = { x: x * dpr, y: y * dpr };

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 32 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 18 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lastPointRef.current = currentPoint;
    triggerFullReveal();
  }, [triggerFullReveal]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRevealed || hasTriggeredRevealRef.current) return;
    isDrawingRef.current = true;
    lastPointRef.current = null;
    const touch = e.touches[0];
    if (touch) scratchAt(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawingRef.current || isRevealed) return;
    const touch = e.touches[0];
    if (touch) scratchAt(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    triggerFullReveal();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRevealed || hasTriggeredRevealRef.current) return;
    isDrawingRef.current = true;
    lastPointRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current || isRevealed) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    triggerFullReveal();
  };

  const handleClick = () => {
    if (!isRevealed && !hasTriggeredRevealRef.current) {
      triggerFullReveal();
    }
  };

  return (
    <div className="scratch-card-item">
      <div 
        className={`scratch-box-container ${isScratchedEnough ? 'scratched-success' : ''}`}
        ref={containerRef}
        onClick={handleClick}
      >
        {/* Revealed Secret Underneath */}
        <div className="scratch-revealed-layer">
          <span className={`scratch-value-text ${isScratchedEnough ? 'value-revealed-pop' : ''}`}>
            {value}
          </span>
        </div>

        {/* Scratchable Canvas Layer */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className={`scratch-canvas ${isScratchedEnough ? 'fade-out' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        )}
      </div>

      {/* Label under box */}
      <span className="scratch-label-text">{label}</span>
    </div>
  );
};

export const ScratchCardSection: React.FC = () => {
  const { config } = useWeddingConfig();

  return (
    <section className="scratch-section">
      <div className="scratch-content-wrapper">
        
        {/* Header Title */}
        <h2 className="scratch-title font-script">The Date</h2>

        {/* Subtitle with decorative stars */}
        <div className="scratch-subtitle-box">
          <span className="scratch-sparkle-star">✦</span>
          <p className="scratch-subtitle">Scratch to reveal the date</p>
          <span className="scratch-sparkle-star">✦</span>
        </div>

        {/* 3 Interactive Scratch Cards synced with Admin Date */}
        <div className="scratch-cards-grid">
          <ScratchItem label="DAY" value={config.date.day} />
          <ScratchItem label="MONTH" value={config.date.month} />
          <ScratchItem label="YEAR" value={config.date.year} />
        </div>

      </div>
    </section>
  );
};
