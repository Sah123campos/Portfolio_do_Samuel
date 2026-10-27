/*
 * Ponte entre a galeria de projetos (js/motion.js) e a cena 3D (js/scene.js).
 * A galeria escreve aqui; a cena lê a cada quadro e move câmera, estrelas e
 * planeta junto com os cards, cada camada numa velocidade.
 *   t:  posição na galeria, em projetos (0 = primeiro, 1 = segundo...)
 *   on: 1 enquanto a galeria está na tela, 0 fora dela
 *   n:  quantidade de projetos
 */
export const travel = { t: 0, on: 0, n: 1 };
