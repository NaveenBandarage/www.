import { cameraAt, STAR_PATH } from "./motion";
import {
  PIECES,
  WORLDS,
  VECTOR_ASSETS,
  worldPoseAt,
  piecePoseAt,
} from "./sequence";

interface Sprite {
  image: HTMLCanvasElement;
  width: number;
  height: number;
}
const sprites = new Map<string, Sprite>();
let prepared: Promise<void> | null = null;

/** Rasterize each authored SVG once. Playback only blits cached sprites. */
export function prepareArtwork(): Promise<void> {
  if (prepared) return prepared;
  prepared = Promise.all(
    VECTOR_ASSETS.map(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const longest = 1024;
      const ratio = longest / Math.max(image.naturalWidth, image.naturalHeight);
      const surface = document.createElement("canvas");
      surface.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      surface.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = surface.getContext("2d");
      if (!context) throw new Error("Canvas rendering is unavailable.");
      context.drawImage(image, 0, 0, surface.width, surface.height);
      sprites.set(src, {
        image: surface,
        width: surface.width,
        height: surface.height,
      });
    }),
  )
    .then(() => undefined)
    .catch((error) => {
      prepared = null;
      throw error;
    });
  return prepared;
}

const scenes = [...WORLDS].reverse().map((world) => ({
  world,
  pieces: PIECES.filter((piece) => piece.world === world.id)
    .sort((a, b) => b.depth - a.depth)
    .map((piece) => ({
      piece,
      src: `/fun/gta-vi/objects/${piece.kind}.svg`,
      origin: (piece.origin ?? "50% 50%").split(" ").map(parseFloat),
    })),
}));
const RAD = Math.PI / 180;

export function drawScene(
  canvas: HTMLCanvasElement,
  frame: number,
  reduced: boolean,
): void {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const width = canvas.clientWidth,
    height = canvas.clientHeight;
  if (!width || !height) return;
  // Keep the drawing buffer bounded even on very large or high-DPI displays.
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2,
    Math.sqrt(5_000_000 / (width * height)),
  );
  const pixelWidth = Math.round(width * dpr),
    pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#211f2d";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const fit = Math.max(width / 1600, height / 900);
  ctx.translate(width / 2, height / 2);
  ctx.scale(fit, fit);
  ctx.translate(-800, -450);

  let aperture: Path2D | null = null;
  let irisScale = 4,
    irisOpacity = 0;
  if (!reduced && frame >= 651 && frame < 682) {
    if (frame < 659) {
      const t = (frame - 651) / 8;
      irisScale = 4 + (0.95 - 4) * t;
      irisOpacity = 0.8 * t;
    } else if (frame < 674) {
      const t = (frame - 659) / 15;
      irisScale = 0.95 + (0.008 - 0.95) * t;
      irisOpacity = 0.8 + 0.2 * t;
    } else {
      irisScale = 0.008;
      irisOpacity = 1 - (frame - 674) / 8;
    }
    aperture = new Path2D();
    aperture.addPath(
      new Path2D(STAR_PATH),
      new DOMMatrix()
        .translate(800, 450)
        .scale(100 * irisScale)
        .translate(-12, -12),
    );
  }
  ctx.save();
  if (aperture && frame < 676) ctx.clip(aperture);
  const camera = cameraAt(frame);
  for (const { world, pieces } of scenes) {
    const view = worldPoseAt(world, frame, reduced);
    if (view.opacity < 0.001) continue;
    ctx.save();
    ctx.translate(800 + view.x, 450 + view.y);
    ctx.rotate(view.rotation * RAD);
    ctx.scale(view.scale, view.scale);
    ctx.translate(-800, -450);
    for (const { piece, src, origin } of pieces) {
      const sprite = sprites.get(src);
      if (!sprite) continue;
      const pose = piecePoseAt(piece, frame, reduced, camera);
      if (pose.opacity < 0.001) continue;
      ctx.save();
      ctx.globalAlpha = view.opacity * pose.opacity;
      ctx.translate(piece.x - piece.w / 2, piece.y - piece.h / 2);
      const ox = (origin[0] / 100) * piece.w,
        oy = (origin[1] / 100) * piece.h;
      ctx.translate(ox + pose.x, oy + pose.y);
      ctx.rotate(pose.rotation * RAD);
      ctx.scale(pose.scaleX, pose.scaleY);
      ctx.translate(-ox, -oy);
      if (piece.flip) {
        ctx.translate(piece.w, 0);
        ctx.scale(-1, 1);
      }
      const scale = Math.min(piece.w / sprite.width, piece.h / sprite.height);
      const w = sprite.width * scale,
        h = sprite.height * scale;
      ctx.drawImage(sprite.image, (piece.w - w) / 2, (piece.h - h) / 2, w, h);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
  if (aperture && irisOpacity > 0) {
    ctx.globalAlpha = irisOpacity;
    ctx.strokeStyle = "#f98fdc";
    ctx.lineWidth = 12 * irisScale;
    ctx.shadowColor = "#d954dd";
    ctx.shadowBlur = 9 * dpr * fit;
    ctx.stroke(aperture);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
