export interface Anchor {
  frame: number;
  value: number;
}

/** Shape-preserving cubic interpolation: velocity is continuous at each anchor.
 * Unlike easing each segment, passing an anchor does not brake the camera.
 * A reversal gets a zero tangent so it turns without a snap or an overshoot.
 */
export function smoothTrack(anchors: Anchor[]): (frame: number) => number {
  if (anchors.length < 2) throw new Error("A motion track needs two anchors.");
  const widths = anchors.slice(1).map((p, i) => p.frame - anchors[i].frame);
  if (widths.some((width) => width <= 0))
    throw new Error("Motion anchors must be ordered and unique.");
  const slopes = widths.map(
    (width, i) => (anchors[i + 1].value - anchors[i].value) / width,
  );
  const tangents = anchors.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === anchors.length - 1) return slopes[slopes.length - 1];
    const before = slopes[i - 1],
      after = slopes[i];
    if (before * after <= 0) return 0;
    const w1 = 2 * widths[i] + widths[i - 1];
    const w2 = widths[i] + 2 * widths[i - 1];
    return (w1 + w2) / (w1 / before + w2 / after);
  });
  return (frame: number) => {
    if (frame <= anchors[0].frame) return anchors[0].value;
    if (frame >= anchors[anchors.length - 1].frame)
      return anchors[anchors.length - 1].value;
    let i = 0;
    while (frame > anchors[i + 1].frame) i++;
    const t = (frame - anchors[i].frame) / widths[i];
    const t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * anchors[i].value +
      (t3 - 2 * t2 + t) * widths[i] * tangents[i] +
      (-2 * t3 + 3 * t2) * anchors[i + 1].value +
      (t3 - t2) * widths[i] * tangents[i + 1]
    );
  };
}

export const ramp = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

const track = (values: [number, number][]) => {
  const sample = smoothTrack(
    values.map(([frame, value]) => ({ frame, value })),
  );
  // A short shutter-shaped kernel softens acceleration changes at measured
  // beats without introducing a fresh ease-out at every scene boundary.
  return (frame: number) =>
    (sample(frame - 3) +
      4 * sample(frame - 1.5) +
      6 * sample(frame) +
      4 * sample(frame + 1.5) +
      sample(frame + 3)) /
    16;
};

// Measured beats in the supplied 00:07–00:21 cut. One dolly goes forwards,
// breathes on the freedom tableau, then retraces ALL the earlier scenery.
const dolly = track([
  [0, -7600],
  [105, -7600],
  [116, -2400],
  [129, -1450],
  [149, -1300],
  [187, -670],
  [245, -50],
  [337, 850],
  [389, 1390],
  [441, 1670],
  [493, 2310],
  [516, 2325],
  [563, 2375],
  [606, 2425],
  [614, 2420],
  [621, 2250],
  [630, 1500],
  [644, 300],
  [655, -2300],
  [669, -10000],
  [840, -10000],
]);
const aimX = track([
  [0, 800],
  [149, 800],
  [216, 780],
  [273, 870],
  [337, 850],
  [389, 810],
  [441, 800],
  [516, 786],
  [563, 800],
  [606, 815],
  [644, 835],
  [669, 800],
  [840, 800],
]);
const aimY = track([
  [0, 450],
  [149, 450],
  [187, 300],
  [216, 305],
  [245, 445],
  [305, 430],
  [389, 440],
  [441, 420],
  [493, 450],
  [540, 444],
  [606, 431],
  [644, 420],
  [669, 450],
  [840, 450],
]);
const bank = track([
  [0, 0],
  [149, 0],
  [216, -2],
  [273, 2.4],
  [337, -1.4],
  [389, 1],
  [441, -1.3],
  [493, -0.4],
  [606, 0.6],
  [644, -3],
  [669, 0],
  [840, 0],
]);

export function cameraAt(frame: number) {
  const z = dolly(frame);
  // Keep the retreating emblem full-bleed until the star closes the picture.
  const openingDistance = -dolly(141);
  const desiredZoom = (-z / openingDistance) * 1.35;
  // A smooth maximum retains the original lens until compensation is needed,
  // without a hard speed change at the point where the emblem would get small.
  const zoom = (1 + desiredZoom + Math.hypot(1 - desiredZoom, 0.2)) / 2;
  return {
    z,
    x: aimX(frame),
    y: aimY(frame),
    roll: bank(frame),
    zoom: 1 + (zoom - 1) * ramp(639, 648, frame),
  };
}

export const FOCAL_LENGTH = 1200;
export function project(distance: number, frame: number) {
  const camera = cameraAt(frame);
  const gap = distance - camera.z;
  return {
    ...camera,
    gap,
    scale: Math.min(10, (FOCAL_LENGTH * camera.zoom) / Math.max(120, gap)),
    opacity:
      ramp(100, 190, gap) * ramp(111, 122, frame) * (1 - ramp(673, 676, frame)),
  };
}

export const STAR_PATH =
  "M12 1.5 14.6 8.8 22.4 9.1 16.3 14 18.4 21.5 12 17.1 5.6 21.5 7.7 14 1.6 9.1 9.4 8.8Z";

const irisSize = track([
  [648, 4.8],
  [651, 4],
  [659, 0.95],
  [674, 0.008],
  [682, 0.008],
]);
export function irisAt(frame: number) {
  return {
    scale: irisSize(frame),
    opacity: ramp(651, 659, frame) * (1 - ramp(674, 682, frame)),
  };
}
