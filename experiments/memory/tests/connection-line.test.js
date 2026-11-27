import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  connectionCurve,
  createConnectionLine,
} from "../src/connection-line.js";

test("cables follow route endpoints and retain their buffers when the camera moves", () => {
  const scene = new THREE.Scene();
  const clock = {
    uCycle: { value: 0 },
    uMotion: { value: 1 },
    uResolution: { value: new THREE.Vector2(1000, 800) },
  };
  const cable = createConnectionLine(scene, clock, "a:b");
  const from = { x: 100, y: 200, w: 80, h: 36 };
  const to = { x: 800, y: 500, w: 120, h: 36 };
  const points = connectionCurve(from, to);
  assert.deepEqual(points[0], { x: 142, y: 218, side: "right" });
  assert.deepEqual(points[3], { x: 738, y: 518, side: "left" });
  assert.equal(points[1].y, points[0].y);
  assert.equal(points[2].y, points[3].y);
  assert.deepEqual(connectionCurve(to, from), points.toReversed());
  cable.setCurve(points);
  const { position, aDistance } = cable.mesh.geometry.attributes;
  assert.deepEqual(Array.from(position.array.slice(0, 2)), [142, 218]);
  assert.deepEqual(Array.from(position.array.slice(-3, -1)), [738, 518]);
  assert.equal(aDistance.array[0], 0);
  assert.ok(aDistance.array.at(-1) > Math.hypot(596, 300));
  for (let i = 1; i < aDistance.count; i++)
    assert.ok(aDistance.array[i] >= aDistance.array[i - 1]);
  const stacked = connectionCurve(from, { ...to, x: 115, y: 250 });
  assert.deepEqual(stacked[0], { x: 100, y: 238, side: "bottom" });
  assert.deepEqual(stacked[3], { x: 115, y: 248, side: "top" });
  assert.equal(stacked[1].x, stacked[0].x);
  assert.equal(stacked[2].x, stacked[3].x);
  cable.setCurve(stacked);
  assert.equal(cable.mesh.geometry.attributes.position, position);
  for (const attribute of Object.values(cable.mesh.geometry.attributes))
    assert.ok(Array.from(attribute.array).every(Number.isFinite));
  assert.equal(cable.mesh.material.uniforms.uCycle, clock.uCycle);
  let disposed = 0;
  cable.mesh.geometry.addEventListener("dispose", () => disposed++);
  cable.mesh.material.addEventListener("dispose", () => disposed++);
  cable.dispose();
  assert.equal(scene.children.length, 0);
  assert.equal(disposed, 2);
});
