import React from 'react';
import { useWeddingConfig } from '../context/WeddingConfigContext';

export const VenueSection: React.FC = () => {
  const { config } = useWeddingConfig();

  return (
    <section className="section-block">
      <h2 className="section-title">Venue</h2>
      
      <img
        src="/assets/line_divider.png"
        alt="Divider"
        className="floral-divider"
      />

      <img
        src="/assets/place_icon.png"
        alt="Location Pin"
        className="heart-pin-icon"
      />

      <h3 className="venue-title">{config.venue.name}</h3>
      <p className="venue-subtitle">{config.venue.subtitle}</p>

      {/* Palace & Lanterns Illustration or Custom Venue Photo */}
      {config.venue.imageUrl && (
        <img
          src={config.venue.imageUrl}
          alt={config.venue.name}
          className="venue-card-img"
        />
      )}

      {/* Embedded Google Map Frame */}
      {config.venue.mapsEmbedUrl && (
        <div className="venue-map-container">
          <iframe
            src={config.venue.mapsEmbedUrl}
            title={`Google Map ${config.venue.name}`}
            className="venue-map-iframe"
            loading="lazy"
          />
        </div>
      )}

      {config.venue.mapsUrl && (
        <a
          href={config.venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="google-maps-btn"
        >
          Google Maps Directions
        </a>
      )}
    </section>
  );
};
