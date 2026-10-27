# Portfólio — Samuel Santana

Site pessoal de Samuel Santana, desenvolvedor full-stack com foco em Java, Spring Boot e experiências web interativas.

Publicado em: https://sah123campos.github.io/Portfolio_do_Samuel/

## Conceito

Um laboratório digital no espaço. Um núcleo de partículas em WebGL acompanha a página inteira e muda de forma a cada capítulo:

| Capítulo | Forma do núcleo |
|---|---|
| Início | esfera de energia (reage ao cursor) |
| Projetos | planeta com anéis |
| Tecnologias e Engenharia | rede cristalina |
| Trajetória | dupla hélice |
| Processo | órbitas |
| Contato | núcleo luminoso que pulsa |

Em volta, órbitas com pequenas luas e três camadas de estrelas com paralaxe de profundidade. A rolagem nunca é presa: as transições acontecem enquanto o visitante lê.

## Seções

1. **Início** — nome, chamada, quatro botões e entrada animada (tipografia com máscara + montagem das partículas + aproximação da câmera).
2. **Projetos** — galeria editorial assimétrica. Cada projeto tem categoria, descrição, o que foi desenvolvido, tecnologias, demonstração e código, além de um efeito próprio ao passar o mouse. No celular tudo fica visível sem hover.
3. **Calculadora do Método de Cramer** — bloco especial com uma demonstração 3×3 que roda na página: matriz, determinante por Sarrus, colunas trocadas por b, resultado em frações exatas e diagnóstico quando det A = 0.
4. **Tecnologias** — constelação de órbitas por camada. Cada tecnologia mostra para que serve, onde aparece e em que estado está (em projetos publicados, em uso sem projeto público ou estudando).
5. **Engenharia por trás da interface** — fluxo animado de uma requisição (interface → segurança → controller → domínio → repositório → banco), temas com estado honesto e o diagrama de classes real do projeto Gestão de Pedidos.
6. **Trajetória** — linha do tempo que se desenha com a rolagem.
7. **Processo** — seis etapas com ícones animados.
8. **Contato** — e-mail com botão de copiar, WhatsApp, LinkedIn, GitHub e Instagram.

## Tecnologia

HTML, CSS e JavaScript (módulos ES), sem framework e sem etapa de build. As bibliotecas vêm de CDN com versão fixa:

- **Three.js 0.160** — cena 3D, shaders GLSL e pós-processamento (bloom só em telas grandes);
- **GSAP 3.12.5 + ScrollTrigger** — coreografia das seções;
- **Lenis 1.1.13** — rolagem suave, sincronizada com o ScrollTrigger.

As fontes (Bricolage Grotesque, IBM Plex Sans e IBM Plex Mono, licença OFL) são servidas pelo próprio site.

### Desempenho e robustez

- O Three.js só é baixado depois que o conteúdo já está na tela (import dinâmico).
- Celular: menos partículas (3,6 mil em vez de 9 mil), sem bloom, resolução limitada.
- Qualidade adaptativa: se os primeiros segundos ficarem lentos, a cena reduz partículas e desliga o bloom.
- A animação pausa com a aba escondida; geometrias, materiais e texturas são descartados ao sair (`destroy()`); perda de contexto WebGL volta para a versão sem 3D.
- Imagens em WebP (640 e 1200 px) com `srcset` e `loading="lazy"`.

### Sem 3D, sem animação

- Sem WebGL (ou com economia de dados ativa): um planeta em CSS substitui a cena e todo o conteúdo continua igual.
- Se as bibliotecas de animação não carregarem, o conteúdo aparece direto.
- Com **menos movimento** (`prefers-reduced-motion`) não há rolagem com inércia, entradas animadas nem movimento contínuo; só os indicadores de progresso.

### Acessibilidade

HTML semântico com um único `h1`, link para pular conteúdo, foco visível, menu móvel com `aria-expanded`, foco preso e fechamento por Esc, alvos de toque de 44 px ou mais, textos alternativos e anúncios em `aria-live` (cópia do e-mail e resultado da calculadora). Auditado com axe-core sem violações.

## Estrutura

```text
index.html
assets/
  fonts/              fontes woff2 (subconjunto latino)
  images/
    projects/         screenshots 1440×900 em WebP (1200 e 640 px)
    logos/            logos (não usados na página atual, mantidos para referência)
    favicon.svg  apple-touch-icon.png  og.jpg (1200×630)
css/
  reset.css  fonts.css  variables.css (tokens)  layout.css  components.css  sections.css
js/
  main.js             ponto de entrada: monta o conteúdo e liga animação e 3D
  data.js             projetos, "na bancada" e tecnologias (edite aqui)
  scene.js            cena Three.js (núcleo que muda de forma, órbitas, estrelas)
  motion.js           coreografia com GSAP + ScrollTrigger + Lenis
  lib/cramer-math.js  matemática exata da demonstração de Cramer
  ui/                 render.js (galeria), stack.js, cramer.js, nav.js, pointer.js
tests/
  cramer-math.test.mjs
docs/
  auditoria.md        o que foi verificado e o que ainda depende de conferência
```

## Rodar localmente

Os scripts são módulos ES, então abra por um servidor (não direto do disco):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Testes da matemática da calculadora (Node 18 ou mais novo, sem dependências):

```bash
node --test tests/*.test.mjs
```

## Publicar no GitHub Pages

1. Faça o merge na branch `main` (ou envie os arquivos para ela).
2. Em *Settings → Pages*, use *Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. Em um ou dois minutos o site atualiza em https://sah123campos.github.io/Portfolio_do_Samuel/.

O arquivo `.nojekyll` evita o processamento pelo Jekyll. Todos os caminhos são relativos, então o site funciona no subcaminho `/Portfolio_do_Samuel/`.

## Adicionar um projeto

1. Tire um screenshot da página inicial em 1440×900 e salve em WebP como `assets/images/projects/<id>-1200.webp` e `<id>-640.webp`.
2. Acrescente um objeto em `projects`, em `js/data.js`:
   - `layout: "feature"` para um destaque grande ou `"grid"` para a grade;
   - `fx` escolhe o efeito de hover (`orbit`, `neon`, `sweep`, `zoom`, `blueprint`, `splash`, `pixel`, `code`);
   - `demo` ou `repo` podem ser `null`; o cartão se ajusta.
3. Para algo ainda em construção, use a lista `inProgress` (aparece em "Na bancada", sem parecer pronto).

A numeração, a galeria e a linha que liga os destaques se ajustam sozinhas.

## Ajustes rápidos

| O quê | Onde |
|---|---|
| Forma, cor, posição e brilho do núcleo por capítulo | `KEYS` no topo de `js/scene.js` |
| Número de partículas | `let count = mobile ? 3600 : 9000` em `js/scene.js` |
| Intensidade do bloom | `new UnrealBloomPass(…, 0.85, 0.5, 0.78)` e `bloom.strength` no fim de `frame()` |
| Estado de cada tecnologia | campo `status` em `stack`, `js/data.js` |
| Posição das órbitas da stack | `LAYOUT` em `js/ui/stack.js` |
| Cores e tipografia | `css/variables.css` |
