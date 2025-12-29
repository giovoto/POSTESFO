import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.POSTGRES_URL?.split('@')[1]?.split('/')[0];
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not fully configured. Photo uploads may fail.');
}

export const supabase = createClient(
    `https://${supabaseUrl}` || '',
    supabaseKey || '',
    {
        auth: {
            persistSession: false
        }
    }
);

console.log('Supabase client initialized:', supabaseUrl ? 'OK' : 'MISSING URL');
