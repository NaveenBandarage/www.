// A temporary, textured trace through the memory landscape.
export function createPaintTrail(viewport) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "paint-trail";
  canvas.setAttribute("aria-hidden", "true");
  viewport.prepend(canvas);
  const context = canvas.getContext("2d");
  if (!context) return;

  // Dry-brush marks: broken, parallel bristles with flecks of paper showing through.
  const palette = ["#eaaa8d", "#80b6c5", "#d7ad59", "#a6ac6c"];
  const sprites = palette.map((color) =>
    Array.from({ length: 5 }, () => {
      const sprite = document.createElement("canvas");
      sprite.width = 120;
      sprite.height = 64;
      const brush = sprite.getContext("2d");
      brush.fillStyle = color;
      for (let i = 0; i < 280; i++) {
        const y = Math.random() * 58 + 3;
        const edge = Math.abs(y - 32) / 32;
        if (Math.random() < edge * edge * 0.8) continue;
        const x = Math.random() * 110 + 5;
        brush.globalAlpha = 0.25 + Math.random() * 0.65;
        brush.fillRect(x, y, 2 + Math.random() * 19, 0.4 + Math.random() * 1.5);
      }
      return sprite;
    }),
  );

  let patches = [];
  let pointer = null;
  let frame = 0;
  let width = 0;
  let height = 0;
  const lifetime = 18000;
  let colorIndex = Math.floor(Math.random() * palette.length);

  function resize() {
    const rect = viewport.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (patches.length && !frame) frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    context.clearRect(0, 0, width, height);
    patches = patches.filter((patch) => now - patch.time < lifetime);
    for (const patch of patches) {
      const age = now - patch.time;
      const fade =
        Math.min(1, age / 180) * Math.min(1, (lifetime - age) / 4500);
      context.globalAlpha = 0.24 * fade;
      context.save();
      context.translate(patch.x, patch.y);
      context.rotate(patch.angle);
      context.drawImage(
        patch.sprite,
        -patch.width / 2,
        -patch.height / 2,
        patch.width,
        patch.height,
      );
      context.restore();
    }
    context.globalAlpha = 1;
    if (patches.length) frame = requestAnimationFrame(draw);
  }

  function paint(x, y, angle) {
    const variants = sprites[colorIndex];
    patches.push({
      x,
      y,
      angle,
      width: 48 + Math.random() * 18,
      height: 24 + Math.random() * 12,
      sprite: variants[Math.floor(Math.random() * variants.length)],
      time: performance.now(),
    });
    if (patches.length > 180) patches.splice(0, patches.length - 180);
    if (!frame) frame = requestAnimationFrame(draw);
  }

  viewport.addEventListener("pointermove", (event) => {
    if (
      motion.matches ||
      (event.pointerType === "touch" && !event.buttons) ||
      event.target.closest("button, input, a, .floating-panel")
    ) {
      pointer = null;
      return;
    }
    if (!pointer || pointer.id !== event.pointerId) {
      colorIndex = (colorIndex + 1) % palette.length;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      return;
    }
    const distance = Math.hypot(
      event.clientX - pointer.x,
      event.clientY - pointer.y,
    );
    if (distance < 12) return;
    const rect = viewport.getBoundingClientRect();
    const steps = Math.min(10, Math.floor(distance / 12));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      paint(
        pointer.x + (event.clientX - pointer.x) * t - rect.left,
        pointer.y + (event.clientY - pointer.y) * t - rect.top,
        Math.atan2(event.clientY - pointer.y, event.clientX - pointer.x),
      );
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  const stop = () => {
    pointer = null;
  };
  viewport.addEventListener("pointerleave", stop);
  viewport.addEventListener("pointercancel", stop);
  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    pointer = null;
    patches = [];
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    context.clearRect(0, 0, width, height);
  });
  new ResizeObserver(resize).observe(viewport);
  resize();
}
