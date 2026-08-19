import { Locale } from '../translations';

export interface LandingTranslationItem {
  nav: {
    features: string;
    howItWorks: string;
    forClients: string;
    forPros: string;
    pricing: string;
    resources: string;
    login: string;
    startFree: string;
    language: string;
  };
  hero: {
    arrowNote: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    titleHighlight: string;
    subtitle: string;
    ctaClient: string;
    ctaClientSub: string;
    ctaPro: string;
    ctaProSub: string;
    badge1Title: string;
    badge1Sub: string;
    badge2Title: string;
    badge2Sub: string;
    badge3Title: string;
    badge3Sub: string;
  };
  timeline: {
    eyebrow: string;
    title: string;
    steps: {
      num: string;
      title: string;
      desc: string;
    }[];
  };
  dualCards: {
    client: {
      tag: string;
      title: string;
      subtitle: string;
      bullets: string[];
      cta: string;
      floatingTitle: string;
      floatingCompanyA: string;
      floatingCompanyB: string;
      floatingCompanyC: string;
      floatingFooter: string;
    };
    pro: {
      tag: string;
      title: string;
      bullets: string[];
      cta: string;
      floatingTitle: string;
      floatingRevenue: string;
      floatingActiveWorks: string;
      floatingRequests: string;
    };
  };
  features: {
    eyebrow: string;
    title: string;
    items: {
      title: string;
      desc: string;
      isNew?: boolean;
    }[];
  };
  comparison: {
    beforeTitle: string;
    beforeItems: string[];
    afterTitle: string;
    afterItems: string[];
  };
  banner: {
    title: string;
    subtitle: string;
    ctaClient: string;
    ctaClientSub: string;
    ctaPro: string;
    ctaProSub: string;
    trust1Title: string;
    trust1Sub: string;
    trust2Title: string;
    trust2Sub: string;
    trust3Title: string;
    trust3Sub: string;
    trust4Title: string;
    trust4Sub: string;
  };
}

export const landingTranslations: Record<string, LandingTranslationItem> = {
  'pt-PT': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profissionais',
      pricing: 'Preços',
      resources: 'Recursos',
      login: 'ENTRAR',
      startFree: 'CRIAR CONTA GRÁTIS',
      language: 'Idioma'
    },
    hero: {
      arrowNote: 'Da solicitação à gestão completa',
      titleLine1: 'Encontre clientes.',
      titleLine2: 'Faça orçamentos.',
      titleLine3: 'Gerencie as suas obras.',
      titleHighlight: 'Tudo num só lugar com o Atrios Build.',
      subtitle: 'Receba pedidos de orçamento de clientes, envie propostas profissionais e tenha todas as ferramentas para gerir o seu negócio e as suas obras.',
      ctaClient: 'PEDIR ORÇAMENTO GRÁTIS',
      ctaClientSub: 'Sou cliente e preciso de uma obra',
      ctaPro: 'SOU PROFISSIONAL',
      ctaProSub: 'Quero receber pedidos e gerir obras',
      badge1Title: 'Seguro e confiável',
      badge1Sub: 'Os seus dados protegidos',
      badge2Title: 'Profissionais verificados',
      badge2Sub: 'Mais segurança para si',
      badge3Title: 'Acesso em qualquer lugar',
      badge3Sub: 'Web e App mobile'
    },
    timeline: {
      eyebrow: 'DO PRIMEIRO CONTACTO AO RESULTADO DA OBRA',
      title: 'Como funciona para todos',
      steps: [
        {
          num: '01',
          title: 'Cliente solicita um orçamento',
          desc: 'O cliente descreve o que precisa e envia o pedido.'
        },
        {
          num: '02',
          title: 'Profissional recebe o pedido',
          desc: 'Empresas e profissionais da plataforma são notificados.'
        },
        {
          num: '03',
          title: 'Profissional prepara a proposta',
          desc: 'Analisa os detalhes da obra e prepara o orçamento.'
        },
        {
          num: '04',
          title: 'Profissional envia a proposta',
          desc: 'O cliente recebe a proposta e pode tirar dúvidas.'
        },
        {
          num: '05',
          title: 'Cliente analisa e escolhe',
          desc: 'Compara as propostas e escolhe o profissional ideal.'
        },
        {
          num: '06',
          title: 'Obra é criada no Atrios Build',
          desc: 'O profissional inicia a obra e organiza tudo na plataforma.'
        },
        {
          num: '07',
          title: 'Gere e acompanhe os resultados',
          desc: 'Controle custos, pagamentos e veja os resultados.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'PARA CLIENTES',
        title: 'Precisa de uma obra?',
        subtitle: 'Encontre profissionais qualificados na nossa plataforma.',
        bullets: [
          'Faça o seu pedido de orçamento grátis',
          'Explique o serviço que precisa',
          'Indique a localização e detalhes da obra',
          'Receba propostas de profissionais verificados',
          'Acompanhe os seus pedidos em tempo real',
          'Escolha a melhor proposta para o seu projeto'
        ],
        cta: 'PEDIR ORÇAMENTO GRÁTIS',
        floatingTitle: 'Receba propostas',
        floatingCompanyA: 'Empresa A — 2.450 €',
        floatingCompanyB: 'Empresa B — 2.150 €',
        floatingCompanyC: 'Empresa C — 2.780 €',
        floatingFooter: 'VER TODAS AS PROPOSTAS'
      },
      pro: {
        tag: 'PARA PROFISSIONAIS',
        title: 'Transforme pedidos de orçamento em novas oportunidades.',
        bullets: [
          'Receba novos pedidos de orçamento',
          'Consulte detalhes e localização da obra',
          'Analise e prepare o seu orçamento',
          'Envie propostas de forma profissional',
          'Organize obras, clientes e documentos',
          'Acompanhe pagamentos e resultados',
          'Tudo numa única plataforma'
        ],
        cta: 'QUERO RECEBER PEDIDOS',
        floatingTitle: 'Resumo do mês',
        floatingRevenue: '18.650 €',
        floatingActiveWorks: '8 Obras ativas',
        floatingRequests: '12 Novos pedidos'
      }
    },
    features: {
      eyebrow: 'TUDO O QUE PRECISA PARA GERIR O SEU NEGÓCIO',
      title: 'Funcionalidades completas para o dia a dia',
      items: [
        {
          title: 'Orçamentos',
          desc: 'Crie orçamentos e propostas profissionais em minutos.'
        },
        {
          title: 'Obras',
          desc: 'Acompanhe o progresso de cada obra em tempo real.'
        },
        {
          title: 'Clientes',
          desc: 'Organize clientes e fornecedores num só lugar.'
        },
        {
          title: 'Serviços',
          desc: 'Gerencie serviços, materiais e mão de obra.'
        },
        {
          title: 'Pagamentos',
          desc: 'Controle recebimentos e pagamentos.'
        },
        {
          title: 'Relatórios',
          desc: 'Relatórios e indicadores para melhores decisões.'
        },
        {
          title: 'Pedidos de orçamento',
          desc: 'Receba solicitações de clientes diretamente na plataforma.',
          isNew: true
        },
        {
          title: 'Propostas',
          desc: 'Envie propostas e acompanhe o interesse do cliente.',
          isNew: true
        },
        {
          title: 'Documentos',
          desc: 'Guarde e acesse documentos da obra com segurança.'
        },
        {
          title: 'App mobile',
          desc: 'Acesse de qualquer lugar pelo telemóvel.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'ANTES ERA ASSIM...',
      beforeItems: [
        'Pedidos espalhados pelo WhatsApp e chamadas',
        'Orçamentos em papel ou planilhas',
        'Informações desorganizadas',
        'Dificuldade para acompanhar clientes',
        'Pouco controle dos resultados'
      ],
      afterTitle: 'AGORA É ASSIM, COM O ATRIOS BUILD',
      afterItems: [
        'Pedidos organizados num só lugar',
        'Propostas profissionais e centralizadas',
        'Clientes e obras organizados',
        'Mais controle de custos e pagamentos',
        'Mais tempo e mais lucro para o seu negócio'
      ]
    },
    banner: {
      title: 'A plataforma completa para profissionais da construção civil.',
      subtitle: 'Mais organização, mais oportunidades e mais resultados. Comece agora com o Atrios Build.',
      ctaClient: 'PEDIR ORÇAMENTO GRÁTIS',
      ctaClientSub: 'Sou cliente e preciso de uma obra',
      ctaPro: 'QUERO SER PROFISSIONAL',
      ctaProSub: 'Quero receber pedidos e gerir obras',
      trust1Title: 'Segurança total',
      trust1Sub: 'Seus dados protegidos',
      trust2Title: 'Suporte dedicado',
      trust2Sub: 'Estamos aqui para ajudar',
      trust3Title: 'Atualizações constantes',
      trust3Sub: 'Sempre melhor para si',
      trust4Title: '+ Profissionais',
      trust4Sub: 'Plataforma em crescimento'
    }
  },
  'pt-BR': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Como funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profissionais',
      pricing: 'Preços',
      resources: 'Recursos',
      login: 'ENTRAR',
      startFree: 'CRIAR CONTA GRÁTIS',
      language: 'Idioma'
    },
    hero: {
      arrowNote: 'Da solicitação à gestão completa',
      titleLine1: 'Encontre clientes.',
      titleLine2: 'Faça orçamentos.',
      titleLine3: 'Gerencie as suas obras.',
      titleHighlight: 'Tudo num só lugar com o Atrios Build.',
      subtitle: 'Receba pedidos de orçamento de clientes, envie propostas profissionais e tenha todas as ferramentas para gerenciar seu negócio e suas obras.',
      ctaClient: 'PEDIR ORÇAMENTO GRÁTIS',
      ctaClientSub: 'Sou cliente e preciso de uma obra',
      ctaPro: 'SOU PROFISSIONAL',
      ctaProSub: 'Quero receber pedidos e gerenciar obras',
      badge1Title: 'Seguro e confiável',
      badge1Sub: 'Seus dados protegidos',
      badge2Title: 'Profissionais verificados',
      badge2Sub: 'Mais segurança para você',
      badge3Title: 'Acesso em qualquer lugar',
      badge3Sub: 'Web e App mobile'
    },
    timeline: {
      eyebrow: 'DO PRIMEIRO CONTATO AO RESULTADO DA OBRA',
      title: 'Como funciona para todos',
      steps: [
        {
          num: '01',
          title: 'Cliente solicita um orçamento',
          desc: 'O cliente descreve o que precisa e envia o pedido.'
        },
        {
          num: '02',
          title: 'Profissional recebe o pedido',
          desc: 'Empresas e profissionais da plataforma são notificados.'
        },
        {
          num: '03',
          title: 'Profissional prepara a proposta',
          desc: 'Analisa os detalhes da obra e prepara o orçamento.'
        },
        {
          num: '04',
          title: 'Profissional envia a proposta',
          desc: 'O cliente recebe a proposta e pode tirar dúvidas.'
        },
        {
          num: '05',
          title: 'Cliente analisa e escolhe',
          desc: 'Compara as propostas e escolhe o profissional ideal.'
        },
        {
          num: '06',
          title: 'Obra é criada no Atrios Build',
          desc: 'O profissional inicia a obra e organiza tudo na plataforma.'
        },
        {
          num: '07',
          title: 'Gerencie e acompanhe resultados',
          desc: 'Controle custos, pagamentos e veja os resultados.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'PARA CLIENTES',
        title: 'Precisa de uma obra?',
        subtitle: 'Encontre profissionais qualificados na nossa plataforma.',
        bullets: [
          'Faça seu pedido de orçamento grátis',
          'Explique o serviço que precisa',
          'Indique a localização e detalhes da obra',
          'Receba propostas de profissionais verificados',
          'Acompanhe seus pedidos em tempo real',
          'Escolha a melhor proposta para o seu projeto'
        ],
        cta: 'PEDIR ORÇAMENTO GRÁTIS',
        floatingTitle: 'Receba propostas',
        floatingCompanyA: 'Empresa A — R$ 2.450',
        floatingCompanyB: 'Empresa B — R$ 2.150',
        floatingCompanyC: 'Empresa C — R$ 2.780',
        floatingFooter: 'VER TODAS AS PROPOSTAS'
      },
      pro: {
        tag: 'PARA PROFISSIONAIS',
        title: 'Transforme pedidos de orçamento em novas oportunidades.',
        bullets: [
          'Receba novos pedidos de orçamento',
          'Consulte detalhes e localização da obra',
          'Analise e prepare o seu orçamento',
          'Envie propostas de forma profissional',
          'Organize obras, clientes e documentos',
          'Acompanhe pagamentos e resultados',
          'Tudo numa única plataforma'
        ],
        cta: 'QUERO RECEBER PEDIDOS',
        floatingTitle: 'Resumo do mês',
        floatingRevenue: 'R$ 18.650',
        floatingActiveWorks: '8 Obras ativas',
        floatingRequests: '12 Novos pedidos'
      }
    },
    features: {
      eyebrow: 'TUDO O QUE VOCÊ PRECISA PARA GERENCIAR SEU NEGÓCIO',
      title: 'Funcionalidades completas para o dia a dia',
      items: [
        {
          title: 'Orçamentos',
          desc: 'Crie orçamentos e propostas profissionais em minutos.'
        },
        {
          title: 'Obras',
          desc: 'Acompanhe o progresso de cada obra em tempo real.'
        },
        {
          title: 'Clientes',
          desc: 'Organize clientes e fornecedores em um só lugar.'
        },
        {
          title: 'Serviços',
          desc: 'Gerencie serviços, materiais e mão de obra.'
        },
        {
          title: 'Pagamentos',
          desc: 'Controle recebimentos e pagamentos.'
        },
        {
          title: 'Relatórios',
          desc: 'Relatórios e indicadores para melhores decisões.'
        },
        {
          title: 'Pedidos de orçamento',
          desc: 'Receba solicitações de clientes diretamente na plataforma.',
          isNew: true
        },
        {
          title: 'Propostas',
          desc: 'Envie propostas e acompanhe o interesse do cliente.',
          isNew: true
        },
        {
          title: 'Documentos',
          desc: 'Guarde e acesse documentos da obra com segurança.'
        },
        {
          title: 'App mobile',
          desc: 'Acesse de qualquer lugar pelo celular.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'ANTES ERA ASSIM...',
      beforeItems: [
        'Pedidos espalhados pelo WhatsApp e ligações',
        'Orçamentos em papel ou planilhas',
        'Informações desorganizadas',
        'Dificuldade para acompanhar clientes',
        'Pouco controle dos resultados'
      ],
      afterTitle: 'AGORA É ASSIM, COM O ATRIOS BUILD',
      afterItems: [
        'Pedidos organizados em um só lugar',
        'Propostas profissionais e centralizadas',
        'Clientes e obras organizados',
        'Mais controle de custos e pagamentos',
        'Mais tempo e mais lucro para seu negócio'
      ]
    },
    banner: {
      title: 'A plataforma completa para profissionais da construção civil.',
      subtitle: 'Mais organização, mais oportunidades e mais resultados. Comece agora com o Atrios Build.',
      ctaClient: 'PEDIR ORÇAMENTO GRÁTIS',
      ctaClientSub: 'Sou cliente e preciso de uma obra',
      ctaPro: 'QUERO SER PROFISSIONAL',
      ctaProSub: 'Quero receber pedidos e gerenciar obras',
      trust1Title: 'Segurança total',
      trust1Sub: 'Seus dados protegidos',
      trust2Title: 'Suporte dedicado',
      trust2Sub: 'Estamos aqui para ajudar',
      trust3Title: 'Atualizações constantes',
      trust3Sub: 'Sempre melhor para você',
      trust4Title: '+ Profissionais',
      trust4Sub: 'Plataforma em crescimento'
    }
  },
  'en-US': {
    nav: {
      features: 'Features',
      howItWorks: 'How it works',
      forClients: 'For Clients',
      forPros: 'For Contractors',
      pricing: 'Pricing',
      resources: 'Resources',
      login: 'SIGN IN',
      startFree: 'START FREE ACCOUNT',
      language: 'Language'
    },
    hero: {
      arrowNote: 'From request to complete project management',
      titleLine1: 'Find clients.',
      titleLine2: 'Build estimates.',
      titleLine3: 'Manage your job sites.',
      titleHighlight: 'All in one place with Atrios Build.',
      subtitle: 'Receive quote requests from real clients, send winning professional proposals, and access all tools to run your construction business seamlessly.',
      ctaClient: 'REQUEST FREE ESTIMATE',
      ctaClientSub: 'I am a client needing construction work',
      ctaPro: 'I AM A CONTRACTOR',
      ctaProSub: 'I want to receive client leads & manage jobs',
      badge1Title: 'Safe and Reliable',
      badge1Sub: 'Your data is 100% protected',
      badge2Title: 'Verified Contractors',
      badge2Sub: 'Higher trust and security',
      badge3Title: 'Access Anywhere',
      badge3Sub: 'Web and Mobile App'
    },
    timeline: {
      eyebrow: 'FROM FIRST CONTACT TO FINISHED CONSTRUCTION',
      title: 'How it works for everyone',
      steps: [
        {
          num: '01',
          title: 'Client requests a quote',
          desc: 'Client describes project requirements and submits details.'
        },
        {
          num: '02',
          title: 'Contractors receive the lead',
          desc: 'Local verified contractors get notified instantly.'
        },
        {
          num: '03',
          title: 'Contractor prepares proposal',
          desc: 'Reviews job site specs and crafts a detailed estimate.'
        },
        {
          num: '04',
          title: 'Proposal is sent to client',
          desc: 'Client receives a clean digital proposal and clarifies questions.'
        },
        {
          num: '05',
          title: 'Client compares & hires',
          desc: 'Compares incoming quotes and selects the best builder.'
        },
        {
          num: '06',
          title: 'Job is managed on Atrios Build',
          desc: 'Contractor kicks off project and organizes tasks, materials & team.'
        },
        {
          num: '07',
          title: 'Track profits & payments',
          desc: 'Control job costs, invoices, milestones, and client payouts.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'FOR CLIENTS',
        title: 'Need a construction or renovation job?',
        subtitle: 'Find top verified contractors on our platform.',
        bullets: [
          'Submit your quote request for free',
          'Describe the service and materials needed',
          'Set location, timeline, and photo attachments',
          'Receive detailed proposals from verified pros',
          'Track incoming bids in real time',
          'Hire the best contractor for your budget'
        ],
        cta: 'REQUEST FREE ESTIMATE',
        floatingTitle: 'Received proposals',
        floatingCompanyA: 'Company A — $2,450',
        floatingCompanyB: 'Company B — $2,150',
        floatingCompanyC: 'Company C — $2,780',
        floatingFooter: 'VIEW ALL PROPOSALS'
      },
      pro: {
        tag: 'FOR CONTRACTORS',
        title: 'Turn customer quote requests into profitable jobs.',
        bullets: [
          'Receive fresh job leads and client requests daily',
          'Inspect exact project specifications and locations',
          'Calculate accurate costs and generate PDF estimates',
          'Deliver branded, professional proposals in seconds',
          'Manage projects, clients, materials, and crew',
          'Track milestones, expenses, and invoices',
          'All in one comprehensive platform'
        ],
        cta: 'I WANT TO RECEIVE LEADS',
        floatingTitle: 'Monthly Overview',
        floatingRevenue: '$18,650',
        floatingActiveWorks: '8 Active Jobs',
        floatingRequests: '12 New Inquiries'
      }
    },
    features: {
      eyebrow: 'EVERYTHING YOU NEED TO GROW YOUR CONSTRUCTION BUSINESS',
      title: 'Full suite of daily management tools',
      items: [
        {
          title: 'Estimates & Quotes',
          desc: 'Create beautiful PDF estimates and quotes in minutes.'
        },
        {
          title: 'Job Sites & Projects',
          desc: 'Track daily progress and milestones on every job site.'
        },
        {
          title: 'Clients & Suppliers',
          desc: 'Centralize contacts, customer logs, and vendor catalogs.'
        },
        {
          title: 'Materials & Services',
          desc: 'Manage catalog pricing, labor rates, and supply costs.'
        },
        {
          title: 'Payments & Invoicing',
          desc: 'Stay on top of accounts receivable, expenses, and cash flow.'
        },
        {
          title: 'Reports & Analytics',
          desc: 'Gain real-time insights into your gross profit and costs.'
        },
        {
          title: 'Client Leads Hub',
          desc: 'Receive direct job inquiries from homeowners on the platform.',
          isNew: true
        },
        {
          title: 'Proposals Engine',
          desc: 'Send digital bids and get real-time client notifications.',
          isNew: true
        },
        {
          title: 'Document Vault',
          desc: 'Store blueprints, contracts, photos, and permits securely.'
        },
        {
          title: 'Mobile App',
          desc: 'Access your projects anytime from your smartphone or tablet.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'HOW IT USED TO BE...',
      beforeItems: [
        'Client requests lost in WhatsApp chats and phone calls',
        'Messy handwritten estimates or broken spreadsheets',
        'Disorganized paperwork and lost customer records',
        'Difficulty following up and closing deals',
        'No clear visibility on job site profit margins'
      ],
      afterTitle: 'NOW WITH ATRIOS BUILD',
      afterItems: [
        'All client requests organized in one unified inbox',
        'Standardized, professional proposals that close deals',
        'Clients, job sites, and documents cleanly organized',
        'Complete control over payments, milestones, and expenses',
        'More free time, higher margins, and steady business growth'
      ]
    },
    banner: {
      title: 'The complete software suite for construction professionals.',
      subtitle: 'More organization, higher conversions, and better profitability. Join Atrios Build today.',
      ctaClient: 'REQUEST FREE ESTIMATE',
      ctaClientSub: 'I am a client needing work done',
      ctaPro: 'BECOME A PRO PARTNER',
      ctaProSub: 'I want to receive client leads and manage projects',
      trust1Title: 'Total Security',
      trust1Sub: 'Your business data is encrypted',
      trust2Title: 'Dedicated Support',
      trust2Sub: 'Our team is always here for you',
      trust3Title: 'Continuous Updates',
      trust3Sub: 'New features and improvements regularly',
      trust4Title: 'Fast Growing Network',
      trust4Sub: 'Thousands of verified contractors'
    }
  },
  'es-ES': {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Cómo funciona',
      forClients: 'Para Clientes',
      forPros: 'Para Profesionales',
      pricing: 'Precios',
      resources: 'Recursos',
      login: 'INICIAR SESIÓN',
      startFree: 'CREAR CUENTA GRATIS',
      language: 'Idioma'
    },
    hero: {
      arrowNote: 'De la solicitud a la gestión completa',
      titleLine1: 'Encuentre clientes.',
      titleLine2: 'Haga presupuestos.',
      titleLine3: 'Gestione sus obras.',
      titleHighlight: 'Todo en un solo lugar con Atrios Build.',
      subtitle: 'Reciba solicitudes de presupuestos de clientes, envíe propuestas profesionales y disponga de todas las herramientas para gestionar su negocio y sus obras.',
      ctaClient: 'PEDIR PRESUPUESTO GRATIS',
      ctaClientSub: 'Soy cliente y necesito una obra o reforma',
      ctaPro: 'SOY PROFESIONAL',
      ctaProSub: 'Quiero recibir solicitudes y gestionar obras',
      badge1Title: 'Seguro y confiable',
      badge1Sub: 'Sus datos siempre protegidos',
      badge2Title: 'Profesionales verificados',
      badge2Sub: 'Mayor seguridad para usted',
      badge3Title: 'Acceso en cualquier lugar',
      badge3Sub: 'Web y App móvil'
    },
    timeline: {
      eyebrow: 'DESDE EL PRIMER CONTACTO HASTA LA ENTREGA DE LA OBRA',
      title: 'Cómo funciona para todos',
      steps: [
        {
          num: '01',
          title: 'El cliente solicita un presupuesto',
          desc: 'Describe lo que necesita y envía su solicitud.'
        },
        {
          num: '02',
          title: 'El profesional recibe la solicitud',
          desc: 'Las empresas de la plataforma reciben la notificación.'
        },
        {
          num: '03',
          title: 'El profesional prepara la propuesta',
          desc: 'Analiza los detalles de la obra y calcula costes.'
        },
        {
          num: '04',
          title: 'Se envía la propuesta al cliente',
          desc: 'El cliente recibe la propuesta y resuelve dudas.'
        },
        {
          num: '05',
          title: 'El cliente analiza y elige',
          desc: 'Compara presupuestos y contrata al profesional ideal.'
        },
        {
          num: '06',
          title: 'La obra se crea en Atrios Build',
          desc: 'El profesional organiza tareas, materiales y equipo.'
        },
        {
          num: '07',
          title: 'Gestione y controle los resultados',
          desc: 'Supervise pagos, costes y margen de beneficio.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'PARA CLIENTES',
        title: '¿Necesita una obra o reforma?',
        subtitle: 'Encuentre profesionales cualificados en nuestra plataforma.',
        bullets: [
          'Haga su solicitud de presupuesto gratis',
          'Explique el servicio que necesita',
          'Indique la ubicación y detalles de la obra',
          'Reciba propuestas de profesionales verificados',
          'Siga sus solicitudes en tiempo real',
          'Elija la mejor opción para su proyecto'
        ],
        cta: 'PEDIR PRESUPUESTO GRATIS',
        floatingTitle: 'Reciba propuestas',
        floatingCompanyA: 'Empresa A — 2.450 €',
        floatingCompanyB: 'Empresa B — 2.150 €',
        floatingCompanyC: 'Empresa C — 2.780 €',
        floatingFooter: 'VER TODAS LAS PROPUESTAS'
      },
      pro: {
        tag: 'PARA PROFESIONALES',
        title: 'Transforme solicitudes de clientes en obras rentables.',
        bullets: [
          'Reciba nuevas solicitudes de presupuesto cada día',
          'Consulte los detalles y la ubicación de la obra',
          'Calcule costes y elabore su presupuesto',
          'Envíe propuestas con acabado profesional',
          'Organice obras, clientes y documentos',
          'Controle pagos y resultados financieros',
          'Todo en una sola plataforma'
        ],
        cta: 'QUIERO RECIBIR SOLICITUDES',
        floatingTitle: 'Resumen del mes',
        floatingRevenue: '18.650 €',
        floatingActiveWorks: '8 Obras activas',
        floatingRequests: '12 Nuevas solicitudes'
      }
    },
    features: {
      eyebrow: 'TODO LO QUE NECESITA PARA GESTIONAR SU NEGOCIO',
      title: 'Funcionalidades completas para su día a día',
      items: [
        {
          title: 'Presupuestos',
          desc: 'Cree presupuestos y propuestas profesionales en minutos.'
        },
        {
          title: 'Obras',
          desc: 'Supervise el progreso de cada obra en tiempo real.'
        },
        {
          title: 'Clientes',
          desc: 'Organice clientes y proveedores en un único lugar.'
        },
        {
          title: 'Servicios',
          desc: 'Gestione precios de mano de obra y materiales.'
        },
        {
          title: 'Pagos',
          desc: 'Controle cobros, gastos y flujo de caja.'
        },
        {
          title: 'Informes',
          desc: 'Indicadores claros para tomar mejores decisiones.'
        },
        {
          title: 'Solicitudes de clientes',
          desc: 'Reciba peticiones de clientes directamente en la plataforma.',
          isNew: true
        },
        {
          title: 'Propuestas',
          desc: 'Envíe propuestas y conozca el interés del cliente.',
          isNew: true
        },
        {
          title: 'Documentos',
          desc: 'Guarde planos, contratos y fotos con total seguridad.'
        },
        {
          title: 'App móvil',
          desc: 'Acceda desde cualquier lugar a través de su móvil.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'ANTES ERA ASÍ...',
      beforeItems: [
        'Solicitudes dispersas en WhatsApp y llamadas',
        'Presupuestos en papel o en hojas de cálculo desordenadas',
        'Información desorganizada y datos perdidos',
        'Dificultad para hacer seguimiento a clientes',
        'Poco control sobre costes y beneficios reales'
      ],
      afterTitle: 'AHORA ES ASÍ, CON ATRIOS BUILD',
      afterItems: [
        'Solicitudes organizadas en una bandeja única',
        'Propuestas profesionales que transmiten confianza',
        'Clientes, obras y documentos organizados',
        'Control total de costes, pagos y beneficios',
        'Más tiempo libre y mayor rentabilidad para su empresa'
      ]
    },
    banner: {
      title: 'La plataforma integral para profesionales de la construcción.',
      subtitle: 'Más organización, más oportunidades y mejores resultados. Empiece hoy con Atrios Build.',
      ctaClient: 'PEDIR PRESUPUESTO GRATIS',
      ctaClientSub: 'Soy cliente y necesito una obra',
      ctaPro: 'QUIERO SER PROFESIONAL',
      ctaProSub: 'Quiero recibir clientes y gestionar obras',
      trust1Title: 'Seguridad total',
      trust1Sub: 'Sus datos protegidos',
      trust2Title: 'Soporte dedicado',
      trust2Sub: 'Siempre a su disposición',
      trust3Title: 'Actualizaciones continuas',
      trust3Sub: 'Mejoras constantes',
      trust4Title: '+ Profesionales',
      trust4Sub: 'Plataforma en expansión'
    }
  },
  'fr-FR': {
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      forClients: 'Pour Particuliers',
      forPros: 'Pour Professionnels',
      pricing: 'Tarifs',
      resources: 'Ressources',
      login: 'SE CONNECTER',
      startFree: 'CRÉER UN COMPTE GRATUIT',
      language: 'Langue'
    },
    hero: {
      arrowNote: 'De la demande à la gestion complète du chantier',
      titleLine1: 'Trouvez des clients.',
      titleLine2: 'Créez vos devis.',
      titleLine3: 'Gérez vos chantiers.',
      titleHighlight: 'Tout en un seul endroit avec Atrios Build.',
      subtitle: 'Recevez des demandes de devis de clients, envoyez des propositions professionnelles et disposez de tous les outils pour piloter votre activité du bâtiment.',
      ctaClient: 'DEMANDER UN DEVIS GRATUIT',
      ctaClientSub: 'Je suis un particulier et j’ai un projet',
      ctaPro: 'JE SUIS PROFESSIONNEL',
      ctaProSub: 'Je veux recevoir des chantiers et gérer mon activité',
      badge1Title: 'Sécurisé et fiable',
      badge1Sub: 'Vos données sont protégées',
      badge2Title: 'Artisans vérifiés',
      badge2Sub: 'Plus de confiance et de sécurité',
      badge3Title: 'Accès partout',
      badge3Sub: 'Web et Application mobile'
    },
    timeline: {
      eyebrow: 'DU PREMIER CONTACT À LA RÉALISATION DU CHANTIER',
      title: 'Comment ça fonctionne pour tous',
      steps: [
        {
          num: '01',
          title: 'Le client demande un devis',
          desc: 'Le client décrit son projet et envoie sa demande.'
        },
        {
          num: '02',
          title: 'Le professionnel reçoit le projet',
          desc: 'Les artisans et entreprises qualifiés sont notifiés.'
        },
        {
          num: '03',
          title: 'Préparation de la proposition',
          desc: 'Analyse des besoins et chiffrage précis du devis.'
        },
        {
          num: '04',
          title: 'Envoi du devis au client',
          desc: 'Le client consulte le devis digitalisé et pose ses questions.'
        },
        {
          num: '05',
          title: 'Le client compare et choisit',
          desc: 'Sélectionne la proposition idéale et valide le chantier.'
        },
        {
          num: '06',
          title: 'Le chantier démarre sur Atrios Build',
          desc: 'L’artisan organise les tâches, matériaux et planning.'
        },
        {
          num: '07',
          title: 'Suivi des résultats et paiements',
          desc: 'Contrôlez les coûts, la facturation et la rentabilité.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'POUR PARTICULIERS',
        title: 'Besoin de travaux ou rénovation ?',
        subtitle: 'Trouvez des artisans qualifiés sur notre plateforme.',
        bullets: [
          'Déposez votre demande de devis gratuitement',
          'Détaillez les travaux et matériaux souhaités',
          'Indiquez la localisation et vos photos',
          'Recevez les offres d’artisans vérifiés',
          'Suivez vos demandes en temps réel',
          'Choisissez le meilleur professionnel pour votre budget'
        ],
        cta: 'DEMANDER UN DEVIS GRATUIT',
        floatingTitle: 'Devis reçus',
        floatingCompanyA: 'Entreprise A — 2 450 €',
        floatingCompanyB: 'Entreprise B — 2 150 €',
        floatingCompanyC: 'Entreprise C — 2 780 €',
        floatingFooter: 'VOIR TOUS LES DEVIS'
      },
      pro: {
        tag: 'POUR PROFESSIONNELS',
        title: 'Transformez chaque demande en chantier rentable.',
        bullets: [
          'Recevez de nouvelles demandes de devis chaque jour',
          'Consultez les détails précis et la localisation du chantier',
          'Chiffrez rapidement vos devis professionnels',
          'Envoyez des propositions claires qui convertissent',
          'Organisez vos chantiers, clients et documents',
          'Suivez les règlements et votre trésorerie',
          'Tout sur une seule plateforme'
        ],
        cta: 'RECEVOIR DES DEMANDES',
        floatingTitle: 'Bilan du mois',
        floatingRevenue: '18 650 €',
        floatingActiveWorks: '8 Chantiers actifs',
        floatingRequests: '12 Nouvelles demandes'
      }
    },
    features: {
      eyebrow: 'TOUT CE DONT VOUS AVEZ BESOIN POUR DIRIGER VOTRE ENTREPRISE',
      title: 'Des fonctionnalités complètes pour le quotidien',
      items: [
        {
          title: 'Devis & Factures',
          desc: 'Créez des devis et propositions impeccables en quelques minutes.'
        },
        {
          title: 'Gestion de chantiers',
          desc: 'Suivez l’avancement et les étapes clés en temps réel.'
        },
        {
          title: 'Clients & Fournisseurs',
          desc: 'Centralisez votre carnet d’adresses et historique.'
        },
        {
          title: 'Ouvrages & Matériaux',
          desc: 'Gérez vos prix de main-d’œuvre et catalogue de matériaux.'
        },
        {
          title: 'Paiements & Acomptes',
          desc: 'Suivez les encaissements et les dépenses du chantier.'
        },
        {
          title: 'Rapports & Rentabilité',
          desc: 'Visualisez vos marges et performances en un coup d’œil.'
        },
        {
          title: 'Demandes de clients',
          desc: 'Recevez des leads qualifiés directement sur la plateforme.',
          isNew: true
        },
        {
          title: 'Propositions digitales',
          desc: 'Envoyez vos offres et suivez l’intérêt du client.',
          isNew: true
        },
        {
          title: 'Coffre documentaire',
          desc: 'Stockez plans, contrats et photos de chantier en sécurité.'
        },
        {
          title: 'Application mobile',
          desc: 'Accédez à votre activité partout depuis votre smartphone.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'AVANT C’ÉTAIT COMME ÇA...',
      beforeItems: [
        'Demandes éparpillées sur WhatsApp et appels manqués',
        'Devis manuscrits ou tableurs Excel complexes',
        'Informations éparpillées et perte de documents',
        'Difficulté à relancer les clients efficacement',
        'Manque de visibilité sur les marges réelles'
      ],
      afterTitle: 'MAINTENANT AVEC ATRIOS BUILD',
      afterItems: [
        'Toutes les demandes centralisées au même endroit',
        'Propositions professionnelles qui inspirent confiance',
        'Chantiers, clients et documents parfaitement organisés',
        'Maîtrise totale des dépenses, paiements et jalons',
        'Gain de temps et rentabilité accrue pour votre entreprise'
      ]
    },
    banner: {
      title: 'La plateforme complète pour les professionnels du bâtiment.',
      subtitle: 'Plus d’organisation, plus d’opportunités et plus de résultats. Démarrez dès maintenant avec Atrios Build.',
      ctaClient: 'DEMANDER UN DEVIS GRATUIT',
      ctaClientSub: 'Je suis un client et j’ai un projet',
      ctaPro: 'DEVENIR PROFESSIONNEL PARTENAIRE',
      ctaProSub: 'Je veux recevoir des chantiers et gérer mes travaux',
      trust1Title: 'Sécurité totale',
      trust1Sub: 'Données protégées',
      trust2Title: 'Support dédié',
      trust2Sub: 'Une équipe toujours à vos côtés',
      trust3Title: 'Mises à jour constantes',
      trust3Sub: 'Des nouveautés régulières',
      trust4Title: '+ Professionnels',
      trust4Sub: 'Réseau en forte croissance'
    }
  },
  'it-IT': {
    nav: {
      features: 'Funzionalità',
      howItWorks: 'Come funziona',
      forClients: 'Per Clienti',
      forPros: 'Per Professionisti',
      pricing: 'Prezzi',
      resources: 'Risorse',
      login: 'ACCEDI',
      startFree: 'REGISTRATI GRATIS',
      language: 'Lingua'
    },
    hero: {
      arrowNote: 'Dalla richiesta alla gestione completa',
      titleLine1: 'Trova clienti.',
      titleLine2: 'Crea preventivi.',
      titleLine3: 'Gestisci i tuoi cantieri.',
      titleHighlight: 'Tutto in un unico posto con Atrios Build.',
      subtitle: 'Ricevi richieste di preventivo da clienti, invia proposte professionali e accedi a tutti gli strumenti per gestire la tua impresa edile e i tuoi cantieri.',
      ctaClient: 'RICHIEDI PREVENTIVO GRATIS',
      ctaClientSub: 'Sono un cliente e ho bisogno di lavori',
      ctaPro: 'SONO UN PROFESSIONISTA',
      ctaProSub: 'Voglio ricevere richieste e gestire cantieri',
      badge1Title: 'Sicuro e affidabile',
      badge1Sub: 'I tuoi dati sono protetti',
      badge2Title: 'Professionisti verificati',
      badge2Sub: 'Massima trasparenza e sicurezza',
      badge3Title: 'Accessibile ovunque',
      badge3Sub: 'Web e App mobile'
    },
    timeline: {
      eyebrow: 'DAL PRIMO CONTATTO AL COMPLETAMENTO DEI LAVORI',
      title: 'Come funziona per tutti',
      steps: [
        {
          num: '01',
          title: 'Il cliente richiede un preventivo',
          desc: 'Descrive le esigenze del progetto e invia la richiesta.'
        },
        {
          num: '02',
          title: 'I professionisti ricevono la richiesta',
          desc: 'Le imprese qualificate della zona vengono notificate.'
        },
        {
          num: '03',
          title: 'Preparazione del preventivo',
          desc: 'Analisi dei requisiti e calcolo dettagliato dei costi.'
        },
        {
          num: '04',
          title: 'Invio della proposta al cliente',
          desc: 'Il cliente visualizza l’offerta digitale e chiarisce i dettagli.'
        },
        {
          num: '05',
          title: 'Il cliente sceglie il professionista',
          desc: 'Confronta le opzioni e approva la proposta ideale.'
        },
        {
          num: '06',
          title: 'Il cantiere viene avviato su Atrios Build',
          desc: 'L’impresa organizza materiali, manodopera e scadenze.'
        },
        {
          num: '07',
          title: 'Monitoraggio e controllo economico',
          desc: 'Controlla costi, pagamenti, avanzamento e profitto.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'PER CLIENTI',
        title: 'Hai bisogno di lavori o ristrutturazioni?',
        subtitle: 'Trova professionisti qualificati sulla nostra piattaforma.',
        bullets: [
          'Invia la tua richiesta di preventivo gratuitamente',
          'Descrivi i lavori e i dettagli necessari',
          'Indica la posizione e allega eventuali foto',
          'Ricevi proposte da professionisti verificati',
          'Segui l’avanzamento delle offerte in tempo reale',
          'Scegli il miglior preventivo per il tuo budget'
        ],
        cta: 'RICHIEDI PREVENTIVO GRATIS',
        floatingTitle: 'Proposte ricevute',
        floatingCompanyA: 'Impresa A — 2.450 €',
        floatingCompanyB: 'Impresa B — 2.150 €',
        floatingCompanyC: 'Impresa C — 2.780 €',
        floatingFooter: 'VEDI TUTTE LE PROPOSTE'
      },
      pro: {
        tag: 'PER PROFESSIONISTI',
        title: 'Trasforma le richieste in cantieri profittevoli.',
        bullets: [
          'Ricevi nuove richieste di preventivo ogni giorno',
          'Consulta i dettagli e la posizione esatta del lavoro',
          'Prepara preventivi accurati in pochissimi minuti',
          'Invia proposte chiare che conquistano i clienti',
          'Organizza cantieri, clienti e documenti tecnici',
          'Monitora pagamenti, acconti e profitti',
          'Tutto in una sola piattaforma'
        ],
        cta: 'VOGLIO RICEVERE RICHIESTE',
        floatingTitle: 'Riepilogo del mese',
        floatingRevenue: '18.650 €',
        floatingActiveWorks: '8 Cantieri attivi',
        floatingRequests: '12 Nuove richieste'
      }
    },
    features: {
      eyebrow: 'TUTTO CIÒ CHE TI SERVE PER GESTIRE LA TUA IMPRESA',
      title: 'Funzionalità complete per il lavoro quotidiano',
      items: [
        {
          title: 'Preventivi',
          desc: 'Crea preventivi e computi professionali in pochi minuti.'
        },
        {
          title: 'Cantieri',
          desc: 'Segui lo stato di avanzamento di ogni opera in tempo reale.'
        },
        {
          title: 'Clienti e Fornitori',
          desc: 'Organizza contatti e cronologia in un unico archivio.'
        },
        {
          title: 'Lavorazioni e Materiali',
          desc: 'Gestisci listini di manodopera, servizi e forniture.'
        },
        {
          title: 'Pagamenti',
          desc: 'Tieni sotto controllo acconti, saldi e spese.'
        },
        {
          title: 'Report e Margini',
          desc: 'Analisi chiare per prendere sempre decisioni vincenti.'
        },
        {
          title: 'Richieste di preventivo',
          desc: 'Ricevi contatti diretti da clienti sulla piattaforma.',
          isNew: true
        },
        {
          title: 'Proposte digitali',
          desc: 'Invia offerte e monitora l’interesse del cliente.',
          isNew: true
        },
        {
          title: 'Documenti e Foto',
          desc: 'Archivia planimetrie, contratti e certificazioni in sicurezza.'
        },
        {
          title: 'App Mobile',
          desc: 'Accedi da qualsiasi cantiere direttamente dallo smartphone.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'PRIMA ERA COSÌ...',
      beforeItems: [
        'Richieste disperse su WhatsApp e telefonate perse',
        'Preventivi su fogli di carta o file Excel disordinati',
        'Dati sparsi e documenti difficili da reperire',
        'Difficoltà a fare follow-up con i clienti',
        'Poco controllo sui margini reali di guadagno'
      ],
      afterTitle: 'ORA È COSÌ, CON ATRIOS BUILD',
      afterItems: [
        'Tutte le richieste organizzate in un unico cruscotto',
        'Proposte eleganti e professionali che chiudono contratti',
        'Cantieri, clienti e fatture perfettamente coordinati',
        'Controllo rigoroso su spese, scadenze e incassi',
        'Più tempo libero e maggiore redditività per la tua impresa'
      ]
    },
    banner: {
      title: 'La piattaforma completa per i professionisti dell’edilizia.',
      subtitle: 'Più organizzazione, più opportunità e migliori risultati. Inizia subito con Atrios Build.',
      ctaClient: 'RICHIEDI PREVENTIVO GRATIS',
      ctaClientSub: 'Sono un cliente e cerco un’impresa',
      ctaPro: 'DIVENTA UN PROFESSIONISTA PARTNER',
      ctaProSub: 'Voglio ricevere richieste e gestire cantieri',
      trust1Title: 'Sicurezza totale',
      trust1Sub: 'Dati protetti e crittografati',
      trust2Title: 'Supporto dedicato',
      trust2Sub: 'Siamo sempre a tua disposizione',
      trust3Title: 'Aggiornamenti continui',
      trust3Sub: 'Miglioramenti costanti',
      trust4Title: '+ Professionisti',
      trust4Sub: 'Rete in continua crescita'
    }
  },
  'ru-RU': {
    nav: {
      features: 'Возможности',
      howItWorks: 'Как это работает',
      forClients: 'Клиентам',
      forPros: 'Подрядчикам',
      pricing: 'Тарифы',
      resources: 'Ресурсы',
      login: 'ВОЙТИ',
      startFree: 'НАЧАТЬ БЕСПЛАТНО',
      language: 'Язык'
    },
    hero: {
      arrowNote: 'От заявки до полного завершения объекта',
      titleLine1: 'Находите клиентов.',
      titleLine2: 'Составляйте сметы.',
      titleLine3: 'Управляйте стройкой.',
      titleHighlight: 'Всё в одном месте с Atrios Build.',
      subtitle: 'Получайте заявки от реальных заказчиков, отправляйте профессиональные коммерческие предложения и управляйте строительным бизнесом без хаоса.',
      ctaClient: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
      ctaClientSub: 'Я заказчик и мне нужен ремонт или стройка',
      ctaPro: 'Я ПОДРЯДЧИК',
      ctaProSub: 'Хочу получать заказы и вести объекты',
      badge1Title: 'Надежно и безопасно',
      badge1Sub: 'Ваши данные под защитой',
      badge2Title: 'Проверенные мастера',
      badge2Sub: 'Гарантия и прозрачность',
      badge3Title: 'Доступ отовсюду',
      badge3Sub: 'Веб и мобильное приложение'
    },
    timeline: {
      eyebrow: 'ОТ ПЕРВОГО ОБРАЩЕНИЯ ДО СДАЧИ ОБЪЕКТА',
      title: 'Как это работает для всех',
      steps: [
        {
          num: '01',
          title: 'Клиент оставляет заявку',
          desc: 'Описывает задачу, параметры объекта и пожелания.'
        },
        {
          num: '02',
          title: 'Подрядчики получают заказ',
          desc: 'Проверенные компании платформы получают мгновенное уведомление.'
        },
        {
          num: '03',
          title: 'Подготовка сметы и КП',
          desc: 'Специалист рассчитывает объемы работ и стоимость материалов.'
        },
        {
          num: '04',
          title: 'Отправка предложения клиенту',
          desc: 'Заказчик получает аккуратное цифровое предложение.'
        },
        {
          num: '05',
          title: 'Клиент выбирает исполнителя',
          desc: 'Сравнивает сметы и утверждает подходящего мастера.'
        },
        {
          num: '06',
          title: 'Объект запускается в системе',
          desc: 'Подрядчик организует этапы, закупки и график работ.'
        },
        {
          num: '07',
          title: 'Контроль платежей и прибыли',
          desc: 'Полный учет расходов, оплат и итоговой прибыли.'
        }
      ]
    },
    dualCards: {
      client: {
        tag: 'ДЛЯ КЛИЕНТОВ',
        title: 'Нужен ремонт или строительство?',
        subtitle: 'Найдите проверенных специалистов на нашей платформе.',
        bullets: [
          'Оставьте заявку на расчет сметы бесплатно',
          'Укажите необходимые виды работ и объемы',
          'Прикрепите фото и адрес объекта',
          'Получите расчеты от проверенных мастеров',
          'Отслеживайте предложения в реальном времени',
          'Выберите лучшее предложение под ваш бюджет'
        ],
        cta: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
        floatingTitle: 'Полученные сметы',
        floatingCompanyA: 'Компания А — 2.450 €',
        floatingCompanyB: 'Компания Б — 2.150 €',
        floatingCompanyC: 'Компания В — 2.780 €',
        floatingFooter: 'СМОТРЕТЬ ВСЕ ПРЕДЛОЖЕНИЯ'
      },
      pro: {
        tag: 'ДЛЯ ПОДРЯДЧИКОВ',
        title: 'Превращайте входящие заявки в прибыльные объекты.',
        bullets: [
          'Получайте новые заявки от клиентов каждый день',
          'Изучайте детали, фото и локацию объекта',
          'Быстро рассчитывайте сметы и спецификации',
          'Отправляйте презентабельные коммерческие предложения',
          'Ведите учет объектов, клиентов и документов',
          'Контролируйте поступление оплат и расходы',
          'Всё в одной удобной системе'
        ],
        cta: 'ХОЧУ ПОЛУЧАТЬ ЗАКАЗЫ',
        floatingTitle: 'Итоги месяца',
        floatingRevenue: '18.650 €',
        floatingActiveWorks: '8 Активных строек',
        floatingRequests: '12 Новых заявок'
      }
    },
    features: {
      eyebrow: 'ВСЁ ДЛЯ УПРАВЛЕНИЯ СТРОИТЕЛЬНЫМ БИЗНЕСОМ',
      title: 'Полный набор инструментов на каждый день',
      items: [
        {
          title: 'Сметы и КП',
          desc: 'Формируйте профессиональные сметы в PDF за пару минут.'
        },
        {
          title: 'Объекты и стройки',
          desc: 'Следите за ходом каждого проекта в реальном времени.'
        },
        {
          title: 'Клиенты и поставщики',
          desc: 'Единая база контактов, истории и взаиморасчетов.'
        },
        {
          title: 'Расценки и материалы',
          desc: 'Каталог стоимости работ и справочник материалов.'
        },
        {
          title: 'Платежи и касса',
          desc: 'Контроль авансов, расходов и взаиморасчетов.'
        },
        {
          title: 'Отчеты и маржинальность',
          desc: 'Наглядная аналитика чистой прибыли по каждому объекту.'
        },
        {
          title: 'Биржа заявок клиентов',
          desc: 'Получайте прямые обращения заказчиков с платформы.',
          isNew: true
        },
        {
          title: 'Цифровые предложения',
          desc: 'Отправляйте предложения и отслеживайте их просмотры.',
          isNew: true
        },
        {
          title: 'Хранилище документов',
          desc: 'Надежное хранение чертежей, договоров и фотоотчетов.'
        },
        {
          title: 'Мобильное приложение',
          desc: 'Управляйте стройкой прямо со смартфона на объекте.'
        }
      ]
    },
    comparison: {
      beforeTitle: 'КАК БЫЛО РАНЬШЕ...',
      beforeItems: [
        'Заявки теряются в чатах WhatsApp и телефонных звонках',
        'Сметы на листочках или в неудобных таблицах',
        'Хаос в документах и отсутствие истории по клиентам',
        'Сложно вовремя перезванивать и закрывать сделки',
        'Нет понимания реальной себестоимости и чистой прибыли'
      ],
      afterTitle: 'ТЕПЕРЬ С ATRIOS BUILD',
      afterItems: [
        'Все заявки аккуратно собраны в едином кабинете',
        'Презентабельные сметы, вызывающие доверие клиентов',
        'Полный порядок в клиентах, объектах и документах',
        'Железный контроль оплат, сроков и расходов',
        'Больше свободного времени и выше прибыль вашего бизнеса'
      ]
    },
    banner: {
      title: 'Комплексная платформа для специалистов строительства и ремонта.',
      subtitle: 'Больше порядка, больше клиентов и стабильный рост прибыли. Начните прямо сейчас с Atrios Build.',
      ctaClient: 'ЗАКАЗАТЬ СМЕТУ БЕСПЛАТНО',
      ctaClientSub: 'Я заказчик и мне нужны работы',
      ctaPro: 'СТАТЬ ПАРТНЕРОМ',
      ctaProSub: 'Хочу получать заказы и управлять стройкой',
      trust1Title: 'Полная безопасность',
      trust1Sub: 'Ваши данные зашифрованы',
      trust2Title: 'Служба заботы',
      trust2Sub: 'Всегда поможем и подскажем',
      trust3Title: 'Постоянные обновления',
      trust3Sub: 'Регулярный выход новых функций',
      trust4Title: '+ Специалистов',
      trust4Sub: 'Быстрорастущее сообщество'
    }
  }
};
