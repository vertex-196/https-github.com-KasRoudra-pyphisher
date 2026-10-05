// Saludo al Sol (Surya Namaskar A) como esqueleto 2D de perfil.
// Cada postura se define por la posición de la cadera y los ángulos de cada hueso
// (grados, 0 = hacia delante, 90 = abajo, -90 = arriba). Al interpolar ángulos
// —y no posiciones— los miembros conservan su longitud y el movimiento fluye.
// Lo usan la web (web-src/main.js) y el vídeo de Remotion (remotion/src/SunFlow.tsx).

export const BONES = { thigh: 70, shin: 70, torso: 92, neck: 26, upperArm: 46, forearm: 44 };
export const GROUND = 360;

export const POSES = [
  {
    id: 'tadasana', sanskrit: 'Tadasana', name: 'Montaña', breath: 'Respira',
    text: 'De pie, con los pies enraizados. Alarga la columna y encuentra tu centro.',
    hip: [200, 220], thigh: 90, shin: 90, torso: -90, head: -90, upperArm: 88, forearm: 88, curve: 0,
  },
  {
    id: 'urdhva-hastasana', sanskrit: 'Urdhva Hastasana', name: 'Brazos al cielo', breath: 'Inhala',
    text: 'Eleva los brazos y abre el pecho. El aire entra y el cuerpo crece.',
    hip: [198, 220], thigh: 89, shin: 91, torso: -100, head: -108, upperArm: -98, forearm: -96, curve: 9,
  },
  {
    id: 'uttanasana', sanskrit: 'Uttanasana', name: 'Flexión hacia delante', breath: 'Exhala',
    text: 'Pliégate desde la cadera y suelta la cabeza. Deja ir la tensión.',
    hip: [186, 220], thigh: 80, shin: 88, torso: 60, head: 100, upperArm: 62, forearm: 28, curve: -6,
  },
  {
    id: 'ardha-uttanasana', sanskrit: 'Ardha Uttanasana', name: 'Media flexión', breath: 'Inhala',
    text: 'Espalda larga y plana, mirada al suelo. Prepárate para el siguiente paso.',
    hip: [188, 220], thigh: 81, shin: 88, torso: 8, head: 2, upperArm: 115, forearm: 120, curve: 0,
  },
  // Transición (sin etiqueta): manos al suelo antes de dar el paso atrás.
  { transition: true, hip: [210, 228], thigh: 112, shin: 112, torso: 48, head: 80, upperArm: 55, forearm: 40, curve: 0 },
  {
    id: 'plancha', sanskrit: 'Phalakasana', name: 'Plancha', breath: 'Exhala',
    text: 'El cuerpo en una línea, del talón a la coronilla. Fuerza y calma a la vez.',
    hip: [215, 305.6], thigh: 157, shin: 157, torso: -23, head: -20, upperArm: 90, forearm: 90, curve: 0,
  },
  {
    id: 'urdhva-mukha', sanskrit: 'Urdhva Mukha Svanasana', name: 'Perro boca arriba', breath: 'Inhala',
    text: 'Empuja el suelo, abre el pecho y mira hacia arriba con suavidad.',
    hip: [251, 344], thigh: 172, shin: 175, torso: -54, head: -70, upperArm: 92, forearm: 92, curve: 14,
  },
  {
    id: 'adho-mukha', sanskrit: 'Adho Mukha Svanasana', name: 'Perro boca abajo', breath: 'Exhala',
    text: 'Caderas al cielo, talones hacia el suelo. Quédate aquí cinco respiraciones.',
    hip: [200, 236], thigh: 118, shin: 118, torso: 42, head: 75, upperArm: 42, forearm: 42, curve: 0,
  },
  // Transición: caminar hacia las manos y volver a la flexión antes de subir.
  { transition: true, hip: [186, 220], thigh: 80, shin: 88, torso: 60, head: 100, upperArm: 62, forearm: 28, curve: -6 },
  {
    id: 'anjali', sanskrit: 'Anjali Mudra', name: 'Vuelta al centro', breath: 'Inhala',
    text: 'Manos al corazón. Observa cómo te sientes: ese es tu momento NOVA.',
    hip: [200, 220], thigh: 90, shin: 90, torso: -90, head: -90, upperArm: 100, forearm: -62, curve: 0,
  },
];

const KEYS = ['thigh', 'shin', 'torso', 'head', 'upperArm', 'forearm', 'curve'];
const rad = (d) => (d * Math.PI) / 180;
const add = (p, len, deg) => [p[0] + len * Math.cos(rad(deg)), p[1] + len * Math.sin(rad(deg))];
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Índices de las posturas con nombre (las transiciones no se muestran como paso).
export const STEPS = POSES.map((p, i) => (p.transition ? -1 : i)).filter((i) => i >= 0);

// Postura intermedia para un progreso continuo 0..(POSES.length - 1).
// `hold` reserva parte de cada tramo para quedarse quieto en las posturas con nombre.
export function poseAt(progress, hold = 0.3) {
  const max = POSES.length - 1;
  const p = Math.max(0, Math.min(max, progress));
  const i = Math.min(Math.floor(p), max - 1);
  const a = POSES[i];
  const b = POSES[i + 1];
  const h0 = a.transition ? 0 : hold / 2;
  const h1 = b.transition ? 0 : hold / 2;
  const t = ease(Math.max(0, Math.min(1, (p - i - h0) / (1 - h0 - h1))));
  const out = { hip: [lerp(a.hip[0], b.hip[0], t), lerp(a.hip[1], b.hip[1], t)] };
  for (const k of KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
}

// Convierte el avance por "pasos con nombre" (0..STEPS.length-1) al avance por fotogramas clave.
export function stepToKey(step) {
  const s = Math.max(0, Math.min(STEPS.length - 1, step));
  const i = Math.min(Math.floor(s), STEPS.length - 2);
  return lerp(STEPS[i], STEPS[i + 1], s - i);
}

// Cinemática directa: ángulos → articulaciones.
export function joints(pose) {
  const hip = pose.hip;
  const knee = add(hip, BONES.thigh, pose.thigh);
  const foot = add(knee, BONES.shin, pose.shin);
  const neck = add(hip, BONES.torso, pose.torso);
  const head = add(neck, BONES.neck, pose.head);
  const shoulder = add(neck, 8, pose.torso + 180);
  const elbow = add(shoulder, BONES.upperArm, pose.upperArm);
  const hand = add(elbow, BONES.forearm, pose.forearm);
  // Pierna y brazo del fondo: mismos ángulos con un pequeño desfase para dar volumen.
  const kneeB = add(hip, BONES.thigh, pose.thigh + 4);
  const footB = add(kneeB, BONES.shin, pose.shin + 2);
  const elbowB = add(shoulder, BONES.upperArm, pose.upperArm - 6);
  const handB = add(elbowB, BONES.forearm, pose.forearm - 6);
  return { hip, knee, foot, neck, head, shoulder, elbow, hand, kneeB, footB, elbowB, handB };
}

const f = (n) => n.toFixed(1);
const line = (...pts) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L');

// Trazados SVG de la figura (los mismos en la web y en Remotion).
export function figurePaths(pose) {
  const j = joints(pose);
  const dx = j.neck[0] - j.hip[0];
  const dy = j.neck[1] - j.hip[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mid = [(j.hip[0] + j.neck[0]) / 2 + nx * pose.curve, (j.hip[1] + j.neck[1]) / 2 + ny * pose.curve];
  const hd = [j.head[0] - j.neck[0], j.head[1] - j.neck[1]];
  const hl = Math.hypot(hd[0], hd[1]) || 1;
  const bun = [j.head[0] + (hd[0] / hl) * 9 + (hd[1] / hl) * 13, j.head[1] + (hd[1] / hl) * 9 - (hd[0] / hl) * 13];
  return {
    legBack: line(j.hip, j.kneeB, j.footB),
    armBack: line(j.shoulder, j.elbowB, j.handB),
    torso: `M${f(j.hip[0])} ${f(j.hip[1])} Q${f(mid[0])} ${f(mid[1])} ${f(j.neck[0])} ${f(j.neck[1])}`,
    leg: line(j.hip, j.knee, j.foot),
    arm: line(j.shoulder, j.elbow, j.hand),
    head: j.head,
    bun,
  };
}
