import {jsonTransform} from "./additional.js";

export const MAX_JSON_INPUT_LENGTH = 5_000_000;
export const MAX_JSON_OUTPUT_LENGTH = 10_000_000;

function tooLarge() {
  const error = Error("json-too-large");
  error.code = "json-too-large";
  return error;
}

export function validateJsonTask(source, mode = "pretty") {
  if (typeof source !== "string") throw Error("empty");
  if (source.length > MAX_JSON_INPUT_LENGTH) throw tooLarge();
  if (!source.trim()) throw Error("empty");
  if (!["pretty", "minify"].includes(mode)) throw Error("number");
}

// Formatting deeply nested JSON can expand a short input quadratically.
// Bound that work before invoking the existing exact-token formatter.
function checkPrettyExpansion(source) {
  let inString = false, escaped = false, depth = 0, bound = source.length;
  for (const character of source) {
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
    } else if (character === '"') inString = true;
    else if (character === "{" || character === "[") {
      depth++;
      bound += 1 + 2 * depth;
    } else if (character === "}" || character === "]") {
      depth = Math.max(0, depth - 1);
      bound += 1 + 2 * depth;
    } else if (character === ",") bound += 1 + 2 * depth;
    else if (character === ":") bound++;
    if (bound > MAX_JSON_OUTPUT_LENGTH) throw tooLarge();
  }
}

export function runJsonTask(payload = {}) {
  if (!payload || typeof payload !== "object") throw Error("empty");
  const {source, mode = "pretty"} = payload;
  validateJsonTask(source, mode);
  if (mode === "pretty") checkPrettyExpansion(source);
  const result = jsonTransform(source, mode);
  if (result.length > MAX_JSON_OUTPUT_LENGTH) throw tooLarge();
  return result;
}
