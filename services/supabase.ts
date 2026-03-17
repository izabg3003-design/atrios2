import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://raglyqukrlxwcmlhzebd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2x5cXVrcmx4d2NtbGh6ZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTcxMDQsImV4cCI6MjA4Njk5MzEwNH0.fuckSJxctgYkF5ipioPYo31b_Kqwo905f64F-_Fjpc0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para sincronização silenciosa (background sync)
export const testTableAccess = async (tableName: string) => {
  try {
    const { data, error, status } = await supabase.from(tableName).select('id').limit(1);
    return { success: !error, error, status };
  } catch (e) {
    return { success: false, error: e, status: 500 };
  }
};

export const syncToCloud = async (table: string, data: any): Promise<boolean> => {
  try {
    // Remove problematic fields if table doesn't have them
    const cleanData = { ...data };
    
    if (table === 'products') {
      // Se a imagem for muito grande (base64), pode causar erro de payload ou de coluna
      if (cleanData.image && cleanData.image.length > 100000) {
        console.warn("syncToCloud: Imagem do produto muito grande (>100KB), removendo para sincronização cloud.");
        delete cleanData.image;
      }
    }
    
    console.log(`syncToCloud: Tentando sincronizar ${table} (ID: ${cleanData.id}) no Supabase...`);
    
    // Tenta upsert. Se falhar, tentaremos entender o porquê.
    const { error, data: upsertData } = await supabase
      .from(table)
      .upsert(cleanData)
      .select();
    
    if (error) {
      console.error(`syncToCloud: Erro ao sincronizar ${table}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        dataSent: cleanData
      });
      
      // Se o erro for '22P02' (invalid text representation), pode ser o ID que não é UUID
      if (error.code === '22P02' && typeof cleanData.id === 'string' && !cleanData.id.includes('-')) {
        console.warn("syncToCloud: Possível erro de tipo UUID. Verifique se a coluna 'id' no Supabase é do tipo TEXT ou UUID.");
      }

      // Se falhar por causa da imagem (payload too large), tenta sem a imagem
      if (cleanData.image && (error.message.includes('large') || error.code === '413')) {
        console.warn(`syncToCloud: Tentando sincronizar ${table} sem a imagem devido ao tamanho...`);
        const { image, ...noImageData } = cleanData;
        const { error: retryError } = await supabase.from(table).upsert(noImageData);
        if (!retryError) {
          console.log(`syncToCloud: Sincronização de ${table} (sem imagem) concluída.`);
          return true;
        }
      }
      return false;
    }
    
    console.log(`syncToCloud: Sincronização de ${table} concluída com sucesso. Retorno:`, upsertData);
    return true;
  } catch (err) {
    console.error(`Falha crítica na conexão com Supabase (${table}):`, err);
    return false;
  }
};