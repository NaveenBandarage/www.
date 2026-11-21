/** Texture a continuous limb mesh without alpha seams between its triangles. */
export interface ClothPart {
  image: CanvasImageSource;
  width: number;
  height: number;
}
export interface ClothVertex {
  x: number;
  y: number;
  u: number;
  v: number;
  alpha?: number;
}
interface Surface {
  canvas: HTMLCanvasElement;
  available: () => boolean;
  destroy: () => void;
  paint: (
    part: ClothPart,
    vertices: ClothVertex[],
    left: number,
    top: number,
    scale: number,
  ) => void;
}
let accelerated: Surface | null | undefined;
const fallbackLayers = new WeakMap<
  CanvasRenderingContext2D,
  HTMLCanvasElement
>();
const pixels = new WeakMap<object, ImageData>();

function makeAcceleratedSurface(): Surface | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) return null;
    const shader = (kind: number, source: string) => {
      const value = gl.createShader(kind);
      if (!value) throw Error("Shader unavailable");
      gl.shaderSource(value, source);
      gl.compileShader(value);
      if (!gl.getShaderParameter(value, gl.COMPILE_STATUS))
        throw Error("Shader failed");
      return value;
    };
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(
      program,
      shader(
        gl.VERTEX_SHADER,
        `attribute vec2 position;attribute vec2 uv;attribute float coverage;uniform vec2 origin;uniform vec2 extent;varying mediump vec2 texcoord;varying mediump float opacity;void main(){vec2 p=(position-origin)/extent*2.0-1.0;gl_Position=vec4(p.x,-p.y,0.0,1.0);texcoord=uv;opacity=coverage;}`,
      ),
    );
    gl.attachShader(
      program,
      shader(
        gl.FRAGMENT_SHADER,
        `precision mediump float;uniform sampler2D paint;varying mediump vec2 texcoord;varying mediump float opacity;void main(){gl_FragColor=texture2D(paint,texcoord)*opacity;}`,
      ),
    );
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position"),
      uv = gl.getAttribLocation(program, "uv"),
      coverage = gl.getAttribLocation(program, "coverage");
    const origin = gl.getUniformLocation(program, "origin"),
      extent = gl.getUniformLocation(program, "extent");
    const buffer = gl.createBuffer(),
      textures = new WeakMap<object, WebGLTexture>();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(uv);
    gl.enableVertexAttribArray(coverage);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 20, 8);
    gl.vertexAttribPointer(coverage, 1, gl.FLOAT, false, 20, 16);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    return {
      canvas,
      available: () => !gl.isContextLost(),
      destroy: () => gl.getExtension("WEBGL_lose_context")?.loseContext(),
      paint(part, vertices, left, top, scale) {
        let texture = textures.get(part.image as object);
        if (!texture) {
          texture = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            part.image as TexImageSource,
          );
          textures.set(part.image as object, texture);
        } else gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(origin, left, top);
        gl.uniform2f(extent, canvas.width / scale, canvas.height / scale);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            vertices.flatMap((p) => [p.x, p.y, p.u, p.v, p.alpha ?? 1]),
          ),
          gl.STREAM_DRAW,
        );
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
      },
    };
  } catch {
    return null;
  }
}

/** Software fallback uses the same triangles and texture coordinates as the GPU. */
function paintSoftware(
  canvas: HTMLCanvasElement,
  part: ClothPart,
  vertices: ClothVertex[],
  left: number,
  top: number,
  scale: number,
  w: number,
  h: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  let source = pixels.get(part.image as object);
  if (!source) {
    const input = document.createElement("canvas");
    input.width = part.width;
    input.height = part.height;
    const ctx = input.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(part.image, 0, 0);
    source = ctx.getImageData(0, 0, part.width, part.height);
    pixels.set(part.image as object, source);
  }
  const width = Math.ceil(w * scale),
    height = Math.ceil(h * scale),
    output = context.createImageData(width, height);
  const data = source.data,
    destination = output.data;
  for (let i = 0; i < vertices.length; i += 3) {
    const triangle = vertices
      .slice(i, i + 3)
      .map((p) => ({ ...p, x: (p.x - left) * scale, y: (p.y - top) * scale }));
    const [a, b, c] = triangle,
      det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(det) < 1e-8) continue;
    const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x))),
      x1 = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y))),
      y1 = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const p =
          ((b.y - c.y) * (x + 0.5 - c.x) + (c.x - b.x) * (y + 0.5 - c.y)) / det;
        const q =
            ((c.y - a.y) * (x + 0.5 - c.x) + (a.x - c.x) * (y + 0.5 - c.y)) /
            det,
          r = 1 - p - q;
        if (p < -0.00001 || q < -0.00001 || r < -0.00001) continue;
        const sx = Math.max(
          0,
          Math.min(
            part.width - 1,
            (p * a.u + q * b.u + r * c.u) * (part.width - 1),
          ),
        );
        const sy = Math.max(
          0,
          Math.min(
            part.height - 1,
            (p * a.v + q * b.v + r * c.v) * (part.height - 1),
          ),
        );
        const ix = Math.floor(sx),
          iy = Math.floor(sy),
          fx = sx - ix,
          fy = sy - iy;
        const a0 = (iy * part.width + ix) * 4,
          b0 = (iy * part.width + Math.min(ix + 1, part.width - 1)) * 4;
        const c0 = (Math.min(iy + 1, part.height - 1) * part.width + ix) * 4,
          d0 =
            (Math.min(iy + 1, part.height - 1) * part.width +
              Math.min(ix + 1, part.width - 1)) *
            4;
        const dest = (y * width + x) * 4;
        const opacity =
          p * (a.alpha ?? 1) + q * (b.alpha ?? 1) + r * (c.alpha ?? 1);
        for (let channel = 0; channel < 4; channel++)
          destination[dest + channel] =
            (data[a0 + channel] * (1 - fx) + data[b0 + channel] * fx) *
              (1 - fy) +
            (data[c0 + channel] * (1 - fx) + data[d0 + channel] * fx) * fy;
        destination[dest + 3] *= opacity;
      }
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(output, 0, 0);
}

export function paintCloth(
  ctx: CanvasRenderingContext2D,
  part: ClothPart,
  vertices: ClothVertex[],
) {
  const left = Math.floor(Math.min(...vertices.map((p) => p.x))) - 1,
    top = Math.floor(Math.min(...vertices.map((p) => p.y))) - 1;
  const width = Math.ceil(Math.max(...vertices.map((p) => p.x))) - left + 1,
    height = Math.ceil(Math.max(...vertices.map((p) => p.y))) - top + 1,
    scale = 1.5;
  if (accelerated === undefined) accelerated = makeAcceleratedSurface();
  if (accelerated && !accelerated.available()) {
    accelerated.destroy();
    accelerated = null;
  }
  let canvas: HTMLCanvasElement;
  if (accelerated) {
    canvas = accelerated.canvas;
    if (canvas.width < width * scale)
      canvas.width = Math.ceil((width * scale) / 64) * 64;
    if (canvas.height < height * scale)
      canvas.height = Math.ceil((height * scale) / 64) * 64;
    accelerated.paint(part, vertices, left, top, scale);
  } else {
    let fallback = fallbackLayers.get(ctx);
    if (!fallback) {
      fallback = document.createElement("canvas");
      fallback.width = fallback.height = 512;
      fallbackLayers.set(ctx, fallback);
    }
    canvas = fallback;
    paintSoftware(canvas, part, vertices, left, top, scale, width, height);
  }
  ctx.drawImage(
    canvas,
    0,
    0,
    width * scale,
    height * scale,
    left,
    top,
    width,
    height,
  );
}

/** Release the shared context and its textures when leaving the Uses scene. */
export function releaseClothSurface() {
  accelerated?.destroy();
  accelerated = undefined;
}
