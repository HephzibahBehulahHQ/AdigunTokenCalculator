export const field = (key, label, min, max, whole) => ({key, label, min, max, whole});
export function requireField(condition, field) {
  if (!condition) throw Object.assign(new RangeError("number"), {field});
}
