import { Locale } from '../translations';

export interface LandingTranslation {
  nav: {
    features: string;
    howItWorks: string;
    whoIsItFor: string;
    pdfEstimates: string;
    testimonials: string;
    login: string;
    startFree: string;
  };
  hero: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badgeFree: string;
    badgeFreeSub: string;
    badgeFast: string;
    badgeFastSub: string;
    badgeAnywhere: string;
    badgeAnywhereSub: string;
  };
  preview: {
    estimateTitle: string;
    statusPending: string;
    clientLabel: string;
    projectLabel: string;
    totalGeneral: string;
    materialsTitle: string;
    materialsCount: string;
    material1: string;
    material2: string;
    material3: string;
    laborTitle: string;
    laborCount: string;
    labor1: string;
    labor2: string;
    labor3: string;
    taxIncluded: string;
    generatePdf: string;
    pdfCardTitle: string;
    pdfCardReady: string;
    pdfCardSub: string;
    downloadPdf: string;
  };
  whoFor: {
    title: string;
    subtitle: string;
    professions: {
      contractors: string;
      masons: string;
      painters: string;
      electricians: string;
      plumbers: string;
      remodelers: string;
      more: string;
    };
    highlightBox: string;
  };
  comparison: {
    beforeBadge: string;
    beforeTitle: string;
    beforeItems: string[];
    beforeFooter: string;
    afterBadge: string;
    afterTitle: string;
    afterItems: string[];
    afterFooter: string;
    tryFree: string;
  };
  workflow: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  videoSection: {
    eyebrow: string;
    title: string;
    desc: string;
    overlayTitle: string;
    overlaySub: string;
    ctaBtn: string;
  };
  pdfSection: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    desc: string;
    bullets: { title: string; desc: string }[];
    ctaBtn: string;
    docHeader: string;
    docTaxId: string;
    docProposalNo: string;
    docClientTitle: string;
    docClientName: string;
    docClientAddress: string;
    docDateTitle: string;
    docValidity: string;
    docColDesc: string;
    docColQty: string;
    docColTotal: string;
    docItem1Title: string;
    docItem1Sub: string;
    docItem1Unit: string;
    docItem2Title: string;
    docItem2Sub: string;
    docItem2Unit: string;
    docItem3Title: string;
    docItem3Sub: string;
    docItem3Unit: string;
    docSubtotal: string;
    docTax: string;
    docTotal: string;
    docSignature: string;
    docCertified: string;
    cards: { title: string; desc: string }[];
  };
  testimonialsSection: {
    title: string;
    items: { text: string; author: string; role: string }[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    btn: string;
    badge: string;
  };
  footer: {
    desc: string;
    product: string;
    company: string;
    support: string;
    features: string;
    howItWorks: string;
    pdfEstimates: string;
    createFreeAccount: string;
    privacy: string;
    terms: string;
    help: string;
    demo: string;
    installApp: string;
    rights: string;
    createdBy: string;
  };
  demoModal: {
    title: string;
    subtitle: string;
    step1Tab: string;
    step2Tab: string;
    step3Tab: string;
    step4Tab: string;
    step1Badge: string;
    step1Client: string;
    step1Location: string;
    step1Desc: string;
    step1Footer: string;
    step2Badge: string;
    step2Item1: string;
    step2Item2: string;
    step2Item3: string;
    step2Footer: string;
    step3Badge: string;
    step3Item1: string;
    step3Item2: string;
    step3Total: string;
    step4Badge: string;
    step4File: string;
    step4Sub: string;
    step4Footer: string;
    prev: string;
    cta: string;
  };
}

export const landingTranslations: Record<Locale, LandingTranslation> = {
  'pt-PT': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      whoIsItFor: 'Para Quem É',
      pdfEstimates: 'Orçamentos PDF',
      testimonials: 'Depoimentos',
      login: 'Entrar',
      startFree: 'Começar Grátis'
    },
    hero: {
      badge: 'PARA PROFISSIONAIS DA CONSTRUÇÃO',
      titlePrefix: 'Faça orçamentos profissionais e tenha o ',
      titleHighlight: 'controlo da sua obra.',
      subtitle: 'Crie orçamentos, envie propostas em PDF, acompanhe serviços, pagamentos e resultados — tudo num só lugar.',
      ctaPrimary: 'CRIAR O MEU PRIMEIRO ORÇAMENTO GRÁTIS',
      ctaSecondary: 'VER COMO FUNCIONA',
      badgeFree: 'Comece grátis',
      badgeFreeSub: 'Sem cartão de crédito',
      badgeFast: 'Rápido e fácil',
      badgeFastSub: 'Orçamentos em minutos',
      badgeAnywhere: 'Qualquer lugar',
      badgeAnywhereSub: 'Web, Tablet e App'
    },
    preview: {
      estimateTitle: 'Orçamento #042',
      statusPending: 'Pendente',
      clientLabel: 'Cliente: João Silva',
      projectLabel: 'Obra: Remodelação de Cozinha',
      totalGeneral: 'Total Geral',
      materialsTitle: '1. Materiais',
      materialsCount: '3 itens',
      material1: 'Azulejo Cerâmico 60x60 (45 m²)',
      material2: 'Cimento Cola Flexível (10 un)',
      material3: 'Betume Hidrófugo (5 un)',
      laborTitle: '2. Mão de Obra',
      laborCount: '3 serviços',
      labor1: 'Pedreiro Especializado (40 h)',
      labor2: 'Canalizador (12 h)',
      labor3: 'Eletricista (10 h)',
      taxIncluded: 'IVA + BDI incluídos',
      generatePdf: 'Gerar PDF',
      pdfCardTitle: 'PROPOSTA PDF',
      pdfCardReady: 'Pronto',
      pdfCardSub: 'Com logótipo, prazos e condições',
      downloadPdf: 'Baixar PDF'
    },
    whoFor: {
      title: 'Feito para quem vive de obras.',
      subtitle: 'Soluções simples para o dia a dia de quem constrói, reforma e transforma.',
      professions: {
        contractors: 'Empreiteiros',
        masons: 'Pedreiros',
        painters: 'Pintores',
        electricians: 'Eletricistas',
        plumbers: 'Canalizadores',
        remodelers: 'Remodeladores',
        more: 'E muito mais'
      },
      highlightBox: 'Se trabalha com obras e precisa de criar orçamentos, acompanhar serviços e controlar pagamentos, o AtriosBuild foi feito para si.'
    },
    comparison: {
      beforeBadge: '❌ ANTES',
      beforeTitle: 'Ainda gere as suas obras assim?',
      beforeItems: [
        'Orçamentos no papel ou Excel',
        'Valores espalhados no WhatsApp',
        'Dificuldade em controlar pagamentos',
        'Informações perdidas e desorganizadas',
        'Perda de tempo e dinheiro'
      ],
      beforeFooter: 'Estresse diário e falta de profissionalismo',
      afterBadge: '✅ COM O ÁTRIOSBUILD',
      afterTitle: 'Com o ÁtriosBuild é diferente.',
      afterItems: [
        'Orçamentos profissionais em minutos',
        'Propostas em PDF com a sua marca',
        'Obras, serviços e tarefas organizadas',
        'Pagamentos e recebimentos controlados',
        'Tudo num só lugar, sempre à mão'
      ],
      afterFooter: 'Mais lucro e credibilidade',
      tryFree: 'Experimentar Grátis'
    },
    workflow: {
      title: 'Do orçamento ao pagamento, tudo num só lugar.',
      subtitle: 'Um fluxo simples para gerir a sua obra de forma profissional.',
      step1Title: 'ORÇAMENTO',
      step1Desc: 'Adicione materiais, mão de obra e custos em poucos minutos.',
      step2Title: 'PROPOSTA',
      step2Desc: 'Gere um PDF profissional com a sua marca e envie ao cliente.',
      step3Title: 'OBRA',
      step3Desc: 'Acompanhe serviços, tarefas, prazos e todos os detalhes da obra.',
      step4Title: 'PAGAMENTO',
      step4Desc: 'Registe recebimentos, pendências e tenha o controlo financeiro.'
    },
    videoSection: {
      eyebrow: 'VEJA EM AÇÃO',
      title: 'Veja como funciona em 60 segundos',
      desc: 'Crie um orçamento completo, gere o PDF e envie ao cliente. Simples, rápido e profissional.',
      overlayTitle: 'Assistir Demonstração (60 segundos)',
      overlaySub: 'Sem enrolação • Veja como funciona na prática',
      ctaBtn: 'VER DEMONSTRAÇÃO'
    },
    pdfSection: {
      eyebrow: 'IMAGEM PROFISSIONAL',
      titlePrefix: 'Apresente-se como um ',
      titleHighlight: 'profissional.',
      desc: 'Crie orçamentos em PDF com a sua marca, condições, valores detalhados e validade. Mais credibilidade para fechar mais obras.',
      bullets: [
        { title: 'PDF com o seu logótipo e dados', desc: 'Destaque a sua identidade visual em cada proposta.' },
        { title: 'Materiais e mão de obra detalhados', desc: 'Transparência que evita discussões e aumenta a aprovação.' },
        { title: 'Condições de pagamento e validade', desc: 'Defina prazos claros de início e entrega da obra.' },
        { title: 'Envio fácil para o WhatsApp e E-mail', desc: 'O seu cliente recebe um documento limpo e seguro.' }
      ],
      ctaBtn: 'CRIAR MEU PRIMEIRO PDF GRÁTIS',
      docHeader: 'ÁTRIOS CONSTRUÇÕES',
      docTaxId: 'NIF: 509 876 543 • Lisboa',
      docProposalNo: 'PROPOSTA Nº',
      docClientTitle: 'Cliente',
      docClientName: 'Manuel Antunes',
      docClientAddress: 'Rua das Flores, 42 - Porto',
      docDateTitle: 'Data / Validade',
      docValidity: 'Válido por 30 dias',
      docColDesc: 'Descrição do Serviço',
      docColQty: 'Qtd / Preço',
      docColTotal: 'Total',
      docItem1Title: 'Remodelação Geral WC',
      docItem1Sub: 'Demolição, canalização e louças',
      docItem1Unit: '1 un',
      docItem2Title: 'Pintura Interior Anti-humidade',
      docItem2Sub: '2 demãos com primário',
      docItem2Unit: '120 m²',
      docItem3Title: 'Instalação Elétrica LED',
      docItem3Sub: 'Quadro parcial e 8 pontos',
      docItem3Unit: '8 pts',
      docSubtotal: 'Subtotal',
      docTax: 'IVA (23%)',
      docTotal: 'VALOR TOTAL',
      docSignature: 'Assinatura do Responsável: ____________',
      docCertified: 'Documento Certificado',
      cards: [
        { title: 'Ordens de Serviço', desc: 'Crie e acompanhe ordens de serviço para cada etapa da obra.' },
        { title: 'Relatórios Financeiros', desc: 'Saiba o que recebeu, o que falta e o lucro real de cada obra.' },
        { title: 'Controlo de Pagamentos', desc: 'Registe pagamentos, recibos e mantenha tudo organizado.' },
        { title: 'Acesso em Qualquer Lugar', desc: 'Use no computador, tablet ou telemóvel. Os seus dados sempre consigo.' }
      ]
    },
    testimonialsSection: {
      title: 'O que os profissionais estão a dizer',
      items: [
        {
          text: '“O ÁtriosBuild mudou a forma como eu faço orçamentos. Ganho tempo e passo mais confiança ao cliente.”',
          author: 'Carlos Mendes',
          role: 'Pedreiro & Ladrilhador'
        },
        {
          text: '“Finalmente tenho controlo das obras e dos pagamentos. Tudo num só lugar!”',
          author: 'João Rodrigues',
          role: 'Empreiteiro Geral'
        },
        {
          text: '“O PDF profissional faz toda a diferença na hora de fechar o serviço.”',
          author: 'Bruno Silva',
          role: 'Especialista em Remodelações'
        }
      ]
    },
    finalCta: {
      title: 'A próxima obra pode começar mais organizada.',
      subtitle: 'Comece agora gratuitamente e veja a diferença no seu dia a dia.',
      btn: 'COMEÇAR GRATUITAMENTE',
      badge: 'Sem cartão de crédito • Sem compromisso'
    },
    footer: {
      desc: 'A plataforma completa para gestão de orçamentos, ordens de serviço e controlo financeiro de obras.',
      product: 'Produto',
      company: 'Empresa',
      support: 'Suporte',
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      pdfEstimates: 'Orçamentos PDF',
      createFreeAccount: 'Criar Conta Grátis',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      help: 'Ajuda e Dúvidas',
      demo: 'Ver Demonstração',
      installApp: 'Instalar App Mobile',
      rights: 'Todos os direitos reservados.',
      createdBy: 'Criado por'
    },
    demoModal: {
      title: 'Demonstração ÁtriosBuild',
      subtitle: 'Como criar um orçamento em 4 passos simples',
      step1Tab: 'Cliente',
      step2Tab: 'Materiais',
      step3Tab: 'Mão de Obra',
      step4Tab: 'PDF Pronto',
      step1Badge: 'Passo 1: Identificação do Cliente e da Obra',
      step1Client: 'Nome do Cliente:',
      step1Location: 'Local da Obra:',
      step1Desc: 'Descrição:',
      step1Footer: 'Basta preencher os dados ou selecionar um cliente já cadastrado.',
      step2Badge: 'Passo 2: Inserção de Materiais e Custos',
      step2Item1: 'Azulejos Porcelanatos (35 m²)',
      step2Item2: 'Argamassa Cola + Betume',
      step2Item3: 'Tubagens e Acessórios PVC',
      step2Footer: 'Os totais e custos são somados instantaneamente com suporte a margens de lucro.',
      step3Badge: 'Passo 3: Mão de Obra e Prazos',
      step3Item1: 'Pedreiro & Ladrilhador (30 h)',
      step3Item2: 'Canalizador Credenciado (10 h)',
      step3Total: 'Total Geral com IVA:',
      step4Badge: 'Passo 4: PDF Pronto com 1 Clique',
      step4File: 'Proposta_Joao_Silva.pdf',
      step4Sub: 'Com o seu logótipo e dados prontos',
      step4Footer: 'Basta clicar em "Baixar PDF" ou enviar direto para o WhatsApp do cliente!',
      prev: '← Anterior',
      cta: 'Criar o Meu Primeiro Orçamento Grátis →'
    }
  },

  'pt-BR': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      whoIsItFor: 'Para Quem É',
      pdfEstimates: 'Orçamentos PDF',
      testimonials: 'Depoimentos',
      login: 'Entrar',
      startFree: 'Começar Grátis'
    },
    hero: {
      badge: 'PARA PROFISSIONAIS DA CONSTRUÇÃO CIVIL',
      titlePrefix: 'Faça orçamentos profissionais e tenha o ',
      titleHighlight: 'controle da sua obra.',
      subtitle: 'Crie orçamentos, envie propostas em PDF, acompanhe serviços, pagamentos e resultados — tudo em um só lugar.',
      ctaPrimary: 'CRIAR MEU PRIMEIRO ORÇAMENTO GRÁTIS',
      ctaSecondary: 'VER COMO FUNCIONA',
      badgeFree: 'Comece grátis',
      badgeFreeSub: 'Sem cartão de crédito',
      badgeFast: 'Rápido e fácil',
      badgeFastSub: 'Orçamentos em minutos',
      badgeAnywhere: 'Em qualquer lugar',
      badgeAnywhereSub: 'Web, Tablet e Celular'
    },
    preview: {
      estimateTitle: 'Orçamento #042',
      statusPending: 'Pendente',
      clientLabel: 'Cliente: João Silva',
      projectLabel: 'Obra: Reforma de Cozinha',
      totalGeneral: 'Total Geral',
      materialsTitle: '1. Materiais',
      materialsCount: '3 itens',
      material1: 'Porcelanato 60x60 (45 m²)',
      material2: 'Argamassa ACIII (10 sacos)',
      material3: 'Rejunte Impermeável (5 un)',
      laborTitle: '2. Mão de Obra',
      laborCount: '3 serviços',
      labor1: 'Pedreiro Especializado (40 h)',
      labor2: 'Encanador / Bombeiro (12 h)',
      labor3: 'Eletricista (10 h)',
      taxIncluded: 'Impostos e taxas inclusos',
      generatePdf: 'Gerar PDF',
      pdfCardTitle: 'PROPOSTA PDF',
      pdfCardReady: 'Pronto',
      pdfCardSub: 'Com logotipo, prazos e condições',
      downloadPdf: 'Baixar PDF'
    },
    whoFor: {
      title: 'Feito para quem vive de obras.',
      subtitle: 'Soluções simples para o dia a dia de quem constrói, reforma e transforma.',
      professions: {
        contractors: 'Empreiteiros',
        masons: 'Pedreiros',
        painters: 'Pintores',
        electricians: 'Eletricistas',
        plumbers: 'Encanadores',
        remodelers: 'Reformadores',
        more: 'E muito mais'
      },
      highlightBox: 'Se você faz obras e precisa criar orçamentos, acompanhar serviços e controlar pagamentos, o AtriosBuild foi feito para você.'
    },
    comparison: {
      beforeBadge: '❌ ANTES',
      beforeTitle: 'Ainda gerencia suas obras assim?',
      beforeItems: [
        'Orçamentos no papel ou Excel',
        'Valores espalhados no WhatsApp',
        'Dificuldade em controlar pagamentos',
        'Informações perdidas e desorganizadas',
        'Perda de tempo e dinheiro'
      ],
      beforeFooter: 'Estresse diário e falta de profissionalismo',
      afterBadge: '✅ COM O ÁTRIOSBUILD',
      afterTitle: 'Com o ÁtriosBuild é diferente.',
      afterItems: [
        'Orçamentos profissionais em minutos',
        'Propostas em PDF com a sua marca',
        'Obras, serviços e tarefas organizadas',
        'Pagamentos e recebimentos controlados',
        'Tudo num só lugar, sempre à mão'
      ],
      afterFooter: 'Mais lucro e credibilidade',
      tryFree: 'Experimentar Grátis'
    },
    workflow: {
      title: 'Do orçamento ao pagamento, tudo em um só lugar.',
      subtitle: 'Um fluxo simples para gerenciar sua obra de forma profissional.',
      step1Title: 'ORÇAMENTO',
      step1Desc: 'Adicione materiais, mão de obra e custos em poucos minutos.',
      step2Title: 'PROPOSTA',
      step2Desc: 'Gere um PDF profissional com a sua marca e envie ao cliente.',
      step3Title: 'OBRA',
      step3Desc: 'Acompanhe serviços, tarefas, prazos e todos os detalhes da obra.',
      step4Title: 'PAGAMENTO',
      step4Desc: 'Registre recebimentos, pendências e tenha o controle financeiro.'
    },
    videoSection: {
      eyebrow: 'VEJA EM AÇÃO',
      title: 'Veja como funciona em 60 segundos',
      desc: 'Crie um orçamento completo, gere o PDF e envie ao cliente. Simples, rápido e profissional.',
      overlayTitle: 'Assistir Demonstração (60 segundos)',
      overlaySub: 'Sem enrolação • Veja como funciona na prática',
      ctaBtn: 'VER DEMONSTRAÇÃO'
    },
    pdfSection: {
      eyebrow: 'IMAGEM PROFISSIONAL',
      titlePrefix: 'Apresente-se como um ',
      titleHighlight: 'profissional de verdade.',
      desc: 'Crie orçamentos em PDF com a sua marca, condições, valores detalhados e validade. Mais credibilidade para fechar mais contratos.',
      bullets: [
        { title: 'PDF com seu logotipo e dados', desc: 'Destaque sua identidade visual em cada proposta.' },
        { title: 'Materiais e mão de obra detalhados', desc: 'Transparência total que evita discussões e aumenta o fechamento.' },
        { title: 'Condições de pagamento e validade', desc: 'Defina prazos claros de início e entrega da obra.' },
        { title: 'Envio fácil para WhatsApp e E-mail', desc: 'Seu cliente recebe um documento limpo, elegante e seguro.' }
      ],
      ctaBtn: 'CRIAR MEU PRIMEIRO PDF GRÁTIS',
      docHeader: 'ÁTRIOS CONSTRUÇÕES',
      docTaxId: 'CNPJ: 12.345.678/0001-90 • São Paulo',
      docProposalNo: 'PROPOSTA Nº',
      docClientTitle: 'Cliente',
      docClientName: 'Manuel Antunes',
      docClientAddress: 'Av. Paulista, 1000 - SP',
      docDateTitle: 'Data / Validade',
      docValidity: 'Válido por 30 dias',
      docColDesc: 'Descrição do Serviço',
      docColQty: 'Qtd / Preço',
      docColTotal: 'Total',
      docItem1Title: 'Reforma Completa de Banheiro',
      docItem1Sub: 'Demolição, tubulação e louças',
      docItem1Unit: '1 un',
      docItem2Title: 'Pintura Interna Anti-mofo',
      docItem2Sub: '2 demãos com fundo preparador',
      docItem2Unit: '120 m²',
      docItem3Title: 'Instalação Elétrica LED',
      docItem3Sub: 'Quadro de disjuntores e 8 pontos',
      docItem3Unit: '8 pts',
      docSubtotal: 'Subtotal',
      docTax: 'Impostos',
      docTotal: 'VALOR TOTAL',
      docSignature: 'Assinatura do Responsável: ____________',
      docCertified: 'Documento Certificado',
      cards: [
        { title: 'Ordens de Serviço', desc: 'Crie e acompanhe ordens de serviço para cada etapa da obra.' },
        { title: 'Relatórios Financeiros', desc: 'Saiba o que recebeu, o que falta e o lucro real de cada obra.' },
        { title: 'Controle de Pagamentos', desc: 'Registre pagamentos, recibos e mantenha tudo organizado.' },
        { title: 'Acesso em Qualquer Lugar', desc: 'Use no computador, tablet ou celular. Seus dados sempre com você.' }
      ]
    },
    testimonialsSection: {
      title: 'O que os profissionais estão dizendo',
      items: [
        {
          text: '“O ÁtriosBuild mudou a forma como faço orçamentos. Economizo horas e passo muito mais confiança para o cliente.”',
          author: 'Carlos Mendes',
          role: 'Pedreiro & Azulejista'
        },
        {
          text: '“Finalmente tenho controle das obras e de todos os pagamentos. Tudo em um só aplicativo!”',
          author: 'João Rodrigues',
          role: 'Empreiteiro Geral'
        },
        {
          text: '“O PDF profissional faz toda a diferença na hora de fechar o contrato com o cliente.”',
          author: 'Bruno Silva',
          role: 'Especialista em Reformas'
        }
      ]
    },
    finalCta: {
      title: 'Sua próxima obra pode começar muito mais organizada.',
      subtitle: 'Comece agora gratuitamente e veja a diferença no seu dia a dia.',
      btn: 'COMEÇAR GRATUITAMENTE',
      badge: 'Sem cartão de crédito • Sem compromisso'
    },
    footer: {
      desc: 'A plataforma completa para gestão de orçamentos, ordens de serviço e controle financeiro de obras.',
      product: 'Produto',
      company: 'Empresa',
      support: 'Suporte',
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      pdfEstimates: 'Orçamentos PDF',
      createFreeAccount: 'Criar Conta Grátis',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      help: 'Ajuda e Dúvidas',
      demo: 'Ver Demonstração',
      installApp: 'Instalar App Celular',
      rights: 'Todos os direitos reservados.',
      createdBy: 'Criado por'
    },
    demoModal: {
      title: 'Demonstração ÁtriosBuild',
      subtitle: 'Como criar um orçamento em 4 passos simples',
      step1Tab: 'Cliente',
      step2Tab: 'Materiais',
      step3Tab: 'Mão de Obra',
      step4Tab: 'PDF Pronto',
      step1Badge: 'Passo 1: Identificação do Cliente e da Obra',
      step1Client: 'Nome do Cliente:',
      step1Location: 'Local da Obra:',
      step1Desc: 'Descrição:',
      step1Footer: 'Basta preencher os dados ou selecionar um cliente já cadastrado.',
      step2Badge: 'Passo 2: Inserção de Materiais e Custos',
      step2Item1: 'Porcelanato Polido (35 m²)',
      step2Item2: 'Argamassa ACIII + Rejunte',
      step2Item3: 'Tubulações e Conexões PVC',
      step2Footer: 'Os totais e custos são somados instantaneamente com suporte a margens de lucro.',
      step3Badge: 'Passo 3: Mão de Obra e Prazos',
      step3Item1: 'Pedreiro & Azulejista (30 h)',
      step3Item2: 'Encanador Credenciado (10 h)',
      step3Total: 'Total Geral Estimado:',
      step4Badge: 'Passo 4: PDF Pronto com 1 Clique',
      step4File: 'Proposta_Joao_Silva.pdf',
      step4Sub: 'Com seu logotipo e dados prontos',
      step4Footer: 'Basta clicar em "Baixar PDF" ou enviar direto para o WhatsApp do cliente!',
      prev: '← Anterior',
      cta: 'Criar Meu Primeiro Orçamento Grátis →'
    }
  },

  'en-US': {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      whoIsItFor: 'Who Is It For',
      pdfEstimates: 'PDF Quotes',
      testimonials: 'Testimonials',
      login: 'Log In',
      startFree: 'Start Free'
    },
    hero: {
      badge: 'FOR CONSTRUCTION & TRADES PROFESSIONALS',
      titlePrefix: 'Create professional estimates and take ',
      titleHighlight: 'full control of your projects.',
      subtitle: 'Build accurate estimates, send branded PDF proposals, track jobs, payments and profits — all in one centralized app.',
      ctaPrimary: 'CREATE MY FIRST FREE ESTIMATE',
      ctaSecondary: 'SEE HOW IT WORKS',
      badgeFree: 'Start Free',
      badgeFreeSub: 'No credit card needed',
      badgeFast: 'Fast & Easy',
      badgeFastSub: 'Quotes in minutes',
      badgeAnywhere: 'Everywhere',
      badgeAnywhereSub: 'Web, Tablet & Mobile'
    },
    preview: {
      estimateTitle: 'Estimate #042',
      statusPending: 'Pending',
      clientLabel: 'Client: John Doe',
      projectLabel: 'Project: Kitchen Renovation',
      totalGeneral: 'Grand Total',
      materialsTitle: '1. Materials',
      materialsCount: '3 items',
      material1: 'Ceramic Tile 60x60 (45 sq.m)',
      material2: 'Flexible Tile Adhesive (10 bags)',
      material3: 'Waterproof Grout (5 units)',
      laborTitle: '2. Labor & Trades',
      laborCount: '3 services',
      labor1: 'Master Mason (40 hrs)',
      labor2: 'Licensed Plumber (12 hrs)',
      labor3: 'Electrician (10 hrs)',
      taxIncluded: 'Taxes & overhead included',
      generatePdf: 'Generate PDF',
      pdfCardTitle: 'PDF PROPOSAL',
      pdfCardReady: 'Ready',
      pdfCardSub: 'With logo, deadlines & terms',
      downloadPdf: 'Download PDF'
    },
    whoFor: {
      title: 'Built for those who work in construction.',
      subtitle: 'Simple, powerful tools for builders, remodelers and trades specialists.',
      professions: {
        contractors: 'General Contractors',
        masons: 'Masons & Bricklayers',
        painters: 'Painters & Decorators',
        electricians: 'Electricians',
        plumbers: 'Plumbers',
        remodelers: 'Remodelers',
        more: 'And much more'
      },
      highlightBox: 'If you work in construction and need to quote jobs, track tasks and manage payments, ÁtriosBuild was built for you.'
    },
    comparison: {
      beforeBadge: '❌ BEFORE',
      beforeTitle: 'Still running your jobs like this?',
      beforeItems: [
        'Quotes written on paper or messy spreadsheets',
        'Prices and messages scattered in WhatsApp chats',
        'Struggling to track pending client payments',
        'Lost measurements and disorganized files',
        'Wasting hours and money every single month'
      ],
      beforeFooter: 'Daily stress and unprofessional presentation',
      afterBadge: '✅ WITH ÁTRIOSBUILD',
      afterTitle: 'With ÁtriosBuild everything is clear.',
      afterItems: [
        'Professional estimates generated in minutes',
        'Branded PDF proposals with your company logo',
        'Centralized jobs, tasks and material lists',
        '100% tracked client payments and expenses',
        'Everything in one place, right on your phone'
      ],
      afterFooter: 'More profit and credibility',
      tryFree: 'Try For Free'
    },
    workflow: {
      title: 'From estimate to final payment, all in one place.',
      subtitle: 'A simple, seamless workflow to manage your construction professionally.',
      step1Title: 'ESTIMATE',
      step1Desc: 'Add materials, labor rates and markups in just a few minutes.',
      step2Title: 'PROPOSAL',
      step2Desc: 'Generate a branded PDF estimate and send it directly to your client.',
      step3Title: 'JOB TRACKING',
      step3Desc: 'Track milestones, worker tasks, schedules and project progress.',
      step4Title: 'PAYMENT',
      step4Desc: 'Record installments, track overdue balances and protect profit.'
    },
    videoSection: {
      eyebrow: 'SEE IN ACTION',
      title: 'See how it works in 60 seconds',
      desc: 'Build a full estimate, export a clean PDF, and send it to your client. Fast, effortless, and professional.',
      overlayTitle: 'Watch Interactive Demo (60 seconds)',
      overlaySub: 'No fluff • See real workflow in action',
      ctaBtn: 'WATCH DEMO'
    },
    pdfSection: {
      eyebrow: 'PROFESSIONAL IMAGE',
      titlePrefix: 'Present yourself as a ',
      titleHighlight: 'true professional.',
      desc: 'Create clean PDF estimates with your company logo, payment milestones, detailed line items and validity dates. Gain instant credibility to win more bids.',
      bullets: [
        { title: 'PDF with your logo & company info', desc: 'Make your brand shine on every customer proposal.' },
        { title: 'Itemized materials & labor breakdowns', desc: 'Complete transparency that eliminates disputes and accelerates approvals.' },
        { title: 'Clear payment schedules & validity', desc: 'Define upfront deposit terms, completion dates and project scope.' },
        { title: 'Instant share via WhatsApp & Email', desc: 'Your client receives a polished, tamper-proof document in seconds.' }
      ],
      ctaBtn: 'CREATE MY FIRST FREE PDF',
      docHeader: 'ÁTRIOS CONSTRUCTION',
      docTaxId: 'Tax ID: 509-876-543 • London, UK',
      docProposalNo: 'PROPOSAL #',
      docClientTitle: 'Client',
      docClientName: 'Manuel Antunes',
      docClientAddress: '42 Flower St, Suite 2B',
      docDateTitle: 'Date / Validity',
      docValidity: 'Valid for 30 days',
      docColDesc: 'Service Description',
      docColQty: 'Qty / Price',
      docColTotal: 'Total',
      docItem1Title: 'Complete Bathroom Renovation',
      docItem1Sub: 'Demolition, plumbing and fixture fitting',
      docItem1Unit: '1 unit',
      docItem2Title: 'Anti-humidity Interior Painting',
      docItem2Sub: '2 coats with protective primer',
      docItem2Unit: '120 sq.m',
      docItem3Title: 'LED Electrical Installation',
      docItem3Sub: 'Sub-panel and 8 recessed spot lights',
      docItem3Unit: '8 pts',
      docSubtotal: 'Subtotal',
      docTax: 'VAT / Tax (20%)',
      docTotal: 'TOTAL AMOUNT',
      docSignature: 'Authorized Signature: ____________',
      docCertified: 'Certified Document',
      cards: [
        { title: 'Work Orders', desc: 'Create and assign clear work orders for every stage of the project.' },
        { title: 'Financial Reports', desc: 'Track income, pending client payments and real profit for each active job.' },
        { title: 'Payment Tracking', desc: 'Record down payments, receipts and keep financial records in order.' },
        { title: 'Access Anywhere', desc: 'Use on PC, tablet or mobile. Your cloud estimates are always at hand.' }
      ]
    },
    testimonialsSection: {
      title: 'What professionals are saying',
      items: [
        {
          text: '“ÁtriosBuild completely transformed how I create quotes. I save hours and clients trust my professional presentation.”',
          author: 'Carlos Mendes',
          role: 'Tile & Masonry Specialist'
        },
        {
          text: '“Finally I have complete control over all projects and client payments in one centralized dashboard!”',
          author: 'John Rodrigues',
          role: 'General Contractor'
        },
        {
          text: '“The instant professional PDF with logo makes all the difference when closing deals with clients.”',
          author: 'Bruno Silva',
          role: 'Renovation Specialist'
        }
      ]
    },
    finalCta: {
      title: 'Your next project can start much more organized.',
      subtitle: 'Start now for free and experience the difference in your daily routine.',
      btn: 'START FOR FREE',
      badge: 'No credit card required • No commitment'
    },
    footer: {
      desc: 'The complete software for construction estimates, work orders and financial project control.',
      product: 'Product',
      company: 'Company',
      support: 'Support',
      features: 'Features',
      howItWorks: 'How It Works',
      pdfEstimates: 'PDF Quotes',
      createFreeAccount: 'Create Free Account',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      help: 'Help & FAQ',
      demo: 'Watch Demo',
      installApp: 'Install Mobile App',
      rights: 'All rights reserved.',
      createdBy: 'Created by'
    },
    demoModal: {
      title: 'ÁtriosBuild Interactive Demo',
      subtitle: 'How to build a complete estimate in 4 simple steps',
      step1Tab: 'Client',
      step2Tab: 'Materials',
      step3Tab: 'Labor',
      step4Tab: 'PDF Ready',
      step1Badge: 'Step 1: Client & Job Identification',
      step1Client: 'Client Name:',
      step1Location: 'Project Location:',
      step1Desc: 'Scope Description:',
      step1Footer: 'Simply fill in the job details or select an existing client.',
      step2Badge: 'Step 2: Add Materials & Costs',
      step2Item1: 'Porcelain Tiles (35 sq.m)',
      step2Item2: 'Tile Adhesive + Waterproof Grout',
      step2Item3: 'PVC Piping & Fittings',
      step2Footer: 'Totals and margins are calculated automatically in real time.',
      step3Badge: 'Step 3: Labor Rates & Timeline',
      step3Item1: 'Master Mason (30 hrs)',
      step3Item2: 'Licensed Plumber (10 hrs)',
      step3Total: 'Estimated Total with Tax:',
      step4Badge: 'Step 4: 1-Click Branded PDF',
      step4File: 'Proposal_John_Doe.pdf',
      step4Sub: 'Complete with your custom logo and terms',
      step4Footer: 'Click "Download PDF" or share directly via WhatsApp to your client!',
      prev: '← Previous',
      cta: 'Create My First Free Estimate →'
    }
  },

  'es-ES': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Cómo Funciona',
      whoIsItFor: 'Para Quién Es',
      pdfEstimates: 'Presupuestos PDF',
      testimonials: 'Opiniones',
      login: 'Iniciar Sesión',
      startFree: 'Empezar Gratis'
    },
    hero: {
      badge: 'PARA PROFESIONALES DE LA CONSTRUCCIÓN Y REFORMAS',
      titlePrefix: 'Cree presupuestos profesionales y tenga el ',
      titleHighlight: 'control de su obra.',
      subtitle: 'Cree presupuestos, envíe propuestas en PDF, controle servicios, pagos y resultados — todo en un solo lugar.',
      ctaPrimary: 'CREAR MI PRIMER PRESUPUESTO GRATIS',
      ctaSecondary: 'VER CÓMO FUNCIONA',
      badgeFree: 'Empiece gratis',
      badgeFreeSub: 'Sin tarjeta de crédito',
      badgeFast: 'Rápido y fácil',
      badgeFastSub: 'Presupuestos en minutos',
      badgeAnywhere: 'Donde sea',
      badgeAnywhereSub: 'Web, Tablet y Móvil'
    },
    preview: {
      estimateTitle: 'Presupuesto #042',
      statusPending: 'Pendiente',
      clientLabel: 'Cliente: Juan Pérez',
      projectLabel: 'Obra: Reforma de Cocina',
      totalGeneral: 'Total General',
      materialsTitle: '1. Materiales',
      materialsCount: '3 artículos',
      material1: 'Azulejo Porcelánico 60x60 (45 m²)',
      material2: 'Cemento Cola Flexible (10 sacos)',
      material3: 'Mortero Hidrófugo (5 un)',
      laborTitle: '2. Mano de Obra',
      laborCount: '3 servicios',
      labor1: 'Albañil Especializado (40 h)',
      labor2: 'Fontanero (12 h)',
      labor3: 'Electricista (10 h)',
      taxIncluded: 'IVA y gastos generales incluidos',
      generatePdf: 'Generar PDF',
      pdfCardTitle: 'PROPUESTA PDF',
      pdfCardReady: 'Listo',
      pdfCardSub: 'Con logotipo, plazos y condiciones',
      downloadPdf: 'Descargar PDF'
    },
    whoFor: {
      title: 'Hecho para quienes viven de obras y reformas.',
      subtitle: 'Herramientas sencillas para el día a día de quien construye, reforma y transforma.',
      professions: {
        contractors: 'Contratistas',
        masons: 'Albañiles',
        painters: 'Pintores',
        electricians: 'Electricistas',
        plumbers: 'Fontaneros',
        remodelers: 'Reformistas',
        more: 'Y mucho más'
      },
      highlightBox: 'Si trabaja con obras y necesita crear presupuestos, seguir servicios y controlar pagos, AtriosBuild fue hecho para usted.'
    },
    comparison: {
      beforeBadge: '❌ ANTES',
      beforeTitle: '¿Todavía gestiona sus obras así?',
      beforeItems: [
        'Presupuestos en papel o en hojas de cálculo',
        'Precios y mensajes dispersos en WhatsApp',
        'Dificultad para controlar pagos y deudas',
        'Información desorganizada y medidas perdidas',
        'Pérdida de tiempo y dinero todos los meses'
      ],
      beforeFooter: 'Estrés diario y falta de imagen profesional',
      afterBadge: '✅ CON ÁTRIOSBUILD',
      afterTitle: 'Con ÁtriosBuild todo es diferente.',
      afterItems: [
        'Presupuestos profesionales creados en minutos',
        'Propuestas en PDF con su logotipo y marca',
        'Obras, servicios y materiales centralizados',
        'Pagos y cobros 100% controlados',
        'Todo en un solo lugar, directo en su móvil'
      ],
      afterFooter: 'Más beneficio y credibilidad',
      tryFree: 'Probar Gratis'
    },
    workflow: {
      title: 'Del presupuesto al pago, todo en un solo lugar.',
      subtitle: 'Un flujo simple para gestionar su obra de manera profesional.',
      step1Title: 'PRESUPUESTO',
      step1Desc: 'Añada materiales, mano de obra y costes en pocos minutos.',
      step2Title: 'PROPUESTA',
      step2Desc: 'Genere un PDF profesional con su marca y envíelo al cliente.',
      step3Title: 'OBRA',
      step3Desc: 'Supervise servicios, tareas, plazos y detalles de la obra.',
      step4Title: 'PAGO',
      step4Desc: 'Registre cobros, pendientes y mantenga el control financiero.'
    },
    videoSection: {
      eyebrow: 'VEA EN ACCIÓN',
      title: 'Vea cómo funciona en 60 segundos',
      desc: 'Cree un presupuesto completo, genere el PDF y envíelo a su cliente. Simple, rápido y profesional.',
      overlayTitle: 'Ver Demostración Interactiva (60 segundos)',
      overlaySub: 'Sin rodeos • Vea el flujo real en funcionamiento',
      ctaBtn: 'VER DEMOSTRACIÓN'
    },
    pdfSection: {
      eyebrow: 'IMAGEN PROFESIONAL',
      titlePrefix: 'Preséntese como un ',
      titleHighlight: 'auténtico profesional.',
      desc: 'Cree presupuestos en PDF con su logotipo, condiciones de pago, desglose de costes y validez. Máxima credibilidad para cerrar más obras.',
      bullets: [
        { title: 'PDF con su logotipo y datos', desc: 'Destaque su identidad visual en cada propuesta.' },
        { title: 'Desglose detallado de materiales y mano de obra', desc: 'Transparencia que evita malentendidos y acelera la firma.' },
        { title: 'Condiciones de pago y validez claras', desc: 'Defina plazos de inicio, entregas e importes con total claridad.' },
        { title: 'Envío rápido por WhatsApp y E-mail', desc: 'Su cliente recibe un documento limpio, elegante y seguro.' }
      ],
      ctaBtn: 'CREAR MI PRIMER PDF GRATIS',
      docHeader: 'ÁTRIOS CONSTRUCCIONES',
      docTaxId: 'CIF: B-87654321 • Madrid',
      docProposalNo: 'PROPUESTA Nº',
      docClientTitle: 'Cliente',
      docClientName: 'Manuel Antunes',
      docClientAddress: 'Calle Gran Vía, 42 - Madrid',
      docDateTitle: 'Fecha / Validez',
      docValidity: 'Válido por 30 días',
      docColDesc: 'Descripción del Servicio',
      docColQty: 'Cant / Precio',
      docColTotal: 'Total',
      docItem1Title: 'Reforma Integral de Baño',
      docItem1Sub: 'Demolición, fontanería y sanitarios',
      docItem1Unit: '1 un',
      docItem2Title: 'Pintura Interior Antihumedad',
      docItem2Sub: '2 manos con imprimación previa',
      docItem2Unit: '120 m²',
      docItem3Title: 'Instalación Eléctrica LED',
      docItem3Sub: 'Cuadro secundario y 8 puntos de luz',
      docItem3Unit: '8 pts',
      docSubtotal: 'Subtotal',
      docTax: 'IVA (21%)',
      docTotal: 'IMPORTE TOTAL',
      docSignature: 'Firma del Responsable: ____________',
      docCertified: 'Documento Certificado',
      cards: [
        { title: 'Órdenes de Trabajo', desc: 'Cree y asigne órdenes de trabajo para cada etapa de la obra.' },
        { title: 'Informes Financieros', desc: 'Sepa lo que ha cobrado, lo que falta y el beneficio real de cada obra.' },
        { title: 'Control de Pagos', desc: 'Registre cobros, recibos y mantenga sus cuentas al día.' },
        { title: 'Acceso en Cualquier Lugar', desc: 'Úselo en ordenador, tablet o móvil. Sus datos siempre consigo.' }
      ]
    },
    testimonialsSection: {
      title: 'Lo que dicen los profesionales',
      items: [
        {
          text: '“ÁtriosBuild cambió la forma en que hago presupuestos. Ahorro tiempo y transmito mucha más confianza al cliente.”',
          author: 'Carlos Mendes',
          role: 'Albañil & Alicatador'
        },
        {
          text: '“¡Por fin tengo el control total de las obras y de todos los pagos en un solo lugar!”',
          author: 'Juan Rodríguez',
          role: 'Contratista General'
        },
        {
          text: '“El PDF profesional marca toda la diferencia a la hora de cerrar el contrato con el cliente.”',
          author: 'Bruno Silva',
          role: 'Especialista en Reformas'
        }
      ]
    },
    finalCta: {
      title: 'Su próxima obra puede empezar mucho más organizada.',
      subtitle: 'Comience ahora gratis y experimente la diferencia en su trabajo diario.',
      btn: 'COMENZAR GRATIS',
      badge: 'Sin tarjeta de crédito • Sin compromiso'
    },
    footer: {
      desc: 'La plataforma completa para gestión de presupuestos, órdenes de trabajo y control financiero de obras.',
      product: 'Producto',
      company: 'Empresa',
      support: 'Soporte',
      features: 'Funcionalidades',
      howItWorks: 'Cómo Funciona',
      pdfEstimates: 'Presupuestos PDF',
      createFreeAccount: 'Crear Cuenta Gratis',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
      help: 'Ayuda y Preguntas',
      demo: 'Ver Demostración',
      installApp: 'Instalar App Móvil',
      rights: 'Todos los derechos reservados.',
      createdBy: 'Creado por'
    },
    demoModal: {
      title: 'Demostración ÁtriosBuild',
      subtitle: 'Cómo crear un presupuesto en 4 sencillos pasos',
      step1Tab: 'Cliente',
      step2Tab: 'Materiales',
      step3Tab: 'Mano de Obra',
      step4Tab: 'PDF Listo',
      step1Badge: 'Paso 1: Identificación del Cliente y de la Obra',
      step1Client: 'Nombre del Cliente:',
      step1Location: 'Ubicación:',
      step1Desc: 'Descripción:',
      step1Footer: 'Simplemente rellene los datos o elija un cliente registrado.',
      step2Badge: 'Paso 2: Inserción de Materiales y Costes',
      step2Item1: 'Gres Porcelánico (35 m²)',
      step2Item2: 'Cemento Cola + Junta impermeable',
      step2Item3: 'Tuberías y Codos PVC',
      step2Footer: 'Los totales y márgenes se calculan al instante de forma automática.',
      step3Badge: 'Paso 3: Mano de Obra y Plazos',
      step3Item1: 'Albañil & Alicatador (30 h)',
      step3Item2: 'Fontanero Autorizado (10 h)',
      step3Total: 'Total Estimado con IVA:',
      step4Badge: 'Paso 4: PDF Listo en 1 Clic',
      step4File: 'Presupuesto_Juan_Perez.pdf',
      step4Sub: 'Con su logotipo y condiciones ya formateadas',
      step4Footer: '¡Haga clic en "Descargar PDF" o envíelo directamente por WhatsApp!',
      prev: '← Anterior',
      cta: 'Crear Mi Primer Presupuesto Gratis →'
    }
  },

  'fr-FR': {
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      whoIsItFor: 'Pour qui',
      pdfEstimates: 'Devis PDF',
      testimonials: 'Témoignages',
      login: 'Connexion',
      startFree: 'Démarrer Gratuit'
    },
    hero: {
      badge: 'POUR LES PROFESSIONNELS DU BÂTIMENT & ARTISANS',
      titlePrefix: 'Créez des devis professionnels et gardez le ',
      titleHighlight: 'contrôle de vos chantiers.',
      subtitle: 'Établissez des devis précis, envoyez des propositions en PDF, suivez vos chantiers, paiements et bénéfices — tout au même endroit.',
      ctaPrimary: 'CRÉER MON PREMIER DEVIS GRATUIT',
      ctaSecondary: 'VOIR COMMENT ÇA MARCHE',
      badgeFree: 'Démarrez gratuit',
      badgeFreeSub: 'Sans carte bancaire',
      badgeFast: 'Rapide & simple',
      badgeFastSub: 'Devis en quelques minutes',
      badgeAnywhere: 'Partout',
      badgeAnywhereSub: 'Web, Tablette & Mobile'
    },
    preview: {
      estimateTitle: 'Devis #042',
      statusPending: 'En attente',
      clientLabel: 'Client : Jean Dupont',
      projectLabel: 'Chantier : Rénovation Cuisine',
      totalGeneral: 'Total Général',
      materialsTitle: '1. Matériaux',
      materialsCount: '3 articles',
      material1: 'Carrelage Grès Cérame 60x60 (45 m²)',
      material2: 'Mortier-colle souple (10 sacs)',
      material3: 'Joint hydrofuge (5 un)',
      laborTitle: '2. Main d’œuvre',
      laborCount: '3 prestations',
      labor1: 'Maçon qualifié (40 h)',
      labor2: 'Plombier certifié (12 h)',
      labor3: 'Électricien (10 h)',
      taxIncluded: 'TVA et charges incluses',
      generatePdf: 'Générer PDF',
      pdfCardTitle: 'DEVIS PDF',
      pdfCardReady: 'Prêt',
      pdfCardSub: 'Avec logo, délais et mentions légales',
      downloadPdf: 'Télécharger PDF'
    },
    whoFor: {
      title: 'Conçu pour ceux qui vivent des chantiers.',
      subtitle: 'Des outils simples et performants pour bâtir, rénover et transformer.',
      professions: {
        contractors: 'Entrepreneurs',
        masons: 'Maçons',
        painters: 'Peintres',
        electricians: 'Électriciens',
        plumbers: 'Plombiers',
        remodelers: 'Rénovateurs',
        more: 'Et bien plus'
      },
      highlightBox: 'Si vous travaillez dans le bâtiment et devez créer des devis, suivre des chantiers et gérer des paiements, ÁtriosBuild est fait pour vous.'
    },
    comparison: {
      beforeBadge: '❌ AVANT',
      beforeTitle: 'Gérez-vous encore vos chantiers ainsi ?',
      beforeItems: [
        'Devis sur papier ou tableurs compliqués',
        'Prix et messages éparpillés sur WhatsApp',
        'Difficulté à suivre les acomptes et impayés',
        'Informations égarées et plans désorganisés',
        'Perte de temps et d’argent chaque mois'
      ],
      beforeFooter: 'Stress quotidien et manque d’image professionnelle',
      afterBadge: '✅ AVEC ÁTRIOSBUILD',
      afterTitle: 'Avec ÁtriosBuild tout devient simple.',
      afterItems: [
        'Devis professionnels créés en quelques minutes',
        'Propositions PDF avec votre logo et vos coordonnées',
        'Chantiers, prestations et matériaux centralisés',
        'Paiements et facturation 100 % sous contrôle',
        'Tout au même endroit, toujours accessible sur mobile'
      ],
      afterFooter: 'Plus de marge et de crédibilité',
      tryFree: 'Essayer Gratuitement'
    },
    workflow: {
      title: 'Du devis au règlement, tout en un seul endroit.',
      subtitle: 'Un flux clair et intuitif pour gérer vos chantiers comme un pro.',
      step1Title: 'DEVIS',
      step1Desc: 'Ajoutez matériaux, main-d’œuvre et marges en quelques clics.',
      step2Title: 'PROPOSITION',
      step2Desc: 'Générez un devis PDF soigné à vos couleurs et envoyez-le au client.',
      step3Title: 'CHANTIER',
      step3Desc: 'Suivez l’avancement, les tâches, les délais et les imprévus.',
      step4Title: 'PAIEMENT',
      step4Desc: 'Enregistrez les acomptes, les soldes et suivez votre rentabilité.'
    },
    videoSection: {
      eyebrow: 'DÉCOUVREZ EN ACTION',
      title: 'Voyez comment ça marche en 60 secondes',
      desc: 'Créez un devis complet, exportez le PDF et envoyez-le à votre client. Simple, rapide et professionnel.',
      overlayTitle: 'Regarder la Démo Interactive (60 secondes)',
      overlaySub: 'Sans détour • Découvrez l’application en pratique',
      ctaBtn: 'VOIR LA DÉMO'
    },
    pdfSection: {
      eyebrow: 'IMAGE PROFESSIONNELLE',
      titlePrefix: 'Présentez-vous comme un ',
      titleHighlight: 'vrai professionnel.',
      desc: 'Créez des devis PDF personnalisés avec votre logo, vos conditions, le détail des prestations et la validité. Plus de crédibilité pour remporter vos chantiers.',
      bullets: [
        { title: 'PDF avec votre logo et vos coordonnées', desc: 'Mettez en avant votre image de marque sur chaque devis.' },
        { title: 'Détail clair des fournitures et de la pose', desc: 'Une transparence totale qui évite les contestations et accélère la signature.' },
        { title: 'Conditions d’acompte et délais précis', desc: 'Fixez les échéances de démarrage et de livraison avec clarté.' },
        { title: 'Envoi instantané par WhatsApp et Email', desc: 'Votre client reçoit un document élégant, sécurisé et prêt à signer.' }
      ],
      ctaBtn: 'CRÉER MON PREMIER PDF GRATUIT',
      docHeader: 'ÁTRIOS CONSTRUCTIONS',
      docTaxId: 'SIRET: 890 123 456 00012 • Paris',
      docProposalNo: 'DEVIS Nº',
      docClientTitle: 'Client',
      docClientName: 'Jean Dupont',
      docClientAddress: '15 rue de Rivoli, Paris',
      docDateTitle: 'Date / Validité',
      docValidity: 'Valable 30 jours',
      docColDesc: 'Désignation des travaux',
      docColQty: 'Qté / Prix',
      docColTotal: 'Total',
      docItem1Title: 'Rénovation Complète Salle de Bain',
      docItem1Sub: 'Dépose, plomberie et pose sanitaire',
      docItem1Unit: '1 ens',
      docItem2Title: 'Peinture Intérieure Anti-humidité',
      docItem2Sub: '2 couches avec sous-couche d’accroche',
      docItem2Unit: '120 m²',
      docItem3Title: 'Installation Électrique LED',
      docItem3Sub: 'Tableau divisionnaire et 8 spots encastrés',
      docItem3Unit: '8 pts',
      docSubtotal: 'Sous-total HT',
      docTax: 'TVA (20%)',
      docTotal: 'TOTAL TTC',
      docSignature: 'Signature & Bon pour Accord: ____________',
      docCertified: 'Document Certifié',
      cards: [
        { title: 'Bons de Travaux', desc: 'Créez et suivez les ordres de service pour chaque étape du chantier.' },
        { title: 'Rapports Financiers', desc: 'Visualisez vos encaissements, vos créances et la marge réelle par chantier.' },
        { title: 'Suivi des Paiements', desc: 'Enregistrez les acomptes, factures et gardez vos comptes à jour.' },
        { title: 'Accès Partout', desc: 'Utilisez sur PC, tablette ou smartphone. Vos données toujours synchronisées.' }
      ]
    },
    testimonialsSection: {
      title: 'Ce que disent les artisans',
      items: [
        {
          text: '« ÁtriosBuild a transformé ma façon de chiffrer. Je gagne des heures et mes clients sont rassurés par la clarté du devis. »',
          author: 'Carlos Mendes',
          role: 'Artisan Maçon & Carreleur'
        },
        {
          text: '« J’ai enfin une vue d’ensemble sur tous mes chantiers et paiements en attente au même endroit ! »',
          author: 'Jean Rodrigues',
          role: 'Entrepreneur Général'
        },
        {
          text: '« Le devis PDF professionnel fait toute la différence au moment de faire signer le client. »',
          author: 'Bruno Silva',
          role: 'Spécialiste en Rénovation'
        }
      ]
    },
    finalCta: {
      title: 'Votre prochain chantier peut commencer bien plus sereinement.',
      subtitle: 'Démarrez gratuitement dès maintenant et ressentez la différence au quotidien.',
      btn: 'DÉMARRER GRATUITEMENT',
      badge: 'Sans carte bancaire • Sans engagement'
    },
    footer: {
      desc: 'La plateforme complète pour la gestion de devis, ordres de service et suivi financier de chantiers.',
      product: 'Produit',
      company: 'Entreprise',
      support: 'Assistance',
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      pdfEstimates: 'Devis PDF',
      createFreeAccount: 'Créer un Compte Gratuit',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions Générales',
      help: 'Aide & FAQ',
      demo: 'Voir la Démo',
      installApp: 'Installer l’App Mobile',
      rights: 'Tous droits réservés.',
      createdBy: 'Créé par'
    },
    demoModal: {
      title: 'Démonstration Interactive ÁtriosBuild',
      subtitle: 'Comment créer un devis complet en 4 étapes simples',
      step1Tab: 'Client',
      step2Tab: 'Matériaux',
      step3Tab: 'Main d’œuvre',
      step4Tab: 'PDF Prêt',
      step1Badge: 'Étape 1 : Renseigner le Client et le Chantier',
      step1Client: 'Nom du Client :',
      step1Location: 'Adresse du Chantier :',
      step1Desc: 'Description des Travaux :',
      step1Footer: 'Remplissez les informations ou sélectionnez un client existant.',
      step2Badge: 'Étape 2 : Ajout des Matériaux & Coûts',
      step2Item1: 'Carrelage Grès Cérame (35 m²)',
      step2Item2: 'Mortier-colle + Joint hydrofuge',
      step2Item3: 'Tuyauterie & Raccords PVC',
      step2Footer: 'Les totaux et les marges sont calculés instantanément en temps réel.',
      step3Badge: 'Étape 3 : Main d’œuvre & Délais',
      step3Item1: 'Maçon & Carreleur (30 h)',
      step3Item2: 'Plombier Qualifié (10 h)',
      step3Total: 'Total Estimé TTC :',
      step4Badge: 'Étape 4 : Devis PDF en 1 Clic',
      step4File: 'Devis_Jean_Dupont.pdf',
      step4Sub: 'Personnalisé avec votre logo et vos conditions',
      step4Footer: 'Cliquez sur "Télécharger PDF" ou partagez directement par WhatsApp au client !',
      prev: '← Précédent',
      cta: 'Créer Mon Premier Devis Gratuit →'
    }
  },

  'it-IT': {
    nav: {
      features: 'Funzionalità',
      howItWorks: 'Come Funziona',
      whoIsItFor: 'Per Chi È',
      pdfEstimates: 'Preventivi PDF',
      testimonials: 'Recensioni',
      login: 'Accedi',
      startFree: 'Inizia Gratis'
    },
    hero: {
      badge: 'PER PROFESSIONISTI EDILI E ARTIGIANI',
      titlePrefix: 'Crea preventivi professionali e mantieni il ',
      titleHighlight: 'controllo del tuo cantiere.',
      subtitle: 'Crea preventivi dettagliati, invia proposte in PDF, monitora lavori, pagamenti e guadagni — tutto in un unico posto.',
      ctaPrimary: 'CREA IL MIO PRIMO PREVENTIVO GRATIS',
      ctaSecondary: 'GUARDA COME FUNZIONA',
      badgeFree: 'Inizia gratis',
      badgeFreeSub: 'Nessuna carta richiesta',
      badgeFast: 'Veloce e facile',
      badgeFastSub: 'Preventivi in pochi minuti',
      badgeAnywhere: 'Ovunque',
      badgeAnywhereSub: 'Web, Tablet e Smartphone'
    },
    preview: {
      estimateTitle: 'Preventivo #042',
      statusPending: 'In Sospeso',
      clientLabel: 'Cliente: Mario Rossi',
      projectLabel: 'Lavoro: Ristrutturazione Cucina',
      totalGeneral: 'Totale Complessivo',
      materialsTitle: '1. Materiali',
      materialsCount: '3 articoli',
      material1: 'Gres Porcellanato 60x60 (45 mq)',
      material2: 'Colla per piastrelle (10 sacchi)',
      material3: 'Stucco idrofugo (5 pz)',
      laborTitle: '2. Manodopera',
      laborCount: '3 servizi',
      labor1: 'Muratore Specializzato (40 h)',
      labor2: 'Idraulico (12 h)',
      labor3: 'Elettricista (10 h)',
      taxIncluded: 'IVA e spese incluse',
      generatePdf: 'Genera PDF',
      pdfCardTitle: 'PROPOSTA PDF',
      pdfCardReady: 'Pronto',
      pdfCardSub: 'Con logo, scadenze e condizioni',
      downloadPdf: 'Scarica PDF'
    },
    whoFor: {
      title: 'Creato per chi vive di cantieri e ristrutturazioni.',
      subtitle: 'Strumenti semplici per la gestione quotidiana di chi costruisce, rinnova e trasforma.',
      professions: {
        contractors: 'Appaltatori',
        masons: 'Muratori',
        painters: 'Imbianchini',
        electricians: 'Elettricisti',
        plumbers: 'Idraulici',
        remodelers: 'Ristrutturatori',
        more: 'E molto altro'
      },
      highlightBox: 'Se lavori nell’edilizia e devi fare preventivi, seguire lavori e gestire pagamenti, ÁtriosBuild è fatto per te.'
    },
    comparison: {
      beforeBadge: '❌ PRIMA',
      beforeTitle: 'Gestisci ancora i tuoi cantieri così?',
      beforeItems: [
        'Preventivi su carta o fogli Excel complessi',
        'Prezzi e messaggi dispersi nelle chat WhatsApp',
        'Difficoltà a tracciare acconti e crediti in sospeso',
        'Informazioni smarrite e misure confuse',
        'Perdita di tempo e denaro ogni singolo mese'
      ],
      beforeFooter: 'Stress quotidiano e immagine poco professionale',
      afterBadge: '✅ CON ÁTRIOSBUILD',
      afterTitle: 'Con ÁtriosBuild tutto è chiaro e ordinato.',
      afterItems: [
        'Preventivi professionali creati in pochi minuti',
        'Documenti PDF brandizzati con il tuo logo aziendale',
        'Cantieri, mansioni e materiali centralizzati',
        'Pagamenti e incassi monitorati al 100%',
        'Tutto in un unico posto, sempre a portata di mano sul telefono'
      ],
      afterFooter: 'Più margine e credibilità',
      tryFree: 'Prova Gratis'
    },
    workflow: {
      title: 'Dal preventivo al saldo, tutto in un unico posto.',
      subtitle: 'Un flusso semplice e professionale per gestire i tuoi lavori.',
      step1Title: 'PREVENTIVO',
      step1Desc: 'Aggiungi materiali, manodopera e margini in pochissimi minuti.',
      step2Title: 'PROPOSTA',
      step2Desc: 'Genera un PDF elegante con il tuo logo e invialo direttamente al cliente.',
      step3Title: 'CANTIERE',
      step3Desc: 'Segui lo stato di avanzamento, le scadenze e i dettagli operativi.',
      step4Title: 'PAGAMENTO',
      step4Desc: 'Registra gli acconti, tieni d’occhio i saldi e proteggi il tuo utile.'
    },
    videoSection: {
      eyebrow: 'GUARDA IN AZIONE',
      title: 'Guarda come funziona in 60 secondi',
      desc: 'Crea un preventivo completo, esporta il PDF e invialo al cliente. Semplice, veloce e professionale.',
      overlayTitle: 'Guarda la Demo Interattiva (60 secondi)',
      overlaySub: 'Niente giri di parole • Scopri l’app nella pratica',
      ctaBtn: 'GUARDA LA DEMO'
    },
    pdfSection: {
      eyebrow: 'IMMAGINE PROFESSIONALE',
      titlePrefix: 'Presentati come un ',
      titleHighlight: 'vero professionista.',
      desc: 'Crea preventivi PDF con il tuo logo, condizioni di pagamento, elenco dettagliato delle voci e validità. Massima credibilità per chiudere più contratti.',
      bullets: [
        { title: 'PDF con il tuo logo e recapiti', desc: 'Fai risaltare la tua identità visiva su ogni proposta.' },
        { title: 'Dettaglio chiaro di materiali e manodopera', desc: 'Trasparenza totale per evitare incomprensioni e velocizzare l’approvazione.' },
        { title: 'Scadenze e condizioni di pagamento chiare', desc: 'Definisci acconti, date di inizio e consegna con precisione.' },
        { title: 'Condivisione immediata via WhatsApp ed Email', desc: 'Il tuo cliente riceve un documento pulito, sicuro ed elegante.' }
      ],
      ctaBtn: 'CREA IL MIO PRIMO PDF GRATIS',
      docHeader: 'ÁTRIOS COSTRUZIONI',
      docTaxId: 'P.IVA: 01234567890 • Roma',
      docProposalNo: 'PREVENTIVO N°',
      docClientTitle: 'Cliente',
      docClientName: 'Mario Rossi',
      docClientAddress: 'Via Nazionale, 42 - Roma',
      docDateTitle: 'Data / Validità',
      docValidity: 'Valido 30 giorni',
      docColDesc: 'Descrizione Lavori',
      docColQty: 'Q.tà / Prezzo',
      docColTotal: 'Totale',
      docItem1Title: 'Ristrutturazione Bagno Completa',
      docItem1Sub: 'Demolizione, impianto idraulico e sanitari',
      docItem1Unit: '1 corpo',
      docItem2Title: 'Tinteggiatura Interna Antimuffa',
      docItem2Sub: '2 mani con fondo fissativo',
      docItem2Unit: '120 mq',
      docItem3Title: 'Impianto Elettrico LED',
      docItem3Sub: 'Quadro parziale e 8 punti luce',
      docItem3Unit: '8 pt',
      docSubtotal: 'Imponibile',
      docTax: 'IVA (22%)',
      docTotal: 'TOTALE COMPLESSIVO',
      docSignature: 'Firma per Accettazione: ____________',
      docCertified: 'Documento Certificato',
      cards: [
        { title: 'Ordini di Lavoro', desc: 'Crea e monitora gli ordini di servizio per ogni fase del cantiere.' },
        { title: 'Report Finanziari', desc: 'Visualizza incassi, crediti rimanenti e il guadagno effettivo di ogni lavoro.' },
        { title: 'Controllo Pagamenti', desc: 'Registra gli acconti, le ricevute e mantieni la contabilità sempre in ordine.' },
        { title: 'Accesso da Ovunque', desc: 'Usa su computer, tablet o smartphone. I tuoi dati sempre sincronizzati.' }
      ]
    },
    testimonialsSection: {
      title: 'Cosa dicono i professionisti',
      items: [
        {
          text: '“ÁtriosBuild ha cambiato il modo in cui faccio preventivi. Risparmio ore e trasmetto molta più fiducia ai clienti.”',
          author: 'Carlos Mendes',
          role: 'Muratore & Piastrellista'
        },
        {
          text: '“Finalmente ho il pieno controllo di tutti i cantieri e dei pagamenti in un’unica applicazione!”',
          author: 'Giovanni Rodrigues',
          role: 'Impresa Edile'
        },
        {
          text: '“Il PDF professionale fa tutta la differenza quando si tratta di far firmare il cliente.”',
          author: 'Bruno Silva',
          role: 'Specialista in Ristrutturazioni'
        }
      ]
    },
    finalCta: {
      title: 'Il tuo prossimo cantiere può iniziare con molto più ordine.',
      subtitle: 'Inizia subito gratis e scopri la differenza nel tuo lavoro quotidiano.',
      btn: 'INIZIA GRATUITAMENTE',
      badge: 'Nessuna carta richiesta • Nessun vincolo'
    },
    footer: {
      desc: 'La piattaforma completa per la gestione di preventivi, ordini di lavoro e contabilità di cantiere.',
      product: 'Prodotto',
      company: 'Azienda',
      support: 'Assistenza',
      features: 'Funzionalità',
      howItWorks: 'Come Funziona',
      pdfEstimates: 'Preventivi PDF',
      createFreeAccount: 'Crea Account Gratis',
      privacy: 'Informativa sulla Privacy',
      terms: 'Termini di Servizio',
      help: 'Aiuto e Domande',
      demo: 'Guarda la Demo',
      installApp: 'Installa App Mobile',
      rights: 'Tutti i diritti riservati.',
      createdBy: 'Creato da'
    },
    demoModal: {
      title: 'Demo Interattiva ÁtriosBuild',
      subtitle: 'Come creare un preventivo completo in 4 semplici passaggi',
      step1Tab: 'Cliente',
      step2Tab: 'Materiali',
      step3Tab: 'Manodopera',
      step4Tab: 'PDF Pronto',
      step1Badge: 'Passo 1: Dati Cliente e Cantiere',
      step1Client: 'Nome Cliente:',
      step1Location: 'Indirizzo Cantiere:',
      step1Desc: 'Descrizione Lavori:',
      step1Footer: 'Compila i dettagli o seleziona un cliente già registrato.',
      step2Badge: 'Passo 2: Inserimento Materiali e Costi',
      step2Item1: 'Gres Porcellanato (35 mq)',
      step2Item2: 'Colla per piastrelle + Stucco',
      step2Item3: 'Tubazioni e Raccordi PVC',
      step2Footer: 'Totali e margini di guadagno vengono calcolati in tempo reale.',
      step3Badge: 'Passo 3: Manodopera e Tempistiche',
      step3Item1: 'Muratore & Piastrellista (30 h)',
      step3Item2: 'Idraulico Specializzato (10 h)',
      step3Total: 'Totale Stimato con IVA:',
      step4Badge: 'Passo 4: PDF Pronto con 1 Clic',
      step4File: 'Preventivo_Mario_Rossi.pdf',
      step4Sub: 'Completo di logo aziendale e condizioni',
      step4Footer: 'Clicca su "Scarica PDF" o invialo direttamente su WhatsApp al cliente!',
      prev: '← Precedente',
      cta: 'Crea il Mio Primo Preventivo Gratis →'
    }
  },

  'ru-RU': {
    nav: {
      features: 'Функции',
      howItWorks: 'Как это работает',
      whoIsItFor: 'Для кого',
      pdfEstimates: 'Сметы PDF',
      testimonials: 'Отзывы',
      login: 'Войти',
      startFree: 'Начать бесплатно'
    },
    hero: {
      badge: 'ДЛЯ СТРОИТЕЛЕЙ, ОТДЕЛОЧНИКОВ И МАСТЕРОВ',
      titlePrefix: 'Создавайте профессиональные сметы и держите ',
      titleHighlight: 'полный контроль над объектом.',
      subtitle: 'Составляйте точные сметы, отправляйте PDF клиентам, ведите учет работ, платежей и прибыли — всё в одном удобном приложении.',
      ctaPrimary: 'СОЗДАТЬ ПЕРВУЮ СМЕТУ БЕСПЛАТНО',
      ctaSecondary: 'КАК ЭТО РАБОТАЕТ',
      badgeFree: 'Начните бесплатно',
      badgeFreeSub: 'Без банковской карты',
      badgeFast: 'Быстро и просто',
      badgeFastSub: 'Смета за пару минут',
      badgeAnywhere: 'Везде с вами',
      badgeAnywhereSub: 'ПК, планшет и телефон'
    },
    preview: {
      estimateTitle: 'Смета #042',
      statusPending: 'На рассмотрении',
      clientLabel: 'Клиент: Иван Смирнов',
      projectLabel: 'Объект: Ремонт кухни',
      totalGeneral: 'Итоговая сумма',
      materialsTitle: '1. Материалы',
      materialsCount: '3 позиции',
      material1: 'Керамогранит 60х60 (45 кв.м)',
      material2: 'Клей плиточный усиленный (10 шт)',
      material3: 'Затирка водоотталкивающая (5 шт)',
      laborTitle: '2. Работы и мастера',
      laborCount: '3 услуги',
      labor1: 'Мастер-плиточник (40 ч)',
      labor2: 'Сантехник (12 ч)',
      labor3: 'Электрик (10 ч)',
      taxIncluded: 'Все налоги и расходы включены',
      generatePdf: 'Создать PDF',
      pdfCardTitle: 'PDF КП',
      pdfCardReady: 'Готово',
      pdfCardSub: 'С логотипом, сроками и сметой',
      downloadPdf: 'Скачать PDF'
    },
    whoFor: {
      title: 'Создано для тех, кто занимается строительством и ремонтом.',
      subtitle: 'Простые и мощные инструменты для мастеров, бригадиров и строительных компаний.',
      professions: {
        contractors: 'Подрядчики',
        masons: 'Каменщики',
        painters: 'Маляры',
        electricians: 'Электрики',
        plumbers: 'Сантехники',
        remodelers: 'Мастера ремонта',
        more: 'И многие другие'
      },
      highlightBox: 'Если вы занимаетесь строительством и ремонтом и хотите быстро составлять сметы, вести учет работ и оплат — ÁtriosBuild создан специально для вас.'
    },
    comparison: {
      beforeBadge: '❌ РАНЬШЕ',
      beforeTitle: 'Вы все еще ведете объекты по старинке?',
      beforeItems: [
        'Сметы на клочках бумаги или в сложных таблицах',
        'Цены и договоренности теряются в переписках WhatsApp',
        'Трудно отследить, кто сколько заплатил и сколько должен',
        'Потерянные замеры и хаос в документах',
        'Потеря драгоценного времени и денег каждый месяц'
      ],
      beforeFooter: 'Постоянный стресс и непрофессиональный вид перед клиентом',
      afterBadge: '✅ С ÁTRIOSBUILD',
      afterTitle: 'С ÁtriosBuild всё под вашим контролем.',
      afterItems: [
        'Профессиональные сметы формируются за считанные минуты',
        'Красивые PDF-предложения с вашим фирменным логотипом',
        'Все объекты, задачи и материалы собраны в одном месте',
        '100% учет оплат от клиентов и расходов на закупки',
        'Вся информация всегда под рукой в вашем телефоне'
      ],
      afterFooter: 'Выше прибыль и доверие заказчиков',
      tryFree: 'Попробовать бесплатно'
    },
    workflow: {
      title: 'От составления сметы до финальной оплаты — всё в одном месте.',
      subtitle: 'Понятный и удобный процесс управления строительными работами.',
      step1Title: 'СМЕТА',
      step1Desc: 'Добавляйте материалы, стоимость работ и наценку за считанные минуты.',
      step2Title: 'КП В PDF',
      step2Desc: 'Сформируйте брендированный PDF и отправьте заказчику.',
      step3Title: 'ОБЪЕКТ',
      step3Desc: 'Отслеживайте этапы работ, поручения мастерам и сроки выполнения.',
      step4Title: 'ОПЛАТА',
      step4Desc: 'Фиксируйте авансы, остатки и контролируйте чистую прибыль.'
    },
    videoSection: {
      eyebrow: 'ПОСМОТРИТЕ В ДЕЙСТВИИ',
      title: 'Узнайте, как это работает за 60 секунд',
      desc: 'Создайте полноценную смету, сформируйте PDF и отправьте клиенту. Быстро, просто и профессионально.',
      overlayTitle: 'Смотреть интерактивную демонстрацию (60 сек)',
      overlaySub: 'Без лишних слов • Реальный рабочий процесс на практике',
      ctaBtn: 'СМОТРЕТЬ ДЕМО'
    },
    pdfSection: {
      eyebrow: 'ПРОФЕССИОНАЛЬНЫЙ ИМИДЖ',
      titlePrefix: 'Выглядите как настоящий ',
      titleHighlight: 'профессионал.',
      desc: 'Формируйте сметы в PDF с вашим логотипом, графиком оплат, подробным списком позиций и сроком действия. Завоюйте доверие клиентов и закрывайте больше сделок.',
      bullets: [
        { title: 'PDF с вашим логотипом и реквизитами', desc: 'Подчеркните солидность вашей компании в каждом предложении.' },
        { title: 'Детализация материалов и работ', desc: 'Полная прозрачность исключает споры и ускоряет согласование.' },
        { title: 'Четкие условия оплаты и сроки', desc: 'Зафиксируйте даты старта, сдачи объекта и график платежей.' },
        { title: 'Быстрая отправка в WhatsApp и на почту', desc: 'Клиент получает готовый, аккуратный и защищенный документ.' }
      ],
      ctaBtn: 'СОЗДАТЬ ПЕРВЫЙ PDF БЕСПЛАТНО',
      docHeader: 'ÁTRIOS СТРОЙ',
      docTaxId: 'ИНН: 7701234567 • Москва',
      docProposalNo: 'ПРЕДЛОЖЕНИЕ №',
      docClientTitle: 'Заказчик',
      docClientName: 'Иван Смирнов',
      docClientAddress: 'ул. Тверская, 15, кв. 42',
      docDateTitle: 'Дата / Срок действия',
      docValidity: 'Действительно 30 дней',
      docColDesc: 'Наименование работ и материалов',
      docColQty: 'Кол-во / Цена',
      docColTotal: 'Итого',
      docItem1Title: 'Комплексный ремонт санузла',
      docItem1Sub: 'Демонтаж, разводка труб и установка сантехники',
      docItem1Unit: '1 компл',
      docItem2Title: 'Покраска стен влагостойкой краской',
      docItem2Sub: '2 слоя с предварительной грунтовкой',
      docItem2Unit: '120 кв.м',
      docItem3Title: 'Монтаж светодиодного освещения',
      docItem3Sub: 'Установка щитка и 8 точечных светильников',
      docItem3Unit: '8 шт',
      docSubtotal: 'Подытог',
      docTax: 'Налоги (20%)',
      docTotal: 'ИТОГО К ОПЛАТЕ',
      docSignature: 'Подпись исполнителя: ____________',
      docCertified: 'Сертифицированный документ',
      cards: [
        { title: 'Заказ-наряды', desc: 'Создавайте и распределяйте задачи по этапам работ.' },
        { title: 'Финансовые отчеты', desc: 'Отслеживайте поступления, дебиторку и реальную маржу по каждому объекту.' },
        { title: 'Учет платежей', desc: 'Фиксируйте предоплаты, чеки и держите финансы в идеальном порядке.' },
        { title: 'Доступ отовсюду', desc: 'Работайте на компьютере, планшете или телефоне с синхронизацией данных.' }
      ]
    },
    testimonialsSection: {
      title: 'Что говорят строители и мастера',
      items: [
        {
          text: '«ÁtriosBuild полностью изменил мой подход к сметам. Я экономлю часы работы, а заказчики сразу видят серьезный уровень.»',
          author: 'Карлос Мендес',
          role: 'Мастер-плиточник'
        },
        {
          text: '«Наконец-то у меня есть полный порядок во всех объектах и платежах клиентов в одном приложении!»',
          author: 'Иван Родригес',
          role: 'Генеральный подрядчик'
        },
        {
          text: '«Фирменный PDF с логотипом очень помогает при заключении договоров с крупными заказчиками.»',
          author: 'Бруно Силва',
          role: 'Мастер комплексного ремонта'
        }
      ]
    },
    finalCta: {
      title: 'Ваш следующий объект начнется в полном порядке.',
      subtitle: 'Начните бесплатно прямо сейчас и оцените удобство в ежедневной работе.',
      btn: 'НАЧАТЬ БЕСПЛАТНО',
      badge: 'Без банковской карты • Без обязательств'
    },
    footer: {
      desc: 'Комплексная платформа для составления строительных смет, заказ-нарядов и финансового учета объектов.',
      product: 'Продукт',
      company: 'Компания',
      support: 'Поддержка',
      features: 'Функции',
      howItWorks: 'Как это работает',
      pdfEstimates: 'Сметы PDF',
      createFreeAccount: 'Создать бесплатный аккаунт',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      help: 'Помощь и FAQ',
      demo: 'Смотреть демо',
      installApp: 'Установить приложение',
      rights: 'Все права защищены.',
      createdBy: 'Разработано'
    },
    demoModal: {
      title: 'Демонстрация ÁtriosBuild',
      subtitle: 'Как составить смету за 4 простых шага',
      step1Tab: 'Клиент',
      step2Tab: 'Материалы',
      step3Tab: 'Работы',
      step4Tab: 'Готовый PDF',
      step1Badge: 'Шаг 1: Укажите клиента и объект',
      step1Client: 'ФИО клиента:',
      step1Location: 'Адрес объекта:',
      step1Desc: 'Описание проекта:',
      step1Footer: 'Заполните поля или выберите уже сохраненного клиента из списка.',
      step2Badge: 'Шаг 2: Добавление материалов и цен',
      step2Item1: 'Керамогранит (35 кв.м)',
      step2Item2: 'Плиточный клей + Затирка',
      step2Item3: 'Трубы и фитинги ПВХ',
      step2Footer: 'Суммы и себестоимость пересчитываются моментально с учетом вашей наценки.',
      step3Badge: 'Шаг 3: Стоимость работ и сроки',
      step3Item1: 'Мастер-плиточник (30 ч)',
      step3Item2: 'Квалифицированный сантехник (10 ч)',
      step3Total: 'Итоговая расчетная сумма:',
      step4Badge: 'Шаг 4: Готовый PDF в 1 клик',
      step4File: 'Смета_Иван_Смирнов.pdf',
      step4Sub: 'С вашим логотипом и контактами',
      step4Footer: 'Нажмите «Скачать PDF» или сразу отправьте смету клиенту в WhatsApp!',
      prev: '← Назад',
      cta: 'Создать первую смету бесплатно →'
    }
  },

  'hi-IN': {
    nav: {
      features: 'विशेषताएं',
      howItWorks: 'यह कैसे काम करता है',
      whoIsItFor: 'किसके लिए है',
      pdfEstimates: 'PDF कोटेशन',
      testimonials: 'प्रशंसापत्र',
      login: 'लॉग इन',
      startFree: 'मुफ़्त शुरू करें'
    },
    hero: {
      badge: 'कंस्ट्रक्शन और ट्रेड प्रोफेशनल्स के लिए',
      titlePrefix: 'पेशेवर कोटेशन बनाएं और अपने ',
      titleHighlight: 'प्रोजेक्ट्स पर पूरा नियंत्रण रखें।',
      subtitle: 'सटीक कोटेशन बनाएं, PDF प्रस्ताव भेजें, काम, भुगतान और मुनाफ़े पर नज़र रखें — सब कुछ एक ही जगह।',
      ctaPrimary: 'अपना पहला मुफ़्त कोटेशन बनाएं',
      ctaSecondary: 'देखें यह कैसे काम करता है',
      badgeFree: 'मुफ़्त शुरू करें',
      badgeFreeSub: 'क्रेडिट कार्ड की आवश्यकता नहीं',
      badgeFast: 'तेज़ और आसान',
      badgeFastSub: 'मिनटों में कोटेशन तैयार',
      badgeAnywhere: 'कहीं भी इस्तेमाल करें',
      badgeAnywhereSub: 'वेब, टैबलेट और मोबाइल'
    },
    preview: {
      estimateTitle: 'कोटेशन #042',
      statusPending: 'लंबित',
      clientLabel: 'ग्राहक: राहुल शर्मा',
      projectLabel: 'प्रोजेक्ट: किचन रिनोवेशन',
      totalGeneral: 'कुल योग',
      materialsTitle: '1. सामग्री (मटेरियल)',
      materialsCount: '3 वस्तुएं',
      material1: 'सिरेमिक टाइल 60x60 (45 वर्ग मीटर)',
      material2: 'फ्लेक्सिबल टाइल एडहेसिव (10 बैग)',
      material3: 'वाटरप्रूफ ग्राउट (5 पैकेट)',
      laborTitle: '2. मजदूरी (लेबर)',
      laborCount: '3 सेवाएं',
      labor1: 'कुशल राजमिस्त्री (40 घंटे)',
      labor2: 'प्लंबर (12 घंटे)',
      labor3: 'इलेक्ट्रीशियन (10 घंटे)',
      taxIncluded: 'जीएसटी और अन्य खर्चे शामिल',
      generatePdf: 'PDF बनाएं',
      pdfCardTitle: 'PDF प्रस्ताव',
      pdfCardReady: 'तैयार',
      pdfCardSub: 'लोगो, समय सीमा और शर्तों के साथ',
      downloadPdf: 'PDF डाउनलोड करें'
    },
    whoFor: {
      title: 'उन लोगों के लिए जो निर्माण कार्य करते हैं।',
      subtitle: 'ठेकेदारों, कारीगरों और निर्माण विशेषज्ञों के लिए सरल और प्रभावी टूल।',
      professions: {
        contractors: 'ठेकेदार (कॉन्ट्रैक्टर)',
        masons: 'राजमिस्त्री',
        painters: 'पेंटर',
        electricians: 'इलेक्ट्रीशियन',
        plumbers: 'प्लंबर',
        remodelers: 'रिनोवेशन विशेषज्ञ',
        more: 'और भी बहुत कुछ'
      },
      highlightBox: 'यदि आप कंस्ट्रक्शन का काम करते हैं और आपको कोटेशन बनाने, काम और भुगतानों को ट्रैक करने की आवश्यकता है, तो ÁtriosBuild आपके लिए बनाया गया है।'
    },
    comparison: {
      beforeBadge: '❌ पहले',
      beforeTitle: 'क्या आप अभी भी अपने काम को ऐसे संभालते हैं?',
      beforeItems: [
        'कागज़ या मुश्किल एक्सेल शीट्स पर कोटेशन',
        'व्हाट्सएप चैट में खोई कीमतें और संदेश',
        'भुगतान और बकाया राशि का हिसाब रखने में परेशानी',
        'खोए हुए माप और अव्यवस्थित फाइलें',
        'हर महीने समय और पैसे की बर्बादी'
      ],
      beforeFooter: 'दैनिक तनाव और पेशेवर छवि की कमी',
      afterBadge: '✅ ÁTRIOSBUILD के साथ',
      afterTitle: 'ÁtriosBuild के साथ सब कुछ व्यवस्थित है।',
      afterItems: [
        'मिनटों में तैयार पेशेवर कोटेशन',
        'आपके लोगो के साथ सुंदर PDF प्रस्ताव',
        'सभी प्रोजेक्ट, काम और सामग्री एक जगह',
        'ग्राहकों के भुगतानों और खर्चों का 100% हिसाब',
        'सब कुछ आपके फोन पर, हर समय उपलब्ध'
      ],
      afterFooter: 'अधिक लाभ और बेहतर विश्वसनीयता',
      tryFree: 'मुफ़्त आज़माएं'
    },
    workflow: {
      title: 'कोटेशन से अंतिम भुगतान तक, सब कुछ एक जगह।',
      subtitle: 'आपके निर्माण कार्य को पेशेवर तरीके से प्रबंधित करने की सरल प्रक्रिया।',
      step1Title: 'कोटेशन',
      step1Desc: 'कुछ ही मिनटों में सामग्री, मजदूरी और लागत जोड़ें।',
      step2Title: 'PDF प्रस्ताव',
      step2Desc: 'अपने लोगो के साथ एक शानदार PDF बनाएं और ग्राहक को भेजें।',
      step3Title: 'कार्य प्रगति',
      step3Desc: 'काम के चरणों, समय सीमा और सभी विवरणों पर नज़र रखें।',
      step4Title: 'भुगतान',
      step4Desc: 'अग्रिम राशि, बकाया भुगतान दर्ज करें और मुनाफ़ा सुरक्षित रखें।'
    },
    videoSection: {
      eyebrow: 'काम करते हुए देखें',
      title: '60 सेकंड में देखें यह कैसे काम करता है',
      desc: 'एक पूरा कोटेशन बनाएं, PDF निकालें और ग्राहक को भेजें। तेज़, आसान और पेशेवर।',
      overlayTitle: 'इंटरैक्टिव डेमो देखें (60 सेकंड)',
      overlaySub: 'बिना किसी परेशानी के • असल कार्यप्रणाली को देखें',
      ctaBtn: 'डेमो देखें'
    },
    pdfSection: {
      eyebrow: 'पेशेवर छवि',
      titlePrefix: 'खुद को एक ',
      titleHighlight: 'सच्चे पेशेवर के रूप में प्रस्तुत करें।',
      desc: 'अपने लोगो, भुगतान की शर्तों, विस्तृत विवरण और वैधता के साथ PDF कोटेशन बनाएं। ग्राहकों का विश्वास जीतें और अधिक काम हासिल करें।',
      bullets: [
        { title: 'आपके लोगो और जानकारी के साथ PDF', desc: 'हर प्रस्ताव में अपनी ब्रांड पहचान चमकाएं।' },
        { title: 'सामग्री और मजदूरी का स्पष्ट विवरण', desc: 'पूरी पारदर्शिता जिससे विवाद खत्म होते हैं और काम जल्दी मिलता है।' },
        { title: 'भुगतान की स्पष्ट शर्तें और वैधता', desc: 'शुरुआती अग्रिम राशि और काम पूरा होने की तारीख तय करें।' },
        { title: 'व्हाट्सएप और ईमेल पर तुरंत शेयर करें', desc: 'ग्राहक को तुरंत एक साफ और सुरक्षित दस्तावेज़ मिलता है।' }
      ],
      ctaBtn: 'पहला मुफ़्त PDF बनाएं',
      docHeader: 'ÁTRIOS निर्माण',
      docTaxId: 'GSTIN: 07AAAAA0000A1Z5 • नई दिल्ली',
      docProposalNo: 'प्रस्ताव संख्या',
      docClientTitle: 'ग्राहक',
      docClientName: 'राहुल शर्मा',
      docClientAddress: '42 तिलक मार्ग, नई दिल्ली',
      docDateTitle: 'दिनांक / वैधता',
      docValidity: '30 दिनों के लिए वैध',
      docColDesc: 'काम का विवरण',
      docColQty: 'मात्रा / दर',
      docColTotal: 'कुल',
      docItem1Title: 'संपूर्ण बाथरूम रिनोवेशन',
      docItem1Sub: 'पुरानी फिटिंग हटाना, प्लंबिंग और नए उपकरण',
      docItem1Unit: '1 कार्य',
      docItem2Title: 'एंटी-मॉइस्चर आंतरिक पेंटिंग',
      docItem2Sub: 'प्राइमर के साथ 2 कोट',
      docItem2Unit: '120 वर्ग मी',
      docItem3Title: 'एलईडी विद्युत कार्य',
      docItem3Sub: 'एमसीबी बॉक्स और 8 लाइट प्वाइंट',
      docItem3Unit: '8 प्वाइंट',
      docSubtotal: 'उप-योग',
      docTax: 'जीएसटी (18%)',
      docTotal: 'कुल राशि',
      docSignature: 'अधिकृत हस्ताक्षर: ____________',
      docCertified: 'प्रमाणित दस्तावेज़',
      cards: [
        { title: 'वर्क ऑर्डर', desc: 'प्रोजेक्ट के हर चरण के लिए स्पष्ट वर्क ऑर्डर बनाएं और सौंपें।' },
        { title: 'वित्तीय रिपोर्ट', desc: 'प्राप्त राशि, बकाया और हर प्रोजेक्ट का असली मुनाफ़ा जानें।' },
        { title: 'भुगतान नियंत्रण', desc: 'अग्रिम भुगतान, रसीदें दर्ज करें और खातों को व्यवस्थित रखें।' },
        { title: 'कहीं से भी पहुंच', desc: 'कंप्यूटर, टैबलेट या मोबाइल पर इस्तेमाल करें। आपका डेटा हमेशा साथ।' }
      ]
    },
    testimonialsSection: {
      title: 'कारीगर और ठेकेदार क्या कह रहे हैं',
      items: [
        {
          text: '“ÁtriosBuild ने मेरे कोटेशन बनाने का तरीका बदल दिया है। मेरा बहुत समय बचता है और ग्राहक मुझ पर ज़्यादा भरोसा करते हैं।”',
          author: 'कार्लोस मेंडेस',
          role: 'टाइल्स और राजमिस्त्री विशेषज्ञ'
        },
        {
          text: '“आखिरकार मेरे पास सभी प्रोजेक्ट्स और ग्राहकों के भुगतानों का पूरा हिसाब एक ही ऐप में है!”',
          author: 'जॉन रोड्रिग्स',
          role: 'जनरल कॉन्ट्रैक्टर'
        },
        {
          text: '“लोगो वाला पेशेवर PDF कोटेशन ग्राहकों से डील फाइनल करते समय बहुत मदद करता है।”',
          author: 'ब्रूनो सिल्वा',
          role: 'रिनोवेशन विशेषज्ञ'
        }
      ]
    },
    finalCta: {
      title: 'आपका अगला प्रोजेक्ट कहीं अधिक व्यवस्थित रूप से शुरू हो सकता है।',
      subtitle: 'अभी मुफ़्त में शुरुआत करें और अपने दैनिक काम में अंतर महसूस करें।',
      btn: 'मुफ़्त में शुरू करें',
      badge: 'क्रेडिट कार्ड की आवश्यकता नहीं • कोई बाध्यता नहीं'
    },
    footer: {
      desc: 'निर्माण कोटेशन, वर्क ऑर्डर और वित्तीय प्रोजेक्ट नियंत्रण के लिए संपूर्ण सॉफ्टवेयर।',
      product: 'उत्पाद',
      company: 'कंपनी',
      support: 'सहायता',
      features: 'विशेषताएं',
      howItWorks: 'यह कैसे काम करता है',
      pdfEstimates: 'PDF कोटेशन',
      createFreeAccount: 'मुफ़्त खाता बनाएं',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      help: 'मदद और अक्सर पूछे जाने वाले प्रश्न',
      demo: 'डेमो देखें',
      installApp: 'मोबाइल ऐप इंस्टॉल करें',
      rights: 'सर्वाधिकार सुरक्षित।',
      createdBy: 'द्वारा निर्मित'
    },
    demoModal: {
      title: 'ÁtriosBuild इंटरैक्टिव डेमो',
      subtitle: '4 आसान चरणों में एक पूरा कोटेशन कैसे बनाएं',
      step1Tab: 'ग्राहक',
      step2Tab: 'सामग्री',
      step3Tab: 'मजदूरी',
      step4Tab: 'PDF तैयार',
      step1Badge: 'चरण 1: ग्राहक और प्रोजेक्ट का विवरण',
      step1Client: 'ग्राहक का नाम:',
      step1Location: 'प्रोजेक्ट का पता:',
      step1Desc: 'काम का विवरण:',
      step1Footer: 'बस विवरण भरें या पहले से सहेजे गए ग्राहक का चयन करें।',
      step2Badge: 'चरण 2: सामग्री और लागत जोड़ें',
      step2Item1: 'पोर्सिलेन टाइल्स (35 वर्ग मी)',
      step2Item2: 'टाइल एडहेसिव + ग्राउट',
      step2Item3: 'पीवीसी पाइप और फिटिंग',
      step2Footer: 'आपके मुनाफ़े के मार्जिन के साथ कुल राशि तुरंत जुड़ जाती है।',
      step3Badge: 'चरण 3: मजदूरी और समय सीमा',
      step3Item1: 'राजमिस्त्री (30 घंटे)',
      step3Item2: 'कुशल प्लंबर (10 घंटे)',
      step3Total: 'जीएसटी सहित अनुमानित कुल:',
      step4Badge: 'चरण 4: 1-क्लिक में PDF तैयार',
      step4File: 'प्रस्ताव_राहुल_शर्मा.pdf',
      step4Sub: 'आपके लोगो और शर्तों के साथ तैयार',
      step4Footer: '"PDF डाउनलोड करें" पर क्लिक करें या सीधे ग्राहक के व्हाट्सएप पर भेजें!',
      prev: '← पिछला',
      cta: 'पहला मुफ़्त कोटेशन बनाएं →'
    }
  },

  'bn-BD': {
    nav: {
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      whoIsItFor: 'কাদের জন্য',
      pdfEstimates: 'PDF কোটেশন',
      testimonials: 'ব্যবহারকারীদের মতামত',
      login: 'লগইন',
      startFree: 'বিনামূল্যে শুরু করুন'
    },
    hero: {
      badge: 'নির্মাণ ও ট্রেড পেশাদারদের জন্য',
      titlePrefix: 'পেশাদার কোটেশন তৈরি করুন এবং আপনার ',
      titleHighlight: 'কাজের সম্পূর্ণ নিয়ন্ত্রণ রাখুন।',
      subtitle: 'সঠিক কোটেশন তৈরি করুন, ব্র্যান্ডেড PDF প্রস্তাব পাঠান, কাজ, পেমেন্ট এবং লাভের হিসাব রাখুন — সব এক জায়গায়।',
      ctaPrimary: 'আমার প্রথম বিনামূল্যের বাজেট তৈরি করুন',
      ctaSecondary: 'কীভাবে কাজ করে দেখুন',
      badgeFree: 'বিনামূল্যে শুরু',
      badgeFreeSub: 'কোন ক্রেডিট কার্ড লাগবে না',
      badgeFast: 'দ্রুত এবং সহজ',
      badgeFastSub: 'কয়েক মিনিটে বাজেট তৈরি',
      badgeAnywhere: 'যেকোনো জায়গায়',
      badgeAnywhereSub: 'ওয়েব, ট্যাবলেট এবং মোবাইল'
    },
    preview: {
      estimateTitle: 'বাজেট #042',
      statusPending: 'অপেক্ষারত',
      clientLabel: 'গ্রাহক: মো: রফিকুল ইসলাম',
      projectLabel: 'প্রকল্প: রান্নাঘর সংস্কার',
      totalGeneral: 'সর্বমোট হিসাব',
      materialsTitle: '১. সামগ্রী (মেটেরিয়ালস)',
      materialsCount: '৩টি আইটেম',
      material1: 'সিরামিক টাইলস ৬০x৬০ (৪৫ বর্গমিটার)',
      material2: 'টাইল আঠা (১০ ব্যাগ)',
      material3: 'ওয়াটারপ্রুফ গ্রাউট (৫ প্যাকেট)',
      laborTitle: '২. শ্রম মজুরি (লেবার)',
      laborCount: '৩টি সেবা',
      labor1: 'দক্ষ রাজমিস্ত্রি (৪০ ঘণ্টা)',
      labor2: 'প্লাম্বার (১২ ঘণ্টা)',
      labor3: 'ইলেকট্রিশিয়ান (১০ ঘণ্টা)',
      taxIncluded: 'কর ও আনুষঙ্গিক খরচ অন্তর্ভুক্ত',
      generatePdf: 'PDF তৈরি করুন',
      pdfCardTitle: 'PDF প্রস্তাবনা',
      pdfCardReady: 'প্রস্তুত',
      pdfCardSub: 'লোগো, সময়সীমা ও শর্তাবলী সহ',
      downloadPdf: 'PDF ডাউনলোড'
    },
    whoFor: {
      title: 'যারা নির্মাণ কাজের সাথে যুক্ত তাদের জন্য তৈরি।',
      subtitle: 'বিল্ডার, সংস্কারক এবং নির্মাণ কারিগরদের জন্য সহজ ও শক্তিশালী সমাধান।',
      professions: {
        contractors: 'ঠিকাদার (কন্ট্রাক্টর)',
        masons: 'রাজমিস্ত্রি',
        painters: 'পেইন্টার (রং মিস্ত্রি)',
        electricians: 'ইলেকট্রিশিয়ান',
        plumbers: 'প্লাম্বার',
        remodelers: 'সংস্কারক (রেনোভেটর)',
        more: 'এবং আরও অনেক'
      },
      highlightBox: 'আপনি যদি নির্মাণ কাজ করেন এবং কোটেশন তৈরি, কাজের অগ্রগতি ও পেমেন্ট ট্র্যাক করতে চান, তবে ÁtriosBuild আপনার জন্যই তৈরি।'
    },
    comparison: {
      beforeBadge: '❌ পূর্বে',
      beforeTitle: 'আপনি কি এখনও এভাবে কাজ পরিচালনা করছেন?',
      beforeItems: [
        'কাগজে বা জটিল এক্সেল শিটে হিসাব নিকাশ',
        'হোয়াটসঅ্যাপ চ্যাটে দাম ও চুক্তির তথ্য হারিয়ে যাওয়া',
        'গ্রাহকের বকেয়া ও পেমেন্ট ট্র্যাকিংয়ে ঝামেলা',
        'হারিয়ে যাওয়া পরিমাপ ও এলোমেলো ফাইল',
        'প্রতি মাসে মূল্যবান সময় ও টাকার অপচয়'
      ],
      beforeFooter: 'দৈনন্দিন মানসিক চাপ ও পেশাদারিত্বের অভাব',
      afterBadge: '✅ ÁTRIOSBUILD-এর সাথে',
      afterTitle: 'ÁtriosBuild-এর সাথে সবকিছু স্পষ্ট ও সহজ।',
      afterItems: [
        'কয়েক মিনিটে পেশাদার কোটেশন তৈরি',
        'আপনার নিজস্ব লোগো সহ সুন্দর PDF প্রস্তাবনা',
        'প্রকল্পের কাজ, দায়িত্ব ও মালামালের তালিকা এক জায়গায়',
        '১০০% সঠিক গ্রাহক পেমেন্ট ও খরচের ট্র্যাকিং',
        'সবকিছু আপনার ফোনে, সবসময় হাতের নাগালে'
      ],
      afterFooter: 'অধিক মুনাফা ও গ্রাহকের আস্থা',
      tryFree: 'ফ্রি ট্রায়াল দিন'
    },
    workflow: {
      title: 'কোটেশন থেকে চূড়ান্ত পেমেন্ট, সবকিছু এক অ্যাপে।',
      subtitle: 'আপনার কনস্ট্রাকশন কাজ পেশাদারভাবে পরিচালনার একটি সহজ ধাপ।',
      step1Title: 'কোটেশন',
      step1Desc: 'কয়েক মিনিটে মালামাল, লেবার খরচ ও মুনাফার মার্জিন যুক্ত করুন।',
      step2Title: 'প্রস্তাবনা',
      step2Desc: 'আপনার লোগো সহ একটি সুন্দর PDF তৈরি করে গ্রাহককে পাঠান।',
      step3Title: 'কাজের ট্র্যাকিং',
      step3Desc: 'কাজের অগ্রগতি, মিস্ত্রিদের কাজ ও সময়সীমা মনিটর করুন।',
      step4Title: 'পেমেন্ট',
      step4Desc: 'অগ্রিম জমা, বকেয়া হিসাব রেকর্ড করুন এবং লাভ সুরক্ষিত রাখুন।'
    },
    videoSection: {
      eyebrow: 'সরাসরি দেখুন',
      title: '৬০ সেকেন্ডে দেখুন এটি কীভাবে কাজ করে',
      desc: 'একটি সম্পূর্ণ কোটেশন তৈরি করুন, PDF বের করুন এবং ক্লায়েন্টকে পাঠান। দ্রুত, সহজ এবং সম্পূর্ণ পেশাদার।',
      overlayTitle: 'ইন্টারেক্টিভ ডেমো দেখুন (৬০ সেকেন্ড)',
      overlaySub: 'বাস্তব কাজের অভিজ্ঞতা দেখুন',
      ctaBtn: 'ডেমো দেখুন'
    },
    pdfSection: {
      eyebrow: 'পেশাদার ভাবমূর্তি',
      titlePrefix: 'নিজেকে উপস্থাপন করুন একজন ',
      titleHighlight: 'আসল পেশাদার হিসেবে।',
      desc: 'আপনার লোগো, পেমেন্টের শর্ত, বিস্তারিত আইটেম ও মেয়াদের সাথে PDF তৈরি করুন। ক্লায়েন্টের আস্থা অর্জন করুন এবং আরও কাজ পান।',
      bullets: [
        { title: 'আপনার লোগো ও তথ্য সহ PDF', desc: 'প্রতিটি প্রস্তাবে আপনার ব্র্যান্ডের পরিচয় ফুটিয়ে তুলুন।' },
        { title: 'মালামাল ও কাজের বিস্তারিত বিবরণ', desc: 'সম্পূর্ণ স্বচ্ছতা যা ভুল বোঝাবুঝি দূর করে চুক্তি চূড়ান্ত করে।' },
        { title: 'স্পষ্ট পেমেন্ট শিডিউল ও শর্তাবলী', desc: 'অগ্রিম টাকার পরিমাণ ও কাজ সমাপ্তির তারিখ নির্ধারণ করুন।' },
        { title: 'হোয়াটসঅ্যাপ ও ইমেইলে দ্রুত শেয়ার', desc: 'আপনার ক্লায়েন্ট মুহূর্তের মধ্যে একটি পরিষ্কার ও নিরাপদ ডকুমেন্ট পান।' }
      ],
      ctaBtn: 'প্রথম বিনামূল্যের PDF তৈরি করুন',
      docHeader: 'ÁTRIOS কনস্ট্রাকশন',
      docTaxId: 'TIN: 1234567890 • ঢাকা',
      docProposalNo: 'প্রস্তাব নং',
      docClientTitle: 'গ্রাহক',
      docClientName: 'মো: রফিকুল ইসলাম',
      docClientAddress: 'ধানমন্ডি, ঢাকা',
      docDateTitle: 'তারিখ / মেয়াদ',
      docValidity: '৩০ দিনের জন্য কার্যকর',
      docColDesc: 'কাজের বিবরণ',
      docColQty: 'পরিমাণ / দর',
      docColTotal: 'মোট',
      docItem1Title: 'সম্পূর্ণ বাথরুম রেনোভেশন',
      docItem1Sub: 'পুরনো ফিটিংস ভাঙা, প্লাম্বিং ও ফিটিংস স্থাপন',
      docItem1Unit: '১ কাজ',
      docItem2Title: 'অ্যান্টি-ময়েসচার ইন্টেরিয়র পেইন্ট',
      docItem2Sub: 'প্রাইমার সহ ২ কোট রং',
      docItem2Unit: '১২০ বর্গমি',
      docItem3Title: 'এলইডি ইলেকট্রিক ওয়্যারিং',
      docItem3Sub: 'সাব-প্যানেল ও ৮টি স্পট লাইট',
      docItem3Unit: '৮ পয়েন্ট',
      docSubtotal: 'উপ-মোট',
      docTax: 'ভ্যাট (১৫%)',
      docTotal: 'সর্বমোট মূল্য',
      docSignature: 'অনুমোদিত স্বাক্ষর: ____________',
      docCertified: 'প্রত্যয়িত নথি',
      cards: [
        { title: 'কাজের আদেশ (Work Orders)', desc: 'কাজের প্রতিটি ধাপের জন্য পরিষ্কার কাজের আদেশ দিন।' },
        { title: 'আর্থিক প্রতিবেদন', desc: 'মোট জমা, বকেয়া এবং প্রতিটি কাজের আসল মুনাফা জানুন।' },
        { title: 'পেমেন্ট ট্র্যাকিং', desc: 'অগ্রিম টাকা, রসিদ রেকর্ড করুন এবং হিসাব পরিষ্কার রাখুন।' },
        { title: 'যেকোনো ডিভাইস থেকে ব্যবহার', desc: 'কম্পিউটার, ট্যাবলেট বা মোবাইলে চালান। তথ্য সর্বদা সিঙ্ক থাকবে।' }
      ]
    },
    testimonialsSection: {
      title: 'ব্যবহারকারীরা যা বলছেন',
      items: [
        {
          text: '“ÁtriosBuild আমার কোটেশন তৈরির পদ্ধতি পুরোপুরি বদলে দিয়েছে। সময় বাঁচে এবং ক্লায়েন্টরা আমার কাজে অনেক বেশি ভরসা পান।”',
          author: 'কার্লোস মেন্ডেস',
          role: 'টাইলস ও রাজমিস্ত্রি বিশেষজ্ঞ'
        },
        {
          text: '“অবশেষে আমার সব প্রজেক্ট এবং কাস্টমারের পেমেন্টের হিসাব একটি অ্যাপেই সুন্দরভাবে পাচ্ছি!”',
          author: 'জন রদ্রিগেজ',
          role: 'জেনারেল কন্ট্রাক্টর'
        },
        {
          text: '“লোগো সহ পেশাদার PDF কোটেশন ক্লায়েন্টদের সাথে ডিল ফাইনাল করতে দারুণ সাহায্য করে।”',
          author: 'ব্রুনো সিলভা',
          role: 'রেনোভেশন বিশেষজ্ঞ'
        }
      ]
    },
    finalCta: {
      title: 'আপনার পরবর্তী কাজ শুরু হতে পারে অনেক বেশি গুছিয়ে।',
      subtitle: 'এখনই ফ্রিতে শুরু করুন এবং কাজের গতিতে পরিবর্তন অনুভব করুন।',
      btn: 'বিনামূল্যে শুরু করুন',
      badge: 'ক্রেডিট কার্ডের প্রয়োজন নেই • কোনো বাধ্যবাধকতা নেই'
    },
    footer: {
      desc: 'কনস্ট্রাকশন কোটেশন, ওয়ার্ক অর্ডার এবং আর্থিক প্রকল্প নিয়ন্ত্রণের জন্য সম্পূর্ণ সফটওয়্যার।',
      product: 'পণ্য',
      company: 'প্রতিষ্ঠান',
      support: 'সহায়তা',
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      pdfEstimates: 'PDF কোটেশন',
      createFreeAccount: 'ফ্রি অ্যাকাউন্ট খুলুন',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'ব্যবহারের শর্তাবলী',
      help: 'সাহায্য ও সচরাচর জিজ্ঞাসা',
      demo: 'ডেমো দেখুন',
      installApp: 'মোবাইল অ্যাপ ইনস্টল',
      rights: 'সর্বস্বত্ব সংরক্ষিত।',
      createdBy: 'নির্মাতা'
    },
    demoModal: {
      title: 'ÁtriosBuild ইন্টারেক্টিভ ডেমো',
      subtitle: '৪টি সহজ ধাপে কীভাবে সম্পূর্ণ কোটেশন তৈরি করবেন',
      step1Tab: 'গ্রাহক',
      step2Tab: 'মালামাল',
      step3Tab: 'শ্রমিক',
      step4Tab: 'PDF তৈরি',
      step1Badge: 'ধাপ ১: ক্লায়েন্ট ও প্রকল্পের বিবরণ',
      step1Client: 'ক্লায়েন্টের নাম:',
      step1Location: 'প্রকল্পের ঠিকানা:',
      step1Desc: 'কাজের বিবরণ:',
      step1Footer: 'তথ্য পূরণ করুন অথবা সংরক্ষিত গ্রাহক তালিকা থেকে বেছে নিন।',
      step2Badge: 'ধাপ ২: মালামাল ও খরচ যুক্ত করুন',
      step2Item1: 'টাইলস (৩৫ বর্গমিটার)',
      step2Item2: 'টাইল আঠা + গ্রাউট',
      step2Item3: 'পিভিসি পাইপ ও ফিটিংস',
      step2Footer: 'মোট খরচ ও মুনাফার মার্জিন সাথে সাথে হিসাব হয়ে যাবে।',
      step3Badge: 'ধাপ ৩: শ্রম মজুরি ও সময়সীমা',
      step3Item1: 'রাজমিস্ত্রি (৩০ ঘণ্টা)',
      step3Item2: 'দক্ষ প্লাম্বার (১০ ঘণ্টা)',
      step3Total: 'কর সহ আনুমানিক সর্বমোট:',
      step4Badge: 'ধাপ ৪: ১-ক্লিকে প্রস্তুত PDF',
      step4File: 'প্রস্তাবনা_রফিকুল_ইসলাম.pdf',
      step4Sub: 'আপনার লোগো ও শর্তাবলী সহ তৈরি',
      step4Footer: '"PDF ডাউনলোড" এ ক্লিক করুন অথবা সরাসরি গ্রাহকের হোয়াটসঅ্যাপে পাঠান!',
      prev: '← পূর্ববর্তী',
      cta: 'প্রথম বিনামূল্যের বাজেট তৈরি করুন →'
    }
  }
};
