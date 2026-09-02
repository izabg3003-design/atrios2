import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  CheckCircle2, 
  Circle, 
  Share2, 
  Printer, 
  Sparkles, 
  PackageCheck, 
  AlertCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Budget, SupplyItem, PlanType, CurrencyCode, CURRENCIES } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Locale, translations } from '../translations';

interface SupplyListManagerProps {
  budget: Budget;
  plan: PlanType;
  onSave: (updatedBudget: Budget) => void;
  onClose: () => void;
  onUpgrade?: () => void;
  locale: Locale;
  currencyCode: CurrencyCode;
}

// Materiais frequentes de construção para inserção rápida
const COMMON_SUPPLIES = [
  { name: 'Cimento CP-II', defaultQty: 10, unit: 'sacos' },
  { name: 'Areia Média Lavada', defaultQty: 2, unit: 'm³' },
  { name: 'Pedra Brita nº 1', defaultQty: 2, unit: 'm³' },
  { name: 'Argamassa AC-III', defaultQty: 5, unit: 'sacos' },
  { name: 'Tijolo / Bloco Cerâmico', defaultQty: 500, unit: 'un' },
  { name: 'Aço / Ferro CA-50 8mm', defaultQty: 10, unit: 'barras' },
  { name: 'Tinta Acrílica Fosca', defaultQty: 2, unit: 'latas 18L' },
  { name: 'Tubo PVC Esgoto 100mm', defaultQty: 4, unit: 'barras 6m' },
  { name: 'Fita Veda-Rosca 18mm', defaultQty: 3, unit: 'un' },
  { name: 'Prego de Aço c/ Cabeça', defaultQty: 2, unit: 'kg' }
];

export const SupplyListManager: React.FC<SupplyListManagerProps> = ({ 
  budget, 
  onSave, 
  onClose, 
  locale, 
  currencyCode 
}) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];

  const supplies: SupplyItem[] = budget.supplies || [];

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('sacos');
  const [estimatedPrice, setEstimatedPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Cálculos de resumo
  const totalItems = supplies.length;
  const purchasedItems = supplies.filter(s => s.purchased).length;
  const pendingItems = totalItems - purchasedItems;
  const progressPercent = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  
  const totalEstimatedCost = supplies.reduce((sum, s) => {
    return sum + ((s.estimatedPrice || 0) * (s.quantity || 1));
  }, 0);

  const formatValue = (val: number) => {
    return (val * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode });
  };

  const handleStartEdit = (item: SupplyItem) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity || 1);
    setUnit(item.unit || 'un');
    setEstimatedPrice(item.estimatedPrice ? Number((item.estimatedPrice * currencyInfo.rate).toFixed(2)) : '');
    setNotes(item.notes || '');
    setShowForm(true);
  };

  const handleSaveSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const eurPrice = estimatedPrice !== '' && Number(estimatedPrice) > 0 
      ? Number(estimatedPrice) / currencyInfo.rate 
      : undefined;

    let updatedSupplies: SupplyItem[];

    if (editingId) {
      updatedSupplies = supplies.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: name.trim(),
            quantity: Number(quantity) || 1,
            unit: unit.trim() || 'un',
            estimatedPrice: eurPrice,
            notes: notes.trim() || undefined
          };
        }
        return item;
      });
    } else {
      const newItem: SupplyItem = {
        id: uuidv4(),
        name: name.trim(),
        quantity: Number(quantity) || 1,
        unit: unit.trim() || 'un',
        estimatedPrice: eurPrice,
        notes: notes.trim() || undefined,
        purchased: false
      };
      updatedSupplies = [...supplies, newItem];
    }

    const updatedBudget = {
      ...budget,
      supplies: updatedSupplies
    };

    onSave(updatedBudget);
    resetForm();
  };

  const handleAddQuickSupply = (quick: typeof COMMON_SUPPLIES[0]) => {
    const exists = supplies.some(s => s.name.toLowerCase() === quick.name.toLowerCase());
    if (exists) {
      // Se já existe, apenas incrementa a quantidade
      const updated = supplies.map(s => {
        if (s.name.toLowerCase() === quick.name.toLowerCase()) {
          return { ...s, quantity: (s.quantity || 0) + quick.defaultQty };
        }
        return s;
      });
      onSave({ ...budget, supplies: updated });
      return;
    }

    const newItem: SupplyItem = {
      id: uuidv4(),
      name: quick.name,
      quantity: quick.defaultQty,
      unit: quick.unit,
      purchased: false
    };

    onSave({
      ...budget,
      supplies: [...supplies, newItem]
    });
  };

  const handleTogglePurchased = (id: string) => {
    const updatedSupplies = supplies.map(item => {
      if (item.id === id) {
        return { ...item, purchased: !item.purchased };
      }
      return item;
    });

    onSave({
      ...budget,
      supplies: updatedSupplies
    });
  };

  const handleRemoveSupply = (id: string) => {
    if (editingId === id) {
      resetForm();
    }
    const updatedSupplies = supplies.filter(s => s.id !== id);
    onSave({
      ...budget,
      supplies: updatedSupplies
    });
  };

  const resetForm = () => {
    setName('');
    setQuantity(1);
    setUnit('sacos');
    setEstimatedPrice('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  // Gerar texto formatado para copiar ou enviar via WhatsApp
  const handleShareWhatsApp = () => {
    if (supplies.length === 0) return;

    let text = `📋 *LISTA DE COMPRAS / SUPRIMENTOS*\n`;
    text += `🏢 *Obra/Cliente:* ${budget.clientName}\n`;
    if (budget.workLocation) text += `📍 *Local:* ${budget.workLocation}\n`;
    text += `📅 *Data:* ${new Date().toLocaleDateString(locale)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const pending = supplies.filter(s => !s.purchased);
    const completed = supplies.filter(s => s.purchased);

    if (pending.length > 0) {
      text += `⏳ *A COMPRAR (${pending.length}):*\n`;
      pending.forEach(item => {
        text += `▫️ ${item.quantity} ${item.unit} - *${item.name}*`;
        if (item.notes) text += ` _(${item.notes})_`;
        text += `\n`;
      });
      text += `\n`;
    }

    if (completed.length > 0) {
      text += `✅ *JÁ COMPRADO (${completed.length}):*\n`;
      completed.forEach(item => {
        text += `▪️ ~${item.quantity} ${item.unit} - ${item.name}~\n`;
      });
      text += `\n`;
    }

    if (totalEstimatedCost > 0) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `💰 *Custo Total Estimado:* ${formatValue(totalEstimatedCost)}\n`;
    }

    text += `\n_Gerado via ÁTRIOS Obra & Gestão_`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);

    // Abrir WhatsApp se suportado
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Compras - ${budget.clientName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #0f172a; }
            h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; }
            .header-info { margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; font-size: 13px; color: #475569; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .badge-pending { background: #fef3c7; color: #b45309; }
            .badge-done { background: #dcfce7; color: #15803d; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-weight: 700; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
            .done { text-decoration: line-through; color: #94a3b8; }
            .box { width: 16px; height: 16px; border: 2px solid #64748b; border-radius: 4px; display: inline-block; }
            .total-row { font-weight: 800; background: #f8fafc; font-size: 14px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>📋 Lista de Compras & Suprimentos da Obra</h1>
          <div class="header-info">
            <strong>Cliente / Pedido:</strong> ${budget.clientName} | 
            <strong>Ref:</strong> ${budget.id} | 
            <strong>Local:</strong> ${budget.workLocation || 'Não especificado'} | 
            <strong>Data:</strong> ${new Date().toLocaleDateString(locale)}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">Status</th>
                <th>Material / Suprimento</th>
                <th style="width: 120px;">Quantidade</th>
                <th style="width: 140px;">Custo Estimado</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${supplies.map(item => `
                <tr class="${item.purchased ? 'done' : ''}">
                  <td style="text-align: center;">
                    ${item.purchased ? '✅' : '<div class="box"></div>'}
                  </td>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>${item.estimatedPrice ? formatValue(item.estimatedPrice * item.quantity) : '-'}</td>
                  <td>${item.notes || '-'}</td>
                </tr>
              `).join('')}
              ${totalEstimatedCost > 0 ? `
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 12px;">TOTAL ESTIMADO DE MATERIAIS:</td>
                  <td colspan="2" style="padding: 12px; color: #047857;">${formatValue(totalEstimatedCost)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center;">Gerado pelo ÁTRIOS - Gestor de Obras e Orçamentos</p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
        
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShoppingCart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">Lista de Compras & Suprimentos</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Obra
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/60 truncate max-w-[200px] sm:max-w-none">
                {t.clientName}: {budget.clientName} {budget.workLocation ? `• ${budget.workLocation}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {supplies.length > 0 && (
              <>
                <button
                  onClick={handleShareWhatsApp}
                  className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Compartilhar lista formatada no WhatsApp"
                >
                  <Share2 size={15} />
                  <span className="hidden sm:inline">{copiedSuccess ? 'Copiado!' : 'WhatsApp'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Imprimir lista de compras"
                >
                  <Printer size={15} />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 no-scrollbar">
          
          {/* Métricas e Progresso */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total de Itens
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{totalItems}</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                A Comprar
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-900">{pendingItems}</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Já Comprados
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-900">{purchasedItems}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                Custo Estimado
              </p>
              <p className="text-base sm:text-lg font-black text-blue-900 truncate">
                {totalEstimatedCost > 0 ? formatValue(totalEstimatedCost) : 'R$ 0,00'}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          {totalItems > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Progresso das compras</span>
                <span className="text-amber-600">{progressPercent}% concluído</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Atalhos Rápidos de Materiais da Construção */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-500" />
              <span>Inserir Material Frequente (1 Clique):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUPPLIES.map((quick, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddQuickSupply(quick)}
                  className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg font-bold transition-all border border-slate-200/80 active:scale-95 flex items-center gap-1"
                >
                  <Plus size={12} className="text-slate-400" />
                  <span>{quick.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({quick.defaultQty} {quick.unit})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão para abrir formulário */}
          {!showForm ? (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={16} className="text-amber-400" />
              <span>Adicionar Material Personalizado à Lista</span>
            </button>
          ) : (
            <form onSubmit={handleSaveSupply} className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers size={14} className="text-amber-500" />
                  {editingId ? 'Editar Material da Lista' : 'Novo Material / Suprimento'}
                </h3>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Nome do Material / Suprimento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cimento, Areia Média, Pedra Brita..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Unidade
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 outline-none focus:border-slate-900"
                  >
                    <option value="sacos">sacos</option>
                    <option value="m³">m³ (metros cúbicos)</option>
                    <option value="kg">kg</option>
                    <option value="ton">toneladas</option>
                    <option value="un">unidades (un)</option>
                    <option value="barras">barras</option>
                    <option value="latas 18L">latas 18L</option>
                    <option value="galões 3.6L">galões 3.6L</option>
                    <option value="metros">metros (m)</option>
                    <option value="caixas">caixas</option>
                    <option value="rolo">rolo</option>
                  </select>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Preço Unitário Estimado ({currencyInfo.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Opcional (Ex: 35.00)"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 outline-none focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-7 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Observação / Fornecedor Sugerido
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Comprar na loja X, Tipo CP-II"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                >
                  {editingId ? 'Salvar Alteração' : 'Adicionar à Lista'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Itens */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Itens da Lista de Compras ({supplies.length})
            </h3>

            {supplies.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShoppingCart size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Nenhum material adicionado ainda.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Clique nos atalhos acima ou no botão de adicionar para listar areia, pedra, cimento, tijolos e outros suprimentos necessários.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {supplies.map((item) => {
                  const itemTotal = (item.estimatedPrice || 0) * (item.quantity || 1);
                  return (
                    <div 
                      key={item.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        item.purchased 
                          ? 'bg-slate-50/70 border-slate-200/60 opacity-75' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Checkbox de comprado */}
                      <button
                        type="button"
                        onClick={() => handleTogglePurchased(item.id)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          item.purchased
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-amber-100 text-slate-400 hover:text-amber-600 border border-slate-300'
                        }`}
                        title={item.purchased ? 'Marcar como pendente' : 'Marcar como já comprado'}
                      >
                        {item.purchased ? <Check size={16} className="stroke-[3]" /> : <Circle size={14} />}
                      </button>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-sm text-slate-900 ${item.purchased ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {item.quantity} {item.unit}
                          </span>
                          {item.purchased && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Comprado
                            </span>
                          )}
                        </div>

                        {(item.notes || item.estimatedPrice) && (
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            {item.estimatedPrice && item.estimatedPrice > 0 && (
                              <span className="font-bold text-slate-600">
                                Preço est.: {formatValue(item.estimatedPrice)}/{item.unit} 
                                <span className="text-slate-400 ml-1">({formatValue(itemTotal)})</span>
                              </span>
                            )}
                            {item.notes && (
                              <span className="italic text-slate-400">
                                Obs: {item.notes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar material"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupply(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover material"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {pendingItems > 0 ? (
              <span>Faltam <strong>{pendingItems}</strong> de {totalItems} materiais para comprar.</span>
            ) : totalItems > 0 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <PackageCheck size={14} /> Todos os materiais já foram comprados!
              </span>
            ) : (
              <span>Nenhum material listado.</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
