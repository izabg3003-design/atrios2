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
}export const syncToCloud = async (table: string, data: any): Promise<SyncResult> => {
  try {
    // 1. Clone data to avoid modifying the original object
    const rawData = { ...data };
    
    // 2. Tratamento de imagens grandes para evitar erro de payload
    if (table === 'products' || table === 'store_orders') {
      const imageField = table === 'products' ? 'image' : 'uploadedImage';
      if (rawData[imageField] && rawData[imageField].length > 100000) {
        console.warn(`syncToCloud: Imagem de ${table} muito grande (>100KB), removendo para sincronização cloud.`);
        delete rawData[imageField];
      }
    }

    // 3. Mapeamento Automático de CamelCase para SnakeCase
    const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    const cleanData: any = {};
    Object.keys(rawData).forEach(key => {
      const snakeKey = toSnakeCase(key);
      cleanData[snakeKey] = rawData[key];
    });

    // 4. Casos especiais de mapeamento (ex: companyId -> company_id e também companyid)
    if (cleanData.company_id) {
      cleanData.companyid = cleanData.company_id;
    }
    if (rawData.timestamp) {
      cleanData.created_at = rawData.timestamp;
    }

    // 5. Garantir que arrays/objetos sejam enviados como string se necessário
    // Algumas tabelas no Supabase podem estar como TEXT em vez de JSONB
    const jsonFields = ['items', 'expenses', 'payments', 'services_selected', 'project_files', 'pdf_template'];
    jsonFields.forEach(field => {
      if (cleanData[field] && typeof cleanData[field] === 'object') {
        // Se for um array de strings simples, não stringify (deixa o Supabase lidar como array do Postgres)
        const isSimpleArray = Array.isArray(cleanData[field]) && 
                             cleanData[field].length > 0 && 
                             typeof cleanData[field][0] === 'string';
        
        if (!isSimpleArray) {
          try {
            cleanData[field] = JSON.stringify(cleanData[field]);
          } catch (e) {
            console.error(`syncToCloud: Erro ao stringify campo ${field}:`, e);
          }
        }
      }
    });

    console.log(`syncToCloud: Tentando sincronizar ${table} (ID: ${cleanData.id || cleanData.company_id}) no Supabase...`);
    
    // 6. Função recursiva para tentar upsert e remover colunas inexistentes
    const performUpsert = async (payload: any): Promise<SyncResult> => {
      const { error } = await supabase.from(table).upsert(payload);
      
      if (!error) return { success: true };

      console.error(`syncToCloud: Erro ao sincronizar ${table}:`, {
        message: error.message,
        code: error.code,
        dataSent: payload
      });

      // Fallback: se falhar por coluna não encontrada (PGRST204), tentamos remover a coluna problemática e repetir
      if (error.code === 'PGRST204') {
        const match = error.message.match(/Could not find the '(.+)' column/);
        const missingColumn = match ? match[1] : null;
        if (missingColumn && payload[missingColumn] !== undefined) {
          console.warn(`syncToCloud: Removendo coluna inexistente '${missingColumn}' e tentando novamente...`);
          const nextPayload = { ...payload };
          delete nextPayload[missingColumn];
          return await performUpsert(nextPayload);
        }
      }
      
      return { success: false, error };
    };

    return await performUpsert(cleanData);
  } catch (err) {
    console.error(`syncToCloud: Erro inesperado em ${table}:`, err);
    return { success: false, error: err };
  }
};
