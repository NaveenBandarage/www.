import { projectMemory } from "./graph-model.js";
import { retrieve } from "./memory.js";
let store;
self.onmessage = ({ data }) => {
  try {
    if (data.type === "init") {
      store = data.store;
      self.postMessage({ id: data.id, result: true });
    } else if (data.type === "project")
      self.postMessage({
        id: data.id,
        result: projectMemory(store, data.options),
      });
    else if (data.type === "retrieve")
      self.postMessage({
        id: data.id,
        result: retrieve(store, data.query, data.asOf),
      });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
};
