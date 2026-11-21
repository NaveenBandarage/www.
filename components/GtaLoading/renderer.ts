import { cameraAt, irisAt, STAR_PATH } from "./motion";
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
const shutterBuffers = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();

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
  const speed = Math.abs(cameraAt(frame + 0.5).z - cameraAt(frame - 0.5).z);
  if (!reduced && speed > 65 && frame > 111 && frame < 670) {
    // Two short shutter samples soften the fast fly-throughs. Only the rush
    // uses a second pass; the longer scenic passages remain one draw per tick.
    let buffer = shutterBuffers.get(canvas);
    if (!buffer) {
      buffer = document.createElement("canvas");
      shutterBuffers.set(canvas, buffer);
    }
    if (buffer.width !== pixelWidth || buffer.height !== pixelHeight) {
      buffer.width = pixelWidth;
      buffer.height = pixelHeight;
    }
    const buffered = buffer.getContext("2d", { alpha: false });
    if (buffered) {
      paintArtwork(ctx, width, height, dpr, frame - 0.5, reduced);
      paintArtwork(buffered, width, height, dpr, frame, reduced);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.78;
      ctx.drawImage(buffer, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }
  }
  paintArtwork(ctx, width, height, dpr, frame, reduced);
}

function paintArtwork(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  frame: number,
  reduced: boolean,
) {
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
    const iris = irisAt(frame);
    irisScale = iris.scale;
    irisOpacity = iris.opacity;
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
    const glow = ctx.createLinearGradient(
      800 - 800 * irisScale,
      450 - 800 * irisScale,
      800 + 800 * irisScale,
      450 + 800 * irisScale,
    );
    glow.addColorStop(0, "#ffc477");
    glow.addColorStop(0.45, "#ff9cce");
    glow.addColorStop(1, "#b645f5");
    ctx.strokeStyle = glow;
    ctx.lineWidth = 12 * irisScale;
    ctx.shadowColor = "#d954dd";
    ctx.shadowBlur = 9 * dpr * fit;
    ctx.stroke(aperture);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
