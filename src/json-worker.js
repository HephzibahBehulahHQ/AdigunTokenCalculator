import {runJsonTask} from "./json-task.js";

self.onmessage = ({data}) => {
  const {id, payload} = data || {};
  try {
    self.postMessage({id, ok: true, result: runJsonTask(payload)});
  } catch (error) {
    self.postMessage({id, ok: false, error: {
      message: error?.message || "number", code: error?.code
    }});
  }
};
