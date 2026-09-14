import React, { useState, useEffect } from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

export const CountdownSection: React.FC = () => {
  const { config } = useWeddingConfig();
  const targetDate = new Date(config.date.isoDateTime).getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (isNaN(difference) || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section className="section-block">
      <h2 className="section-title">The Celebration Begins</h2>
      
      <img
        src="/assets/line_divider.png"
        alt="Divider"
        className="floral-divider"
      />

      <div className="countdown-digits">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span> : </span>
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span> : </span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span> : </span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>

      <div className="countdown-labels">
        <span>Days</span>
        <span>Hours</span>
        <span>Minutes</span>
        <span>Seconds</span>
      </div>
    </section>
  );
};
