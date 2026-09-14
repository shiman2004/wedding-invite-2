import React, { useState, useEffect, useRef } from 'react';
import { useWeddingConfig, THEME_PRESETS } from '../context/WeddingConfigContext';
import { 
  Settings, 
  X, 
  Video, 
  Heart, 
  Calendar, 
  MapPin, 
  Palette, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'names' | 'date' | 'venue' | 'theme' | 'backup'>('theme');
  const [savedBadge, setSavedBadge] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const {
    config,
    updateNames,
    updateDate,
    updateVideo,
    updateVenue,
    updateTheme,
    applyPreset,
    resetDefaults,
    exportConfigJson,
    importConfigJson,
  } = useWeddingConfig();

  // Keyboard shortcut Ctrl+Shift+A to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSavedNotice = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  // Video file upload handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateVideo({ startingVidUrl: url });
      triggerSavedNotice();
    }
  };

  // Venue image upload handler
  const handleVenueImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateVenue({ imageUrl: event.target.result as string });
          triggerSavedNotice();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export JSON file
  const handleExport = () => {
    const jsonStr = exportConfigJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_config_${config.names.bride}_${config.names.groom}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && importConfigJson(content)) {
          triggerSavedNotice();
          alert('Configuration imported successfully!');
        } else {
          alert('Failed to import configuration. Please check the JSON format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      {/* Discreet Floating Admin Gear Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="admin-floating-trigger"
        aria-label="Open Invitation Admin Panel"
        title="Admin Panel (Ctrl+Shift+A)"
      >
        <Settings size={18} />
        <span>Admin</span>
      </button>

      {/* Admin Panel Modal Overlay */}
      {isOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="admin-header">
              <div className="admin-header-title">
                <Sparkles size={20} className="admin-icon-gold" />
                <h3>Invitation Admin Panel</h3>
              </div>
              <div className="admin-header-actions">
                {savedBadge && (
                  <span className="admin-saved-badge">
                    <Check size={14} /> Saved Live
                  </span>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="admin-close-btn"
                  aria-label="Close Admin Panel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-tabs-bar">
              <button
                className={`admin-tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveTab('theme')}
              >
                <Palette size={16} />
                <span>Theme Colors</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'names' ? 'active' : ''}`}
                onClick={() => setActiveTab('names')}
              >
                <Heart size={16} />
                <span>Names</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'date' ? 'active' : ''}`}
                onClick={() => setActiveTab('date')}
              >
                <Calendar size={16} />
                <span>Date & Time</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
              >
                <Video size={16} />
                <span>Starting Vid</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'venue' ? 'active' : ''}`}
                onClick={() => setActiveTab('venue')}
              >
                <MapPin size={16} />
                <span>Venue & Map</span>
              </button>

              <button
                className={`admin-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => setActiveTab('backup')}
              >
                <RotateCcw size={16} />
                <span>Backup</span>
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="admin-body">
              
              {/* TAB 1: THEME COLORS */}
              {activeTab === 'theme' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">🎨 1-Click Luxury Presets</h4>
                  <div className="admin-presets-grid">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        className="admin-preset-card"
                        onClick={() => {
                          applyPreset(preset.id);
                          triggerSavedNotice();
                        }}
                      >
                        <div className="preset-color-dots">
                          <span style={{ backgroundColor: preset.colors.oud }} />
                          <span style={{ backgroundColor: preset.colors.parchment }} />
                          <span style={{ backgroundColor: preset.colors.olive }} />
                        </div>
                        <span className="preset-name">{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  <h4 className="admin-section-heading" style={{ marginTop: '24px' }}>
                    🖌️ Custom Color Palette
                  </h4>
                  <div className="admin-color-pickers-grid">
                    <div className="color-field">
                      <label>Primary Oud Gold</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.oud}
                          onChange={(e) => {
                            updateTheme({ oud: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.oud}
                          onChange={(e) => {
                            updateTheme({ oud: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>

                    <div className="color-field">
                      <label>Light Oud Gold</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.oudLight}
                          onChange={(e) => {
                            updateTheme({ oudLight: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.oudLight}
                          onChange={(e) => {
                            updateTheme({ oudLight: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>

                    <div className="color-field">
                      <label>Parchment Background</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.parchment}
                          onChange={(e) => {
                            updateTheme({ parchment: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.parchment}
                          onChange={(e) => {
                            updateTheme({ parchment: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>

                    <div className="color-field">
                      <label>Card Background</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.parchmentCard}
                          onChange={(e) => {
                            updateTheme({ parchmentCard: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.parchmentCard}
                          onChange={(e) => {
                            updateTheme({ parchmentCard: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>

                    <div className="color-field">
                      <label>Olive Accent</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.olive}
                          onChange={(e) => {
                            updateTheme({ olive: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.olive}
                          onChange={(e) => {
                            updateTheme({ olive: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>

                    <div className="color-field">
                      <label>Dark Charcoal Text</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          value={config.theme.charcoal}
                          onChange={(e) => {
                            updateTheme({ charcoal: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                        <input
                          type="text"
                          value={config.theme.charcoal}
                          onChange={(e) => {
                            updateTheme({ charcoal: e.target.value });
                            triggerSavedNotice();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NAMES */}
              {activeTab === 'names' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">💍 Couple Names</h4>
                  
                  <div className="admin-form-group">
                    <label>Bride Name</label>
                    <input
                      type="text"
                      value={config.names.bride}
                      onChange={(e) => {
                        updateNames({ bride: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="e.g. Amira"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Groom Name</label>
                    <input
                      type="text"
                      value={config.names.groom}
                      onChange={(e) => {
                        updateNames({ groom: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="e.g. Yusuf"
                    />
                  </div>

                  <h4 className="admin-section-heading" style={{ marginTop: '20px' }}>
                    📜 Arabic Invitation Card Text
                  </h4>

                  <div className="admin-form-group">
                    <label>Arabic Title Line</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={config.names.arabicTitle}
                      onChange={(e) => {
                        updateNames({ arabicTitle: e.target.value });
                        triggerSavedNotice();
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Arabic Date Text</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={config.names.arabicDateText}
                      onChange={(e) => {
                        updateNames({ arabicDateText: e.target.value });
                        triggerSavedNotice();
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Arabic Time Text</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={config.names.arabicTimeText}
                      onChange={(e) => {
                        updateNames({ arabicTimeText: e.target.value });
                        triggerSavedNotice();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: DATE & TIME */}
              {activeTab === 'date' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">📅 Wedding Date & Time</h4>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Day (for Scratch Card)</label>
                      <input
                        type="text"
                        value={config.date.day}
                        onChange={(e) => {
                          updateDate({ day: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="20"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Month (for Scratch Card)</label>
                      <input
                        type="text"
                        value={config.date.month}
                        onChange={(e) => {
                          updateDate({ month: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="MAY"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Year (for Scratch Card)</label>
                      <input
                        type="text"
                        value={config.date.year}
                        onChange={(e) => {
                          updateDate({ year: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="2027"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Hero Display Date</label>
                    <input
                      type="text"
                      value={config.date.displayDate}
                      onChange={(e) => {
                        updateDate({ displayDate: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="May 20, 2027"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Hero Display Time</label>
                    <input
                      type="text"
                      value={config.date.displayTime}
                      onChange={(e) => {
                        updateDate({ displayTime: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="from 4:00 PM"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Countdown ISO Target Date (YYYY-MM-DDTHH:MM:SS)</label>
                    <input
                      type="datetime-local"
                      value={config.date.isoDateTime.substring(0, 16)}
                      onChange={(e) => {
                        updateDate({ isoDateTime: e.target.value });
                        triggerSavedNotice();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: STARTING VIDEO */}
              {activeTab === 'video' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">🎬 Starting Envelope Video</h4>

                  <div className="admin-video-presets">
                    <button
                      className={`video-preset-btn ${
                        config.video.startingVidUrl.includes('starting_vid2') ? 'active' : ''
                      }`}
                      onClick={() => {
                        updateVideo({ startingVidUrl: '/assets/starting_vid2.mp4' });
                        triggerSavedNotice();
                      }}
                    >
                      Preset 1: Starting Vid 2 (Default)
                    </button>

                    <button
                      className={`video-preset-btn ${
                        config.video.startingVidUrl.includes('starting vid.mp4') ? 'active' : ''
                      }`}
                      onClick={() => {
                        updateVideo({ startingVidUrl: '/assets/starting vid.mp4' });
                        triggerSavedNotice();
                      }}
                    >
                      Preset 2: Starting Vid 1 (Alternative)
                    </button>
                  </div>

                  <div className="admin-form-group" style={{ marginTop: '16px' }}>
                    <label>Or Enter Custom Video URL / Asset Path</label>
                    <input
                      type="text"
                      value={config.video.startingVidUrl}
                      onChange={(e) => {
                        updateVideo({ startingVidUrl: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="/assets/my_video.mp4"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Or Upload Video File From Computer</label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      ref={fileInputRef}
                      onChange={handleVideoUpload}
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  {/* Video Preview */}
                  <div className="admin-video-preview-box">
                    <p className="preview-label">Live Video Preview:</p>
                    <video
                      src={config.video.startingVidUrl}
                      controls
                      playsInline
                      style={{ width: '100%', maxHeight: '180px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: VENUE & MAP */}
              {activeTab === 'venue' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">📍 Venue & Location</h4>

                  <div className="admin-form-group">
                    <label>Venue Title</label>
                    <input
                      type="text"
                      value={config.venue.name}
                      onChange={(e) => {
                        updateVenue({ name: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="Beldi Country Club"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Venue Subtitle / City</label>
                    <input
                      type="text"
                      value={config.venue.subtitle}
                      onChange={(e) => {
                        updateVenue({ subtitle: e.target.value });
                        triggerSavedNotice();
                      }}
                      placeholder="Marrakech, Morocco"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Venue Image (Upload / URL)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={config.venue.imageUrl}
                        onChange={(e) => {
                          updateVenue({ imageUrl: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="/assets/venue_map_decor.png"
                      />
                      <label className="admin-upload-btn-label">
                        Browse
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVenueImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Venue Image Preview */}
                  {config.venue.imageUrl && (
                    <div className="admin-img-preview-box">
                      <img
                        src={config.venue.imageUrl}
                        alt="Venue Preview"
                        style={{ maxWidth: '140px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label>Google Maps Directions Link</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={config.venue.mapsUrl}
                        onChange={(e) => {
                          updateVenue({ mapsUrl: e.target.value });
                          triggerSavedNotice();
                        }}
                      />
                      <a
                        href={config.venue.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-link-btn"
                        title="Test Map Link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Google Maps Embed Iframe URL</label>
                    <input
                      type="text"
                      value={config.venue.mapsEmbedUrl}
                      onChange={(e) => {
                        updateVenue({ mapsEmbedUrl: e.target.value });
                        triggerSavedNotice();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: BACKUP & RESET */}
              {activeTab === 'backup' && (
                <div className="admin-tab-pane">
                  <h4 className="admin-section-heading">💾 Backup, Export & Reset</h4>

                  <div className="admin-backup-actions">
                    <button onClick={handleExport} className="admin-action-btn export-btn">
                      <Download size={16} />
                      <span>Export Config as JSON</span>
                    </button>

                    <label className="admin-action-btn import-btn">
                      <Upload size={16} />
                      <span>Import Config from JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        ref={jsonInputRef}
                        onChange={handleImport}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all settings to default?')) {
                          resetDefaults();
                          triggerSavedNotice();
                        }
                      }}
                      className="admin-action-btn reset-btn"
                    >
                      <RotateCcw size={16} />
                      <span>Reset to Original Defaults</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="admin-footer">
              <span className="admin-footer-hint">
                ✨ Live editing enabled: changes update the invitation in real-time.
              </span>
              <button onClick={() => setIsOpen(false)} className="admin-done-btn">
                Done & Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
