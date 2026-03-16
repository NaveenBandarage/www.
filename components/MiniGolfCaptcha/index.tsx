import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MiniGolfCaptchaProps {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

interface Vec2 {
  x: number;
  y: number;
}

interface Course {
  ball: Vec2;
  hole: Vec2;
  obstacles: { x: number; y: number; w: number; h: number }[];
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

const CANVAS_W = 320;
const CANVAS_H = 400;
const BALL_R = 8;
const HOLE_R = 12;
const FRICTION = 0.985;
const MIN_SPEED = 0.15;
const MAX_POWER = 18;
const MAX_ATTEMPTS = 3;

const CONFETTI_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
];

// --- Sound synthesis via Web Audio API ---
let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedAudioCtx && sharedAudioCtx.state !== "closed") {
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  }
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  sharedAudioCtx = new AC();
  return sharedAudioCtx;
}

function playHitSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Short percussive "thwack"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
  // Add a noise burst for the "click"
  const bufferSize = ctx.sampleRate * 0.04;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

function playBounceSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

function playSinkSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Descending "plop" tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(600, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.3);

  // Victory chime after the plop
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + 0.3 + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

function generateCourse(): Course {
  const ball: Vec2 = { x: CANVAS_W / 2, y: CANVAS_H - 60 };
  const hole: Vec2 = {
    x: 80 + Math.random() * (CANVAS_W - 160),
    y: 50 + Math.random() * 40,
  };

  const obstacles: Course["obstacles"] = [];
  const count = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const w = 50 + Math.random() * 60;
    const h = 12 + Math.random() * 10;
    const x = 30 + Math.random() * (CANVAS_W - 60 - w);
    const y = 120 + Math.random() * (CANVAS_H - 240);
    obstacles.push({ x, y, w, h });
  }

  return { ball, hole, obstacles };
}

function dist(a: Vec2, b: Vec2) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function spawnFullscreenConfetti(): Confetti[] {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const particles: Confetti[] = [];
  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      r: 3 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      life: 1,
    });
  }
  return particles;
}

export function MiniGolfCaptcha({ open, onSuccess, onClose }: MiniGolfCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [course, setCourse] = useState<Course>(generateCourse);
  const [attempt, setAttempt] = useState(1);
  const [status, setStatus] = useState<"aiming" | "rolling" | "sunk" | "failed">("aiming");
  const [dragStart, setDragStart] = useState<Vec2 | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Vec2 | null>(null);

  const ballPos = useRef<Vec2>({ ...course.ball });
  const ballVel = useRef<Vec2>({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);
  const confettiAnimRef = useRef<number>(0);
  const prevBouncingRef = useRef({ walls: false, obstacles: false });

  // Reset when opening or new course
  useEffect(() => {
    if (open) {
      const c = generateCourse();
      setCourse(c);
      ballPos.current = { ...c.ball };
      ballVel.current = { x: 0, y: 0 };
      setAttempt(1);
      setStatus("aiming");
      setDragStart(null);
      setDragCurrent(null);
      confettiRef.current = [];
    }
  }, [open]);

  const newChallenge = useCallback(() => {
    const c = generateCourse();
    setCourse(c);
    ballPos.current = { ...c.ball };
    ballVel.current = { x: 0, y: 0 };
    setAttempt(1);
    setStatus("aiming");
    confettiRef.current = [];
  }, []);

  // Drawing & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    const loop = () => {
      if (!running) return;

      const bp = ballPos.current;
      const bv = ballVel.current;

      // Physics
      if (status === "rolling") {
        bp.x += bv.x;
        bp.y += bv.y;
        bv.x *= FRICTION;
        bv.y *= FRICTION;

        // Wall bounces
        let wallBounced = false;
        if (bp.x - BALL_R < 0) { bp.x = BALL_R; bv.x *= -0.7; wallBounced = true; }
        if (bp.x + BALL_R > CANVAS_W) { bp.x = CANVAS_W - BALL_R; bv.x *= -0.7; wallBounced = true; }
        if (bp.y - BALL_R < 0) { bp.y = BALL_R; bv.y *= -0.7; wallBounced = true; }
        if (bp.y + BALL_R > CANVAS_H) { bp.y = CANVAS_H - BALL_R; bv.y *= -0.7; wallBounced = true; }

        if (wallBounced && !prevBouncingRef.current.walls) {
          playBounceSound();
        }
        prevBouncingRef.current.walls = wallBounced;

        // Obstacle collisions
        let obsBounced = false;
        for (const obs of course.obstacles) {
          const closestX = Math.max(obs.x, Math.min(bp.x, obs.x + obs.w));
          const closestY = Math.max(obs.y, Math.min(bp.y, obs.y + obs.h));
          const dx = bp.x - closestX;
          const dy = bp.y - closestY;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < BALL_R) {
            if (d > 0) {
              bp.x += (dx / d) * (BALL_R - d);
              bp.y += (dy / d) * (BALL_R - d);
            }
            if (Math.abs(dx) > Math.abs(dy)) {
              bv.x *= -0.7;
            } else {
              bv.y *= -0.7;
            }
            obsBounced = true;
          }
        }

        if (obsBounced && !prevBouncingRef.current.obstacles) {
          playBounceSound();
        }
        prevBouncingRef.current.obstacles = obsBounced;

        // Check hole
        if (dist(bp, course.hole) < HOLE_R) {
          setStatus("sunk");
          bv.x = 0;
          bv.y = 0;
          bp.x = course.hole.x;
          bp.y = course.hole.y;
          playSinkSound();
          confettiRef.current = spawnFullscreenConfetti();
        }

        // Ball stopped
        const speed = Math.sqrt(bv.x ** 2 + bv.y ** 2);
        if (speed < MIN_SPEED && status === "rolling") {
          bv.x = 0;
          bv.y = 0;
          if (dist(bp, course.hole) >= HOLE_R) {
            if (attempt >= MAX_ATTEMPTS) {
              setStatus("failed");
            } else {
              setAttempt((a) => a + 1);
              setStatus("aiming");
            }
          }
        }
      }

      // --- Draw ---
      // Background
      ctx.fillStyle = "#15803d";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle green texture lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let y = 0; y < CANVAS_H; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // Border
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, CANVAS_W - 4, CANVAS_H - 4);

      // Obstacles
      for (const obs of course.obstacles) {
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        const r = 4;
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, r);
        ctx.fill();
        ctx.strokeStyle = "#713f12";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Hole
      ctx.beginPath();
      ctx.arc(course.hole.x, course.hole.y, HOLE_R + 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(course.hole.x, course.hole.y, HOLE_R, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();

      // Flag
      ctx.strokeStyle = "#d4d4d4";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(course.hole.x, course.hole.y);
      ctx.lineTo(course.hole.x, course.hole.y - 28);
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(course.hole.x, course.hole.y - 28);
      ctx.lineTo(course.hole.x + 14, course.hole.y - 22);
      ctx.lineTo(course.hole.x, course.hole.y - 16);
      ctx.fill();

      // Aim line
      if (status === "aiming" && dragStart && dragCurrent) {
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER * 6);
        const angle = Math.atan2(dy, dx);

        // Direction line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(
          bp.x + Math.cos(angle) * power * 0.8,
          bp.y + Math.sin(angle) * power * 0.8,
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Power indicator
        const powerPct = power / (MAX_POWER * 6);
        const barW = 6;
        const barH = 60;
        const barX = CANVAS_W - 20;
        const barY = CANVAS_H - 80;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(barX, barY, barW, barH);
        const green = Math.round(255 * (1 - powerPct));
        const red = Math.round(255 * powerPct);
        ctx.fillStyle = `rgb(${red},${green},80)`;
        ctx.fillRect(barX, barY + barH * (1 - powerPct), barW, barH * powerPct);
      }

      // Ball (skip if sunk)
      if (status !== "sunk") {
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, BALL_R, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#d4d4d4";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Dimple detail
        ctx.beginPath();
        ctx.arc(bp.x - 2, bp.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [open, course, status, attempt, dragStart, dragCurrent]);

  // Fullscreen confetti animation
  useEffect(() => {
    if (status !== "sunk" || confettiRef.current.length === 0) return;

    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      if (!running) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      confettiRef.current = confettiRef.current
        .map((c) => ({
          ...c,
          x: c.x + c.vx,
          y: c.y + c.vy,
          vy: c.vy + 0.12,
          vx: c.vx * 0.995 + (Math.random() - 0.5) * 0.3,
          rotation: c.rotation + c.rotationSpeed,
          life: c.life - 0.005,
        }))
        .filter((c) => c.life > 0 && c.y < window.innerHeight + 20);

      for (const c of confettiRef.current) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, c.life);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.r / 2, -c.r, c.r, c.r * 2);
        ctx.restore();
      }

      if (confettiRef.current.length > 0) {
        confettiAnimRef.current = requestAnimationFrame(loop);
      }
    };

    confettiAnimRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(confettiAnimRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [status]);

  // Pointer events
  const getCanvasPos = useCallback((e: React.PointerEvent): Vec2 => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (status !== "aiming") return;
      const pos = getCanvasPos(e);
      if (dist(pos, ballPos.current) < 40) {
        setDragStart(pos);
        setDragCurrent(pos);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [status, getCanvasPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart) return;
      setDragCurrent(getCanvasPos(e));
    },
    [dragStart, getCanvasPos],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragStart || !dragCurrent) return;

    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 6, MAX_POWER);
    const angle = Math.atan2(dy, dx);

    if (power > 0.5) {
      ballVel.current = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
      };
      playHitSound();
      setStatus("rolling");
    }

    setDragStart(null);
    setDragCurrent(null);
  }, [dragStart, dragCurrent]);

  if (!open) return null;

  return (
    <>
    {/* Fullscreen confetti canvas */}
    <canvas
      ref={confettiCanvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ width: "100vw", height: "100vh" }}
    />
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            {/* Header */}
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
                    Mini Golf Challenge
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Putt the ball into the hole to view email
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {attempt}/{MAX_ATTEMPTS}
                </span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex justify-center bg-neutral-50 p-5 dark:bg-neutral-800/50">
              <canvas
                ref={canvasRef}
                style={{ width: "100%", maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W}/${CANVAS_H}`, borderRadius: 8, cursor: status === "aiming" ? "crosshair" : "default", touchAction: "none" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
              {status === "aiming" && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Drag from the ball to aim & shoot
                </p>
              )}
              {status === "rolling" && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Rolling...
                </p>
              )}
              {status === "sunk" && (
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  Nice putt! Verification complete.
                </p>
              )}
              {status === "failed" && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  Out of attempts
                </p>
              )}

              <div className="flex gap-2">
                {status === "failed" && (
                  <button
                    onClick={newChallenge}
                    className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    New Challenge
                  </button>
                )}
                {status === "sunk" && (
                  <button
                    onClick={onSuccess}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
