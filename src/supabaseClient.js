// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// --- PASTE YOUR KEYS HERE ---
const supabaseUrl = 'https://wpckwshcbxsybhoxbkvu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwY2t3c2hjYnhzeWJob3hia3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTI1NTcsImV4cCI6MjA3ODY2ODU1N30.BX2qNJQTFmKlXqW9RI-bIlzC4Zb0xqThNiHgniOS0pM'
// ----------------------------

// This creates the Supabase client that we will use in all other files
export const supabase = createClient(supabaseUrl, supabaseAnonKey)