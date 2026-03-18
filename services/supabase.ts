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

export interface SyncResult {
  success: boolean;
  error?: any;
}

export const syncToCloud = async (table: string, data: any): Promise<SyncResult> => {
  try {
    // Remove problematic fields if table doesn't have them
    const cleanData = { ...data };
    
    if (table === 'products' || table === 'store_orders') {
      // Se a imagem for muito grande (base64), pode causar erro de payload ou de coluna
      const imageField = table === 'products' ? 'image' : 'uploadedImage';
      if (cleanData[imageField] && cleanData[imageField].length > 100000) {
        console.warn(`syncToCloud: Imagem de ${table} muito grande (>100KB), removendo para sincronização cloud.`);
        delete cleanData[imageField];
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
      if (error.code === '22P02') {
        console.warn("syncToCloud: Erro de tipo de dado (provavelmente UUID). Verifique se a coluna 'id' no Supabase é do tipo TEXT.");
      }

      // Se o erro for 'PGRST204' (column not found), tenta identificar a coluna e mapear ou remover
      if (error.code === 'PGRST204') {
        const match = error.message.match(/Could not find the '(.+)' column/);
        const missingColumn = match ? match[1] : null;
        
        if (missingColumn && cleanData[missingColumn] !== undefined) {
          const retryData = { ...cleanData };
          
          // Mapeamento inteligente para colunas comuns
          if (missingColumn === 'companyId') {
            console.warn(`syncToCloud: Coluna 'companyId' não encontrada, tentando 'company_id'...`);
            retryData.company_id = cleanData.companyId;
            delete retryData.companyId;
          } else if (missingColumn === 'company_id') {
            console.warn(`syncToCloud: Coluna 'company_id' não encontrada, tentando 'companyid'...`);
            retryData.companyid = cleanData.company_id;
            delete retryData.company_id;
          } else {
            console.warn(`syncToCloud: Coluna '${missingColumn}' não encontrada em ${table}. Tentando sincronizar sem ela...`);
            delete retryData[missingColumn];
          }
          
          const { error: retryError } = await supabase.from(table).upsert(retryData);
          if (!retryError) {
            console.log(`syncToCloud: Sincronização de ${table} concluída após mapeamento/remoção.`);
            return { success: true };
          }
          
          // Se ainda falhar por coluna não encontrada, tenta novamente uma vez
          if (retryError.code === 'PGRST204') {
            const secondMatch = retryError.message.match(/Could not find the '(.+)' column/);
            const secondMissingColumn = secondMatch ? secondMatch[1] : null;
            if (secondMissingColumn && retryData[secondMissingColumn] !== undefined) {
               // Tenta mapear a segunda coluna se for company_id
               if (secondMissingColumn === 'company_id') {
                 retryData.companyid = retryData.company_id;
                 delete retryData.company_id;
               } else {
                 delete retryData[secondMissingColumn];
               }
               const { error: finalError } = await supabase.from(table).upsert(retryData);
               if (!finalError) return { success: true };
               return { success: false, error: finalError };
            }
          }
          return { success: false, error: retryError };
        }
      }

      // Se falhar por causa da imagem (payload too large), tenta sem a imagem
      const imageField = table === 'products' ? 'image' : 'uploadedImage';
      if (cleanData[imageField] && (error.message.includes('large') || error.code === '413' || error.message.includes('payload'))) {
        console.warn(`syncToCloud: Tentando sincronizar ${table} sem a imagem devido ao tamanho...`);
        const noImageData = { ...cleanData };
        delete noImageData[imageField];
        
        const { error: retryError } = await supabase.from(table).upsert(noImageData);
        if (!retryError) {
          console.log(`syncToCloud: Sincronização de ${table} (sem imagem) concluída.`);
          return { success: true };
        }
        return { success: false, error: retryError };
      }
      return { success: false, error };
    }
    
    console.log(`syncToCloud: Sincronização de ${table} concluída com sucesso. Retorno:`, upsertData);
    return { success: true };
  } catch (err) {
    console.error(`Falha crítica na conexão com Supabase (${table}):`, err);
    return { success: false, error: err };
  }
};
