-- ==============================================================================
-- BLOSSOM & OUD WEDDING INVITATION - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Only the RSVPs table is needed in Supabase!
-- (Dates, names, timeline, and media stay in the frontend codebase)
-- ==============================================================================

-- 1. RSVPs TABLE
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to submit (insert) RSVPs
CREATE POLICY "Allow anonymous users to insert RSVPs"
    ON public.rsvps
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow public read access to RSVPs
CREATE POLICY "Allow public read access to RSVPs"
    ON public.rsvps
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow public delete access to RSVPs
CREATE POLICY "Allow public delete access to RSVPs"
    ON public.rsvps
    FOR DELETE
    TO anon, authenticated
    USING (true);

