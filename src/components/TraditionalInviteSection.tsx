import React from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

export const TraditionalInviteSection: React.FC = () => {
  const { config } = useWeddingConfig();

  return (
    <section className="card-section">
      {/* 356px x 734px Exact Moorish Arched Frame Container */}
      <div className="exact-moorish-card">
        
        {/* The Exact Gold Moorish Arch Frame Image */}
        <img
          src="/assets/gold_frame.png"
          alt="Moorish Arch Frame"
          className="moorish-frame-img"
        />

        {/* Inner Card Content */}
        <div className="moorish-card-content">
          
          {/* Top Bismillah Calligraphy */}
          <div className="card-bismillah-box">
            <img
              src="/assets/bismillah_vector.png"
              alt="Bismillah"
              className="card-bismillah-img"
            />
          </div>

          {/* Floral Knot Accent */}
          <div className="card-knot-box">
            <img
              src="/assets/decor_element.png"
              alt="Knot Accent"
              className="card-knot-img"
            />
          </div>

          {/* Dynamic Arabic Text Block */}
          <div className="card-arabic-text" dir="rtl">
            <p className="arabic-line-title">
              {config.names.arabicTitle}
            </p>

            <div className="arabic-lines-group">
              <p>{config.names.arabicHeader1}</p>
              <p>{config.names.arabicHeader2}</p>
              <p>{config.names.arabicHeader3}</p>
            </div>

            <div className="arabic-lines-group">
              <p>وذلك بمشيئة الله تعالى يوم</p>
              <p>{config.names.arabicDateText}</p>
              <p>{config.names.arabicTimeText}</p>
            </div>

            <p className="arabic-line-hall">بقاعة</p>
          </div>

          {/* Script Venue Name */}
          <p className="card-venue-script">
            {config.venue.name}
          </p>

          {/* Bottom Floral Divider Line */}
          <div className="card-bottom-flower-box">
            <img
              src="/assets/line_flower.png"
              alt="Floral Line"
              className="card-bottom-flower-img"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
