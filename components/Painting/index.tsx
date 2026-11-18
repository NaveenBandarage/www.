import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import useReducedMotion from "../../lib/useReducedMotion";

type Mark = {
  x: number;
  y: number;
  size: number;
  angle: number;
  color: [number, number, number];
  seed: number;
  base: boolean;
};

const WIDTH = 600;
const HEIGHT = 750;

function sampleScene(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#b5cbe0";
  c.fillRect(0, 0, WIDTH, HEIGHT);
  c.fillStyle = "#e8d6bd";
  c.fillRect(0, 525, WIDTH, 225);
  // A quiet still life, built from simple shapes so the paint supplies the detail.
  c.fillStyle = "#d58b75";
  c.beginPath();
  c.ellipse(300, 530, 170, 25, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#f1e4c9";
  c.beginPath();
  c.moveTo(220, 359);
  c.lineTo(380, 359);
  c.lineTo(355, 535);
  c.quadraticCurveTo(300, 555, 245, 535);
  c.closePath();
  c.fill();
  c.fillStyle = "#cb967c";
  c.fillRect(220, 360, 160, 12);
  const flowers = [
    [260, 285, "#e8a5a7"],
    [315, 250, "#e8bc79"],
    [356, 300, "#e7a28a"],
    [215, 322, "#efc0b1"],
    [302, 330, "#d27f78"],
    [389, 335, "#ecd0a0"],
    [250, 220, "#f1c7b9"],
    [360, 225, "#d9988c"],
  ] as const;
  c.strokeStyle = "#738e70";
  c.lineWidth = 9;
  flowers.forEach(([x, y]) => {
    c.beginPath();
    c.moveTo(300, 390);
    c.lineTo(x, y);
    c.stroke();
  });
  flowers.forEach(([x, y, color], i) => {
    c.fillStyle = color;
    for (let j = 0; j < 7; j++) {
      const a = (j / 7) * Math.PI * 2 + i;
      c.beginPath();
      c.ellipse(
        x + Math.cos(a) * 20,
        y + Math.sin(a) * 17,
        23,
        17,
        a,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    c.fillStyle = "#d6a365";
    c.beginPath();
    c.arc(x, y, 9, 0, Math.PI * 2);
    c.fill();
  });
  return canvas;
}

function makeMarks(source: HTMLCanvasElement): Mark[] {
  const ctx = source.getContext("2d", { willReadFrequently: true })!;
  const data = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
  const marks: Mark[] = [];
  // Large underpainting first, then shorter knife marks and fine ridges.
  for (const [step, size] of [
    [24, 34],
    [11, 19],
    [6, 10],
  ] as const) {
    const layer: Mark[] = [];
    for (let y = 0; y < HEIGHT; y += step)
      for (let x = 0; x < WIDTH; x += step) {
        const px = Math.min(
          WIDTH - 1,
          Math.max(
            0,
            Math.floor(x + (step === 24 ? 0 : (Math.random() - 0.5) * step)),
          ),
        );
        const py = Math.min(
          HEIGHT - 1,
          Math.max(
            0,
            Math.floor(y + (step === 24 ? 0 : (Math.random() - 0.5) * step)),
          ),
        );
        const index = (py * WIDTH + px) * 4;
        layer.push({
          x: px,
          y: py,
          size: size * (0.7 + Math.random() * 0.65),
          angle: (Math.random() - 0.5) * 2,
          color: [data[index], data[index + 1], data[index + 2]],
          seed: Math.random(),
          base: step === 24,
        });
      }
    // Paint adjacent areas together, with a little irregularity in the order.
    layer.sort((a, b) => a.y + a.seed * 80 - (b.y + b.seed * 80));
    marks.push(...layer);
  }
  return marks;
}

function paintMark(c: CanvasRenderingContext2D, mark: Mark) {
  const {
    x,
    y,
    size,
    angle,
    color: [r, g, b],
    seed,
  } = mark;
  const rgb = (shift: number, alpha = 1) =>
    `rgba(${Math.max(0, Math.min(255, r + shift))},${Math.max(0, Math.min(255, g + shift))},${Math.max(0, Math.min(255, b + shift))},${alpha})`;
  if (mark.base) {
    c.fillStyle = rgb(0);
    c.fillRect(x, y, 25, 25);
    return;
  }
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  const w = size,
    h = size * (0.4 + seed * 0.28);
  c.fillStyle = rgb(-18, 0.28);
  c.beginPath();
  c.moveTo(-w * 0.5, -h * 0.34 + 2);
  c.lineTo(w * 0.36, -h * 0.5 + 2);
  c.lineTo(w * 0.52, h * 0.24 + 2);
  c.lineTo(-w * 0.38, h * 0.52 + 2);
  c.closePath();
  c.fill();
  c.fillStyle = rgb(0);
  c.beginPath();
  c.moveTo(-w * 0.5, -h * 0.34);
  c.lineTo(w * 0.33, -h * 0.5);
  c.lineTo(w * 0.5, -h * 0.16);
  c.lineTo(w * 0.43, h * 0.3);
  c.lineTo(-w * 0.38, h * 0.5);
  c.closePath();
  c.fill();
  c.strokeStyle = rgb(32, 0.37);
  c.lineWidth = Math.max(0.6, size * 0.055);
  c.beginPath();
  c.moveTo(-w * 0.4, -h * 0.25);
  c.lineTo(w * 0.31, -h * 0.39);
  c.stroke();
  c.strokeStyle = rgb(-25, 0.22);
  c.lineWidth = Math.max(0.5, size * 0.035);
  c.beginPath();
  c.moveTo(-w * 0.3, h * 0.18);
  c.lineTo(w * 0.32, h * 0.04);
  c.stroke();
  c.restore();
}

export default function Painting() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const source = useRef<HTMLCanvasElement | null>(null);
  const frame = useRef(0);
  const loadId = useRef(0);
  const [painting, setPainting] = useState(false);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  const render = useCallback(
    (image: HTMLCanvasElement) => {
      cancelAnimationFrame(frame.current);
      const c = canvas.current?.getContext("2d");
      if (!c) return;
      const marks = makeMarks(image);
      c.fillStyle = "#f6f3ed";
      c.fillRect(0, 0, WIDTH, HEIGHT);
      if (reducedMotion) {
        marks.forEach((mark) => paintMark(c, mark));
        setPainting(false);
        return;
      }
      setPainting(true);
      let start = 0,
        drawn = 0;
      const tick = (time: number) => {
        if (!start) start = time;
        const progress = Math.min(1, (time - start) / 10000);
        const target = Math.floor(progress * marks.length);
        while (drawn < target) paintMark(c, marks[drawn++]);
        if (progress < 1) frame.current = requestAnimationFrame(tick);
        else setPainting(false);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [reducedMotion],
  );

  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    source.current ??= sampleScene();
    render(source.current);
    return () => cancelAnimationFrame(frame.current);
  }, [render]);

  useEffect(() => {
    const activeLoad = loadId;
    return () => {
      activeLoad.current++;
    };
  }, []);

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const id = ++loadId.current;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (id !== loadId.current) return;
      const next = document.createElement("canvas");
      next.width = WIDTH;
      next.height = HEIGHT;
      const c = next.getContext("2d")!;
      c.fillStyle = "#f6f3ed";
      c.fillRect(0, 0, WIDTH, HEIGHT);
      const scale = Math.max(WIDTH / image.width, HEIGHT / image.height);
      const w = image.width * scale,
        h = image.height * scale;
      c.drawImage(image, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
      source.current = next;
      setError("");
      renderRef.current(next);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      if (id === loadId.current)
        setError("That image couldn’t be opened. Please try another.");
    };
    image.src = url;
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
        <label className="cursor-pointer rounded-full bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
          Choose a photo
          <input
            type="file"
            accept="image/*"
            onChange={upload}
            className="sr-only"
          />
        </label>
        <button
          type="button"
          onClick={() => source.current && render(source.current)}
          className="link-fade text-neutral-600 dark:text-silver-dark"
        >
          Paint again
        </button>
        <button
          type="button"
          onClick={() => {
            const a = document.createElement("a");
            a.download = "painting.png";
            a.href = canvas.current!.toDataURL("image/png");
            a.click();
          }}
          disabled={painting}
          className="link-fade text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-silver-dark"
        >
          Save image
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-8 flex justify-center bg-[#f8f7f4] px-6 py-10 sm:px-12 sm:py-14 dark:bg-neutral-900">
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          className="h-auto w-full max-w-[420px] bg-[#f6f3ed] shadow-sm"
          role="img"
          aria-label="A photo interpreted as a palette knife painting"
        />
      </div>
      <p
        className="mt-4 text-sm text-neutral-500 dark:text-silver-dark"
        aria-live="polite"
      >
        {painting
          ? "Painting…"
          : "Your photo stays on your device. Portrait crops work best."}
      </p>
    </div>
  );
}
