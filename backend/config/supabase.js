import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Extraer URL de Supabase correctamente
let supabaseUrl = process.env.SUPABASE_URL;

// Si no está definida, intentar construirla desde POSTGRES_URL
if (!supabaseUrl && process.env.POSTGRES_URL) {
    const match = process.env.POSTGRES_URL.match(/db\.([^.]+)\.supabase\.co/);
    if (match) {
        supabaseUrl = `https://${match[1]}.supabase.co`;
    }
}

const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Supabase Config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    hasKey: !!supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Supabase credentials not fully configured!');
    console.error('SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'EXISTS' : 'MISSING');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
        auth: {
            persistSession: false
        }
    }
);
