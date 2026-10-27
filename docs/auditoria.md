# Auditoria do portfólio — outubro de 2026 (redesign)

Registro do que foi analisado antes do redesign, das decisões tomadas e do que ainda depende do Samuel.

## Como os dados foram coletados

A rede do ambiente de trabalho não alcança `github.io` nem domínios externos, então os sites publicados não puderam ser abertos diretamente. Os repositórios foram lidos pelo git (`git ls-remote` e clones rasos), e os screenshots novos foram gerados com Chromium a partir dos clones. As URLs de demonstração vêm do próprio portfólio anterior e do README do perfil (`Sah123campos/Sah123campos`, atualizado em 20/10/2026).

## Projetos e links

| Projeto | Repositório | Demonstração | Situação |
|---|---|---|---|
| O Sistema Solar | `sistema-solar` | sah123campos.github.io/sistema-solar | Mantido |
| Núcleo Meridiano | `Loja-de-gamers` | sah123campos.github.io/Loja-de-gamers | Mantido |
| Aura Motors | `AuraMotors` | sah123campos.github.io/auramotors | Link do código corrigido (antes apontava para github.com genérico); demo conforme o README do perfil |
| Habileads | `habileads` | habileads.com.br | Mantido |
| Hélio Soluções Engenharia | `engrenagem_3` | sah123campos.github.io/engrenagem_3 | Nenhum domínio próprio foi encontrado no código nem em busca; mantida a versão no GitHub Pages |
| Calculadora do Método de Cramer | `cramer` | sah123campos.github.io/cramer | Apresentação refeita com base no README atual (site 3D + laboratório) e screenshot novo |
| Faísca | `faisca` | sah123campos.github.io/faisca | Adicionado (está no README do perfil) |
| O Mistério dos Sinais | `misterio-dos-sinais` | sah123campos.github.io/misterio-dos-sinais | Adicionado (está no README do perfil) |
| Gestão de Pedidos | `ecommerce-pedidos-alfa` | — | Adicionado: único projeto Java público, mostra modelagem e testes |

Um projeto institucional anterior foi retirado do portfólio a pedido do Samuel: cartão, dados, imagens, logo, link de fallback e menção na linha do tempo.

## O que a Calculadora de Cramer faz de fato

Conferido no código (`js/lab/tools/sistema.js`, `js/core/fraction.js`) e no README:

- sistemas 2×2, 3×3 e 4×4 com frações exatas (BigInt);
- determinante por Sarrus (3×3) e cofatores (4×4), com a coluna trocada por b destacada;
- classificação por posto quando det A = 0 (impossível ou indeterminado);
- retas (2×2) e planos 3D (3×3), passo a passo ao vivo;
- laboratório com matrizes, cônicas e funções; links compartilháveis; tema claro/escuro; testes com `node --test`.

O portfólio tem uma demonstração 3×3 própria (`js/lib/cramer-math.js`, com testes em `tests/`), apresentada como versão compacta, não como o site completo.

## Decisões de honestidade de conteúdo

- Nada de níveis de proficiência, anos de experiência, números de visitantes ou clientes.
- A stack separa três estados: **em projetos publicados** (com onde aparece), **em uso, sem projeto público** e **estudando agora**. Os estados estão em `js/data.js` e devem ser revistos pelo Samuel.
- Na seção de engenharia, cada tema diz se está nos projetos, em desenvolvimento ou em estudo. O diagrama de classes é o do repositório `ecommerce-pedidos-alfa`.
- "Gerenciador de Tarefas" e "API RESTful com JWT" aparecem só em "Na bancada", como em andamento/planejado.
- A seção de processo diz que ele é o processo atual e que nem todo projeto antigo passou por todas as etapas.

## Pendências para o Samuel

- Abrir cada link de demonstração no navegador e confirmar que estão no ar, principalmente `sah123campos.github.io/auramotors/` (o portfólio anterior dizia que o Aura Motors não tinha Pages; o README do perfil, mais recente, diz que tem).
- Se a Hélio Soluções tiver domínio próprio, trocar o campo `demo` em `js/data.js`.
- Revisar os estados da stack em `js/data.js` (por exemplo, se MySQL, PostgreSQL e MongoDB já aparecem em algum projeto público).
- Conferir se o LinkedIn e o Instagram continuam com os mesmos endereços (não foi possível abrir essas páginas daqui).

## Diagnóstico técnico do site anterior

- O anel de projetos ocupava ~7 telas de rolagem presa (sticky) para mostrar 7 projetos; o novo layout usa uma galeria editorial que rola normalmente.
- Não havia descarte de recursos WebGL nem tratamento de perda de contexto; agora há `destroy()` e `webglcontextlost`.
