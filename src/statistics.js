export const MAX_STATISTICS_VALUES = 250_000;
export const MAX_STATISTICS_INPUT_LENGTH = 5_000_000;

function tooLarge() {
  const error = Error("statistics-too-large");
  error.code = "statistics-too-large";
  return error;
}

// Neumaier compensation retains small terms during cancellation. Return null
// on overflow so the mean can retry on values scaled to [-1, 1].
function compensatedSum(values) {
  let sum = 0, correction = 0;
  for (const value of values) {
    const next = sum + value;
    if (!Number.isFinite(next)) return null;
    correction += Math.abs(sum) >= Math.abs(value)
      ? (sum - next) + value : (value - next) + sum;
    if (!Number.isFinite(correction)) return null;
    sum = next;
  }
  const result = sum + correction;
  return Number.isFinite(result) ? result : null;
}

function average(values, scale) {
  const sum = compensatedSum(values);
  const mean = sum === null
    ? compensatedSum(values.map(value => value / scale)) / values.length * scale
    : sum / values.length;
  if (!Number.isFinite(mean) || (sum !== null && sum !== 0 && mean === 0)) throw Error("number");
  return mean;
}

export function summarizeNumbers(text) {
  const source = String(text);
  if (source.length > MAX_STATISTICS_INPUT_LENGTH) throw tooLarge();
  const values = [], counts = new Map();
  let maxCount = 0, scale = 0;
  for (const match of source.matchAll(/[^\s,;]+/g)) {
    if (values.length === MAX_STATISTICS_VALUES) throw tooLarge();
    const value = Number(match[0]);
    if (!Number.isFinite(value)) throw Error("number");
    values.push(value);
    scale = Math.max(scale, Math.abs(value));
    const count = (counts.get(value) || 0) + 1;
    counts.set(value, count);
    maxCount = Math.max(maxCount, count);
  }
  if (!values.length) throw Error("number");
  const sorted = [...values].sort((a, b) => a - b), count = values.length;
  const min = sorted[0], max = sorted.at(-1), range = max - min;
  if (!Number.isFinite(range)) throw Error("number");
  const mean = average(values, scale);
  const middle = Math.floor(count / 2);
  const pairSum = count % 2 ? 0 : sorted[middle - 1] + sorted[middle];
  const median = count % 2 ? sorted[middle]
    : Number.isFinite(pairSum) ? pairSum / 2
      : sorted[middle - 1] / 2 + sorted[middle] / 2;
  const mode = maxCount === 1 ? [] : [...counts]
    .filter(([, frequency]) => frequency === maxCount)
    .map(([value]) => value).sort((a, b) => a - b);

  // Center around the minimum first. This keeps the variance of close large
  // values (e.g. 1e16 and 1e16 + 2) independent of a rounded displayed mean.
  let populationVariance = 0, sampleVariance = count > 1 ? 0 : null;
  if (range !== 0) {
    const offsets = values.map(value => value - min);
    const center = average(offsets, range);
    let deviationScale = 0;
    const deviations = offsets.map(value => {
      const difference = value - center;
      deviationScale = Math.max(deviationScale, Math.abs(difference));
      return difference;
    });
    const squared = compensatedSum(deviations.map(value => (value / deviationScale) ** 2));
    populationVariance = (squared / count * deviationScale) * deviationScale;
    sampleVariance = (squared / (count - 1) * deviationScale) * deviationScale;
    if (![populationVariance, sampleVariance].every(Number.isFinite)
      || populationVariance === 0 || sampleVariance === 0) throw Error("number");
  }
  return {
    count, mean, median, mode, min, max, range, populationVariance,
    populationStdDev: Math.sqrt(populationVariance), sampleVariance,
    sampleStdDev: sampleVariance === null ? null : Math.sqrt(sampleVariance)
  };
}
