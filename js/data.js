/*
 * Dados do portfólio — fonte única para a galeria, a stack e os destaques.
 *
 * ADICIONAR UM PROJETO
 * 1. Tire um screenshot da página inicial em 1440×900 e salve em WebP como
 *    assets/images/projects/<id>-1200.webp e <id>-640.webp.
 * 2. Acrescente um objeto em `projects` com os campos abaixo.
 *    - layout: "feature" (grande, com imagem ampla) ou "grid" (cartão na grade).
 *    - fx: efeito de passar o mouse ("orbit", "neon", "sweep", "zoom",
 *      "blueprint", "splash", "pixel", "code"). Pode deixar de fora.
 *    - demo/repo: deixe null quando não houver; o cartão se ajusta.
 * A Calculadora de Cramer tem um bloco próprio em index.html.
 */
export const projects = [
  {
    id: "sistema-solar",
    name: "O Sistema Solar",
    category: "Experiência 3D interativa",
    year: "2026",
    summary:
      "Uma viagem guiada pela rolagem: a câmera visita o Sol e os oito planetas, compara os tamanhos reais e se afasta até a Via Láctea.",
    built: [
      "Planetas procedurais em shaders GLSL, sem imagens",
      "Atmosferas com espalhamento de Rayleigh e Mie",
      "Fichas com dados da NASA e escala real",
    ],
    role: "Projeto autoral: conceito, cena 3D e código",
    stack: ["Three.js", "GLSL", "GSAP ScrollTrigger", "Lenis"],
    image: "assets/images/projects/sistema-solar",
    alt: "Abertura do site O Sistema Solar: o título em letras finas com o Sol em 3D entre as palavras, sobre o espaço escuro",
    demo: "https://sah123campos.github.io/sistema-solar/",
    demoLabel: "Fazer a viagem",
    repo: "https://github.com/Sah123campos/sistema-solar",
    accent: "#ffb45e",
    layout: "feature",
    fx: "orbit",
  },
  {
    id: "nucleo-meridiano",
    name: "Núcleo Meridiano",
    category: "Jornada 3D · loja de hardware gamer",
    year: "2026",
    summary:
      "A rolagem conduz a câmera da fábrica de PCs até o armazém e termina na casa do cliente, em primeira pessoa, diante do setup gamer.",
    built: [
      "14 paradas com a câmera percorrendo a cena",
      "Brilho neon com pós-processamento (bloom)",
      "Fábrica e armazém também em páginas separadas",
    ],
    role: "Projeto autoral: narrativa, composição da cena e código",
    stack: ["Three.js", "Pós-processamento", "JavaScript"],
    image: "assets/images/projects/nucleo-meridiano",
    alt: "Abertura do Núcleo Meridiano: o título “Da fábrica até a sua mesa” ao lado da fachada da fábrica em 3D com letreiro neon rosa",
    demo: "https://sah123campos.github.io/Loja-de-gamers/",
    demoLabel: "Percorrer a jornada",
    repo: "https://github.com/Sah123campos/Loja-de-gamers",
    accent: "#ff4fa3",
    layout: "feature",
    fx: "neon",
  },
  {
    id: "aura-motors",
    name: "Aura Motors",
    category: "Projeto conceito · concessionária de luxo",
    year: "2026",
    summary:
      "Ateliê automotivo fictício com um carro em 3D que acompanha a rolagem, configurador de cores e rodas e catálogo com comparação de modelos.",
    built: [
      "Modelo 3D carregado com GLTFLoader e DRACO",
      "Configurador com pré-visualização em tempo real",
      "Catálogo com fichas técnicas e comparação",
    ],
    role: "Projeto conceito autoral: direção visual, 3D e interface",
    stack: ["Three.js", "GLTF", "Tailwind CSS", "JavaScript"],
    image: "assets/images/projects/aura-motors",
    alt: "Abertura da Aura Motors: o título dourado “Perfeição em cada detalhe” sobre um carro esportivo em 3D iluminado em violeta",
    demo: "https://sah123campos.github.io/auramotors/",
    demoLabel: "Abrir o ateliê",
    repo: "https://github.com/Sah123campos/AuraMotors",
    accent: "#d9b25f",
    layout: "feature",
    fx: "sweep",
  },
  {
    id: "habileads",
    name: "Habileads",
    category: "Site para imobiliária",
    year: "2025",
    summary:
      "Vitrine de imóveis em que cada empreendimento tem galeria própria e um caminho curto até o corretor: o objetivo é transformar visita em conversa.",
    built: [
      "Galerias de fotos em modal por empreendimento",
      "Título do topo com efeito de digitação",
      "Contato por WhatsApp com mensagem pronta",
    ],
    role: "Cliente real: layout, desenvolvimento e publicação",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/habileads",
    alt: "Página inicial da Habileads: a frase “Transformando sonhos em endereços” sobre a foto de casas e a seção de imóveis em destaque",
    demo: "https://habileads.com.br/",
    demoLabel: "Ver site no ar",
    repo: "https://github.com/Sah123campos/habileads",
    accent: "#ff5a63",
    layout: "grid",
    fx: "zoom",
  },
  {
    id: "helio-solucoes",
    name: "Hélio Soluções Engenharia",
    category: "Site institucional · engenharia",
    year: "2025",
    summary:
      "Apresenta laudos técnicos, perícias e responsabilidade técnica de um jeito que o cliente leigo entenda qual norma se aplica ao seu caso, e passe confiança.",
    built: [
      "Serviços organizados por norma (NR-11, NR-12, NR-13)",
      "Seção de perícias com vídeo institucional",
      "Formulário de contato e WhatsApp",
    ],
    role: "Cliente real: arquitetura da informação, layout e desenvolvimento",
    stack: ["HTML", "CSS", "UX/UI"],
    image: "assets/images/projects/helio-solucoes",
    alt: "Página inicial da Hélio Soluções Engenharia: logotipo, título e chamada para falar com especialistas sobre fundo branco",
    demo: "https://sah123campos.github.io/engrenagem_3/",
    demoLabel: "Ver o site",
    repo: "https://github.com/Sah123campos/engrenagem_3",
    accent: "#4fa3e0",
    layout: "grid",
    fx: "blueprint",
  },
  {
    id: "faisca",
    name: "Faísca",
    category: "Site conceito · marca de energético",
    year: null,
    summary:
      "Marca fictícia de energético de frutas brasileiras: carrossel 3D com oito latas, uma lata que gira com a rolagem e tinta líquida que revela a polpa da fruta.",
    built: [
      "Latas em 3D com rótulos desenhados em Canvas 2D",
      "Efeito de tinta em WebGL que reage ao cursor e ao toque",
      "Assistente de tela que segue o cursor e responde perguntas",
    ],
    role: "Projeto conceito autoral",
    stack: ["Three.js", "WebGL", "Canvas 2D"],
    image: "assets/images/projects/faisca",
    alt: "Lata amarela de maracujá em um pedestal, cercada por latas de outros sabores",
    demo: "https://sah123campos.github.io/faisca/",
    demoLabel: "Abrir o site",
    repo: "https://github.com/Sah123campos/faisca",
    accent: "#ffb21e",
    layout: "grid",
    fx: "splash",
  },
  {
    id: "misterio-dos-sinais",
    name: "O Mistério dos Sinais",
    category: "Jogo web · RPG em pixel art",
    year: null,
    summary:
      "RPG de investigação de cerca de dez minutos que roda no navegador do computador e do celular, com motor próprio em Canvas, sem engine.",
    built: [
      "Motor de jogo próprio em Canvas, com diálogos e enigmas",
      "Controles por teclado e joystick de toque",
      "Instalável no celular como aplicativo (PWA)",
    ],
    role: "Projeto autoral: roteiro, arte e programação",
    stack: ["JavaScript", "Canvas", "PWA"],
    image: "assets/images/projects/misterio-dos-sinais",
    alt: "Tela inicial em pixel art com o título O Mistério dos Sinais sobre paredes de pedra",
    demo: "https://sah123campos.github.io/misterio-dos-sinais/",
    demoLabel: "Jogar",
    repo: "https://github.com/Sah123campos/misterio-dos-sinais",
    accent: "#b59bff",
    layout: "grid",
    fx: "pixel",
  },
  {
    id: "gestao-pedidos",
    name: "Gestão de Pedidos",
    category: "Back-end Java · projeto acadêmico em equipe",
    year: "2026",
    summary:
      "Domínio de um e-commerce em Java: produtos, clientes, pedidos e pagamentos por cartão, boleto e Pix, construído aula a aula na disciplina de Desenvolvimento Back-end.",
    built: [
      "Pagamentos com herança, interfaces e polimorfismo",
      "Exceções de domínio para estoque, pedido e pagamento",
      "Testes com JUnit 5 e Mockito, cobertura pelo JaCoCo",
    ],
    role: "Projeto em equipe, em andamento",
    stack: ["Java", "Maven", "JUnit 5", "Mockito"],
    image: null,
    code: [
      "public abstract class FormaPagamento",
      "    implements ProcessadorPagamento {",
      "",
      "public class CartaoCredito",
      "    extends FormaPagamento",
      "    implements Estornavel {",
    ],
    alt: "",
    demo: null,
    demoLabel: null,
    repo: "https://github.com/Sah123campos/ecommerce-pedidos-alfa",
    accent: "#7fe3ff",
    layout: "grid",
    fx: "code",
  },
];

/* Trabalho em construção — aparece em "Na bancada", nunca como projeto pronto. */
export const inProgress = [
  { name: "Gerenciador de Tarefas", detail: "Aplicação com Spring Boot, JPA e Thymeleaf", status: "Em desenvolvimento" },
  { name: "API RESTful com autenticação", detail: "Spring Security e JWT", status: "Planejado" },
];

/*
 * Tecnologias. status:
 *  - "published": aparece em projetos publicados (campo `where`)
 *  - "practice":  uso no dia a dia, nos estudos ou em projetos ainda não publicados
 *  - "study":     estudando agora
 * Ajuste aqui se algo mudar — sem níveis de proficiência ou anos de experiência.
 */
export const stack = [
  {
    id: "backend",
    name: "Back-end",
    items: [
      { sym: "Jv", name: "Java", status: "published", where: ["Gestão de Pedidos"], desc: "Linguagem principal do meu back-end: tipagem forte e orientação a objetos para modelar regras de negócio que precisam durar." },
      { sym: "Sb", name: "Spring Boot", status: "practice", where: ["Gerenciador de Tarefas (em desenvolvimento)"], desc: "Sobe uma aplicação Java pronta para produção com configuração mínima: servidor, injeção de dependências e integrações." },
      { sym: "Ss", name: "Spring Security", status: "study", desc: "Camada de autenticação e autorização do Spring. Protege rotas, controla papéis e valida tokens." },
      { sym: "Jp", name: "JPA e Hibernate", status: "practice", where: ["Gerenciador de Tarefas (em desenvolvimento)"], desc: "Mapeiam classes Java em tabelas e cuidam das consultas, para o código falar de objetos e não de SQL solto." },
    ],
  },
  {
    id: "frontend",
    name: "Front-end",
    items: [
      { sym: "Ht", name: "HTML", status: "published", where: ["Todos os sites deste portfólio"], desc: "A estrutura semântica da página: o que é título, navegação, lista ou formulário. Base da acessibilidade." },
      { sym: "Cs", name: "CSS", status: "published", where: ["Todos os sites deste portfólio"], desc: "Layout, tipografia, responsividade e animações leves, sem depender de JavaScript." },
      { sym: "Js", name: "JavaScript", status: "published", where: ["Sistema Solar", "Cramer", "O Mistério dos Sinais"], desc: "Interatividade no navegador: estado da interface, eventos, cálculos e a ponte com o WebGL." },
      { sym: "Th", name: "Thymeleaf", status: "practice", where: ["Gerenciador de Tarefas (em desenvolvimento)"], desc: "Templates HTML renderizados pelo servidor Spring: o back-end entrega a página pronta com os dados." },
      { sym: "Tw", name: "Tailwind CSS", status: "published", where: ["Aura Motors"], desc: "Classes utilitárias para montar interfaces consistentes rapidamente, direto no HTML." },
    ],
  },
  {
    id: "3d",
    name: "3D e animação",
    items: [
      { sym: "3j", name: "Three.js", status: "published", where: ["Sistema Solar", "Núcleo Meridiano", "Aura Motors", "Faísca", "Cramer"], desc: "Biblioteca que organiza cenas, câmeras, luzes e materiais sobre o WebGL." },
      { sym: "Gl", name: "WebGL", status: "published", where: ["Sistema Solar", "este portfólio"], desc: "A API do navegador que desenha na placa de vídeo. É o que deixa milhares de partículas rodarem a 60 quadros." },
      { sym: "Sh", name: "GLSL", status: "published", where: ["Sistema Solar", "este portfólio"], desc: "Linguagem dos shaders: programas que rodam na GPU e calculam a cor e a posição de cada ponto." },
      { sym: "Gs", name: "GSAP", status: "published", where: ["Sistema Solar", "Cramer", "este portfólio"], desc: "Motor de animação com linhas do tempo precisas, usado para coordenar entradas e transições." },
      { sym: "St", name: "ScrollTrigger", status: "published", where: ["Sistema Solar", "Cramer", "este portfólio"], desc: "Plugin do GSAP que liga animações à rolagem: a página conta a história conforme o visitante desce." },
      { sym: "Ln", name: "Lenis", status: "published", where: ["Sistema Solar", "Cramer", "este portfólio"], desc: "Rolagem suave que mantém a posição nativa da página, compatível com ScrollTrigger e com o teclado." },
    ],
  },
  {
    id: "data",
    name: "Banco de dados",
    items: [
      { sym: "My", name: "MySQL", status: "practice", desc: "Banco relacional para dados estruturados com relacionamentos claros, como pedidos e clientes." },
      { sym: "Pg", name: "PostgreSQL", status: "practice", desc: "Banco relacional robusto, com tipos avançados e consultas complexas." },
      { sym: "Mg", name: "MongoDB", status: "practice", desc: "Banco orientado a documentos, útil quando os dados mudam de forma com frequência." },
    ],
  },
  {
    id: "tools",
    name: "Ferramentas",
    items: [
      { sym: "Gt", name: "Git", status: "published", where: ["Todos os repositórios"], desc: "Controle de versão: histórico, branches e a segurança de poder voltar atrás." },
      { sym: "Gh", name: "GitHub", status: "published", where: ["Todos os repositórios", "GitHub Pages"], desc: "Onde ficam o código, as revisões e a publicação dos sites pelo GitHub Pages." },
      { sym: "Dk", name: "Docker", status: "study", desc: "Empacota a aplicação com o que ela precisa para rodar igual em qualquer máquina." },
      { sym: "Pm", name: "Postman", status: "practice", desc: "Para testar e documentar endpoints de API durante o desenvolvimento." },
      { sym: "Ij", name: "IntelliJ IDEA", status: "practice", desc: "IDE para Java e Spring: navegação no código, refatoração e depuração." },
      { sym: "Vs", name: "VS Code", status: "practice", desc: "Editor para o front-end, os shaders e os projetos web." },
    ],
  },
];

/* Ligações entre as órbitas da stack (desenhadas como linhas de luz). */
export const stackLinks = [
  ["data", "backend"],
  ["backend", "frontend"],
  ["backend", "tools"],
  ["tools", "frontend"],
  ["frontend", "3d"],
];

export const statusLabel = {
  published: "Em projetos publicados",
  practice: "Em uso, sem projeto público",
  study: "Estudando agora",
};
