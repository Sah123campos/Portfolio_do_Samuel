/*
 * Dados dos projetos — fonte única para a órbita 3D e para a versão estática.
 * A ordem aqui é a ordem em que a câmera visita as telas.
 * Imagens: screenshot 1440×900 salvo em WebP com 1200 e 640 px em assets/images/projects/.
 */
export const projects = [
  {
    id: "sistema-solar",
    name: "O Sistema Solar",
    kind: "Experiência 3D interativa",
    year: "2026",
    summary:
      "Uma viagem guiada pela rolagem: a câmera visita o Sol e os oito planetas, compara os tamanhos reais e se afasta até a Via Láctea.",
    features: [
      "Planetas procedurais em shaders GLSL, sem imagens",
      "Atmosferas com espalhamento de Rayleigh e Mie",
      "Fichas com dados da NASA e escala real",
    ],
    stack: ["Three.js", "GLSL", "GSAP ScrollTrigger", "Lenis"],
    image: "assets/images/projects/sistema-solar",
    logo: null,
    demo: "https://sah123campos.github.io/sistema-solar/",
    demoLabel: "Fazer a viagem",
    repo: "https://github.com/Sah123campos/sistema-solar",
    tint: 0xffb347,
  },
  {
    id: "nucleo-meridiano",
    name: "Núcleo Meridiano",
    kind: "Jornada 3D de uma loja de hardware gamer",
    year: "2026",
    summary:
      "A rolagem conduz a câmera da fábrica de PCs até o armazém e termina na casa do cliente, em primeira pessoa, diante do setup gamer.",
    features: [
      "14 paradas com a câmera percorrendo a cena",
      "Brilho neon com pós-processamento (bloom)",
      "Fábrica e armazém também em páginas separadas",
    ],
    stack: ["Three.js", "Postprocessing", "JavaScript"],
    image: "assets/images/projects/nucleo-meridiano",
    logo: null,
    demo: "https://sah123campos.github.io/Loja-de-gamers/",
    demoLabel: "Percorrer a jornada",
    repo: "https://github.com/Sah123campos/Loja-de-gamers",
    tint: 0xff2d8a,
  },
  {
    id: "aura-motors",
    name: "Aura Motors",
    kind: "Projeto conceito de concessionária de luxo",
    year: "2026",
    summary:
      "Ateliê automotivo fictício com um carro em 3D que acompanha a rolagem, configurador de cores e rodas e catálogo com comparação de modelos.",
    features: [
      "Modelo 3D carregado com GLTFLoader e DRACO",
      "Configurador com pré-visualização em tempo real",
      "Catálogo com fichas técnicas e comparação",
    ],
    stack: ["Three.js", "Tailwind CSS", "JavaScript"],
    image: "assets/images/projects/aura-motors",
    logo: "assets/images/logos/aura-motors.webp",
    demo: null,
    demoLabel: null,
    repo: "https://github.com/Sah123campos/AuraMotors",
    tint: 0xd4a84a,
  },
  {
    id: "habileads",
    name: "Habileads",
    kind: "Site para imobiliária",
    year: "2025",
    summary:
      "Vitrine de imóveis em que cada empreendimento tem galeria própria e um atalho direto para conversar com o corretor pelo WhatsApp.",
    features: [
      "Galerias de fotos em modal por empreendimento",
      "Título do topo com efeito de digitação",
      "Contato por WhatsApp com mensagem pronta",
    ],
    stack: ["HTML5", "CSS3", "JavaScript"],
    image: "assets/images/projects/habileads",
    logo: "assets/images/logos/habileads.webp",
    demo: "https://habileads.com.br/",
    demoLabel: "Ver site no ar",
    repo: "https://github.com/Sah123campos/habileads",
    tint: 0xe0333c,
  },
  {
    id: "construtora-peixe",
    name: "Construtora Peixe",
    kind: "Site institucional para construtora",
    year: "2025",
    summary:
      "Site de uma construtora com mais de 10 anos de mercado, organizado em torno dos empreendimentos entregues e de um caminho curto até o contato.",
    features: [
      "Carrossel no topo e contadores animados",
      "Galeria de empreendimentos navegável pelo teclado",
      "Seções de diferenciais e contato",
    ],
    stack: ["HTML5", "CSS3", "JavaScript"],
    image: "assets/images/projects/construtora-peixe",
    logo: "assets/images/logos/construtora-peixe.webp",
    demo: "https://sah123campos.github.io/teste1/",
    demoLabel: "Ver demonstração",
    repo: "https://github.com/Sah123campos/teste1",
    tint: 0x2f6bd8,
  },
  {
    id: "helio-solucoes",
    name: "Hélio Soluções Engenharia",
    kind: "Site para empresa de engenharia",
    year: "2025",
    summary:
      "Apresenta laudos técnicos, perícias e responsabilidade técnica de um jeito que o cliente leigo entenda qual norma se aplica ao seu caso.",
    features: [
      "Serviços organizados por norma (NR-11, NR-12, NR-13)",
      "Seção de perícias com vídeo institucional",
      "Formulário de contato e WhatsApp",
    ],
    stack: ["HTML5", "CSS3", "UX/UI"],
    image: "assets/images/projects/helio-solucoes",
    logo: "assets/images/logos/helio-solucoes.webp",
    demo: "https://sah123campos.github.io/engrenagem_3/",
    demoLabel: "Ver demonstração",
    repo: "https://github.com/Sah123campos/engrenagem_3",
    tint: 0x3a8fc4,
  },
  {
    id: "cramer",
    name: "Calculadora de Cramer",
    kind: "Ferramenta de matemática",
    year: "2025",
    summary:
      "Resolve sistemas de equações lineares pelo método de Cramer e mostra o caminho: o determinante principal e o de cada matriz modificada.",
    features: [
      "Sistemas 2×2, 3×3 e 4×4",
      "Exibe os determinantes usados em cada variável",
      "Cálculo feito inteiramente no navegador",
    ],
    stack: ["HTML5", "CSS3", "JavaScript"],
    image: "assets/images/projects/cramer",
    logo: "assets/images/logos/cramer.webp",
    demo: "https://sah123campos.github.io/cramer/",
    demoLabel: "Usar a calculadora",
    repo: "https://github.com/Sah123campos/cramer",
    tint: 0x7a5cd6,
  },
];

/* Trabalho em andamento — lista curta, sem tela na órbita. */
export const inProgress = [
  { name: "Gerenciador de Tarefas", detail: "Aplicação com Spring Boot e Thymeleaf", status: "Em desenvolvimento" },
  { name: "API RESTful com autenticação", detail: "Spring Security e JWT", status: "Planejado" },
];
