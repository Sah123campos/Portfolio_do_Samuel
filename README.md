# Portfólio — Samuel Santana

Site pessoal de Samuel Santana, desenvolvedor full-stack com foco em back-end Java e Spring Boot.

Publicado em: https://sah123campos.github.io/Portfolio_do_Samuel/

## Como funciona

O site é uma **experiência 3D guiada pela rolagem** (*scroll storytelling*), no mesmo estilo dos projetos O Sistema Solar, Núcleo Meridiano e Aura Motors:

- **Three.js (WebGL)** desenha a cena: um núcleo de 7 mil partículas no centro, as telas dos projetos num anel ao redor e um campo de estrelas.
- **GSAP + ScrollTrigger** transformam a posição da rolagem em parâmetros da câmera: ela sai do núcleo, entra na órbita, para em cada tela e no fim sobe para mostrar o anel de cima.
- **Lenis** deixa a rolagem suave.
- **UnrealBloomPass** dá o brilho neon nas molduras e no núcleo.

A câmera não é animada por linha do tempo fixa. A cada quadro ela lê o estado da rolagem e o persegue com amortecimento, girando pelo arco da órbita (nunca cortando por dentro do anel).

Sem HTML, CSS e JavaScript de framework, sem build. As bibliotecas vêm de CDN; as fontes (Bricolage Grotesque e IBM Plex Sans, licença OFL) são servidas pelo próprio site.

### Versão sem 3D

Todo o conteúdo existe em HTML. A cena só liga quando há WebGL e as bibliotecas carregaram; caso contrário, a página mostra a lista de projetos com screenshots, completa e acessível.

Quem ativa "menos movimento" no sistema (`prefers-reduced-motion`) continua vendo a cena 3D, mas sem rolagem com inércia nem animações de entrada automáticas.

## Estrutura

```text
index.html
assets/
  fonts/            fontes woff2 (subconjunto latino)
  images/
    logos/          logos dos clientes, em WebP
    projects/       screenshots 1440×900 em WebP (1200 e 640 px) — viram texturas na cena
    favicon.svg
    og.jpg          imagem de compartilhamento (1200×630)
css/
  reset.css  fonts.css  variables.css  layout.css  components.css
js/
  projects.js       dados dos projetos (ordem = ordem da órbita)
  scene.js          cena Three.js: núcleo, telas, estrelas, câmera, bloom
  main.js           conteúdo, rolagem, trilho de paradas, cursor e modo estático
docs/
  auditoria.md      inventário de repositórios e diagnóstico do site anterior
```

## Rodar localmente

O JavaScript usa módulos ES, então abra por um servidor:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Adicionar um projeto

1. Tire um screenshot da página inicial em 1440×900 e salve em WebP como `assets/images/projects/<id>-1200.webp` e `<id>-640.webp`.
2. (Opcional) salve o logo em `assets/images/logos/<id>.webp`.
3. Acrescente um objeto em `js/projects.js`. O campo `tint` é a cor da moldura neon da tela.

O anel se redistribui sozinho para qualquer número de projetos, e a altura da seção acompanha.

## Ajustes rápidos

| O quê | Onde |
|---|---|
| Velocidade da câmera | `const k = 1 - Math.exp(-dt * 4.5)` em `js/scene.js` (maior = mais rápida) |
| Quanto a câmera "pausa" em cada tela | `smooth(0.3, 0.7, …)` em `js/main.js` (intervalo menor = pausa mais longa) |
| Intensidade do brilho | `new UnrealBloomPass(…, 0.75, 0.45, 0.86)` — força, raio, limiar |
| Partículas do núcleo | `createCore(mobile ? 3200 : 7000)` |
| Altura da rolagem da órbita | `.is-3d .orbit { height: calc(var(--n) * 90svh) }` em `css/layout.css` |

## Publicação no GitHub Pages

Em *Settings → Pages*, selecione *Deploy from a branch*, branch `main`, pasta `/ (root)`. O arquivo `.nojekyll` evita o processamento pelo Jekyll.
