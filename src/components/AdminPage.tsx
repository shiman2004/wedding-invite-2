import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWeddingConfig, THEME_PRESETS, TimelineEvent } from '../context/WeddingConfigContext';
import {
  Sparkles,
  Video,
  Music,
  Clock,
  Heart,
  Calendar,
  MapPin,
  Palette,
  RotateCcw,
  Download,
  Upload,
  Check,
  ExternalLink,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Database,
  RefreshCw,
  Search,
  Copy,
  Cloud,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import {
  fetchRsvps,
  deleteRsvp,
  RsvpRecord,
  getSupabaseStatus,
  setSupabaseOverride,
  isSupabaseConfigured
} from '../lib/supabase';

interface AdminPageProps {
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<
    'theme' | 'names' | 'date' | 'timeline' | 'video' | 'music' | 'venue' | 'rsvps' | 'supabase' | 'backup'
  >('rsvps');
  const [savedBadge, setSavedBadge] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // RSVP State
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [rsvpSource, setRsvpSource] = useState<'supabase' | 'local'>('local');
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Supabase Config State
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseStatus());
  const [customUrl, setCustomUrl] = useState(getSupabaseStatus().url);
  const [customKey, setCustomKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const {
    config,
    isCloudConnected,
    isSyncing,
    syncToCloud,
    loadFromCloud,
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
  } = useWeddingConfig();

  const loadRsvpsData = useCallback(async () => {
    setIsLoadingRsvps(true);
    try {
      const res = await fetchRsvps();
      setRsvps(res.data);
      setRsvpSource(res.source);
    } catch (err) {
      console.error('Failed to load RSVPs:', err);
    } finally {
      setIsLoadingRsvps(false);
    }
  }, []);

  useEffect(() => {
    loadRsvpsData();
  }, [loadRsvpsData]);

  const handleDeleteRsvp = async (id?: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to remove this RSVP entry?')) {
      const ok = await deleteRsvp(id);
      if (ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      }
    }
  };

  const handleExportRsvpsCsv = () => {
    if (rsvps.length === 0) {
      alert('No RSVPs to export.');
      return;
    }

    const headers = ['Name', 'Attendance', 'Number of Guests', 'Wishes / Message', 'Phone', 'Date Submitted'];
    const rows = rsvps.map((r) => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.attendance === 'yes' ? 'Attending' : 'Declined',
      r.guests_count || 1,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wedding_rsvps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSupabaseCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseOverride(customUrl, customKey);
    const newStatus = getSupabaseStatus();
    setSupabaseConfig(newStatus);
    setCloudNotice({
      type: newStatus.isConfigured ? 'success' : 'error',
      text: newStatus.isConfigured ? 'Supabase credentials saved successfully!' : 'Invalid or empty credentials.',
    });
    loadRsvpsData();
    setTimeout(() => setCloudNotice(null), 3500);
  };

  const handleClearSupabaseCredentials = () => {
    setSupabaseOverride('', '');
    setCustomUrl('');
    setCustomKey('');
    setSupabaseConfig(getSupabaseStatus());
    setCloudNotice({ type: 'success', text: 'Custom credentials cleared. Using .env configuration.' });
    loadRsvpsData();
    setTimeout(() => setCloudNotice(null), 3000);
  };

  const handleManualSyncCloud = async () => {
    const success = await syncToCloud();
    setCloudNotice({
      type: success ? 'success' : 'error',
      text: success ? 'Current invitation settings successfully synced to Supabase Cloud!' : 'Sync failed. Please verify your Supabase connection and tables.',
    });
    setTimeout(() => setCloudNotice(null), 3500);
  };

  const handleManualLoadCloud = async () => {
    const success = await loadFromCloud();
    setCloudNotice({
      type: success ? 'success' : 'error',
      text: success ? 'Latest configuration loaded from Supabase Cloud!' : 'Could not fetch cloud configuration.',
    });
    setTimeout(() => setCloudNotice(null), 3500);
  };

  const copySqlSchema = () => {
    const sql = `-- Blossom & Oud Wedding Invitation Schema
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
    message TEXT,
    phone TEXT,
    email TEXT
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON public.rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public reads" ON public.rsvps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public deletes" ON public.rsvps FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.wedding_config (
    id TEXT PRIMARY KEY DEFAULT 'current_config',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    config JSONB NOT NULL
);

ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read config" ON public.wedding_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write config" ON public.wedding_config FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const triggerSavedNotice = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateVideo({ startingVidUrl: url });
      triggerSavedNotice();
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateMusic({ musicUrl: url, title: file.name.replace(/\.[^/.]+$/, '') });
      triggerSavedNotice();
    }
  };

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

  const handleAddTimelineItem = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      time: '21:00',
      title: 'Celebration Moment',
    };
    addTimelineEvent(newEvent);
    triggerSavedNotice();
  };

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
    <div className="admin-page-wrapper">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button onClick={onNavigateHome} className="admin-back-btn" title="View Public Invitation">
            <ArrowLeft size={18} />
            <span>View Public Invitation</span>
          </button>
          <div className="admin-brand">
            <Sparkles size={20} className="admin-brand-icon" />
            <h2>Wedding Admin Dashboard</h2>
          </div>
        </div>

        <div className="admin-topbar-right">
          {savedBadge && (
            <span className="admin-saved-badge">
              <Check size={14} /> Changes Saved Live
            </span>
          )}
          <button onClick={onNavigateHome} className="admin-preview-btn">
            <Eye size={16} />
            <span>Go to Live Site (/)</span>
          </button>
        </div>
      </header>

      {/* Main Admin Grid */}
      <div className="admin-dashboard-container">

        {/* Left Sidebar Navigation */}
        <aside className="admin-sidebar">
          <nav className="admin-nav-menu">
            <button
              className={`admin-nav-item ${activeTab === 'rsvps' ? 'active' : ''}`}
              onClick={() => setActiveTab('rsvps')}
            >
              <Users size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <strong>RSVP Responses</strong>
                  <span>Guest attendance & wishes</span>
                </div>
                {rsvps.length > 0 && (
                  <span style={{
                    background: 'var(--color-oud)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    marginLeft: '6px'
                  }}>
                    {rsvps.length}
                  </span>
                )}
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'supabase' ? 'active' : ''}`}
              onClick={() => setActiveTab('supabase')}
            >
              <Database size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <strong>Supabase Cloud</strong>
                  <span>Database & real-time sync</span>
                </div>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSupabaseConfigured() ? '#10b981' : '#f59e0b',
                  flexShrink: 0,
                  marginLeft: '6px'
                }} title={isSupabaseConfigured() ? 'Supabase Connected' : 'Local Mode'} />
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'theme' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              <Palette size={18} />
              <div>
                <strong>Theme & Colors</strong>
                <span>Palettes & CSS variables</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'names' ? 'active' : ''}`}
              onClick={() => setActiveTab('names')}
            >
              <Heart size={18} />
              <div>
                <strong>Couple Names</strong>
                <span>Bride, Groom & Arabic text</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'date' ? 'active' : ''}`}
              onClick={() => setActiveTab('date')}
            >
              <Calendar size={18} />
              <div>
                <strong>Date & Time</strong>
                <span>Scratch cards & Countdown</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Clock size={18} />
              <div>
                <strong>Event Timeline</strong>
                <span>Schedule & activities</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              <Video size={18} />
              <div>
                <strong>Starting Video</strong>
                <span>Envelope opening media</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'music' ? 'active' : ''}`}
              onClick={() => setActiveTab('music')}
            >
              <Music size={18} />
              <div>
                <strong>Background Music</strong>
                <span>Soundtrack & Volume</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'venue' ? 'active' : ''}`}
              onClick={() => setActiveTab('venue')}
            >
              <MapPin size={18} />
              <div>
                <strong>Venue & Location</strong>
                <span>Address, Map & Images</span>
              </div>
            </button>

            <button
              className={`admin-nav-item ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup')}
            >
              <RotateCcw size={18} />
              <div>
                <strong>Backup & Reset</strong>
                <span>Export/Import JSON config</span>
              </div>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <p>💍 {config.names.bride} & {config.names.groom}</p>
            <p className="admin-date-sub">{config.date.displayDate}</p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="admin-main-panel">

          {/* Cloud Notice Toast */}
          {cloudNotice && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: '500',
              background: cloudNotice.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${cloudNotice.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: cloudNotice.type === 'success' ? '#065f46' : '#991b1b',
            }}>
              {cloudNotice.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>{cloudNotice.text}</span>
            </div>
          )}

          {/* TAB 0: RSVPs & GUESTS */}
          {activeTab === 'rsvps' && (() => {
            const attendingList = rsvps.filter((r) => r.attendance === 'yes');
            const declinedList = rsvps.filter((r) => r.attendance === 'no');
            const totalGuests = attendingList.reduce((acc, curr) => acc + (Number(curr.guests_count) || 1), 0);

            const filteredRsvps = rsvps.filter((r) => {
              const matchesFilter =
                rsvpFilter === 'all' ? true : rsvpFilter === 'yes' ? r.attendance === 'yes' : r.attendance === 'no';
              const query = rsvpSearch.trim().toLowerCase();
              const matchesSearch =
                !query ||
                (r.name && r.name.toLowerCase().includes(query)) ||
                (r.message && r.message.toLowerCase().includes(query)) ||
                (r.phone && r.phone.toLowerCase().includes(query));
              return matchesFilter && matchesSearch;
            });

            return (
              <div className="admin-panel-card">
                <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3>💌 RSVP Responses & Guest Management</h3>
                    <p>Live responses submitted by guests through the invitation website.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: rsvpSource === 'supabase' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: rsvpSource === 'supabase' ? '#059669' : '#d97706',
                      border: `1px solid ${rsvpSource === 'supabase' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: rsvpSource === 'supabase' ? '#10b981' : '#f59e0b' }} />
                      {rsvpSource === 'supabase' ? 'Supabase Live Sync' : 'Local Storage'}
                    </span>
                    <button
                      onClick={loadRsvpsData}
                      disabled={isLoadingRsvps}
                      className="admin-link-btn-page"
                      style={{ padding: '6px 12px', height: '32px' }}
                      title="Refresh RSVPs"
                    >
                      <RefreshCw size={14} className={isLoadingRsvps ? 'animate-spin' : ''} />
                      <span style={{ fontSize: '12px', marginLeft: '4px' }}>Refresh</span>
                    </button>
                    <button
                      onClick={handleExportRsvpsCsv}
                      className="admin-btn-primary"
                      style={{ padding: '6px 14px', height: '32px', fontSize: '12px' }}
                      title="Export to CSV"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* RSVP Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '22px'
                }}>
                  <div style={{
                    background: '#fbf8f3',
                    border: '1px solid rgba(134, 103, 57, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                      Total Responses
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--color-oud)', margin: '4px 0 0 0' }}>
                      {rsvps.length}
                    </h2>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669' }}>
                      Attending Guests
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#059669', margin: '4px 0 0 0' }}>
                      {totalGuests} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#555' }}>({attendingList.length} RSVPs)</span>
                    </h2>
                  </div>

                  <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626' }}>
                      Declined Responses
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#dc2626', margin: '4px 0 0 0' }}>
                      {declinedList.length}
                    </h2>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                  background: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(134, 103, 57, 0.15)'
                }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setRsvpFilter('all')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: rsvpFilter === 'all' ? 'var(--color-oud)' : '#f3f4f6',
                        color: rsvpFilter === 'all' ? '#ffffff' : '#4b5563',
                        transition: 'all 0.2s'
                      }}
                    >
                      All ({rsvps.length})
                    </button>
                    <button
                      onClick={() => setRsvpFilter('yes')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: rsvpFilter === 'yes' ? '#059669' : '#f3f4f6',
                        color: rsvpFilter === 'yes' ? '#ffffff' : '#4b5563',
                        transition: 'all 0.2s'
                      }}
                    >
                      Attending ({attendingList.length})
                    </button>
                    <button
                      onClick={() => setRsvpFilter('no')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: rsvpFilter === 'no' ? '#dc2626' : '#f3f4f6',
                        color: rsvpFilter === 'no' ? '#ffffff' : '#4b5563',
                        transition: 'all 0.2s'
                      }}
                    >
                      Declined ({declinedList.length})
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', background: '#fcf8f3', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(134, 103, 57, 0.2)', width: '240px' }}>
                    <Search size={14} color="#888" style={{ marginRight: '8px' }} />
                    <input
                      type="text"
                      placeholder="Search guest or note..."
                      value={rsvpSearch}
                      onChange={(e) => setRsvpSearch(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* RSVPs List / Table */}
                {filteredRsvps.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: '#fbf8f3',
                    borderRadius: '12px',
                    border: '1px dashed rgba(134, 103, 57, 0.3)'
                  }}>
                    <Users size={36} color="var(--color-oud)" style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-oud)', marginBottom: '4px' }}>
                      {rsvpSearch ? 'No matching RSVPs found' : 'No RSVP responses received yet'}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>
                      When guests complete the RSVP form on your invitation website, their responses will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid rgba(134, 103, 57, 0.2)', borderRadius: '12px', background: '#ffffff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
                      <thead>
                        <tr style={{ background: '#fdf9f4', borderBottom: '1px solid rgba(134, 103, 57, 0.2)', color: 'var(--color-charcoal)' }}>
                          <th style={{ padding: '12px 14px', fontWeight: '600' }}>Guest Name</th>
                          <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status</th>
                          <th style={{ padding: '12px 14px', fontWeight: '600' }}>Party Size</th>
                          <th style={{ padding: '12px 14px', fontWeight: '600' }}>Message / Wishes</th>
                          <th style={{ padding: '12px 14px', fontWeight: '600' }}>Date Received</th>
                          <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRsvps.map((rsvp, idx) => (
                          <tr
                            key={rsvp.id || idx}
                            style={{
                              borderBottom: idx === filteredRsvps.length - 1 ? 'none' : '1px solid rgba(134, 103, 57, 0.1)',
                              transition: 'background 0.15s'
                            }}
                          >
                            <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-charcoal)' }}>
                              {rsvp.name}
                              {rsvp.phone && (
                                <span style={{ display: 'block', fontSize: '11px', color: '#888', fontWeight: 'normal' }}>
                                  📞 {rsvp.phone}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: rsvp.attendance === 'yes' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: rsvp.attendance === 'yes' ? '#059669' : '#dc2626'
                              }}>
                                {rsvp.attendance === 'yes' ? 'Attending' : 'Declined'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-charcoal)' }}>
                              <strong>{rsvp.attendance === 'yes' ? rsvp.guests_count || 1 : 0}</strong> {rsvp.attendance === 'yes' ? 'guest(s)' : '-'}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#555', maxWidth: '280px' }}>
                              {rsvp.message ? (
                                <span style={{ fontStyle: 'italic', background: 'rgba(134, 103, 57, 0.05)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                  "{rsvp.message}"
                                </span>
                              ) : (
                                <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteRsvp(rsvp.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Delete RSVP"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 0.5: SUPABASE CLOUD SYNC & SETTINGS */}
          {activeTab === 'supabase' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>⚡ Supabase Cloud Integration</h3>
                <p>Manage your Supabase database connection, cloud configuration sync, and database tables.</p>
              </div>

              {/* Status Banner */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: isSupabaseConfigured() ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${isSupabaseConfigured() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isSupabaseConfigured() ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSupabaseConfigured() ? <ShieldCheck size={22} /> : <Cloud size={22} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-charcoal)' }}>
                      {isSupabaseConfigured() ? 'Supabase Connected & Active' : 'Supabase Not Configured (Using Local Storage)'}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {isSupabaseConfigured()
                        ? `Project URL: ${supabaseConfig.url}`
                        : 'RSVPs and settings are currently stored in local browser storage.'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleManualSyncCloud}
                    disabled={isSyncing || !isSupabaseConfigured()}
                    className="admin-btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', opacity: isSupabaseConfigured() ? 1 : 0.6 }}
                  >
                    <Cloud size={14} />
                    <span>{isSyncing ? 'Syncing...' : 'Push Settings to Cloud'}</span>
                  </button>
                  <button
                    onClick={handleManualLoadCloud}
                    disabled={isSyncing || !isSupabaseConfigured()}
                    className="admin-btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '12px', opacity: isSupabaseConfigured() ? 1 : 0.6 }}
                  >
                    <RefreshCw size={14} />
                    <span>Pull from Cloud</span>
                  </button>
                </div>
              </div>

              {/* Supabase Credentials Form */}
              <div className="admin-form-card" style={{ marginBottom: '24px' }}>
                <h4 className="admin-subheading" style={{ margin: '0 0 12px 0' }}>Supabase Project Credentials</h4>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '-6px', marginBottom: '14px' }}>
                  Find your credentials in your <a href="https://app.supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-oud)', textDecoration: 'underline' }}>Supabase Dashboard</a> under Project Settings → API.
                </p>

                <form onSubmit={handleSaveSupabaseCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="admin-form-card">
                    <label>Project URL (VITE_SUPABASE_URL)</label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-card">
                    <label>Anon / Public Key (VITE_SUPABASE_ANON_KEY)</label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                    />
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {supabaseConfig.hasKey && !customKey ? '● Anon key currently configured' : 'Paste your Supabase anon/public API key here.'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="submit" className="admin-btn-primary">
                      <Check size={16} />
                      <span>Save Supabase Credentials</span>
                    </button>
                    {supabaseConfig.isCustomOverride && (
                      <button
                        type="button"
                        onClick={handleClearSupabaseCredentials}
                        className="admin-btn-secondary"
                      >
                        <span>Reset to .env defaults</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Supabase Schema Helper */}
              <div style={{
                background: '#fbf8f3',
                border: '1px solid rgba(134, 103, 57, 0.2)',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--color-oud)', margin: 0 }}>
                      📋 Database Tables Setup (SQL)
                    </h4>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Paste and run this query inside your Supabase project's <strong>SQL Editor</strong> to create the tables.
                    </span>
                  </div>
                  <button
                    onClick={copySqlSchema}
                    className="admin-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
                  </button>
                </div>

                <pre style={{
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '180px'
                }}>
                  {`-- 1. Create RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
    message TEXT,
    phone TEXT,
    email TEXT
);

-- 2. Create Wedding Config table
CREATE TABLE IF NOT EXISTS public.wedding_config (
    id TEXT PRIMARY KEY DEFAULT 'current_config',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    config JSONB NOT NULL
);`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 1: THEME COLORS */}
          {activeTab === 'theme' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>🎨 Theme & Color Palette</h3>
                <p>Customize the color scheme of the invitation in real time.</p>
              </div>

              <h4 className="admin-subheading">1-Click Curated Luxury Presets</h4>
              <div className="admin-presets-grid-page">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className="admin-preset-card-page"
                    onClick={() => {
                      applyPreset(preset.id);
                      triggerSavedNotice();
                    }}
                  >
                    <div className="preset-color-dots-page">
                      <span style={{ backgroundColor: preset.colors.oud }} />
                      <span style={{ backgroundColor: preset.colors.parchment }} />
                      <span style={{ backgroundColor: preset.colors.olive }} />
                      <span style={{ backgroundColor: preset.colors.charcoal }} />
                    </div>
                    <strong>{preset.name}</strong>
                  </button>
                ))}
              </div>

              <h4 className="admin-subheading" style={{ marginTop: '28px' }}>
                Fine-Grained Color Controls
              </h4>
              <div className="admin-colors-grid-page">
                <div className="color-field-card">
                  <label>Primary Oud Gold</label>
                  <span className="color-token-desc">Heading titles, script calligraphy, buttons</span>
                  <div className="color-picker-box">
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

                <div className="color-field-card">
                  <label>Light Oud Gold</label>
                  <span className="color-token-desc">Subtitles, sparkle accents, borders</span>
                  <div className="color-picker-box">
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

                <div className="color-field-card">
                  <label>Parchment Background</label>
                  <span className="color-token-desc">Main page background tone</span>
                  <div className="color-picker-box">
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

                <div className="color-field-card">
                  <label>Card Background</label>
                  <span className="color-token-desc">Invitation cards and modal background</span>
                  <div className="color-picker-box">
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

                <div className="color-field-card">
                  <label>Olive Accent</label>
                  <span className="color-token-desc">Buttons, badges, highlights</span>
                  <div className="color-picker-box">
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

                <div className="color-field-card">
                  <label>Charcoal Text</label>
                  <span className="color-token-desc">Body text and descriptions</span>
                  <div className="color-picker-box">
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
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>💍 Couple Names & Calligraphy</h3>
                <p>Edit the names displayed in the Hero section and Arabic traditional card.</p>
              </div>

              <div className="admin-form-grid-page">
                <div className="admin-form-card">
                  <label>Bride Name (English)</label>
                  <input
                    type="text"
                    value={config.names.bride}
                    onChange={(e) => {
                      updateNames({ bride: e.target.value });
                      triggerSavedNotice();
                    }}
                    placeholder="Amira"
                  />
                </div>

                <div className="admin-form-card">
                  <label>Groom Name (English)</label>
                  <input
                    type="text"
                    value={config.names.groom}
                    onChange={(e) => {
                      updateNames({ groom: e.target.value });
                      triggerSavedNotice();
                    }}
                    placeholder="Yusuf"
                  />
                </div>
              </div>

              <h4 className="admin-subheading" style={{ marginTop: '24px' }}>
                Arabic Traditional Card Text
              </h4>

              <div className="admin-form-card" style={{ marginBottom: '16px' }}>
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

              <div className="admin-form-grid-page">
                <div className="admin-form-card">
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

                <div className="admin-form-card">
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
            </div>
          )}

          {/* TAB 3: DATE & TIME */}
          {activeTab === 'date' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>📅 Wedding Date & Time Synchronizer</h3>
                <p>Updates the Hero section, Scratch Cards, Countdown timer, and Arabic card.</p>
              </div>

              <h4 className="admin-subheading">Scratch Cards Data (Day, Month, Year)</h4>
              <div className="admin-form-grid-page" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="admin-form-card">
                  <label>Day</label>
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

                <div className="admin-form-card">
                  <label>Month</label>
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

                <div className="admin-form-card">
                  <label>Year</label>
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

              <h4 className="admin-subheading" style={{ marginTop: '24px' }}>Hero Section Display Strings</h4>
              <div className="admin-form-grid-page">
                <div className="admin-form-card">
                  <label>Hero Date Text</label>
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

                <div className="admin-form-card">
                  <label>Hero Time Text</label>
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
              </div>

              <h4 className="admin-subheading" style={{ marginTop: '24px' }}>Live Countdown Target Date</h4>
              <div className="admin-form-card">
                <label>Target Date & Time</label>
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

          {/* TAB 4: EVENT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>⏳ Event Timeline & Schedule</h3>
                <p>Customize the wedding schedule, activities, and timeline order in real time.</p>
              </div>

              <div className="admin-form-card" style={{ marginBottom: '20px' }}>
                <label>Section Title</label>
                <input
                  type="text"
                  value={config.timeline.sectionTitle}
                  onChange={(e) => {
                    updateTimeline({ sectionTitle: e.target.value });
                    triggerSavedNotice();
                  }}
                  placeholder="Event Timeline"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 className="admin-subheading" style={{ margin: 0 }}>Timeline Events ({config.timeline.events.length})</h4>
                <button onClick={handleAddTimelineItem} className="admin-add-item-btn">
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </div>

              <div className="admin-timeline-items-list">
                {config.timeline.events.map((event, index) => (
                  <div key={event.id} className="admin-timeline-item-card">
                    <span className="timeline-item-number">#{index + 1}</span>

                    <div className="timeline-item-field time-field">
                      <label>Time</label>
                      <input
                        type="text"
                        value={event.time}
                        onChange={(e) => {
                          updateTimelineEvent(event.id, { time: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="16:00"
                      />
                    </div>

                    <div className="timeline-item-field title-field">
                      <label>Activity / Event Title (supports linebreaks)</label>
                      <input
                        type="text"
                        value={event.title.replace(/\n/g, ' ')}
                        onChange={(e) => {
                          updateTimelineEvent(event.id, { title: e.target.value });
                          triggerSavedNotice();
                        }}
                        placeholder="Welcome Reception"
                      />
                    </div>

                    <button
                      onClick={() => {
                        removeTimelineEvent(event.id);
                        triggerSavedNotice();
                      }}
                      className="timeline-delete-btn"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STARTING VIDEO */}
          {activeTab === 'video' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>🎬 Starting Envelope Video</h3>
                <p>Change the interactive envelope opening video that guests see when visiting.</p>
              </div>

              <h4 className="admin-subheading">Choose Video Preset</h4>
              <div className="admin-form-grid-page">
                <button
                  className={`admin-video-card-btn ${config.video.startingVidUrl.includes('starting_vid2') ? 'active' : ''
                    }`}
                  onClick={() => {
                    updateVideo({ startingVidUrl: '/assets/starting_vid2.mp4' });
                    triggerSavedNotice();
                  }}
                >
                  <strong>Starting Vid 2 (Default Luxury)</strong>
                  <span>/assets/starting_vid2.mp4</span>
                </button>

                <button
                  className={`admin-video-card-btn ${config.video.startingVidUrl.includes('starting vid.mp4') ? 'active' : ''
                    }`}
                  onClick={() => {
                    updateVideo({ startingVidUrl: '/assets/starting vid.mp4' });
                    triggerSavedNotice();
                  }}
                >
                  <strong>Starting Vid 1 (Alternative)</strong>
                  <span>/assets/starting vid.mp4</span>
                </button>
              </div>

              <h4 className="admin-subheading" style={{ marginTop: '24px' }}>Or Custom Video URL / Upload</h4>
              <div className="admin-form-card">
                <label>Video URL or Asset Path</label>
                <input
                  type="text"
                  value={config.video.startingVidUrl}
                  onChange={(e) => {
                    updateVideo({ startingVidUrl: e.target.value });
                    triggerSavedNotice();
                  }}
                  placeholder="/assets/starting_vid2.mp4"
                />
              </div>

              <div className="admin-form-card" style={{ marginTop: '14px' }}>
                <label>Upload Video from Computer</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  ref={fileInputRef}
                  onChange={handleVideoUpload}
                />
              </div>

              <div className="admin-video-preview-large">
                <p className="preview-label">Live Video Player Preview:</p>
                <video
                  src={config.video.startingVidUrl}
                  controls
                  playsInline
                  style={{ width: '100%', maxHeight: '280px', borderRadius: '12px', background: '#000' }}
                />
              </div>
            </div>
          )}

          {/* TAB 6: BACKGROUND MUSIC */}
          {activeTab === 'music' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>🎵 Background Soundtrack & Audio</h3>
                <p>Customize the romantic background music that plays when guests open the invitation.</p>
              </div>

              <h4 className="admin-subheading">Soundtrack Selection</h4>
              <div className="admin-form-grid-page">
                <button
                  className={`admin-video-card-btn ${config.music.musicUrl.includes('music.mp3') ? 'active' : ''
                    }`}
                  onClick={() => {
                    updateMusic({ musicUrl: '/assets/music.mp3', title: 'Blossom & Oud Symphony' });
                    triggerSavedNotice();
                  }}
                >
                  <strong>Blossom & Oud Symphony (Default)</strong>
                  <span>/assets/music.mp3</span>
                </button>
              </div>

              <h4 className="admin-subheading" style={{ marginTop: '24px' }}>Custom Music URL or File Upload</h4>
              <div className="admin-form-card">
                <label>Music URL or Asset Path</label>
                <input
                  type="text"
                  value={config.music.musicUrl}
                  onChange={(e) => {
                    updateMusic({ musicUrl: e.target.value });
                    triggerSavedNotice();
                  }}
                  placeholder="/assets/my_music.mp3"
                />
              </div>

              <div className="admin-form-card" style={{ marginTop: '14px' }}>
                <label>Upload MP3 Audio File from Computer</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
                  ref={musicInputRef}
                  onChange={handleMusicUpload}
                />
              </div>

              <div className="admin-form-card" style={{ marginTop: '14px' }}>
                <label>Default Volume ({Math.round(config.music.volume * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.music.volume}
                  onChange={(e) => {
                    updateMusic({ volume: parseFloat(e.target.value) });
                    triggerSavedNotice();
                  }}
                />
              </div>

              <div className="admin-video-preview-large" style={{ marginTop: '16px' }}>
                <p className="preview-label">Live Audio Player Preview:</p>
                <audio
                  key={config.music.musicUrl}
                  src={config.music.musicUrl}
                  controls
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>
            </div>
          )}

          {/* TAB 7: VENUE & MAP */}
          {activeTab === 'venue' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>📍 Venue, Location & Map</h3>
                <p>Customize the wedding location, palace illustration/photo, and map directions.</p>
              </div>

              <div className="admin-form-grid-page">
                <div className="admin-form-card">
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

                <div className="admin-form-card">
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
              </div>

              <div className="admin-form-card" style={{ marginTop: '16px' }}>
                <label>Venue Image URL or Local File Upload</label>
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
                  <label className="admin-upload-btn-label-page">
                    Browse File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVenueImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {config.venue.imageUrl && (
                <div className="admin-venue-img-preview">
                  <img src={config.venue.imageUrl} alt="Venue Preview" />
                </div>
              )}

              <div className="admin-form-card" style={{ marginTop: '16px' }}>
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
                    className="admin-link-btn-page"
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="admin-form-card" style={{ marginTop: '16px' }}>
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

          {/* TAB 8: BACKUP & RESET */}
          {activeTab === 'backup' && (
            <div className="admin-panel-card">
              <div className="panel-card-header">
                <h3>💾 Configuration Backup & Export</h3>
                <p>Export your settings to a JSON file or import a saved configuration.</p>
              </div>

              <div className="admin-backup-grid-page">
                <div className="backup-action-card">
                  <h4>Export JSON Configuration</h4>
                  <p>Download a backup JSON file containing all customized texts, colors, and settings.</p>
                  <button onClick={handleExport} className="admin-btn-primary">
                    <Download size={16} />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="backup-action-card">
                  <h4>Import JSON Configuration</h4>
                  <p>Upload a previously exported JSON backup file to restore all settings.</p>
                  <label className="admin-btn-secondary">
                    <Upload size={16} />
                    <span>Upload JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      ref={jsonInputRef}
                      onChange={handleImport}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="backup-action-card danger-zone">
                  <h4>Factory Reset</h4>
                  <p>Reset all texts, dates, videos, and theme colors back to original defaults.</p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all invitation settings to default?')) {
                        resetDefaults();
                        triggerSavedNotice();
                      }
                    }}
                    className="admin-btn-danger"
                  >
                    <RotateCcw size={16} />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
