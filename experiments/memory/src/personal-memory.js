import { demoMemory, validateMemory } from "./memory.js";

// Upgrade only the untouched starter. Imported workspaces and edited samples
// belong to the visitor and must survive a new bundled profile.
export function initialWorkspace(saved, seed) {
  if (!saved) return structuredClone(seed);
  if (
    seed &&
    JSON.stringify(saved) === JSON.stringify(validateMemory(demoMemory()))
  )
    return structuredClone(seed);
  return saved;
}
