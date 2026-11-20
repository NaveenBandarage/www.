// Run with: bun test tests/gta-motion.test.mjs
import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import {
  cameraAt,
  project,
  smoothTrack,
  FOCAL_LENGTH,
} from "../components/GtaLoading/motion";
import {
  PIECES,
  WORLDS,
  piecePoseAt,
  worldPoseAt,
} from "../components/GtaLoading/sequence";

describe("GTA camera flight", () => {
  test("passes through measured beats without overshooting", () => {
    const anchors = [
      { frame: 0, value: 2 },
      { frame: 10, value: 8 },
      { frame: 20, value: 11 },
    ];
    const sample = smoothTrack(anchors);
    for (const point of anchors)
      assert.ok(Math.abs(sample(point.frame) - point.value) < 1e-8);
    let previous = sample(0);
    for (let frame = 0.1; frame <= 20; frame += 0.1) {
      const value = sample(frame);
      assert.ok(value >= previous);
      assert.ok(value <= 11);
      previous = value;
    }
  });

  test("camera velocity remains continuous at scene boundaries and the reversal", () => {
    const delta = 0.0001;
    for (const frame of [
      129, 149, 187, 216, 273, 337, 389, 441, 493, 606, 614, 630, 644, 669,
    ]) {
      for (const axis of ["x", "y", "z", "roll", "zoom"]) {
        const value = cameraAt(frame)[axis];
        const incoming = (value - cameraAt(frame - delta)[axis]) / delta;
        const outgoing = (cameraAt(frame + delta)[axis] - value) / delta;
        assert.ok(
          Math.abs(incoming - outgoing) < 0.06,
          `${frame}: ${axis} velocity changed`,
        );
      }
    }
  });

  test("travels forward then retraces the earlier scenery", () => {
    const forward = [129, 216, 337, 419, 493, 606].map(
      (frame) => cameraAt(frame).z,
    );
    assert.deepEqual(
      forward,
      [...forward].sort((a, b) => a - b),
    );
    assert.ok(cameraAt(630).z < cameraAt(606).z);
    assert.ok(cameraAt(655).z < cameraAt(644).z);
    assert.equal(project(0, 520).opacity, 0);
    assert.ok(project(0, 655).opacity > 0.9);
    assert.ok(project(2500, 630).opacity > 0.9);
  });

  test("projection never crosses a singularity or leaves scenery after the iris", () => {
    for (const world of WORLDS) {
      for (let frame = 0; frame <= 840; frame++) {
        const view = project(world.distance, frame);
        assert.ok(Number.isFinite(view.scale));
        assert.ok(view.scale <= 10);
        assert.ok(view.opacity >= 0);
        assert.ok(view.opacity <= 1);
      }
      assert.equal(project(world.distance, 840).opacity, 0);
    }
  });

  test("the reverse keeps artwork full-screen until the star aperture closes", () => {
    const openingSize = -cameraAt(141).z / FOCAL_LENGTH;
    for (let frame = 650; frame <= 669; frame++) {
      const view = project(0, frame);
      assert.ok(
        view.scale * openingSize >= 1.25,
        `Artwork shrank at frame ${frame}`,
      );
      assert.ok(
        view.opacity > 0.99,
        `Artwork faded before the star at ${frame}`,
      );
    }
    for (const frame of [141, 240, 435, 540, 612])
      assert.equal(cameraAt(frame).zoom, 1);
  });

  test("playback and seeking use finite object poses in both motion modes", () => {
    for (const reduced of [false, true]) {
      for (let frame = 0; frame <= 840; frame += 3) {
        for (const world of WORLDS) {
          const pose = worldPoseAt(world, frame, reduced);
          for (const value of Object.values(pose))
            assert.ok(Number.isFinite(value));
          assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
        }
        for (const piece of PIECES) {
          const pose = piecePoseAt(piece, frame, reduced);
          for (const value of Object.values(pose))
            assert.ok(Number.isFinite(value));
          assert.ok(pose.scaleX > 0 && pose.scaleY > 0);
          assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
        }
      }
    }
  });
});
