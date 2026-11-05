import {
  finiteLoadResult as finite, generate24hProfile, invalidLoadInput,
  loadNumber, loadScenarioScale, normalizeLoadDevice, normalizeLoadDevices, normalizeLoadSettings,
  normalizeLoadV2Device, normalizeLoadV2Devices, generate15minProfile, profileStatistics
} from "./loadProfile.js";
import {LOAD_COMPANY} from "../data/loadCompany.js";

const sum = values => finite(values.reduce((total, value) => finite(total + value), 0));
const factor = value => loadNumber(value, "factor", 0, 1);
const activeW = d => finite(d.watts * d.quantity * (d.dutyCycle / 100));

export function instantaneousPowerW(device) { return activeW(normalizeLoadDevice(device)); }
export function realPowerKW(device, demandFactor = 1) { return finite(instantaneousPowerW(device) / 1000 * factor(demandFactor)); }
export function reactivePowerKVAR(device, demandFactor = 1) {
  const d = normalizeLoadDevice(device), p = realPowerKW(d, demandFactor);
  return p === 0 ? 0 : finite((p / d.pf) * Math.sqrt((1 - d.pf) * (1 + d.pf)) * (d.type === "capacitive" ? -1 : 1));
}
export function apparentPowerKVA(device, demandFactor = 1) {
  const d = normalizeLoadDevice(device), p = realPowerKW(d, demandFactor);
  return p === 0 ? 0 : finite(p / d.pf);
}
export function energyPerSecondWh(device) { return finite(instantaneousPowerW(device) / 3600); }
export function energyPerMinuteWh(device) { return finite(instantaneousPowerW(device) / 60); }
export function energyPerHourKWh(device) { return finite(instantaneousPowerW(device) / 1000); }
/** Active energy only; building totals also include standbyEnergyKWh. */
export function dailyConsumptionKWh(device) {
  const d = normalizeLoadDevice(device);
  return finite(energyPerHourKWh(d) * d.hoursPerDay * d.seasonalFactor);
}
export function weeklyConsumptionKWh(device) { return finite(dailyConsumptionKWh(device) * 7); }
export function monthlyConsumptionKWh(device) { return finite(dailyConsumptionKWh(device) * 30); }
export function annualConsumptionKWh(device) { return finite(dailyConsumptionKWh(device) * 365); }
export function standbyEnergyKWh(device) {
  const d = normalizeLoadDevice(device);
  return finite(d.standbyW / 1000 * d.quantity * (24 - d.hoursPerDay));
}

/** Installed nameplate capacity across households, before growth/duty/demand. */
export function totalConnectedLoadKW(devices, settings = {}) {
  const s = normalizeLoadSettings(settings);
  return finite(sum(normalizeLoadDevices(devices).map(d => finite(d.watts / 1000 * d.quantity))) * s.households);
}
export function totalRealPowerKW(devices, settings = {}) {
  return finite(sum(normalizeLoadDevices(devices).map(d => realPowerKW(d))) * loadScenarioScale(settings));
}
export function totalReactivePowerKVAR(devices, settings = {}) {
  return finite(sum(normalizeLoadDevices(devices).map(d => reactivePowerKVAR(d))) * loadScenarioScale(settings));
}
/** Signed Q cancels across capacitive/inductive loads; do not sum individual S. */
export function totalApparentPowerKVA(devices, settings = {}) {
  return finite(Math.hypot(totalRealPowerKW(devices, settings), totalReactivePowerKVAR(devices, settings)));
}
export function totalDailyConsumptionKWh(devices, settings = {}) {
  return finite(sum(normalizeLoadDevices(devices).map(d => finite(dailyConsumptionKWh(d) + standbyEnergyKWh(d)))) * loadScenarioScale(settings));
}
export function peakDemandKW(devices, settings = {}) {
  return Math.max(...generate24hProfile(devices, undefined, settings).map(point => point.kW));
}
export function averageLoadKW(devices, settings = {}) { return finite(totalDailyConsumptionKWh(devices, settings) / 24); }
export function loadFactor(devices, settings = {}) {
  const peak = peakDemandKW(devices, settings);
  return peak === 0 ? 0 : Math.min(1, finite(averageLoadKW(devices, settings) / peak));
}
export function applyDiversityFactor(peakKW, diversityFactor) { return finite(loadNumber(peakKW, "peakKW") * factor(diversityFactor)); }
export function applyDemandFactor(connectedKW, demandFactor) { return finite(loadNumber(connectedKW, "connectedKW") * factor(demandFactor)); }
export function powerFactorCorrectionKVAR(kW, pfOld, pfNew) {
  loadNumber(kW, "kW");factor(pfOld);factor(pfNew);
  if (kW === 0) return 0;
  if (pfOld === 0 || pfNew === 0) throw invalidLoadInput("pf", "zeroPowerFactor");
  if (pfOld === pfNew) return 0;
  const reactive = pf => {
    const sine = Math.sqrt((1 - pf) * (1 + pf)), tangent = sine / pf;
    // Scale before the otherwise overflowing division for subnormal PF values.
    // For ordinary PF, multiplying by tangent also preserves large finite Q.
    return Number.isFinite(tangent) ? kW * tangent : (kW / pf) * sine;
  };
  return finite(reactive(pfOld) - reactive(pfNew));
}
export function costPerInterval(kWh, tariff) { return finite(loadNumber(kWh, "kWh") * loadNumber(tariff, "tariff")); }
/** Gross costs: renewable-adjusted costs are explicitly named in the summary. */
export function costPerDay(devices, tariff, settings = {}) { return costPerInterval(totalDailyConsumptionKWh(devices, settings), tariff); }
export function costPerMonth(devices, tariff, settings = {}) { return finite(costPerDay(devices, tariff, settings) * 30); }
export function costPerYear(devices, tariff, settings = {}) { return finite(costPerDay(devices, tariff, settings) * 365); }
export function carbonFootprintKgCO2(kWh, gridFactor = 0.4) { return finite(loadNumber(kWh, "kWh") * loadNumber(gridFactor, "co2Factor")); }
export function renewableOffsetSavings(offsetKWh, tariff) { return costPerInterval(offsetKWh, tariff); }

/**
 * A declared forecast, not a metered or code-compliance design calculation.
 * Demand/diversity/households/growth scale both usage and profile consistently.
 * Renewables offset daily grid energy only; battery is idealized backup duration.
 */
export function calculateLoadSummary(devices, settings = {}) {
  const ds = normalizeLoadDevices(devices), s = normalizeLoadSettings(settings);
  const scale = loadScenarioScale(s);
  const connectedLoadKW = totalConnectedLoadKW(ds, s);
  const projectedConnectedLoadKW = finite(connectedLoadKW * (1 + s.growthMargin / 100));
  const p = totalRealPowerKW(ds, s), q = totalReactivePowerKVAR(ds, s);
  const apparent = finite(Math.hypot(p, q));
  const dailyKWh = totalDailyConsumptionKWh(ds, s);
  const profile = generate24hProfile(ds, undefined, s);
  const peak = Math.max(...profile.map(point => point.kW));
  const average = dailyKWh / 24;
  const renewableAvailableKWh = sum([s.renewableOffsetKWh, s.solarKWh, s.windKWh]);
  const renewableAppliedKWh = Math.min(dailyKWh, renewableAvailableKWh);
  const netGridKWh = Math.max(0, dailyKWh - renewableAppliedKWh);
  const dailyCost = costPerInterval(netGridKWh, s.tariff);
  const intervalEnergyWh = finite(p * 1000 / (s.measurementInterval === "second" ? 3600 : 60));
  const breakdown = ds.map((d, index) => ({
    index, name: d.name, quantity: d.quantity,
    activeKWh: finite(dailyConsumptionKWh(d) * scale),
    standbyKWh: finite(standbyEnergyKWh(d) * scale),
    dailyKWh: finite((dailyConsumptionKWh(d) + standbyEnergyKWh(d)) * scale),
    realPowerKW: finite(realPowerKW(d) * scale),
    reactivePowerKVAR: finite(reactivePowerKVAR(d) * scale),
    apparentPowerKVA: finite(apparentPowerKVA(d) * scale)
  })).sort((a, b) => b.dailyKWh - a.dailyKWh || a.index - b.index);
  return {
    connectedLoadKW, projectedConnectedLoadKW,
    demandAdjustedConnectedKW: applyDemandFactor(projectedConnectedLoadKW, s.demandFactor),
    realPowerKW: p, reactivePowerKVAR: q, apparentPowerKVA: apparent,
    lineCurrentA: apparent === 0 ? 0 : finite(apparent * 1000 / s.voltage / (s.phase === "three" ? Math.sqrt(3) : 1)),
    peakDemandKW: peak, averageLoadKW: average, loadFactor: peak === 0 ? 0 : Math.min(1, finite(average / peak)),
    dailyKWh, weeklyKWh: finite(dailyKWh * 7), monthlyKWh: finite(dailyKWh * 30), annualKWh: finite(dailyKWh * 365),
    standbyKWh: sum(breakdown.map(row => row.standbyKWh)), intervalEnergyWh,
    grossDailyCost: costPerInterval(dailyKWh, s.tariff), dailyCost,
    monthlyCost: finite(dailyCost * 30), annualCost: finite(dailyCost * 365),
    grossCarbonKgCO2: carbonFootprintKgCO2(dailyKWh, s.co2Factor), carbonKgCO2: carbonFootprintKgCO2(netGridKWh, s.co2Factor),
    renewableAvailableKWh, renewableAppliedKWh, excessRenewableKWh: Math.max(0, renewableAvailableKWh - dailyKWh),
    netGridKWh, renewableSavings: renewableOffsetSavings(renewableAppliedKWh, s.tariff),
    batteryHours: average > 0 ? finite(s.batteryKWh / average) : null,
    gridLimitExceeded: s.gridLimitKW !== null && peak > s.gridLimitKW,
    peakThresholdExceeded: s.peakThresholdKW !== null && peak > s.peakThresholdKW,
    profile, breakdown
  };
}

// Opt-in v2 helpers. The v1 exports above retain their calculation contracts.
export const STANDARD_BREAKER_AMPS = Object.freeze([6,10,16,20,25,32,40,50,63,80,100,125]);
export const STANDARD_CONDUCTOR_MM2 = Object.freeze([1,1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300]);
const PROJECTION_MONTH_DAYS = Object.freeze([31,28,31,30,31,30,31,31,30,31,30,31]);
const v2Value = (value, fallback) => value === undefined ? fallback : value;
const v2Record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const v2Number = (value, field, min = 0, max = 1e12, integer = false) => loadNumber(value, field, min, max, integer);
const defaultTariffBands = rate => [
  {id:"peak", startHour:17, endHour:22, rate},
  {id:"offPeak", startHour:22, endHour:7, rate},
  {id:"standard", startHour:7, endHour:17, rate}
];
const bandContainsHour = (band, hour) => band.startHour === band.endHour ? false
  : band.endHour > band.startHour ? hour >= band.startHour && hour < band.endHour
    : hour >= band.startHour || hour < band.endHour;

/** Three named bands cover all 96 quarter-hours exactly once. Equal ends disable a band. */
export function normalizeTariffBands(bands) {
  if (!Array.isArray(bands) || bands.length !== 3) throw invalidLoadInput("tariffBands", "tariffCoverage");
  const ids = new Set();
  const result = Array.from(bands, band => {
    if (!v2Record(band) || !["peak", "offPeak", "standard"].includes(band.id) || ids.has(band.id)) {
      throw invalidLoadInput("tariffBands", "tariffCoverage");
    }
    ids.add(band.id);
    const startHour = v2Number(band.startHour, "tariffBands", 0, 23.75);
    const endHour = v2Number(band.endHour, "tariffBands", 0, 24);
    if (!Number.isInteger(startHour * 4) || !Number.isInteger(endHour * 4)) throw invalidLoadInput("tariffBands", "tariffCoverage");
    return {id:band.id, startHour, endHour, rate:v2Number(band.rate, "tariffBands", 0, 1e6)};
  });
  for (let index = 0; index < 96; index++) {
    if (result.filter(band => bandContainsHour(band, index / 4)).length !== 1) {
      throw invalidLoadInput("tariffBands", "tariffCoverage");
    }
  }
  return result;
}

/** The optional second argument supplies the existing flat tariff for fresh bands. */
export function normalizeLoadV2Settings(settings = {}, baseTariff = 0) {
  if (!v2Record(settings)) throw invalidLoadInput("v2Settings");
  v2Number(baseTariff, "tariff", 0, 1e6);
  const resolutionMinutes = v2Value(settings.resolutionMinutes, 60);
  if (![15,60].includes(resolutionMinutes)) throw invalidLoadInput("resolutionMinutes");
  const frequencyHz = v2Value(settings.frequencyHz, 50);
  if (![50,60].includes(frequencyHz)) throw invalidLoadInput("frequencyHz");
  const material = v2Value(settings.material, "copper");
  if (!["copper", "aluminium"].includes(material)) throw invalidLoadInput("material");
  const conductorMM2 = v2Value(settings.conductorMM2, 2.5);
  if (!STANDARD_CONDUCTOR_MM2.includes(conductorMM2)) throw invalidLoadInput("conductorMM2");
  const capacitorConnection = v2Value(settings.capacitorConnection, "delta");
  if (!["delta", "wye"].includes(capacitorConnection)) throw invalidLoadInput("capacitorConnection");
  const touEnabled = v2Value(settings.touEnabled, false);
  if (typeof touEnabled !== "boolean") throw invalidLoadInput("touEnabled");
  let tariffBands;
  try { tariffBands = normalizeTariffBands(v2Value(settings.tariffBands, defaultTariffBands(baseTariff))); }
  catch (error) {
    if (touEnabled) throw error;
    // An unfinished, disabled TOU form cannot invalidate flat-rate calculations.
    tariffBands = defaultTariffBands(baseTariff);
  }
  const monthlyFactors = v2Value(settings.monthlyFactors, Array(12).fill(1));
  if (!Array.isArray(monthlyFactors) || monthlyFactors.length !== 12) throw invalidLoadInput("monthlyFactors");
  const optional = field => settings[field] === undefined || settings[field] === null ? null : v2Number(settings[field], field);
  const pfRealKW = v2Number(v2Value(settings.pfRealKW, 0), "pfRealKW");
  const pfOld = v2Number(v2Value(settings.pfOld, 0.8), "pfOld", 0, 1);
  const pfNew = v2Number(v2Value(settings.pfNew, 0.95), "pfNew", 0, 1);
  if (pfRealKW > 0 && (pfOld === 0 || pfNew === 0)) throw invalidLoadInput(pfOld === 0 ? "pfOld" : "pfNew", "zeroPowerFactor");
  return {
    resolutionMinutes, breakerRatingA:optional("breakerRatingA"), gridCurrentLimitA:optional("gridCurrentLimitA"),
    cableLengthM:v2Number(v2Value(settings.cableLengthM, 10), "cableLengthM", Number.MIN_VALUE),
    conductorMM2, material, frequencyHz, capacitorConnection, pfOld, pfNew, pfRealKW,
    penaltyRate:v2Number(v2Value(settings.penaltyRate, 0), "penaltyRate", 0, 1e6),
    touEnabled, tariffBands,
    monthlyFactors:Array.from(monthlyFactors, value => v2Number(value, "monthlyFactors", 0, 1000)),
    selectedMonth:v2Number(v2Value(settings.selectedMonth, 1), "selectedMonth", 1, 12, true)
  };
}

function currentFromPower(kW, pf, settings) {
  loadNumber(kW, "realPowerKW");loadNumber(pf, "pf", 0, 1);
  if (kW === 0) return 0;
  if (pf === 0) throw invalidLoadInput("pf", "zeroPowerFactor");
  return finite(kW / pf / settings.voltage * (1000 / (settings.phase === "three" ? Math.sqrt(3) : 1)));
}

/** Running-current estimate; three-phase voltage is line-to-line and loads balanced. */
export function designCurrentA(kW, pf, settings = {}) {
  return currentFromPower(kW, pf, normalizeLoadSettings(settings));
}

function ratedDevice(device) {
  const d = normalizeLoadV2Device(device), kW = finite(d.watts / 1000 * d.quantity);
  if (kW > 0 && d.pf === 0) throw invalidLoadInput("pf", "zeroPowerFactor");
  return {device:d, kW};
}

export function ratedCurrentA(device, settings = {}) {
  const rated = ratedDevice(device);
  return currentFromPower(rated.kW, rated.device.pf, normalizeLoadSettings(settings));
}

/** Nameplate current, including quantity; duty and forecast demand factors do not reduce surge. */
export function inrushCurrentA(device, settings = {}) {
  const d = normalizeLoadV2Device(device);
  return finite(ratedCurrentA(d, settings) * d.inrushMultiplier);
}

/** Same-operating-PF starting-kW estimate for the broad inductive/motor category. */
export function motorStartingKW(device) {
  const rated = ratedDevice(device);
  return rated.device.type === "inductive" ? finite(rated.kW * rated.device.inrushMultiplier) : 0;
}

/** Requested 125% planning candidate, not a verified protection-device selection. */
export function suggestedBreakerA(currentA) {
  loadNumber(currentA, "designCurrentA");
  const target = finite(currentA * 1.25);
  return STANDARD_BREAKER_AMPS.find(rating => rating >= target) ?? null;
}

/** Microfarads per element: one single-phase element or three identical wye/delta elements. */
export function capacitorMicrofarads(correctionKVAR, settings = {}) {
  loadNumber(correctionKVAR, "correctionKVAR");
  const supply = normalizeLoadSettings(settings), options = normalizeLoadV2Settings(settings);
  const branches = supply.phase === "three" && options.capacitorConnection === "delta" ? 3 : 1;
  return finite(correctionKVAR / options.frequencyHz / supply.voltage / supply.voltage * (1e9 / (2 * Math.PI * branches)));
}

export function powerFactorCorrectionDetails(kW, pfOld, pfNew, settings = {}) {
  const supply = normalizeLoadSettings(settings), options = normalizeLoadV2Settings(settings);
  const correctionKVAR = powerFactorCorrectionKVAR(kW, pfOld, pfNew);
  const beforeKVA = kW === 0 ? 0 : finite(kW / pfOld), afterKVA = kW === 0 ? 0 : finite(kW / pfNew);
  const reducedKVA = finite(beforeKVA - afterKVA);
  return {
    correctionKVAR, beforeKVA, afterKVA, reducedKVA,
    capacitanceUF:correctionKVAR < 0 ? null : capacitorMicrofarads(correctionKVAR, {...supply, ...options}),
    penaltySavings:finite(Math.max(0, reducedKVA) * options.penaltyRate),
    capacitorCount:supply.phase === "three" ? 3 : 1,
    elementVoltageV:supply.phase === "three" && options.capacitorConnection === "wye" ? supply.voltage / Math.sqrt(3) : supply.voltage,
    frequencyHz:options.frequencyHz, capacitorConnection:supply.phase === "single" ? "single" : options.capacitorConnection
  };
}

/** R-only longitudinal drop. One-way metres; guide estimates: Cu .0237, Al .0376 ohm mm²/m. */
export function voltageDropEstimate(settings = {}) {
  const supply = normalizeLoadSettings(settings), options = normalizeLoadV2Settings(settings);
  const currentA = loadNumber(v2Value(settings.currentA, 0), "currentA");
  const pf = loadNumber(v2Value(settings.pf, 1), "pf", 0, 1);
  const resistivity = options.material === "copper" ? 0.0237 : 0.0376;
  const resistanceOhm = finite(resistivity * options.cableLengthM / options.conductorMM2);
  const dropV = finite(currentA * pf * resistanceOhm * (supply.phase === "three" ? Math.sqrt(3) : 2));
  const dropPercent = finite(dropV / supply.voltage * 100);
  return {resistanceOhm, resistivity, dropV, dropPercent, exceedsFivePercent:dropPercent > 5};
}

/** Daily-only generation is allocated proportionally to gross energy; no dispatch is invented. */
export function calculateTimeOfUse(profile, tariffBands, renewableOffsetKWh = 0) {
  const normalized = normalizeTariffBands(tariffBands);
  profileStatistics(profile);loadNumber(renewableOffsetKWh, "renewableOffsetKWh");
  const bands = normalized.map(band => ({...band, kWh:0, grossCost:0}));
  const quartersPerPoint = 96 / profile.length;
  for (let index = 0; index < 96; index++) {
    const band = bands.find(value => bandContainsHour(value, index / 4));
    const kWh = finite(profile[Math.floor(index / quartersPerPoint)].kW / 4);
    band.kWh = finite(band.kWh + kWh);band.grossCost = finite(band.grossCost + finite(kWh * band.rate));
  }
  const dailyKWh = sum(bands.map(band => band.kWh)), grossCost = sum(bands.map(band => band.grossCost));
  const renewableAppliedKWh = Math.min(dailyKWh, renewableOffsetKWh), netKWh = Math.max(0, dailyKWh - renewableAppliedKWh);
  const netFraction = dailyKWh ? netKWh / dailyKWh : 0;
  const costs = bands.map(band => {
    const netCost = finite(band.grossCost * netFraction);
    return {...band, netKWh:finite(band.kWh * netFraction), netCost, renewableCredit:finite(band.grossCost - netCost)};
  });
  const netCost = sum(costs.map(band => band.netCost));
  return {dailyKWh, netKWh, grossCost, netCost, renewableCredit:finite(grossCost - netCost),
    renewableAppliedKWh, excessRenewableKWh:Math.max(0, renewableOffsetKWh - dailyKWh), bands:costs};
}

function seasonalDay(coefficients, monthlyFactor, renewableOffsetKWh) {
  const grossRows = coefficients.map((item, index) => ({index,
    dailyKWh:finite(item.activeKWh * monthlyFactor + item.standbyKWh),
    grossCost:finite(item.activeCost * monthlyFactor + item.standbyCost)
  }));
  const dailyKWh = sum(grossRows.map(row => row.dailyKWh)), grossCost = sum(grossRows.map(row => row.grossCost));
  const renewableAppliedKWh = Math.min(dailyKWh, renewableOffsetKWh), netKWh = Math.max(0, dailyKWh - renewableAppliedKWh);
  const netFraction = dailyKWh ? netKWh / dailyKWh : 0;
  const deviceCosts = grossRows.map(row => {
    const netCost = finite(row.grossCost * netFraction);
    return {...row, netKWh:finite(row.dailyKWh * netFraction), netCost, renewableCredit:finite(row.grossCost - netCost)};
  });
  const netCost = sum(deviceCosts.map(row => row.netCost));
  return {dailyKWh, netKWh, grossCost, netCost, renewableCredit:finite(grossCost - netCost), renewableAppliedKWh, deviceCosts};
}

/**
 * v2 daily inputs remain the base scenario. Selected-month values project 30 days;
 * annual values sum 12 independently costed seasons over fixed 365-day weights.
 * Annual deviceCosts use kWh (and dailyKWh as a uniform-schema alias) for yearly energy.
 */
export function calculateLoadV2Summary(devices, settings = {}, v2Settings = {}) {
  const ds = normalizeLoadV2Devices(devices), s = normalizeLoadSettings(settings);
  const options = normalizeLoadV2Settings(v2Settings, s.tariff);
  const legacy = calculateLoadSummary(ds, s), scale = loadScenarioScale(s);
  const effectiveBands = options.touEnabled ? options.tariffBands : options.tariffBands.map(band => ({...band, rate:s.tariff}));
  const rates = Array.from({length:96}, (_, index) => effectiveBands.find(band => bandContainsHour(band, index / 4)).rate);
  const quarterProfile = Array.from({length:96}, (_, index) => ({hour:index / 4, kW:0}));
  // One schedule evaluation per device supplies both active and standby fractions.
  // Twelve seasons then reuse scalar energy/cost coefficients rather than profiles.
  const coefficients = ds.map(device => {
    const fractions = generate15minProfile([{...device, watts:1000, powerUnit:"W", quantity:1,
      dutyCycle:100, standbyW:0, seasonalFactor:1, pf:1}], {occupancySchedule:s.occupancySchedule});
    const activeKW = finite(energyPerHourKWh(device) * device.seasonalFactor * scale);
    const standbyKW = finite(device.standbyW / 1000 * device.quantity * scale);
    let activeCost = 0, standbyCost = 0;
    for (let index = 0; index < 96; index++) {
      const active = finite(activeKW * fractions[index].kW), standby = finite(standbyKW * (1 - fractions[index].kW));
      quarterProfile[index].kW = finite(quarterProfile[index].kW + finite(active + standby));
      activeCost = finite(activeCost + finite(active / 4 * rates[index]));
      standbyCost = finite(standbyCost + finite(standby / 4 * rates[index]));
    }
    return {activeKWh:finite(dailyConsumptionKWh(device) * scale), standbyKWh:finite(standbyEnergyKWh(device) * scale), activeCost, standbyCost};
  });
  const renewableOffset = legacy.renewableAvailableKWh;
  const day = seasonalDay(coefficients, 1, renewableOffset);
  const months = options.monthlyFactors.map((factor, index) => ({month:index + 1, factor, days:PROJECTION_MONTH_DAYS[index],
    ...seasonalDay(coefficients, factor, renewableOffset)}));
  const annualDeviceCosts = ds.map((_, index) => {
    const kWh = sum(months.map(month => finite(month.deviceCosts[index].dailyKWh * month.days)));
    const grossCost = sum(months.map(month => finite(month.deviceCosts[index].grossCost * month.days)));
    const netCost = sum(months.map(month => finite(month.deviceCosts[index].netCost * month.days)));
    return {index, kWh, dailyKWh:kWh, netKWh:sum(months.map(month => finite(month.deviceCosts[index].netKWh * month.days))),
      grossCost, netCost, renewableCredit:finite(grossCost - netCost)};
  });
  const annualGrossCost = sum(annualDeviceCosts.map(row => row.grossCost)), annualNetCost = sum(annualDeviceCosts.map(row => row.netCost));
  const annual = {days:365, kWh:sum(annualDeviceCosts.map(row => row.kWh)), netKWh:sum(annualDeviceCosts.map(row => row.netKWh)),
    grossCost:annualGrossCost, netCost:annualNetCost, renewableCredit:finite(annualGrossCost - annualNetCost), deviceCosts:annualDeviceCosts};
  const selected = months[options.selectedMonth - 1];
  const profile = options.resolutionMinutes === 15 ? quarterProfile : Array.from({length:24}, (_, hour) => ({hour,
    kW:sum(quarterProfile.slice(hour * 4, hour * 4 + 4).map(point => point.kW / 4))}));
  const profileStats = profileStatistics(profile);
  const rawScale = finite(s.households * (1 + s.growthMargin / 100));
  const rated = ds.map(device => {
    if (rawScale === 0) return {ratedCurrentA:0, surgeCurrentA:0, startingKW:0};
    // A legacy zero-duty device may have PF=0. Its energy is still defined;
    // only its positive-nameplate current and inductive starting estimate are unknown.
    if (device.watts > 0 && device.quantity > 0 && device.pf === 0) {
      return {ratedCurrentA:null, surgeCurrentA:null, startingKW:device.type === "inductive" ? null : 0};
    }
    return {ratedCurrentA:finite(ratedCurrentA(device, s) * rawScale),
      surgeCurrentA:finite(inrushCurrentA(device, s) * rawScale), startingKW:finite(motorStartingKW(device) * rawScale)};
  });
  const startingUnavailable = rated.some(row => row.surgeCurrentA === null);
  const surgeCurrentA = startingUnavailable ? null : sum(rated.map(row => row.surgeCurrentA));
  const startingKW = rated.some(row => row.startingKW === null) ? null : sum(rated.map(row => row.startingKW));
  const current = legacy.lineCurrentA, operatingPF = legacy.apparentPowerKVA ? legacy.realPowerKW / legacy.apparentPowerKVA : 1;
  const summary = {...legacy,
    dailyCost:day.netCost, grossDailyCost:day.grossCost, renewableSavings:day.renewableCredit,
    monthlyKWh:finite(selected.dailyKWh * 30), annualKWh:annual.kWh,
    monthlyCost:finite(selected.netCost * 30), annualCost:annual.netCost,
    profile, peakDemandKW:profileStats.peakKW, averageLoadKW:profileStats.averageKW,
    loadFactor:profileStats.peakKW ? Math.min(1, finite(profileStats.averageKW / profileStats.peakKW)) : 0,
    gridLimitExceeded:s.gridLimitKW !== null && profileStats.peakKW > s.gridLimitKW,
    peakThresholdExceeded:s.peakThresholdKW !== null && profileStats.peakKW > s.peakThresholdKW,
    breakdown:legacy.breakdown.map(row => ({...row, ...rated[row.index],
      dailyCost:day.deviceCosts[row.index].netCost, grossDailyCost:day.deviceCosts[row.index].grossCost,
      renewableCredit:day.deviceCosts[row.index].renewableCredit, netKWh:day.deviceCosts[row.index].netKWh,
      carbonKgCO2:carbonFootprintKgCO2(day.deviceCosts[row.index].netKWh, s.co2Factor),
      grossCarbonKgCO2:carbonFootprintKgCO2(row.dailyKWh, s.co2Factor)}))
  };
  return {summary, profileStats, bandCosts:calculateTimeOfUse(quarterProfile, effectiveBands, renewableOffset).bands,
    seasonal:{months, annual, selectedMonth:options.selectedMonth}, surgeCurrentA, startingKW, startingUnavailable,
    designCurrentA:current, suggestedBreakerA:suggestedBreakerA(current),
    voltageDrop:voltageDropEstimate({...s, ...options, currentA:current, pf:operatingPF}),
    correction:powerFactorCorrectionDetails(options.pfRealKW, options.pfOld, options.pfNew, {...s, ...options}),
    connectedLimitExceeded:s.gridLimitKW !== null && legacy.projectedConnectedLoadKW > s.gridLimitKW,
    surgeBreakerExceeded:options.breakerRatingA === null ? false : startingUnavailable ? null : surgeCurrentA > options.breakerRatingA,
    surgeGridExceeded:options.gridCurrentLimitA === null ? false : startingUnavailable ? null : surgeCurrentA > options.gridCurrentLimitA
  };
}

// Customer estimate assembly has no storage, clock, randomness or DOM effects.
const BILL_ASSUMPTION_KEYS = Object.freeze([
  "load.message.estimates", "load.help.factors", "load.help.renewables", "load.help.battery",
  "load.help.currency", "loadV2.help.seasonal", "loadV2.help.renewableCredit",
  "loadV2.help.localCode", "loadV2.bill.noFinalInvoice"
]);

function billDate(value, field = "date", code = "invalidDate") {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw invalidLoadInput(field, code);
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) throw invalidLoadInput(field, code);
  return value;
}

/** The caller supplies its local calendar date and optional session sequence. */
export function makeEstimateReference(date, sequence = 1) {
  billDate(date);loadNumber(sequence, "sequence", 0, 9999, true);
  return `EST-${date.replaceAll("-", "")}-${String(sequence).padStart(4, "0")}`;
}

function billText(value, field, maximum, optional = false) {
  if (value === undefined || (typeof value === "string" && value.trim() === "")) {
    if (optional) return "";
    throw invalidLoadInput(field, "requiredField");
  }
  if (typeof value !== "string" || value.length > maximum) throw invalidLoadInput(field, "invalidText");
  return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n").trim();
}

function billSafeCents(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw invalidLoadInput("money", "overflow");
  return value;
}

/** Half-up rounding, with a tiny bounded tolerance for floating-point residue. */
function billRoundInteger(value) {
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) throw invalidLoadInput("money", "overflow");
  const lower = Math.floor(value);
  const tolerance = Math.min(1e-7, 8 * Number.EPSILON * Math.max(1, value));
  return billSafeCents(lower + (value - lower >= 0.5 - tolerance ? 1 : 0));
}
const billCents = value => billRoundInteger(value * 100);
const billSumCents = (rows, field) => rows.reduce((total, row) => billSafeCents(total + row[field]), 0);

function billPeriodRows(rows, multiplier) {
  return rows.map(row => {
    const grossCents = billCents(row.grossCost * multiplier), netCents = billCents(row.netCost * multiplier);
    return {index:row.index, kWh:finite(row.dailyKWh * multiplier), netKWh:finite(row.netKWh * multiplier),
      grossCents, netCents, creditCents:billSafeCents(grossCents - netCents)};
  });
}

/**
 * Pure customer estimate. Device rows retain entry order and base-day energy /
 * cost; the explicit period charge uses the selected seasonal month (30 days),
 * weighted year (365 days), or base daily scenario for day/custom periods.
 * Each net period line is rounded to cents before subtotal and tax. Renewable
 * credit is already included in these lines and is never deducted a second time.
 */
export function assembleLoadBill(devices, settings = {}, v2Settings = {}, billing = {}) {
  if (!v2Record(billing)) throw invalidLoadInput("billing");
  const customer = {
    name:billText(billing.customerName, "customerName", 120),
    phone:billText(billing.phone, "phone", 60),
    email:billText(billing.email, "email", 254, true),
    address:billText(billing.address, "address", 2000)
  };
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(customer.email)) throw invalidLoadInput("email", "invalidEmail");
  const date = billDate(billing.date);
  if (typeof billing.reference !== "string" || !/^EST-\d{8}-\d{4}$/.test(billing.reference)) throw invalidLoadInput("reference", "invalidReference");
  const reference = billing.reference;
  billDate(`${reference.slice(4,8)}-${reference.slice(8,10)}-${reference.slice(10,12)}`, "reference", "invalidReference");
  const taxPercent = loadNumber(v2Value(billing.taxPercent, 0), "taxPercent", 0, 100);
  const taxLabel = billText(v2Value(billing.taxLabel, "VAT"), "taxLabel", 60);
  const billingBasis = v2Value(billing.billingBasis, "day");
  if (!["day", "month", "year", "custom"].includes(billingBasis)) throw invalidLoadInput("billingBasis");
  const days = billingBasis === "custom" ? loadNumber(billing.customDays, "customDays", 1, 3650, true)
    : {day:1, month:30, year:365}[billingBasis];
  const ds = normalizeLoadV2Devices(devices), supply = normalizeLoadSettings(settings);
  const options = normalizeLoadV2Settings(v2Settings, supply.tariff);
  const currency = v2Value(settings.currency, "EUR");
  if (!["EUR", "NGN", "USD", "GBP"].includes(currency)) throw invalidLoadInput("currency");
  const result = calculateLoadV2Summary(ds, supply, options), base = result.summary;
  const byIndex = new Map(base.breakdown.map(row => [row.index, row]));
  const dailyRows = ds.map((_, index) => {
    const row = byIndex.get(index);
    return {index, dailyKWh:row.dailyKWh, netKWh:row.netKWh, grossCost:row.grossDailyCost, netCost:row.dailyCost};
  });
  const selected = result.seasonal.months[options.selectedMonth - 1];
  const daily = billPeriodRows(dailyRows, 1), monthly = billPeriodRows(selected.deviceCosts, 30);
  const annual = billPeriodRows(result.seasonal.annual.deviceCosts, 1);
  const period = billingBasis === "month" ? monthly : billingBasis === "year" ? annual
    : billingBasis === "custom" ? billPeriodRows(dailyRows, days) : daily;
  const subtotalCents = billSumCents(period, "netCents");
  const taxAmountCents = billRoundInteger(subtotalCents * (taxPercent / 100));
  const grandTotalCents = billSafeCents(subtotalCents + taxAmountCents);
  const lineItems = ds.map((device, index) => ({
    index, description:device.name, quantity:device.quantity, ratedW:device.watts, hoursPerDay:device.hoursPerDay,
    dailyKWh:daily[index].kWh, dailyCost:daily[index].netCents / 100,
    grossDailyCost:daily[index].grossCents / 100, renewableCredit:daily[index].creditCents / 100,
    periodKWh:period[index].kWh, periodNetKWh:period[index].netKWh,
    periodCost:period[index].netCents / 100, periodCostCents:period[index].netCents,
    periodGrossCost:period[index].grossCents / 100, periodRenewableCredit:period[index].creditCents / 100
  }));
  return {
    company:LOAD_COMPANY, customer, reference, date, currency,
    basis:{type:billingBasis, days, selectedMonth:options.selectedMonth,
      factor:billingBasis === "month" ? selected.factor : billingBasis === "year" ? null : 1,
      monthlyFactors:[...options.monthlyFactors]},
    lineItems,
    summary:{
      connectedLoadKW:base.connectedLoadKW, projectedConnectedLoadKW:base.projectedConnectedLoadKW,
      peakDemandKW:base.peakDemandKW, dailyKWh:base.dailyKWh, monthlyKWh:base.monthlyKWh, annualKWh:base.annualKWh,
      tariff:{mode:options.touEnabled ? "tou" : "flat", rate:supply.tariff, currency,
        bands:options.touEnabled ? options.tariffBands.map(band => ({...band})) : []},
      dailyCost:billSumCents(daily, "netCents") / 100, monthlyCost:billSumCents(monthly, "netCents") / 100,
      annualCost:billSumCents(annual, "netCents") / 100, grossDailyCost:billSumCents(daily, "grossCents") / 100,
      renewableSavings:billSumCents(daily, "creditCents") / 100,
      renewableAvailableKWh:base.renewableAvailableKWh, renewableAppliedKWh:base.renewableAppliedKWh, netGridKWh:base.netGridKWh,
      periodKWh:sum(period.map(row => row.kWh)), periodNetGridKWh:sum(period.map(row => row.netKWh)),
      periodGrossCost:billSumCents(period, "grossCents") / 100,
      periodRenewableCredit:billSumCents(period, "creditCents") / 100, periodNetGridCost:subtotalCents / 100,
      households:supply.households, demandFactor:supply.demandFactor, diversityFactor:supply.diversityFactor, growthMargin:supply.growthMargin
    },
    taxPercent, taxLabel, subtotal:subtotalCents / 100, taxAmount:taxAmountCents / 100, grandTotal:grandTotalCents / 100,
    subtotalCents, taxAmountCents, grandTotalCents, assumptionKeys:[...BILL_ASSUMPTION_KEYS]
  };
}
