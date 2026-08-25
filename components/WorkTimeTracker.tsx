import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  UserPlus, 
  Users, 
  Calendar, 
  MapPin, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  CheckCircle2, 
  Coffee, 
  Utensils, 
  Briefcase, 
  Phone, 
  FileSpreadsheet, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  X, 
  Save, 
  Building2, 
  Check, 
  Info,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Worker, WorkTimeLog } from '../types';
import { 
  getWorkers, 
  saveWorker, 
  deleteWorker, 
  getWorkTimeLogs, 
  saveWorkTimeLog, 
  deleteWorkTimeLog,
  generateShortId
} from '../services/storage';

interface WorkTimeTrackerProps {
  company: Company;
  locale: string;
  currencyCode?: string;
}

export const WorkTimeTracker: React.FC<WorkTimeTrackerProps> = ({
  company,
  locale,
  currencyCode = 'EUR'
}) => {
  // Estado de Trabalhadores e Registos
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [logs, setLogs] = useState<WorkTimeLog[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  // Filtro de Mês/Ano selecionado (Padrão: Mês atual)
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => new Date());
  
  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkTimeLog | null>(null);

  // Form states - Colaborador
  const [workerName, setWorkerName] = useState('');
  const [workerNif, setWorkerNif] = useState('');
  const [workerRole, setWorkerRole] = useState('');
  const [workerAddress, setWorkerAddress] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerHourlyRate, setWorkerHourlyRate] = useState<string>('');
  const [workerAdmissionDate, setWorkerAdmissionDate] = useState('');
  const [workerActive, setWorkerActive] = useState(true);

  // Form states - Registo de Ponto / Dia
  const [logWorkerId, setLogWorkerId] = useState<string>('');
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logStartTime, setLogStartTime] = useState('08:00');
  const [logCoffeeBreak, setLogCoffeeBreak] = useState('15 min');
  const [logLunchBreak, setLogLunchBreak] = useState('12:00 - 13:00 (1h)');
  const [logEndTime, setLogEndTime] = useState('17:00');
  const [logWorkLocation, setLogWorkLocation] = useState('');
  const [logDetails, setLogDetails] = useState('');

  // Carregamento inicial de dados
  const loadData = () => {
    if (!company?.id) return;
    const loadedWorkers = getWorkers(company.id);
    const loadedLogs = getWorkTimeLogs(company.id);

    // Se a empresa ainda não tiver nenhum trabalhador, adiciona um inicial demonstrativo para agilizar o uso
    if (loadedWorkers.length === 0) {
      const defaultWorker: Worker = {
        id: generateShortId(),
        companyId: company.id,
        name: 'João Silva',
        nif: '254896321',
        role: 'Pedreiro de 1ª',
        address: 'Rua das Flores, nº 14, Lisboa',
        phone: '+351 912 345 678',
        email: 'joao.silva@exemplo.com',
        hourlyRate: 12.5,
        admissionDate: new Date().toISOString().split('T')[0],
        active: true,
        createdAt: new Date().toISOString()
      };
      saveWorker(defaultWorker);

      // Adiciona um registo inicial para o João
      const todayStr = new Date().toISOString().split('T')[0];
      const defaultLog: WorkTimeLog = {
        id: generateShortId(),
        companyId: company.id,
        workerId: defaultWorker.id,
        date: todayStr,
        startTime: '08:00',
        coffeeBreak: '10:00 - 10:15 (15m)',
        lunchBreak: '12:00 - 13:00 (1h)',
        endTime: '17:00',
        totalHours: 7.75,
        workLocation: 'Edifício Panorama - Av. Principal, Lisboa',
        details: 'Assentamento de blocos de alvenaria e preparação do piso da sala principal.',
        createdAt: new Date().toISOString()
      };
      saveWorkTimeLog(defaultLog);

      setWorkers([defaultWorker]);
      setLogs([defaultLog]);
      setSelectedWorkerId(defaultWorker.id);
      return;
    }

    setWorkers(loadedWorkers);
    setLogs(loadedLogs);

    if (!selectedWorkerId && loadedWorkers.length > 0) {
      setSelectedWorkerId(loadedWorkers[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  // Colaborador selecionado
  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === selectedWorkerId) || workers[0] || null;
  }, [workers, selectedWorkerId]);

  // Formatação do Mês Selecionado (ex: "Agosto de 2026")
  const currentMonthYearLabel = useMemo(() => {
    return selectedMonthDate.toLocaleDateString(locale.startsWith('pt') ? 'pt-PT' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [selectedMonthDate, locale]);

  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonth = selectedMonthDate.getMonth(); // 0-11

  // Filtra registos do trabalhador selecionado no mês escolhido
  const currentWorkerLogsForMonth = useMemo(() => {
    if (!selectedWorker) return [];
    return logs
      .filter(l => {
        if (l.workerId !== selectedWorker.id) return false;
        const logDateObj = new Date(l.date);
        return logDateObj.getFullYear() === selectedYear && logDateObj.getMonth() === selectedMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, selectedWorker, selectedYear, selectedMonth]);

  // Cálculos e Estatísticas do Trabalhador no Mês
  const stats = useMemo(() => {
    const totalHours = currentWorkerLogsForMonth.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);
    const totalDays = currentWorkerLogsForMonth.length;
    const avgDailyHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    // Obras únicas visitadas
    const uniqueLocations = new Set(
      currentWorkerLogsForMonth.map(l => l.workLocation.trim()).filter(Boolean)
    ).size;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      totalDays,
      avgDailyHours: Number(avgDailyHours.toFixed(2)),
      uniqueLocations
    };
  }, [currentWorkerLogsForMonth]);

  // Estatísticas Globais da Empresa
  const globalStats = useMemo(() => {
    const activeWorkers = workers.filter(w => w.active).length;
    const totalWorkers = workers.length;
    const totalLogsThisMonth = logs.filter(l => {
      const d = new Date(l.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
    const totalCompanyHoursThisMonth = totalLogsThisMonth.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);

    return {
      activeWorkers,
      totalWorkers,
      totalLogsThisMonth: totalLogsThisMonth.length,
      totalCompanyHoursThisMonth: Number(totalCompanyHoursThisMonth.toFixed(1))
    };
  }, [workers, logs, selectedYear, selectedMonth]);

  // Lista de trabalhadores filtrados por busca
  const filteredWorkers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return workers;
    return workers.filter(w => 
      w.name.toLowerCase().includes(q) ||
      w.role.toLowerCase().includes(q) ||
      w.nif.toLowerCase().includes(q) ||
      w.phone.toLowerCase().includes(q)
    );
  }, [workers, searchQuery]);

  // Navegação de Mês
  const handlePrevMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setSelectedMonthDate(new Date());
  };

  // Helper para calcular horas líquidas a partir de horários
  const calculateTotalHours = (start: string, end: string, lunchText: string, coffeeText: string): number => {
    try {
      if (!start || !end) return 8;
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);

      let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (totalMinutes < 0) totalMinutes += 24 * 60; // caso vire a noite

      // Deduz Almoço (padrão 60 min se contiver 1h ou padrão)
      let lunchDeductionMinutes = 60;
      if (lunchText.includes('30m') || lunchText.includes('30 min')) {
        lunchDeductionMinutes = 30;
      } else if (lunchText.includes('1.5h') || lunchText.includes('90 min')) {
        lunchDeductionMinutes = 90;
      } else if (lunchText.includes('0m') || lunchText.includes('Sem pausa')) {
        lunchDeductionMinutes = 0;
      }

      // Deduz Café (padrão 15 min)
      let coffeeDeductionMinutes = 15;
      if (coffeeText.includes('10m') || coffeeText.includes('10 min')) {
        coffeeDeductionMinutes = 10;
      } else if (coffeeText.includes('20m') || coffeeText.includes('20 min')) {
        coffeeDeductionMinutes = 20;
      } else if (coffeeText.includes('30m') || coffeeText.includes('30 min')) {
        coffeeDeductionMinutes = 30;
      } else if (coffeeText.includes('0m') || coffeeText.includes('Sem pausa')) {
        coffeeDeductionMinutes = 0;
      }

      const netMinutes = Math.max(0, totalMinutes - lunchDeductionMinutes - coffeeDeductionMinutes);
      return Number((netMinutes / 60).toFixed(2));
    } catch {
      return 8;
    }
  };

  // Abrir Modal de Novo Colaborador
  const handleOpenNewWorkerModal = () => {
    setEditingWorker(null);
    setWorkerName('');
    setWorkerNif('');
    setWorkerRole('');
    setWorkerAddress('');
    setWorkerPhone('');
    setWorkerEmail('');
    setWorkerHourlyRate('');
    setWorkerAdmissionDate(new Date().toISOString().split('T')[0]);
    setWorkerActive(true);
    setIsWorkerModalOpen(true);
  };

  // Abrir Modal de Editar Colaborador
  const handleOpenEditWorkerModal = (worker: Worker) => {
    setEditingWorker(worker);
    setWorkerName(worker.name);
    setWorkerNif(worker.nif);
    setWorkerRole(worker.role);
    setWorkerAddress(worker.address);
    setWorkerPhone(worker.phone);
    setWorkerEmail(worker.email || '');
    setWorkerHourlyRate(worker.hourlyRate ? String(worker.hourlyRate) : '');
    setWorkerAdmissionDate(worker.admissionDate || '');
    setWorkerActive(worker.active);
    setIsWorkerModalOpen(true);
  };

  // Salvar Colaborador
  const handleSaveWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim() || !workerNif.trim() || !workerRole.trim()) {
      alert('Por favor, preencha o Nome, NIF e Função do colaborador.');
      return;
    }

    const workerObj: Worker = {
      id: editingWorker ? editingWorker.id : generateShortId(),
      companyId: company.id,
      name: workerName.trim(),
      nif: workerNif.trim(),
      role: workerRole.trim(),
      address: workerAddress.trim(),
      phone: workerPhone.trim(),
      email: workerEmail.trim() || undefined,
      hourlyRate: workerHourlyRate ? parseFloat(workerHourlyRate) : undefined,
      admissionDate: workerAdmissionDate || undefined,
      active: workerActive,
      createdAt: editingWorker ? editingWorker.createdAt : new Date().toISOString()
    };

    saveWorker(workerObj);
    setIsWorkerModalOpen(false);
    loadData();
    setSelectedWorkerId(workerObj.id);
  };

  // Eliminar Colaborador
  const handleDeleteWorker = (worker: Worker) => {
    if (confirm(`Tem a certeza que deseja eliminar o colaborador ${worker.name}? Todos os registos de horas deste trabalhador também serão removidos.`)) {
      deleteWorker(worker.id, company.id);
      loadData();
      if (selectedWorkerId === worker.id) {
        const remaining = workers.filter(w => w.id !== worker.id);
        setSelectedWorkerId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Abrir Modal de Novo Registo de Ponto
  const handleOpenNewLogModal = (workerIdParam?: string) => {
    setEditingLog(null);
    setLogWorkerId(workerIdParam || selectedWorkerId || (workers[0]?.id || ''));
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogStartTime('08:00');
    setLogCoffeeBreak('10:00 - 10:15 (15m)');
    setLogLunchBreak('12:00 - 13:00 (1h)');
    setLogEndTime('17:00');
    setLogWorkLocation(currentWorkerLogsForMonth[0]?.workLocation || 'Obra Principal');
    setLogDetails('');
    setIsLogModalOpen(true);
  };

  // Abrir Modal de Editar Registo de Ponto
  const handleOpenEditLogModal = (log: WorkTimeLog) => {
    setEditingLog(log);
    setLogWorkerId(log.workerId);
    setLogDate(log.date);
    setLogStartTime(log.startTime || '08:00');
    setLogCoffeeBreak(log.coffeeBreak || '15 min');
    setLogLunchBreak(log.lunchBreak || '12:00 - 13:00 (1h)');
    setLogEndTime(log.endTime || '17:00');
    setLogWorkLocation(log.workLocation || '');
    setLogDetails(log.details || '');
    setIsLogModalOpen(true);
  };

  // Salvar Registo de Ponto
  const handleSaveLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logWorkerId) {
      alert('Selecione o colaborador.');
      return;
    }
    if (!logDate) {
      alert('Selecione a data do registo.');
      return;
    }

    const calculatedHours = calculateTotalHours(logStartTime, logEndTime, logLunchBreak, logCoffeeBreak);

    const logObj: WorkTimeLog = {
      id: editingLog ? editingLog.id : generateShortId(),
      companyId: company.id,
      workerId: logWorkerId,
      date: logDate,
      startTime: logStartTime,
      coffeeBreak: logCoffeeBreak,
      lunchBreak: logLunchBreak,
      endTime: logEndTime,
      totalHours: calculatedHours,
      workLocation: logWorkLocation.trim() || 'Obra Principal',
      details: logDetails.trim(),
      createdAt: editingLog ? editingLog.createdAt : new Date().toISOString()
    };

    saveWorkTimeLog(logObj);
    setIsLogModalOpen(false);
    loadData();
    setSelectedWorkerId(logWorkerId);
  };

  // Eliminar Registo de Ponto
  const handleDeleteLog = (logId: string) => {
    if (confirm('Tem a certeza que deseja eliminar este registo de horas?')) {
      deleteWorkTimeLog(logId, company.id);
      loadData();
    }
  };

  // Exportar Folha de Horas / Ponto em PDF
  const handleExportPDF = () => {
    if (!selectedWorker) {
      alert('Selecione um colaborador para exportar a folha de ponto.');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header Empresa
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(company.name.toUpperCase(), 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`NIF: ${company.nif || 'Não informado'} | Email: ${company.email} | Tel: ${company.phone || 'Não informado'}`, 14, 21);

      // Título do Documento
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FOLHA DE REGISTO DE HORAS & PONTO', 14, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Período de Referência: ${currentMonthYearLabel.toUpperCase()}`, 14, 47);

      // Bloco de Dados do Colaborador
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 52, pageWidth - 28, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Colaborador: ${selectedWorker.name.toUpperCase()}`, 18, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Função: ${selectedWorker.role}`, 18, 66);
      doc.text(`NIF: ${selectedWorker.nif}`, 18, 72);

      doc.text(`Contacto: ${selectedWorker.phone || 'N/A'}`, 110, 66);
      doc.text(`Morada: ${selectedWorker.address || 'N/A'}`, 110, 72);

      // Tabela com os Registos de Ponto
      const tableData = currentWorkerLogsForMonth.map(log => {
        const d = new Date(log.date);
        const dayFormatted = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' });
        return [
          dayFormatted,
          log.startTime || '--',
          log.coffeeBreak || '--',
          log.lunchBreak || '--',
          log.endTime || '--',
          `${log.totalHours || 0}h`,
          log.workLocation || '--',
          log.details || '--'
        ];
      });

      autoTable(doc, {
        startY: 84,
        head: [['Data / Dia', 'Entrada', 'P. Café', 'P. Almoço', 'Saída', 'Total', 'Local Obra / Serviço', 'Detalhes / Atividades']],
        body: tableData.length > 0 ? tableData : [['Nenhum registo', '--', '--', '--', '--', '0h', '--', '--']],
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [51, 65, 85],
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 26, fontStyle: 'bold' },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
          6: { cellWidth: 35 },
          7: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });

      // Sumário de Totais
      const finalY = (doc as any).lastAutoTable.finalY + 8;
      
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, finalY, pageWidth - 28, 16, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`TOTAL DE DIAS TRABALHADOS: ${stats.totalDays}`, 20, finalY + 10);
      doc.text(`TOTAL DE HORAS LÍQUIDAS: ${stats.totalHours} Horas`, 110, finalY + 10);

      // Assinaturas
      const signY = finalY + 36;
      if (signY + 20 < doc.internal.pageSize.height) {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);

        // Assinatura Colaborador
        doc.line(20, signY, 90, signY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Assinatura do Colaborador', 55, signY + 5, { align: 'center' });
        doc.text(selectedWorker.name, 55, signY + 9, { align: 'center' });

        // Assinatura Empresa
        doc.line(pageWidth - 90, signY, pageWidth - 20, signY);
        doc.text('Assinatura / Carimbo da Empresa', pageWidth - 55, signY + 5, { align: 'center' });
        doc.text(company.name, pageWidth - 55, signY + 9, { align: 'center' });
      }

      // Rodapé
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento emitido por ${company.name} através do Átrios Software em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, 14, doc.internal.pageSize.height - 8);

      const fileName = `Folha_Ponto_${selectedWorker.name.replace(/\s+/g, '_')}_${selectedMonthDate.getFullYear()}_${selectedMonthDate.getMonth() + 1}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('Erro ao gerar PDF de folha de ponto:', e);
      alert('Ocorreu um erro ao gerar o PDF. Por favor tente novamente.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Header Principal da Página */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                Equipa & Obra
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Registo de Horas dos Colaboradores
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Registo diário de ponto, controlo de pausas de café e almoço, locais de serviço e tarefas executadas por cada trabalhador.
          </p>
        </div>

        {/* Botões de Ação Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenNewWorkerModal}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Novo Colaborador</span>
          </button>

          <button
            onClick={() => handleOpenNewLogModal(selectedWorkerId || undefined)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Registar Dia / Ponto</span>
          </button>

          {selectedWorker && (
            <button
              onClick={handleExportPDF}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Exportar Folha de Ponto em PDF"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Globais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">Colaboradores</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{globalStats.totalWorkers} <span className="text-xs font-bold text-slate-400">({globalStats.activeWorkers} ativos)</span></p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">Horas no Mês</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{globalStats.totalCompanyHoursThisMonth}h</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">Registos no Mês</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{globalStats.totalLogsThisMonth} dias</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">Mês Atual</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 capitalize truncate">{currentMonthYearLabel}</p>
          </div>
        </div>
      </div>

      {/* Layout Principal: Lista de Trabalhadores (Esquerda) + Relação de Horas do Selecionado (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Painel Esquerdo: Lista de Trabalhadores (4 colunas) */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Trabalhadores ({workers.length})
              </h2>
            </div>
            <button
              onClick={handleOpenNewWorkerModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Adicionar Colaborador"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, função, NIF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all"
            />
          </div>

          {/* Lista de Colaboradores */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredWorkers.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Users size={28} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Nenhum colaborador encontrado</p>
                <button
                  onClick={handleOpenNewWorkerModal}
                  className="text-xs font-black text-amber-600 hover:underline uppercase tracking-wider"
                >
                  + Adicionar Primeiro
                </button>
              </div>
            ) : (
              filteredWorkers.map(worker => {
                const isSelected = selectedWorker?.id === worker.id;
                // Total de horas desse trabalhador no mês selecionado
                const workerMonthLogs = logs.filter(l => {
                  if (l.workerId !== worker.id) return false;
                  const d = new Date(l.date);
                  return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
                });
                const workerMonthHours = workerMonthLogs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);

                return (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {worker.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs sm:text-sm truncate">
                            {worker.name}
                          </p>
                          <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {worker.role}
                          </p>
                        </div>
                      </div>

                      {/* Horas e Ações Rápidas */}
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                          isSelected ? 'bg-white/10 text-amber-400' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {workerMonthHours.toFixed(1)}h
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditWorkerModal(worker);
                            }}
                            className={`p-1 rounded-md hover:bg-white/20 transition-all ${isSelected ? 'text-white' : 'text-slate-500'}`}
                            title="Editar dados"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorker(worker);
                            }}
                            className={`p-1 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all`}
                            title="Eliminar trabalhador"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] font-bold ${
                      isSelected ? 'border-white/10 text-slate-400' : 'border-slate-200/60 text-slate-400'
                    }`}>
                      <span>NIF: {worker.nif}</span>
                      <span>{worker.phone}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Relação de Horas do Trabalhador Selecionado (8 colunas) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedWorker ? (
            <div className="space-y-6">
              
              {/* Cartão de Identificação do Trabalhador & Navegação de Mês */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-6">
                
                {/* Topo do Cartão: Info do Trabalhador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center font-black text-lg uppercase shrink-0 shadow-inner">
                      {selectedWorker.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          {selectedWorker.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                          {selectedWorker.role}
                        </span>
                        {selectedWorker.active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-bold">
                        <span><strong>NIF:</strong> {selectedWorker.nif}</span>
                        <span><strong>Contacto:</strong> {selectedWorker.phone || 'N/A'}</span>
                        {selectedWorker.address && (
                          <span className="truncate max-w-xs"><strong>Morada:</strong> {selectedWorker.address}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações do Colaborador */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditWorkerModal(selectedWorker)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                      title="Editar Informações"
                    >
                      <Edit2 size={14} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => handleOpenNewLogModal(selectedWorker.id)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Registar Dia</span>
                    </button>
                  </div>
                </div>

                {/* Seletor de Mês & KPIs do Trabalhador */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-amber-500" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Período:
                      </span>
                      <span className="text-sm font-black text-slate-900 capitalize">
                        {currentMonthYearLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 bg-white hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-all"
                        title="Mês Anterior"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleCurrentMonth}
                        className="px-3 py-1.5 bg-white hover:bg-slate-200 rounded-xl border border-slate-200 text-xs font-black text-slate-800 transition-all"
                      >
                        Mês Atual
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 bg-white hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-700 transition-all"
                        title="Próximo Mês"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 4 Mini Estatísticas do Colaborador no Mês */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Horas</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalHours}h</p>
                    </div>
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dias Trabalhados</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalDays} dias</p>
                    </div>
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Média / Dia</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{stats.avgDailyHours}h</p>
                    </div>
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Obras Distintas</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{stats.uniqueLocations} obras</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Tabela de Relação de Horas & Ponto do Trabalhador */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Relação de Horas e Atividades ({currentWorkerLogsForMonth.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Printer size={13} />
                      <span>Imprimir / PDF</span>
                    </button>
                    <button
                      onClick={() => handleOpenNewLogModal(selectedWorker.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus size={13} />
                      <span>Adicionar Dia</span>
                    </button>
                  </div>
                </div>

                {currentWorkerLogsForMonth.length === 0 ? (
                  <div className="text-center py-16 px-6 space-y-3">
                    <Clock size={36} className="text-slate-300 mx-auto" />
                    <h4 className="text-sm font-black text-slate-700">
                      Nenhum registo de horas para {selectedWorker.name} em {currentMonthYearLabel}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                      Clique no botão abaixo para adicionar a primeira folha de ponto com horários de entrada, pausas, saída e local de obra.
                    </p>
                    <button
                      onClick={() => handleOpenNewLogModal(selectedWorker.id)}
                      className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={15} />
                      <span>Registar Dia de Trabalho</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Data / Dia</th>
                          <th className="py-3 px-3 text-center">Entrada</th>
                          <th className="py-3 px-3 text-center">Pausa Café</th>
                          <th className="py-3 px-3 text-center">Pausa Almoço</th>
                          <th className="py-3 px-3 text-center">Saída</th>
                          <th className="py-3 px-3 text-center">Total Líquido</th>
                          <th className="py-3 px-4">Local da Obra / Serviço</th>
                          <th className="py-3 px-4">Detalhes do Dia</th>
                          <th className="py-3 px-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentWorkerLogsForMonth.map((log) => {
                          const logDateObj = new Date(log.date);
                          const formattedDate = logDateObj.toLocaleDateString(locale.startsWith('pt') ? 'pt-PT' : 'en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            weekday: 'short'
                          });

                          return (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Data */}
                              <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                                {formattedDate}
                              </td>

                              {/* Entrada */}
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100">
                                  {log.startTime || '--:--'}
                                </span>
                              </td>

                              {/* Pausa Café */}
                              <td className="py-3.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                                  <Coffee size={11} className="text-amber-600" />
                                  <span>{log.coffeeBreak || '15 min'}</span>
                                </div>
                              </td>

                              {/* Pausa Almoço */}
                              <td className="py-3.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                                  <Utensils size={11} className="text-blue-600" />
                                  <span>{log.lunchBreak || '1h00'}</span>
                                </div>
                              </td>

                              {/* Saída */}
                              <td className="py-3.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100">
                                  {log.endTime || '--:--'}
                                </span>
                              </td>

                              {/* Total Horas */}
                              <td className="py-3.5 px-3 text-center font-black text-slate-900 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {log.totalHours}h
                                </span>
                              </td>

                              {/* Local da Obra */}
                              <td className="py-3.5 px-4 font-bold text-slate-800">
                                <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={log.workLocation}>
                                  <MapPin size={13} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{log.workLocation || 'Obra Geral'}</span>
                                </div>
                              </td>

                              {/* Detalhes do Dia */}
                              <td className="py-3.5 px-4 font-medium text-slate-600 max-w-[250px]">
                                <p className="line-clamp-2 text-[11px]" title={log.details}>
                                  {log.details || <span className="text-slate-300 italic">Sem detalhes adicionais</span>}
                                </p>
                              </td>

                              {/* Ações */}
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEditLogModal(log)}
                                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    title="Editar registo"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Eliminar registo"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Nenhum trabalhador cadastrado ainda */
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Nenhum colaborador selecionado
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
                Cadastre os seus trabalhadores para acompanhar as horas de entrada, pausas de café e almoço, locais de serviço e tarefas diárias.
              </p>
              <button
                onClick={handleOpenNewWorkerModal}
                className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                + Adicionar Primeiro Colaborador
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NOVO / EDITAR COLABORADOR                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isWorkerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {editingWorker ? 'Editar Colaborador' : 'Novo Colaborador'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      Preencha os dados do trabalhador da sua empresa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Colaborador */}
              <form onSubmit={handleSaveWorkerSubmit} className="space-y-4 overflow-y-auto pt-4 pr-1">
                {/* Nome Completo */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                  />
                </div>

                {/* NIF e Função (Grid 2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      NIF / Documento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 254896321"
                      value={workerNif}
                      onChange={(e) => setWorkerNif(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Função / Cargo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pedreiro, Pintor, Eletricista"
                      value={workerRole}
                      onChange={(e) => setWorkerRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Contacto Telefónico e Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Contacto Telefónico *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: +351 912 345 678"
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      E-mail (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: joao@email.com"
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Endereço / Morada */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Endereço / Morada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Flores nº 14, Lisboa"
                    value={workerAddress}
                    onChange={(e) => setWorkerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                  />
                </div>

                {/* Valor Hora e Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Valor/Hora (€) (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ex: 12.50"
                      value={workerHourlyRate}
                      onChange={(e) => setWorkerHourlyRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Estado
                    </label>
                    <select
                      value={workerActive ? 'true' : 'false'}
                      onChange={(e) => setWorkerActive(e.target.value === 'true')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all cursor-pointer"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Botões do Modal */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWorkerModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>{editingWorker ? 'Guardar Alterações' : 'Criar Colaborador'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTAR / EDITAR DIA DE TRABALHO & PONTO                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {editingLog ? 'Editar Registo de Ponto' : 'Registar Dia de Trabalho'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      Preencha os horários, pausas, obra e tarefas do dia
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Registo de Ponto */}
              <form onSubmit={handleSaveLogSubmit} className="space-y-4 overflow-y-auto pt-4 pr-1">
                {/* Seleção do Trabalhador e Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Colaborador *
                    </label>
                    <select
                      value={logWorkerId}
                      onChange={(e) => setLogWorkerId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all cursor-pointer"
                    >
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Data do Dia *
                    </label>
                    <input
                      type="date"
                      required
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Horários: Entrada, Pausa Café, Pausa Almoço, Saída (Grid 4 cols) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Horários & Pausas do Dia
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Entrada */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Entrada *
                      </label>
                      <input
                        type="time"
                        required
                        value={logStartTime}
                        onChange={(e) => setLogStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs focus:border-slate-900 transition-all"
                      />
                    </div>

                    {/* Pausa Café */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Pausa Café
                      </label>
                      <input
                        type="text"
                        placeholder="15 min"
                        value={logCoffeeBreak}
                        onChange={(e) => setLogCoffeeBreak(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs focus:border-slate-900 transition-all"
                      />
                    </div>

                    {/* Pausa Almoço */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Pausa Almoço
                      </label>
                      <input
                        type="text"
                        placeholder="12:00 - 13:00 (1h)"
                        value={logLunchBreak}
                        onChange={(e) => setLogLunchBreak(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs focus:border-slate-900 transition-all"
                      />
                    </div>

                    {/* Saída */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Saída *
                      </label>
                      <input
                        type="time"
                        required
                        value={logEndTime}
                        onChange={(e) => setLogEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs focus:border-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Resumo do Cálculo em Tempo Real */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Total Líquido Estimado:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                      {calculateTotalHours(logStartTime, logEndTime, logLunchBreak, logCoffeeBreak)} Horas
                    </span>
                  </div>
                </div>

                {/* Local da Obra / Serviço */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Local da Obra / Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moradia Cascais, Edifício Panorama, etc."
                    value={logWorkLocation}
                    onChange={(e) => setLogWorkLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all"
                  />
                </div>

                {/* Detalhes do Dia / Ocorrências */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Detalhes do Dia / Tarefas Executadas
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Assentamento de cerâmica, reboco de paredes, verificação de tubagens..."
                    value={logDetails}
                    onChange={(e) => setLogDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all resize-none"
                  />
                </div>

                {/* Botões do Modal */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>{editingLog ? 'Guardar Registo' : 'Salvar Registo'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
