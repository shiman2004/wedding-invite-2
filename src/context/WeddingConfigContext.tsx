import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  oud: string;
  oudLight: string;
  parchment: string;
  parchmentCard: string;
  olive: string;
  charcoal: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
}

export interface WeddingConfig {
  names: {
    bride: string;
    groom: string;
    arabicTitle: string;
    arabicHeader1: string;
    arabicHeader2: string;
    arabicHeader3: string;
    arabicDateText: string;
    arabicTimeText: string;
  };
  date: {
    day: string;
    month: string;
    year: string;
    displayDate: string;
    displayTime: string;
    isoDateTime: string; // for countdown
  };
  timeline: {
    sectionTitle: string;
    events: TimelineEvent[];
  };
  video: {
    startingVidUrl: string;
    bgVideoUrl: string;
  };
  music: {
    musicUrl: string;
    title: string;
    volume: number;
  };
  venue: {
    name: string;
    subtitle: string;
    imageUrl: string;
    mapsUrl: string;
    mapsEmbedUrl: string;
  };
  theme: ThemeColors;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'blossom-oud',
    name: 'Blossom & Oud (Default Gold)',
    colors: {
      oud: '#866739',
      oudLight: '#a88753',
      parchment: '#f9e6d4',
      parchmentCard: '#f4ebe0',
      olive: '#747b54',
      charcoal: '#2a2a2a',
    },
  },
  {
    id: 'emerald-oasis',
    name: 'Emerald Oasis & Gold',
    colors: {
      oud: '#7a5a2e',
      oudLight: '#9b7642',
      parchment: '#eef5ec',
      parchmentCard: '#e2ede0',
      olive: '#3d6346',
      charcoal: '#1b291d',
    },
  },
  {
    id: 'royal-burgundy',
    name: 'Royal Burgundy & Champagne',
    colors: {
      oud: '#7a2233',
      oudLight: '#a83c50',
      parchment: '#fcf3ee',
      parchmentCard: '#f8e6de',
      olive: '#6b3240',
      charcoal: '#2d181e',
    },
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire & Rose Gold',
    colors: {
      oud: '#b08451',
      oudLight: '#caa06e',
      parchment: '#edf2f7',
      parchmentCard: '#e1e9f2',
      olive: '#2d4b68',
      charcoal: '#172332',
    },
  },
  {
    id: 'sand-champagne',
    name: 'Desert Dunes & Champagne',
    colors: {
      oud: '#94754d',
      oudLight: '#bfa178',
      parchment: '#fbf7f0',
      parchmentCard: '#f4ece0',
      olive: '#80775d',
      charcoal: '#322d25',
    },
  },
];

export const DEFAULT_CONFIG: WeddingConfig = {
  names: {
    bride: 'Amira',
    groom: 'Yusuf',
    arabicTitle: 'الآنسة أميرة والسيد يوسف',
    arabicHeader1: 'يسعدهما ويشرفهما أن يدعوا',
    arabicHeader2: 'حضرتكم الكريمة',
    arabicHeader3: 'لمشاركتهما فرحة حفل زفافهما',
    arabicDateText: 'السبت 20 ماي 2027',
    arabicTimeText: 'على الساعة الرابعة مساءً',
  },
  date: {
    day: '20',
    month: 'MAY',
    year: '2027',
    displayDate: 'May 20, 2027',
    displayTime: 'from 4:00 PM',
    isoDateTime: '2027-05-20T16:00:00',
  },
  timeline: {
    sectionTitle: 'Event Timeline',
    events: [
      { id: '1', time: '16:00', title: 'Welcome\nReception' },
      { id: '2', time: '17:00', title: 'Nikah\nCeremony' },
      { id: '3', time: '19:00', title: 'Dinner' },
      { id: '4', time: '20:00', title: 'Party' },
    ],
  },
  video: {
    startingVidUrl: '/assets/starting_vid2.mp4',
    bgVideoUrl: '/assets/luxury_bg.mp4',
  },
  music: {
    musicUrl: '/assets/music.mp3',
    title: 'Blossom & Oud Symphony',
    volume: 0.6,
  },
  venue: {
    name: 'Beldi Country Club',
    subtitle: 'Marrakech, Morocco',
    imageUrl: '/assets/venue_map_decor.png',
    mapsUrl: 'https://maps.google.com/?q=BELDI+COUNTRY+CLUB+Marrakech',
    mapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3399.306640246493!2d-8.028903000000001!3d31.570638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafef433680c277%3A0xb6d08dba582fd2dc!2sBELDI%20COUNTRY%20CLUB!5e0!3m2!1sen!2s!4v1780759496019!5m2!1sen!2s',
  },
  theme: {
    oud: '#866739',
    oudLight: '#a88753',
    parchment: '#f9e6d4',
    parchmentCard: '#f4ebe0',
    olive: '#747b54',
    charcoal: '#2a2a2a',
  },
};

const STORAGE_KEY = 'blossom_wedding_config_v4';

interface WeddingConfigContextType {
  config: WeddingConfig;
  updateConfig: (newConfig: Partial<WeddingConfig>) => void;
  updateNames: (names: Partial<WeddingConfig['names']>) => void;
  updateDate: (date: Partial<WeddingConfig['date']>) => void;
  updateTimeline: (timeline: Partial<WeddingConfig['timeline']>) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  removeTimelineEvent: (id: string) => void;
  updateTimelineEvent: (id: string, updated: Partial<TimelineEvent>) => void;
  updateVideo: (video: Partial<WeddingConfig['video']>) => void;
  updateMusic: (music: Partial<WeddingConfig['music']>) => void;
  updateVenue: (venue: Partial<WeddingConfig['venue']>) => void;
  updateTheme: (theme: Partial<ThemeColors>) => void;
  applyPreset: (presetId: string) => void;
  resetDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => boolean;
}

const WeddingConfigContext = createContext<WeddingConfigContextType | null>(null);

export const WeddingConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WeddingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  // Apply CSS Variables in real-time & save locally
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-oud', config.theme.oud);
    root.style.setProperty('--color-oud-light', config.theme.oudLight);
    root.style.setProperty('--color-parchment', config.theme.parchment);
    root.style.setProperty('--color-parchment-card', config.theme.parchmentCard);
    root.style.setProperty('--color-olive', config.theme.olive);
    root.style.setProperty('--color-charcoal', config.theme.charcoal);

    // Persist to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [config]);

  const updateConfig = (newConfig: Partial<WeddingConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateNames = (names: Partial<WeddingConfig['names']>) => {
    setConfig((prev) => ({
      ...prev,
      names: { ...prev.names, ...names },
    }));
  };

  const updateDate = (date: Partial<WeddingConfig['date']>) => {
    setConfig((prev) => ({
      ...prev,
      date: { ...prev.date, ...date },
    }));
  };

  const updateTimeline = (timeline: Partial<WeddingConfig['timeline']>) => {
    setConfig((prev) => ({
      ...prev,
      timeline: { ...prev.timeline, ...timeline },
    }));
  };

  const addTimelineEvent = (event: TimelineEvent) => {
    setConfig((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        events: [...prev.timeline.events, event],
      },
    }));
  };

  const removeTimelineEvent = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        events: prev.timeline.events.filter((e) => e.id !== id),
      },
    }));
  };

  const updateTimelineEvent = (id: string, updated: Partial<TimelineEvent>) => {
    setConfig((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        events: prev.timeline.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
      },
    }));
  };

  const updateVideo = (video: Partial<WeddingConfig['video']>) => {
    setConfig((prev) => ({
      ...prev,
      video: { ...prev.video, ...video },
    }));
  };

  const updateMusic = (music: Partial<WeddingConfig['music']>) => {
    setConfig((prev) => ({
      ...prev,
      music: { ...prev.music, ...music },
    }));
  };

  const updateVenue = (venue: Partial<WeddingConfig['venue']>) => {
    setConfig((prev) => ({
      ...prev,
      venue: { ...prev.venue, ...venue },
    }));
  };

  const updateTheme = (theme: Partial<ThemeColors>) => {
    setConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...theme },
    }));
  };

  const applyPreset = (presetId: string) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setConfig((prev) => ({
        ...prev,
        theme: { ...found.colors },
      }));
    }
  };

  const resetDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const exportConfigJson = () => {
    return JSON.stringify(config, null, 2);
  };

  const importConfigJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  return (
    <WeddingConfigContext.Provider
      value={{
        config,
        updateConfig,
        updateNames,
        updateDate,
        updateTimeline,
        addTimelineEvent,
        removeTimelineEvent,
        updateTimelineEvent,
        updateVideo,
        updateMusic,
        updateVenue,
        updateTheme,
        applyPreset,
        resetDefaults,
        exportConfigJson,
        importConfigJson,
      }}
    >
      {children}
    </WeddingConfigContext.Provider>
  );
};

export const useWeddingConfig = () => {
  const context = useContext(WeddingConfigContext);
  if (!context) {
    throw new Error('useWeddingConfig must be used within a WeddingConfigProvider');
  }
  return context;
};
