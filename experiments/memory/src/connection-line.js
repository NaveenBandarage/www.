import * as THREE from "three";

const SEGMENTS = 96;
const PERIOD = 1.4;
const WAVELENGTH = 400;
const PORT_GAP = 2;
const RIBBON_HALF_WIDTH = 1.5;

export function connectionCurve(from, to) {
  const leftToRight = from.x <= to.x;
  const left = leftToRight ? from : to;
  const right = leftToRight ? to : from;
  const gapX = right.x - right.w / 2 - (left.x + left.w / 2);
  const topToBottom = from.y <= to.y;
  const top = topToBottom ? from : to;
  const bottom = topToBottom ? to : from;
  const gapY = bottom.y - (top.y + top.h);

  // Tightly stacked labels use their top/bottom edges so the curve avoids text.
  if (gapX >= 12 || gapY < PORT_GAP * 2) {
    const direction = leftToRight ? 1 : -1;
    const start = {
      x: from.x + direction * (from.w / 2 + PORT_GAP),
      y: from.y + from.h / 2,
      side: leftToRight ? "right" : "left",
    };
    const end = {
      x: to.x - direction * (to.w / 2 + PORT_GAP),
      y: to.y + to.h / 2,
      side: leftToRight ? "left" : "right",
    };
    const handle = (end.x - start.x) * 0.56;
    return [
      start,
      { x: start.x + handle, y: start.y },
      { x: end.x - handle, y: end.y },
      end,
    ];
  }

  const start = {
    x: from.x,
    y: topToBottom ? from.y + from.h + PORT_GAP : from.y - PORT_GAP,
    side: topToBottom ? "bottom" : "top",
  };
  const end = {
    x: to.x,
    y: topToBottom ? to.y - PORT_GAP : to.y + to.h + PORT_GAP,
    side: topToBottom ? "top" : "bottom",
  };
  const handle = (end.y - start.y) * 0.56;
  return [
    start,
    { x: start.x, y: start.y + handle },
    { x: end.x, y: end.y - handle },
    end,
  ];
}

export function connectionStyle(type, partial) {
  return {
    color: type === "supersedes" ? "#776e60" : "#5e696a",
    opacity: partial ? 0.48 : type === "supported_by" ? 0.7 : 1,
  };
}

const vertexShader = `
  attribute vec2 aNormal;
  attribute float aDistance;
  uniform vec2 uResolution;
  varying float vDistance;
  varying float vSide;
  void main() {
    vec2 pixel = position.xy + aNormal * position.z * ${RIBBON_HALF_WIDTH};
    gl_Position = vec4(pixel.x / uResolution.x * 2. - 1.,
                       1. - pixel.y / uResolution.y * 2., 0., 1.);
    vDistance = aDistance;
    vSide = position.z;
  }
`;
const fragmentShader = `
  precision mediump float;
  uniform float uCycle;
  uniform float uMotion;
  uniform float uPhase;
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uLength;
  uniform vec3 uColor;
  varying float vDistance;
  varying float vSide;
  void main() {
    float wave = .5 + .5 * cos(6.2831853 *
      (vDistance / ${WAVELENGTH.toFixed(1)} + uPhase - uCycle));
    float highlight = wave * wave;
    float contrast = mix(.36, .26 + highlight * .40,
      uMotion * smoothstep(.65, 1., uReveal));
    float feather = clamp(uLength * .18, 2., 40.);
    float front = (uLength + feather) * uReveal;
    float revealed = 1. - smoothstep(front - feather, front, vDistance);
    // Keep the coverage of a subpixel stroke stable as it crosses pixel rows.
    float distanceToCenter = abs(vSide) * ${RIBBON_HALF_WIDTH};
    float pixelWidth = max(fwidth(vSide) * ${RIBBON_HALF_WIDTH}, .01);
    float edge = clamp(.5 + (.46 - distanceToCenter) / pixelWidth, 0., 1.);
    gl_FragColor = vec4(uColor, contrast * edge * revealed * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function connectionCycle(seconds) {
  return (seconds % PERIOD) / PERIOD;
}

export function createConnectionLine(scene, clock, key) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((SEGMENTS + 1) * 6);
  const normals = new Float32Array((SEGMENTS + 1) * 4);
  const distances = new Float32Array((SEGMENTS + 1) * 2);
  const indices = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const n = i * 2;
    indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aNormal", new THREE.BufferAttribute(normals, 2));
  geometry.setAttribute("aDistance", new THREE.BufferAttribute(distances, 1));
  geometry.setIndex(indices);
  const seed = [...key].reduce(
    (n, char) => (Math.imul(n, 31) + char.charCodeAt(0)) >>> 0,
    17,
  );
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      ...clock,
      uPhase: { value: (seed % WAVELENGTH) / WAVELENGTH },
      uOpacity: { value: 1 },
      uReveal: { value: 0 },
      uLength: { value: 0 },
      uColor: { value: new THREE.Color() },
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  scene.add(mesh);
  return {
    mesh,
    setColor(color) {
      material.uniforms.uColor.value.set(color);
    },
    setOpacity(opacity) {
      mesh.visible = opacity > 0;
      material.uniforms.uOpacity.value = opacity;
    },
    setReveal(progress) {
      material.uniforms.uReveal.value = progress;
    },
    setCurve(points) {
      const curve = new THREE.CubicBezierCurve3(
        ...points.map(({ x, y }) => new THREE.Vector3(x, y, 0)),
      );
      const samples = curve.getPoints(SEGMENTS);
      let distance = 0;
      for (let i = 0; i <= SEGMENTS; i++) {
        const point = samples[i];
        if (i) distance += point.distanceTo(samples[i - 1]);
        const previous = samples[Math.max(0, i - 1)];
        const next = samples[Math.min(SEGMENTS, i + 1)];
        const dx = next.x - previous.x,
          dy = next.y - previous.y;
        const length = Math.hypot(dx, dy) || 1;
        for (let side = 0; side < 2; side++) {
          const index = i * 2 + side;
          positions.set([point.x, point.y, side ? 1 : -1], index * 3);
          normals.set([-dy / length, dx / length], index * 2);
          distances[index] = distance;
        }
      }
      for (const attribute of Object.values(geometry.attributes))
        attribute.needsUpdate = true;
      material.uniforms.uLength.value = distance;
    },
    dispose() {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    },
  };
}
