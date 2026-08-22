import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'undefined') 
  ? import.meta.env.VITE_SUPABASE_URL 
  : 'https://raglyqukrlxwcmlhzebd.supabase.co';

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'undefined')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2x5cXVrcmx4d2NtbGh6ZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTcxMDQsImV4cCI6MjA4Njk5MzEwNH0.fuckSJxctgYkF5ipioPYo31b_Kqwo905f64F-_Fjpc0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper para chamadas seguras ao Supabase (evita TypeError: Failed to fetch de quebrar o app)
export const safeFetch = async <T>(query: any): Promise<{ data: T | null, error: any }> => {
  try {
    const result = await query;
    return result;
  } catch (err: any) {
    console.warn("Supabase SafeFetch Warning:", err);
    return { 
      data: null, 
      error: { 
        message: err.message || "Erro de conexão com o servidor", 
        details: err.toString(),
        isFetchError: true 
      } 
    };
  }
};

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

    // Função recursiva para tentar upsert e remover colunas inexistentes
    const performUpsert = async (payload: any): Promise<SyncResult> => {
      const { error } = await safeFetch<any>(supabase.from(table).upsert(payload));
      
      if (!error) return { success: true };

      const errorMsg = String(error.message || error.details || error.hint || '');
      console.warn(`syncToCloud: Erro ao sincronizar ${table}:`, {
        message: errorMsg,
        code: error.code,
        dataSent: payload
      });

      // Fallback: se falhar por coluna não encontrada, tentamos remover a coluna problemática e repetir
      if (error.code === 'PGRST204' || error.code === '42703' || errorMsg.includes('column') || errorMsg.includes('Could not find') || errorMsg.includes('does not exist')) {
        const match = errorMsg.match(/Could not find the ['"](.+?)['"] column/i) || 
                      errorMsg.match(/column ['"](.+?)['"] of relation/i) || 
                      errorMsg.match(/column ['"](.+?)['"] does not exist/i) ||
                      errorMsg.match(/column ['"](.+?)['"]/i) ||
                      errorMsg.match(/['"](.+?)['"] column/i);
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
    
    // 2. Tratamento de imagens grandes para evitar erro de payload
    if (table === 'products' || table === 'store_orders' || table === 'companies') {
      const imageFields = table === 'products' ? ['image'] : table === 'store_orders' ? ['uploadedImage'] : ['logo', 'qrCode', 'qr_code'];
      imageFields.forEach(field => {
        if (rawData[field] && typeof rawData[field] === 'string' && rawData[field].length > 500000) {
          console.warn(`syncToCloud: Imagem '${field}' em ${table} muito grande (>500KB), removida para sincronização cloud.`);
          delete rawData[field];
        }
      });
    }

    // Tratamento específico para empresas (companies) para evitar retries por colunas inexistentes
    if (table === 'companies') {
      const companyPayload: any = {
        id: String(rawData.id),
        name: String(rawData.name || 'Empresa').trim(),
        email: rawData.email ? String(rawData.email).toLowerCase().trim() : '',
        plan: String(rawData.plan || 'free'),
        address: rawData.address ? String(rawData.address) : null,
        nif: rawData.nif ? String(rawData.nif) : null,
        phone: rawData.phone ? String(rawData.phone) : null,
        website: rawData.website ? String(rawData.website) : null,
        isManual: Boolean(rawData.isManual ?? rawData.is_manual ?? false),
        verified: rawData.verified !== undefined ? Boolean(rawData.verified) : true,
        canEditSensitiveData: Boolean(rawData.canEditSensitiveData ?? rawData.can_edit_sensitive_data ?? false),
        unlockRequested: Boolean(rawData.unlockRequested ?? rawData.unlock_requested ?? false)
      };

      if (rawData.password) {
        companyPayload.password = String(rawData.password);
      }

      if (rawData.logo && typeof rawData.logo === 'string' && rawData.logo.length < 500000) {
        companyPayload.logo = rawData.logo;
      }
      if (rawData.qrCode || rawData.qr_code) {
        companyPayload.qrCode = rawData.qrCode || rawData.qr_code;
      }
      if (rawData.subscriptionExpiresAt || rawData.subscription_expires_at) {
        companyPayload.subscriptionExpiresAt = rawData.subscriptionExpiresAt || rawData.subscription_expires_at;
      }
      if (rawData.lastLocale || rawData.last_locale) {
        companyPayload.lastLocale = rawData.lastLocale || rawData.last_locale;
      }
      if (rawData.masterNotes || rawData.master_notes) {
        companyPayload.master_notes = rawData.masterNotes || rawData.master_notes;
      }
      if (rawData.firstLoginAt || rawData.first_login_at) {
        companyPayload.firstLoginAt = rawData.firstLoginAt || rawData.first_login_at;
      }

      console.log(`syncToCloud: Sincronizando empresa ${companyPayload.id} (${companyPayload.email}) no Supabase...`);
      return await performUpsert(companyPayload);
    }

    // Tratamento específico para job_offers (vagas de trabalho)
    if (table === 'job_offers') {
      const cId = rawData.company_id || rawData.companyId || rawData.companyid;
      const cName = rawData.company_name || rawData.companyName || rawData.companyname || 'Empresa';
      const sDate = rawData.start_date || rawData.startDate || rawData.startdate;
      const cAt = rawData.created_at || rawData.createdAt || rawData.createdat || rawData.timestamp;
      const uAt = rawData.updated_at || rawData.updatedAt || rawData.updatedat;

      const formatTimestamp = (val: any) => {
        if (!val) return new Date().toISOString();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      };

      const jobPayload: any = {
        id: String(rawData.id),
        company_id: String(cId || ''),
        company_name: String(cName || 'Empresa'),
        location: String(rawData.location || ''),
        specialty: String(rawData.specialty || ''),
        salary: String(rawData.salary || ''),
        start_date: String(sDate || ''),
        duration: String(rawData.duration || ''),
        description: String(rawData.description || ''),
        contact: String(rawData.contact || ''),
        status: String(rawData.status || 'pending'),
        feedback: rawData.feedback ? String(rawData.feedback) : null,
        candidates_json: rawData.candidatesJson || rawData.candidates_json || rawData.candidatesjson ? String(rawData.candidatesJson || rawData.candidates_json || rawData.candidatesjson) : null,
        created_at: formatTimestamp(cAt),
        updated_at: formatTimestamp(uAt)
      };
      Object.keys(jobPayload).forEach(k => {
        if (jobPayload[k] === undefined) delete jobPayload[k];
      });

      console.log(`syncToCloud: Sincronizando vaga de trabalho ${jobPayload.id} no Supabase...`, jobPayload);
      return await performUpsert(jobPayload);
    }

    if (table === 'candidates') {
      const formatTimestamp = (val: any) => {
        if (!val) return new Date().toISOString();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      };
      const cPayload: any = {
        id: String(rawData.id || 'cand_' + Math.random().toString(36).substring(2, 9)),
        job_offer_id: String(rawData.job_offer_id || rawData.jobOfferId || ''),
        full_name: String(rawData.full_name || rawData.fullName || ''),
        email: String(rawData.email || ''),
        phone: String(rawData.phone || ''),
        cover_letter: String(rawData.cover_letter || rawData.coverLetter || ''),
        has_residence_permit: Boolean(rawData.has_residence_permit ?? rawData.hasResidencePermit ?? false),
        document_type: String(rawData.document_type || rawData.documentType || ''),
        has_drivers_license: Boolean(rawData.has_drivers_license ?? rawData.hasDriversLicense ?? false),
        has_construction_experience: Boolean(rawData.has_construction_experience ?? rawData.hasConstructionExperience ?? false),
        experience_duration: String(rawData.experience_duration || rawData.experienceDuration || ''),
        photo_url: String(rawData.photo_url || rawData.photoUrl || ''),
        created_at: formatTimestamp(rawData.created_at || rawData.createdAt)
      };
      return await performUpsert(cPayload);
    }

    // 3. Mapeamento Automático: Mantém as chaves originais (camelCase) E adiciona versões snake_case e lowercase
    const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    const cleanData: any = {};
    Object.keys(rawData).forEach(key => {
      cleanData[key] = rawData[key];
      const snakeKey = toSnakeCase(key);
      if (snakeKey !== key) {
        cleanData[snakeKey] = rawData[key];
      }
      const lowerKey = key.toLowerCase();
      if (lowerKey !== key && lowerKey !== snakeKey) {
        cleanData[lowerKey] = rawData[key];
      }
    });

    // 4. Casos especiais de mapeamento (garante todas as variações de nomes de colunas)
    if (rawData.companyId || rawData.company_id || rawData.companyid) {
      const cId = rawData.companyId || rawData.company_id || rawData.companyid;
      cleanData.companyId = cId;
      cleanData.company_id = cId;
      cleanData.companyid = cId;
    }
    if (rawData.senderRole || rawData.sender_role || rawData.senderrole) {
      const sRole = rawData.senderRole || rawData.sender_role || rawData.senderrole;
      cleanData.senderRole = sRole;
      cleanData.sender_role = sRole;
      cleanData.senderrole = sRole;
    }
    if (rawData.translatedContent || rawData.translated_content || rawData.translatedcontent) {
      const tc = rawData.translatedContent || rawData.translated_content || rawData.translatedcontent;
      cleanData.translatedContent = tc;
      cleanData.translated_content = tc;
      cleanData.translatedcontent = tc;
    }
    if (rawData.timestamp || rawData.created_at || rawData.createdAt) {
      const ts = rawData.timestamp || rawData.created_at || rawData.createdAt;
      cleanData.timestamp = ts;
      cleanData.created_at = ts;
      cleanData.createdAt = ts;
    }

    // 5. Garantir que arrays/objetos sejam enviados como string se necessário
    // Algumas tabelas no Supabase podem estar como TEXT em vez de JSONB
    const jsonFields = ['items', 'expenses', 'payments', 'services_selected', 'project_files', 'pdf_template', 'additionalImages', 'additional_images', 'customServices', 'custom_services'];
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
    
    return await performUpsert(cleanData);
  } catch (err) {
    console.warn(`syncToCloud: Erro inesperado em ${table}:`, err);
    return { success: false, error: err };
  }
};
