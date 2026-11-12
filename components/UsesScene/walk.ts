import {
  paintCloth,
  releaseClothSurface,
  type ClothPart,
  type ClothVertex,
} from "./cloth";

/** Side-on gait, guided by the stance/swing events in the reference animation.
 * Reference: https://portfolio-experiments.vercel.app/experiments/out-of-office
 * Art is an original painted cutout puppet, kept separate from the motion.
 */
export interface Point {
  x: number;
  y: number;
}
type Keys = readonly (readonly [number, number])[];
const TAU = Math.PI * 2;
const PERIOD = 1.27 / 0.85;
const wrap = (value: number) => ((value % 1) + 1) % 1;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

// Flexion and recoil at heel strike, loading, toe-off, and passing.
const hipKeys: Keys = [
  [0, 25],
  [0.1, 22],
  [0.2, 12],
  [0.3, 2],
  [0.4, -6],
  [0.5, -10],
  [0.55, -9],
  [0.6, -5],
  [0.7, 10],
  [0.8, 22],
  [0.9, 27],
];
const kneeKeys: Keys = [
  [0, 3],
  [0.1, 15],
  [0.2, 12],
  [0.3, 5],
  [0.4, 3],
  [0.5, 10],
  [0.6, 38],
  [0.7, 62],
  [0.8, 45],
  [0.9, 15],
];
const ankleKeys: Keys = [
  [0, 0],
  [0.1, -5],
  [0.2, 2],
  [0.3, 6],
  [0.4, 9],
  [0.5, 8],
  [0.55, 0],
  [0.6, -15],
  [0.65, -12],
  [0.75, -3],
  [0.85, 0],
];

/** Periodic cubic Hermite interpolation keeps position and velocity continuous. */
function joint(keys: Keys, phase: number) {
  const t = wrap(phase),
    count = keys.length;
  let index = count - 1;
  for (let i = 0; i < count - 1; i++)
    if (t >= keys[i][0] && t < keys[i + 1][0]) {
      index = i;
      break;
    }
  const at = (i: number): readonly [number, number] => {
    const k = keys[((i % count) + count) % count];
    return [k[0] + Math.floor(i / count), k[1]];
  };
  const [x0, y0] = at(index - 1),
    [x1, y1] = at(index),
    [x2, y2] = at(index + 1),
    [x3, y3] = at(index + 2);
  const span = x2 - x1,
    u = (t - x1) / span,
    u2 = u * u,
    u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * y1 +
    ((u3 - 2 * u2 + u) * span * (y2 - y0)) / (x2 - x0) +
    (-2 * u3 + 3 * u2) * y2 +
    ((u3 - u2) * span * (y3 - y1)) / (x3 - x1)
  );
}

interface Leg {
  knee: Point;
  ankle: Point;
  angle: number;
  heel: Point;
  toe: Point;
}
function foot(knee: Point, ankle: Point, angle: number): Leg {
  const c = Math.cos(angle),
    s = Math.sin(angle);
  return {
    knee,
    ankle,
    angle,
    heel: {
      x: ankle.x - 0.045 * c - 0.032 * s,
      y: ankle.y - 0.045 * s + 0.032 * c,
    },
    toe: {
      x: ankle.x + 0.12 * c - 0.032 * s,
      y: ankle.y + 0.12 * s + 0.032 * c,
    },
  };
}
function rawLeg(phase: number) {
  const hip = radians(joint(hipKeys, phase)),
    kneeAngle = radians(joint(kneeKeys, phase));
  const shank = hip - kneeAngle;
  const knee = { x: Math.sin(hip) * 0.245, y: Math.cos(hip) * 0.245 };
  const ankle = {
    x: knee.x + Math.sin(shank) * 0.246,
    y: knee.y + Math.cos(shank) * 0.246,
  };
  return foot(knee, ankle, -shank - radians(joint(ankleKeys, phase)));
}
function support(phase: number) {
  const t = wrap(phase);
  return t < 0.12
    ? ease(t / 0.12)
    : t < 0.5
      ? 1
      : t < 0.62
        ? 1 - ease((t - 0.5) / 0.12)
        : 0;
}
function solveKnee(target: Point): Point {
  const a = 0.245,
    b = 0.246,
    d = Math.min(Math.hypot(target.x, target.y), a + b - 0.0001);
  const angle =
    Math.atan2(target.x, target.y) +
    Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  return { x: Math.sin(angle) * a, y: Math.cos(angle) * a };
}
function legs(phase: number) {
  const a = rawLeg(phase),
    b = rawLeg(phase + 0.5),
    weight = support(phase);
  const bottom = (leg: Leg) => Math.max(leg.heel.y, leg.toe.y);
  const floor = bottom(a) * weight + bottom(b) * (1 - weight);
  const ground = (leg: Leg, load: number) => {
    const error = floor - bottom(leg);
    if (error >= 0 && load < 0.001) return leg;
    const ankle = { x: leg.ankle.x, y: leg.ankle.y + error };
    return foot(solveKnee(ankle), ankle, leg.angle);
  };
  return { near: ground(a, weight), far: ground(b, 1 - weight), floor, weight };
}

/** Integrate the supporting foot's displacement to prevent skating. */
const samples = 240;
const path = new Float64Array(samples + 1);
let previous = legs(0);
for (let i = 1; i <= samples; i++) {
  const current = legs(i / samples);
  const displacement = (now: Leg, before: Leg) =>
    now.heel.y > now.toe.y
      ? now.heel.x - before.heel.x
      : now.toe.x - before.toe.x;
  path[i] =
    path[i - 1] -
    current.weight * displacement(current.near, previous.near) -
    (1 - current.weight) * displacement(current.far, previous.far);
  previous = current;
}
const stride = path[samples];
function distance(cycle: number) {
  const t = wrap(cycle) * samples,
    i = Math.floor(t),
    u = t - i;
  return Math.floor(cycle) * stride + path[i] * (1 - u) + path[i + 1] * u;
}

const names = ["torso", "arm", "leg"] as const;
type PaintedPart = ClothPart;
type Atlas = Record<(typeof names)[number], PaintedPart>;
export function loadWalkingArt(): Promise<Atlas> {
  return Promise.all(
    names.map(
      (name) =>
        new Promise<PaintedPart>((resolve, reject) => {
          const image = new Image();
          image.onload = () =>
            resolve({
              image,
              width: image.naturalWidth,
              height: image.naturalHeight,
            });
          image.onerror = reject;
          image.src =
            name === "torso"
              ? "/uses/original-character.png"
              : `/uses/puppet-v2/${name}.webp`;
        }),
    ),
  ).then(
    (parts) =>
      Object.fromEntries(
        names.map((name, index) => [name, parts[index]]),
      ) as Atlas,
  );
}

/** A continuous textured strip follows a smooth centreline through the limb's joints. */
function paintLimb(
  ctx: CanvasRenderingContext2D,
  part: PaintedPart,
  points: Point[],
  stations: number[],
  anchor: number,
  width: number,
) {
  const slopes = points.map((_, i) => {
    const before = Math.max(0, i - 1),
      after = Math.min(points.length - 1, i + 1),
      span = stations[after] - stations[before];
    return {
      x: (points[after].x - points[before].x) / span,
      y: (points[after].y - points[before].y) / span,
    };
  });
  const vertex = (u: number, v: number): Point => {
    let index = stations.length - 2;
    for (let i = 0; i < stations.length - 1; i++)
      if (v >= stations[i] && v <= stations[i + 1]) {
        index = i;
        break;
      }
    const span = stations[index + 1] - stations[index],
      t = (v - stations[index]) / span,
      t2 = t * t,
      t3 = t2 * t;
    const a = points[index],
      b = points[index + 1],
      sa = slopes[index],
      sb = slopes[index + 1];
    const x =
      (2 * t3 - 3 * t2 + 1) * a.x +
      (t3 - 2 * t2 + t) * span * sa.x +
      (-2 * t3 + 3 * t2) * b.x +
      (t3 - t2) * span * sb.x;
    const y =
      (2 * t3 - 3 * t2 + 1) * a.y +
      (t3 - 2 * t2 + t) * span * sa.y +
      (-2 * t3 + 3 * t2) * b.y +
      (t3 - t2) * span * sb.y;
    const dx =
      (6 * t2 - 6 * t) * a.x +
      (3 * t2 - 4 * t + 1) * span * sa.x +
      (-6 * t2 + 6 * t) * b.x +
      (3 * t2 - 2 * t) * span * sb.x;
    const dy =
      (6 * t2 - 6 * t) * a.y +
      (3 * t2 - 4 * t + 1) * span * sa.y +
      (-6 * t2 + 6 * t) * b.y +
      (3 * t2 - 2 * t) * span * sb.y;
    const length = Math.hypot(dx, dy) || 1,
      offset = (u - anchor) * width;
    return { x: x + (dy / length) * offset, y: y - (dx / length) * offset };
  };
  const rows = [...new Set([0, 0.2, 0.4, 0.6, 0.8, 1, ...stations])].sort(
    (a, b) => a - b,
  );
  const vertices: ClothVertex[] = [];
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i],
      b = rows[i + 1];
    const corners = [
      { ...vertex(0, a), u: 0, v: a },
      { ...vertex(1, a), u: 1, v: a },
      { ...vertex(1, b), u: 1, v: b },
      { ...vertex(0, b), u: 0, v: b },
    ];
    vertices.push(
      corners[0],
      corners[1],
      corners[2],
      corners[0],
      corners[2],
      corners[3],
    );
  }
  paintCloth(ctx, part, vertices);
}

const LEG_SCALE = 0.92;
function drawFigure(
  ctx: CanvasRenderingContext2D,
  art: Atlas,
  x: number,
  floor: number,
  height: number,
  cycle: number,
) {
  const phase = wrap(cycle),
    pose = legs(phase),
    legHeight = height * LEG_SCALE;
  const hip = { x, y: floor - (pose.floor + 0.013) * legHeight };
  const point = (p: Point): Point => ({
    x: hip.x + p.x * legHeight,
    y: hip.y + p.y * legHeight,
  });
  const lean = radians(
    3.5 + 1.2 * Math.sin((cycle * TAU) / 4.7) + 0.8 * Math.cos(phase * TAU * 2),
  );
  const shoulder = {
    x: hip.x + Math.sin(lean) * 0.335 * height,
    y: hip.y - Math.cos(lean) * 0.335 * height,
  };
  const drawLeg = (leg: Leg) => {
    const ankle = point(leg.ankle);
    const sole = {
      x: ankle.x - Math.sin(leg.angle) * 0.045 * legHeight,
      y: ankle.y + Math.cos(leg.angle) * 0.045 * legHeight,
    };
    paintLimb(
      ctx,
      art.leg,
      [hip, point(leg.knee), ankle, sole],
      [0, 0.46, 0.88, 1],
      0.295,
      0.185 * height,
    );
  };
  const drawArm = (offset: number, near: boolean, joinOnly = false) => {
    const attachment = {
      x: shoulder.x + (near ? -0.035 : 0.005) * height,
      y: shoulder.y + 0.03 * height,
    };
    const swing = radians(19) * Math.cos((phase + offset) * TAU) + lean * 0.3;
    const elbow = {
      x: attachment.x + Math.sin(swing) * 0.155 * height,
      y: attachment.y + Math.cos(swing) * 0.155 * height,
    };
    const bend = radians(9 + (8 * (1 - Math.cos((phase + offset) * TAU))) / 2),
      angle = swing + bend;
    const wrist = {
      x: elbow.x + Math.sin(angle) * 0.14 * height,
      y: elbow.y + Math.cos(angle) * 0.14 * height,
    };
    const hand = {
      x: wrist.x + Math.sin(angle) * 0.043 * height,
      y: wrist.y + Math.cos(angle) * 0.043 * height,
    };
    // The rounded, transparent sleeve cap must overlap the opaque shirt.
    // Keep the elbow and hand path intact while seating the cap inside the shoulder.
    const sleeveRoot = {
      x: attachment.x + (near ? 0.025 : 0) * height,
      y: attachment.y - 0.015 * height,
    };
    if (joinOnly) {
      // This underarm panel sits beneath both the original shirt and sleeve.
      // Its left edge stays buried inside the sleeve even at maximum backswing.
      const bottom = {
        x: elbow.x + (wrist.x - elbow.x) * 0.45,
        y: elbow.y + (wrist.y - elbow.y) * 0.45,
      };
      const panel = [
        sleeveRoot,
        elbow,
        bottom,
        { x: shoulder.x + 0.04 * height, y: bottom.y },
        { x: shoulder.x + 0.04 * height, y: sleeveRoot.y },
      ];
      const texture = (point: Point): ClothVertex => {
        const dx = point.x - hip.x,
          dy = point.y - hip.y;
        const localX = Math.cos(lean) * dx + Math.sin(lean) * dy;
        const localY = -Math.sin(lean) * dx + Math.cos(lean) * dy;
        const y = localY / scale + 685;
        let index = originalRows.length - 2;
        for (let i = 0; i < originalRows.length - 1; i++)
          if (y >= originalRows[i].y && y <= originalRows[i + 1].y) {
            index = i;
            break;
          }
        const a = originalRows[index],
          b = originalRows[index + 1];
        const t = Math.max(0, Math.min(1, (y - a.y) / (b.y - a.y)));
        const fit = a.fit + (b.fit - a.fit) * t;
        const left = a.left + (b.left - a.left) * t,
          right = a.right + (b.right - a.right) * t;
        const axis = 530 + 30 * Math.max(0, Math.min(1, (685 - y) / 400));
        const x = Math.max(
          left + 18,
          Math.min(right - 14, axis + (localX / scale - axis + 530) / fit),
        );
        return { ...point, u: x / 1144, v: y / 1375 };
      };
      const vertices = panel.map(texture);
      const triangles: ClothVertex[] = [];
      for (let i = 1; i < vertices.length - 1; i++)
        triangles.push(vertices[0], vertices[i], vertices[i + 1]);
      paintCloth(ctx, art.torso, triangles);
      return;
    }
    paintLimb(
      ctx,
      art.arm,
      [sleeveRoot, elbow, wrist, hand],
      [0, 0.46, 0.84, 1],
      0.55,
      0.087 * height,
    );
  };
  drawLeg(pose.far);
  drawArm(0, false);
  drawLeg(pose.near);
  // Sample the owner's actual selected painting. The collar, shirt folds,
  // waist stay painted, with a gentle cloth taper and unchanged head proportions.
  const originalRows = [
    { y: 20, left: 330, right: 730, fit: 1 },
    { y: 220, left: 330, right: 730, fit: 1 },
    { y: 245, left: 445, right: 680, fit: 1 },
    { y: 265, left: 515, right: 660, fit: 1 },
    { y: 290, left: 500, right: 650, fit: 0.98 },
    { y: 340, left: 490, right: 640, fit: 0.94 },
    { y: 400, left: 505, right: 650, fit: 0.9 },
    { y: 480, left: 485, right: 655, fit: 0.84 },
    { y: 550, left: 455, right: 660, fit: 0.8 },
    { y: 620, left: 430, right: 640, fit: 0.78 },
    { y: 690, left: 425, right: 645, fit: 0.83 },
    { y: 715, left: 435, right: 645, fit: 0.87 },
  ];
  const scale = (height * 0.335) / 400;
  const originalVertex = (
    x: number,
    y: number,
    fit: number,
    alpha = 1,
  ): ClothVertex => {
    const axis = 530 + 30 * Math.max(0, Math.min(1, (685 - y) / 400));
    return {
      x: (axis - 530 + (x - axis) * fit) * scale,
      y: (y - 685) * scale,
      u: x / 1144,
      v: y / 1375,
      alpha,
    };
  };
  const trunk: ClothVertex[] = [];
  for (let i = 0; i < originalRows.length - 1; i++) {
    const a = originalRows[i],
      b = originalRows[i + 1];
    const edge = (row: typeof a, index: number) => {
      const x = [row.left, row.left + 10, row.right - 6, row.right][index];
      const opacity = index === 0 || index === 3 || row.y === 715 ? 0 : 1;
      return originalVertex(x, row.y, row.fit, opacity);
    };
    for (let column = 0; column < 3; column++) {
      const corners = [
        edge(a, column),
        edge(a, column + 1),
        edge(b, column + 1),
        edge(b, column),
      ];
      trunk.push(
        corners[0],
        corners[1],
        corners[2],
        corners[0],
        corners[2],
        corners[3],
      );
    }
  }
  drawArm(0.5, true, true);
  ctx.save();
  ctx.translate(hip.x, hip.y);
  ctx.rotate(lean);
  paintCloth(ctx, art.torso, trunk);
  ctx.restore();
  drawArm(0.5, true);
}

export function createWalkingScene(
  canvas: HTMLCanvasElement,
  art: Atlas,
  initialPaused: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // Blurred history uses cached painted poses; the main figures remain fully articulated.
  const echoLayer = document.createElement("canvas");
  const echoFrames: HTMLCanvasElement[] = [];
  let cachedHeight = 0;
  let paused = initialPaused,
    visible = true,
    frame = 0,
    last = 0,
    time = 0,
    width = 0,
    height = 0,
    dpr = 1,
    disposed = false;
  const render = () => {
    ctx.clearRect(0, 0, width, height);
    const h = Math.min(285, height * 0.81),
      floor = height * 0.91;
    const count = width < 480 ? 3 : 6,
      spacing = width / count,
      total = count + 3,
      span = total * spacing;
    const sceneCycle = time / PERIOD;
    for (let i = -1; i < total - 1; i++) {
      const phase = -i / 6,
        origin = i * spacing;
      const position = (at: number) =>
        origin + (distance(at + phase) - distance(phase)) * h * LEG_SCALE;
      const mainX = position(sceneCycle);
      const shift = Math.floor((mainX + h * 0.55) / span) * span;
      const x = mainX - shift;
      if (x < -h * 0.7 || x > width + h * 0.7) continue;
      for (const [lag, alpha, blur] of [
        [0.98, 0.07, 8],
        [0.6, 0.11, 5],
        [0.28, 0.17, 2.5],
      ]) {
        const echo =
          echoFrames[
            Math.floor(
              wrap(sceneCycle + phase - lag / PERIOD) * echoFrames.length,
            )
          ];
        if (!echo) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(
          echo,
          position(sceneCycle - lag / PERIOD) - shift - echoLayer.width / 2,
          floor - h * 1.04,
        );
        ctx.restore();
      }
      drawFigure(ctx, art, x, floor, h, sceneCycle + phase);
    }
  };
  const tick = (stamp: number) => {
    frame = 0;
    if (last) time += Math.min((stamp - last) / 1000, 0.05);
    last = stamp;
    render();
    if (!disposed && !paused && visible && !document.hidden)
      frame = requestAnimationFrame(tick);
  };
  const start = () => {
    last = 0;
    if (!disposed && !paused && visible && !document.hidden && !frame)
      frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const figureHeight = Math.min(285, height * 0.81);
    echoLayer.width = Math.ceil(figureHeight * 0.85 + 24);
    echoLayer.height = Math.ceil(figureHeight * 1.14);
    if (figureHeight !== cachedHeight) {
      cachedHeight = figureHeight;
      echoFrames.length = 0;
      for (let i = 0; i < 24; i++) {
        const frame = document.createElement("canvas");
        frame.width = echoLayer.width;
        frame.height = echoLayer.height;
        const context = frame.getContext("2d");
        if (context)
          drawFigure(
            context,
            art,
            frame.width / 2,
            figureHeight * 1.04,
            figureHeight,
            i / 24,
          );
        echoFrames.push(frame);
      }
    }
    render();
  };
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  observer.observe(canvas);
  const visibility = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener("visibilitychange", visibility);
  resize();
  start();
  return {
    setPaused: (value: boolean) => {
      paused = value;
      if (paused) stop();
      else start();
    },
    destroy: () => {
      disposed = true;
      stop();
      resizer.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      releaseClothSurface();
    },
  };
}
