/*
 * Cena 3D do portfólio — Three.js r160
 *
 * Um núcleo de partículas que muda de forma a cada capítulo da página:
 *   esfera (início) → anéis planetários (projetos) → rede cristalina
 *   (tecnologias e engenharia) → dupla hélice (trajetória) → órbitas
 *   (processo) → núcleo de energia (contato).
 * Em volta, órbitas com pequenas luas e três camadas de estrelas com
 * paralaxe de profundidade. A câmera não tem animação própria: a cada quadro
 * ela persegue o estado vindo da rolagem e do ponteiro, com amortecimento.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const BG = 0x05060d;
const FOV = 38;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/*
 * Um quadro-chave por capítulo. shape: [anéis, rede, hélice] (o resto é esfera).
 * pos/posN: posição do núcleo em telas largas / estreitas.
 */
const KEYS = [
  { pos: [3.1, 0.15, 0], posN: [0, 2.2, -2], scale: 1, shape: [0, 0, 0], a: "#8b7bff", b: "#58a6ff", opacity: 1, rings: 1, energy: 0.15, spin: 1 },
  { pos: [6.2, -0.6, -9], posN: [0.6, 3.2, -9], scale: 1.35, shape: [1, 0, 0], a: "#a08dff", b: "#6f7dff", opacity: 0.34, rings: 0.45, energy: 0, spin: 0.6 },
  { pos: [-7.2, -2.2, -10], posN: [0, 3, -9], scale: 1, shape: [0, 1, 0], a: "#62b8ff", b: "#7fe3ff", opacity: 0.3, rings: 0.2, energy: 0, spin: 0.5 },
  { pos: [6.6, -0.6, -9], posN: [0, 3, -9], scale: 1.05, shape: [0, 1, 0], a: "#4f8dff", b: "#9d8cff", opacity: 0.38, rings: 0.2, energy: 0, spin: 0.45 },
  { pos: [-6.4, -0.3, -8], posN: [0, 3, -9], scale: 1.05, shape: [0, 0, 1], a: "#b48cff", b: "#5aa9ff", opacity: 0.5, rings: 0.25, energy: 0, spin: 0.7 },
  { pos: [6.6, -0.5, -9], posN: [0, 3, -9], scale: 1.1, shape: [1, 0, 0], a: "#7f8bff", b: "#7fe3ff", opacity: 0.42, rings: 0.6, energy: 0, spin: 0.6 },
  { pos: [0, 0.35, -1.2], posN: [0, 0.6, -3], scale: 1.15, shape: [0, 0, 0], a: "#a497ff", b: "#8ff0ff", opacity: 1, rings: 1, energy: 1, spin: 1.3 },
];

function softDot() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Formas do núcleo ---------- */
function buildShapes(count) {
  const sphere = new Float32Array(count * 3);
  const rings = new Float32Array(count * 3);
  const lattice = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const R = 2.3;
  const tilt = 0.42;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const G = 4; // nós da rede por eixo - 1
  const gs = 1.7;

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    rand[i] = r;

    // Esfera: distribuição de Fibonacci (uniforme, sem aglomerar nos polos)
    const y = 1 - (i / (count - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = golden * i;
    sphere.set([Math.cos(th) * rr * R, y * R, Math.sin(th) * rr * R], i * 3);

    // Anéis: um planeta pequeno + três faixas, inclinados
    let px, py, pz;
    if (i % 4 === 0) {
      const s = 0.95;
      px = Math.cos(th) * rr * s; py = y * s; pz = Math.sin(th) * rr * s;
    } else {
      const band = [1.6, 2.35, 3.2][i % 3];
      const rad = band + (Math.random() - 0.5) * (i % 3 === 2 ? 0.55 : 0.32);
      const a = Math.random() * Math.PI * 2;
      const lx = Math.cos(a) * rad;
      const lz = Math.sin(a) * rad;
      const ly = (Math.random() - 0.5) * 0.05;
      px = lx; py = ly * ct - lz * st; pz = ly * st + lz * ct;
    }
    rings.set([px, py, pz], i * 3);

    // Rede cristalina: pontos sobre as arestas de uma grade 3D
    const axis = i % 3;
    const u = (Math.floor(Math.random() * (G + 1)) / G - 0.5) * 2 * gs;
    const v = (Math.floor(Math.random() * (G + 1)) / G - 0.5) * 2 * gs;
    const w = (Math.random() - 0.5) * 2 * gs;
    lattice.set(axis === 0 ? [w, u, v] : axis === 1 ? [u, w, v] : [u, v, w], i * 3);

    // Dupla hélice com degraus
    const t = Math.random();
    const ang = t * Math.PI * 2 * 2.6;
    const hy = (t - 0.5) * 6.2;
    const hr = 1.15;
    if (i % 5 === 0) {
      const k = Math.random();
      const s = Math.floor(t * 26) / 26;
      const aa = s * Math.PI * 2 * 2.6;
      const yy = (s - 0.5) * 6.2;
      helix.set([lerp(Math.cos(aa) * hr, Math.cos(aa + Math.PI) * hr, k), yy, lerp(Math.sin(aa) * hr, Math.sin(aa + Math.PI) * hr, k)], i * 3);
    } else {
      const o = i % 2 ? Math.PI : 0;
      const jitter = 0.08;
      helix.set([Math.cos(ang + o) * hr + (Math.random() - 0.5) * jitter, hy, Math.sin(ang + o) * hr + (Math.random() - 0.5) * jitter], i * 3);
    }

    // Nuvem inicial espalhada (de onde as partículas se montam)
    const s2 = 7 + Math.random() * 16;
    const uu = Math.random() * Math.PI * 2;
    const vv = Math.acos(2 * Math.random() - 1);
    scatter.set([s2 * Math.sin(vv) * Math.cos(uu), s2 * Math.cos(vv), s2 * Math.sin(vv) * Math.sin(uu)], i * 3);
  }
  return { sphere, rings, lattice, helix, scatter, rand };
}

function createCore(count) {
  const s = buildShapes(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(s.sphere, 3));
  geo.setAttribute("aRings", new THREE.BufferAttribute(s.rings, 3));
  geo.setAttribute("aLattice", new THREE.BufferAttribute(s.lattice, 3));
  geo.setAttribute("aHelix", new THREE.BufferAttribute(s.helix, 3));
  geo.setAttribute("aScatter", new THREE.BufferAttribute(s.scatter, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(s.rand, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uShape: { value: new THREE.Vector3() },
      uSize: { value: 62 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uEnergy: { value: 0 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uMouse: { value: new THREE.Vector3(0, 0, 99) },
      uMouseForce: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aRings, aLattice, aHelix, aScatter;
      attribute float aRand;
      uniform float uTime, uAssemble, uSize, uPixelRatio, uMouseForce, uEnergy;
      uniform vec3 uShape, uMouse, uColorA, uColorB;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float wS = clamp(1.0 - uShape.x - uShape.y - uShape.z, 0.0, 1.0);
        vec3 base = position * wS + aRings * uShape.x + aLattice * uShape.y + aHelix * uShape.z;

        // Respiração orgânica: ruído barato em senos, mais forte com energia
        float n = sin(base.x * 3.1 + uTime * 0.7) * sin(base.y * 2.7 + uTime * 0.9) * sin(base.z * 3.3 + uTime * 0.5);
        vec3 dir = normalize(base + 1e-4);
        base += dir * n * (0.12 + uEnergy * 0.28) * (0.4 + wS * 0.6);
        base += dir * sin(uTime * 2.2 + aRand * 6.2831) * 0.05 * uEnergy;

        // Montagem inicial: cada ponto chega num tempo diferente
        float a = smoothstep(aRand * 0.45, 0.55 + aRand * 0.45, uAssemble);
        vec3 p = mix(aScatter, base, a);

        // Repulsão do cursor
        float md = distance(p, uMouse);
        float fall = 1.0 - smoothstep(0.0, 1.7 + aRand * 0.5, md);
        float push = fall * fall * uMouseForce;
        vec3 away = normalize(p - uMouse + 1e-4);
        vec3 swirl = normalize(cross(dir, vec3(0.0, 1.0, 0.0)) + 1e-4);
        p += (away * 1.3 + dir * 1.0 + swirl * (aRand - 0.5) * 1.2) * push * (1.0 + aRand * 2.0);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uPixelRatio * (0.45 + aRand * 0.8) * (1.0 + push * 0.6 + uEnergy * 0.25) / -mv.z;
        gl_Position = projectionMatrix * mv;

        vColor = mix(uColorA, uColorB, smoothstep(-2.0, 2.0, base.y + n * 2.0));
        vColor = mix(vColor, vec3(0.9, 0.95, 1.0), push * 0.5 + uEnergy * 0.15 * aRand);
        vAlpha = (0.4 + 0.6 * aRand) * (0.3 + 0.7 * a);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor * 1.4, a * vAlpha * uOpacity * 0.85);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- Estrelas em camadas (paralaxe) ---------- */
function createStarLayer(count, depth, size, dot) {
  const pos = new Float32Array(count * 3);
  const tw = new Float32Array(count);
  const range = depth * 1.6 + 20;
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - 0.5) * depth * 2.2, (Math.random() - 0.5) * range, -depth * (0.6 + Math.random() * 0.8)], i * 3);
    tw[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aTw", new THREE.BufferAttribute(tw, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 500);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOffset: { value: 0 },
      uOffsetX: { value: 0 },
      uWidth: { value: depth * 2.2 },
      uRange: { value: range },
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uMap: { value: dot },
      uTint: { value: new THREE.Color(0xa9b8ff) },
    },
    vertexShader: /* glsl */ `
      attribute float aTw;
      uniform float uOffset, uOffsetX, uWidth, uRange, uTime, uSize, uPixelRatio;
      varying float vA;
      void main() {
        vec3 p = position;
        // Rolagem infinita: as estrelas voltam por baixo quando saem por cima
        p.y = mod(p.y + uOffset + uRange * 0.5, uRange) - uRange * 0.5;
        // Na galeria de projetos elas também correm de lado (viagem na diagonal)
        p.x = mod(p.x + uOffsetX + uWidth * 0.5, uWidth) - uWidth * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uPixelRatio * (0.5 + aTw) * 60.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
        vA = 0.45 + 0.55 * sin(uTime * (0.6 + aTw * 1.8) + aTw * 40.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uTint;
      varying float vA;
      void main() {
        vec4 t = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(uTint, t.a * vA * 0.8);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- Órbitas com luas ---------- */
function createOrbits(dot) {
  const group = new THREE.Group();
  const specs = [
    { r: 3.4, tilt: [1.2, 0, 0.35], color: 0x9d8cff, speed: 0.35, moon: 0.09 },
    { r: 4.3, tilt: [1.45, 0, -0.5], color: 0x5aa9ff, speed: -0.22, moon: 0.07 },
    { r: 5.4, tilt: [1.05, 0.4, 0.1], color: 0x7fe3ff, speed: 0.14, moon: 0.06 },
  ];
  const items = specs.map((s) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * s.r, 0, Math.sin(a) * s.r));
    }
    const pivot = new THREE.Group();
    pivot.rotation.set(...s.tilt);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: s.color, transparent: true, opacity: 0.3, depthWrite: false })
    );
    pivot.add(line);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(s.moon, 16, 12),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(2.2), transparent: true })
    );
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: s.color, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(s.moon * 9);
    moon.add(halo);
    pivot.add(moon);
    group.add(pivot);
    return { ...s, pivot, line, moon, halo, phase: Math.random() * Math.PI * 2 };
  });
  return { group, items };
}

/* ---------- Cena ---------- */
export function createScene(canvas, { mobile = false, reducedMotion = false, onContextLost, travel = null } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  // Fundo pela cena (com gestão de cor), não só pela cor de limpeza: no
  // pós-processamento a cor de limpeza não é convertida e o preto vira cinza
  scene.background = new THREE.Color(BG);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
  camera.position.set(0, 0, 22);

  const dot = softDot();
  const disposables = [dot];

  const stars = [
    createStarLayer(mobile ? 500 : 1100, 90, 0.35, dot),
    createStarLayer(mobile ? 220 : 480, 45, 0.45, dot),
    createStarLayer(mobile ? 60 : 130, 20, 0.6, dot),
  ];
  stars.forEach((s) => scene.add(s));

  const rig = new THREE.Group();
  scene.add(rig);

  let count = mobile ? 3600 : 9000;
  const core = createCore(count);
  rig.add(core);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0x8b7bff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.setScalar(9);
  rig.add(glow);

  const orbits = createOrbits(dot);
  rig.add(orbits.group);

  /* Brilho (bloom) só em telas grandes: no celular o custo não compensa */
  let composer = null;
  let bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.5, 0.78);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* Estado vindo da página (escrito por main.js) */
  const state = { chapter: 0, scroll: 0, px: 0, py: 0, pointerActive: false, assemble: 0, intro: 0 };

  let width = 1;
  let height = 1;
  let narrow = false;
  let pixelRatio = 1;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    narrow = width < 900;
    pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75) * quality;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    if (composer) {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
      bloom.resolution.set(width * 0.5, height * 0.5);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    core.material.uniforms.uPixelRatio.value = pixelRatio;
    stars.forEach((s) => { s.material.uniforms.uPixelRatio.value = pixelRatio; });
  }

  /* Valores atuais (amortecidos) */
  const cur = { chapter: 0, scroll: 0, px: 0, py: 0, intro: state.intro, travel: 0, on: 0, vel: 0 };
  const colA = new THREE.Color();
  const colB = new THREE.Color();
  const tmpA = new THREE.Color();
  const tmpB = new THREE.Color();
  const keyColors = KEYS.map((k) => [new THREE.Color(k.a), new THREE.Color(k.b)]);

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitSphere = new THREE.Sphere();
  const center = new THREE.Vector3();
  const hit = new THREE.Vector3();
  const local = new THREE.Vector3();
  const mouseLocal = new THREE.Vector3(0, 0, 99);
  let mouseForce = 0;

  const clock = new THREE.Clock();
  let time = 0;
  let running = true;
  let raf = 0;

  /* Qualidade adaptativa: se os primeiros segundos ficarem lentos, alivia */
  let quality = 1;
  let perfFrames = 0;
  let perfTime = 0;
  let perfChecked = false;

  function adapt(dt) {
    if (perfChecked) return;
    if (time < 1.2) return;
    perfFrames++;
    perfTime += dt;
    if (perfFrames < 90) return;
    perfChecked = true;
    const avg = perfTime / perfFrames;
    if (avg > 1 / 40) {
      quality = 0.75;
      if (composer) { composer.dispose(); composer = null; bloom = null; }
      core.geometry.setDrawRange(0, Math.floor(count * 0.6));
      resize();
    }
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const dtRaw = Math.min(clock.getDelta(), 0.05);
    // Com "menos movimento" a cena segue viva, só que mais lenta
    const dt = reducedMotion ? dtRaw * 0.45 : dtRaw;
    time += dt;
    adapt(dtRaw);

    const k = 1 - Math.exp(-dtRaw * 3.2);
    cur.chapter += (state.chapter - cur.chapter) * k;
    cur.scroll += (state.scroll - cur.scroll) * k;
    cur.px += (state.px - cur.px) * k * 0.7;
    cur.py += (state.py - cur.py) * k * 0.7;
    cur.intro += (state.intro - cur.intro) * (1 - Math.exp(-dtRaw * 1.6));

    // Viagem pela galeria de projetos: posição amortecida e velocidade
    const tv = travel || { t: 0, on: 0, n: 1 };
    const prevT = cur.travel;
    cur.travel += (tv.t - cur.travel) * (1 - Math.exp(-dtRaw * 4.5));
    cur.on += (tv.on - cur.on) * (1 - Math.exp(-dtRaw * 2.4));
    const v = (cur.travel - prevT) / Math.max(dtRaw, 1e-3);
    cur.vel += (v - cur.vel) * (1 - Math.exp(-dtRaw * 5));
    const T = cur.travel * cur.on;
    const span = Math.max(1, tv.n - 1);

    // Interpola entre os dois quadros-chave vizinhos
    const c = Math.min(Math.max(cur.chapter, 0), KEYS.length - 1);
    const i0 = Math.floor(c);
    const i1 = Math.min(i0 + 1, KEYS.length - 1);
    const f = smooth(c - i0);
    const A = KEYS[i0];
    const B = KEYS[i1];
    const P = narrow ? "posN" : "pos";

    rig.position.set(lerp(A[P][0], B[P][0], f), lerp(A[P][1], B[P][1], f), lerp(A[P][2], B[P][2], f));
    // Plano do meio: o planeta atravessa a galeria devagar, na mesma diagonal dos cards
    const g = T / span;
    rig.position.x += -g * (narrow ? 1.6 : 4.2) * cur.on;
    rig.position.y += g * (narrow ? 0.8 : 1.8) * cur.on;
    rig.scale.setScalar(lerp(A.scale, B.scale, f) * (narrow ? 0.82 : 1));

    const u = core.material.uniforms;
    u.uShape.value.set(lerp(A.shape[0], B.shape[0], f), lerp(A.shape[1], B.shape[1], f), lerp(A.shape[2], B.shape[2], f));
    colA.copy(tmpA.copy(keyColors[i0][0]).lerp(keyColors[i1][0], f));
    colB.copy(tmpB.copy(keyColors[i0][1]).lerp(keyColors[i1][1], f));
    u.uColorA.value.copy(colA);
    u.uColorB.value.copy(colB);
    const energy = lerp(A.energy, B.energy, f);
    u.uEnergy.value = energy;
    u.uOpacity.value = lerp(A.opacity, B.opacity, f) * (narrow && c > 0.5 && c < 5.5 ? 0.7 : 1);
    u.uTime.value = time;
    u.uAssemble.value = state.assemble;

    const spin = lerp(A.spin, B.spin, f);
    core.rotation.y += dt * 0.08 * spin + (cur.travel - prevT) * 0.35 * cur.on;
    core.rotation.x = Math.sin(time * 0.1) * 0.12 + cur.py * 0.1;
    core.rotation.z = cur.px * -0.06;

    glow.material.color.copy(colA);
    glow.material.opacity = (0.08 + energy * 0.12) * (0.85 + 0.15 * Math.sin(time * 1.4)) * u.uOpacity.value;
    glow.scale.setScalar(8 + energy * 3);

    const ringsVis = lerp(A.rings, B.rings, f) * state.assemble;
    orbits.items.forEach((o, n) => {
      const ang = o.phase + time * o.speed * (1 + energy * 0.8);
      o.moon.position.set(Math.cos(ang) * o.r, 0, Math.sin(ang) * o.r);
      o.line.material.opacity = 0.32 * ringsVis;
      o.moon.material.opacity = ringsVis;
      o.halo.material.opacity = 0.7 * ringsVis;
      o.pivot.rotation.y = time * 0.02 * (n + 1);
    });

    // Estrelas: cada camada sobe numa velocidade (profundidade)
    stars.forEach((s, n) => {
      // fundo: cada camada de estrelas corre numa velocidade (as próximas mais rápido)
      s.material.uniforms.uOffset.value = cur.scroll * [1.2, 2.6, 5.5][n] + cur.travel * [0.5, 1.2, 2.6][n];
      s.material.uniforms.uOffsetX.value = -cur.travel * [0.9, 2.1, 4.6][n];
      s.material.uniforms.uTime.value = time;
    });

    // Câmera: entrada (aproximação) + paralaxe do ponteiro
    const intro = smooth(clamp01(cur.intro));
    // Na galeria: a câmera recua no meio de cada troca e avança ao chegar,
    // se inclina para o lado do movimento e "derrapa" um pouco na curva
    const frac = T - Math.floor(T);
    const vel = Math.max(-3, Math.min(3, cur.vel)) * cur.on;
    const dolly = Math.sin(Math.PI * frac) * (narrow ? 1.6 : 2.6) * cur.on;
    const lean = vel * 0.35;
    camera.position.set(cur.px * 0.6 + lean, -cur.py * 0.35 + (1 - intro) * 1.5 - lean * 0.6, lerp(22, narrow ? 15 : 13, intro) + dolly);
    camera.lookAt(cur.px * 0.15 + lean * 0.4, (1 - intro) * 0.8 - lean * 0.25, 0);
    camera.rotation.z += (1 - intro) * 0.06 - vel * 0.035;

    // Cursor sobre o núcleo (só quando ele é esfera e está em destaque)
    let targetForce = 0;
    const sphereWeight = 1 - Math.min(1, u.uShape.value.x + u.uShape.value.y + u.uShape.value.z);
    if (state.pointerActive && sphereWeight > 0.5) {
      ndc.set(state.px, -state.py);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      core.updateMatrixWorld();
      hitSphere.set(core.getWorldPosition(center), 2.6 * rig.scale.x);
      if (raycaster.ray.intersectSphere(hitSphere, hit)) {
        core.worldToLocal(local.copy(hit));
        if (mouseLocal.z > 50) mouseLocal.copy(local);
        mouseLocal.lerp(local, 1 - Math.exp(-dtRaw * 14));
        targetForce = sphereWeight;
      }
    }
    mouseForce += (targetForce - mouseForce) * (1 - Math.exp(-dtRaw * (targetForce > mouseForce ? 7 : 2.2)));
    u.uMouse.value.copy(mouseLocal);
    u.uMouseForce.value = mouseForce;

    if (bloom) bloom.strength = 0.7 + energy * 0.5;
    if (composer) composer.render(dtRaw);
    else renderer.render(scene, camera);
  }

  resize();
  frame();

  const onVisibility = () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  };
  const onLost = (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    onContextLost?.();
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", resize);
  canvas.addEventListener("webglcontextlost", onLost);

  return {
    state,
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      disposables.forEach((d) => d.dispose());
      composer?.dispose();
      renderer.dispose();
    },
  };
}

/* Teste rápido de suporte a WebGL antes de carregar a cena */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
