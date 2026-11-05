// Date.UTC treats 0–99 as 1900–1999. Setting the full year on a UTC date
// preserves the requested proleptic Gregorian year and normal date overflow.
export function utcDateMilliseconds(year, zeroBasedMonth, day) {
  if (![year, zeroBasedMonth, day].every(Number.isInteger)) throw Error("date");
  const date = new Date(0);
  date.setUTCFullYear(year, zeroBasedMonth, day);
  const milliseconds = date.getTime();
  if (!Number.isFinite(milliseconds)) throw Error("date");
  return milliseconds;
}
