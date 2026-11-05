import {
  finiteLoadResult as finite, generate24hProfile, invalidLoadInput,
  loadNumber, loadScenarioScale, normalizeLoadDevice, normalizeLoadDevices, normalizeLoadSettings
} from "./loadProfile.js";

const sum = values => finite(values.reduce((total, value) => finite(total + value), 0));
const factor = value => loadNumber(value, "factor", 0, 1);
const activeW = d => finite(d.watts * d.quantity * (d.dutyCycle / 100));
// Equivalent to tan(acos(pf)); the product is more stable near unity PF.
const tangent = pf => pf === 1 ? 0 : Math.sqrt((1 - pf) * (1 + pf)) / pf;

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
  return finite(kW * (tangent(pfOld) - tangent(pfNew)));
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
