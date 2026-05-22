import { createClient } from '@supabase/supabase-js';

// Coloque suas strings de texto reais aqui dentro das aspas
const supabaseUrl = "https://rjpcayffszhknjnqmfew.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcGNheWZmc3poa25qbnFtZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MjQzOTAsImV4cCI6MjA5NTAwMDM5MH0.0bhrvaAf9_8egJQzCFRwcP-z5Sprv-clFKbysf9HkrA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);