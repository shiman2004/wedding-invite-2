import React, { useRef } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const TimelineSection: React.FC = () => {
  const { config } = useWeddingConfig();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 70%', 'end 50%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.5,
  });

  // Calculate moving distance based on number of events
  const totalEvents = config.timeline.events.length || 4;
  const maxTravel = Math.max(160, (totalEvents - 1) * 78);

  const flowerY = useTransform(smoothProgress, [0, 1], [0, maxTravel]);
  const flowerRotate = useTransform(smoothProgress, [0, 1], [0, 180]);

  return (
    <section className="section-block">
      <h2 className="section-title">{config.timeline.sectionTitle || 'Event Timeline'}</h2>
      
      <img
        src="/assets/line_divider.png"
        alt="Divider"
        className="floral-divider"
      />

      <div ref={containerRef} className="timeline-container">
        <div className="timeline-line" />

        <motion.div
          className="timeline-moving-flower"
          style={{
            y: flowerY,
            rotate: flowerRotate,
          }}
        >
          <img
            src="/assets/flower_decor.png"
            alt="Scrolling Flower"
            className="timeline-flower"
          />
        </motion.div>

        {config.timeline.events.map((event) => (
          <div key={event.id} className="timeline-row">
            <div className="timeline-time">{event.time}</div>
            
            <div className="timeline-icon-box">
              <div className="timeline-dot" />
            </div>

            <div className="timeline-desc" style={{ whiteSpace: 'pre-line' }}>
              {event.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
