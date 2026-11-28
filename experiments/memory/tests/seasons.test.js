import test from "node:test";
import assert from "node:assert/strict";
import { memorySeason } from "../src/seasons.js";

test("snapshot foliage follows calendar seasons, including date-only month boundaries", () => {
  const snapshots = [
    ["2026-03-01", "Spring"],
    ["2026-06-01", "Summer"],
    ["2026-09-01", "Autumn"],
    ["2026-12-01", "Winter"],
  ];
  for (const [date, name] of snapshots) {
    assert.equal(memorySeason(Date.parse(date)).name, name);
  }
});

test("Now and timed snapshots change season at New York midnight", () => {
  const before = Date.parse("2026-12-01T04:59:59Z");
  const boundary = Date.parse("2026-12-01T05:00:00Z");
  assert.equal(memorySeason(Infinity, before).name, "Autumn");
  assert.equal(memorySeason(Infinity, boundary).name, "Winter");
  assert.equal(memorySeason(before, boundary).name, "Autumn");
});
