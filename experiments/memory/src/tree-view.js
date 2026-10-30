import * as THREE from "three";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const palette = {
  bark: [
    [0.23, 0.22, 0.18],
    [0.35, 0.32, 0.26],
    [0.48, 0.46, 0.37],
    [0.61, 0.6, 0.49],
  ],
  moss: [
    [0.39, 0.67, 0.04],
    [0.52, 0.85, 0.01],
    [0.66, 0.96, 0.0],
    [0.78, 1, 0.03],
    [0.87, 0.98, 0.12],
    [0.49, 0.72, 0.08],
  ],
  pale: [
    [0.67, 0.7, 0.5],
    [0.75, 0.77, 0.6],
    [0.79, 0.82, 0.67],
  ],
};
const vertexShader = `
 attribute vec3 aColor;
 attribute float aSize;
 attribute float aProgress;
 attribute float aPhase;
 uniform float uTime;
 uniform float uReveal;
 uniform float uPixelRatio;
 uniform float uScale;
 uniform float uOpacity;
 uniform float uActive;
 varying vec3 vColor;
 varying float vAlpha;
 void main(){
   vec3 p=position;
   p.y+=sin(p.x*.012+uTime*.58+aPhase*.22)*.65*aProgress;
   p.z+=sin(uTime*.4+aPhase)*.24;
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
   gl_PointSize=clamp(aSize*uPixelRatio*uScale,.7,5.);
   vColor=aColor;
   vAlpha=smoothstep(aProgress-.025,aProgress+.035,uReveal)*uOpacity;
   vColor=mix(vColor,vec3(.58,.87,.03),uActive*.3);
 }`;
const fragmentShader = `
 precision mediump float;
 varying vec3 vColor;
 varying float vAlpha;
 void main(){
   if(vAlpha<.01) discard;
   vec2 p=gl_PointCoord-.5;
   if(max(abs(p.x),abs(p.y))>.48) discard;
   gl_FragColor=vec4(vColor,vAlpha*.9);
 }`;
function makeBranch(spec, scene) {
  const rng = random(spec.seed),
    positions = [],
    colors = [],
    sizes = [],
    progress = [],
    phases = [];
  const curve = new THREE.CatmullRomCurve3(
    spec.points.map(
      ([x, y], i) => new THREE.Vector3(x, y, Math.sin(i * 1.9) * 3),
    ),
    false,
    "catmullrom",
    0.5,
  );
  const length = curve.getLength();
  function point(p, color, size, t) {
    positions.push(p.x, p.y, p.z);
    colors.push(...color);
    sizes.push(size);
    progress.push(t);
    phases.push(rng() * 6.28);
  }
  function sampleBranch(
    path,
    radius,
    count,
    start = 0,
    span = 1,
    isTwig = false,
  ) {
    for (let i = 0; i < count; i++) {
      const t = rng(),
        p = path.getPoint(t),
        tangent = path.getTangent(t),
        normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      const taper = Math.pow(1 - t, 0.8),
        r = radius * (0.12 + 0.88 * taper);
      const angle = rng() * Math.PI * 2;
      const moss = rng() < 0.48 + 0.2 * Math.sin(t * 35 + spec.seed);
      let spread = Math.cos(angle) * r * (moss ? 1.3 : 0.75);
      if (moss) spread = Math.abs(spread) + r * 0.12;
      const cluster = (Math.sin(t * 67 + spec.seed) + Math.sin(t * 139)) * 0.5;
      if (moss) spread += Math.max(0, cluster) * r * 0.9;
      p.addScaledVector(normal, spread);
      p.z += Math.sin(angle) * r * 0.7 + (moss ? 3 : 0);
      p.x += (rng() - 0.5) * (moss ? 3 : 1.3);
      p.y += (rng() - 0.5) * (moss ? 3 : 1.3);
      const set = moss
        ? palette.moss
        : rng() < 0.15
          ? palette.pale
          : palette.bark;
      const color = set[Math.floor(rng() * set.length)];
      point(
        p,
        color,
        (moss ? 0.85 : 0.65) + rng() * (moss ? 1.05 : 0.75),
        start + t * span,
      );
    }
  }
  sampleBranch(
    curve,
    spec.width,
    Math.min(14000, Math.floor(length * spec.width * 1.6)),
  );
  // Fine side shoots share the parent branch's growth front.
  for (let i = 0; i < (spec.owner ? 10 : 14); i++) {
    const t = 0.15 + rng() * 0.78,
      start = curve.getPoint(t),
      direction = curve.getTangent(t);
    const sign = rng() > 0.48 ? 1 : -1,
      angle = (0.32 + rng() * 0.65) * sign;
    const len = (25 + rng() * 80) * (1 - t * 0.4),
      dx = direction.x * Math.cos(angle) - direction.y * Math.sin(angle),
      dy = direction.x * Math.sin(angle) + direction.y * Math.cos(angle);
    const mid = start
      .clone()
      .add(new THREE.Vector3(dx * len * 0.6, dy * len * 0.6, 1));
    const end = start
      .clone()
      .add(new THREE.Vector3(dx * len, dy * len + Math.sin(i) * 12, 3));
    const twig = new THREE.CatmullRomCurve3([start, mid, end]);
    sampleBranch(twig, spec.width * 0.18, Math.floor(len * 2.3), t, 0.13, true);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute(
    "aProgress",
    new THREE.Float32BufferAttribute(progress, 1),
  );
  geometry.setAttribute("aPhase", new THREE.Float32BufferAttribute(phases, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      uScale: { value: 1 },
      uOpacity: { value: 1 },
      uActive: { value: 0 },
    },
  });
  const mesh = new THREE.Points(geometry, material);
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);
  return { ...spec, mesh, reveal: 0, wanted: 1 };
}

export class TreeView {
  constructor(viewport, { onSelect, onFolder, onMore, onZoom }) {
    this.viewport = viewport;
    this.labels = viewport.querySelector("#labels");
    this.edgesEl = viewport.querySelector("#connections");
    this.onSelect = onSelect;
    this.onFolder = onFolder;
    this.onMore = onMore;
    this.onZoom = onZoom;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-500, 500, 300, -300, 0.1, 1000);
    this.camera.position.z = 500;
    this.nodes = [];
    this.branches = new Map();
    this.elements = new Map();
    this.open = new Set();
    this.center = new THREE.Vector2();
    this.target = new THREE.Vector2();
    this.zoom = 1;
    this.targetZoom = 1;
    this.baseScale = 1;
    this.autoFit = true;
    this.highlight = new Set();
    this.selected = null;
    this.links = false;
    this.projection = null;
    this.lastTime = 0;
    this.running = true;
    this.dirty = true;
    this.edgePaths = [];
    this.leaders = new Map();
    this.edgesGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this.leaderGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    this.edgesEl.append(this.edgesGroup, this.leaderGroup);
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      this.renderer.setClearColor(0xfafbf9, 0);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      viewport.prepend(this.renderer.domElement);
      this.renderer.domElement.setAttribute("aria-hidden", "true");
    } catch {
      viewport.querySelector("#webgl-error").hidden = false;
    }
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(viewport);
    this.bindGestures();
    this.resize();
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  setGraph(projection, expanded) {
    this.projection = projection;
    this.open = new Set(expanded);
    this.nodes = projection.nodes;
    const wanted = new Set(projection.branches.map((b) => b.id));
    for (const [id, b] of this.branches) if (!wanted.has(id)) b.wanted = 0;
    for (const spec of projection.branches) {
      const signature = JSON.stringify(spec.points);
      const old = this.branches.get(spec.id);
      if (old && old.signature === signature) {
        old.wanted = 1;
        continue;
      }
      if (old) this.removeBranch(spec.id);
      const b = makeBranch(spec, this.scene);
      b.signature = signature;
      this.branches.set(spec.id, b);
    }
    const ids = new Set(this.nodes.map((n) => n.id));
    for (const [id, el] of this.elements)
      if (!ids.has(id)) {
        el.remove();
        this.elements.delete(id);
        this.leaders.get(id)?.remove();
        this.leaders.delete(id);
      }
    for (const n of this.nodes) {
      let el = this.elements.get(n.id);
      if (!el) {
        el = document.createElement("button");
        el.className = `tree-label ${n.type === "origin" ? "origin" : n.type === "folder" ? "folder" : "leaf"}`;
        el.dataset.id = n.id;
        el.style.opacity = "0";
        el._opacity = 0;
        el.addEventListener("pointerdown", (e) => e.stopPropagation());
        el.onclick = () => {
          const current = this.nodes.find((x) => x.id === n.id);
          if (current.type === "origin") this.fit();
          else if (current.type === "folder") this.onFolder(current);
          else if (current.type === "more") this.onMore(current);
          else this.onSelect(current.id);
        };
        this.labels.append(el);
        this.elements.set(n.id, el);
      }
      el.replaceChildren();
      const text = document.createElement("span");
      text.textContent =
        n.type === "origin"
          ? n.title
          : n.title
              .replace(/\.(md|txt|markdown)$/i, "")
              .replace(/\/$/, "")
              .replaceAll("-", " ");
      el.append(text);
      el.classList.toggle("open", this.open.has(n.id));
      el.classList.toggle(
        "is-stale",
        n.status === "superseded" || n.status === "disputed",
      );
      el.classList.toggle("is-pinned", !!n.pinned);
      el.classList.toggle("is-source", n.type === "source");
      el.title = n.title;
      el.setAttribute(
        "aria-label",
        n.type === "origin"
          ? "Center the memory tree"
          : n.type === "folder"
            ? `${this.open.has(n.id) ? "Close" : "Open"} ${n.title}`
            : n.type === "more"
              ? `Show more in ${n.title}`
              : `Inspect ${n.title}`,
      );
      if (n.type === "folder")
        el.setAttribute("aria-expanded", String(this.open.has(n.id)));
    }
    this.setSelection(this.selected, this.highlight);
    this.buildEdges();
    if (this.autoFit) this.fit();
    this.dirty = true;
  }
  setSelection(selected, highlight = new Set()) {
    this.selected = selected;
    this.highlight = new Set(highlight);
    this.activeOwners = new Set();
    for (const id of this.highlight) {
      let n = this.nodes.find((x) => x.id === id);
      while (n) {
        this.activeOwners.add(n.id);
        n = this.nodes.find((x) => x.id === n.parent);
      }
    }
    for (const [id, el] of this.elements) {
      el.classList.toggle("selected", id === selected);
      el.classList.toggle("is-match", this.highlight.has(id));
      el.classList.toggle(
        "recall-dim",
        this.highlight.size > 0 &&
          !this.activeOwners.has(id) &&
          !el.classList.contains("origin"),
      );
    }
    this.buildEdges();
    this.dirty = true;
  }
  setLinks(show) {
    this.links = show;
    this.buildEdges();
  }
  buildEdges() {
    this.edgesGroup.replaceChildren();
    this.edgePaths = [];
    if (!this.projection) return;
    const edges = this.projection.edges
      .filter(
        (e) =>
          this.links ||
          e.from === this.selected ||
          e.to === this.selected ||
          (this.highlight.has(e.from) && this.highlight.has(e.to)),
      )
      .slice(0, 30);
    for (const e of edges) {
      const a = this.nodes.find((n) => n.id === e.from),
        b = this.nodes.find((n) => n.id === e.to);
      if (!a || !b) continue;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("fill", "none");
      path.setAttribute(
        "stroke",
        e.type === "supersedes" ? "#b1aa8c" : "#9ab27a",
      );
      path.setAttribute("stroke-width", "1");
      path.setAttribute(
        "stroke-dasharray",
        e.type === "supported_by" ? "2 5" : "4 7",
      );
      path.setAttribute("opacity", ".6");
      this.edgesGroup.append(path);
      this.edgePaths.push({ path, a, b });
    }
    this.dirty = true;
  }
  fit() {
    if (!this.nodes.length) return;
    const radiusX = Math.max(
        280,
        ...this.nodes.map((n) => Math.abs(n.x) + 105),
      ),
      radiusY = Math.max(280, ...this.nodes.map((n) => Math.abs(n.y) + 90));
    this.target.set(0, 0);
    this.targetZoom = Math.max(
      0.12,
      Math.min(
        1.15,
        (this.width - 36) / (radiusX * 2 * this.baseScale),
        (this.height - 180) / (radiusY * 2 * this.baseScale),
      ),
    );
    this.autoFit = true;
    this.dirty = true;
  }
  focus(id) {
    const n = this.nodes.find((n) => n.id === id);
    if (!n) return;
    this.target.set(n.x, n.y + 50);
    this.targetZoom = Math.max(0.75, Math.min(1.2, this.targetZoom));
    this.autoFit = false;
    this.dirty = true;
  }
  zoomBy(factor) {
    this.targetZoom = THREE.MathUtils.clamp(this.targetZoom * factor, 0.12, 3);
    this.autoFit = false;
    this.dirty = true;
  }
  resize() {
    const box = this.viewport.getBoundingClientRect();
    this.width = Math.max(1, box.width);
    this.height = Math.max(1, box.height);
    this.baseScale = Math.min(1.12, this.width / 1040);
    if (this.width < 600) this.baseScale = Math.max(0.5, this.width / 750);
    this.renderer?.setSize(this.width, this.height, false);
    this.edgesEl.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    if (this.autoFit) this.fit();
    this.dirty = true;
  }
  tick(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000 || 0.016, 1);
    this.lastTime = now;
    const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * 5),
      moving =
        this.center.distanceTo(this.target) > 0.02 ||
        Math.abs(this.zoom - this.targetZoom) > 0.0001;
    this.center.lerp(this.target, ease);
    this.zoom += (this.targetZoom - this.zoom) * ease;
    const scale = this.baseScale * this.zoom;
    if (moving || this.dirty) {
      this.camera.left = -this.width / 2 / scale;
      this.camera.right = this.width / 2 / scale;
      this.camera.top = this.height / 2 / scale;
      this.camera.bottom = -this.height / 2 / scale;
      this.camera.position.set(this.center.x, this.center.y, 500);
      this.camera.updateProjectionMatrix();
      this.camera.updateMatrixWorld();
      this.onZoom?.(Math.round(this.zoom * 100));
    }
    for (const [id, b] of this.branches) {
      if (reducedMotion) b.reveal = b.wanted;
      else if (
        !b.wanted ||
        !b.parentBranch ||
        (this.branches.get(b.parentBranch)?.reveal || 0) > 0.65
      )
        b.reveal = THREE.MathUtils.clamp(
          b.reveal + dt * (b.wanted ? 0.9 : -2),
          0,
          1,
        );
      b.mesh.visible = b.reveal > 0.001;
      b.mesh.material.uniforms.uReveal.value = b.reveal * 1.05;
      b.mesh.material.uniforms.uTime.value = reducedMotion ? 0 : now / 1000;
      b.mesh.material.uniforms.uScale.value = scale;
      b.mesh.material.uniforms.uOpacity.value =
        this.highlight.size && b.owner && !this.activeOwners.has(b.owner)
          ? 0.23
          : 1;
      b.mesh.material.uniforms.uActive.value = this.activeOwners.has(b.owner)
        ? 1
        : 0;
      if (!b.wanted && b.reveal === 0) this.removeBranch(id);
    }
    this.placeLabels(dt, moving || this.dirty);
    if (moving || this.dirty)
      for (const { path, a, b } of this.edgePaths) {
        const p = this.screen(a),
          q = this.screen(b),
          mid = (p.x + q.x) / 2;
        path.setAttribute(
          "d",
          `M${p.x} ${p.y + 18} C${mid} ${p.y - 45} ${mid} ${q.y - 45} ${q.x} ${q.y + 18}`,
        );
      }
    this.renderer?.render(this.scene, this.camera);
    this.dirty = false;
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  placeLabels(dt, relayout) {
    const dimensions = new Map(
      this.nodes.map((n) => {
        const el = this.elements.get(n.id);
        return [n.id, { w: el.offsetWidth || 120, h: el.offsetHeight || 38 }];
      }),
    );
    const occupied = [],
      ordered = [...this.nodes].sort(
        (a, b) =>
          (b.type === "origin"
            ? 20
            : b.id === this.selected
              ? 10
              : this.highlight.has(b.id)
                ? 6
                : b.type === "folder"
                  ? 3
                  : 0) -
          (a.type === "origin"
            ? 20
            : a.id === this.selected
              ? 10
              : this.highlight.has(a.id)
                ? 6
                : a.type === "folder"
                  ? 3
                  : 0),
      );
    const branchList = [...this.branches.values()];
    for (const n of ordered) {
      const el = this.elements.get(n.id),
        anchor = this.screen(n),
        { w, h } = dimensions.get(n.id),
        owner = branchList.find((b) => b.id === `branch:${n.id}`);
      let x = anchor.x,
        y = anchor.y + (n.type === "origin" ? 18 : 0),
        placed = false;
      const candidates = [
        0, 26, -26, 52, -52, 78, -78, 104, -104, 130, -130, 156, -156, 182,
        -182,
      ];
      if (
        anchor.x > -150 &&
        anchor.x < this.width + 150 &&
        anchor.y > -160 &&
        anchor.y < this.height + 160
      ) {
        if (this.autoFit)
          x = THREE.MathUtils.clamp(x, w / 2 + 8, this.width - w / 2 - 8);
        for (const dy of candidates) {
          const yy = y + dy,
            box = {
              l: x - w / 2 - 5,
              r: x + w / 2 + 5,
              t: yy - 5,
              b: yy + h + 5,
            };
          if (box.t < 8 || box.b > this.height - 12) continue;
          if (
            occupied.some(
              (o) => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t,
            )
          )
            continue;
          y = yy;
          occupied.push(box);
          placed = true;
          break;
        }
      }
      const wanted = placed && (!owner || owner.reveal > 0.85) ? 1 : 0;
      el._opacity +=
        (wanted - el._opacity) * (reducedMotion ? 1 : Math.min(1, dt * 7));
      el.style.opacity = el._opacity;
      el.style.visibility = el._opacity < 0.01 ? "hidden" : "visible";
      el.inert = !wanted;
      el.style.transform = `translate(${x}px,${y}px) translate(-50%,0)`;
      const moved = Math.abs(y - anchor.y) + Math.abs(x - anchor.x) > 10;
      let leader = this.leaders.get(n.id);
      if (moved && placed) {
        if (!leader) {
          leader = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          leader.setAttribute("stroke", "#d5dfc8");
          leader.setAttribute("stroke-width", ".7");
          this.leaderGroup.append(leader);
          this.leaders.set(n.id, leader);
        }
        leader.setAttribute("x1", anchor.x);
        leader.setAttribute("y1", anchor.y + 12);
        leader.setAttribute("x2", x);
        leader.setAttribute("y2", y + h / 2);
        leader.setAttribute("opacity", el._opacity * 0.7);
      } else if (leader) leader.setAttribute("opacity", "0");
    }
  }
  screen(n) {
    const scale = this.baseScale * this.zoom;
    return {
      x: (n.x - this.center.x) * scale + this.width / 2,
      y: this.height / 2 - (n.y - this.center.y) * scale,
    };
  }
  removeBranch(id) {
    const b = this.branches.get(id);
    if (!b) return;
    this.scene.remove(b.mesh);
    b.mesh.geometry.dispose();
    b.mesh.material.dispose();
    this.branches.delete(id);
  }
  bindGestures() {
    const viewport = this.viewport,
      pointers = new Map();
    let drag = null,
      pinch = 0;
    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button,input,.search-box,.floating-panel")) return;
      viewport.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const p = [...pointers.values()];
        pinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        drag = null;
        return;
      }
      drag = {
        x: e.clientX,
        y: e.clientY,
        cx: this.target.x,
        cy: this.target.y,
      };
      viewport.classList.add("dragging");
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const p = [...pointers.values()],
          d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        if (pinch > 0)
          this.targetZoom = THREE.MathUtils.clamp(
            (this.targetZoom * d) / pinch,
            0.12,
            3,
          );
        pinch = d;
        this.autoFit = false;
        this.dirty = true;
        return;
      }
      if (!drag) return;
      this.target.set(
        drag.cx - (e.clientX - drag.x) / (this.baseScale * this.zoom),
        drag.cy + (e.clientY - drag.y) / (this.baseScale * this.zoom),
      );
      this.autoFit = false;
      this.dirty = true;
    });
    const stop = (e) => {
      pointers.delete(e.pointerId);
      drag = null;
      pinch = 0;
      viewport.classList.remove("dragging");
    };
    viewport.addEventListener("pointerup", stop);
    viewport.addEventListener("pointercancel", stop);
    viewport.addEventListener(
      "wheel",
      (e) => {
        if (e.target.closest(".floating-panel,.search-box")) return;
        e.preventDefault();
        const old = this.targetZoom;
        this.targetZoom = THREE.MathUtils.clamp(
          old * Math.exp(-e.deltaY * 0.0015),
          0.12,
          3,
        );
        const rect = viewport.getBoundingClientRect(),
          px = e.clientX - rect.left - this.width / 2,
          py = this.height / 2 - (e.clientY - rect.top);
        this.target.x +=
          (px / this.baseScale) * (1 / old - 1 / this.targetZoom);
        this.target.y +=
          (py / this.baseScale) * (1 / old - 1 / this.targetZoom);
        this.autoFit = false;
        this.dirty = true;
      },
      { passive: false },
    );
  }
  destroy() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    for (const id of this.branches.keys()) this.removeBranch(id);
    this.renderer?.dispose();
  }
}
