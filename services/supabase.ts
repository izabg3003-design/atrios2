import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://raglyqukrlxwcmlhzebd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2x5cXVrcmx4d2NtbGh6ZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTcxMDQsImV4cCI6MjA4Njk5MzEwNH0.fuckSJxctgYkF5ipioPYo31b_Kqwo905f64F-_Fjpc0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para sincronização silenciosa (background sync)
export const syncToCloud = async (table: string, data: any): Promise<boolean> => {
  try {
    // Remove problematic fields if table doesn't have them
    const cleanData = { ...data };
    
    // Always remove created_at as it's usually handled by DB
    delete cleanData.created_at;
    
    if (table === 'products') {
      // Remove fields that might not exist in the schema
      delete cleanData.active;
      
      // Se a imagem for muito grande (base64), pode causar erro de payload ou de coluna
      if (cleanData.image && cleanData.image.length > 50000) {
        console.warn("Imagem do produto muito grande (>50KB), removendo para sincronização cloud.");
        delete cleanData.image;
      }
    }
    
    console.log(`Sincronizando ${table} com Supabase:`, cleanData);
    const { error } = await supabase.from(table).upsert(cleanData);
    if (error) {
      console.error(`Erro ao sincronizar ${table} com Supabase:`, error.message);
      console.error("Dados que falharam:", cleanData);
      return false;
    }
    console.log(`Sincronização de ${table} concluída com sucesso.`);
    return true;
  } catch (err) {
    console.error(`Falha crítica na conexão com Supabase (${table}):`, err);
    return false;
  }
};