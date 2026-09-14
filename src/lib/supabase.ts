import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RsvpRecord {
  id?: string;
  name: string;
  guests_count: number;
  attendance: 'yes' | 'no';
  message?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

// Check environment or localStorage override
const getEnvCredentials = () => {
  const envUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const envKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const localUrl = localStorage.getItem('supabase_custom_url') || '';
  const localKey = localStorage.getItem('supabase_custom_key') || '';

  const url = (localUrl || envUrl).trim();
  const key = (localKey || envKey).trim();

  return { url, key };
};

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getEnvCredentials();

  if (!url || !key || url.includes('your-project-ref') || key.includes('your-anon-key')) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClient() !== null;
};

export const getSupabaseStatus = () => {
  const { url, key } = getEnvCredentials();
  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project-ref') &&
    !key.includes('your-anon-key')
  );

  return {
    url,
    hasKey: Boolean(key),
    isConfigured,
    isCustomOverride: Boolean(localStorage.getItem('supabase_custom_url')),
  };
};

export const setSupabaseOverride = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('supabase_custom_url', url.trim());
    localStorage.setItem('supabase_custom_key', key.trim());
  } else {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_key');
  }
  cachedClient = null;
};

// ==========================================
// RSVP SERVICE
// ==========================================

const LOCAL_RSVP_KEY = 'wedding_rsvp_list';

export const submitRsvp = async (data: {
  name: string;
  guestsCount: number | string;
  attendance: 'yes' | 'no';
  message?: string;
  phone?: string;
  email?: string;
}): Promise<{ success: boolean; error?: string; source: 'supabase' | 'local' }> => {
  const count = typeof data.guestsCount === 'string' ? parseInt(data.guestsCount, 10) || 1 : data.guestsCount;

  const payload = {
    name: data.name.trim(),
    guests_count: count,
    attendance: data.attendance,
    message: data.message?.trim() || null,
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
  };

  // 1. Always save to local storage as fallback/cache
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RSVP_KEY) || '[]');
    existing.unshift({
      id: `local_${Date.now()}`,
      name: payload.name,
      guestsCount: payload.guests_count,
      attendance: payload.attendance,
      message: payload.message,
      phone: payload.phone,
      email: payload.email,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Local storage RSVP backup failed:', err);
  }

  // 2. Insert to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('rsvps').insert([payload]);
      if (error) {
        console.error('Supabase RSVP insert error:', error);
        return { success: true, source: 'local', error: error.message };
      }
      return { success: true, source: 'supabase' };
    } catch (err: any) {
      console.error('Supabase RSVP network error:', err);
      return { success: true, source: 'local', error: err.message };
    }
  }

  return { success: true, source: 'local' };
};

export const fetchRsvps = async (): Promise<{ data: RsvpRecord[]; source: 'supabase' | 'local' }> => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { data: data as RsvpRecord[], source: 'supabase' };
      }
    } catch (err) {
      console.warn('Could not fetch from Supabase, falling back to local storage:', err);
    }
  }

  // Fallback to local storage
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_RSVP_KEY) || '[]');
    const formatted: RsvpRecord[] = local.map((item: any, index: number) => ({
      id: item.id || `local_${index}`,
      name: item.name || 'Anonymous',
      guests_count: item.guestsCount ? Number(item.guestsCount) : 1,
      attendance: item.attendance === 'no' ? 'no' : 'yes',
      message: item.message || '',
      phone: item.phone || '',
      email: item.email || '',
      created_at: item.date || item.created_at || new Date().toISOString(),
    }));
    return { data: formatted, source: 'local' };
  } catch {
    return { data: [], source: 'local' };
  }
};

export const deleteRsvp = async (id: string): Promise<boolean> => {
  // Remove from local storage
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_RSVP_KEY) || '[]');
    const filtered = local.filter((item: any) => item.id !== id);
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove from local storage:', err);
  }

  // If supabase is available and not a local-only ID
  const supabase = getSupabaseClient();
  if (supabase && !id.startsWith('local_')) {
    try {
      const { error } = await supabase.from('rsvps').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        return false;
      }
    } catch (err) {
      console.error('Supabase delete exception:', err);
      return false;
    }
  }

  return true;
};

// ==========================================
// WEDDING CONFIG CLOUD SYNC
// ==========================================

export const fetchRemoteWeddingConfig = async (): Promise<any | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('wedding_config')
      .select('config')
      .eq('id', 'current_config')
      .maybeSingle();

    if (!error && data?.config) {
      return data.config;
    }
  } catch (err) {
    console.warn('Could not fetch remote config from Supabase:', err);
  }

  return null;
};

export const saveRemoteWeddingConfig = async (config: any): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('wedding_config').upsert({
      id: 'current_config',
      config: config,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving wedding config to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving wedding config to Supabase:', err);
    return false;
  }
};
