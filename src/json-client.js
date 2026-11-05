import {createWorkerClient} from "./worker-client.js";
import {validateJsonTask} from "./json-task.js";
export {MAX_JSON_INPUT_LENGTH, MAX_JSON_OUTPUT_LENGTH} from "./json-task.js";

const client = createWorkerClient(() => {
  if (typeof Worker !== "function") {
    const error = Error("json-worker-unavailable");
    error.code = "json-worker-unavailable";
    throw error;
  }
  return new Worker(new URL("./json-worker.js", import.meta.url), {type: "module"});
}, {sameRequest: (a, b) => a.source === b.source && a.mode === b.mode});

export async function formatJsonAsync(source, mode = "pretty") {
  validateJsonTask(source, mode);
  return client.request({source, mode});
}

export function cancelJsonWork() {
  client.cancel();
}
