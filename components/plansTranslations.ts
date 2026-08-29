import { Locale } from '../translations';

export interface PlansTranslation {
  title: string;
  subtitle: string;
  filterAll: string;
  planFree: string;
  planMonthly: string;
  planAnnual: string;
  periodMonth: string;
  periodYear: string;
  savingsAnnual: string;
  bestValue: string;
  startNow: string;
  currentPlan: string;
  couponPlaceholder: string;
  couponApply: string;
  couponApplied: string;
  couponInvalid: string;
  
  // Free Features
  featItemsLimit: string;
  featWorkersFree: string;
  featVoiceTranslatorFree: string;
  featExpenseLimit: string;
  featPdfLimit: string;
  featServiceLimit: string;
  featClientRequestsNotIncluded: string;
  featUnlimitedItemsNotIncluded: string;
  featProfitReportsNotIncluded: string;
  featUnlimitedPdfNotIncluded: string;
  featCloudBackupNotIncluded: string;
  featHdLogoNotIncluded: string;
  featGiftsNotIncluded: string;

  // Monthly Features
  featUnlimitedItems: string;
  featWorkersMonthly: string;
  featVoiceTranslatorMonthly: string;
  featClientRequestsMonthly: string;
  featUnlimitedExpenses: string;
  featUnlimitedPdf: string;
  featCloudBackup: string;
  featProfitReports: string;
  featHdLogo: string;
  featPrioritySupport: string;
  featAnnualDiscountNotIncluded: string;
  featGiftsMonthlyNotIncluded: string;

  // Annual Features
  featWorkersAnnual: string;
  featVoiceTranslatorAnnual: string;
  featClientRequestsAnnual: string;
  featPrioritySupportVip: string;
  featAnnualSavingsText: string;
  featGiftsAnnualExclusive: string;

  // Promo Banner & Regulation Trigger
  promoLimitedOffer: string;
  viewRegulation: string;
  closeModal: string;
  understood: string;

  // Regulation Modal Full Content
  regulationModalTitle: string;
  regulationModalSubtitle: string;
  regulationBannerTitle: string;
  regulationBannerSubtitle: string;
  
  regSec1Title: string;
  regSec1P1: string;
  regSec1P2: string;
  regSec1Item1: string;
  regSec1Item2: string;
  regSec1StockNote: string;

  regSec2Title: string;
  regSec2P1: string;
  regSec2P2: string;
  regSec2P3: string;

  regSec3Title: string;
  regSec3P1: string;
  regSec3P2: string;
  regSec3Format1: string;
  regSec3Format2: string;
  regSec3Format3: string;
  regSec3P3: string;
  regSec3P4: string;

  regSec4Title: string;
  regSec4P1: string;
  regSec4P2: string;
  regSec4P3: string;
  regSec4PaidServiceBox: string;
  regSec4P4: string;
  regSec4P5: string;
  regSec4P6: string;
  regSec4P7: string;

  regSec5Title: string;
  regSec5P1: string;
  regSec5ColorsTitle: string;
  regSec5Colors: string;
  regSec5SizesTitle: string;
  regSec5Sizes: string;
  regSec5P2: string;
  regSec5P3: string;
  regSec5DimTitle: string;
  regSec5DimFront: string;
  regSec5DimBack: string;
  regSec5DimSleeves: string;
  regSec5Note: string;

  regSec6Title: string;
  regSec6P1: string;
  regSec6ColorsTitle: string;
  regSec6Colors: string;
  regSec6SizesTitle: string;
  regSec6Sizes: string;
  regSec6P2: string;
  regSec6P3: string;
  regSec6Note: string;

  regSec7Title: string;
  regSec7P1: string;
  regSec7P2: string;
  regSec7P3: string;
  regSec7P4: string;
  regSec7P5: string;

  regSec8Title: string;
  regSec8P1: string;
  regSec8P2: string;
  regSec8P3: string;
  regSec8P4: string;

  regSec9Title: string;
  regSec9P1: string;
  regSec9P2: string;
  regSec9P3: string;
  regSec9Item1: string;
  regSec9Item2: string;
  regSec9Item3: string;
  regSec9Item4: string;
  regSec9Item5: string;
  regSec9Item6: string;
  regSec9Item7: string;
  regSec9P4: string;

  regSec10Title: string;
  regSec10P1: string;
  regSec10PtTitle: string;
  regSec10PtText: string;
  regSec10IslandsTitle: string;
  regSec10IslandsP1: string;
  regSec10IslandsItem1: string;
  regSec10IslandsItem2: string;
  regSec10IslandsItem3: string;
  regSec10IslandsP2: string;
  regSec10EuTitle: string;
  regSec10EuP1: string;
  regSec10EuItem1: string;
  regSec10EuItem2: string;
  regSec10EuItem3: string;
  regSec10EuP2: string;
  regSec10Note: string;

  regSec11Title: string;
  regSec11P1: string;
  regSec11P2: string;

  regSec12Title: string;
  regSec12P1: string;
  regSec12P2: string;
  regSec12P3: string;

  regSec13Title: string;
  regSec13P1: string;
  regSec13P2: string;

  regSec14Title: string;
  regSec14P1: string;
  regSec14P2: string;

  regSec15Title: string;
  regSec15P1: string;
  regSec15P2: string;
  regTagline: string;
}

export const plansTranslations: Record<Locale, PlansTranslation> = {
  'pt-PT': {
    title: "Planos & Subscrições",
    subtitle: "Transforme a sua gestão com o ÁTRIOS Premium. Escolha o plano ideal para o seu negócio.",
    filterAll: "Todos",
    planFree: "Grátis",
    planMonthly: "Mensal",
    planAnnual: "Anual",
    periodMonth: "/mês",
    periodYear: "/ano",
    savingsAnnual: "De 118,80€ por 89,90€",
    bestValue: "Mais Popular • Melhor Valor",
    startNow: "Começar Agora",
    currentPlan: "Plano Atual",
    couponPlaceholder: "Código de Cupão de Desconto",
    couponApply: "Aplicar",
    couponApplied: "Cupão Aplicado",
    couponInvalid: "Cupão inválido ou expirado",

    featItemsLimit: "3 Itens por Orçamento",
    featWorkersFree: "1 Colaborador no Controlo de Ponto",
    featVoiceTranslatorFree: "Tradutor de Voz: Até 5 Clientes Atendidos",
    featExpenseLimit: "3 Registos de Despesas",
    featPdfLimit: "3 Downloads de PDF",
    featServiceLimit: "3 Serviços Incluídos",
    featClientRequestsNotIncluded: "Responder a Pedidos de Orçamentos de Clientes",
    featUnlimitedItemsNotIncluded: "Orçamentos e Itens Ilimitados",
    featProfitReportsNotIncluded: "Relatórios de Lucro e Gráficos Financeiros",
    featUnlimitedPdfNotIncluded: "Exportação de PDFs Ilimitada",
    featCloudBackupNotIncluded: "Sincronização na Nuvem em Tempo Real",
    featHdLogoNotIncluded: "Logótipo HD Personalizado no PDF",
    featGiftsNotIncluded: "Oferta de Brindes e Vestuário Pro",

    featUnlimitedItems: "Orçamentos e Itens Ilimitados",
    featWorkersMonthly: "Até 3 Colaboradores no Controlo de Ponto",
    featVoiceTranslatorMonthly: "Tradutor de Voz & Chat Ao Vivo Ilimitado",
    featClientRequestsMonthly: "Responda a 2 Pedidos de Clientes da Plataforma / mês",
    featUnlimitedExpenses: "Despesas e Serviços Ilimitados",
    featUnlimitedPdf: "Downloads de PDF Ilimitados",
    featCloudBackup: "Sincronização na Nuvem em Tempo Real",
    featProfitReports: "Relatórios Financeiros e de Lucro",
    featHdLogo: "Logótipo HD no Orçamento e PDF",
    featPrioritySupport: "Suporte Prioritário",
    featAnnualDiscountNotIncluded: "Desconto Especial Anual (25% Poupança)",
    featGiftsMonthlyNotIncluded: "Oferta de Brindes (Exclusivo Anual)",

    featWorkersAnnual: "Até 15 Colaboradores no Controlo de Ponto",
    featVoiceTranslatorAnnual: "Tradutor de Voz & Chat Ao Vivo Ilimitado",
    featClientRequestsAnnual: "Responda a Pedidos de Clientes ILIMITADOS da Plataforma",
    featPrioritySupportVip: "Suporte VIP Prioritário",
    featAnnualSavingsText: "Poupança de 25% face ao mensal",
    featGiftsAnnualExclusive: "OFERTA EXCLUSIVA: 3 T-Shirts + 3 Coletes com o seu Logótipo",

    promoLimitedOffer: "Oferta limitada para 250 assinaturas Premium",
    viewRegulation: "Consulte Regulamento",
    closeModal: "Fechar",
    understood: "Entendido",

    regulationModalTitle: "Regulamento da Promoção",
    regulationModalSubtitle: "Plano Anual Premium",
    regulationBannerTitle: "OFERTA EXCLUSIVA PLANO PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "A presente promoção é uma oferta exclusiva destinada aos clientes que subscreverem o Plano Premium do AtriosBuild.",

    regSec1Title: "OBJETO DA PROMOÇÃO",
    regSec1P1: "A presente promoção é uma oferta exclusiva destinada aos clientes que subscreverem o Plano Premium do AtriosBuild.",
    regSec1P2: "Como benefício promocional, o cliente elegível receberá:",
    regSec1Item1: "3 T-shirts personalizadas com o logótipo da sua empresa;",
    regSec1Item2: "3 coletes personalizados com o logótipo da sua empresa.",
    regSec1StockNote: "A oferta está limitada ao stock disponível, incluindo cores e tamanhos, e poderá ser encerrada quando o stock promocional se esgotar.",

    regSec2Title: "QUEM PODE PARTICIPAR",
    regSec2P1: "A promoção é exclusiva para clientes que tenham uma subscrição ativa do Plano Premium do AtriosBuild, de acordo com as condições comerciais apresentadas no momento da adesão.",
    regSec2P2: "A oferta não é válida para os planos Gratuito, Básico ou outros planos que não sejam o Plano Premium.",
    regSec2P3: "A atribuição dos brindes está condicionada à confirmação da subscrição Premium e ao cumprimento de todas as condições previstas neste regulamento.",

    regSec3Title: "ENVIO DO LOGÓTIPO",
    regSec3P1: "Para a personalização dos brindes, o cliente deverá enviar o logótipo que pretende utilizar.",
    regSec3P2: "São aceites, preferencialmente, os seguintes formatos:",
    regSec3Format1: "PDF aberto/editável;",
    regSec3Format2: "PNG, preferencialmente com boa resolução e fundo transparente;",
    regSec3Format3: "CDR — CorelDRAW, preferencialmente em formato editável.",
    regSec3P3: "O ficheiro enviado será submetido a uma avaliação técnica para verificar se apresenta condições adequadas para utilização na personalização das T-shirts e dos coletes.",
    regSec3P4: "A aceitação do ficheiro não depende apenas do formato. O logótipo deverá possuir qualidade, resolução, definição e características técnicas adequadas ao processo de personalização.",

    regSec4Title: "AVALIAÇÃO E EDIÇÃO DO LOGÓTIPO",
    regSec4P1: "Após o envio, o ficheiro será analisado pela equipa responsável pela personalização.",
    regSec4P2: "Caso o logótipo esteja em condições adequadas, será utilizado na produção dos brindes.",
    regSec4P3: "Caso o ficheiro apresente problemas que impeçam ou dificultem a sua utilização, o cliente será informado sobre o resultado da avaliação e sobre as alterações necessárias.",
    regSec4PaidServiceBox: "Caso o cliente pretenda que o AtriosBuild realize a preparação ou edição do logótipo para o tornar adequado à personalização, este serviço poderá ser realizado pelo valor de 10,00 €.",
    regSec4P4: "A edição somente será realizada mediante autorização do cliente.",
    regSec4P5: "Após a conclusão e aprovação da edição, o ficheiro final do logótipo será enviado ao cliente através do e-mail ou WhatsApp informado pelo próprio cliente.",
    regSec4P6: "O ficheiro editado continuará a pertencer ao cliente, sendo disponibilizado para sua utilização.",
    regSec4P7: "O pagamento do serviço de edição do logótipo não constitui requisito para participação na promoção, sendo aplicável apenas quando o cliente optar por contratar esse serviço.",

    regSec5Title: "T-SHIRTS PERSONALIZADAS",
    regSec5P1: "Cada cliente elegível receberá 3 T-shirts personalizadas.",
    regSec5ColorsTitle: "Cores disponíveis:",
    regSec5Colors: "Branco, Azul, Preto, Vermelho, Cinza escuro, Cinza claro, Rosa, Verde, Amarelo.",
    regSec5SizesTitle: "Tamanhos disponíveis:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "A escolha de cores e tamanhos estará sujeita ao stock disponível no momento da confirmação da oferta.",
    regSec5P3: "A personalização das T-shirts será realizada com o logótipo fornecido e aprovado pelo cliente.",
    regSec5DimTitle: "Localização e dimensões máximas do logótipo:",
    regSec5DimFront: "Frente: máximo de 10 cm × 10 cm;",
    regSec5DimBack: "Costas: máximo de 15 cm × 20 cm;",
    regSec5DimSleeves: "Mangas: a personalização das mangas não está incluída na promoção.",
    regSec5Note: "A posição final da personalização poderá ser ajustada tecnicamente de acordo com o modelo da peça e com as características do logótipo.",

    regSec6Title: "COLETES PERSONALIZADOS",
    regSec6P1: "Cada cliente elegível receberá 3 coletes personalizados.",
    regSec6ColorsTitle: "Cores disponíveis:",
    regSec6Colors: "Verde, Laranja.",
    regSec6SizesTitle: "Tamanhos disponíveis:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "A escolha da cor e do tamanho estará condicionada ao stock disponível no momento da confirmação da oferta.",
    regSec6P3: "A personalização será realizada com o logótipo fornecido e aprovado pelo cliente.",
    regSec6Note: "As dimensões e a posição da personalização poderão ser ajustadas tecnicamente de acordo com o modelo do colete e com as características do logótipo.",

    regSec7Title: "LIMITAÇÃO AO STOCK",
    regSec7P1: "A promoção está limitada ao stock disponível de T-shirts e coletes, incluindo modelos, cores e tamanhos.",
    regSec7P2: "A existência da promoção não garante a disponibilidade de todas as combinações de cores e tamanhos.",
    regSec7P3: "Caso determinada cor ou tamanho escolhido pelo cliente esteja esgotado, o cliente poderá escolher outra opção disponível dentro das alternativas existentes em stock.",
    regSec7P4: "O AtriosBuild não será obrigado a disponibilizar uma cor ou tamanho que se encontre esgotado.",
    regSec7P5: "A promoção poderá ser encerrada quando o stock destinado à campanha terminar.",

    regSec8Title: "APROVAÇÃO DA PERSONALIZAÇÃO",
    regSec8P1: "Antes da produção, o cliente poderá ser solicitado a confirmar a arte final que será utilizada na personalização.",
    regSec8P2: "Após a aprovação da arte final pelo cliente, serão produzidos os brindes de acordo com a versão aprovada.",
    regSec8P3: "O cliente é responsável por garantir que possui os direitos de utilização do logótipo, símbolos, imagens, textos ou demais elementos enviados para personalização.",
    regSec8P4: "O AtriosBuild não se responsabiliza por eventuais violações de direitos de terceiros decorrentes da utilização de materiais fornecidos pelo cliente.",

    regSec9Title: "PRAZO DE PRODUÇÃO E POSTAGEM",
    regSec9P1: "Após a conclusão de todas as etapas necessárias para a produção, os brindes personalizados serão produzidos e estarão prontos para postagem no prazo máximo de 30 (trinta) dias corridos.",
    regSec9P2: "O prazo de 30 dias corridos refere-se exclusivamente ao prazo para preparação, produção e postagem/expedição dos brindes pelo AtriosBuild, não correspondendo ao prazo de transporte ou entrega pela transportadora.",
    regSec9P3: "O prazo de 30 dias corridos começa a contar somente após estarem reunidas todas as seguintes condições:",
    regSec9Item1: "confirmação da subscrição Premium;",
    regSec9Item2: "recebimento do logótipo pelo AtriosBuild;",
    regSec9Item3: "aprovação técnica do ficheiro;",
    regSec9Item4: "definição das cores e tamanhos dos brindes, de acordo com o stock disponível;",
    regSec9Item5: "aprovação da arte final pelo cliente, quando aplicável;",
    regSec9Item6: "confirmação dos dados necessários para o envio;",
    regSec9Item7: "confirmação do pagamento do respetivo custo de envio.",
    regSec9P4: "Eventuais atrasos decorrentes de informações incorretas ou incompletas fornecidas pelo cliente, demora no envio ou aprovação do logótipo/arte, alteração dos dados de envio, indisponibilidade temporária de determinados materiais ou situações de força maior poderão suspender ou alterar o prazo de produção e postagem.",

    regSec10Title: "CUSTOS E CONDIÇÕES DE ENVIO",
    regSec10P1: "Os brindes da promoção são gratuitos, porém os custos de envio não estão incluídos na oferta e serão suportados pelo cliente.",
    regSec10PtTitle: "Portugal Continental",
    regSec10PtText: "Para entregas em Portugal Continental, será aplicado um custo de envio de: 8,00 €",
    regSec10IslandsTitle: "Regiões Autónomas dos Açores e da Madeira",
    regSec10IslandsP1: "Para envios destinados às Ilhas dos Açores ou da Madeira, o cliente deverá consultar previamente o AtriosBuild para obter:",
    regSec10IslandsItem1: "valor do transporte;",
    regSec10IslandsItem2: "prazo estimado de entrega;",
    regSec10IslandsItem3: "condições aplicáveis ao envio.",
    regSec10IslandsP2: "O envio somente será realizado após a confirmação do respetivo valor pelo cliente.",
    regSec10EuTitle: "Outros países da União Europeia",
    regSec10EuP1: "Para envios destinados a outros países da União Europeia, o cliente deverá consultar previamente o AtriosBuild para obter:",
    regSec10EuItem1: "valor do transporte;",
    regSec10EuItem2: "prazo estimado de entrega;",
    regSec10EuItem3: "condições aplicáveis ao envio.",
    regSec10EuP2: "O valor do transporte poderá variar de acordo com o país, código postal, peso, volume e condições da transportadora.",
    regSec10Note: "O prazo de 30 dias corridos indicado neste regulamento refere-se à postagem/expedição pelo AtriosBuild, não incluindo o tempo de transporte e entrega no destino.",

    regSec11Title: "CARÁTER PESSOAL DA OFERTA",
    regSec11P1: "Os brindes são destinados ao titular da subscrição Premium e não poderão ser convertidos em dinheiro.",
    regSec11P2: "A oferta não poderá ser trocada por outro produto ou pelo seu equivalente monetário.",

    regSec12Title: "CANCELAMENTO OU INATIVAÇÃO DA SUBSCRIÇÃO",
    regSec12P1: "A atribuição da oferta está vinculada à subscrição do Plano Premium.",
    regSec12P2: "Caso a subscrição seja cancelada antes da conclusão do processo de produção ou postagem dos brindes, o direito à oferta poderá ser cancelado, salvo quando a produção já tiver sido iniciada e as condições específicas da campanha determinarem o contrário.",
    regSec12P3: "A oferta não constitui saldo, crédito ou valor monetário na conta do cliente.",

    regSec13Title: "RESPONSABILIDADE PELOS DADOS FORNECIDOS",
    regSec13P1: "O cliente é responsável pela correta indicação dos seus dados de contacto e de entrega.",
    regSec13P2: "O AtriosBuild não se responsabiliza por atrasos, devoluções ou impossibilidade de entrega decorrentes de informações incorretas, incompletas ou desatualizadas fornecidas pelo cliente.",

    regSec14Title: "ALTERAÇÃO OU ENCERRAMENTO DA PROMOÇÃO",
    regSec14P1: "O AtriosBuild reserva-se o direito de alterar, suspender ou encerrar a promoção, nomeadamente em caso de esgotamento do stock ou por motivos de força maior.",
    regSec14P2: "Qualquer alteração relevante será comunicada através dos canais oficiais do AtriosBuild.",

    regSec15Title: "ACEITAÇÃO DO REGULAMENTO",
    regSec15P1: "A subscrição do Plano Premium e a participação na promoção pressupõem a leitura e aceitação integral deste regulamento.",
    regSec15P2: "Ao participar na promoção, o cliente declara ter compreendido e aceite todas as condições aqui estabelecidas.",
    regTagline: "Construímos ferramentas para quem constrói."
  },

  'pt-BR': {
    title: "Planos & Assinaturas",
    subtitle: "Transforme a sua gestão com o ÁTRIOS Premium. Escolha o plano ideal para a sua empresa.",
    filterAll: "Todos",
    planFree: "Grátis",
    planMonthly: "Mensal",
    planAnnual: "Anual",
    periodMonth: "/mês",
    periodYear: "/ano",
    savingsAnnual: "De R$ 599 por R$ 449",
    bestValue: "Mais Popular • Melhor Custo-Benefício",
    startNow: "Começar Agora",
    currentPlan: "Plano Atual",
    couponPlaceholder: "Código do Cupom de Desconto",
    couponApply: "Aplicar",
    couponApplied: "Cupom Aplicado",
    couponInvalid: "Cupom inválido ou expirado",

    featItemsLimit: "3 Itens por Orçamento",
    featWorkersFree: "1 Colaborador no Controle de Ponto",
    featVoiceTranslatorFree: "Tradutor de Voz: Até 5 Clientes Atendidos",
    featExpenseLimit: "3 Registros de Despesas",
    featPdfLimit: "3 Downloads de PDF",
    featServiceLimit: "3 Serviços Incluídos",
    featClientRequestsNotIncluded: "Responder a Pedidos de Orçamentos de Clientes",
    featUnlimitedItemsNotIncluded: "Orçamentos e Itens Ilimitados",
    featProfitReportsNotIncluded: "Relatórios de Lucro e Gráficos Financeiros",
    featUnlimitedPdfNotIncluded: "Exportação de PDFs Ilimitada",
    featCloudBackupNotIncluded: "Sincronização na Nuvem em Tempo Real",
    featHdLogoNotIncluded: "Logotipo HD Personalizado no PDF",
    featGiftsNotIncluded: "Oferta de Brindes e Uniformes Pro",

    featUnlimitedItems: "Orçamentos e Itens Ilimitados",
    featWorkersMonthly: "Até 3 Colaboradores no Controle de Ponto",
    featVoiceTranslatorMonthly: "Tradutor de Voz & Chat Ao Vivo Ilimitado",
    featClientRequestsMonthly: "Responda a 2 Pedidos de Clientes da Plataforma / mês",
    featUnlimitedExpenses: "Despesas e Serviços Ilimitados",
    featUnlimitedPdf: "Downloads de PDF Ilimitados",
    featCloudBackup: "Sincronização na Nuvem em Tempo Real",
    featProfitReports: "Relatórios Financeiros e de Lucro",
    featHdLogo: "Logotipo HD no Orçamento e PDF",
    featPrioritySupport: "Suporte Prioritário",
    featAnnualDiscountNotIncluded: "Desconto Especial Anual (25% Economia)",
    featGiftsMonthlyNotIncluded: "Oferta de Brindes (Exclusivo Anual)",

    featWorkersAnnual: "Até 15 Colaboradores no Controle de Ponto",
    featVoiceTranslatorAnnual: "Tradutor de Voz & Chat Ao Vivo Ilimitado",
    featClientRequestsAnnual: "Responda a Pedidos de Clientes ILIMITADOS da Plataforma",
    featPrioritySupportVip: "Suporte VIP Prioritário",
    featAnnualSavingsText: "Economia de 25% em relação ao mensal",
    featGiftsAnnualExclusive: "OFERTA EXCLUSIVA: 3 Camisetas + 3 Coletes com a sua Logo",

    promoLimitedOffer: "Oferta limitada para 250 assinaturas Premium",
    viewRegulation: "Consulte o Regulamento",
    closeModal: "Fechar",
    understood: "Entendido",

    regulationModalTitle: "Regulamento da Promoção",
    regulationModalSubtitle: "Plano Anual Premium",
    regulationBannerTitle: "OFERTA EXCLUSIVA PLANO PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "A presente promoção é uma oferta exclusiva destinada aos clientes que assinarem o Plano Premium do AtriosBuild.",

    regSec1Title: "OBJETO DA PROMOÇÃO",
    regSec1P1: "A presente promoção é uma oferta exclusiva destinada aos clientes que assinarem o Plano Premium do AtriosBuild.",
    regSec1P2: "Como benefício promocional, o cliente elegível receberá:",
    regSec1Item1: "3 camisetas personalizadas com o logotipo da sua empresa;",
    regSec1Item2: "3 coletes personalizados com o logotipo da sua empresa.",
    regSec1StockNote: "A oferta está limitada ao estoque disponível, incluindo cores e tamanhos, e poderá ser encerrada quando o estoque promocional se esgotar.",

    regSec2Title: "QUEM PODE PARTICIPAR",
    regSec2P1: "A promoção é exclusiva para clientes com assinatura ativa do Plano Premium do AtriosBuild, conforme condições comerciais apresentadas no momento da adesão.",
    regSec2P2: "A oferta não é válida para os planos Gratuito, Básico ou outros planos que não sejam o Plano Premium.",
    regSec2P3: "A atribuição dos brindes está condicionada à confirmação da assinatura Premium e ao cumprimento de todas as condições previstas neste regulamento.",

    regSec3Title: "ENVIO DO LOGOTIPO",
    regSec3P1: "Para a personalização dos brindes, o cliente deverá enviar o logotipo que deseja estampar.",
    regSec3P2: "São aceitos, preferencialmente, os seguintes formatos:",
    regSec3Format1: "PDF aberto/vetorial editável;",
    regSec3Format2: "PNG, preferencialmente com alta resolução e fundo transparente;",
    regSec3Format3: "CDR — CorelDRAW, preferencialmente em formato editável.",
    regSec3P3: "O arquivo enviado passará por avaliação técnica para verificar se apresenta condições adequadas para estampagem nas camisetas e coletes.",
    regSec3P4: "A aceitação do arquivo não depende apenas do formato. O logotipo deve possuir nitidez, resolução e características técnicas adequadas para produção gráfica.",

    regSec4Title: "AVALIAÇÃO E EDIÇÃO DO LOGOTIPO",
    regSec4P1: "Após o envio, o arquivo será analisado pela equipe de personalização gráfica.",
    regSec4P2: "Caso o logotipo esteja em condições ideais, será encaminhado diretamente para produção.",
    regSec4P3: "Se o arquivo apresentar falhas ou baixa resolução, o cliente será avisado sobre as correções necessárias.",
    regSec4PaidServiceBox: "Caso o cliente deseje que a equipe do AtriosBuild faça a vetorização ou edição do logotipo, esse serviço poderá ser contratado por 10,00 € (ou equivalente em Reais).",
    regSec4P4: "A edição apenas será executada mediante autorização do cliente.",
    regSec4P5: "Após a aprovação final, o arquivo editado será enviado ao cliente por e-mail ou WhatsApp.",
    regSec4P6: "O arquivo continuará sendo propriedade exclusiva do cliente.",
    regSec4P7: "A contratação do serviço de edição é opcional e não é obrigatória para participar da promoção.",

    regSec5Title: "CAMISETAS PERSONALIZADAS",
    regSec5P1: "Cada cliente elegível receberá 3 camisetas personalizadas.",
    regSec5ColorsTitle: "Cores disponíveis:",
    regSec5Colors: "Branco, Azul, Preto, Vermelho, Cinza escuro, Cinza claro, Rosa, Verde, Amarelo.",
    regSec5SizesTitle: "Tamanhos disponíveis:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "A escolha de cores e tamanhos está sujeita ao estoque disponível no momento da validação do pedido.",
    regSec5P3: "A personalização será realizada com o logotipo aprovado pelo cliente.",
    regSec5DimTitle: "Posições e dimensões máximas de estampa:",
    regSec5DimFront: "Frente: máx. de 10 cm × 10 cm;",
    regSec5DimBack: "Costas: máx. de 15 cm × 20 cm;",
    regSec5DimSleeves: "Mangas: a estampa nas mangas não faz parte do pacote promocional.",
    regSec5Note: "O enquadramento poderá ser ajustado tecnicamente conforme o modelo da peça e proporções do logotipo.",

    regSec6Title: "COLETES PERSONALIZADOS",
    regSec6P1: "Cada cliente elegível receberá 3 coletes personalizados.",
    regSec6ColorsTitle: "Cores disponíveis:",
    regSec6Colors: "Verde, Laranja fluorescente.",
    regSec6SizesTitle: "Tamanhos disponíveis:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Cores e tamanhos estão sujeitos à disponibilidade do estoque promocional.",
    regSec6P3: "A estampa será produzida com o logotipo fornecido pelo assinante.",
    regSec6Note: "As dimensões da estampa serão ajustadas de acordo com as faixas refletivas do colete.",

    regSec7Title: "LIMITAÇÃO DE ESTOQUE",
    regSec7P1: "A promoção é limitada ao estoque de segurança de camisetas e coletes.",
    regSec7P2: "A campanha não garante estoque permanente de todas as combinações de cores e tamanhos.",
    regSec7P3: "Caso a cor ou tamanho desejado esgote, o cliente poderá escolher outra opção disponível em estoque.",
    regSec7P4: "O AtriosBuild não tem obrigação de repor variações esgotadas para a promoção.",
    regSec7P5: "A campanha poderá ser encerrada a qualquer momento após o esgotamento dos 250 kits promocionais.",

    regSec8Title: "APROVAÇÃO DA PERSONALIZAÇÃO",
    regSec8P1: "Antes de estampar, o cliente poderá conferir a prévia digital da arte.",
    regSec8P2: "Com a aprovação do cliente, os brindes entrarão imediatamente na fila de confecção.",
    regSec8P3: "O cliente declara possuir todos os direitos de imagem e marca do logotipo fornecido.",
    regSec8P4: "O AtriosBuild isenta-se de responsabilidade por eventual uso indevido de marcas de terceiros fornecidas pelo assinante.",

    regSec9Title: "PRAZO DE PRODUÇÃO E POSTAGEM",
    regSec9P1: "Após a aprovação de todas as etapas, os brindes serão confeccionados e despachados em até 30 (trinta) dias corridos.",
    regSec9P2: "O prazo de 30 dias refere-se exclusivamente à confecção e postagem pela equipe AtriosBuild, não cobrindo o prazo de trânsito dos Correios/transportadora.",
    regSec9P3: "A contagem do prazo de 30 dias inicia-se após a confirmação de todos os seguintes itens:",
    regSec9Item1: "confirmação do pagamento da assinatura Premium;",
    regSec9Item2: "recebimento do logotipo;",
    regSec9Item3: "aprovação técnica do arquivo;",
    regSec9Item4: "escolha de cores e tamanhos disponíveis;",
    regSec9Item5: "aprovação da arte final pelo cliente;",
    regSec9Item6: "confirmação do endereço de entrega;",
    regSec9Item7: "confirmação do frete de envio.",
    regSec9P4: "Atrasos no envio de informações ou aprovações por parte do cliente pausarão a contagem do prazo.",

    regSec10Title: "CUSTOS E CONDIÇÕES DE FRETE",
    regSec10P1: "Os brindes são 100% gratuitos, sendo o frete de envio de responsabilidade do cliente.",
    regSec10PtTitle: "Portugal Continental",
    regSec10PtText: "Para entregas em Portugal Continental, o custo de envio fixo é de 8,00 €.",
    regSec10IslandsTitle: "Açores, Madeira e Envios Internacionais",
    regSec10IslandsP1: "Para envios às Ilhas ou outros países (incluindo Brasil sob consulta), o cliente deve solicitar cotação prévia:",
    regSec10IslandsItem1: "valor da cotação de frete;",
    regSec10IslandsItem2: "prazo estimado dos Correios/transportadora;",
    regSec10IslandsItem3: "taxas aduaneiras se aplicável.",
    regSec10IslandsP2: "O envio somente será realizado após a aprovação e quitação do frete.",
    regSec10EuTitle: "União Europeia e Outros Países",
    regSec10EuP1: "Envios internacionais terão cotação calculada caso a caso:",
    regSec10EuItem1: "custo conforme tabela da transportadora;",
    regSec10EuItem2: "prazo de entrega internacional;",
    regSec10EuItem3: "condições de rastreamento.",
    regSec10EuP2: "O frete varia conforme peso, volume e país de destino.",
    regSec10Note: "O prazo de 30 dias é referente à postagem, não incluindo o tempo de transporte até o endereço final.",

    regSec11Title: "CARÁTER PESSOAL DA OFERTA",
    regSec11P1: "Os brindes são exclusivos do titular da conta e não podem ser convertidos em dinheiro.",
    regSec11P2: "A oferta não pode ser trocada por outros produtos ou descontos na mensalidade.",

    regSec12Title: "CANCELAMENTO OU INATIVAÇÃO",
    regSec12P1: "A promoção é vinculada à manutenção da assinatura anual ativa.",
    regSec12P2: "Caso a assinatura seja cancelada antes do envio, o direito aos brindes poderá ser revogado.",
    regSec12P3: "A bonificação não gera crédito monetário na conta do usuário.",

    regSec13Title: "RESPONSABILIDADE PELOS DADOS",
    regSec13P1: "O assinante é responsável pela exatidão do endereço de entrega e dados de contato.",
    regSec13P2: "O AtriosBuild não responde por insucesso de entrega causado por endereços incompletos.",

    regSec14Title: "ALTERAÇÃO OU ENCERRAMENTO",
    regSec14P1: "O AtriosBuild reserva-se o direito de encerrar a campanha ao término do estoque de 250 unidades.",
    regSec14P2: "Quaisquer atualizações serão comunicadas pelos canais oficiais da plataforma.",

    regSec15Title: "ACEITAÇÃO DO REGULAMENTO",
    regSec15P1: "A contratação do plano pressupõe a ciência e aceitação integral deste regulamento.",
    regSec15P2: "Ao aderir, o cliente concorda com todos os termos aqui descritos.",
    regTagline: "Construímos ferramentas para quem constrói."
  },

  'en-US': {
    title: "Plans & Subscriptions",
    subtitle: "Transform your management with ÁTRIOS Premium. Choose the perfect plan for your business.",
    filterAll: "All",
    planFree: "Free",
    planMonthly: "Monthly",
    planAnnual: "Annual",
    periodMonth: "/month",
    periodYear: "/year",
    savingsAnnual: "From €118.80 for €89.90",
    bestValue: "Most Popular • Best Value",
    startNow: "Get Started",
    currentPlan: "Current Plan",
    couponPlaceholder: "Discount Coupon Code",
    couponApply: "Apply",
    couponApplied: "Coupon Applied",
    couponInvalid: "Invalid or expired coupon",

    featItemsLimit: "3 Items per Estimate",
    featWorkersFree: "1 Worker in Time Tracking",
    featVoiceTranslatorFree: "AI Voice Translator: Up to 5 Attended Clients",
    featExpenseLimit: "3 Expense Records",
    featPdfLimit: "3 PDF Downloads",
    featServiceLimit: "3 Included Services",
    featClientRequestsNotIncluded: "Respond to Client Quote Requests",
    featUnlimitedItemsNotIncluded: "Unlimited Estimates & Items",
    featProfitReportsNotIncluded: "Profit Reports & Financial Charts",
    featUnlimitedPdfNotIncluded: "Unlimited PDF Exports",
    featCloudBackupNotIncluded: "Real-Time Cloud Synchronization",
    featHdLogoNotIncluded: "Custom HD Logo on PDFs",
    featGiftsNotIncluded: "Free Branded Gifts & Pro Apparel",

    featUnlimitedItems: "Unlimited Estimates & Items",
    featWorkersMonthly: "Up to 3 Workers in Time Tracking",
    featVoiceTranslatorMonthly: "Unlimited AI Voice Translator & Live Chat",
    featClientRequestsMonthly: "Respond to 2 Platform Client Requests / month",
    featUnlimitedExpenses: "Unlimited Expenses & Services",
    featUnlimitedPdf: "Unlimited PDF Downloads",
    featCloudBackup: "Real-Time Cloud Synchronization",
    featProfitReports: "Financial & Profit Reports",
    featHdLogo: "HD Logo on Estimates & PDFs",
    featPrioritySupport: "Priority Support",
    featAnnualDiscountNotIncluded: "Special Annual Discount (25% Savings)",
    featGiftsMonthlyNotIncluded: "Gift Package (Annual Plan Exclusive)",

    featWorkersAnnual: "Up to 15 Workers in Time Tracking",
    featVoiceTranslatorAnnual: "Unlimited AI Voice Translator & Live Chat",
    featClientRequestsAnnual: "Respond to UNLIMITED Platform Client Requests",
    featPrioritySupportVip: "VIP Priority Support",
    featAnnualSavingsText: "25% savings compared to monthly",
    featGiftsAnnualExclusive: "EXCLUSIVE OFFER: 3 T-Shirts + 3 Vests with your Logo",

    promoLimitedOffer: "Limited offer for first 250 Premium subscriptions",
    viewRegulation: "View Regulations",
    closeModal: "Close",
    understood: "Understood",

    regulationModalTitle: "Promotion Regulations",
    regulationModalSubtitle: "Annual Premium Plan",
    regulationBannerTitle: "EXCLUSIVE PREMIUM PLAN OFFER — ATRIOSBUILD",
    regulationBannerSubtitle: "This promotion is an exclusive gift offer for customers who subscribe to the AtriosBuild Annual Premium Plan.",

    regSec1Title: "SUBJECT OF THE PROMOTION",
    regSec1P1: "This promotion is an exclusive offer for customers subscribing to the AtriosBuild Premium Plan.",
    regSec1P2: "As a promotional perk, eligible customers will receive:",
    regSec1Item1: "3 custom T-shirts branded with your company logo;",
    regSec1Item2: "3 custom safety vests branded with your company logo.",
    regSec1StockNote: "The offer is limited to available stock (colors and sizes) and may end once promotional stock is exhausted.",

    regSec2Title: "ELIGIBILITY",
    regSec2P1: "The promotion is exclusively for customers with an active AtriosBuild Premium Plan subscription according to terms at checkout.",
    regSec2P2: "Free, Basic, or other non-Premium plans are not eligible.",
    regSec2P3: "Awarding of promotional items is subject to subscription confirmation and compliance with all rules herein.",

    regSec3Title: "LOGO SUBMISSION",
    regSec3P1: "To customize the items, the client must submit the logo to be printed.",
    regSec3P2: "The following file formats are preferred:",
    regSec3Format1: "Editable vector PDF;",
    regSec3Format2: "High-resolution PNG with transparent background;",
    regSec3Format3: "CDR — CorelDRAW in editable format.",
    regSec3P3: "Submitted files undergo technical review to verify quality for textile printing.",
    regSec3P4: "Acceptance depends on resolution, sharpness, and technical suitability for screen/heat printing.",

    regSec4Title: "LOGO EVALUATION & EDITING",
    regSec4P1: "The design team evaluates the file upon submission.",
    regSec4P2: "If the logo meets technical standards, it moves directly to printing.",
    regSec4P3: "If issues occur, the client will be notified with recommendations.",
    regSec4PaidServiceBox: "If the client requests AtriosBuild to professionally edit/vectorize the logo, this optional service is available for €10.00.",
    regSec4P4: "Editing only proceeds with client approval.",
    regSec4P5: "The finalized vector logo will be delivered via email or WhatsApp.",
    regSec4P6: "The edited logo file remains 100% the property of the client.",
    regSec4P7: "Purchasing logo editing is purely optional and is not mandatory to participate.",

    regSec5Title: "CUSTOM T-SHIRTS",
    regSec5P1: "Each eligible client receives 3 custom T-shirts.",
    regSec5ColorsTitle: "Available Colors:",
    regSec5Colors: "White, Blue, Black, Red, Dark Grey, Light Grey, Pink, Green, Yellow.",
    regSec5SizesTitle: "Available Sizes:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "Color and size selection depends on available stock upon confirmation.",
    regSec5P3: "Printing will feature the approved logo.",
    regSec5DimTitle: "Print locations & maximum dimensions:",
    regSec5DimFront: "Front: max 10 cm × 10 cm;",
    regSec5DimBack: "Back: max 15 cm × 20 cm;",
    regSec5DimSleeves: "Sleeves: sleeve printing is not included in the promo pack.",
    regSec5Note: "Final positioning may be adjusted based on garment cut and logo proportions.",

    regSec6Title: "CUSTOM SAFETY VESTS",
    regSec6P1: "Each eligible client receives 3 custom safety vests.",
    regSec6ColorsTitle: "Available Colors:",
    regSec6Colors: "Hi-Vis Green, Hi-Vis Orange.",
    regSec6SizesTitle: "Available Sizes:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Color and size subject to promotional stock availability.",
    regSec6P3: "Printing is produced with the client-approved logo.",
    regSec6Note: "Dimensions are adjusted to fit between reflective safety strips.",

    regSec7Title: "STOCK LIMITATION",
    regSec7P1: "This campaign is strictly limited to stock of 250 packages.",
    regSec7P2: "Promotion does not guarantee infinite supply of every size/color variation.",
    regSec7P3: "If a selected color or size is depleted, the client may choose from available alternatives.",
    regSec7P4: "AtriosBuild is not obliged to restock out-of-stock variations.",
    regSec7P5: "The campaign may terminate once promotional inventory is fully allocated.",

    regSec8Title: "CUSTOMIZATION APPROVAL",
    regSec8P1: "Clients may review a digital visual mockup prior to production.",
    regSec8P2: "Upon approval, items enter the printing pipeline.",
    regSec8P3: "The client warrants full intellectual property rights to the supplied artwork.",
    regSec8P4: "AtriosBuild assumes no liability for trademark infringements arising from client-provided assets.",

    regSec9Title: "PRODUCTION & SHIPPING TIMELINE",
    regSec9P1: "Once all stages are confirmed, customized items are manufactured and ready for dispatch within 30 calendar days.",
    regSec9P2: "The 30-day window refers exclusively to manufacturing and dispatch by AtriosBuild, not transit time.",
    regSec9P3: "The 30-day period begins only after all the following milestones are met:",
    regSec9Item1: "Premium subscription confirmation;",
    regSec9Item2: "Logo file receipt;",
    regSec9Item3: "Technical artwork approval;",
    regSec9Item4: "Color and size confirmation from available stock;",
    regSec9Item5: "Final mockup sign-off;",
    regSec9Item6: "Shipping address confirmation;",
    regSec9Item7: "Payment of applicable shipping fee.",
    regSec9P4: "Delays caused by missing client data or late approvals pause the timeline.",

    regSec10Title: "SHIPPING COSTS & TERMS",
    regSec10P1: "Promotional merchandise is 100% free; shipping fees are covered by the client.",
    regSec10PtTitle: "Mainland Portugal",
    regSec10PtText: "For deliveries in Mainland Portugal, a flat shipping fee of €8.00 applies.",
    regSec10IslandsTitle: "Azores, Madeira & Islands",
    regSec10IslandsP1: "For island deliveries, please request a quote for:",
    regSec10IslandsItem1: "freight rate;",
    regSec10IslandsItem2: "estimated delivery time;",
    regSec10IslandsItem3: "courier conditions.",
    regSec10IslandsP2: "Dispatch occurs following freight payment.",
    regSec10EuTitle: "European Union & International",
    regSec10EuP1: "Deliveries across EU and international destinations:",
    regSec10EuItem1: "carrier shipping cost;",
    regSec10EuItem2: "customs clearance if applicable;",
    regSec10EuItem3: "tracking terms.",
    regSec10EuP2: "Costs vary according to weight, parcel volume, and destination.",
    regSec10Note: "The 30-day period refers to dispatch, excluding transit time.",

    regSec11Title: "PERSONAL NATURE OF THE OFFER",
    regSec11P1: "Promotional items are non-transferable and cannot be exchanged for cash.",
    regSec11P2: "No cash substitution or plan credits are provided.",

    regSec12Title: "CANCELLATION & TERMINATION",
    regSec12P1: "Gifts are bound to the active Premium subscription.",
    regSec12P2: "If cancelled prior to dispatch, promo eligibility may be forfeited.",
    regSec12P3: "The gift package does not represent monetary credit.",

    regSec13Title: "ACCURACY OF PROVIDED DATA",
    regSec13P1: "The client is solely responsible for providing accurate contact and delivery information.",
    regSec13P2: "AtriosBuild is not liable for failed delivery due to incorrect addresses.",

    regSec14Title: "AMENDMENTS & CAMPAIGN CLOSURE",
    regSec14P1: "AtriosBuild reserves the right to amend or close the promo upon stock depletion.",
    regSec14P2: "Updates are published via official AtriosBuild communication channels.",

    regSec15Title: "ACCEPTANCE OF REGULATIONS",
    regSec15P1: "Subscribing to the Premium Plan implies full knowledge and acceptance of these rules.",
    regSec15P2: "By participating, the customer agrees to all conditions set forth herein.",
    regTagline: "We build tools for those who build."
  },

  'es-ES': {
    title: "Planes y Suscripciones",
    subtitle: "Transforme su gestión con ÁTRIOS Premium. Elija el plan ideal para su empresa.",
    filterAll: "Todos",
    planFree: "Gratis",
    planMonthly: "Mensual",
    planAnnual: "Anual",
    periodMonth: "/mes",
    periodYear: "/año",
    savingsAnnual: "De 118,80€ por 89,90€",
    bestValue: "Más Popular • Mejor Valor",
    startNow: "Comenzar Ahora",
    currentPlan: "Plan Actual",
    couponPlaceholder: "Código de Cupón de Descuento",
    couponApply: "Aplicar",
    couponApplied: "Cupón Aplicado",
    couponInvalid: "Cupón inválido o caducado",

    featItemsLimit: "3 Artículos por Presupuesto",
    featWorkersFree: "1 Trabajador en Control Horario",
    featVoiceTranslatorFree: "Traductor de Voz: Hasta 5 Clientes Atendidos",
    featExpenseLimit: "3 Registros de Gastos",
    featPdfLimit: "3 Descargas de PDF",
    featServiceLimit: "3 Servicios Incluidos",
    featClientRequestsNotIncluded: "Responder a Solicitudes de Clientes",
    featUnlimitedItemsNotIncluded: "Presupuestos y Artículos Ilimitados",
    featProfitReportsNotIncluded: "Informes de Beneficios y Gráficos",
    featUnlimitedPdfNotIncluded: "Exportación de PDFs Ilimitada",
    featCloudBackupNotIncluded: "Sincronización en la Nube en Tiempo Real",
    featHdLogoNotIncluded: "Logotipo HD Personalizado en PDF",
    featGiftsNotIncluded: "Regalo de Merchandising y Ropa Pro",

    featUnlimitedItems: "Presupuestos y Artículos Ilimitados",
    featWorkersMonthly: "Hasta 3 Trabajadores en Control Horario",
    featVoiceTranslatorMonthly: "Traductor de Voz y Chat en Vivo Ilimitado",
    featClientRequestsMonthly: "Responda a 2 Solicitudes de Clientes / mes",
    featUnlimitedExpenses: "Gastos y Serviços Ilimitados",
    featUnlimitedPdf: "Descargas de PDF Ilimitadas",
    featCloudBackup: "Sincronización en la Nube en Tiempo Real",
    featProfitReports: "Informes Financieros y de Rentabilidad",
    featHdLogo: "Logotipo HD en Presupuesto y PDF",
    featPrioritySupport: "Soporte Prioritario",
    featAnnualDiscountNotIncluded: "Descuento Especial Anual (25% Ahorro)",
    featGiftsMonthlyNotIncluded: "Regalo de Ropa (Exclusivo Anual)",

    featWorkersAnnual: "Hasta 15 Trabajadores en Control Horario",
    featVoiceTranslatorAnnual: "Traductor de Voz y Chat en Vivo Ilimitado",
    featClientRequestsAnnual: "Responda a Solicitudes de Clientes ILIMITADAS",
    featPrioritySupportVip: "Soporte VIP Prioritario",
    featAnnualSavingsText: "Ahorro del 25% respecto al mensual",
    featGiftsAnnualExclusive: "OFERTA EXCLUSIVA: 3 Camisetas + 3 Chalecos con su Logotipo",

    promoLimitedOffer: "Oferta limitada para 250 suscripciones Premium",
    viewRegulation: "Consulte el Reglamento",
    closeModal: "Cerrar",
    understood: "Entendido",

    regulationModalTitle: "Reglamento de la Promoción",
    regulationModalSubtitle: "Plan Anual Premium",
    regulationBannerTitle: "OFERTA EXCLUSIVA PLAN PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "La presente promoción es una oferta exclusiva destinada a clientes que se suscriban al Plan Premium Anual de AtriosBuild.",

    regSec1Title: "OBJETO DE LA PROMOCIÓN",
    regSec1P1: "Esta promoción es una oferta exclusiva para clientes que contraten el Plan Premium de AtriosBuild.",
    regSec1P2: "Como beneficio promocional, el cliente recibirá:",
    regSec1Item1: "3 camisetas personalizadas con el logotipo de su empresa;",
    regSec1Item2: "3 chalecos de seguridad personalizados con su logotipo.",
    regSec1StockNote: "Oferta limitada al stock disponible de colores y tallas, finalizando cuando se agote el stock promocional.",

    regSec2Title: "QUIÉN PUEDE PARTICIPAR",
    regSec2P1: "Exclusivo para clientes con suscripción activa al Plan Premium de AtriosBuild.",
    regSec2P2: "No válido para planes Gratuitos o Básicos.",
    regSec2P3: "La entrega está condicionada a la confirmación de la suscripción y cumplimiento de las bases.",

    regSec3Title: "ENVÍO DEL LOGOTIPO",
    regSec3P1: "Para personalizar los artículos, el cliente deberá enviar su logotipo corporativo.",
    regSec3P2: "Formatos recomendados:",
    regSec3Format1: "PDF vectorial editable;",
    regSec3Format2: "PNG en alta resolución con fondo transparente;",
    regSec3Format3: "CDR — CorelDRAW editable.",
    regSec3P3: "El archivo será sometido a revisión técnica para verificar su idoneidad para estampación.",
    regSec3P4: "La aceptación dependerá de la calidad, nitidez y resolución del archivo enviado.",

    regSec4Title: "EVALUACIÓN Y EDICIÓN DEL LOGOTIPO",
    regSec4P1: "El equipo técnico evaluará el archivo tras su recepción.",
    regSec4P2: "Si reúne las condiciones óptimas, se enviará directamente a confección.",
    regSec4P3: "Si requiere ajustes técnicos, se informará al cliente sobre las correcciones.",
    regSec4PaidServiceBox: "Si el cliente desea que AtriosBuild prepare o vectorice su logotipo, el servicio opcional tiene un coste de 10,00 €.",
    regSec4P4: "Cualquier edición se realizará únicamente con autorización previa del cliente.",
    regSec4P5: "El archivo finalizado se enviará al cliente por correo electrónico o WhatsApp.",
    regSec4P6: "El archivo editado será 100% propiedad del cliente.",
    regSec4P7: "La contratación del servicio de edición es opcional y no condiciona la participación.",

    regSec5Title: "CAMISETAS PERSONALIZADAS",
    regSec5P1: "Cada cliente elegible recibirá 3 camisetas personalizadas.",
    regSec5ColorsTitle: "Colores disponibles:",
    regSec5Colors: "Blanco, Azul, Negro, Rojo, Gris oscuro, Gris claro, Rosa, Verde, Amarillo.",
    regSec5SizesTitle: "Tallas disponibles:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "Sujeto a disponibilidad de stock en el momento de confirmar el pedido.",
    regSec5P3: "La personalización se realizará con el logotipo aprobado por el cliente.",
    regSec5DimTitle: "Ubicación y dimensiones máximas:",
    regSec5DimFront: "Frontal: máx. 10 cm × 10 cm;",
    regSec5DimBack: "Espalda: máx. 15 cm × 20 cm;",
    regSec5DimSleeves: "Mangas: la impresión en mangas no está incluida en el pack promocional.",
    regSec5Note: "La posición podrá ajustarse técnicamente según el patrón de la prenda y forma del logotipo.",

    regSec6Title: "CHALECOS PERSONALIZADOS",
    regSec6P1: "Cada cliente elegible recibirá 3 chalecos de alta visibilidad personalizados.",
    regSec6ColorsTitle: "Colores disponibles:",
    regSec6Colors: "Verde flúor, Naranja flúor.",
    regSec6SizesTitle: "Tallas disponibles:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Colores y tallas según disponibilidad en stock.",
    regSec6P3: "Personalización con el logotipo aprobado.",
    regSec6Note: "Las medidas se adaptarán entre las bandas reflectantes del chaleco.",

    regSec7Title: "LIMITACIÓN DE STOCK",
    regSec7P1: "Promoción limitada al stock de 250 packs de camisetas y chalecos.",
    regSec7P2: "No se garantiza disponibilidad perpetua de todas las tallas y colores.",
    regSec7P3: "En caso de agotarse una opción, el cliente podrá elegir entre las alternativas disponibles.",
    regSec7P4: "AtriosBuild no estará obligado a reponer combinaciones agotadas.",
    regSec7P5: "La promoción finalizará al agotarse los 250 paquetes disponibles.",

    regSec8Title: "APROBACIÓN DEL DISEÑO",
    regSec8P1: "El cliente revisará la muestra digital antes de la producción.",
    regSec8P2: "Tras su aprobación, las prendas entrarán en la línea de confección.",
    regSec8P3: "El cliente garantiza poseer los derechos de marca sobre el logotipo proporcionado.",
    regSec8P4: "AtriosBuild declina cualquier responsabilidad por el uso de materiales de terceros aportados por el cliente.",

    regSec9Title: "PLAZO DE PRODUCCIÓN Y ENVÍO",
    regSec9P1: "Completadas todas las fases, los artículos se fabricarán y estarán listos para envío en un plazo máximo de 30 días naturales.",
    regSec9P2: "El plazo de 30 días corresponde a producción y entrega a la agencia de transporte, no al tiempo de tránsito.",
    regSec9P3: "El cómputo de 30 días inicia tras cumplirse todos los siguientes requisitos:",
    regSec9Item1: "confirmación del pago de la suscripción Premium;",
    regSec9Item2: "recepción del logotipo;",
    regSec9Item3: "aprobación técnica del archivo;",
    regSec9Item4: "selección de tallas y colores disponibles;",
    regSec9Item5: "aprobación de la prueba digital por el cliente;",
    regSec9Item6: "confirmación de la dirección de entrega;",
    regSec9Item7: "pago de los gastos de envío correspondientes.",
    regSec9P4: "Retrasos por datos incompletos o demoras del cliente suspenderán el cómputo del plazo.",

    regSec10Title: "GASTOS Y CONDICIONES DE ENVÍO",
    regSec10P1: "Los artículos promocionales son 100% gratuitos; los costes de envío corren a cargo del cliente.",
    regSec10PtTitle: "Portugal Continental y Península",
    regSec10PtText: "Para entregas en Portugal Continental, tarifa plana de envío de 8,00 €.",
    regSec10IslandsTitle: "Islas y Envíos Insulares",
    regSec10IslandsP1: "Para envíos a Baleares, Canarias, Azores o Madeira, solicitar presupuesto:",
    regSec10IslandsItem1: "coste de transporte;",
    regSec10IslandsItem2: "plazo estimado de entrega;",
    regSec10IslandsItem3: "condiciones de aduana si procede.",
    regSec10IslandsP2: "El envío se efectuará tras la confirmación y pago del porte.",
    regSec10EuTitle: "Unión Europea e Internacional",
    regSec10EuP1: "Envíos a otros destinos comunitarios e internacionales:",
    regSec10EuItem1: "tarifa según transportista;",
    regSec10EuItem2: "plazo de tránsito internacional;",
    regSec10EuItem3: "seguimiento de envío.",
    regSec10EuP2: "El coste varía según peso, volumen y país de destino.",
    regSec10Note: "El plazo de 30 días corresponde al despacho, no al tiempo de transporte final.",

    regSec11Title: "CARÁCTER PERSONAL DE LA OFERTA",
    regSec11P1: "Los regalos son para el titular de la suscripción y no son canjeables por dinero en efectivo.",
    regSec11P2: "No se sustituirán por otros productos ni descuentos en cuotas.",

    regSec12Title: "CANCELACIÓN DE LA SUSCRIPCIÓN",
    regSec12P1: "La entrega está vinculada al mantenimiento de la suscripción anual activa.",
    regSec12P2: "Si la suscripción se cancela antes del envío, se perderá el derecho a la promoción.",
    regSec12P3: "No genera crédito monetario a favor del cliente.",

    regSec13Title: "RESPONSABILIDAD POR LOS DATOS",
    regSec13P1: "El cliente es responsable de la exactitud de los datos de contacto y entrega.",
    regSec13P2: "AtriosBuild no asume responsabilidad por devoluciones debidas a direcciones erróneas.",

    regSec14Title: "MODIFICACIÓN O FINALIZACIÓN",
    regSec14P1: "AtriosBuild se reserva el derecho de modificar o cerrar la promoción por fin de existencias.",
    regSec14P2: "Cualquier actualización se notificará por los canales oficiales.",

    regSec15Title: "ACEPTACIÓN DEL REGLAMENTO",
    regSec15P1: "La suscripción implica la lectura y conformidad con el presente reglamento.",
    regSec15P2: "Al participar, el cliente acepta todas las condiciones aquí expuestas.",
    regTagline: "Construimos herramientas para quienes construyen."
  },

  'fr-FR': {
    title: "Forfaits & Abonnements",
    subtitle: "Transformez votre gestion avec ÁTRIOS Premium. Choisissez le forfait idéal pour votre entreprise.",
    filterAll: "Tous",
    planFree: "Gratuit",
    planMonthly: "Mensuel",
    planAnnual: "Annuel",
    periodMonth: "/mois",
    periodYear: "/an",
    savingsAnnual: "De 118,80€ pour 89,90€",
    bestValue: "Plus Populaire • Meilleur Rapport Qualité/Prix",
    startNow: "Commencer Maintenant",
    currentPlan: "Forfait Actuel",
    couponPlaceholder: "Code Promo / Coupon de Réduction",
    couponApply: "Appliquer",
    couponApplied: "Coupon Appliqué",
    couponInvalid: "Coupon invalide ou expiré",

    featItemsLimit: "3 Articles par Devis",
    featWorkersFree: "1 Salarié dans le Suivi des Heures",
    featVoiceTranslatorFree: "Traducteur Vocal : Jusqu'à 5 Clients Traités",
    featExpenseLimit: "3 Enregistrements de Dépenses",
    featPdfLimit: "3 Téléchargements de PDF",
    featServiceLimit: "3 Services Inclus",
    featClientRequestsNotIncluded: "Répondre aux Demandes de Devis Clients",
    featUnlimitedItemsNotIncluded: "Devis & Articles Illimités",
    featProfitReportsNotIncluded: "Rapports de Rentabilité & Graphiques",
    featUnlimitedPdfNotIncluded: "Exportation PDF Illimitée",
    featCloudBackupNotIncluded: "Synchronisation Cloud en Temps Réel",
    featHdLogoNotIncluded: "Logo HD Personnalisé sur le PDF",
    featGiftsNotIncluded: "Pack Cadeaux & Vêtements Pro",

    featUnlimitedItems: "Devis & Articles Illimités",
    featWorkersMonthly: "Jusqu'à 3 Salariés dans le Suivi des Heures",
    featVoiceTranslatorMonthly: "Traducteur Vocal & Chat en Direct Illimités",
    featClientRequestsMonthly: "Répondez à 2 Demandes Clients de la Plateforme / mois",
    featUnlimitedExpenses: "Dépenses & Services Illimités",
    featUnlimitedPdf: "Téléchargements de PDF Illimités",
    featCloudBackup: "Synchronisation Cloud en Temps Réel",
    featProfitReports: "Rapports Financiers & Bénéfices",
    featHdLogo: "Logo HD sur Devis & PDF",
    featPrioritySupport: "Support Prioritaire",
    featAnnualDiscountNotIncluded: "Remise Annuelle Spéciale (25% d'Économie)",
    featGiftsMonthlyNotIncluded: "Pack Cadeaux (Exclusivité Annuelle)",

    featWorkersAnnual: "Jusqu'à 15 Salariés dans le Suivi des Heures",
    featVoiceTranslatorAnnual: "Traducteur Vocal & Chat en Direct Illimités",
    featClientRequestsAnnual: "Répondez à des Demandes Clients ILLIMITÉES",
    featPrioritySupportVip: "Support VIP Prioritaire",
    featAnnualSavingsText: "25% d'économie par rapport au mensuel",
    featGiftsAnnualExclusive: "OFFRE EXCLUSIVE : 3 T-Shirts + 3 Gilets avec votre Logo",

    promoLimitedOffer: "Offre limitée pour les 250 premiers abonnements Premium",
    viewRegulation: "Consulter le Règlement",
    closeModal: "Fermer",
    understood: "Compris",

    regulationModalTitle: "Règlement de la Promotion",
    regulationModalSubtitle: "Forfait Annuel Premium",
    regulationBannerTitle: "OFFRE EXCLUSIVE FORFAIT PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "Cette promotion est une offre exclusive réservée aux clients souscrivant au Forfait Premium Annuel d'AtriosBuild.",

    regSec1Title: "OBJET DE LA PROMOTION",
    regSec1P1: "La présente promotion est réservée aux souscripteurs du Forfait Premium AtriosBuild.",
    regSec1P2: "En tant qu'avantage promotionnel, le client éligible recevra :",
    regSec1Item1: "3 T-shirts personnalisés avec le logo de son entreprise ;",
    regSec1Item2: "3 gilets de sécurité personnalisés avec le logo de son entreprise.",
    regSec1StockNote: "Offre limitée aux stocks disponibles de coloris et de tailles, jusqu'à épuisement du stock promotionnel.",

    regSec2Title: "ÉLIGIBILITÉ",
    regSec2P1: "Promotion exclusive aux clients ayant un abonnement actif au Forfait Premium AtriosBuild.",
    regSec2P2: "Non valable pour les forfaits Gratuit ou Basique.",
    regSec2P3: "L'attribution des cadeaux est soumise à la validation de l'abonnement et au respect du règlement.",

    regSec3Title: "ENVOI DU LOGO",
    regSec3P1: "Le client doit transmettre le logo souhaité pour la personnalisation.",
    regSec3P2: "Formats recommandés :",
    regSec3Format1: "PDF vectoriel éditable ;",
    regSec3Format2: "PNG haute résolution avec fond transparent ;",
    regSec3Format3: "CDR — CorelDRAW éditable.",
    regSec3P3: "Le fichier fera l'objet d'une vérification technique pour le marquage textile.",
    regSec3P4: "La qualité dépend de la netteté et de la résolution du fichier fourni.",

    regSec4Title: "ÉVALUATION ET ÉDITION DU LOGO",
    regSec4P1: "Le fichier est examiné par l'équipe graphique dès réception.",
    regSec4P2: "S'il est conforme, il passe directement en atelier de personnalisation.",
    regSec4P3: "En cas d'anomalie, le client est averti des modifications nécessaires.",
    regSec4PaidServiceBox: "Si le client souhaite qu'AtriosBuild effectue la vectorisation ou l'adaptation du logo, ce service optionnel est proposé à 10,00 €.",
    regSec4P4: "L'édition n'est réalisée qu'après accord préalable du client.",
    regSec4P5: "Le fichier final est transmis au client par e-mail ou WhatsApp.",
    regSec4P6: "Le fichier édité reste la propriété exclusive du client.",
    regSec4P7: "Le service d'édition est facultatif et non obligatoire pour participer.",

    regSec5Title: "T-SHIRTS PERSONNALISÉS",
    regSec5P1: "Chaque client éligible reçoit 3 T-shirts personnalisés.",
    regSec5ColorsTitle: "Couleurs disponibles :",
    regSec5Colors: "Blanc, Bleu, Noir, Rouge, Gris foncé, Gris clair, Rose, Vert, Jaune.",
    regSec5SizesTitle: "Tailles disponibles :",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "Selon stock disponible au moment de la confirmation de la commande.",
    regSec5P3: "Impression réalisée avec le logo validé par le client.",
    regSec5DimTitle: "Emplacements et dimensions maximales :",
    regSec5DimFront: "Devant : max 10 cm × 10 cm ;",
    regSec5DimBack: "Dos : max 15 cm × 20 cm ;",
    regSec5DimSleeves: "Manches : l'impression sur les manches n'est pas incluse dans l'offre promotionnelle.",
    regSec5Note: "Le positionnement peut être ajusté en fonction de la coupe du vêtement.",

    regSec6Title: "GILETS DE SÉCURITÉ PERSONNALISÉS",
    regSec6P1: "Chaque client éligible reçoit 3 gilets de sécurité personnalisés.",
    regSec6ColorsTitle: "Couleurs disponibles :",
    regSec6Colors: "Vert fluo, Orange fluo.",
    regSec6SizesTitle: "Tailles disponibles :",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Sous réserve des stocks promotionnels disponibles.",
    regSec6P3: "Personnalisation avec le logo validé.",
    regSec6Note: "Dimensions adaptées entre les bandes rétroréfléchissantes.",

    regSec7Title: "LIMITE DES STOCKS",
    regSec7P1: "Campagne limitée au stock de 250 packs de bienvenue.",
    regSec7P2: "Disponibilité permanente non garantie sur l'ensemble des combinaisons taille/couleur.",
    regSec7P3: "En cas de rupture, le client pourra sélectionner une alternative en stock.",
    regSec7P4: "AtriosBuild n'est pas tenu de réapprovisionner les variantes épuisées.",
    regSec7P5: "L'offre prendra fin dès l'attribution complète des 250 packs.",

    regSec8Title: "VALIDATION DU VISUEL",
    regSec8P1: "Un aperçu numérique peut être soumis pour validation au client.",
    regSec8P2: "Après validation, les pièces entrent en phase d'impression.",
    regSec8P3: "Le client atteste détenir l'ensemble des droits sur le logo transmis.",
    regSec8P4: "AtriosBuild décline toute responsabilité quant à l'usage d'éléments fournis par le client.",

    regSec9Title: "DÉLAIS DE PRODUCTION ET EXPÉDITION",
    regSec9P1: "Une fois toutes les étapes validées, les articles sont confectionnés et expédiés sous 30 jours calendaires maximum.",
    regSec9P2: "Le délai de 30 jours concerne la confection et la remise au transporteur par AtriosBuild, hors délai de transit.",
    regSec9P3: "Le délai débute dès réunion des conditions suivantes :",
    regSec9Item1: "confirmation de l'abonnement Premium ;",
    regSec9Item2: "réception du logo ;",
    regSec9Item3: "validation technique du fichier ;",
    regSec9Item4: "choix des couleurs et tailles disponibles ;",
    regSec9Item5: "approbation du bon à tirer par le client ;",
    regSec9Item6: "confirmation de l'adresse de livraison ;",
    regSec9Item7: "règlement des frais de port.",
    regSec9P4: "Tout retard dû à des informations incomplètes suspend le délai.",

    regSec10Title: "FRAIS ET MODALITÉS DE LIVRAISON",
    regSec10P1: "Les articles promotionnels sont gratuits ; les frais d'expédition sont à la charge du client.",
    regSec10PtTitle: "Portugal Continental",
    regSec10PtText: "Pour une livraison au Portugal Continental, tarif forfaitaire de 8,00 €.",
    regSec10IslandsTitle: "Îles et Régions Insulaires",
    regSec10IslandsP1: "Pour les Açores, Madère ou autres îles, devis préalable sur demande :",
    regSec10IslandsItem1: "coût d'acheminement ;",
    regSec10IslandsItem2: "délai estimé du transporteur ;",
    regSec10IslandsItem3: "frais douaniers éventuels.",
    regSec10IslandsP2: "Expédition réalisée après validation et règlement du montant.",
    regSec10EuTitle: "Union Européenne & International",
    regSec10EuP1: "Pour la France, la Belgique, la Suisse et l'UE :",
    regSec10EuItem1: "tarif selon grille du transporteur ;",
    regSec10EuItem2: "délai de livraison international ;",
    regSec10EuItem3: "suivi de colis.",
    regSec10EuP2: "Le montant varie selon le poids, volume et pays de destination.",
    regSec10Note: "Le délai de 30 jours s'entend jusqu'à l'expédition, hors temps de transport final.",

    regSec11Title: "CARACTÈRE PERSONNEL",
    regSec11P1: "Les cadeaux sont réservés au titulaire du compte et non convertibles en numéraire.",
    regSec11P2: "Aucun échange contre d'autres produits ou avoirs.",

    regSec12Title: "RÉSILIATION DE L'ABONNEMENT",
    regSec12P1: "L'offre est liée au maintien de l'abonnement annuel actif.",
    regSec12P2: "En cas d'annulation avant expédition, le droit au cadeau est révoqué.",
    regSec12P3: "L'offre ne constitue pas un crédit financier.",

    regSec13Title: "EXACTITUDE DES COORDONNÉES",
    regSec13P1: "Le client est responsable de l'exactitude de ses coordonnées de livraison.",
    regSec13P2: "AtriosBuild décline toute responsabilité en cas de non-livraison due à une adresse erronée.",

    regSec14Title: "MODIFICATION OU CLÔTURE",
    regSec14P1: "AtriosBuild se réserve le droit de clôturer l'offre en cas d'épuisement du stock.",
    regSec14P2: "Toute mise à jour sera diffusée sur les canaux officiels.",

    regSec15Title: "ACCEPTATION DU RÈGLEMENT",
    regSec15P1: "La souscription au forfait vaut acceptation pleine et entière du présent règlement.",
    regSec15P2: "En adhérant, le client accepte l'ensemble des clauses ci-dessus.",
    regTagline: "Nous construisons des outils pour ceux qui construisent."
  },

  'it-IT': {
    title: "Piani & Abbonamenti",
    subtitle: "Trasforma la tua gestione con ÁTRIOS Premium. Scegli il piano ideale per la tua azienda.",
    filterAll: "Tutti",
    planFree: "Gratis",
    planMonthly: "Mensile",
    planAnnual: "Annuale",
    periodMonth: "/mese",
    periodYear: "/anno",
    savingsAnnual: "Da 118,80€ a 89,90€",
    bestValue: "Più Popolare • Miglior Valore",
    startNow: "Inizia Ora",
    currentPlan: "Piano Attuale",
    couponPlaceholder: "Codice Coupon Sconto",
    couponApply: "Applica",
    couponApplied: "Coupon Applicato",
    couponInvalid: "Coupon non valido o scaduto",

    featItemsLimit: "3 Voci per Preventivo",
    featWorkersFree: "1 Dipendente nel Controllo Presenze",
    featVoiceTranslatorFree: "Traduttore Vocale: Fino a 5 Clienti Serviti",
    featExpenseLimit: "3 Registrazioni Spese",
    featPdfLimit: "3 Download PDF",
    featServiceLimit: "3 Servizi Inclusi",
    featClientRequestsNotIncluded: "Rispondere alle Richieste di Preventivo Clienti",
    featUnlimitedItemsNotIncluded: "Preventivi & Voci Illimitati",
    featProfitReportsNotIncluded: "Report di Profitto & Grafici Finanziari",
    featUnlimitedPdfNotIncluded: "Esportazione PDF Illimitata",
    featCloudBackupNotIncluded: "Sincronizzazione Cloud in Tempo Reale",
    featHdLogoNotIncluded: "Logo HD Personalizzato nel PDF",
    featGiftsNotIncluded: "Omaggio Gadget & Abbigliamento Pro",

    featUnlimitedItems: "Preventivi & Voci Illimitati",
    featWorkersMonthly: "Fino a 3 Dipendenti nel Controllo Presenze",
    featVoiceTranslatorMonthly: "Traduttore Vocale e Chat dal Vivo Illimitati",
    featClientRequestsMonthly: "Rispondi a 2 Richieste Clienti della Piattaforma / mese",
    featUnlimitedExpenses: "Spese & Servizi Illimitati",
    featUnlimitedPdf: "Download PDF Illimitati",
    featCloudBackup: "Sincronizzazione Cloud in Tempo Reale",
    featProfitReports: "Report Finanziari & di Profitto",
    featHdLogo: "Logo HD su Preventivo e PDF",
    featPrioritySupport: "Supporto Prioritario",
    featAnnualDiscountNotIncluded: "Sconto Speciale Annuale (25% di Risparmio)",
    featGiftsMonthlyNotIncluded: "Omaggio Abbigliamento (Esclusivo Annuale)",

    featWorkersAnnual: "Fino a 15 Dipendenti nel Controllo Presenze",
    featVoiceTranslatorAnnual: "Traduttore Vocale e Chat dal Vivo Illimitati",
    featClientRequestsAnnual: "Rispondi a Richieste Clienti ILLIMITATE",
    featPrioritySupportVip: "Supporto VIP Prioritario",
    featAnnualSavingsText: "Risparmio del 25% rispetto al mensile",
    featGiftsAnnualExclusive: "OFFERTA ESCLUSIVA: 3 T-Shirt + 3 Gilet con il tuo Logo",

    promoLimitedOffer: "Offerta limitata ai primi 250 abbonamenti Premium",
    viewRegulation: "Consulta il Regolamento",
    closeModal: "Chiudi",
    understood: "Ho Capito",

    regulationModalTitle: "Regolamento della Promozione",
    regulationModalSubtitle: "Piano Annuale Premium",
    regulationBannerTitle: "OFFERTA ESCLUSIVA PIANO PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "Questa promozione è un'offerta esclusiva riservata ai clienti che sottoscrivono il Piano Premium Annuale di AtriosBuild.",

    regSec1Title: "OGGETTO DELLA PROMOZIONE",
    regSec1P1: "La presente promozione è un'offerta esclusiva per gli abbonati al Piano Premium AtriosBuild.",
    regSec1P2: "Come omaggio promozionale, il cliente idoneo riceverà:",
    regSec1Item1: "3 T-shirt personalizzate con il logo aziendale;",
    regSec1Item2: "3 gilet ad alta visibilità personalizzati con il logo aziendale.",
    regSec1StockNote: "Offerta soggetta a disponibilità di magazzino per colori e taglie, fino a esaurimento scorte.",

    regSec2Title: "CHI PUÒ PARTECIPARE",
    regSec2P1: "Promozione riservata ai clienti con abbonamento attivo al Piano Premium AtriosBuild.",
    regSec2P2: "Non valida per piani Gratuiti o Base.",
    regSec2P3: "L'assegnazione è subordinata alla conferma dell'abbonamento e al rispetto delle condizioni.",

    regSec3Title: "INVIO DEL LOGO",
    regSec3P1: "Il cliente dovrà inviare il logo da stampare sui capi promozionali.",
    regSec3P2: "Formati consigliati:",
    regSec3Format1: "PDF vettoriale modificabile;",
    regSec3Format2: "PNG ad alta risoluzione con sfondo trasparente;",
    regSec3Format3: "CDR — CorelDRAW modificabile.",
    regSec3P3: "Il file sarà sottoposto a verifica tecnica per la stampa serigrafica/termica.",
    regSec3P4: "La resa finale dipende dalla definizione e nitidezza del file inviato.",

    regSec4Title: "VALUTAZIONE E MODIFICA DEL LOGO",
    regSec4P1: "Il team grafico esamina il file non appena ricevuto.",
    regSec4P2: "Se idoneo, viene subito avviata la produzione.",
    regSec4P3: "In caso di difetti tecnici, il cliente viene avvisato delle correzioni opportune.",
    regSec4PaidServiceBox: "Qualora il cliente richieda la vettorializzazione o l'editing del logo ad AtriosBuild, il servizio opzionale ha un costo di 10,00 €.",
    regSec4P4: "Le modifiche vengono eseguite solo dietro consenso del cliente.",
    regSec4P5: "Il file finale vettorializzato sarà consegnato via e-mail o WhatsApp.",
    regSec4P6: "Il logo elaborato resta al 100% di proprietà del cliente.",
    regSec4P7: "Il servizio di editing è facoltativo e non obbligatorio per partecipare.",

    regSec5Title: "T-SHIRT PERSONALIZZATE",
    regSec5P1: "Ogni cliente idoneo riceve 3 T-shirt personalizzate.",
    regSec5ColorsTitle: "Colori disponibili:",
    regSec5Colors: "Bianco, Blu, Nero, Rosso, Grigio scuro, Grigio chiaro, Rosa, Verde, Giallo.",
    regSec5SizesTitle: "Taglie disponibili:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "In base alla disponibilità di magazzino al momento della conferma d'ordine.",
    regSec5P3: "Stampa effettuata con il logo approvato dal cliente.",
    regSec5DimTitle: "Posizioni e dimensioni massime di stampa:",
    regSec5DimFront: "Fronte: max 10 cm × 10 cm;",
    regSec5DimBack: "Retro: max 15 cm × 20 cm;",
    regSec5DimSleeves: "Maniche: la stampa sulle maniche non è compresa nel pacchetto promozionale.",
    regSec5Note: "La posizione può essere adattata in base al taglio del capo e alle proporzioni del logo.",

    regSec6Title: "GILET AD ALTA VISIBILITÀ",
    regSec6P1: "Ogni cliente idoneo riceve 3 gilet personalizzati.",
    regSec6ColorsTitle: "Colori disponibili:",
    regSec6Colors: "Verde fluo, Arancione fluo.",
    regSec6SizesTitle: "Taglie disponibili:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Colori e taglie soggetti a disponibilità promozionale.",
    regSec6P3: "Personalizzazione con il logo approvato.",
    regSec6Note: "Dimensioni adattate tra le bande catarifrangenti.",

    regSec7Title: "LIMITAZIONE SCORTE",
    regSec7P1: "Campagna limitata a 250 kit promozionali di T-shirt e gilet.",
    regSec7P2: "Non si garantisce la disponibilità continua di ogni singola combinazione colore/taglia.",
    regSec7P3: "In caso di esaurimento di una variante, il cliente potrà scegliere tra le alternative disponibili.",
    regSec7P4: "AtriosBuild non è tenuta a riassortire opzioni esaurite per la promozione.",
    regSec7P5: "La campagna terminerà all'esaurimento dei 250 pacchetti disponibili.",

    regSec8Title: "APPROVAZIONE DELLA BOZZA",
    regSec8P1: "Il cliente potrà visionare la bozza grafica digitale prima della stampa.",
    regSec8P2: "Dopo l'approvazione, i capi entrano direttamente in fase di produzione.",
    regSec8P3: "Il cliente garantisce di disporre dei diritti di utilizzo del marchio fornito.",
    regSec8P4: "AtriosBuild declina ogni responsabilità per violazione di diritti terzi derivanti da materiali forniti dal cliente.",

    regSec9Title: "TEMPI DI PRODUZIONE E SPEDIZIONE",
    regSec9P1: "A seguito di tutte le conferme necessarie, i capi personalizzati saranno prodotti e pronti per la spedizione entro 30 giorni solari.",
    regSec9P2: "I 30 giorni si riferiscono esclusivamente alla produzione e consegna al corriere da parte di AtriosBuild, non ai tempi di trasporto.",
    regSec9P3: "Il conteggio dei 30 giorni decorre dal completamento di tutti i seguenti passaggi:",
    regSec9Item1: "conferma del pagamento dell'abbonamento Premium;",
    regSec9Item2: "ricezione del file del logo;",
    regSec9Item3: "approvazione tecnica del file;",
    regSec9Item4: "scelta di colori e taglie tra quelle disponibili;",
    regSec9Item5: "approvazione della bozza grafica;",
    regSec9Item6: "conferma dell'indirizzo di spedizione;",
    regSec9Item7: "pagamento delle relative spese di spedizione.",
    regSec9P4: "Ritardi dovuti a dati incompleti o ritardate conferme del cliente sospendono il termine.",

    regSec10Title: "SPESE E MODALITÀ DI SPEDIZIONE",
    regSec10P1: "I capi promozionali sono omaggio; le spese di spedizione sono a carico del cliente.",
    regSec10PtTitle: "Portogallo Continentale e Peninsulare",
    regSec10PtText: "Per consegne in Portogallo Continentale, tariffa fissa di 8,00 €.",
    regSec10IslandsTitle: "Isole (Azzorre, Madeira, Isole Italiane)",
    regSec10IslandsP1: "Per spedizioni insulari, preventivo preventivo su richiesta:",
    regSec10IslandsItem1: "costo di trasporto;",
    regSec10IslandsItem2: "tempi stimati del corriere;",
    regSec10IslandsItem3: "eventuali oneri.",
    regSec10IslandsP2: "Spedizione effettuata a pagamento delle spese di trasporto confermate.",
    regSec10EuTitle: "Italia e Unione Europea",
    regSec10EuP1: "Per consegne in Italia e in altri paesi dell'Unione Europea:",
    regSec10EuItem1: "costo secondo tariffario corriere;",
    regSec10EuItem2: "tempi di transito internazionale;",
    regSec10EuItem3: "tracciamento spedizione.",
    regSec10EuP2: "Il costo varia in base a peso, volume e paese di destinazione.",
    regSec10Note: "Il termine di 30 giorni si riferisce alla consegna al corriere, escluso il tragitto finale.",

    regSec11Title: "CARATTERE PERSONALE DELL'OFFERTA",
    regSec11P1: "I gadget sono destinati all'intestatario dell'account e non sono convertibili in denaro.",
    regSec11P2: "Non possono essere sostituiti con altri beni o sconti sul canone.",

    regSec12Title: "RECESSO O DISATTIVAZIONE",
    regSec12P1: "L'omaggio è vincolato al mantenimento dell'abbonamento annuale attivo.",
    regSec12P2: "In caso di recesso prima della spedizione, il diritto all'omaggio decade.",
    regSec12P3: "La promozione non genera crediti finanziari sul conto del cliente.",

    regSec13Title: "RESPONSABILITÀ SUI DATI",
    regSec13P1: "Il cliente è responsabile della correttezza dei dati di recapito e spedizione forniti.",
    regSec13P2: "AtriosBuild non risponde di mancate consegne dovute a indirizzi incompleti o errati.",

    regSec14Title: "MODIFICA O CONCLUSIONE",
    regSec14P1: "AtriosBuild si riserva il diritto di concludere la promozione a esaurimento delle 250 unità.",
    regSec14P2: "Qualsiasi aggiornamento sarà comunicato tramite i canali ufficiali.",

    regSec15Title: "ACCETTAZIONE DEL REGOLAMENTO",
    regSec15P1: "La sottoscrizione del piano implica la piena accettazione del presente regolamento.",
    regSec15P2: "Aderendo, il cliente dichiara di aver compreso e approvato tutte le condizioni.",
    regTagline: "Costruiamo strumenti per chi costruisce."
  },

  'ru-RU': {
    title: "Тарифы и подписки",
    subtitle: "Оптимизируйте управление бизнесом с ÁTRIOS Premium. Выберите подходящий тариф для вашей компании.",
    filterAll: "Все",
    planFree: "Бесплатный",
    planMonthly: "Месячный",
    planAnnual: "Годовой",
    periodMonth: "/месяц",
    periodYear: "/год",
    savingsAnnual: "Скидка 25% (89,90€ вместо 118,80€)",
    bestValue: "Самый популярный • Лучшая выгода",
    startNow: "Начать сейчас",
    currentPlan: "Текущий план",
    couponPlaceholder: "Промокод на скидку",
    couponApply: "Применить",
    couponApplied: "Купон применен",
    couponInvalid: "Неверный или просроченный купон",

    featItemsLimit: "3 позиции в смете",
    featWorkersFree: "1 сотрудник в учете времени",
    featVoiceTranslatorFree: "Голосовой переводчик: до 5 обслуженных клиентов",
    featExpenseLimit: "3 записи расходов",
    featPdfLimit: "3 загрузки PDF",
    featServiceLimit: "3 включенные услуги",
    featClientRequestsNotIncluded: "Ответы на заявки клиентов платформы",
    featUnlimitedItemsNotIncluded: "Неограниченные сметы и позиции",
    featProfitReportsNotIncluded: "Финансовые отчеты и графики прибыли",
    featUnlimitedPdfNotIncluded: "Неограниченный экспорт в PDF",
    featCloudBackupNotIncluded: "Синхронизация в облаке в реальном времени",
    featHdLogoNotIncluded: "HD логотип компании в PDF",
    featGiftsNotIncluded: "Фирменная спецодежда и подарки",

    featUnlimitedItems: "Неограниченные сметы и позиции",
    featWorkersMonthly: "До 3 сотрудников в учете времени",
    featVoiceTranslatorMonthly: "Безлимитный голосовой переводчик и онлайн-чат",
    featClientRequestsMonthly: "Ответы на 2 заявки клиентов / месяц",
    featUnlimitedExpenses: "Неограниченные расходы и услуги",
    featUnlimitedPdf: "Неограниченная загрузка PDF",
    featCloudBackup: "Облачная синхронизация в реальном времени",
    featProfitReports: "Финансовые отчеты и расчет прибыли",
    featHdLogo: "Логотип в HD на сметах и PDF",
    featPrioritySupport: "Приоритетная поддержка",
    featAnnualDiscountNotIncluded: "Специальная годовая скидка (25% экономии)",
    featGiftsMonthlyNotIncluded: "Подарочный набор (только для годового плана)",

    featWorkersAnnual: "До 15 сотрудников в учете времени",
    featVoiceTranslatorAnnual: "Безлимитный голосовой переводчик и онлайн-чат",
    featClientRequestsAnnual: "НЕОГРАНИЧЕННЫЕ ответы на заявки клиентов",
    featPrioritySupportVip: "VIP приоритетная поддержка",
    featAnnualSavingsText: "Экономия 25% по сравнению с помесячной оплатой",
    featGiftsAnnualExclusive: "ЭКСКЛЮЗИВ: 3 футболки + 3 жилета с вашим логотипом",

    promoLimitedOffer: "Ограниченное предложение для первых 250 Premium подписок",
    viewRegulation: "Ознакомиться с регламентом",
    closeModal: "Закрыть",
    understood: "Понятно",

    regulationModalTitle: "Регламент акции",
    regulationModalSubtitle: "Годовой план Premium",
    regulationBannerTitle: "ЭКСКЛЮЗИВНОЕ ПРЕДЛОЖЕНИЕ PREMIUM — ATRIOSBUILD",
    regulationBannerSubtitle: "Данная акция является эксклюзивным предложением для клиентов, оформивших годовую подписку AtriosBuild Premium.",

    regSec1Title: "ПРЕДМЕТ АКЦИИ",
    regSec1P1: "Акция действует исключительно для клиентов, оформивших подписку Premium на платформе AtriosBuild.",
    regSec1P2: "В качестве подарочного бонуса клиент получает:",
    regSec1Item1: "3 футболки с индивидуальным нанесением логотипа компании;",
    regSec1Item2: "3 сигнальных жилета с нанесением логотипа компании.",
    regSec1StockNote: "Предложение ограничено складскими запасами размеров и расцветок.",

    regSec2Title: "КТО МОЖЕТ УЧАСТВОВАТЬ",
    regSec2P1: "Только для активных подписчиков годового тарифа Premium AtriosBuild.",
    regSec2P2: "Не распространяется на бесплатный и базовый тарифы.",
    regSec2P3: "Предоставление подарков осуществляется после подтверждения оплаты подписки.",

    regSec3Title: "ПРЕДОСТАВЛЕНИЕ ЛОГОТИПА",
    regSec3P1: "Для брендирования клиент предоставляет файл логотипа компании.",
    regSec3P2: "Рекомендуемые форматы:",
    regSec3Format1: "Векторный PDF с возможностью редактирования;",
    regSec3Format2: "PNG в высоком разрешении с прозрачным фоном;",
    regSec3Format3: "CDR — CorelDRAW.",
    regSec3P3: "Файл проходит техническую проверку на пригодность к текстильной печати.",
    regSec3P4: "Качество готовой продукции напрямую зависит от разрешения исходного файла.",

    regSec4Title: "ПРОВЕРКА И ДОРАБОТКА ЛОГОТИПА",
    regSec4P1: "После отправки файл анализируется дизайнерами.",
    regSec4P2: "При соответствии стандартам он сразу направляется в печать.",
    regSec4P3: "При низком качестве файла клиенту будут предложены рекомендации по исправлению.",
    regSec4PaidServiceBox: "Если требуется профессиональная отрисовка/векторизация логотипа силами AtriosBuild, услуга предоставляется по цене 10,00 €.",
    regSec4P4: "Правка выполняется только с согласия клиента.",
    regSec4P5: "Готовый векторный файл передается клиенту по e-mail или WhatsApp.",
    regSec4P6: "Файл остается в полной собственности клиента.",
    regSec4P7: "Заказ платной отрисовки является добровольным и не обязателен для участия в акции.",

    regSec5Title: "ФИРМЕННЫЕ ФУТБОЛКИ",
    regSec5P1: "Каждый клиент получает 3 брендированные футболки.",
    regSec5ColorsTitle: "Доступные цвета:",
    regSec5Colors: "Белый, Синий, Черный, Красный, Темно-серый, Светло-серый, Розовый, Зеленый, Желтый.",
    regSec5SizesTitle: "Доступные размеры:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "Выбор цветов и размеров зависит от наличия на складе на момент утверждения заказа.",
    regSec5P3: "Печать выполняется по утвержденному макету.",
    regSec5DimTitle: "Места и максимальные размеры нанесения:",
    regSec5DimFront: "Грудь: макс. 10 × 10 см;",
    regSec5DimBack: "Спина: макс. 15 × 20 см;",
    regSec5DimSleeves: "Рукава: нанесение на рукавах не входит в промо-пакет.",
    regSec5Note: "Положение логотипа может быть скорректировано с учетом кроя изделия.",

    regSec6Title: "СИГНАЛЬНЫЕ ЖИЛЕТЫ",
    regSec6P1: "Каждый клиент получает 3 сигнальных жилета с логотипом.",
    regSec6ColorsTitle: "Доступные цвета:",
    regSec6Colors: "Сигнальный зеленый, Сигнальный оранжевый.",
    regSec6SizesTitle: "Доступные размеры:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "Зависит от складского наличия на момент подтверждения.",
    regSec6P3: "Нанесение по утвержденному логотипу.",
    regSec6Note: "Размеры подбираются с учетом светоотражающих полос.",

    regSec7Title: "ОГРАНИЧЕНИЕ ЗАПАСОВ",
    regSec7P1: "Акция строго ограничена партией в 250 подарочных комплектов.",
    regSec7P2: "Постоянное наличие всех цветов и размеров не гарантируется.",
    regSec7P3: "При отсутствии нужного размера предлагается альтернативный вариант из наличия.",
    regSec7P4: "AtriosBuild не обязуется пополнять закончившиеся промо-позиции.",
    regSec7P5: "Акция завершается после распределения всех 250 наборов.",

    regSec8Title: "СОГЛАСОВАНИЕ МАКЕТА",
    regSec8P1: "Клиент утверждает электронный макет перед запуском печати.",
    regSec8P2: "После утверждения изделия поступают в производство.",
    regSec8P3: "Клиент подтверждает наличие авторских прав на предоставленный логотип.",
    regSec8P4: "AtriosBuild не несет ответственности за претензии третьих лиц к материалам клиента.",

    regSec9Title: "СРОКИ ПРОИЗВОДСТВА И ОТПРАВКИ",
    regSec9P1: "После утверждения всех параметров изделия изготавливаются и готовятся к отправке в срок до 30 календарных дней.",
    regSec9P2: "Срок 30 дней относится к изготовлению и передаче в курьерскую службу, без учета времени доставки.",
    regSec9P3: "Отсчет 30 дней начинается после выполнения всех условий:",
    regSec9Item1: "подтверждение оплаты Premium подписки;",
    regSec9Item2: "получение файла логотипа;",
    regSec9Item3: "техническое одобрение макета;",
    regSec9Item4: "выбор цветов и размеров из наличия;",
    regSec9Item5: "финальное утверждение макета клиентом;",
    regSec9Item6: "предоставление адреса доставки;",
    regSec9Item7: "оплата стоимости доставки.",
    regSec9P4: "Задержки в согласовании со стороны клиента приостанавливают течение срока.",

    regSec10Title: "СТОИМОСТЬ И УСЛОВИЯ ДОСТАВКИ",
    regSec10P1: "Сами подарки бесплатны; доставка оплачивается клиентом.",
    regSec10PtTitle: "Материковая Португалия",
    regSec10PtText: "Для доставки по материковой Португалии фиксированный тариф составляет 8,00 €.",
    regSec10IslandsTitle: "Островные регионы",
    regSec10IslandsP1: "Для островов Азорских, Мадейры и др. расчет по запросу:",
    regSec10IslandsItem1: "тариф перевозчика;",
    regSec10IslandsItem2: "ориентировочные сроки;",
    regSec10IslandsItem3: "условия доставки.",
    regSec10IslandsP2: "Отправка производится после оплаты доставки.",
    regSec10EuTitle: "Европейский Союз и международная доставка",
    regSec10EuP1: "Доставка в другие страны рассчитывается индивидуально:",
    regSec10EuItem1: "стоимость по тарифам курьера;",
    regSec10EuItem2: "сроки международной перевозки;",
    regSec10EuItem3: "трекинг отправления.",
    regSec10EuP2: "Стоимость зависит от веса, габаритов и страны назначения.",
    regSec10Note: "30-дневный срок касается передачи в службу доставки.",

    regSec11Title: "ПЕРСОНАЛЬНЫЙ ХАРАКТЕР",
    regSec11P1: "Подарки предназначены владельцу аккаунта и не подлежат денежной компенсации.",
    regSec11P2: "Обмен на скидку или другие товары не предусмотрен.",

    regSec12Title: "ОТМЕНА ПОДПИСКИ",
    regSec12P1: "Участие связано с действующей годовой подпиской.",
    regSec12P2: "При отмене подписки до отправки право на подарок аннулируется.",
    regSec12P3: "Подарок не образует финансового баланса на счете.",

    regSec13Title: "ОТВЕТСТВЕННОСТЬ ЗА ДАННЫЕ",
    regSec13P1: "Клиент отвечает за правильность указанного адреса доставки.",
    regSec13P2: "AtriosBuild не несет ответственности за недоставку из-за неверных данных.",

    regSec14Title: "ИЗМЕНЕНИЕ ИЛИ ЗАВЕРШЕНИЕ",
    regSec14P1: "AtriosBuild оставляет за собой право завершить акцию при исчерпании фонда подарков.",
    regSec14P2: "Изменения публикуются в официальных каналах платформы.",

    regSec15Title: "СОГЛАСИЕ С ПРАВИЛАМИ",
    regSec15P1: "Оформление подписки означает полное согласие с данными правилами.",
    regSec15P2: "Участвуя в акции, клиент подтверждает принятие всех условий.",
    regTagline: "Мы создаем инструменты для тех, кто строит."
  },

  'hi-IN': {
    title: "योजनाएं और सदस्यता",
    subtitle: "ÁTRIOS Premium के साथ अपने प्रबंधन को बेहतर बनाएं। अपने व्यवसाय के लिए सही योजना चुनें।",
    filterAll: "सभी",
    planFree: "निःशुल्क",
    planMonthly: "मासिक",
    planAnnual: "वार्षिक",
    periodMonth: "/माह",
    periodYear: "/वर्ष",
    savingsAnnual: "118.80€ के बजाय केवल 89.90€",
    bestValue: "सर्वाधिक लोकप्रिय • सर्वोत्तम मूल्य",
    startNow: "अभी शुरू करें",
    currentPlan: "वर्तमान योजना",
    couponPlaceholder: "डिस्काउंट कूपन कोड",
    couponApply: "लागू करें",
    couponApplied: "कूपन लागू हुआ",
    couponInvalid: "अमान्य या समाप्त कूपन",

    featItemsLimit: "प्रति कोटेशन 3 आइटम",
    featWorkersFree: "टाइम ट्रैकिंग में 1 कर्मचारी",
    featVoiceTranslatorFree: "वॉयस ट्रांसलेटर: 5 सेवित ग्राहकों तक",
    featExpenseLimit: "3 व्यय रिकॉर्ड",
    featPdfLimit: "3 पीडीएफ डाउनलोड",
    featServiceLimit: "3 शामिल सेवाएं",
    featClientRequestsNotIncluded: "ग्राहक कोटेशन अनुरोधों का उत्तर दें",
    featUnlimitedItemsNotIncluded: "असीमित कोटेशन और आइटम",
    featProfitReportsNotIncluded: "लाभ रिपोर्ट और वित्तीय चार्ट",
    featUnlimitedPdfNotIncluded: "असीमित पीडीएफ निर्यात",
    featCloudBackupNotIncluded: "रियल-टाइम क्लाउड सिंक",
    featHdLogoNotIncluded: "पीडीएफ पर कस्टम एचडी लोगो",
    featGiftsNotIncluded: "मुफ्त ब्रांडेड उपहार और परिधान",

    featUnlimitedItems: "असीमित कोटेशन और आइटम",
    featWorkersMonthly: "टाइम ट्रैकिंग में 3 कर्मचारियों तक",
    featVoiceTranslatorMonthly: "असीमित वॉयस ट्रांसलेटर और लाइव चैट",
    featClientRequestsMonthly: "प्रति माह 2 ग्राहक अनुरोधों का उत्तर दें",
    featUnlimitedExpenses: "असीमित व्यय और सेवाएं",
    featUnlimitedPdf: "असीमित पीडीएफ डाउनलोड",
    featCloudBackup: "रियल-टाइम क्लाउड सिंक",
    featProfitReports: "वित्तीय और लाभ रिपोर्ट",
    featHdLogo: "कोटेशन और पीडीएफ पर एचडी लोगो",
    featPrioritySupport: "प्राथमिकता सहायता",
    featAnnualDiscountNotIncluded: "विशेष वार्षिक छूट (25% बचत)",
    featGiftsMonthlyNotIncluded: "उपहार पैकेज (केवल वार्षिक योजना)",

    featWorkersAnnual: "टाइम ट्रैकिंग में 15 कर्मचारियों तक",
    featVoiceTranslatorAnnual: "असीमित वॉयस ट्रांसलेटर और लाइव चैट",
    featClientRequestsAnnual: "असीमित ग्राहक अनुरोधों का उत्तर दें",
    featPrioritySupportVip: "वीआईपी प्राथमिकता सहायता",
    featAnnualSavingsText: "मासिक की तुलना में 25% की बचत",
    featGiftsAnnualExclusive: "विशेष ऑफर: आपके लोगो के साथ 3 टी-शर्ट + 3 सुरक्षा वेस्ट",

    promoLimitedOffer: "पहले 250 प्रीमियम ग्राहकों के लिए सीमित ऑफर",
    viewRegulation: "नियम और शर्तें देखें",
    closeModal: "बंद करें",
    understood: "समझ गया",

    regulationModalTitle: "प्रमोशन नियमावली",
    regulationModalSubtitle: "वार्षिक प्रीमियम योजना",
    regulationBannerTitle: "विशेष प्रीमियम योजना ऑफर — ATRIOSBUILD",
    regulationBannerSubtitle: "यह प्रमोशन AtriosBuild वार्षिक प्रीमियम योजना की सदस्यता लेने वाले ग्राहकों के लिए विशेष उपहार है।",

    regSec1Title: "प्रमोशन का उद्देश्य",
    regSec1P1: "यह प्रमोशन AtriosBuild प्रीमियम प्लान की सदस्यता लेने वाले ग्राहकों के लिए एक विशेष ऑफर है।",
    regSec1P2: "प्रमोशनल लाभ के रूप में योग्य ग्राहक को प्राप्त होगा:",
    regSec1Item1: "आपकी कंपनी के लोगो के साथ 3 कस्टमाइज्ड टी-शर्ट्स;",
    regSec1Item2: "आपकी कंपनी के लोगो के साथ 3 कस्टमाइज्ड सुरक्षा वेस्ट।",
    regSec1StockNote: "यह ऑफर उपलब्ध स्टॉक (रंग और आकार) तक सीमित है।",

    regSec2Title: "कौन भाग ले सकता है",
    regSec2P1: "यह प्रमोशन विशेष रूप से AtriosBuild प्रीमियम प्लान के सक्रिय ग्राहकों के लिए है।",
    regSec2P2: "फ्री या बेसिक प्लान के लिए यह ऑफर मान्य नहीं है।",
    regSec2P3: "उपहारों का वितरण सदस्यता की पुष्टि के अधीन है।",

    regSec3Title: "लोगो भेजना",
    regSec3P1: "प्रिंटिंग के लिए ग्राहक को अपना कंपनी लोगो भेजना होगा।",
    regSec3P2: "अनुशंसित फाइल फॉर्मेट:",
    regSec3Format1: "एडिटेबल वेक्टर पीडीएफ;",
    regSec3Format2: "पारदर्शी बैकग्राउंड के साथ उच्च रिज़ॉल्यूशन पीएनजी;",
    regSec3Format3: "सीडीआर — CorelDRAW।",
    regSec3P3: "फाइल की तकनीकी जांच की जाएगी।",
    regSec3P4: "स्वीकृति फाइल की गुणवत्ता और स्पष्टता पर निर्भर करती है।",

    regSec4Title: "लोगो मूल्यांकन और संपादन",
    regSec4P1: "डिजाइन टीम फाइल की जांच करेगी।",
    regSec4P2: "यदि फाइल उपयुक्त है, तो सीधे प्रिंटिंग शुरू की जाएगी।",
    regSec4P3: "यदि कोई समस्या पाई जाती है, तो ग्राहक को सूचित किया जाएगा।",
    regSec4PaidServiceBox: "यदि ग्राहक AtriosBuild द्वारा लोगो वेक्टर संपादन चाहता है, तो यह वैकल्पिक सेवा 10.00 € में उपलब्ध है।",
    regSec4P4: "संपादन केवल ग्राहक की अनुमति से किया जाएगा।",
    regSec4P5: "तैयार फाइल ग्राहक को ईमेल या व्हाट्सएप पर भेजी जाएगी।",
    regSec4P6: "संपादित फाइल ग्राहक की संपत्ति रहेगी।",
    regSec4P7: "संपादन सेवा लेना वैकल्पिक है और अनिवार्य नहीं है।",

    regSec5Title: "कस्टम टी-शर्ट्स",
    regSec5P1: "प्रत्येक योग्य ग्राहक को 3 कस्टम टी-शर्ट प्राप्त होंगी।",
    regSec5ColorsTitle: "उपलब्ध रंग:",
    regSec5Colors: "सफेद, नीला, काला, लाल, गहरा भूरा, हल्का भूरा, गुलाबी, हरा, पीला।",
    regSec5SizesTitle: "उपलब्ध आकार:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "रंग और आकार स्टॉक की उपलब्धता पर निर्भर करते हैं।",
    regSec5P3: "प्रिंटिंग अनुमोदित लोगो के साथ की जाएगी।",
    regSec5DimTitle: "प्रिंट का स्थान और अधिकतम आकार:",
    regSec5DimFront: "आगे: अधिकतम 10 सेमी × 10 सेमी;",
    regSec5DimBack: "पीछे: अधिकतम 15 सेमी × 20 सेमी;",
    regSec5DimSleeves: "आस्तीन: आस्तीन पर प्रिंटिंग शामिल नहीं है।",
    regSec5Note: "कपड़े के अनुसार स्थिति में तकनीकी समायोजन किया जा सकता है।",

    regSec6Title: "कस्टम सुरक्षा वेस्ट",
    regSec6P1: "प्रत्येक योग्य ग्राहक को 3 कस्टम सुरक्षा वेस्ट प्राप्त होंगे।",
    regSec6ColorsTitle: "उपलब्ध रंग:",
    regSec6Colors: "फ्लोरोसेंट हरा, फ्लोरोसेंट नारंगी।",
    regSec6SizesTitle: "उपलब्ध आकार:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "उपलब्ध स्टॉक के अधीन।",
    regSec6P3: "स्वीकृत लोगो के साथ प्रिंटिंग की जाएगी।",
    regSec6Note: "रिफ्लेक्टिव पट्टियों के बीच प्रिंट का आकार समायोजित किया जाएगा।",

    regSec7Title: "स्टॉक सीमा",
    regSec7P1: "यह ऑफर 250 गिफ्ट पैक्स तक सीमित है।",
    regSec7P2: "स्टॉक समाप्त होने पर विकल्प चुनने की सुविधा दी जाएगी।",
    regSec7P3: "ग्राहक उपलब्ध विकल्पों में से चयन कर सकते हैं।",
    regSec7P4: "समाप्त विकल्पों को फिर से स्टॉक करना अनिवार्य नहीं है।",
    regSec7P5: "250 पैकेज समाप्त होने पर अभियान समाप्त हो जाएगा।",

    regSec8Title: "डिजाइन अनुमोदन",
    regSec8P1: "प्रिंटिंग से पहले डिजिटल मॉकअप की समीक्षा की जा सकती है।",
    regSec8P2: "अनुमोदन के बाद उत्पादन शुरू होगा।",
    regSec8P3: "ग्राहक लोगो के बौद्धिक संपदा अधिकारों की पुष्टि करता है।",
    regSec8P4: "AtriosBuild ग्राहक द्वारा प्रदान सामग्री के लिए उत्तरदायी नहीं है।",

    regSec9Title: "उत्पादन और डिलीवरी समय",
    regSec9P1: "सभी स्वीकृतियों के बाद 30 दिनों के भीतर उत्पाद तैयार कर भेजे जाएंगे।",
    regSec9P2: "30 दिन का समय विनिर्माण और कूरियर को सौंपने के लिए है।",
    regSec9P3: "30 दिन की गणना निम्नलिखित शर्तों के बाद शुरू होगी:",
    regSec9Item1: "प्रीमियम सदस्यता भुगतान की पुष्टि;",
    regSec9Item2: "लोगो फाइल प्राप्त होना;",
    regSec9Item3: "तकनीकी अनुमोदन;",
    regSec9Item4: "रंग और आकार का चयन;",
    regSec9Item5: "ग्राहक द्वारा फाइनल मॉकअप का अनुमोदन;",
    regSec9Item6: "डिलीवरी पते की पुष्टि;",
    regSec9Item7: "शिपिंग शुल्क का भुगतान।",
    regSec9P4: "ग्राहक की ओर से देरी होने पर समय सीमा बढ़ सकती है।",

    regSec10Title: "शिपिंग लागत और शर्तें",
    regSec10P1: "उपहार 100% मुफ्त हैं; शिपिंग शुल्क ग्राहक द्वारा देय है।",
    regSec10PtTitle: "पुर्तगाल मुख्य भूमि",
    regSec10PtText: "पुर्तगाल मुख्य भूमि के लिए शिपिंग शुल्क 8.00 € है।",
    regSec10IslandsTitle: "द्वीप और अंतरराष्ट्रीय शिपिंग",
    regSec10IslandsP1: "द्वीपों या अन्य देशों के लिए दरें:",
    regSec10IslandsItem1: "परिवहन लागत;",
    regSec10IslandsItem2: "अनुमानित समय;",
    regSec10IslandsItem3: "कूरियर शर्तें।",
    regSec10IslandsP2: "शिपिंग शुल्क भुगतान के बाद प्रेषण होगा।",
    regSec10EuTitle: "यूरोपीय संघ और अंतरराष्ट्रीय",
    regSec10EuP1: "अन्य अंतरराष्ट्रीय गंतव्यों के लिए:",
    regSec10EuItem1: "कूरियर दरों के अनुसार;",
    regSec10EuItem2: "अंतरराष्ट्रीय ट्रांजिट समय;",
    regSec10EuItem3: "ट्रैकिंग सुविधा।",
    regSec10EuP2: "लागत वजन और देश पर निर्भर करती है।",
    regSec10Note: "30 दिन का समय डिस्पैच के लिए है।",

    regSec11Title: "ऑफर की व्यक्तिगत प्रकृति",
    regSec11P1: "उपहार अहस्तांतरणीय हैं और नकद में नहीं बदले जा सकते।",
    regSec11P2: "कोई नकद विकल्प या छूट नहीं दी जाएगी।",

    regSec12Title: "सदस्यता रद्दीकरण",
    regSec12P1: "उपहार सक्रिय वार्षिक सदस्यता से जुड़े हैं।",
    regSec12P2: "भेजने से पहले रद्द करने पर उपहार पात्रता समाप्त हो सकती है।",
    regSec12P3: "यह कोई वित्तीय क्रेडिट नहीं बनाता है।",

    regSec13Title: "दिए गए डेटा की जिम्मेदारी",
    regSec13P1: "सटीक पता और संपर्क विवरण देने की जिम्मेदारी ग्राहक की है।",
    regSec13P2: "गलत पते के कारण डिलीवरी न होने पर कंपनी उत्तरदायी नहीं होगी।",

    regSec14Title: "संशोधन या समाप्ति",
    regSec14P1: "स्टॉक समाप्त होने पर कंपनी ऑफर समाप्त करने का अधिकार रखती है।",
    regSec14P2: "अपडेट आधिकारिक चैनलों पर प्रकाशित किए जाएंगे।",

    regSec15Title: "नियमों की स्वीकृति",
    regSec15P1: "सदस्यता लेने का अर्थ इन नियमों की पूर्ण स्वीकृति है।",
    regSec15P2: "भाग लेने से ग्राहक सभी शर्तों से सहमत होता है।",
    regTagline: "हम उन लोगों के लिए उपकरण बनाते हैं जो निर्माण करते हैं।"
  },

  'bn-BD': {
    title: "প্ল্যান ও সাবস্ক্রিপশন",
    subtitle: "ÁTRIOS Premium দিয়ে আপনার ব্যবসায়িক ব্যবস্থাপনা রূপান্তর করুন। আপনার ব্যবসার জন্য সেরা প্ল্যানটি বেছে নিন।",
    filterAll: "সমস্ত",
    planFree: "বিনামূল্যে",
    planMonthly: "মাসিক",
    planAnnual: "বার্ষিক",
    periodMonth: "/মাস",
    periodYear: "/বছর",
    savingsAnnual: "১১৮.৮০€ এর পরিবর্তে মাত্র ৮৯.৯০€",
    bestValue: "সর্বাধিক জনপ্রিয় • সেরা মূল্য",
    startNow: "এখনই শুরু করুন",
    currentPlan: "বর্তমান প্ল্যান",
    couponPlaceholder: "ডিসকাউন্ট কুপন কোড",
    couponApply: "প্রয়োগ করুন",
    couponApplied: "কুপন প্রয়োগ করা হয়েছে",
    couponInvalid: "মেয়াদোত্তীর্ণ বা ভুল কুপন",

    featItemsLimit: "প্রতি কোটেশনে ৩টি আইটেম",
    featWorkersFree: "টাইম ট্র্যাকিংয়ে ১ জন কর্মী",
    featVoiceTranslatorFree: "ভয়েস অনুবাদক: সর্বোচ্চ ৫ জন গ্রাহক সেবা",
    featExpenseLimit: "৩টি খরচ এন্ট্রি",
    featPdfLimit: "৩টি পিডিএফ ডাউনলোড",
    featServiceLimit: "৩টি অন্তর্ভুক্ত সেবা",
    featClientRequestsNotIncluded: "গ্রাহকদের কোটেশন অনুরোধে সাড়া দিন",
    featUnlimitedItemsNotIncluded: "আনলিমিটেড কোটেশন ও আইটেম",
    featProfitReportsNotIncluded: "লাভ রিপোর্ট ও আর্থিক গ্রাফ",
    featUnlimitedPdfNotIncluded: "আনলিমিটেড পিডিএফ এক্সপোর্ট",
    featCloudBackupNotIncluded: "রিয়েল-টাইম ক্লাউড সিঙ্ক",
    featHdLogoNotIncluded: "পিডিএফ-এ কাস্টম এইচডি লোগো",
    featGiftsNotIncluded: "বিনামূল্যে ব্র্যান্ডেড উপহার ও পোশাক",

    featUnlimitedItems: "আনলিমিটেড কোটেশন ও আইটেম",
    featWorkersMonthly: "টাইম ট্র্যাকিংয়ে ৩ জন কর্মী পর্যন্ত",
    featVoiceTranslatorMonthly: "আনলিমিটেড ভয়েস অনুবাদক ও লাইভ চ্যাট",
    featClientRequestsMonthly: "মাসে ২টি গ্রাহক অনুরোধের উত্তর দিন",
    featUnlimitedExpenses: "আনলিমিটেড খরচ ও সেবা",
    featUnlimitedPdf: "আনলিমিটেড পিডিএফ ডাউনলোড",
    featCloudBackup: "রিয়েল-টাইম ক্লাউড সিঙ্ক",
    featProfitReports: "আর্থিক ও মুনাফা রিপোর্ট",
    featHdLogo: "কোটেশন ও পিডিএফ-এ এইচডি লোগো",
    featPrioritySupport: "অগ্রাধিকার সহায়তা",
    featAnnualDiscountNotIncluded: "বিশেষ বার্ষিক ছাড় (২৫% সাশ্রয়)",
    featGiftsMonthlyNotIncluded: "উপহার প্যাকেজ (শুধুমাত্র বার্ষিক প্ল্যানে)",

    featWorkersAnnual: "টাইম ট্র্যাকিংয়ে ১৫ জন কর্মী পর্যন্ত",
    featVoiceTranslatorAnnual: "আনলিমিটেড ভয়েস অনুবাদক ও লাইভ চ্যাট",
    featClientRequestsAnnual: "প্ল্যাটফর্মের আনলিমিটেড গ্রাহক অনুরোধে সাড়া দিন",
    featPrioritySupportVip: "ভিআইপি অগ্রাধিকার সহায়তা",
    featAnnualSavingsText: "মাসিকের তুলনায় ২৫% সাশ্রয়",
    featGiftsAnnualExclusive: "বিশেষ অফার: আপনার লোগো সহ ৩টি টি-শার্ট + ৩টি ভেস্ট",

    promoLimitedOffer: "প্রথম ২৫০ জন প্রিমিয়াম গ্রাহকের জন্য সীমিত অফার",
    viewRegulation: "নিয়মাবলী দেখুন",
    closeModal: "বন্ধ করুন",
    understood: "বুঝেছি",

    regulationModalTitle: "প্রমোশন নীতিমালা",
    regulationModalSubtitle: "বার্ষিক প্রিমিয়াম প্ল্যান",
    regulationBannerTitle: "বিশেষ প্রিমিয়াম প্ল্যান অফার — ATRIOSBUILD",
    regulationBannerSubtitle: "এই প্রমোশনটি AtriosBuild বার্ষিক প্রিমিয়াম প্ল্যান গ্রহণকারী গ্রাহকদের জন্য একটি বিশেষ উপহার।",

    regSec1Title: "প্রমোশনের উদ্দেশ্য",
    regSec1P1: "এই প্রমোশনটি AtriosBuild প্রিমিয়াম প্ল্যান গ্রহণকারী গ্রাহকদের জন্য একটি বিশেষ অফার।",
    regSec1P2: "প্রমোশনাল সুবিধা হিসেবে গ্রাহক পাবেন:",
    regSec1Item1: "কোম্পানির লোগো সহ ৩টি কাস্টমাইজড টি-শার্ট;",
    regSec1Item2: "কোম্পানির লোগো সহ ৩টি কাস্টমাইজড সেফটি ভেস্ট।",
    regSec1StockNote: "এই অফারটি স্টক থাকা সাপেক্ষে সীমিত।",

    regSec2Title: "কারা অংশগ্রহণ করতে পারবেন",
    regSec2P1: "শুধুমাত্র AtriosBuild প্রিমিয়াম প্ল্যানের সক্রিয় গ্রাহকদের জন্য প্রযোজ্য।",
    regSec2P2: "ফ্রি বা বেসিক প্ল্যানে এই অফার প্রযোজ্য নয়।",
    regSec2P3: "উপহার বিতরণ সাবস্ক্রিপশন নিশ্চিতকরণের উপর নির্ভরশীল।",

    regSec3Title: "লোগো পাঠানো",
    regSec3P1: "প্রিন্টিংয়ের জন্য গ্রাহককে তার কোম্পানির লোগো পাঠাতে হবে।",
    regSec3P2: "পছন্দনীয় ফাইল ফরম্যাট:",
    regSec3Format1: "সম্পাদনাযোগ্য ভেক্টর পিডিএফ;",
    regSec3Format2: "স্বচ্ছ ব্যাকগ্রাউন্ড সহ উচ্চ রেজোলিউশনের পিএনজি;",
    regSec3Format3: "সিডিআর — CorelDRAW।",
    regSec3P3: "ফাইলটি টেকনিক্যাল পরীক্ষার মধ্য দিয়ে যাবে।",
    regSec3P4: "ফাইলের কোয়ালিটি ও স্পষ্টতার উপর প্রিন্টিং নির্ভর করে।",

    regSec4Title: "লোগো মূল্যায়ন ও এডিটিং",
    regSec4P1: "ডিজাইন টিম ফাইলটি যাচাই করবে।",
    regSec4P2: "উপযুক্ত হলে সরাসরি প্রিন্টিং শুরু হবে।",
    regSec4P3: "কোন সমস্যা থাকলে গ্রাহককে জানানো হবে।",
    regSec4PaidServiceBox: "গ্রাহক চাইলে AtriosBuild দ্বারা লোগো ভেক্টরাইজেশন সেবা মাত্র ১০.০০ € মূল্যে নিতে পারবেন।",
    regSec4P4: "অনুমোদনের পরেই এডিটিং করা হবে।",
    regSec4P5: "চূড়ান্ত ফাইল গ্রাহককে ইমেল বা হোয়াটসঅ্যাপে পাঠানো হবে।",
    regSec4P6: "এডিটেড ফাইলটি গ্রাহকের নিজস্ব সম্পত্তিতে থাকবে।",
    regSec4P7: "এই সেবাটি ঐচ্ছিক এবং অফারে অংশ নেওয়ার জন্য বাধ্যতামূলক নয়।",

    regSec5Title: "কাস্টম টি-শার্ট",
    regSec5P1: "প্রতিটি যোগ্য গ্রাহক ৩টি কাস্টম টি-শার্ট পাবেন।",
    regSec5ColorsTitle: "উপলব্ধ রঙ:",
    regSec5Colors: "সাদা, নীল, কালো, লাল, গাঢ় ধূসর, হালকা ধূসর, গোলাপি, সবুজ, হলুদ।",
    regSec5SizesTitle: "উপলব্ধ সাইজ:",
    regSec5Sizes: "XS, S, M, L, XL, XXL.",
    regSec5P2: "রঙ ও সাইজ স্টকের উপর নির্ভরশীল।",
    regSec5P3: "অনুমোদিত লোগো দিয়ে প্রিন্টিং করা হবে।",
    regSec5DimTitle: "প্রিন্টের অবস্থান ও সর্বোচ্চ মাপ:",
    regSec5DimFront: "সামনে: সর্বোচ্চ ১০ সেমি × ১০ সেমি;",
    regSec5DimBack: "পেছনে: সর্বোচ্চ ১৫ সেমি × ২০ সেমি;",
    regSec5DimSleeves: "হাতায়: হাতায় প্রিন্টিং অন্তর্ভুক্ত নয়।",
    regSec5Note: "পোশাকের সাইজ অনুযায়ী অবস্থানের সামঞ্জস্য হতে পারে।",

    regSec6Title: "কাস্টম সেফটি ভেস্ট",
    regSec6P1: "প্রতিটি যোগ্য গ্রাহক ৩টি কাস্টম ভেস্ট পাবেন।",
    regSec6ColorsTitle: "উপলব্ধ রঙ:",
    regSec6Colors: "ফ্লুরোসেন্ট সবুজ, ফ্লুরোসেন্ট কমলা।",
    regSec6SizesTitle: "উপলব্ধ সাইজ:",
    regSec6Sizes: "M, L, XL, XXL.",
    regSec6P2: "স্টকের প্রাপ্যতার উপর নির্ভরশীল।",
    regSec6P3: "অনুমোদিত লোগো দ্বারা প্রিন্ট করা হবে।",
    regSec6Note: "রিফ্লেক্টিভ ব্যান্ডের মাঝে লোগো বসানো হবে।",

    regSec7Title: "স্টক সীমাবদ্ধতা",
    regSec7P1: "এই অফারটি ২৫০টি উপহার প্যাকেজের জন্য সীমাবদ্ধ।",
    regSec7P2: "নির্দিষ্ট সাইজ শেষ হলে বিকল্প বেছে নেওয়া যাবে।",
    regSec7P3: "গ্রাহক স্টক থাকা বিকল্প থেকে বেছে নিতে পারবেন।",
    regSec7P4: "স্টক শেষ হলে অফার বন্ধ হতে পারে।",
    regSec7P5: "২৫০ প্যাকেজ শেষ হলে ক্যাম্পেইন শেষ হবে।",

    regSec8Title: "ডিজাইন অনুমোদন",
    regSec8P1: "প্রিন্টের আগে গ্রাহককে ডিজিটাল নমুনা দেখানো হবে।",
    regSec8P2: "অনুমোদনের পর উৎপাদন শুরু হবে।",
    regSec8P3: "গ্রাহক লোগোর স্বত্বাধিকার নিশ্চিত করেন।",
    regSec8P4: "তৃতীয় পক্ষের দাবির জন্য কোম্পানি দায়ী থাকবে না।",

    regSec9Title: "উৎপাদন ও ডেলিভারির সময়",
    regSec9P1: "অনুমোদনের পর ৩০ কার্যদিবসের মধ্যে প্রস্তুত ও পাঠানো হবে।",
    regSec9P2: "৩০ দিন উৎপাদনের জন্য প্রযোজ্য, ট্রানজিট সময় আলাদা।",
    regSec9P3: "নিম্নোক্ত ধাপগুলো সম্পন্ন হওয়ার পর ৩০ দিন গণনা শুরু হবে:",
    regSec9Item1: "প্রিমিয়াম সাবস্ক্রিপশন নিশ্চিতকরণ;",
    regSec9Item2: "লোগো ফাইল গ্রহণ;",
    regSec9Item3: "টেকনিক্যাল অনুমোদন;",
    regSec9Item4: "রঙ ও সাইজ নির্বাচন;",
    regSec9Item5: "নকশার চূড়ান্ত অনুমোদন;",
    regSec9Item6: "ডেলিভারি ঠিকানা নিশ্চিতকরণ;",
    regSec9Item7: "শিপিং ফি পরিশোধ।",
    regSec9P4: "গ্রাহকের দেরির কারণে সময় বৃদ্ধি পেতে পারে।",

    regSec10Title: "শিপিং খরচ ও শর্তাবলী",
    regSec10P1: "উপহার সামগ্রী সম্পূর্ণ ফ্রি; শিপিং খরচ গ্রাহককে বহন করতে হবে।",
    regSec10PtTitle: "পর্তুগাল মূল ভূখণ্ড",
    regSec10PtText: "পর্তুগাল মূল ভূখণ্ডের জন্য শিপিং ফি ৮.০০ €।",
    regSec10IslandsTitle: "দ্বীপপুঞ্জ ও আন্তর্জাতিক শিপিং",
    regSec10IslandsP1: "দ্বীপ বা অন্যান্য দেশের জন্য শিপিং রেট:",
    regSec10IslandsItem1: "কুরিয়ার খরচ;",
    regSec10IslandsItem2: "আনুমানিক সময়;",
    regSec10IslandsItem3: "কুরিয়ার শর্তাবলী।",
    regSec10IslandsP2: "শিপিং ফি পরিশোধের পর পাঠানো হবে।",
    regSec10EuTitle: "ইউরোপীয় ইউনিয়ন ও আন্তর্জাতিক",
    regSec10EuP1: "অন্যান্য আন্তর্জাতিক ডেলিভারির জন্য:",
    regSec10EuItem1: "কুরিয়ার রেট অনুযায়ী;",
    regSec10EuItem2: "ট্রানজিট সময়;",
    regSec10EuItem3: "ট্র্যাকিং সুবিধা।",
    regSec10EuP2: "ওজন ও দেশের উপর ভিত্তি করে খরচ নির্ধারিত হয়।",
    regSec10Note: "৩০ দিন মূলত শিপিংয়ের জন্য হস্তান্তরের সময়।",

    regSec11Title: "অফারের ব্যক্তিগত প্রকৃতি",
    regSec11P1: "উপহার হস্তান্তরযোগ্য নয় এবং নগদে রূপান্তর করা যাবে না।",
    regSec11P2: "অন্য কোন ছাড়ের সাথে পরিবর্তনযোগ্য নয়।",

    regSec12Title: "বাতিল বা নিষ্ক্রিয়করণ",
    regSec12P1: "উপহারটি বার্ষিক সাবস্ক্রিপশনের সাথে সম্পর্কিত।",
    regSec12P2: "শিপিংয়ের আগে বাতিল করলে উপহারের অধিকার বাতিল হবে।",
    regSec12P3: "এটি কোন আর্থিক ক্রেডিট গঠন করে না।",

    regSec13Title: "প্রদত্ত তথ্যের দায়িত্ব",
    regSec13P1: "সঠিক ঠিকানা ও যোগাযোগের তথ্য প্রদানের দায়িত্ব গ্রাহকের।",
    regSec13P2: "ভুল ঠিকানার কারণে ডেলিভারি না হলে কোম্পানি দায়ী নয়।",

    regSec14Title: "পরিবর্তন বা সমাপ্তি",
    regSec14P1: "স্টক শেষ হলে ক্যাম্পেইন শেষ করার অধিকার সংরক্ষিত।",
    regSec14P2: "যেকোনো আপডেট অফিসিয়াল চ্যানেলে জানানো হবে।",

    regSec15Title: "নিয়মাবলী গ্রহণ",
    regSec15P1: "সাবস্ক্রিপশন গ্রহণ মানে এই নীতিমালা সম্পূর্ণ মেনে নেওয়া।",
    regSec15P2: "অংশগ্রহণের মাধ্যমে গ্রাহক সমস্ত শর্তে সম্মতি জানাচ্ছেন।",
    regTagline: "আমরা তাদের জন্য প্রযুক্তি তৈরি করি যারা নির্মাণ করেন।"
  }
};
