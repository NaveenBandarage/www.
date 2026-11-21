import { traced, type ArtworkKind, type TracedArtwork } from "./Artwork";
import { cameraAt, FOCAL_LENGTH, project, ramp } from "./motion";

export const FPS = 60;
export const LAST_FRAME = 840;
export const DURATION = (LAST_FRAME / FPS) * 1000;
export interface World {
  id: string;
  depth: number;
  distance: number;
  referenceFrame: number;
}
export interface Piece {
  id: string;
  kind: ArtworkKind;
  world: string;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  rotation: number;
  origin?: string;
  flip?: boolean;
  orbit?: { theta: number; radius: number; direction: number };
}

// Fixed scenery, one shared camera. These same planes reappear on the rewind.
export const WORLDS: World[] = [
  { id: "americana", depth: 60, distance: 0, referenceFrame: 141 },
  { id: "garden", depth: 40, distance: 900, referenceFrame: 264 },
  { id: "architecture", depth: 30, distance: 1800, referenceFrame: 372 },
  { id: "flamingos", depth: 20, distance: 2500, referenceFrame: 432 },
  { id: "chaos", depth: 10, distance: 3500, referenceFrame: 540 },
];
const worlds = new Map(WORLDS.map((world) => [world.id, world]));
const pieces: Piece[] = [];
const round = (n: number) => Math.round(n * 10000) / 10000;
function add(
  kind: ArtworkKind,
  world: string,
  x: number,
  y: number,
  w: number,
  h: number,
  depth = 0,
  options: Partial<Piece> = {},
) {
  const piece: Piece = {
    id: `${world}-${kind}-${pieces.length}`,
    kind,
    world,
    x: round(x),
    y: round(y),
    w,
    h,
    depth,
    rotation: 0,
    ...options,
  };
  if (world === "americana") {
    // Restore the uncropped 16:9 composition. The old reference plate removed
    // the top 150 pixels, which made hats, crowns and the center figure vanish.
    piece.x = round((piece.x * 1652) / 1920 + 134 / 1.2);
    piece.y = round((piece.y * 930) / 1080 + 150 / 1.2);
    piece.w = round((piece.w * 1652) / 1920);
    piece.h = round((piece.h * 930) / 1080);
    if (piece.orbit)
      piece.orbit = {
        ...piece.orbit,
        radius: (piece.orbit.radius * 1652) / 1920,
      };
  }
  pieces.push(piece);
}
function cutout(
  kind: TracedArtwork,
  world: string,
  depth = 0,
  options: Partial<Piece> = {},
) {
  const { x, y, w, h } = traced[kind];
  add(kind, world, x, y, w, h, depth, options);
}
function ring(
  kind: ArtworkKind,
  world: string,
  count: number,
  radius: number,
  size: number,
  depth: number,
  phase = 0,
) {
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2 + phase;
    add(
      kind,
      world,
      800 + Math.cos(theta) * radius,
      450 + Math.sin(theta) * radius * 0.75,
      size,
      size * (kind === "palm" ? 1.5 : 1),
      depth + (i % 3),
      {
        rotation: (theta * 180) / Math.PI + (kind === "palm-frond" ? 45 : 90),
        orbit: { theta, radius, direction: depth % 2 === 0 ? 1 : -1 },
        ...(kind === "palm" || kind === "palm-frond"
          ? { origin: "50% 85%" }
          : {}),
      },
    );
  }
}

// The emblem stays assembled. Perspective carries its wings past the camera;
// figures do not each perform a separate entrance or wind-up.
ring("palm", "americana", 8, 250, 190, 20, 0.15);
ring("blossom", "americana", 9, 230, 65, 14);
cutout("revolver", "americana", -4);
cutout("revolver", "americana", -4, { x: 1230, flip: true });
cutout("uncle-sam", "americana");
cutout("liberty", "americana");
cutout("saloon-woman", "americana", 6);
cutout("speedboat", "americana", 2);
cutout("muscle-car", "americana", 2);
cutout("hammerhead", "americana", 5);
cutout("swordfish", "americana", 5);
for (let i = 0; i < 7; i++)
  add(
    "orange",
    "americana",
    738 + ((i * 61) % 145),
    250 + ((i * 83) % 200),
    100,
    100,
    3,
  );
cutout("wing-left", "americana", -6, { origin: "96% 47%" });
cutout("wing-right", "americana", -6, { origin: "4% 47%" });
cutout("eagle-body", "americana", -10);

// Foreground fronds pass faster than the printed animals and signs behind.
ring("palm", "garden", 9, 620, 340, -8, 0.1);
ring("palm-frond", "garden", 6, 570, 340, -18, 0.29);
ring("orange", "garden", 8, 430, 125, -9, 0.4);
ring("blossom", "garden", 9, 420, 75, -12, 0.3);
add("gold-snake", "garden", 920, 160, 300, 370, 8);
add("gold-snake", "garden", 160, 80, 220, 280, 8, { flip: true });
add("tiger", "garden", 1180, 330, 460, 630, -12);
add("tiger", "garden", 20, 380, 330, 460, 12, { flip: true });
add("rifle-boy", "garden", 350, 460, 430, 600, -12);
add("rifle-boy", "garden", 1480, 540, 340, 475, 14, { flip: true });
add("leaf-sign", "garden", 390, 350, 510, 630, 24, { rotation: -14 });
add("leaf-sign", "garden", 1160, 360, 500, 620, 24, { rotation: 14 });

ring("cloud", "architecture", 8, 400, 380, 18, 0.3);
ring("palm", "architecture", 6, 730, 290, 12);
add("arch", "architecture", 800, 435, 1040, 1120, -6);
add("statue", "architecture", 250, 570, 230, 590, 6);
add("statue", "architecture", 1330, 570, 230, 590, 6, { flip: true });
add("greyhound", "architecture", 1190, 660, 280, 240, 8);
add("gold-coin", "architecture", 420, 300, 160, 160, -12);
add("gold-coin", "architecture", 1230, 330, 150, 150, -12);

// Frame and necks stay one illustration, with small differences in parallax.
ring("palm", "flamingos", 6, 680, 210, 14, 0.2);
ring("cloud", "flamingos", 7, 520, 470, 20, 0.4);
add("panorama", "flamingos", 800, 450, 1800, 1020, 26);
add("portal", "flamingos", 800, 440, 870, 870, -4);
add("medallion", "flamingos", 800, 440, 870, 870, 1);
cutout("flamingo-left", "flamingos", -10, { origin: "50% 95%" });
cutout("flamingo-right", "flamingos", -9, { origin: "50% 95%" });
add("greyhound", "flamingos", 1320, 630, 300, 270, 4);
add("reading-woman", "flamingos", 160, 590, 370, 680, -3);
add("statue", "flamingos", 1450, 360, 200, 580, 12);
add("statue", "flamingos", 220, 400, 180, 500, 12, { flip: true });
ring("blossom", "flamingos", 8, 510, 100, -8, 0.2);

ring("poster", "chaos", 8, 570, 800, 20, 0.2);
ring("portal", "chaos", 1, 0, 1260, 25);
ring("flame", "chaos", 13, 300, 290, 5, 0.15);
ring("gold-coin", "chaos", 7, 440, 145, -8, 0.1);
ring("blossom", "chaos", 5, 540, 110, 8);
cutout("skull", "chaos", 3);
cutout("pug", "chaos", 4);
cutout("woman-left", "chaos", -4);
cutout("woman-right", "chaos", -3);
cutout("freedom-man", "chaos", -6);
add("wing-left", "chaos", 690, 265, 700, 390, 8, { rotation: 34 });
add("wing-right", "chaos", 1060, 265, 690, 390, 8, { rotation: -34 });
add("revolver", "chaos", 1015, 115, 450, 155, -8, { rotation: -34 });

export const PIECES = pieces;
export const VECTOR_ASSETS = [
  ...new Set(PIECES.map((piece) => `/fun/gta-vi/objects/${piece.kind}.svg`)),
];

/** Numeric poses are shared by playback and seeking; no browser layer timing. */
export interface WorldPose {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}
export interface PiecePose {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}
const referenceCameras = new Map(
  WORLDS.map((world) => [world.id, cameraAt(world.referenceFrame)]),
);
const sizes = new Map(
  WORLDS.map((world) => [
    world.id,
    (world.distance - referenceCameras.get(world.id)!.z) / FOCAL_LENGTH,
  ]),
);
const beats: Record<string, [number, number]> = {
  americana: [114, 218],
  garden: [218, 334],
  architecture: [334, 400],
  flamingos: [400, 484],
  chaos: [484, 661],
};
export function worldPoseAt(
  world: World,
  frame: number,
  reduced = false,
): WorldPose {
  if (reduced) {
    const [start, end] = beats[world.id];
    return {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity:
        ramp(start, start + 12, frame) * (1 - ramp(end - 12, end, frame)),
    };
  }
  const view = project(world.distance, frame);
  const scale = view.scale * sizes.get(world.id)!;
  return {
    x: (800 - view.x) * scale,
    y: (450 - view.y) * scale,
    rotation: view.roll,
    scale,
    opacity:
      view.opacity *
      (world.id === "chaos" ? ramp(1750, 2050, view.z) : 1) *
      (world.id === "flamingos" ? ramp(175, 300, view.gap) : 1) *
      (world.id === "architecture" ? ramp(220, 480, view.gap) : 1),
  };
}
export function piecePoseAt(
  piece: Piece,
  frame: number,
  reduced = false,
  camera = cameraAt(frame),
): PiecePose {
  if (reduced)
    return {
      x: 0,
      y: 0,
      rotation: piece.rotation,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  const world = worlds.get(piece.world)!;
  const gap = Math.max(120, world.distance - camera.z);
  const ratio = gap / Math.max(70, gap + piece.depth * 5);
  let x = (piece.x - camera.x) * (ratio - 1),
    y = (piece.y - camera.y) * (ratio - 1);
  let rotation = piece.rotation,
    sy = ratio,
    tilt = 0;
  const t = frame / FPS,
    phase = piece.x * 0.017 + piece.y * 0.013;
  // Position follows the lens on both journeys; local motion continues while
  // the camera lingers. Using a saturated entrance ramp here froze the rings.
  const flight = Math.atan(
    (camera.z - referenceCameras.get(world.id)!.z) / 900,
  );
  if (piece.orbit) {
    const { theta, radius, direction } = piece.orbit;
    const drift = Math.sin(t * 0.55 + theta) * 0.035;
    const turn = (flight * 0.16 + drift) * direction;
    const angle = theta + turn;
    const breathing = 1 + Math.sin(t * 0.8 + theta * 2) * 0.014;
    x += (Math.cos(angle) * breathing - Math.cos(theta)) * radius;
    y += (Math.sin(angle) * breathing - Math.sin(theta)) * radius * 0.75;
    rotation += (turn * 180) / Math.PI;
  }
  if (piece.kind === "palm" || piece.kind === "palm-frond") {
    rotation +=
      Math.sin(t * 1.15 + phase) * 3.2 + Math.sin(t * 1.9 + phase * 0.7) * 0.9;
    x += Math.sin(t * 0.85 + phase) * 7;
    y += Math.cos(t * 1.1 + phase) * 4;
    sy *= 1 + Math.sin(t * 1.3 + phase) * 0.018;
  } else if (piece.kind === "flame") {
    sy *=
      1 + Math.sin(t * 6 + phase) * 0.065 + Math.sin(t * 10.7 + phase) * 0.02;
    rotation += Math.sin(t * 3.2 + phase) * 2.2;
    y += Math.sin(t * 4.3 + phase) * 5;
  } else if (piece.kind === "gold-coin") {
    tilt = Math.sin(t * 1.35 + phase) * 32;
    rotation += Math.sin(t * 0.85 + phase) * 8;
    y += Math.sin(t * 1.2 + phase) * 9;
  } else if (piece.kind === "orange" || piece.kind === "blossom") {
    x += Math.sin(t * 0.95 + phase) * 5;
    y += Math.cos(t * 1.25 + phase) * 8;
    rotation += Math.sin(t * 0.8 + phase) * 5;
  } else if (piece.kind === "gold-snake") {
    rotation += Math.sin(t * 0.9 + phase) * 3;
    x += Math.sin(t * 1.2 + phase) * 9;
    y += Math.cos(t * 0.8 + phase) * 8;
  } else if (
    piece.kind === "flamingo-left" ||
    piece.kind === "flamingo-right"
  ) {
    const side = piece.kind === "flamingo-left" ? 1 : -1;
    rotation += Math.sin(t * 1.1 + side * 0.6) * 1.6 * side;
    y += Math.sin(t * 1.1 + side * 0.6) * 3;
  } else if (piece.kind === "wing-left" || piece.kind === "wing-right") {
    rotation +=
      (piece.kind === "wing-left" ? 1 : -1) *
      (Math.sin(t * 1.1) * 1.4 + flight * 2.2);
    sy *= 1 + Math.sin(t * 1.1) * 0.012;
  }
  const opacity =
    piece.kind === "medallion" || piece.kind === "panorama"
      ? ramp(
          piece.kind === "panorama" ? 400 : 450,
          piece.kind === "panorama" ? 850 : 750,
          world.distance - camera.z,
        )
      : 1;
  return {
    x,
    y,
    rotation,
    scaleX: ratio * Math.cos((tilt * Math.PI) / 180),
    scaleY: sy,
    opacity,
  };
}
