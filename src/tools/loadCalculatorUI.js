import {I} from "../i18n.js";
import {LOAD_PRESETS, RENEWABLE_PRESETS} from "../data/loadPresets.js";
import {calculateLoadSummary} from "../calculators/loadCalculator.js";
import {MAX_LOAD_DEVICES, normalizeLoadDevice, normalizeLoadSettings, invalidLoadInput} from "../calculators/loadProfile.js";
import {LOAD_COPY, loadText} from "./loadCalculator-i18n.js";

export const LOAD_TOOL_KEY = "electrical-load";
const CURRENCIES = ["EUR", "NGN", "USD", "GBP"];
const RESULT_UNITS = {
  connectedLoadKW:"kW",projectedConnectedLoadKW:"kW",demandAdjustedConnectedKW:"kW",
  realPowerKW:"kW",reactivePowerKVAR:"kVAR",apparentPowerKVA:"kVA",lineCurrentA:"A",
  peakDemandKW:"kW",averageLoadKW:"kW",loadFactor:"%",dailyKWh:"kWh",weeklyKWh:"kWh",
  monthlyKWh:"kWh",annualKWh:"kWh",standbyKWh:"kWh",netGridKWh:"kWh",
  dailyCost:"currency",monthlyCost:"currency",annualCost:"currency",grossDailyCost:"currency",
  carbonKgCO2:"kg CO₂",grossCarbonKgCO2:"kg CO₂",renewableSavings:"currency",
  renewableAvailableKWh:"kWh",renewableAppliedKWh:"kWh",excessRenewableKWh:"kWh",
  intervalEnergyWh:"Wh",batteryHours:"hours"
};

/** Called only by the explicitly approved router integration. */
export function registerLoadCalculator(keys) {
  if (keys.includes(LOAD_TOOL_KEY)) return;
  for (const lang of Object.keys(LOAD_COPY)) {
    const copy = I[lang];
    if (![copy.names, copy.groups, copy.descriptions].every(Array.isArray)) throw new Error("Load the existing catalogue before registering the electrical calculator");
  }
  keys.push(LOAD_TOOL_KEY);
  for (const lang of Object.keys(LOAD_COPY)) {
    I[lang].names.push(loadText(lang, "title"));
    I[lang].groups.push(loadText(lang, "category"));
    I[lang].descriptions.push(loadText(lang, "description"));
    I[lang].toolCategoryByKey = {...I[lang].toolCategoryByKey, [LOAD_TOOL_KEY]: "Math"};
  }
}

export function createLoadState() {
  return {
    devices: [], editing: null,
    settings: {...normalizeLoadSettings({tariff:0.3}), currency:"EUR", occupancyEnabled:false, startHour:18, endHour:22},
    draft: {...LOAD_PRESETS[0], preset:LOAD_PRESETS[0].id, name:"", powerUnit:"W", quantity:1, hoursPerDay:8, dutyCycle:100, seasonalFactor:1}
  };
}
let sessionState = createLoadState();
let mountNumber = 0;

function csvCell(value) {
  if (typeof value === "number") {
    const rounded = Number(value.toPrecision(15));
    if (Number.isFinite(rounded)) value = rounded;
  }
  let text = String(value ?? "");
  // Text cells beginning with formula markers (including after whitespace) are
  // escaped for spreadsheet applications. Numeric cells stay machine-readable.
  if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+@-]/u.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

/** Local CSV contains inputs as well as outputs; numeric values use decimal dots. */
export function buildLoadCsv(devices, settings = {}, lang = "en") {
  const t = (key, params) => loadText(lang, key, params);
  const s = normalizeLoadSettings(settings), r = calculateLoadSummary(devices, s);
  const currency = CURRENCIES.includes(settings.currency) ? settings.currency : "EUR";
  const rows = [[t("title")], [t("message.estimates")], [], [t("csv.summary")]];
  for (const [key, unit] of Object.entries(RESULT_UNITS)) rows.push([
    t("result." + key), r[key] === null ? t("notApplicable") : key === "loadFactor" ? r[key] * 100 : r[key],
    unit === "currency" ? currency : unit === "hours" ? t("unit.hours") : unit
  ]);
  rows.push([], [t("csv.settings")]);
  for (const [key, value] of Object.entries(s)) {
    if (key === "occupancySchedule") continue;
    rows.push([t("field." + key), value === null ? t("notApplicable") : ["phase", "measurementInterval"].includes(key) ? t("option." + value) : value]);
  }
  rows.push([t("field.currency"), currency]);
  rows.push([t("field.occupancyEnabled"), s.occupancySchedule ? 1 : 0]);
  if (s.occupancySchedule) rows.push([t("field.startHour"), s.occupancySchedule.startHour], [t("field.endHour"), s.occupancySchedule.endHour]);
  const columns = ["name", "quantity", "watts", "hoursPerDay", "dutyCycle", "standbyW", "pf", "type", "seasonalFactor"];
  rows.push([], [t("csv.devices")], [...columns.map(key => t("field." + key)), t("result.activeKWh"), t("result.standbyKWh"), t("result.dailyKWh")]);
  for (const item of r.breakdown) {
    const d = normalizeLoadDevice(devices[item.index]);
    rows.push([...columns.map(key => key === "type" ? t("option." + d[key]) : d[key]), item.activeKWh, item.standbyKWh, item.dailyKWh]);
  }
  rows.push([], [t("profile")], [t("hour"), t("loadKW")]);
  r.profile.forEach(point => rows.push([point.hour, point.kW]));
  rows.push([], [t("assumptions")]);
  for (const key of ["factors", "schedule", "profile", "power", "standby", "renewables", "battery", "co2", "periods", "currency"]) rows.push([t("help." + key)]);
  return "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

// Component styles consume the established product tokens; no token, brand,
// logo or BOT definitions are introduced. Print rules apply only to this tool.
const STYLES = `
.load-calculator{min-width:0;color:var(--navy)}
.load-calculator .load-input-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:1rem;margin:1rem 0}
.load-calculator fieldset{min-width:0;margin:0;padding:1rem;border:1px solid var(--line);border-radius:12px}
.load-calculator legend{padding:0 .4rem;font-weight:750;color:var(--navy)}
.load-calculator .load-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
.load-calculator .load-wide{grid-column:1/-1}
.load-calculator .field{display:block;margin:0}
.load-calculator .field input,.load-calculator .field select{font-variant-numeric:tabular-nums}
.load-calculator .field input[type=checkbox]{width:1.2rem;height:1.2rem;accent-color:var(--violet)}
.load-calculator .load-help,.load-calculator .load-error{display:block;font-size:.8rem;line-height:1.5;margin:.4rem 0 0;overflow-wrap:anywhere}
.load-calculator .load-help{color:var(--muted)}
.load-calculator .load-error{font-weight:650;color:var(--navy);border-left:3px solid var(--gold);padding-left:.5rem}
.load-calculator [aria-invalid=true]{border:2px solid var(--gold)}
.load-calculator .load-actions{display:flex;gap:.6rem;flex-wrap:wrap;margin:1rem 0}
.load-calculator button:disabled{opacity:.55;cursor:not-allowed}
.load-calculator .load-table-scroll{width:100%;max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:10px;margin:.8rem 0}
.load-calculator table{border-collapse:collapse;width:100%;font-size:.82rem;font-variant-numeric:tabular-nums}
.load-calculator th,.load-calculator td{padding:.65rem;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
.load-calculator th{background:color-mix(in srgb,var(--violet) 12%,white);color:var(--navy)}
.load-calculator .load-device-table{min-width:850px}
.load-calculator td:first-child{overflow-wrap:anywhere;max-width:200px}
.load-calculator .load-row-actions{display:flex;gap:.4rem}
.load-calculator .load-row-actions button{font-size:.8rem;padding:.4rem .6rem}
.load-calculator .load-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:.7rem;margin:1rem 0}
.load-calculator .load-metric{padding:.9rem;border:1px solid var(--line);border-radius:10px;border-top:3px solid var(--violet);min-width:0}
.load-calculator dt{font-size:.78rem;color:var(--muted);line-height:1.4}
.load-calculator dd{margin:.5rem 0 0;font-weight:750;font-size:1.1rem;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.load-calculator .load-alert{padding:.8rem;margin:.6rem 0;border:1px solid var(--gold);border-left:4px solid var(--gold);border-radius:8px}
.load-calculator .load-chart{width:100%;height:auto;display:block;margin:.8rem 0}
.load-calculator .load-chart text{fill:var(--muted);font:12px ui-sans-serif,system-ui,sans-serif}
.load-calculator .load-chart line{stroke:var(--line)}
.load-calculator .load-chart rect{fill:var(--violet)}
.load-calculator details{margin:1rem 0}
.load-calculator summary{cursor:pointer;font-weight:700;padding:.35rem 0}
.load-calculator .load-visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.load-calculator .load-print-settings{display:none}
@media(max-width:1000px){.load-calculator .load-input-layout{grid-template-columns:minmax(0,1fr)}}
@media(max-width:480px){.load-calculator .load-fields{grid-template-columns:minmax(0,1fr)}.load-calculator fieldset{padding:.7rem}.load-calculator .load-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.load-calculator dd{font-size:.95rem}}
@media print{
 body:has(.load-calculator) header,body:has(.load-calculator) footer,body:has(.load-calculator) .intro,body:has(.load-calculator) aside,body:has(.load-calculator) .skip,body:has(.load-calculator) .back-directory{display:none!important}
 body:has(.load-calculator) main{max-width:none;padding:0}.load-calculator .load-input-layout,.load-calculator .load-actions,.load-calculator button,.load-calculator .load-row-actions,.load-calculator .load-screen-only{display:none!important}
 #panel[data-tool-key=electrical-load]{border:0;box-shadow:none;padding:0;min-height:0}
 .load-calculator .load-print-settings{display:block}.load-calculator .load-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.load-calculator .load-metric,.load-calculator .load-chart{break-inside:avoid}
 .load-calculator .load-table-scroll{overflow:visible;border:0}.load-calculator .load-device-table{min-width:0;font-size:8pt}.load-calculator th,.load-calculator td{padding:.3rem}
 .load-calculator .load-chart{max-height:220px}.load-calculator th,.load-calculator .load-metric,.load-calculator svg{print-color-adjust:exact;-webkit-print-color-adjust:exact}
 .load-calculator thead{display:table-header-group}.load-calculator tr{break-inside:avoid}
}`;

export function mountLoadCalculator() {
  throw new Error("Electrical UI mounting is the next bounded implementation step");
}
