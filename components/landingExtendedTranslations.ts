import { Locale } from '../translations';

export interface LocaleOption {
  value: Locale;
  label: string;
  flag: string;
  shortLabel: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹', shortLabel: 'PT' },
  { value: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷', shortLabel: 'BR' },
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸', shortLabel: 'EN' },
  { value: 'es-ES', label: 'Español', flag: '🇪🇸', shortLabel: 'ES' },
  { value: 'fr-FR', label: 'Français', flag: '🇫🇷', shortLabel: 'FR' },
  { value: 'it-IT', label: 'Italiano', flag: '🇮🇹', shortLabel: 'IT' },
  { value: 'ru-RU', label: 'Русский', flag: '🇷🇺', shortLabel: 'RU' },
  { value: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', shortLabel: 'HI' },
  { value: 'bn-BD', label: 'বাংলা', flag: '🇧🇩', shortLabel: 'BN' },
];

export interface LandingExtended {
  softwareSubtitle: string;
  nav: {
    features: string;
    howItWorks: string;
    forClients: string;
    forPros: string;
    portalClient: string;
    login: string;
    startFree: string;
    register: string;
  };
  hero: {
    bannerPill: string;
    headline: {
      line1: string;
      line2: string;
      line3: string;
      highlight: string;
    };
    subtitle: string;
    clientCard: {
      title: string;
      sub: string;
      portalPrompt: string;
      portalLink: string;
    };
    proCard: {
      title: string;
      sub: string;
      loginPrompt: string;
      loginLink: string;
    };
    video: {
      tabVideo: string;
      tabLive: string;
      badge60s: string;
      duration: string;
      centerBtn: string;
      subText: string;
      step1: string;
      step2: string;
      step3: string;
    };
    trust: {
      secure: string;
      secureSub: string;
      verified: string;
      verifiedSub: string;
      everywhere: string;
      everywhereSub: string;
    };
  };
  steps7: {
    eyebrow: string;
    title: string;
    items: {
      num: string;
      title: string;
      desc: string;
    }[];
  };
  segments: {
    clients: {
      badge: string;
      title: string;
      sub: string;
      bullets: string[];
      previewTitle: string;
      previewBadge: string;
      previewCta: string;
      cta: string;
      portalPrompt: string;
      portalLink: string;
    };
    pro: {
      badge: string;
      title: string;
      sub: string;
      bullets: string[];
      previewTitle: string;
      previewBadge: string;
      stat1Label: string;
      stat1Val: string;
      stat2Label: string;
      stat2Val: string;
      stat3Label: string;
      stat3Val: string;
      cta: string;
    };
  };
  features10: {
    eyebrow: string;
    title: string;
    items: {
      title: string;
      desc: string;
      isNew?: boolean;
      isHighlighted?: boolean;
    }[];
  };
  comparison: {
    before: {
      badge: string;
      title: string;
      items: string[];
    };
    after: {
      badge: string;
      title: string;
      items: string[];
    };
    ctaBanner: {
      title: string;
      sub: string;
      trust: {
        title: string;
        sub: string;
      }[];
      clientTitle: string;
      clientSub: string;
      proTitle: string;
      proSub: string;
    };
  };
  footer: {
    desc: string;
    secure: string;
    product: string;
    company: string;
    support: string;
    features: string;
    howItWorks: string;
    pdfQuotes: string;
    createFree: string;
    privacy: string;
    terms: string;
    help: string;
    demo: string;
    installApp: string;
    clientPortal: string;
    rights: string;
    tagline: string;
  };
}

export const landingExtendedTranslations: Record<Locale, LandingExtended> = {
  'pt-PT': {
    softwareSubtitle: 'SOFTWARE PARA CONSTRUÇÃO CIVIL',
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profissionais',
      portalClient: 'Portal do Cliente (Ver Orçamentos)',
      login: 'ENTRAR',
      startFree: 'CRIAR CONTA GRÁTIS',
      register: 'REGISTAR'
    },
    hero: {
      bannerPill: 'VER BANNERS DE APRESENTAÇÃO DAS FUNÇÕES',
      headline: {
        line1: 'Encontre clientes.',
        line2: 'Faça orçamentos.',
        line3: 'Gerencie as suas obras.',
        highlight: 'Tudo num só lugar com o Atrios Build.'
      },
      subtitle: 'Receba pedidos de orçamento de clientes, envie propostas profissionais e tenha todas as ferramentas para gerir o seu negócio e as suas obras.',
      clientCard: {
        title: 'PEDIR ORÇAMENTO GRÁTIS',
        sub: 'Sou cliente e preciso de uma obra',
        portalPrompt: 'Já pediu orçamento?',
        portalLink: 'Portal do Cliente'
      },
      proCard: {
        title: 'SOU PROFISSIONAL',
        sub: 'Quero receber pedidos e gerir obras',
        loginPrompt: 'Já tem conta?',
        loginLink: 'Login Profissional'
      },
      video: {
        tabVideo: 'VÍDEO HERO',
        tabLive: 'EM DIRETO',
        badge60s: '60 SEGUNDOS',
        duration: '01:45 MIN',
        centerBtn: 'VER DEMONSTRAÇÃO COMPLETA',
        subText: 'Clique para assistir como funciona o Atrios Build',
        step1: 'Pedidos',
        step2: 'Propostas',
        step3: 'Gestão'
      },
      trust: {
        secure: 'Seguro e confiável',
        secureSub: 'Os seus dados protegidos',
        verified: 'Profissionais verificados',
        verifiedSub: 'Mais segurança para si',
        everywhere: 'Acesso em qualquer lugar',
        everywhereSub: 'Web e App mobile'
      }
    },
    steps7: {
      eyebrow: 'DO PRIMEIRO CONTACTO AO RESULTADO DA OBRA',
      title: 'Como funciona para todos',
      items: [
        { num: '01', title: 'Cliente solicita um orçamento', desc: 'O cliente descreve o que precisa e envia o pedido.' },
        { num: '02', title: 'Profissional recebe o pedido', desc: 'Empresas e profissionais da plataforma são notificados.' },
        { num: '03', title: 'Profissional prepara a proposta', desc: 'Analisa os detalhes da obra e prepara o orçamento.' },
        { num: '04', title: 'Profissional envia a proposta', desc: 'O cliente recebe a proposta e pode tirar dúvidas.' },
        { num: '05', title: 'Cliente analisa e escolhe', desc: 'Compara as propostas e escolhe o profissional ideal.' },
        { num: '06', title: 'Obra é criada no Atrios Build', desc: 'O profissional inicia a obra e organiza tudo na plataforma.' },
        { num: '07', title: 'Gere e acompanhe os resultados', desc: 'Controle custos, pagamentos e veja os resultados.' }
      ]
    },
    segments: {
      clients: {
        badge: 'PARA CLIENTES',
        title: 'Precisa de uma obra?',
        sub: 'Encontre profissionais qualificados na nossa plataforma.',
        bullets: [
          'Faça o seu pedido de orçamento grátis',
          'Explique o serviço que precisa',
          'Indique a localização e detalhes da obra',
          'Receba propostas de profissionais verificados',
          'Acompanhe os seus pedidos em tempo real',
          'Escolha a melhor proposta para o seu projeto'
        ],
        previewTitle: 'Receba propostas',
        previewBadge: '3 Propostas',
        previewCta: 'VER TODAS AS PROPOSTAS →',
        cta: 'PEDIR ORÇAMENTO GRÁTIS',
        portalPrompt: 'Já pediu orçamento? Entrar no Portal do Cliente',
        portalLink: 'Portal do Cliente'
      },
      pro: {
        badge: 'PARA PROFISSIONAIS',
        title: 'Transforme pedidos de orçamento em novas oportunidades.',
        sub: 'Receba pedidos, feche obras e gerencie tudo no mesmo lugar.',
        bullets: [
          'Receba novos pedidos de orçamento',
          'Consulte detalhes e localização da obra',
          'Analise e prepare o seu orçamento',
          'Envie propostas de forma profissional',
          'Organize obras, clientes e documentos',
          'Acompanhe pagamentos e resultados',
          'Tudo numa única plataforma'
        ],
        previewTitle: 'Resumo do mês',
        previewBadge: '+24% este mês',
        stat1Label: 'Faturação',
        stat1Val: '18.650 €',
        stat2Label: 'Obras',
        stat2Val: '8 Ativas',
        stat3Label: 'Pedidos',
        stat3Val: '12 Novos',
        cta: 'QUERO RECEBER PEDIDOS'
      }
    },
    features10: {
      eyebrow: 'TUDO O QUE PRECISA PARA GERIR O SEU NEGÓCIO',
      title: 'Funcionalidades completas para o dia a dia',
      items: [
        { title: 'Orçamentos', desc: 'Crie orçamentos e propostas profissionais em minutos.' },
        { title: 'Obras', desc: 'Acompanhe o progresso de cada obra em tempo real.' },
        { title: 'Clientes', desc: 'Organize clientes e fornecedores num só lugar.', isHighlighted: true },
        { title: 'Serviços', desc: 'Gerencie serviços, materiais e mão de obra.' },
        { title: 'Pagamentos', desc: 'Controle recebimentos e pagamentos.' },
        { title: 'Relatórios', desc: 'Relatórios e indicadores para melhores decisões.' },
        { title: 'Pedidos de orçamento', desc: 'Receba solicitações de clientes diretamente na plataforma.', isNew: true },
        { title: 'Propostas', desc: 'Envie propostas e acompanhe o interesse do cliente.', isNew: true },
        { title: 'Documentos', desc: 'Guarde e acesse documentos da obra com segurança.' },
        { title: 'App mobile', desc: 'Acesse de qualquer lugar pelo telemóvel.' }
      ]
    },
    comparison: {
      before: {
        badge: 'ANTES ERA ASSIM...',
        title: 'Antes era assim...',
        items: [
          'Pedidos espalhados pelo WhatsApp e chamadas',
          'Orçamentos em papel ou planilhas',
          'Informações desorganizadas',
          'Dificuldade para acompanhar clientes',
          'Pouco controle dos resultados'
        ]
      },
      after: {
        badge: 'AGORA É ASSIM COM ATRIOS BUILD',
        title: 'Agora é assim com Atrios Build',
        items: [
          'Pedidos organizados num só lugar',
          'Propostas profissionais e centralizadas',
          'Clientes e obras organizados',
          'Mais controle de custos e pagamentos',
          'Mais tempo e mais lucro para o seu negócio'
        ]
      },
      ctaBanner: {
        title: 'A plataforma completa para profissionais da construção civil.',
        sub: 'Mais organização, mais oportunidades e mais resultados. Comece agora com o Atrios Build.',
        trust: [
          { title: 'Segurança total', sub: 'Seus dados protegidos' },
          { title: 'Suporte dedicado', sub: 'Estamos aqui para ajudar' },
          { title: 'Atualizações', sub: 'Sempre melhor para si' },
          { title: '+ Profissionais', sub: 'Plataforma em crescimento' }
        ],
        clientTitle: 'PEDIR ORÇAMENTO GRÁTIS',
        clientSub: 'SOU CLIENTE E PRECISO DE UMA OBRA',
        proTitle: 'QUERO SER PROFISSIONAL',
        proSub: 'RECEBER PEDIDOS E GERIR OBRAS'
      }
    },
    footer: {
      desc: 'A plataforma completa para gestão de orçamentos, ordens de serviço e controlo financeiro de obras.',
      secure: 'Dados seguros e encriptados',
      product: 'PRODUTO',
      company: 'EMPRESA',
      support: 'SUPORTE',
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      pdfQuotes: 'Orçamentos PDF',
      createFree: 'Criar Conta Grátis →',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      help: 'Ajuda e Dúvidas',
      demo: 'Ver Demonstração',
      installApp: 'Instalar App Mobile',
      clientPortal: 'Portal do Cliente (Login)',
      rights: 'Todos os direitos reservados.',
      tagline: 'Desenvolvido com excelência para profissionais da construção civil.'
    }
  },

  'pt-BR': {
    softwareSubtitle: 'SOFTWARE PARA CONSTRUÇÃO CIVIL',
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profissionais',
      portalClient: 'Portal do Cliente (Ver Orçamentos)',
      login: 'ENTRAR',
      startFree: 'CRIAR CONTA GRÁTIS',
      register: 'CADASTRAR'
    },
    hero: {
      bannerPill: 'VER BANNERS DE APRESENTAÇÃO DAS FUNÇÕES',
      headline: {
        line1: 'Encontre clientes.',
        line2: 'Faça orçamentos.',
        line3: 'Gerencie suas obras.',
        highlight: 'Tudo em um só lugar com o Atrios Build.'
      },
      subtitle: 'Receba solicitações de orçamento de clientes, envie propostas profissionais e tenha todas as ferramentas para gerenciar seu negócio e suas obras.',
      clientCard: {
        title: 'PEDIR ORÇAMENTO GRÁTIS',
        sub: 'Sou cliente e preciso de uma obra',
        portalPrompt: 'Já pediu orçamento?',
        portalLink: 'Portal do Cliente'
      },
      proCard: {
        title: 'SOU PROFISSIONAL',
        sub: 'Quero receber pedidos e gerenciar obras',
        loginPrompt: 'Já tem conta?',
        loginLink: 'Login Profissional'
      },
      video: {
        tabVideo: 'VÍDEO HERO',
        tabLive: 'AO VIVO',
        badge60s: '60 SEGUNDOS',
        duration: '01:45 MIN',
        centerBtn: 'VER DEMONSTRAÇÃO COMPLETA',
        subText: 'Clique para assistir como funciona o Atrios Build',
        step1: 'Pedidos',
        step2: 'Propostas',
        step3: 'Gestão'
      },
      trust: {
        secure: 'Seguro e confiável',
        secureSub: 'Seus dados protegidos',
        verified: 'Profissionais verificados',
        verifiedSub: 'Mais segurança para você',
        everywhere: 'Acesso em qualquer lugar',
        everywhereSub: 'Web e App celular'
      }
    },
    steps7: {
      eyebrow: 'DO PRIMEIRO CONTATO AO RESULTADO DA OBRA',
      title: 'Como funciona para todos',
      items: [
        { num: '01', title: 'Cliente solicita um orçamento', desc: 'O cliente descreve o que precisa e envia o pedido.' },
        { num: '02', title: 'Profissional recebe o pedido', desc: 'Empresas e profissionais da plataforma são notificados.' },
        { num: '03', title: 'Profissional prepara a proposta', desc: 'Analisa os detalhes da obra e prepara o orçamento.' },
        { num: '04', title: 'Profissional envia a proposta', desc: 'O cliente recebe a proposta e pode tirar dúvidas.' },
        { num: '05', title: 'Cliente analisa e escolhe', desc: 'Compara as propostas e escolhe o profissional ideal.' },
        { num: '06', title: 'Obra é criada no Atrios Build', desc: 'O profissional inicia a obra e organiza tudo na plataforma.' },
        { num: '07', title: 'Gerencie e acompanhe os resultados', desc: 'Controle custos, pagamentos e veja os lucros.' }
      ]
    },
    segments: {
      clients: {
        badge: 'PARA CLIENTES',
        title: 'Precisa de uma reforma ou obra?',
        sub: 'Encontre profissionais qualificados na nossa plataforma.',
        bullets: [
          'Faça seu pedido de orçamento grátis',
          'Explique o serviço que você precisa',
          'Indique a localização e detalhes do projeto',
          'Receba propostas de profissionais verificados',
          'Acompanhe seus pedidos em tempo real',
          'Escolha a melhor proposta para o seu bolso'
        ],
        previewTitle: 'Receba propostas',
        previewBadge: '3 Propostas',
        previewCta: 'VER TODAS AS PROPOSTAS →',
        cta: 'PEDIR ORÇAMENTO GRÁTIS',
        portalPrompt: 'Já pediu orçamento? Entrar no Portal do Cliente',
        portalLink: 'Portal do Cliente'
      },
      pro: {
        badge: 'PARA PROFISSIONAIS',
        title: 'Transforme pedidos de orçamento em novos contratos.',
        sub: 'Receba pedidos, feche obras e gerencie tudo no mesmo lugar.',
        bullets: [
          'Receba novos pedidos de orçamento',
          'Consulte detalhes e localização da obra',
          'Analise e prepare o seu orçamento',
          'Envie propostas em PDF com sua marca',
          'Organize obras, clientes e materiais',
          'Acompanhe recebimentos e fluxo de caixa',
          'Tudo em uma única plataforma'
        ],
        previewTitle: 'Resumo do mês',
        previewBadge: '+24% este mês',
        stat1Label: 'Faturamento',
        stat1Val: 'R$ 68.500',
        stat2Label: 'Obras',
        stat2Val: '8 Ativas',
        stat3Label: 'Pedidos',
        stat3Val: '12 Novos',
        cta: 'QUERO RECEBER PEDIDOS'
      }
    },
    features10: {
      eyebrow: 'TUDO O QUE VOCÊ PRECISA PARA GERENCIAR SEU NEGÓCIO',
      title: 'Funcionalidades completas para o dia a dia',
      items: [
        { title: 'Orçamentos', desc: 'Crie orçamentos e propostas profissionais em minutos.' },
        { title: 'Obras', desc: 'Acompanhe o andamento de cada obra em tempo real.' },
        { title: 'Clientes', desc: 'Organize clientes e fornecedores em um só lugar.', isHighlighted: true },
        { title: 'Serviços', desc: 'Gerencie serviços, materiais e mão de obra.' },
        { title: 'Pagamentos', desc: 'Controle recebimentos e pagamentos.' },
        { title: 'Relatórios', desc: 'Relatórios e indicadores para melhores decisões.' },
        { title: 'Pedidos de orçamento', desc: 'Receba solicitações de clientes direto na plataforma.', isNew: true },
        { title: 'Propostas', desc: 'Envie propostas e acompanhe o interesse do cliente.', isNew: true },
        { title: 'Documentos', desc: 'Guarde e acesse fotos e documentos da obra com segurança.' },
        { title: 'App celular', desc: 'Acesse de qualquer lugar pelo celular ou tablet.' }
      ]
    },
    comparison: {
      before: {
        badge: 'ANTES ERA ASSIM...',
        title: 'Antes era assim...',
        items: [
          'Pedidos perdidos no WhatsApp e anotações',
          'Orçamentos em papel ou planilhas confusas',
          'Informações desorganizadas',
          'Dificuldade para cobrar clientes',
          'Sem clareza do lucro real da obra'
        ]
      },
      after: {
        badge: 'AGORA É ASSIM COM ATRIOS BUILD',
        title: 'Agora é assim com Atrios Build',
        items: [
          'Pedidos centralizados em um só lugar',
          'Propostas profissionais em PDF com 1 clique',
          'Clientes e obras 100% organizados',
          'Controle total de custos e pagamentos',
          'Mais tempo livre e mais lucro no seu bolso'
        ]
      },
      ctaBanner: {
        title: 'A plataforma completa para profissionais da construção civil.',
        sub: 'Mais organização, mais clientes e mais lucro. Comece agora com o Atrios Build.',
        trust: [
          { title: 'Segurança total', sub: 'Seus dados protegidos' },
          { title: 'Suporte dedicado', sub: 'Estamos aqui para ajudar' },
          { title: 'Atualizações', sub: 'Melhorias constantes' },
          { title: '+ Profissionais', sub: 'Comunidade em crescimento' }
        ],
        clientTitle: 'PEDIR ORÇAMENTO GRÁTIS',
        clientSub: 'SOU CLIENTE E PRECISO DE UMA OBRA',
        proTitle: 'QUERO SER PROFISSIONAL',
        proSub: 'RECEBER PEDIDOS E GERENCIAR OBRAS'
      }
    },
    footer: {
      desc: 'A plataforma completa para gestão de orçamentos, ordens de serviço e controle financeiro de obras.',
      secure: 'Dados seguros e criptografados',
      product: 'PRODUTO',
      company: 'EMPRESA',
      support: 'SUPORTE',
      features: 'Funcionalidades',
      howItWorks: 'Como Funciona',
      pdfQuotes: 'Orçamentos PDF',
      createFree: 'Criar Conta Grátis →',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      help: 'Ajuda e Dúvidas',
      demo: 'Ver Demonstração',
      installApp: 'Instalar App Mobile',
      clientPortal: 'Portal do Cliente (Login)',
      rights: 'Todos os direitos reservados.',
      tagline: 'Desenvolvido com excelência para profissionais da construção civil.'
    }
  },

  'en-US': {
    softwareSubtitle: 'CONSTRUCTION MANAGEMENT SOFTWARE',
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      forClients: 'For Clients',
      forPros: 'For Professionals',
      portalClient: 'Client Portal (View Quotes)',
      login: 'LOG IN',
      startFree: 'START FREE',
      register: 'SIGN UP'
    },
    hero: {
      bannerPill: 'VIEW FEATURE PRESENTATION BANNERS',
      headline: {
        line1: 'Find clients.',
        line2: 'Build estimates.',
        line3: 'Manage your projects.',
        highlight: 'All in one place with Atrios Build.'
      },
      subtitle: 'Receive quote requests from homeowners, send branded PDF proposals, and access full project management tools in one intuitive platform.',
      clientCard: {
        title: 'REQUEST FREE QUOTE',
        sub: 'I need work done on my property',
        portalPrompt: 'Already requested a quote?',
        portalLink: 'Client Portal'
      },
      proCard: {
        title: "I'M A PROFESSIONAL",
        sub: 'I want leads & project management',
        loginPrompt: 'Already have an account?',
        loginLink: 'Pro Login'
      },
      video: {
        tabVideo: 'HERO VIDEO',
        tabLive: 'LIVE DEMO',
        badge60s: '60 SECONDS',
        duration: '01:45 MIN',
        centerBtn: 'WATCH FULL DEMO',
        subText: 'Click to watch how Atrios Build works in action',
        step1: 'Requests',
        step2: 'Proposals',
        step3: 'Management'
      },
      trust: {
        secure: 'Secure & trusted',
        secureSub: 'Bank-grade data encryption',
        verified: 'Verified trades & pros',
        verifiedSub: 'Peace of mind guaranteed',
        everywhere: 'Access anywhere',
        everywhereSub: 'Web, Tablet & Mobile App'
      }
    },
    steps7: {
      eyebrow: 'FROM FIRST CONTACT TO PROJECT COMPLETION',
      title: 'How it works for everyone',
      items: [
        { num: '01', title: 'Client requests a quote', desc: 'The client describes their project details and submits.' },
        { num: '02', title: 'Professional receives lead', desc: 'Vetted trades and contractors in the area are notified.' },
        { num: '03', title: 'Pro builds the estimate', desc: 'Analyzes materials, labor hours and calculates pricing.' },
        { num: '04', title: 'Pro sends branded PDF', desc: 'The client receives a crystal-clear proposal document.' },
        { num: '05', title: 'Client reviews & approves', desc: 'Compares estimates and chooses the best contractor.' },
        { num: '06', title: 'Project created in Atrios', desc: 'Contractor starts the job and organizes tasks in app.' },
        { num: '07', title: 'Track payments & profits', desc: 'Monitor material expenses, invoices, and net margin.' }
      ]
    },
    segments: {
      clients: {
        badge: 'FOR CLIENTS',
        title: 'Need renovation or construction work?',
        sub: 'Connect with reliable, verified trade professionals in your area.',
        bullets: [
          'Submit your quote request 100% free',
          'Describe the exact work you need done',
          'Add location details and photos',
          'Receive detailed proposals from verified contractors',
          'Track your project requests in real-time',
          'Pick the best quote for your budget'
        ],
        previewTitle: 'Receive quotes',
        previewBadge: '3 Quotes',
        previewCta: 'VIEW ALL PROPOSALS →',
        cta: 'REQUEST FREE QUOTE',
        portalPrompt: 'Already requested a quote? Open Client Portal',
        portalLink: 'Client Portal'
      },
      pro: {
        badge: 'FOR PROFESSIONALS',
        title: 'Turn project inquiries into profitable contracts.',
        sub: 'Win new leads, close jobs, and manage your entire business in one place.',
        bullets: [
          'Receive fresh job leads in your area',
          'Inspect job scope, photos, and client details',
          'Create itemized estimates with 1 click',
          'Send branded PDF quotes with your logo',
          'Manage tasks, materials, and work orders',
          'Track milestone payments and client invoices',
          'All inside one unified software'
        ],
        previewTitle: 'Monthly Overview',
        previewBadge: '+24% this month',
        stat1Label: 'Revenue',
        stat1Val: '$18,650',
        stat2Label: 'Projects',
        stat2Val: '8 Active',
        stat3Label: 'Leads',
        stat3Val: '12 New',
        cta: 'START RECEIVING LEADS'
      }
    },
    features10: {
      eyebrow: 'EVERYTHING YOU NEED TO RUN YOUR BUSINESS',
      title: 'Complete features for your daily operations',
      items: [
        { title: 'Estimates & Quotes', desc: 'Create accurate, professional bids in minutes.' },
        { title: 'Project Tracking', desc: 'Monitor job site progress and milestones in real-time.' },
        { title: 'Client Directory', desc: 'Organize customers, suppliers, and contacts.', isHighlighted: true },
        { title: 'Labor & Materials', desc: 'Track trade hours, unit rates, and inventory costs.' },
        { title: 'Invoicing & Payments', desc: 'Control incoming payments and project receivables.' },
        { title: 'Profit Reports', desc: 'Real-time financial analytics and margin calculation.' },
        { title: 'Quote Requests', desc: 'Receive inquiries directly from homeowners in your area.', isNew: true },
        { title: 'PDF Proposals', desc: 'Generate high-converting PDF proposals with legal terms.', isNew: true },
        { title: 'Document Vault', desc: 'Safely store contracts, photos, and job receipts.' },
        { title: 'Mobile App', desc: 'Full-featured access from your phone or tablet.' }
      ]
    },
    comparison: {
      before: {
        badge: 'BEFORE ATRIOS...',
        title: 'Before Atrios...',
        items: [
          'Quote requests scattered across texts, email & calls',
          'Messy paper notes or complex spreadsheets',
          'Disorganized project details and lost receipts',
          'Difficulty tracking client payment schedules',
          'No clear visibility into actual job profitability'
        ]
      },
      after: {
        badge: 'NOW WITH ATRIOS BUILD',
        title: 'Now with Atrios Build',
        items: [
          'All project inquiries organized in one clean inbox',
          'Branded PDF proposals generated in 60 seconds',
          'Clients, tasks, and job sites 100% structured',
          'Real-time cash flow and payment milestone alerts',
          'Save 10+ hours per week and boost your profit margins'
        ]
      },
      ctaBanner: {
        title: 'The complete software suite for trades & construction pros.',
        sub: 'More organization, higher win rates, and higher profits. Get started free with Atrios Build.',
        trust: [
          { title: 'Total Security', sub: 'Encrypted cloud backup' },
          { title: 'Dedicated Support', sub: 'Here to help you grow' },
          { title: 'Regular Updates', sub: 'Continuous improvements' },
          { title: 'Growing Network', sub: 'Thousands of active pros' }
        ],
        clientTitle: 'REQUEST FREE ESTIMATE',
        clientSub: 'I NEED A TRADE PROFESSIONAL',
        proTitle: 'JOIN AS A CONTRACTOR',
        proSub: 'GET LEADS & MANAGE PROJECTS'
      }
    },
    footer: {
      desc: 'The complete construction estimate, project management, and financial control platform for modern builders.',
      secure: 'Secure & encrypted data',
      product: 'PRODUCT',
      company: 'COMPANY',
      support: 'SUPPORT',
      features: 'Features',
      howItWorks: 'How It Works',
      pdfQuotes: 'PDF Quotes',
      createFree: 'Create Free Account →',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      help: 'Help & FAQ',
      demo: 'Watch Demo',
      installApp: 'Install Mobile App',
      clientPortal: 'Client Portal (Login)',
      rights: 'All rights reserved.',
      tagline: 'Crafted with precision for construction professionals.'
    }
  },

  'es-ES': {
    softwareSubtitle: 'SOFTWARE PARA LA CONSTRUCCIÓN CIVIL',
    nav: {
      features: 'Funciones',
      howItWorks: 'Cómo funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profesionales',
      portalClient: 'Portal del Cliente (Ver Presupuestos)',
      login: 'ENTRAR',
      startFree: 'CREAR CUENTA GRATIS',
      register: 'REGISTRARSE'
    },
    hero: {
      bannerPill: 'VER BANNERS DE PRESENTACIÓN DE FUNCIONES',
      headline: {
        line1: 'Encuentre clientes.',
        line2: 'Cree presupuestos.',
        line3: 'Gestione sus obras.',
        highlight: 'Todo en un solo lugar con Atrios Build.'
      },
      subtitle: 'Reciba solicitudes de presupuesto, envíe propuestas en PDF profesionales y tenga todas las herramientas para gestionar su negocio y sus obras.',
      clientCard: {
        title: 'SOLICITAR PRESUPUESTO GRATIS',
        sub: 'Soy cliente y necesito una obra o reforma',
        portalPrompt: '¿Ya solicitó presupuesto?',
        portalLink: 'Portal del Cliente'
      },
      proCard: {
        title: 'SOY PROFESIONAL',
        sub: 'Quiero recibir solicitudes y gestionar obras',
        loginPrompt: '¿Ya tiene cuenta?',
        loginLink: 'Login Profesional'
      },
      video: {
        tabVideo: 'VÍDEO HERO',
        tabLive: 'EN VIVO',
        badge60s: '60 SEGUNDOS',
        duration: '01:45 MIN',
        centerBtn: 'VER DEMOSTRACIÓN COMPLETA',
        subText: 'Haga clic para ver cómo funciona Atrios Build',
        step1: 'Solicitudes',
        step2: 'Propuestas',
        step3: 'Gestión'
      },
      trust: {
        secure: 'Seguro y confiable',
        secureSub: 'Sus datos protegidos',
        verified: 'Profesionales verificados',
        verifiedSub: 'Mayor seguridad para usted',
        everywhere: 'Acceso en cualquier lugar',
        everywhereSub: 'Web y App móvil'
      }
    },
    steps7: {
      eyebrow: 'DEL PRIMER CONTACTO AL RESULTADO DE LA OBRA',
      title: 'Cómo funciona para todos',
      items: [
        { num: '01', title: 'El cliente solicita un presupuesto', desc: 'El cliente describe lo que necesita y envía su solicitud.' },
        { num: '02', title: 'El profesional recibe la solicitud', desc: 'Las empresas y profesionales de la plataforma son notificados.' },
        { num: '03', title: 'El profesional prepara la propuesta', desc: 'Analiza los detalles de la obra y prepara el presupuesto.' },
        { num: '04', title: 'Envío de propuesta profesional', desc: 'El cliente recibe una propuesta clara con su marca.' },
        { num: '05', title: 'El cliente analiza y aprueba', desc: 'Compara las propuestas y elige al profesional ideal.' },
        { num: '06', title: 'La obra se crea en Atrios Build', desc: 'El profesional inicia la obra y organiza todo en la plataforma.' },
        { num: '07', title: 'Gestione y controle los resultados', desc: 'Controle costes, cobros y vea el beneficio real de la obra.' }
      ]
    },
    segments: {
      clients: {
        badge: 'PARA CLIENTES',
        title: '¿Necesita una reforma u obra?',
        sub: 'Encuentre profesionales cualificados en nuestra plataforma.',
        bullets: [
          'Solicite su presupuesto 100% gratis',
          'Explique el servicio que necesita',
          'Indique la ubicación y detalles de la obra',
          'Reciba propuestas de profesionales verificados',
          'Siga sus solicitudes en tiempo real',
          'Elija la mejor propuesta para su proyecto'
        ],
        previewTitle: 'Reciba propuestas',
        previewBadge: '3 Propuestas',
        previewCta: 'VER TODAS LAS PROPUESTAS →',
        cta: 'SOLICITAR PRESUPUESTO GRATIS',
        portalPrompt: '¿Ya solicitó presupuesto? Entrar al Portal del Cliente',
        portalLink: 'Portal del Cliente'
      },
      pro: {
        badge: 'PARA PROFESIONALES',
        title: 'Transforme solicitudes de presupuesto en nuevas oportunidades.',
        sub: 'Reciba pedidos, cierre obras y gestione todo en el mismo lugar.',
        bullets: [
          'Reciba nuevas solicitudes de presupuesto',
          'Consulte detalles y ubicación de la obra',
          'Analice y prepare su presupuesto en minutos',
          'Envíe propuestas en PDF con su logotipo',
          'Organice obras, clientes y documentos',
          'Controle pagos y resultados financieros',
          'Todo en una única plataforma'
        ],
        previewTitle: 'Resumen del mes',
        previewBadge: '+24% este mes',
        stat1Label: 'Facturación',
        stat1Val: '18.650 €',
        stat2Label: 'Obras',
        stat2Val: '8 Activas',
        stat3Label: 'Solicitudes',
        stat3Val: '12 Nuevas',
        cta: 'QUIERO RECIBIR SOLICITUDES'
      }
    },
    features10: {
      eyebrow: 'TODO LO QUE NECESITA PARA GESTIONAR SU NEGOCIO',
      title: 'Funcionalidades completas para el día a día',
      items: [
        { title: 'Presupuestos', desc: 'Cree presupuestos y propuestas profesionales en minutos.' },
        { title: 'Obras', desc: 'Siga el progreso de cada obra en tiempo real.' },
        { title: 'Clientes', desc: 'Organice clientes y proveedores en un solo lugar.', isHighlighted: true },
        { title: 'Servicios', desc: 'Gestione servicios, materiales y mano de obra.' },
        { title: 'Pagos', desc: 'Controle cobros y pagos de cada proyecto.' },
        { title: 'Informes', desc: 'Informes y métricas para tomar mejores decisiones.' },
        { title: 'Solicitudes de obra', desc: 'Reciba solicitudes de clientes directamente en la plataforma.', isNew: true },
        { title: 'Propuestas', desc: 'Envíe propuestas y conozca el interés del cliente.', isNew: true },
        { title: 'Documentos', desc: 'Guarde y acceda a documentos y fotos con total seguridad.' },
        { title: 'App móvil', desc: 'Acceda desde cualquier lugar con su móvil o tablet.' }
      ]
    },
    comparison: {
      before: {
        badge: 'ANTES ERA ASÍ...',
        title: 'Antes era así...',
        items: [
          'Solicitudes dispersas en WhatsApp y llamadas',
          'Presupuestos en papel o tablas de Excel desordenadas',
          'Información desorganizada y datos perdidos',
          'Dificultad para hacer seguimiento a clientes',
          'Sin control claro de los beneficios reales'
        ]
      },
      after: {
        badge: 'AHORA ES ASÍ CON ATRIOS BUILD',
        title: 'Ahora es así con Atrios Build',
        items: [
          'Solicitudes organizadas en un solo lugar',
          'Propuestas profesionales en PDF listas en segundos',
          'Clientes, materiales y obras 100% organizados',
          'Mayor control de costes y cobros pendientes',
          'Más tiempo libre y más rentabilidad para su empresa'
        ]
      },
      ctaBanner: {
        title: 'La plataforma completa para profesionales de la construcción.',
        sub: 'Más organización, más clientes y más resultados. Comience ahora gratis con Atrios Build.',
        trust: [
          { title: 'Seguridad total', sub: 'Datos encriptados' },
          { title: 'Soporte dedicado', sub: 'Estamos para ayudarle' },
          { title: 'Actualizaciones', sub: 'Siempre mejorando' },
          { title: '+ Profesionales', sub: 'Plataforma en expansión' }
        ],
        clientTitle: 'SOLICITAR PRESUPUESTO GRATIS',
        clientSub: 'SOY CLIENTE Y NECESITO UNA OBRA',
        proTitle: 'QUIERO SER PROFESIONAL',
        proSub: 'RECIBIR SOLICITUDES Y GESTIONAR OBRAS'
      }
    },
    footer: {
      desc: 'La plataforma integral para gestión de presupuestos, órdenes de trabajo y control financiero de obras.',
      secure: 'Datos seguros y encriptados',
      product: 'PRODUCTO',
      company: 'EMPRESA',
      support: 'SOPORTE',
      features: 'Funciones',
      howItWorks: 'Cómo Funciona',
      pdfQuotes: 'Presupuestos PDF',
      createFree: 'Crear Cuenta Gratis →',
      privacy: 'Privacidad',
      terms: 'Términos de Uso',
      help: 'Ayuda y Preguntas',
      demo: 'Ver Demostración',
      installApp: 'Instalar App Móvil',
      clientPortal: 'Portal del Cliente (Login)',
      rights: 'Todos los derechos reservados.',
      tagline: 'Desarrollado con excelencia para profesionales de la construcción.'
    }
  },

  'fr-FR': {
    softwareSubtitle: 'LOGICIEL DE GESTION DE CHANTIER',
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      forClients: 'Pour les Clients',
      forPros: 'Pour les Professionnels',
      portalClient: 'Portail Client (Voir Devis)',
      login: 'CONNEXION',
      startFree: 'COMMENCER GRATUITEMENT',
      register: "S'INSCRIRE"
    },
    hero: {
      bannerPill: 'VOIR LES BANNIÈRES DE DÉMONSTRATION',
      headline: {
        line1: 'Trouvez des clients.',
        line2: 'Créez vos devis.',
        line3: 'Gérez vos chantiers.',
        highlight: 'Tout au même endroit avec Atrios Build.'
      },
      subtitle: 'Recevez des demandes de devis, envoyez des propositions PDF professionnelles et pilotez tous vos chantiers sur une seule plateforme intuitive.',
      clientCard: {
        title: 'DEMANDER UN DEVIS GRATUIT',
        sub: "J'ai un projet de travaux ou de rénovation",
        portalPrompt: 'Déjà demandé un devis ?',
        portalLink: 'Portail Client'
      },
      proCard: {
        title: 'JE SUIS PROFESSIONNEL',
        sub: 'Recevoir des demandes et gérer mes chantiers',
        loginPrompt: 'Déjà un compte ?',
        loginLink: 'Connexion Pro'
      },
      video: {
        tabVideo: 'VIDÉO HERO',
        tabLive: 'EN DIRECT',
        badge60s: '60 SECONDES',
        duration: '01:45 MIN',
        centerBtn: 'VOIR LA DÉMO COMPLÈTE',
        subText: 'Cliquez pour découvrir le fonctionnement d’Atrios Build',
        step1: 'Demandes',
        step2: 'Devis',
        step3: 'Gestion'
      },
      trust: {
        secure: 'Sécurisé et fiable',
        secureSub: 'Vos données protégées',
        verified: 'Artisans vérifiés',
        verifiedSub: 'Plus de sérénité pour vous',
        everywhere: 'Accessible partout',
        everywhereSub: 'Web, Tablette et Mobile'
      }
    },
    steps7: {
      eyebrow: 'DU PREMIER CONTACT À LA FIN DU CHANTIER',
      title: 'Comment ça marche pour tous',
      items: [
        { num: '01', title: 'Le client dépose sa demande', desc: 'Il décrit son projet et soumet sa demande de devis.' },
        { num: '02', title: 'L’artisan reçoit l’opportunité', desc: 'Les entreprises qualifiées du secteur sont notifiées.' },
        { num: '03', title: 'L’artisan prépare son offre', desc: 'Calcule les matériaux, la main-d’œuvre et les marges.' },
        { num: '04', title: 'Envoi du devis PDF soigné', desc: 'Le client reçoit une proposition claire avec logo.' },
        { num: '05', title: 'Le client valide et choisit', desc: 'Compare les devis et choisit le meilleur professionnel.' },
        { num: '06', title: 'Le chantier démarre sur Atrios', desc: 'L’artisan organise les tâches et le planning en ligne.' },
        { num: '07', title: 'Suivi des paiements et profits', desc: 'Contrôlez les règlements, factures et rentabilité nette.' }
      ]
    },
    segments: {
      clients: {
        badge: 'POUR LES PARTICULIERS',
        title: 'Vous avez des travaux à réaliser ?',
        sub: 'Trouvez des artisans et entreprises du bâtiment qualifiés.',
        bullets: [
          'Déposez votre demande de devis 100% gratuitement',
          'Détaillez le type de travaux dont vous avez besoin',
          'Indiquez la localisation et vos délais souhaités',
          'Recevez des propositions claires d’artisans vérifiés',
          'Suivez l’avancement de vos demandes en direct',
          'Sélectionnez la meilleure offre pour votre budget'
        ],
        previewTitle: 'Recevez des devis',
        previewBadge: '3 Devis',
        previewCta: 'VOIR TOUS LES DEVIS →',
        cta: 'DEMANDER UN DEVIS GRATUIT',
        portalPrompt: 'Déjà une demande ? Accéder au Portail Client',
        portalLink: 'Portail Client'
      },
      pro: {
        badge: 'POUR LES PROFESSIONNELS DU BÂTIMENT',
        title: 'Transformez chaque demande en chantier rentable.',
        sub: 'Recevez des chantiers ciblés, signez plus vite et gérez tout au même endroit.',
        bullets: [
          'Recevez de nouvelles demandes de devis qualifiées',
          'Consultez les détails et photos des chantiers',
          'Créez des devis précis en quelques clics',
          'Générez des PDF élégants avec votre logo et mentions',
          'Organisez vos équipes, matériaux et ordres de mission',
          'Pilotez les acomptes, factures et règlements',
          'Tout réuni sur une seule plateforme intuitive'
        ],
        previewTitle: 'Synthèse du mois',
        previewBadge: '+24% ce mois-ci',
        stat1Label: 'Chiffre d’Affaires',
        stat1Val: '18.650 €',
        stat2Label: 'Chantiers',
        stat2Val: '8 Actifs',
        stat3Label: 'Demandes',
        stat3Val: '12 Nouvelles',
        cta: 'RECEVOIR DES DEMANDES'
      }
    },
    features10: {
      eyebrow: 'TOUT POUR PILOTER VOTRE ACTIVITÉ',
      title: 'Des fonctionnalités complètes pour le quotidien',
      items: [
        { title: 'Devis & Chiffrage', desc: 'Créez des devis et propositions professionnels en quelques minutes.' },
        { title: 'Gestion de Chantiers', desc: 'Suivez l’avancement de chaque chantier en temps réel.' },
        { title: 'Répertoire Clients', desc: 'Centralisez clients, sous-traitants et fournisseurs.', isHighlighted: true },
        { title: 'Main-d’œuvre & Matériaux', desc: 'Gérez vos taux horaires, fournitures et coûts d’achat.' },
        { title: 'Suivi des Règlements', desc: 'Gardez le contrôle sur les acomptes et factures payées.' },
        { title: 'Tableaux de Bord', desc: 'Indicateurs de rentabilité et suivi des marges en direct.' },
        { title: 'Demandes de Travaux', desc: 'Recevez des demandes de particuliers directement sur votre compte.', isNew: true },
        { title: 'Propositions PDF', desc: 'Envoyez des propositions claires et suivez l’intérêt du client.', isNew: true },
        { title: 'Coffre-fort Documents', desc: 'Stockez plans, photos et justificatifs en toute sécurité.' },
        { title: 'Application Mobile', desc: 'Accédez à toutes vos données depuis votre smartphone ou tablette.' }
      ]
    },
    comparison: {
      before: {
        badge: 'AVANT ATRIOS...',
        title: 'Avant Atrios...',
        items: [
          'Demandes éparpillées sur WhatsApp, mails et SMS',
          'Devis sur papier ou tableurs Excel fastidieux',
          'Informations perdues et classeurs encombrants',
          'Difficulté à relancer les clients et suivre les paiements',
          'Manque de visibilité sur les bénéfices réels du chantier'
        ]
      },
      after: {
        badge: 'MAINTENANT AVEC ATRIOS BUILD',
        title: 'Maintenant avec Atrios Build',
        items: [
          'Toutes vos demandes organisées dans une boîte de réception unique',
          'Devis PDF soignés générés en 60 secondes chrono',
          'Clients, équipes et chantiers 100% structurés',
          'Suivi précis des acomptes, restes à payer et trésorerie',
          'Gagnez des heures chaque semaine et augmentez vos marges'
        ]
      },
      ctaBanner: {
        title: 'Le logiciel tout-en-un pour les artisans et professionnels du BTP.',
        sub: 'Plus d’organisation, plus de chantiers signés et plus de bénéfices. Démarrez gratuitement dès aujourd’hui.',
        trust: [
          { title: 'Sécurité Totale', sub: 'Sauvegarde cloud chiffrée' },
          { title: 'Support Réactif', sub: 'À vos côtés au quotidien' },
          { title: 'Évolutions Continues', sub: 'Mises à jour régulières' },
          { title: 'Réseau Pro', sub: 'Des milliers d’utilisateurs' }
        ],
        clientTitle: 'DEMANDER UN DEVIS GRATUIT',
        clientSub: 'J’AI UN PROJET DE TRAVAUX',
        proTitle: 'REJOINDRE COMME ARTISAN',
        proSub: 'RECEVOIR DES CHANTIERS ET GÉRER MES TRAVAUX'
      }
    },
    footer: {
      desc: 'La solution complète pour la réalisation de devis, la gestion de chantiers et le suivi financier du bâtiment.',
      secure: 'Données sécurisées et chiffrées',
      product: 'PRODUIT',
      company: 'ENTREPRISE',
      support: 'ASSISTANCE',
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      pdfQuotes: 'Devis PDF',
      createFree: 'Créer un Compte Gratuit →',
      privacy: 'Confidentialité',
      terms: 'Conditions Générales',
      help: 'Aide & FAQ',
      demo: 'Voir la Démonstration',
      installApp: 'Installer l’App Mobile',
      clientPortal: 'Portail Client (Connexion)',
      rights: 'Tous droits réservés.',
      tagline: 'Conçu avec rigueur pour les professionnels du bâtiment.'
    }
  },

  'it-IT': {
    softwareSubtitle: 'SOFTWARE PER EDILIZIA E COSTRUZIONI',
    nav: {
      features: 'Funzionalità',
      howItWorks: 'Come funziona',
      forClients: 'Per i Clienti',
      forPros: 'Per i Professionisti',
      portalClient: 'Portale Clienti (Vedi Preventivi)',
      login: 'ACCEDI',
      startFree: 'INIZIA GRATIS',
      register: 'REGISTRATI'
    },
    hero: {
      bannerPill: 'VEDI I BANNER DI PRESENTAZIONE',
      headline: {
        line1: 'Trova clienti.',
        line2: 'Crea preventivi.',
        line3: 'Gestisci i tuoi cantieri.',
        highlight: 'Tutto in un unico posto con Atrios Build.'
      },
      subtitle: 'Ricevi richieste di preventivo, invia proposte PDF professionali e gestisci cantieri, pagamenti e margini in totale semplicità.',
      clientCard: {
        title: 'RICHIEDI PREVENTIVO GRATIS',
        sub: 'Sono un cliente e ho bisogno di lavori',
        portalPrompt: 'Hai già richiesto un preventivo?',
        portalLink: 'Portale Clienti'
      },
      proCard: {
        title: 'SONO UN PROFESSIONISTA',
        sub: 'Voglio ricevere richieste e gestire cantieri',
        loginPrompt: 'Hai già un account?',
        loginLink: 'Login Professionista'
      },
      video: {
        tabVideo: 'VIDEO HERO',
        tabLive: 'DAL VIVO',
        badge60s: '60 SECONDI',
        duration: '01:45 MIN',
        centerBtn: 'GUARDA LA DIMOSTRAZIONE',
        subText: 'Clicca per scoprire come funziona Atrios Build',
        step1: 'Richieste',
        step2: 'Preventivi',
        step3: 'Gestione'
      },
      trust: {
        secure: 'Sicuro e affidabile',
        secureSub: 'I tuoi dati protetti',
        verified: 'Professionisti verificati',
        verifiedSub: 'Massima tranquillità per te',
        everywhere: 'Accesso ovunque',
        everywhereSub: 'Web, Tablet e App mobile'
      }
    },
    steps7: {
      eyebrow: 'DAL PRIMO CONTATTO AL COMPLETAMENTO DELL’OPERA',
      title: 'Come funziona per tutti',
      items: [
        { num: '01', title: 'Il cliente richiede un preventivo', desc: 'Descrive le esigenze del cantiere e invia la richiesta.' },
        { num: '02', title: 'Il professionista riceve la notifica', desc: 'Imprese e artigiani qualificati della zona vengono avvisati.' },
        { num: '03', title: 'Preparazione del computo', desc: 'Analizza materiali, manodopera e formula l’offerta.' },
        { num: '04', title: 'Invio del preventivo PDF', desc: 'Il cliente riceve un documento chiaro con logo aziendale.' },
        { num: '05', title: 'Il cliente valuta e approva', desc: 'Confronta le offerte e sceglie il professionista ideale.' },
        { num: '06', title: 'Apertura cantiere su Atrios', desc: 'Il professionista avvia i lavori e organizza le fasi.' },
        { num: '07', title: 'Controllo pagamenti e profitti', desc: 'Monitora spese, acconti ricevuti e guadagno netto.' }
      ]
    },
    segments: {
      clients: {
        badge: 'PER I CLIENTI',
        title: 'Devi ristrutturare o costruire?',
        sub: 'Trova professionisti qualificati e verificati per i tuoi lavori.',
        bullets: [
          'Invia la tua richiesta di preventivo gratuitamente',
          'Spiega nel dettaglio i lavori di cui hai bisogno',
          'Indica la posizione e le tempistiche desiderate',
          'Ricevi proposte trasparenti da imprese verificate',
          'Segui lo stato delle tue richieste in tempo reale',
          'Scegli il preventivo migliore per il tuo budget'
        ],
        previewTitle: 'Ricevi preventivi',
        previewBadge: '3 Preventivi',
        previewCta: 'VEDI TUTTE LE PROPOSTE →',
        cta: 'RICHIEDI PREVENTIVO GRATIS',
        portalPrompt: 'Hai già inviato una richiesta? Accedi al Portale Clienti',
        portalLink: 'Portale Clienti'
      },
      pro: {
        badge: 'PER I PROFESSIONISTI',
        title: 'Trasforma le richieste in contratti e cantieri redditizi.',
        sub: 'Ricevi nuove commesse, chiudi accordi e gestisci tutto nello stesso posto.',
        bullets: [
          'Ricevi nuove richieste di preventivo qualificate',
          'Esamina i dettagli del cantiere e le specifiche',
          'Crea preventivi dettagliati in pochi minuti',
          'Invia PDF professionali con il tuo logo e condizioni',
          'Organizza cantieri, manodopera e materiali',
          'Controlla scadenze di pagamento e flussi di cassa',
          'Tutto in un’unica applicazione facile e moderna'
        ],
        previewTitle: 'Riepilogo del mese',
        previewBadge: '+24% questo mese',
        stat1Label: 'Fatturato',
        stat1Val: '18.650 €',
        stat2Label: 'Cantieri',
        stat2Val: '8 Attivi',
        stat3Label: 'Richieste',
        stat3Val: '12 Nuove',
        cta: 'VOGLIO RICEVERE RICHIESTE'
      }
    },
    features10: {
      eyebrow: 'TUTTO IL NECESSARIO PER IL TUO LAVORO',
      title: 'Funzionalità complete per la gestione quotidiana',
      items: [
        { title: 'Preventivi & Computi', desc: 'Crea preventivi professionali in PDF in pochi minuti.' },
        { title: 'Gestione Cantieri', desc: 'Monitora l’avanzamento di ogni opera in tempo reale.' },
        { title: 'Anagrafica Clienti', desc: 'Organizza clienti, fornitori e collaboratori.', isHighlighted: true },
        { title: 'Materiali e Manodopera', desc: 'Gestisci tariffe orarie, forniture e costi.' },
        { title: 'Controllo Pagamenti', desc: 'Traccia acconti, fatture emesse e saldi da incassare.' },
        { title: 'Report e Margini', desc: 'Statistiche e analisi finanziaria del margine effettivo.' },
        { title: 'Richieste di Lavoro', desc: 'Ricevi richieste di preventivo da clienti della tua zona.', isNew: true },
        { title: 'Proposte PDF', desc: 'Invia preventivi eleganti e monitora l’approvazione del cliente.', isNew: true },
        { title: 'Archivio Documenti', desc: 'Salva in sicurezza foto, contratti e certificazioni.' },
        { title: 'App Mobile', desc: 'Accedi da ovunque con il tuo smartphone o tablet.' }
      ]
    },
    comparison: {
      before: {
        badge: 'PRIMA ERA COSÌ...',
        title: 'Prima era così...',
        items: [
          'Richieste sparse su WhatsApp, telefonate e foglietti',
          'Preventivi su carta o fogli Excel complicati',
          'Informazioni disordinate e documenti smarriti',
          'Difficoltà nel seguire i clienti e riscuotere i pagamenti',
          'Mancanza di chiarezza sul guadagno effettivo del cantiere'
        ]
      },
      after: {
        badge: 'ORA CON ATRIOS BUILD',
        title: 'Ora con Atrios Build',
        items: [
          'Tutte le richieste organizzate in un unico cruscotto',
          'Preventivi PDF professionali pronti in 60 secondi',
          'Clienti, materiali e cantieri perfettamente strutturati',
          'Controllo puntuale di costi, acconti e flussi di cassa',
          'Più tempo libero e maggiore redditività per la tua impresa'
        ]
      },
      ctaBanner: {
        title: 'La piattaforma ideale per imprese edili, artigiani e tecnici.',
        sub: 'Più organizzazione, più commesse e più margini. Inizia subito gratuitamente.',
        trust: [
          { title: 'Sicurezza Totale', sub: 'Backup cloud crittografato' },
          { title: 'Supporto Dedicato', sub: 'Sempre al tuo fianco' },
          { title: 'Aggiornamenti Continui', sub: 'Nuove funzioni ogni mese' },
          { title: '+ Professionisti', sub: 'Una community in crescita' }
        ],
        clientTitle: 'RICHIEDI PREVENTIVO GRATIS',
        clientSub: 'HO BISOGNO DI UN LAVORO EDILE',
        proTitle: 'REGISTRATI COME PROFESSIONISTA',
        proSub: 'RICEVI COMMESSE E GESTISCI I CANTIERI'
      }
    },
    footer: {
      desc: 'La piattaforma completa per la redazione di preventivi, gestione commesse e controllo economico dei cantieri.',
      secure: 'Dati sicuri e crittografati',
      product: 'PRODOTTO',
      company: 'AZIENDA',
      support: 'SUPPORTO',
      features: 'Funzionalità',
      howItWorks: 'Come Funziona',
      pdfQuotes: 'Preventivi PDF',
      createFree: 'Crea Account Gratis →',
      privacy: 'Privacy Policy',
      terms: 'Termini di Servizio',
      help: 'Assistenza & Domande',
      demo: 'Guarda Demo',
      installApp: 'Installa App Mobile',
      clientPortal: 'Portale Clienti (Login)',
      rights: 'Tutti i diritti riservati.',
      tagline: 'Sviluppato con eccellenza per i professionisti delle costruzioni.'
    }
  },

  'ru-RU': {
    softwareSubtitle: 'ПРОГРАММА ДЛЯ СТРОИТЕЛЬСТВА И РЕМОНТА',
    nav: {
      features: 'Возможности',
      howItWorks: 'Как это работает',
      forClients: 'Клиентам',
      forPros: 'Строителям и мастерам',
      portalClient: 'Портал заказчика (Сметы)',
      login: 'ВХОД',
      startFree: 'НАЧАТЬ БЕСПЛАТНО',
      register: 'РЕГИСТРАЦИЯ'
    },
    hero: {
      bannerPill: 'ПОСМОТРЕТЬ БАННЕРЫ ФУНКЦИЙ',
      headline: {
        line1: 'Находите клиентов.',
        line2: 'Составляйте сметы.',
        line3: 'Управляйте объектами.',
        highlight: 'Всё в одном месте с Atrios Build.'
      },
      subtitle: 'Принимайте заявки от заказчиков, отправляйте профессиональные сметы в PDF и контролируйте стройку, платежи и прибыль в одной системе.',
      clientCard: {
        title: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
        sub: 'Мне нужен ремонт или строительство',
        portalPrompt: 'Уже оставляли заявку?',
        portalLink: 'Портал заказчика'
      },
      proCard: {
        title: 'Я СТРОИТЕЛЬ / МАСТЕР',
        sub: 'Хочу получать заказы и вести объекты',
        loginPrompt: 'Уже зарегистрированы?',
        loginLink: 'Вход для мастеров'
      },
      video: {
        tabVideo: 'ВИДЕО ОБЗОР',
        tabLive: 'В РЕАЛЬНОМ ВРЕМЕНИ',
        badge60s: '60 СЕКУНД',
        duration: '01:45 МИН',
        centerBtn: 'ПОСМОТРЕТЬ ДЕМОНСТРАЦИЮ',
        subText: 'Нажмите, чтобы увидеть, как работает Atrios Build',
        step1: 'Заявки',
        step2: 'Сметы',
        step3: 'Управление'
      },
      trust: {
        secure: 'Надежно и безопасно',
        secureSub: 'Ваши данные защищены',
        verified: 'Проверенные мастера',
        verifiedSub: 'Гарантия спокойствия',
        everywhere: 'Доступ отовсюду',
        everywhereSub: 'Веб, планшет и мобильное приложение'
      }
    },
    steps7: {
      eyebrow: 'ОТ ПЕРВОГО ЗВОНКА ДО СДАЧИ ОБЪЕКТА',
      title: 'Как это работает для всех',
      items: [
        { num: '01', title: 'Клиент отправляет заявку', desc: 'Заказчик описывает задачу и отправляет запрос на расчет.' },
        { num: '02', title: 'Строитель получает заказ', desc: 'Проверенные мастера и компании региона получают уведомление.' },
        { num: '03', title: 'Расчет коммерческого предложения', desc: 'Строитель рассчитывает материалы, работы и сроки.' },
        { num: '04', title: 'Отправка сметы в PDF', desc: 'Клиент получает красивую и прозрачную смету с логотипом.' },
        { num: '05', title: 'Клиент утверждает смету', desc: 'Сравнивает предложения и выбирает лучшего исполнителя.' },
        { num: '06', title: 'Старт объекта в Atrios', desc: 'Мастер начинает работы и фиксирует все этапы в системе.' },
        { num: '07', title: 'Учет финансов и прибыли', desc: 'Контроль оплат, расходов на закупки и чистой прибыли.' }
      ]
    },
    segments: {
      clients: {
        badge: 'ДЛЯ ЗАКАЗЧИКОВ',
        title: 'Нужен ремонт или стройка?',
        sub: 'Найдите надежных строителей и мастеров на нашей платформе.',
        bullets: [
          'Разместите заявку на смету абсолютно бесплатно',
          'Опишите требуемые работы и прикрепите фото',
          'Укажите адрес и желаемые сроки начала',
          'Получите понятные сметы от проверенных исполнителей',
          'Отслеживайте статус заявки в реальном времени',
          'Выберите лучшее предложение под ваш бюджет'
        ],
        previewTitle: 'Полученные предложения',
        previewBadge: '3 Сметы',
        previewCta: 'СМОТРЕТЬ ВСЕ ПРЕДЛОЖЕНИЯ →',
        cta: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
        portalPrompt: 'Уже оставляли заявку? Войти в Портал заказчика',
        portalLink: 'Портал заказчика'
      },
      pro: {
        badge: 'ДЛЯ СТРОИТЕЛЕЙ И БРИГАД',
        title: 'Превращайте входящие заявки в прибыльные контракты.',
        sub: 'Получайте заказы, заключайте договоры и ведите объекты в одном месте.',
        bullets: [
          'Получайте свежие заявки на стройку и ремонт',
          'Изучайте техзадание и фотографии объектов',
          'Создавайте точные сметы за считанные минуты',
          'Формируйте PDF сметы с вашим логотипом и условиями',
          'Управляйте бригадами, материалами и нарядами',
          'Контролируйте авансы, оплаты и задолженности',
          'Все инструменты в единой удобной программе'
        ],
        previewTitle: 'Итоги месяца',
        previewBadge: '+24% в этом месяце',
        stat1Label: 'Выручка',
        stat1Val: '18 650 €',
        stat2Label: 'Объекты',
        stat2Val: '8 Активных',
        stat3Label: 'Заявки',
        stat3Val: '12 Новых',
        cta: 'ХОЧУ ПОЛУЧАТЬ ЗАКАЗЫ'
      }
    },
    features10: {
      eyebrow: 'ВСЁ ДЛЯ УПРАВЛЕНИЯ ВАШИМ СТРОИТЕЛЬНЫМ БИЗНЕСОМ',
      title: 'Полный набор инструментов на каждый день',
      items: [
        { title: 'Сметы и расчеты', desc: 'Создание профессиональных смет и расчетов за пару минут.' },
        { title: 'Учет объектов', desc: 'Отслеживайте ход выполнения работ на каждом объекте.' },
        { title: 'База клиентов', desc: 'Удобное хранение контактов клиентов и поставщиков.', isHighlighted: true },
        { title: 'Работы и материалы', desc: 'Учет расценок за работу, нормы расхода и стоимость материалов.' },
        { title: 'Платежи и финансы', desc: 'Контроль поступления оплат от заказчиков и расходов.' },
        { title: 'Отчеты и маржа', desc: 'Финансовая аналитика и расчет реальной чистой прибыли.' },
        { title: 'Биржа заявок', desc: 'Получайте прямые заказы от клиентов вашего города.', isNew: true },
        { title: 'PDF предложения', desc: 'Отправляйте стильные КП и следите за решением клиента.', isNew: true },
        { title: 'Хранилище файлов', desc: 'Надежное хранение договоров, чеков и фотоотчетов.' },
        { title: 'Мобильное приложение', desc: 'Работайте со смартфона прямо со строительной площадки.' }
      ]
    },
    comparison: {
      before: {
        badge: 'КАК БЫЛО РАНЬШЕ...',
        title: 'Как было раньше...',
        items: [
          'Заявки теряются в чатах WhatsApp, звонках и блокнотах',
          'Сметы на бумаге или в запутанных таблицах Excel',
          'Хаос в документах и потерянные чеки на материалы',
          'Сложно отслеживать график оплат заказчиков',
          'Непонятно, сколько на самом деле заработано с объекта'
        ]
      },
      after: {
        badge: 'ТЕПЕРЬ С ATRIOS BUILD',
        title: 'Теперь с Atrios Build',
        items: [
          'Все заказы и клиенты в единой аккуратной системе',
          'Профессиональная PDF смета формируется за 60 секунд',
          'Материалы, мастера и объекты структурированы на 100%',
          'Полный контроль оплат, расходов и кассовых разрывов',
          'Экономия 10+ часов в неделю и рост чистой прибыли'
        ]
      },
      ctaBanner: {
        title: 'Комплексная платформа для строителей, бригадиров и компаний.',
        sub: 'Больше порядка, больше выгодных заказов и выше доход. Начните бесплатно прямо сейчас.',
        trust: [
          { title: 'Полная безопасность', sub: 'Зашифрованные копии' },
          { title: 'Поддержка', sub: 'Помощь на каждом этапе' },
          { title: 'Обновления', sub: 'Постоянные улучшения' },
          { title: '+ Строителей', sub: 'Растущее сообщество' }
        ],
        clientTitle: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
        clientSub: 'МНЕ НУЖЕН СТРОИТЕЛЬ ИЛИ МАСТЕР',
        proTitle: 'РЕГИСТРАЦИЯ ДЛЯ МАСТЕРОВ',
        proSub: 'ПОЛУЧАТЬ ЗАКАЗЫ И ВЕСТИ ОБЪЕКТЫ'
      }
    },
    footer: {
      desc: 'Комплексная программа для составления смет, управления строительными проектами и финансового контроля.',
      secure: 'Данные зашифрованы и защищены',
      product: 'ПРОДУКТ',
      company: 'КОМПАНИЯ',
      support: 'ПОДДЕРЖКА',
      features: 'Возможности',
      howItWorks: 'Как это работает',
      pdfQuotes: 'Сметы в PDF',
      createFree: 'Создать аккаунт бесплатно →',
      privacy: 'Конфиденциальность',
      terms: 'Условия сервиса',
      help: 'Помощь и вопросы',
      demo: 'Смотреть демо',
      installApp: 'Установить приложение',
      clientPortal: 'Портал заказчика (Вход)',
      rights: 'Все права защищены.',
      tagline: 'Создано со знанием дела для специалистов строительной отрасли.'
    }
  },

  'hi-IN': {
    softwareSubtitle: 'निर्माण एवं ठेकेदारी प्रबंधन सॉफ्टवेयर',
    nav: {
      features: 'विशेषताएं',
      howItWorks: 'यह कैसे काम करता है',
      forClients: 'ग्राहकों के लिए',
      forPros: 'ठेकेदारों और कारीगरों के लिए',
      portalClient: 'ग्राहक पोर्टल (कोटेशन देखें)',
      login: 'लॉग इन',
      startFree: 'मुफ्त शुरू करें',
      register: 'साइन अप'
    },
    hero: {
      bannerPill: 'सुविधाओं के प्रस्तुति बैनर देखें',
      headline: {
        line1: 'ग्राहक खोजें।',
        line2: 'कोटेशन बनाएं।',
        line3: 'अपनी साइट प्रबंधित करें।',
        highlight: 'Atrios Build के साथ सब कुछ एक ही जगह।'
      },
      subtitle: 'ग्राहकों से काम के अनुरोध प्राप्त करें, पेशेवर PDF प्रस्ताव भेजें और अपने निर्माण व्यवसाय को आसानी से प्रबंधित करें।',
      clientCard: {
        title: 'मुफ्त कोटेशन का अनुरोध करें',
        sub: 'मुझे निर्माण या मरम्मत का काम करवाना है',
        portalPrompt: 'क्या पहले अनुरोध भेजा है?',
        portalLink: 'ग्राहक पोर्टल'
      },
      proCard: {
        title: 'मैं ठेकेदार / कारीगर हूँ',
        sub: 'मुझे काम के नए अवसर और प्रबंधन चाहिए',
        loginPrompt: 'क्या खाता पहले से है?',
        loginLink: 'कारीगर लॉगिन'
      },
      video: {
        tabVideo: 'वीडियो ओवरव्यू',
        tabLive: 'लाइव डेमो',
        badge60s: '60 सेकंड',
        duration: '01:45 मिनट',
        centerBtn: 'पूरा डेमो देखें',
        subText: 'Atrios Build कैसे काम करता है, देखने के लिए क्लिक करें',
        step1: 'अनुरोध',
        step2: 'प्रस्ताव',
        step3: 'प्रबंधन'
      },
      trust: {
        secure: 'सुरक्षित और विश्वसनीय',
        secureSub: 'आपका डेटा पूरी तरह सुरक्षित',
        verified: 'सत्यापित ठेकेदार',
        verifiedSub: 'आपके लिए पूर्ण मानसिक शांति',
        everywhere: 'कहीं भी उपयोग करें',
        everywhereSub: 'वेब, टैबलेट और मोबाइल ऐप'
      }
    },
    steps7: {
      eyebrow: 'शुरुआत से लेकर काम पूरा होने तक',
      title: 'यह सभी के लिए कैसे काम करता है',
      items: [
        { num: '01', title: 'ग्राहक कोटेशन मांगता है', desc: 'ग्राहक अपने काम का विवरण दर्ज करके अनुरोध भेजता है।' },
        { num: '02', title: 'ठेकेदार को सूचना मिलती है', desc: 'इलाके के सत्यापित ठेकेदारों को नया काम सूचित किया जाता है।' },
        { num: '03', title: 'ठेकेदार कोटेशन तैयार करता है', desc: 'सामग्री, मजदूरी और समय सीमा का सटीक हिसाब लगाया जाता है।' },
        { num: '04', title: 'पेशेवर PDF प्रस्ताव भेजा जाता है', desc: 'ग्राहक को स्पष्ट और लोगो युक्त प्रस्ताव मिलता है।' },
        { num: '05', title: 'ग्राहक चुनता है और मंजूरी देता है', desc: 'प्रस्तावों की तुलना करके सबसे उपयुक्त ठेकेदार चुना जाता है।' },
        { num: '06', title: 'प्रोजेक्ट Atrios में शुरू होता है', desc: 'ठेकेदार काम शुरू करता है और सभी कार्य व्यवस्थित करता है।' },
        { num: '07', title: 'भुगतान और मुनाफे का हिसाब', desc: 'प्राप्त भुगतान, खर्चे और वास्तविक मुनाफे की निगरानी।' }
      ]
    },
    segments: {
      clients: {
        badge: 'ग्राहकों के लिए',
        title: 'क्या आपको निर्माण या मरम्मत करवानी है?',
        sub: 'हमारे प्लेटफॉर्म पर अनुभवी और सत्यापित ठेकेदार खोजें।',
        bullets: [
          '100% मुफ्त कोटेशन का अनुरोध दर्ज करें',
          'अपनी जरूरत और काम का विवरण बताएं',
          'स्थान और संभावित समय सीमा चुनें',
          'सत्यापित कारीगरों से विस्तृत प्रस्ताव पाएं',
          'अपने अनुरोध को रियल-टाइम में ट्रैक करें',
          'अपने बजट के अनुसार सर्वश्रेष्ठ प्रस्ताव चुनें'
        ],
        previewTitle: 'प्राप्त कोटेशन',
        previewBadge: '3 प्रस्ताव',
        previewCta: 'सभी प्रस्ताव देखें →',
        cta: 'मुफ्त कोटेशन मांगें',
        portalPrompt: 'क्या पहले अनुरोध किया है? ग्राहक पोर्टल में लॉगिन करें',
        portalLink: 'ग्राहक पोर्टल'
      },
      pro: {
        badge: 'ठेकेदारों और कारीगरों के लिए',
        title: 'काम के अनुरोधों को लाभदायक प्रोजेक्ट्स में बदलें।',
        sub: 'नए ग्राहक पाएं, काम पक्का करें और सभी साइट्स एक ही ऐप से चलाएं।',
        bullets: [
          'अपने क्षेत्र में काम के नए अनुरोध प्राप्त करें',
          'काम का विवरण और स्थान की जानकारी देखें',
          'मिनटों में पेशेवर कोटेशन और बिल तैयार करें',
          'अपने लोगो और शर्तों के साथ सुंदर PDF भेजें',
          'मजदूरों, सामग्रियों और कार्यों का हिसाब रखें',
          'भुगतान और बकाया राशि पर पूरा नियंत्रण रखें',
          'सब कुछ एक आधुनिक और सरल सॉफ्टवेयर में'
        ],
        previewTitle: 'माह का सारांश',
        previewBadge: '+24% इस माह',
        stat1Label: 'राजस्व',
        stat1Val: '₹1,50,000',
        stat2Label: 'प्रोजेक्ट',
        stat2Val: '8 सक्रिय',
        stat3Label: 'अनुरोध',
        stat3Val: '12 नए',
        cta: 'काम के अनुरोध पाना शुरू करें'
      }
    },
    features10: {
      eyebrow: 'आपके व्यवसाय प्रबंधन के लिए आवश्यक सब कुछ',
      title: 'दैनिक कार्यों के लिए संपूर्ण सुविधाएं',
      items: [
        { title: 'कोटेशन और एस्टीमेट', desc: 'मिनटों में पेशेवर निर्माण कोटेशन बनाएं।' },
        { title: 'प्रोजेक्ट ट्रैकिंग', desc: 'साइट की प्रगति और कार्यों की रियल-टाइम निगरानी।' },
        { title: 'ग्राहक डायरेक्टरी', desc: 'ग्राहकों और सप्लायर्स की जानकारी एक जगह रखें।', isHighlighted: true },
        { title: 'मजदूरी और सामग्री', desc: 'मजदूरों के घंटे और निर्माण सामग्री की लागत का हिसाब।' },
        { title: 'भुगतान नियंत्रण', desc: 'आए हुए भुगतान और बकाया राशि का ट्रैक रखें।' },
        { title: 'लाभ और रिपोर्ट्स', desc: 'वास्तविक मुनाफे और मार्जिन का सटीक वित्तीय विश्लेषण।' },
        { title: 'काम के नए अनुरोध', desc: 'सीधे अपने इलाके के ग्राहकों से काम की मांग पाएं।', isNew: true },
        { title: 'PDF प्रपोजल', desc: 'आकर्षक PDF प्रस्ताव भेजें और ग्राहक की मंजूरी देखें।', isNew: true },
        { title: 'दस्तावेज़ वॉल्ट', desc: 'कागजात, बिल और साइट की तस्वीरें सुरक्षित रखें।' },
        { title: 'मोबाइल ऐप', desc: 'अपने फोन से साइट पर रहते हुए भी सब कुछ संचालित करें।' }
      ]
    },
    comparison: {
      before: {
        badge: 'पहले ऐसा होता था...',
        title: 'पहले ऐसा होता था...',
        items: [
          'व्हाट्सएप और फोन कॉल्स में काम की जानकारी खो जाना',
          'कागज या जटिल एक्सेल में उलझे हुए एस्टीमेट',
          'सामग्री के खोए हुए बिल और हिसाब में गड़बड़ी',
          'ग्राहकों से बकाया पैसे मांगने में परेशानी',
          'प्रोजेक्ट से वास्तव में कितना मुनाफा हुआ, इसका पता न होना'
        ]
      },
      after: {
        badge: 'अब ATRIOS BUILD के साथ',
        title: 'अब Atrios Build के साथ',
        items: [
          'सभी काम और ग्राहक एक ही व्यवस्थित जगह',
          '60 सेकंड में पेशेवर PDF कोटेशन तैयार',
          'सामग्री, मजदूर और प्रोजेक्ट्स 100% व्यवस्थित',
          'खर्चों और पेमेंट्स पर पूर्ण स्पष्टता और नियंत्रण',
          'सप्ताह में 10+ घंटे बचाएं और अपना मुनाफा बढ़ाएं'
        ]
      },
      ctaBanner: {
        title: 'निर्माण पेशेवरों और ठेकेदारों के लिए संपूर्ण सॉफ्टवेयर।',
        sub: 'अधिक संगठन, अधिक ग्राहक और अधिक मुनाफा। Atrios Build के साथ मुफ्त शुरुआत करें।',
        trust: [
          { title: 'पूर्ण सुरक्षा', sub: 'एन्क्रिप्टेड क्लाउड बैकअप' },
          { title: 'समर्पित सहायता', sub: 'हर कदम पर आपकी मदद' },
          { title: 'नियमित अपडेट', sub: 'लगातार नई सुविधाएं' },
          { title: '+ ठेकेदार साथी', sub: 'तेजी से बढ़ता समुदाय' }
        ],
        clientTitle: 'मुफ्त कोटेशन मांगें',
        clientSub: 'मुझे कारीगर या ठेकेदार चाहिए',
        proTitle: 'ठेकेदार के रूप में जुड़ें',
        proSub: 'काम पाएं और प्रोजेक्ट मैनेज करें'
      }
    },
    footer: {
      desc: 'निर्माण कोटेशन, कार्य आदेश और साइट वित्तीय नियंत्रण के लिए पूर्ण मंच।',
      secure: 'डेटा सुरक्षित और एन्क्रिप्टेड है',
      product: 'उत्पाद',
      company: 'कंपनी',
      support: 'सहायता',
      features: 'विशेषताएं',
      howItWorks: 'यह कैसे काम करता है',
      pdfQuotes: 'PDF कोटेशन',
      createFree: 'मुफ्त खाता बनाएं →',
      privacy: 'गोपनीयता नीति',
      terms: 'उपयोग की शर्तें',
      help: 'मदद और सवाल',
      demo: 'डेमो देखें',
      installApp: 'मोबाइल ऐप इंस्टॉल करें',
      clientPortal: 'ग्राहक पोर्टल (लॉगिन)',
      rights: 'सर्वाधिकार सुरक्षित।',
      tagline: 'निर्माण पेशेवरों के लिए विशेषज्ञता के साथ निर्मित।'
    }
  },

  'bn-BD': {
    softwareSubtitle: 'নির্মাণ ব্যবস্থাপনা সফটওয়্যার',
    nav: {
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      forClients: 'গ্রাহকদের জন্য',
      forPros: 'ঠিকাদার ও মিস্ত্রিদের জন্য',
      portalClient: 'ক্লায়েন্ট পোর্টাল (কোটেশন দেখুন)',
      login: 'লগ ইন',
      startFree: 'বিনামূল্যে শুরু করুন',
      register: 'নিবন্ধন করুন'
    },
    hero: {
      bannerPill: 'ফিচার প্রেজেন্টেশন ব্যানার দেখুন',
      headline: {
        line1: 'ক্লায়েন্ট খুঁজুন।',
        line2: 'কোটেশন তৈরি করুন।',
        line3: 'প্রজেক্ট পরিচালনা করুন।',
        highlight: 'সবকিছু এক জায়গায় Atrios Build এর সাথে।'
      },
      subtitle: 'গ্রাহকদের কাছ থেকে কাজের অনুরোধ পান, পেশাদার PDF কোটেশন পাঠান এবং সহজেই প্রজেক্ট ও হিসাব পরিচালনা করুন।',
      clientCard: {
        title: 'বিনামূল্যে কোটেশনের অনুরোধ করুন',
        sub: 'আমার নির্মাণ বা মেরামতের কাজ প্রয়োজন',
        portalPrompt: 'ইতিমধ্যে অনুরোধ জমা দিয়েছেন?',
        portalLink: 'ক্লায়েন্ট পোর্টাল'
      },
      proCard: {
        title: 'আমি ঠিকাদার / পেশাদার',
        sub: 'নতুন কাজের সুযোগ পেতে এবং পরিচালনা করতে চাই',
        loginPrompt: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
        loginLink: 'প্রফেশনাল লগইন'
      },
      video: {
        tabVideo: 'ভিডিও বিবরণ',
        tabLive: 'লাইভ ডেমো',
        badge60s: '৬০ সেকেন্ড',
        duration: '০১:৪৫ মিনিট',
        centerBtn: 'সম্পূর্ণ ডেমো দেখুন',
        subText: 'Atrios Build কীভাবে কাজ করে তা দেখতে ক্লিক করুন',
        step1: 'অনুরোধ',
        step2: 'কোটেশন',
        step3: 'ব্যবস্থাপনা'
      },
      trust: {
        secure: 'নিরাপদ ও নির্ভরযোগ্য',
        secureSub: 'আপনার ডেটা সম্পূর্ণ সুরক্ষিত',
        verified: 'যাচাইকৃত ঠিকাদার',
        verifiedSub: 'আপনার কাজের শতভাগ নিশ্চয়তা',
        everywhere: 'যেকোনো ডিভাইস থেকে ব্যবহার',
        everywhereSub: 'ওয়েব, ট্যাবলেট ও মোবাইল অ্যাপ'
      }
    },
    steps7: {
      eyebrow: 'প্রথম যোগাযোগ থেকে কাজ সম্পন্ন পর্যন্ত',
      title: 'সবার জন্য এটি কীভাবে কাজ করে',
      items: [
        { num: '01', title: 'ক্লায়েন্ট কোটেশন চান', desc: 'ক্লায়েন্ট কাজের বিস্তারিত লিখে রিকোয়েস্ট পাঠান।' },
        { num: '02', title: 'ঠিকাদার নোটিফিকেশন পান', desc: 'এলাকার যাচাইকৃত ঠিকাদাররা নতুন কাজের খবর পান।' },
        { num: '03', title: 'কোটেশন তৈরি ও যাচাই', desc: 'মালামাল ও শ্রম খরচের নিখুঁত হিসাব করা হয়।' },
        { num: '04', title: 'পেশাদার PDF পাঠানো', desc: 'ক্লায়েন্ট লোগো সহ স্পষ্ট কোটেশন ডকুমেন্ট পান।' },
        { num: '05', title: 'ক্লায়েন্ট যাচাই করে অনুমোদন দেন', desc: 'প্রস্তাবনা তুলনা করে সেরা ঠিকাদার বেছে নেন।' },
        { num: '06', title: 'Atrios-এ প্রজেক্ট শুরু', desc: 'ঠিকাদার কাজ শুরু করেন এবং সব গুছিয়ে রাখেন।' },
        { num: '07', title: 'পেমেন্ট ও লাভের হিসাব', desc: 'আদায়কৃত টাকা, খরচ ও প্রকৃত মুনাফার লাইভ ট্র্যাকিং।' }
      ]
    },
    segments: {
      clients: {
        badge: 'গ্রাহকদের জন্য',
        title: 'আপনার কি নির্মাণ বা সংস্কারের কাজ প্রয়োজন?',
        sub: 'আমাদের প্ল্যাটফর্মে দক্ষ ও যাচাইকৃত ঠিকাদার খুঁজে নিন।',
        bullets: [
          '১০০% বিনামূল্যে কাজের কোটেশন চান',
          'আপনার প্রয়োজনীয় কাজের বিস্তারিত জানান',
          'ঠিকানা ও সম্ভাব্য সময়সীমা উল্লেখ করুন',
          'যাচাইকৃত মিস্ত্রিদের থেকে কোটেশন পান',
          'রিয়েল-টাইমে কাজের অগ্রগতি দেখুন',
          'বাজেট অনুযায়ী সেরা প্রস্তাব বেছে নিন'
        ],
        previewTitle: 'প্রাপ্ত কোটেশন',
        previewBadge: '৩টি প্রস্তাব',
        previewCta: 'সব প্রস্তাব দেখুন →',
        cta: 'বিনামূল্যে কোটেশন চান',
        portalPrompt: 'আগে অনুরোধ করেছেন? ক্লায়েন্ট পোর্টালে ঢুকুন',
        portalLink: 'ক্লায়েন্ট পোর্টাল'
      },
      pro: {
        badge: 'ঠিকাদার ও পেশাদারদের জন্য',
        title: 'কাজের অনুরোধগুলোকে লাভজনক প্রজেক্টে রূপান্তর করুন।',
        sub: 'নতুন কাজ পান, চুক্তি চূড়ান্ত করুন এবং সব কাজ এক জায়গা থেকেই চালান।',
        bullets: [
          'আপনার এলাকায় নতুন কাজের সুযোগ পান',
          'কাজের পরিধি ও ছবি দেখে বিশ্লেষণ করুন',
          'কয়েক মিনিটে নিখুঁত এস্টিমেট ও বিল বানান',
          'নিজের লোগো সহ সুন্দর PDF কোটেশন পাঠান',
          'শ্রমিক, মালামাল ও কাজের তালিকা সামলান',
          'বকেয়া টাকা ও আদায়ের হিসাব রাখুন',
          'সবকিছু একটি আধুনিক সহজ সফটওয়্যারে'
        ],
        previewTitle: 'মাসের সারাংশ',
        previewBadge: '+২৪% এই মাসে',
        stat1Label: 'মোট আয়',
        stat1Val: '৳১,৮৫,০০০',
        stat2Label: 'প্রজেক্ট',
        stat2Val: '৮টি রানিং',
        stat3Label: 'অনুরোধ',
        stat3Val: '১২টি নতুন',
        cta: 'কাজের অনুরোধ পেতে শুরু করুন'
      }
    },
    features10: {
      eyebrow: 'ব্যবসা পরিচালনার সব টুলস এক সাথে',
      title: 'দৈনন্দিন কাজের জন্য পূর্ণাঙ্গ সমাধান',
      items: [
        { title: 'কোটেশন ও এস্টিমেট', desc: 'মিনিটের মধ্যে পেশাদার নির্মাণ কোটেশন তৈরি করুন।' },
        { title: 'প্রজেক্ট ট্র্যাকিং', desc: 'সাইটের কাজের অগ্রগতি সরাসরি রিয়েল-টাইমে দেখুন।' },
        { title: 'ক্লায়েন্ট ডিরেক্টরি', desc: 'গ্রাহক ও সাপ্লায়ারদের তথ্য সুন্দরভাবে সাজিয়ে রাখুন।', isHighlighted: true },
        { title: 'শ্রমিক ও মালামাল', desc: 'শ্রমিকদের মজুরি ও কাঁচামালের সঠিক হিসাব রাখুন।' },
        { title: 'পেমেন্ট ট্র্যাকিং', desc: 'আদায় ও খরচের পূর্ণ হিসাব রাখুন।' },
        { title: 'লাভ ও রিপোর্ট', desc: 'প্রকৃত লাভ এবং আর্থিক অগ্রগতির স্পষ্ট চিত্র।' },
        { title: 'কাজের সুযোগ', desc: 'আপনার এলাকার গ্রাহকদের থেকে সরাসরি কাজের অনুরোধ পান।', isNew: true },
        { title: 'PDF প্রস্তাবনা', desc: 'আকর্ষণীয় PDF কোটেশন পাঠান এবং ক্লায়েন্টের মতামত জানুন।', isNew: true },
        { title: 'ডকুমেন্ট ভল্ট', desc: 'চুক্তিপত্র, রসিদ ও কাজের ছবি নিরাপদে সংরক্ষণ করুন।' },
        { title: 'মোবাইল অ্যাপ', desc: 'ফোন থেকেই সাইটে বসে পুরো প্রজেক্ট পরিচালনা করুন।' }
      ]
    },
    comparison: {
      before: {
        badge: 'আগে যেমন হতো...',
        title: 'আগে যেমন হতো...',
        items: [
          'হোয়াটসঅ্যাপ ও ফোনে কাজের হিসাব এলোমেলো থাকা',
          'কাগজে বা এক্সেলে ভুলভ্রান্তিময় এস্টিমেট',
          'কাগজপত্র ও মালামালের ভাউচার হারিয়ে যাওয়া',
          'ক্লায়েন্টের থেকে টাকা আদায়ে ঝক্কি',
          'প্রজেক্ট থেকে আসলেই কত লাভ হলো তা অজানা থাকা'
        ]
      },
      after: {
        badge: 'এখন ATRIOS BUILD এর সাথে',
        title: 'এখন Atrios Build এর সাথে',
        items: [
          'সব প্রজেক্ট ও ক্লায়েন্ট তথ্য এক জায়গায় পরিপাটি',
          '৬০ সেকেন্ডে প্রস্তুত পেশাদার ব্র্যান্ডেড PDF কোটেশন',
          'মালামাল, শ্রমিক ও সাইট ১০০% নিয়ন্ত্রিত',
          'খরচ ও পাওনার নিখুঁত হিসাব ও নোটিফিকেশন',
          'সপ্তাহে ১০+ ঘণ্টা সময় বাঁচান এবং মুনাফা বৃদ্ধি করুন'
        ]
      },
      ctaBanner: {
        title: 'নির্মাণ পেশাদার ও ঠিকাদারদের জন্য সম্পূর্ণ সফটওয়্যার।',
        sub: 'বেশি গুছানো কাজ, বেশি ক্লায়েন্ট এবং বেশি লাভ। Atrios Build এর সাথে আজই বিনামূল্যে শুরু করুন।',
        trust: [
          { title: 'পূর্ণ নিরাপত্তা', sub: 'এনক্রিপ্টেড ক্লাউড ব্যাকআপ' },
          { title: 'ডেডিকেটেড সাপোর্ট', sub: 'আপনার পাশে সার্বক্ষণিক সাহায্য' },
          { title: 'নিয়মিত আপডেট', sub: 'নতুন নতুন সুবিধা সংযোজন' },
          { title: '+ ঠিকাদার সম্প্রদায়', sub: 'দ্রুত বর্ধনশীল ব্যবহারকারী' }
        ],
        clientTitle: 'বিনামূল্যে কোটেশন চান',
        clientSub: 'আমার মিস্ত্রি বা ঠিকাদার প্রয়োজন',
        proTitle: 'ঠিকাদার হিসেবে যোগ দিন',
        proSub: 'কাজ পান এবং প্রজেক্ট পরিচালনা করুন'
      }
    },
    footer: {
      desc: 'নির্মাণ কোটেশন, ওয়ার্ক অর্ডার এবং আর্থিক প্রকল্প নিয়ন্ত্রণের জন্য সম্পূর্ণ সফটওয়্যার।',
      secure: 'ডেটা নিরাপদ এবং এনক্রিপ্ট করা',
      product: 'পণ্য',
      company: 'প্রতিষ্ঠান',
      support: 'সহায়তা',
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      pdfQuotes: 'PDF কোটেশন',
      createFree: 'ফ্রি অ্যাকাউন্ট খুলুন →',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'ব্যবহারের শর্তাবলী',
      help: 'সাহায্য ও জিজ্ঞাসা',
      demo: 'ডেমো দেখুন',
      installApp: 'মোবাইল অ্যাপ ইনস্টল',
      clientPortal: 'ক্লায়েন্ট পোর্টাল (লগইন)',
      rights: 'সর্বস্বত্ব সংরক্ষিত।',
      tagline: 'নির্মাণ শিল্পের পেশাদারদের জন্য নিখুঁতভাবে তৈরি।'
    }
  }
};

export const getLandingExtended = (locale: Locale): LandingExtended => {
  return landingExtendedTranslations[locale] || landingExtendedTranslations['pt-PT'];
};
