import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://raglyqukrlxwcmlhzebd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2x5cXVrcmx4d2NtbGh6ZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTcxMDQsImV4cCI6MjA4Njk5MzEwNH0.fuckSJxctgYkF5ipioPYo31b_Kqwo905f64F-_Fjpc0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para sincronização silenciosa (background sync)
export const syncToCloud = async (table: string, data: any) => {
  try {
    const { error } = await supabase.from(table).upsert(data);
    if (error) console.warn(`Erro ao sincronizar ${table} com Supabase:`, error.message);
  } catch (err) {
    console.error(`Falha crítica na conexão com Supabase (${table}):`, err);
  }
};