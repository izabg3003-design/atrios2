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
    // Clone data to avoid modifying the original object
    const cleanData = { ...data };
    
    // 1. Tratamento de imagens grandes para evitar erro de payload
    if (table === 'products' || table === 'store_orders') {
      const imageField = table === 'products' ? 'image' : 'uploadedImage';
      if (cleanData[imageField] && cleanData[imageField].length > 100000) {
        console.warn(`syncToCloud: Imagem de ${table} muito grande (>100KB), removendo para sincronização cloud.`);
        delete cleanData[imageField];
      }
    }

    // 2. Mapeamento Proativo de CamelCase para SnakeCase
    // Definimos um mapeamento de campos conhecidos que precisam ser convertidos
    const mapping: Record<string, string> = {
      companyId: 'company_id',
      createdAt: 'created_at',
      timestamp: 'created_at',
      clientName: 'client_name',
      contactName: 'contact_name',
      contactPhone: 'contact_phone',
      workLocation: 'work_location',
      workNumber: 'work_number',
      workPostalCode: 'work_postal_code',
      clientNif: 'client_nif',
      servicesSelected: 'services_selected',
      totalAmount: 'total_amount',
      projectFiles: 'project_files',
      includeIva: 'include_iva',
      ivaPercentage: 'iva_percentage',
      paymentMethod: 'payment_method',
      productId: 'product_id',
      productName: 'product_name',
      uploadedImage: 'uploaded_image',
      senderRole: 'sender_role',
      translatedContent: 'translated_content',
      itemId: 'item_id',
      itemName: 'item_name',
      imageUrl: 'image_url',
      firstLoginAt: 'first_login_at',
      subscriptionExpiresAt: 'subscription_expires_at',
      canEditSensitiveData: 'can_edit_sensitive_data',
      unlockRequested: 'unlock_requested',
      lastLocale: 'last_locale',
      isBlocked: 'is_blocked',
      isManual: 'is_manual',
      manualPaymentProof: 'manual_payment_proof'
    };

    // Aplicamos o mapeamento e REMOVEMOS o campo original se ele for diferente do novo
    Object.keys(mapping).forEach(camelKey => {
      const snakeKey = mapping[camelKey];
      if (cleanData[camelKey] !== undefined) {
        // Se o campo snake_case ainda não existe ou se o camelCase é o que tem valor
        if (cleanData[snakeKey] === undefined || cleanData[camelKey] !== null) {
          cleanData[snakeKey] = cleanData[camelKey];
        }
        // Removemos o camelCase para evitar erro de "coluna não encontrada" no Supabase
        if (camelKey !== snakeKey) {
          delete cleanData[camelKey];
        }
      }
    });

    // 3. Garantir que arrays/objetos sejam enviados como string se necessário
    // Algumas tabelas no Supabase podem estar como TEXT em vez de JSONB
    const jsonFields = ['items', 'expenses', 'payments', 'services_selected', 'project_files', 'pdf_template'];
    jsonFields.forEach(field => {
      if (cleanData[field] && typeof cleanData[field] === 'object') {
        // Se for array ou objeto, convertemos para string para garantir compatibilidade
        // O Supabase aceita objetos se a coluna for JSONB, mas falha se for TEXT.
        // Stringify funciona em ambos (embora no JSONB fique como string literal).
        cleanData[field] = JSON.stringify(cleanData[field]);
      }
    });

    // 4. Mapeamento adicional para companyid (sem underscore) que aparece em alguns lugares
    if (cleanData.company_id) {
       cleanData.companyid = cleanData.company_id;
    }
    
    console.log(`syncToCloud: Tentando sincronizar ${table} (ID: ${cleanData.id || cleanData.company_id}) no Supabase...`);
    
    // Tenta upsert.
    const { error } = await supabase
      .from(table)
      .upsert(cleanData);
    
    if (error) {
      console.error(`syncToCloud: Erro ao sincronizar ${table}:`, {
        message: error.message,
        code: error.code,
        dataSent: cleanData
      });
      
      // Fallback: se falhar por coluna não encontrada, tentamos remover a coluna problemática e repetir
      if (error.code === 'PGRST204') {
        const match = error.message.match(/Could not find the '(.+)' column/);
        const missingColumn = match ? match[1] : null;
        if (missingColumn && cleanData[missingColumn] !== undefined) {
          console.warn(`syncToCloud: Removendo coluna inexistente '${missingColumn}' e tentando novamente...`);
          const retryData = { ...cleanData };
          delete retryData[missingColumn];
          const { error: retryError } = await supabase.from(table).upsert(retryData);
          if (!retryError) return { success: true };
          return { success: false, error: retryError };
        }
      }
      
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error(`syncToCloud: Erro inesperado em ${table}:`, err);
    return { success: false, error: err };
  }
};
