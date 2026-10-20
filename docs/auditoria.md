# Auditoria do portfólio — outubro de 2026

## Como os dados foram coletados

A listagem da API (`/users/Sah123campos/repos`) não estava acessível no ambiente da reconstrução, então os repositórios foram descobertos assim: links do portfólio antigo, README do perfil (`Sah123campos/Sah123campos`) e verificação direta de nomes prováveis com `git ls-remote`. Cada repositório encontrado foi clonado e o `index.html`, os scripts e o histórico foram lidos. Os screenshots foram gerados com Chromium headless a partir dos clones.

**Ação sugerida:** confira em github.com/Sah123campos?tab=repositories se há algum repositório público que não aparece abaixo e, se houver, adicione-o em `js/projects.js`.

## Inventário de repositórios

| Repositório | O que é | Stack | Demo | No portfólio novo |
|---|---|---|---|---|
| `sistema-solar` | Viagem 3D pelo Sistema Solar guiada pela rolagem, planetas procedurais em GLSL | Three.js r160, GLSL, GSAP ScrollTrigger, Lenis | sah123campos.github.io/sistema-solar | Sim (1º na órbita) |
| `Loja-de-gamers` | Núcleo Meridiano: jornada 3D da fábrica de PCs até a casa do cliente, 14 paradas | Three.js r128, bloom (UnrealBloomPass) | sah123campos.github.io/Loja-de-gamers | Sim |
| `AuraMotors` | Concessionária de luxo fictícia com carro 3D, configurador e catálogo | Three.js r128, GLTFLoader/DRACO, Tailwind | sem Pages | Sim, só com link do código |
| `fabrica-gamer-3d`, `armazem-3d` | Partes da jornada Núcleo Meridiano publicadas em separado (citadas no README da loja) | Three.js | — | Não (já cobertas pela loja) |
| `habileads` | Site da imobiliária Habileads, com galerias em modal e WhatsApp | HTML, CSS, JS | habileads.com.br | Sim |
| `teste1` | Site da Construtora Peixe (versão final), com carrossel, contadores e galeria de empreendimentos | HTML, CSS, JS | sah123campos.github.io/teste1 | Sim |
| `construtora-peixe` | Versão anterior do site da Construtora Peixe | HTML, CSS, JS | sem Pages | Não (substituído por `teste1`) |
| `engrenagem_3` | Site da Hélio Soluções Engenharia (versão final): laudos, perícias, NR-11/12/13, vídeo e formulário | HTML, CSS | sah123campos.github.io/engrenagem_3 | Sim |
| `engrenagem`, `engrenagem_1`, `engrenagem_2` | Iterações anteriores do site da Hélio | HTML, CSS | Pages ativo | Não (iterações) |
| `cramer` | Calculadora do método de Cramer, sistemas 2×2 a 4×4 | HTML, CSS, JS | sah123campos.github.io/cramer | Sim |
| `portfolio` | Portfólio mais antigo | HTML, CSS | sah123campos.github.io/portfolio | Não |
| `Portfolio_do_Samuel` | Portfólio atual (será substituído) | HTML, CSS, JS | — | — |
| `biblioteca` | Contém apenas um .docx de atividade de outra pessoa | — | — | Não |
| `Sah123campos` | README do perfil | Markdown | — | Fonte de bio e stack |

Os três projetos 3D foram encontrados depois da primeira versão, a partir da indicação do Samuel. Eles definiram a direção do portfólio novo: a mesma técnica de câmera guiada pela rolagem.

Projeto citado no README do perfil sem repositório público encontrado: **Gerenciador de Tarefas** (Spring Boot + Thymeleaf, em desenvolvimento). Ele aparece no portfólio na lista "Em andamento".

### Sugestões de higiene no GitHub

- Renomear `teste1` para algo como `construtora-peixe-site` e `engrenagem_3` para `helio-solucoes-site`. Nomes genéricos atrapalham quem chega pelo perfil. Ao renomear, atualize os links em `js/projects.js` (o GitHub redireciona o repositório, mas o GitHub Pages muda de URL).
- Arquivar `engrenagem`, `engrenagem_1`, `engrenagem_2` e `construtora-peixe`, ou deixá-los privados.
- Revisar `biblioteca`: o arquivo é de outra pessoa.
- Ativar o GitHub Pages no `AuraMotors` para o portfólio ganhar o link "ver ao vivo" (hoje só aponta para o código). Depois, preencha `demo` e `demoLabel` dele em `js/projects.js`.
- Renomear `Loja-de-gamers` para `nucleo-meridiano`, que é o nome que aparece no site.
- Adicionar descrição, *topics* e o campo *website* em cada repositório do inventário.
- Quando o Gerenciador de Tarefas tiver uma versão apresentável, publicá-lo: hoje o portfólio não tem nenhum projeto Java público, e é justamente o foco declarado.

## Diagnóstico do portfólio antigo

**Conteúdo**
- Título genérico ("Portfólio - Desenvolvedor Full Stack") e nenhum nome próprio no hero.
- Formação desatualizada ("SENAI - 4º Semestre") e nenhuma menção à UFSCar ou ao foco em Java/Spring, que o README do perfil já destaca.
- Projetos sem link para o código.
- Rodapé com ano fixo em 2024 corrigido via JavaScript.

**Técnico**
- Foto de perfil de 520 KB, 2296×4080 px, com nome de arquivo do WhatsApp (espaços na URL) e usada também como favicon.
- Um `<link rel="stylesheet">` apontando para a foto JPEG.
- AOS (biblioteca externa) e a biblioteca Font Awesome inteira carregados para poucos ícones.
- Logos em PNG de 54–216 KB; `cramer_logo.webp` estava no repositório mas não era usado.
- `onerror` apontando para via.placeholder.com, serviço que saiu do ar.
- `console.log` de depuração e um `preventDefault` desnecessário no botão de WhatsApp; listeners de `scroll` e `resize` sem *throttle*.
- Estilos *inline* com cores fixas (`#FFC107` com texto branco não passa no contraste AA).

**SEO e compartilhamento**
- Sem `meta description`, Open Graph, URL canônica ou dados estruturados.

**Acessibilidade**
- Botão de menu era uma `<div>` sem foco por teclado nem `aria-expanded`.
- Sem link de pular conteúdo; animações sem respeito a `prefers-reduced-motion`.
- Texto alternativo genérico ("Minha Foto de Perfil").

## Otimização de imagens

| Arquivo | Antes | Depois |
|---|---|---|
| `logo_Helio_Solucoes.png` | 216 KB | 10 KB WebP, 160 px |
| `logoconstrutorapeixe.png` | 93 KB | 6 KB WebP |
| `logohabileads.png` | 54 KB | 5 KB WebP |
| `cramer_logo.webp` | 29 KB (não usado) | 4 KB WebP |
| Screenshots dos projetos | — | WebP 1200 e 640 px, 9–68 KB cada (também usados como texturas da cena 3D) |
