/*
 * Cena 3D do portfólio — Three.js r160
 *
 * Um núcleo de partículas no centro, as telas dos projetos em um anel ao
 * redor e um campo de estrelas ao fundo. A câmera não tem animação própria:
 * a cada quadro ela segue o estado vindo da rolagem (hero → órbita → saída),
 * com amortecimento para dar a sensação de câmera física.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const RING_RADIUS = 7;
const SCREEN_W = 3.6;
const SCREEN_H = 2.25;
const FOV = 40;
const BG = 0x050a14;
const SPRING = new THREE.Color(0x8bd45a);
const GLOW = new THREE.Color(0x5ea8ff);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function softDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Núcleo de partículas ---------- */
function createCore(count) {
  const pos = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    // Distribuição de Fibonacci na esfera: pontos uniformes, sem aglomerar nos polos
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pos.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);

    const s = 6 + Math.random() * 14;
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    scatter.set([s * Math.sin(v) * Math.cos(u), s * Math.cos(v), s * Math.sin(v) * Math.sin(u)], i * 3);
    rand[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uRadius: { value: 2.4 },
      uSize: { value: 70 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uColorA: { value: SPRING.clone() },
      uColorB: { value: GLOW.clone() },
      uMouse: { value: new THREE.Vector3(0, 0, 99) },
      uMouseForce: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aScatter;
      attribute float aRand;
      uniform float uTime, uAssemble, uRadius, uSize, uPixelRatio, uMouseForce;
      uniform vec3 uMouse;
      varying float vPush;
      uniform vec3 uColorA, uColorB;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float n = sin(position.x * 4.0 + uTime * 0.7)
                * sin(position.y * 4.0 + uTime * 0.9)
                * sin(position.z * 4.0 + uTime * 0.5);
        vec3 shell = position * (uRadius + n * 0.22 + aRand * 0.12);
        // Cada ponto chega num tempo diferente: a montagem parece orgânica
        float a = smoothstep(aRand * 0.45, 0.55 + aRand * 0.45, uAssemble);
        vec3 p = mix(aScatter, shell, a);

        // Repulsão do cursor: pontos perto de onde o mouse toca a esfera
        // são empurrados para fora e para longe, cada um com força própria
        float md = distance(p, uMouse);
        float fall = 1.0 - smoothstep(0.0, 1.8 + aRand * 0.5, md);
        float push = fall * fall * uMouseForce;
        vec3 away = normalize(p - uMouse + 1e-4);
        vec3 outward = normalize(p);
        vec3 swirl = normalize(cross(outward, vec3(0.0, 1.0, 0.0)) + 1e-4);
        p += (away * 1.4 + outward * 1.1 + swirl * (aRand - 0.5) * 1.2) * push * (1.0 + aRand * 2.2);
        vPush = push;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uPixelRatio * (0.45 + aRand * 0.8) / -mv.z;
        gl_Position = projectionMatrix * mv;
        vColor = mix(uColorA, uColorB, smoothstep(-0.9, 0.9, position.y + n * 1.4));
        vColor = mix(vColor, vec3(0.85, 1.0, 0.75), vPush * 0.55);
        vAlpha = (0.45 + 0.55 * aRand) * (0.35 + 0.65 * a);
        gl_PointSize *= 1.0 + vPush * 0.6;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor * 1.45, a * vAlpha * uOpacity * 0.85);
      }
    `,
  });

  return new THREE.Points(geo, mat);
}

/* ---------- Estrelas ---------- */
function createStars(count, dot) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 35 + Math.random() * 60;
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.6, r * Math.sin(v) * Math.sin(u)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.45,
    map: dot,
    color: 0x9fb7d8,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    fog: false,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- Telas dos projetos ---------- */
function roundedRectPoints(w, h, r, segments = 6) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s.getPoints(segments).map((p) => new THREE.Vector3(p.x, p.y, 0));
}

function createScreen(project, index, total, loader, dot) {
  const group = new THREE.Group();
  const angle = (index / total) * Math.PI * 2;
  group.position.set(Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS);
  group.lookAt(group.position.clone().multiplyScalar(2)); // olha para fora do anel

  const tint = new THREE.Color(project.tint ?? 0x8bd45a);

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: null },
      uHasMap: { value: 0 },
      uOpacity: { value: 0 },
      uActive: { value: 0 },
      uAspect: { value: SCREEN_W / SCREEN_H },
      uTint: { value: tint },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uHasMap, uOpacity, uActive, uAspect;
      uniform vec3 uTint;
      varying vec2 vUv;
      float roundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }
      void main() {
        vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
        float sd = roundedBox(p, vec2(uAspect * 0.5, 0.5), 0.05);
        float mask = smoothstep(0.004, -0.004, sd);
        vec3 col = uHasMap > 0.5 ? texture2D(uMap, vUv).rgb : uTint * 0.15;
        // Telas fora de foco ficam escuras e puxadas para a cor do projeto;
        // o teto de brilho fica abaixo do limiar do bloom para o site não "estourar"
        float lum = mix(0.32, 0.86, uActive);
        col = mix(col * lum, uTint * 0.12 + col * 0.25, (1.0 - uActive) * 0.35);
        float vign = smoothstep(0.75, 0.2, length(vUv - 0.5));
        col *= mix(0.82, 1.0, vign);
        gl_FragColor = vec4(col, mask * uOpacity);
      }
    `,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), mat);
  group.add(plane);

  loader.load(`${project.image}-1200.webp`, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    mat.uniforms.uMap.value = tex;
    mat.uniforms.uHasMap.value = 1;
  });

  // Moldura neon (cor acima de 1.0 para acender no bloom)
  const frameGeo = new THREE.BufferGeometry().setFromPoints(roundedRectPoints(SCREEN_W + 0.08, SCREEN_H + 0.08, 0.12));
  const frameMat = new THREE.LineBasicMaterial({ color: tint.clone(), transparent: true, opacity: 0 });
  const frame = new THREE.LineLoop(frameGeo, frameMat);
  frame.position.z = 0.005;
  group.add(frame);

  // Halo atrás da tela
  const haloMat = new THREE.SpriteMaterial({ map: dot, color: tint, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(SCREEN_W * 2.2, SCREEN_H * 2.6, 1);
  halo.position.z = -0.25;
  group.add(halo);

  return { group, mat, frameMat, haloMat, tint, angle };
}

/* ---------- Cena completa ---------- */
export function createScene(canvas, projects, { mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.03);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  camera.position.set(0, 0.2, 10.5);

  const dot = softDotTexture();
  const loader = new THREE.TextureLoader();

  const stars = createStars(mobile ? 900 : 1800, dot);
  scene.add(stars);

  const core = createCore(mobile ? 3200 : 7000);
  scene.add(core);

  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: SPRING, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }));
  coreGlow.scale.setScalar(7);
  scene.add(coreGlow);

  // Anel orbital tracejado, por onde as telas passam
  const ringPts = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.sin(a) * RING_RADIUS, -1.45, Math.cos(a) * RING_RADIUS));
  }
  const orbitLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(ringPts),
    new THREE.LineDashedMaterial({ color: 0x3a5478, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0 })
  );
  orbitLine.computeLineDistances();
  scene.add(orbitLine);

  // Anel inclinado em volta do núcleo, como uma órbita de elétron
  const haloRingPts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    haloRingPts.push(new THREE.Vector3(Math.cos(a) * 3.3, 0, Math.sin(a) * 3.3));
  }
  const haloRing = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(haloRingPts),
    new THREE.LineBasicMaterial({ color: SPRING.clone().multiplyScalar(1.6), transparent: true, opacity: 0.55 })
  );
  haloRing.rotation.set(1.15, 0, 0.35);
  scene.add(haloRing);

  const screens = projects.map((p, i) => createScreen(p, i, projects.length, loader, dot));
  const ring = new THREE.Group();
  screens.forEach((s) => ring.add(s.group));
  scene.add(ring);

  /* Pós-processamento: brilho neon */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), mobile ? 0.6 : 0.75, 0.45, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* Estado vindo da rolagem (escrito por main.js) */
  const state = { hero: 0, orbit: 0, outro: 0, px: 0, py: 0, assemble: 0, pointerActive: false };

  let width = 1;
  let height = 1;
  let narrow = false;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    narrow = width < 960;
    const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(pr);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pr);
    composer.setSize(width, height);
    bloom.resolution.set(width * (mobile ? 0.5 : 1), height * (mobile ? 0.5 : 1));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    core.material.uniforms.uPixelRatio.value = pr;
  }

  /* Distância da câmera até a tela para que ela caiba no recorte desejado */
  function screenDistance(frac) {
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const byH = SCREEN_H / (frac.h * t);
    const byW = SCREEN_W / (frac.w * t * camera.aspect);
    return Math.max(byH, byW);
  }

  const tmpPos = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitSphere = new THREE.Sphere();
  const sphereCenter = new THREE.Vector3();
  const hitPoint = new THREE.Vector3();
  const localHit = new THREE.Vector3();
  const mouseLocal = new THREE.Vector3(0, 0, 99);
  let mouseForce = 0;
  const tmpTarget = new THREE.Vector3();
  const smoothed = { hero: 0, orbit: 0, outro: 0, px: 0, py: 0 };
  const offset = { x: 0, y: 0 };
  const curOffset = { x: 0, y: 0 };

  function orbitPose(o, outPos, outTarget) {
    const th = (o / projects.length) * Math.PI * 2;
    const d = screenDistance(narrow ? { w: 0.9, h: 0.42 } : { w: 0.5, h: 0.58 });
    outTarget.set(Math.sin(th) * RING_RADIUS, 0, Math.cos(th) * RING_RADIUS);
    outPos.set(Math.sin(th) * (RING_RADIUS + d), 0.45, Math.cos(th) * (RING_RADIUS + d));
  }

  const clock = new THREE.Clock();
  let running = true;
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 4.5);

    // Amortece os parâmetros da rolagem (não as posições): assim a câmera
    // sempre percorre o arco da órbita, sem cortar por dentro do anel
    smoothed.hero += (state.hero - smoothed.hero) * k;
    smoothed.orbit += (state.orbit - smoothed.orbit) * k;
    smoothed.outro += (state.outro - smoothed.outro) * k;
    smoothed.px += (state.px - smoothed.px) * k * 0.6;
    smoothed.py += (state.py - smoothed.py) * k * 0.6;

    const h = ease(clamp01(smoothed.hero));
    const u = ease(clamp01(smoothed.outro));
    const o = smoothed.orbit;

    // Poses: hero → órbita → visão de cima
    const heroPos = new THREE.Vector3(0, 0.2, narrow ? 17 : 10.5);
    const heroTarget = new THREE.Vector3(0, 0, 0);
    orbitPose(o, tmpPos, tmpTarget);
    const desiredPos = heroPos.clone().lerp(tmpPos, h);
    const desiredTarget = heroTarget.clone().lerp(tmpTarget, h);
    const outroPos = new THREE.Vector3(Math.sin(t * 0.03) * 6, narrow ? 20 : 14, (narrow ? 17 : 12) + Math.cos(t * 0.03) * 4);
    desiredPos.lerp(outroPos, u);
    desiredTarget.lerp(new THREE.Vector3(0, -1, 0), u);

    // Paralaxe do ponteiro, nos eixos da própria câmera
    const fwd = desiredTarget.clone().sub(desiredPos).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();
    desiredPos.addScaledVector(right, smoothed.px * 0.45).addScaledVector(camera.up, -smoothed.py * 0.25);

    camera.position.copy(desiredPos);
    camera.lookAt(desiredTarget);

    // Recorte da câmera: desloca a cena para dar lugar ao texto
    const heroShift = narrow ? { x: 0, y: 0.3 } : { x: 0.22, y: 0 };
    const orbitShift = narrow ? { x: 0, y: 0.2 } : { x: 0.19, y: 0 };
    offset.x = (heroShift.x + (orbitShift.x - heroShift.x) * h) * (1 - u);
    offset.y = (heroShift.y + (orbitShift.y - heroShift.y) * h) * (1 - u);
    curOffset.x = offset.x;
    curOffset.y = offset.y;
    camera.setViewOffset(width, height, -curOffset.x * width, curOffset.y * height, width, height);

    // Núcleo
    // Cursor sobre a esfera: acha onde o raio do mouse toca o núcleo
    // e leva esse ponto para o espaço local das partículas
    const cu = core.material.uniforms;
    let targetForce = 0;
    if (state.pointerActive) {
      ndc.set(state.px, -state.py);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      core.updateMatrixWorld();
      hitSphere.set(core.getWorldPosition(sphereCenter), cu.uRadius.value + 0.35);
      if (raycaster.ray.intersectSphere(hitSphere, hitPoint)) {
        core.worldToLocal(localHit.copy(hitPoint));
        if (mouseLocal.z > 50) mouseLocal.copy(localHit);
        mouseLocal.lerp(localHit, 1 - Math.exp(-dt * 14));
        targetForce = (1 - h) * (1 - u);
      }
    }
    // Força sobe rápido e desce devagar: a nuvem "assenta" de volta
    mouseForce += (targetForce - mouseForce) * (1 - Math.exp(-dt * (targetForce > mouseForce ? 7 : 2.2)));
    cu.uMouse.value.copy(mouseLocal);
    cu.uMouseForce.value = mouseForce;
    cu.uTime.value = t;
    cu.uAssemble.value = state.assemble;
    cu.uRadius.value = 2.4 - h * 0.5 + u * 0.4;
    cu.uOpacity.value = (1 - h * 0.35) * (1 - u * 0.55);
    core.rotation.y = t * 0.06 + o * 0.25;
    core.rotation.x = Math.sin(t * 0.1) * 0.15;
    coreGlow.material.opacity = 0.07 + 0.025 * Math.sin(t * 1.3);
    haloRing.rotation.z = 0.35 + t * 0.15;
    haloRing.material.opacity = 0.55 * state.assemble;

    // Anel de telas
    const vis = h;
    const n = projects.length;
    screens.forEach((s, i) => {
      let d = Math.abs(o - i);
      d = Math.min(d, n - d);
      const w = Math.max(0, 1 - d) * (1 - u);
      const active = w * w * (3 - 2 * w);
      s.mat.uniforms.uActive.value = active;
      s.mat.uniforms.uOpacity.value = vis * (0.4 + 0.6 * active) * (1 - u * 0.35);
      s.frameMat.opacity = vis * (0.25 + 0.75 * active);
      s.frameMat.color.copy(s.tint).multiplyScalar(1 + active * 1.6);
      s.haloMat.opacity = vis * active * 0.14;
      const sc = 0.55 + 0.45 * vis;
      s.group.scale.setScalar(sc);
      s.group.position.y = Math.sin(t * 0.6 + i * 1.7) * 0.08;
    });
    ring.rotation.y = u * 0.5 + t * 0.02 * u;
    orbitLine.material.opacity = 0.55 * Math.max(vis, u);
    stars.rotation.y = t * 0.004;

    composer.render(dt);
  }

  resize();
  frame();

  const onVisibility = () => {
    running = !document.hidden;
    if (running) clock.getDelta();
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", resize);

  return {
    state,
    get cameraPosition() { return camera.position; },
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    },
  };
}

/* Teste rápido de suporte a WebGL antes de carregar tudo */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
