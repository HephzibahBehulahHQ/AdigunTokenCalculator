/** Hourly average kW, not measured instantaneous peaks. All computation is local. */
export const MAX_LOAD_DEVICES = 500;
const supplied = (value, fallback) => value === undefined ? fallback : value;

export function invalidLoadInput(field, code = "invalidNumber") {
  const error = new RangeError(`${code}: ${field}`);
  error.field = field;
  error.code = code;
  return error;
}

export function loadNumber(value, field, min = 0, max = Number.MAX_VALUE, integer = false) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) {
    throw invalidLoadInput(field);
  }
  return value;
}

export function finiteLoadResult(value) {
  if (!Number.isFinite(value)) throw invalidLoadInput("result", "overflow");
  return Object.is(value, -0) ? 0 : value;
}

/** watts is the entered rating; powerUnit may be W or kW. Output is canonical W. */
export function normalizeLoadDevice(device) {
  if (!device || typeof device !== "object" || Array.isArray(device)) throw invalidLoadInput("device");
  const unit = supplied(device.powerUnit, "W");
  if (!["W", "kW"].includes(unit)) throw invalidLoadInput("powerUnit");
  const watts = finiteLoadResult(loadNumber(supplied(device.watts, 0), "watts") * (unit === "kW" ? 1000 : 1));
  const quantity = loadNumber(supplied(device.quantity, 1), "quantity", 0, Number.MAX_SAFE_INTEGER, true);
  const hoursPerDay = loadNumber(supplied(device.hoursPerDay, 0), "hoursPerDay", 0, 24);
  const dutyCycle = loadNumber(supplied(device.dutyCycle, 100), "dutyCycle", 0, 100);
  const standbyW = loadNumber(supplied(device.standbyW, 0), "standbyW");
  const seasonalFactor = loadNumber(supplied(device.seasonalFactor, 1), "seasonalFactor");
  const pf = loadNumber(supplied(device.pf, 1), "pf", 0, 1);
  const type = supplied(device.type, "resistive");
  if (!["resistive", "inductive", "capacitive"].includes(type)) throw invalidLoadInput("type");
  const activeW = finiteLoadResult(watts * quantity * (dutyCycle / 100));
  if (pf === 0 && activeW > 0) throw invalidLoadInput("pf", "zeroPowerFactor");
  finiteLoadResult(standbyW * quantity);
  if (device.name !== undefined && (typeof device.name !== "string" || device.name.length > 120)) throw invalidLoadInput("name");
  return {name: supplied(device.name, ""), watts, powerUnit: "W", quantity, hoursPerDay, dutyCycle, standbyW, seasonalFactor, pf, type};
}

export function normalizeLoadDevices(devices) {
  if (!Array.isArray(devices) || devices.length > MAX_LOAD_DEVICES) throw invalidLoadInput("devices", "deviceLimit");
  return Array.from(devices, normalizeLoadDevice);
}

export function normalizeOccupancySchedule(schedule) {
  if (schedule === null || schedule === undefined) return null;
  if (typeof schedule !== "object" || Array.isArray(schedule)) throw invalidLoadInput("occupancySchedule");
  return {
    startHour: loadNumber(schedule.startHour, "startHour", 0, 24 - Number.EPSILON * 24),
    endHour: loadNumber(schedule.endHour, "endHour", 0, 24)
  };
}

export function normalizeLoadSettings(settings = {}) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw invalidLoadInput("settings");
  const phase = supplied(settings.phase, "single");
  if (!["single", "three"].includes(phase)) throw invalidLoadInput("phase");
  const voltage = loadNumber(supplied(settings.voltage, phase === "three" ? 400 : 230), "voltage", Number.MIN_VALUE);
  const measurementInterval = supplied(settings.measurementInterval, "minute");
  if (!["second", "minute"].includes(measurementInterval)) throw invalidLoadInput("measurementInterval");
  const optional = field => settings[field] === undefined || settings[field] === null ? null : loadNumber(settings[field], field);
  return {
    phase, voltage, measurementInterval,
    households: loadNumber(supplied(settings.households, 1), "households", 0, Number.MAX_SAFE_INTEGER, true),
    diversityFactor: loadNumber(supplied(settings.diversityFactor, 1), "diversityFactor", 0, 1),
    demandFactor: loadNumber(supplied(settings.demandFactor, 1), "demandFactor", 0, 1),
    growthMargin: loadNumber(supplied(settings.growthMargin, 0), "growthMargin"),
    tariff: loadNumber(supplied(settings.tariff, 0), "tariff"),
    co2Factor: loadNumber(supplied(settings.co2Factor, 0.4), "co2Factor"),
    renewableOffsetKWh: loadNumber(supplied(settings.renewableOffsetKWh, 0), "renewableOffsetKWh"),
    solarKWh: loadNumber(supplied(settings.solarKWh, 0), "solarKWh"),
    windKWh: loadNumber(supplied(settings.windKWh, 0), "windKWh"),
    batteryKWh: loadNumber(supplied(settings.batteryKWh, 0), "batteryKWh"),
    gridLimitKW: optional("gridLimitKW"),
    peakThresholdKW: optional("peakThresholdKW"),
    occupancySchedule: normalizeOccupancySchedule(settings.occupancySchedule)
  };
}

/** Explicit forecast scenario: all four factors scale power AND energy once. */
export function loadScenarioScale(settings = {}) {
  const s = normalizeLoadSettings(settings);
  return finiteLoadResult(s.households * (1 + s.growthMargin / 100) * s.demandFactor * s.diversityFactor);
}

function preferredFraction(hour, schedule) {
  const {startHour: start, endHour: end} = schedule;
  if (start === end || (start === 0 && end === 24)) return 1;
  const overlap = (from, to) => Math.max(0, Math.min(hour + 1, to) - Math.max(hour, from));
  return end > start ? overlap(start, end) : overlap(start, 24) + overlap(0, end);
}

/**
 * Without a schedule, run each device from midnight for its entered hours.
 * With a preferred window, distribute operating hours evenly inside it first,
 * then evenly outside if needed. Equal endpoints mean a full-day window.
 * Fractional bins preserve energy; a window never compresses operating power.
 * Seasonal factor affects active energy only. Standby occupies the other hours.
 * Daily renewable energy/battery capacity do not invent an hourly dispatch curve.
 */
export function generate24hProfile(devices, occupancySchedule, settings = {}) {
  // Opt-in extension only: retain the original path for all existing inputs.
  if (Array.isArray(devices) && devices.some(device => device?.operatingWindow != null)) {
    const suppliedSettings = normalizeLoadSettings(settings);
    return generateIntervalProfile(devices, {...suppliedSettings, occupancySchedule:occupancySchedule === undefined ? suppliedSettings.occupancySchedule : occupancySchedule}, 60);
  }
  const normalized = normalizeLoadDevices(devices);
  const s = normalizeLoadSettings(settings);
  const schedule = normalizeOccupancySchedule(occupancySchedule === undefined ? s.occupancySchedule : occupancySchedule);
  const scale = loadScenarioScale(s);
  const preferred = Array.from({length: 24}, (_, hour) => schedule ? preferredFraction(hour, schedule) : 0);
  const windowHours = preferred.reduce((sum, value) => sum + value, 0);
  const profile = Array.from({length: 24}, (_, hour) => ({hour, kW: 0}));
  for (const d of normalized) {
    const activeKW = finiteLoadResult(d.watts / 1000 * d.quantity * (d.dutyCycle / 100) * d.seasonalFactor);
    const standbyKW = finiteLoadResult(d.standbyW / 1000 * d.quantity);
    const inside = windowHours ? Math.min(d.hoursPerDay, windowHours) / windowHours : 0;
    const outside = windowHours < 24 ? Math.max(0, d.hoursPerDay - windowHours) / (24 - windowHours) : 0;
    for (const point of profile) {
      const activeFraction = schedule
        ? Math.min(1, Math.max(0, preferred[point.hour] * inside + (1 - preferred[point.hour]) * outside))
        : Math.min(1, Math.max(0, d.hoursPerDay - point.hour));
      point.kW = finiteLoadResult(point.kW + finiteLoadResult((activeKW * activeFraction + standbyKW * (1 - activeFraction)) * scale));
    }
  }
  return profile;
}

/** v2 fields are deliberately separate from the stable v1 device schema. */
export function normalizeLoadV2Device(device) {
  const base = normalizeLoadDevice(device);
  return {...base,
    inrushMultiplier:loadNumber(supplied(device.inrushMultiplier, 1), "inrushMultiplier", 1, 10),
    operatingWindow:normalizeOccupancySchedule(device.operatingWindow)
  };
}

export function normalizeLoadV2Devices(devices) {
  if (!Array.isArray(devices) || devices.length > MAX_LOAD_DEVICES) throw invalidLoadInput("devices", "deviceLimit");
  return Array.from(devices, normalizeLoadV2Device);
}

function intervalOverlap(from, to, schedule) {
  const {startHour:start, endHour:end} = schedule;
  if (start === end || (start === 0 && end === 24)) return to - from;
  const overlap = (a, b) => Math.max(0, Math.min(to, b) - Math.max(from, a));
  return end > start ? overlap(start, end) : overlap(start, 24) + overlap(0, end);
}

/** Native interval averages, with per-device preference taking precedence. */
export function generateIntervalProfile(devices, settings = {}, intervalMinutes = 60) {
  if (![15, 60].includes(intervalMinutes)) throw invalidLoadInput("resolutionMinutes");
  const ds = normalizeLoadV2Devices(devices), s = normalizeLoadSettings(settings), scale = loadScenarioScale(s);
  const duration = intervalMinutes / 60;
  const profile = Array.from({length:24 / duration}, (_, index) => ({hour:index * duration, kW:0}));
  for (const device of ds) {
    const schedule = device.operatingWindow ?? s.occupancySchedule;
    const windowHours = schedule ? intervalOverlap(0, 24, schedule) : 0;
    const inside = windowHours ? Math.min(device.hoursPerDay, windowHours) / windowHours : 0;
    const outside = windowHours < 24 ? Math.max(0, device.hoursPerDay - windowHours) / (24 - windowHours) : 0;
    const activeKW = finiteLoadResult(device.watts / 1000 * device.quantity * device.dutyCycle / 100 * device.seasonalFactor);
    const standbyKW = finiteLoadResult(device.standbyW / 1000 * device.quantity);
    for (const point of profile) {
      const preferred = schedule ? intervalOverlap(point.hour, point.hour + duration, schedule) / duration : 0;
      const fraction = schedule ? preferred * inside + (1 - preferred) * outside : (Math.max(0, Math.min(point.hour + duration, device.hoursPerDay) - point.hour) / duration);
      const activeFraction = Math.min(1, Math.max(0, fraction));
      const contribution = finiteLoadResult((activeKW * activeFraction + standbyKW * (1 - activeFraction)) * scale);
      point.kW = finiteLoadResult(point.kW + contribution);
    }
  }
  return profile;
}

export function generate15minProfile(devices, settings = {}) {
  return generateIntervalProfile(devices, settings, 15);
}

/** Hourly ranking remains hourly even when the selected chart uses 15 minutes. */
export function profileStatistics(profile) {
  if (!Array.isArray(profile) || ![24, 96].includes(profile.length)) throw invalidLoadInput("profile");
  const duration = 24 / profile.length, hourly = Array.from({length:24}, (_, hour) => ({hour,kW:0}));
  const cumulative = [{hour:0,kWh:0}];let dailyKWh = 0, peakKW = 0;
  for (let index = 0; index < profile.length; index++) {
    const point = profile[index];
    if (!point || point.hour !== index * duration) throw invalidLoadInput("profile");
    const kW = loadNumber(point.kW, "profile");
    dailyKWh = finiteLoadResult(dailyKWh + kW * duration);peakKW = Math.max(peakKW,kW);
    hourly[Math.floor(point.hour)].kW = finiteLoadResult(hourly[Math.floor(point.hour)].kW + kW * duration);
    cumulative.push({hour:(index + 1) * duration,kWh:dailyKWh});
  }
  const averageKW = dailyKWh / 24;
  return {dailyKWh,peakKW,averageKW,peakAverageRatio:averageKW ? finiteLoadResult(peakKW / averageKW) : 0,
    topHours:dailyKWh ? hourly.sort((a,b) => b.kW-a.kW || a.hour-b.hour).slice(0,3) : [], cumulative};
}
