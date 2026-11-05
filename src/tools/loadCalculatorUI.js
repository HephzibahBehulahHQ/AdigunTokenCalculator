import {I} from "../i18n.js";
import {LOAD_PRESETS, RENEWABLE_PRESETS} from "../data/loadPresets.js";
import {calculateLoadSummary, calculateLoadV2Summary, normalizeLoadV2Settings,
  STANDARD_CONDUCTOR_MM2, assembleLoadBill, makeEstimateReference} from "../calculators/loadCalculator.js";
import {MAX_LOAD_DEVICES, normalizeLoadDevice, normalizeLoadV2Device, normalizeLoadSettings, invalidLoadInput} from "../calculators/loadProfile.js";
import {LOAD_COPY, loadText} from "./loadCalculator-i18n.js";
import {saveLoadV2Profile, readLoadV2Profile, deleteLoadProfile} from "./loadProfileStorage.js";
import {LOAD_V2_COPY, loadV2Text} from "./loadV2-i18n.js";
import {LOAD_COMPANY} from "../data/loadCompany.js";

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

function createBillingState() {
  const now=new Date();
  const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
  const sequence=typeof crypto!=="undefined"&&crypto.getRandomValues
    ?crypto.getRandomValues(new Uint32Array(1))[0]%10000:Math.floor(Math.random()*10000);
  return {customerName:"",phone:"",email:"",address:"",reference:makeEstimateReference(date,sequence),date,
    taxPercent:0,taxLabel:"VAT",billingBasis:"day",customDays:30};
}

function flatV2Values(options) {
  const result = {...options};
  for (const band of options.tariffBands) {
    result[band.id+"Rate"]=band.rate;result[band.id+"Start"]=band.startHour;result[band.id+"End"]=band.endHour;
  }
  options.monthlyFactors.forEach((value,index)=>result["month"+(index+1)]=value);
  return result;
}

export function createLoadState() {
  return {
    devices: [], editing: null,
    extensions:normalizeLoadV2Settings({},0.3), extensionDraft:null, billing:createBillingState(),
    settings: {...normalizeLoadSettings({tariff:0.3}), currency:"EUR", occupancyEnabled:false, startHour:18, endHour:22},
    draft: {...LOAD_PRESETS[0], preset:LOAD_PRESETS[0].id, name:null, powerUnit:"W", quantity:1, hoursPerDay:8, dutyCycle:100, seasonalFactor:1, deviceWindowEnabled:false, deviceStartHour:18, deviceEndHour:22}
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
  rows.push([], [t("csv.devices")], [...columns.map(key => t("field." + key) + (key === "watts" ? " (W)" : "")), t("result.activeKWh"), t("result.standbyKWh"), t("result.dailyKWh")]);
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


/** Extended CSV is a separate pure export contract; the original CSV remains unchanged. */
export function buildLoadV2Csv(devices, settings = {}, extensions = {}, lang = "en") {
  const t=(key,params)=>loadText(lang,key,params),v=(key,params)=>loadV2Text(lang,key,params);
  const s=normalizeLoadSettings(settings),x=normalizeLoadV2Settings(extensions,s.tariff);
  const analysis=calculateLoadV2Summary(devices,s,x),r=analysis.summary;
  const currency=CURRENCIES.includes(settings.currency)?settings.currency:"EUR";
  const value=n=>n===null?t("notApplicable"):n;
  const rows=[[t("title")],[t("message.estimates")],[],[t("csv.summary")]];
  for(const [key,unit] of Object.entries(RESULT_UNITS))rows.push([
    (key==="peakDemandKW"&&x.resolutionMinutes===15?v("result.peak15Demand"):t("result."+key)),value(key==="loadFactor"?r[key]*100:r[key]),
    unit==="currency"?currency:unit==="hours"?t("unit.hours"):unit
  ]);
  for(const [key,n] of [
    ["surgeCurrentA",analysis.surgeCurrentA],["startingKW",analysis.startingKW],
    ["designCurrentA",analysis.designCurrentA],["suggestedBreakerA",analysis.suggestedBreakerA],
    ["correctionKVAR",analysis.correction.correctionKVAR],["capacitanceUF",analysis.correction.capacitanceUF],
    ["reducedKVA",analysis.correction.reducedKVA],["penaltySavings",analysis.correction.penaltySavings],
    ["dropV",analysis.voltageDrop.dropV],["dropPercent",analysis.voltageDrop.dropPercent],
    ["peakAverageRatio",analysis.profileStats.peakAverageRatio]
  ])rows.push([v("result."+key),value(n),key==="penaltySavings"?currency:""]);
  rows.push([], [t("csv.settings")]);
  for(const [key,n] of Object.entries(s)){
    if(key==="occupancySchedule")continue;
    rows.push([t("field."+key),n===null?t("notApplicable"):["phase","measurementInterval"].includes(key)?t("option."+n):n]);
  }
  rows.push([t("field.currency"),currency],[t("field.occupancyEnabled"),s.occupancySchedule?1:0]);
  if(s.occupancySchedule)rows.push([t("field.startHour"),s.occupancySchedule.startHour],[t("field.endHour"),s.occupancySchedule.endHour]);
  for(const [key,n] of Object.entries(x)){
    if(["tariffBands","monthlyFactors"].includes(key))continue;
    rows.push([v("field."+key),n===null?t("notApplicable"):["material","capacitorConnection"].includes(key)?v("option."+n):typeof n==="boolean"?Number(n):n]);
  }
  rows.push([], [v("section.tou")],
    [v("section.tou"),t("field.startHour"),t("field.endHour"),t("field.tariff")+" ("+currency+"/kWh)",v("result.bandEnergy"),v("result.grossCost"),v("result.renewableCredit"),v("result.bandCost")]);
  for(const band of analysis.bandCosts)rows.push([v("band."+band.id),band.startHour,band.endHour,band.rate,band.kWh,band.grossCost,band.renewableCredit,band.netCost]);
  rows.push([], [v("section.seasonal")],
    [v("field.selectedMonth"),v("field.monthFactor"),t("result.dailyKWh"),t("result.dailyCost")]);
  for(const month of analysis.seasonal.months)rows.push([month.month,month.factor,month.dailyKWh,month.netCost]);
  const columns=["name","quantity","watts","hoursPerDay","dutyCycle","standbyW","pf","type","seasonalFactor"];
  rows.push([], [t("csv.devices")],[
    ...columns.map(key=>t("field."+key)+(key==="watts"?" (W)":"")),
    v("field.inrushMultiplier"),v("field.deviceStartHour"),v("field.deviceEndHour"),
    t("result.activeKWh"),t("result.standbyKWh"),t("result.dailyKWh"),t("result.dailyCost")+" ("+currency+")",
    v("result.ratedCurrentA"),v("result.surgeCurrentA"),v("result.startingKW"),v("result.dailyGrossCO2"),v("result.carbonKgCO2")
  ]);
  for(const row of r.breakdown){
    const d=normalizeLoadV2Device(devices[row.index]);
    rows.push([...columns.map(key=>key==="type"?t("option."+d[key]):d[key]),d.inrushMultiplier,
      value(d.operatingWindow?.startHour??null),value(d.operatingWindow?.endHour??null),
      row.activeKWh,row.standbyKWh,row.dailyKWh,row.dailyCost,
      value(row.ratedCurrentA),value(row.surgeCurrentA),value(row.startingKW),row.grossCarbonKgCO2,row.carbonKgCO2]);
  }
  rows.push([], [t("profile")], [t("hour"),t("loadKW")]);
  r.profile.forEach(point=>rows.push([point.hour,point.kW]));
  rows.push([], [v("result.cumulativeEnergy")],[t("hour"),v("result.cumulativeEnergy")]);
  analysis.profileStats.cumulative.forEach(point=>rows.push([point.hour,point.kWh]));
  rows.push([], [v("result.topPeakHours")],[t("hour"),t("loadKW")]);
  analysis.profileStats.topHours.forEach(point=>rows.push([point.hour,point.kW]));
  rows.push([], [t("assumptions")]);
  for(const key of ["factors","schedule","power","standby","renewables","battery","co2","currency"])rows.push([t("help."+key)]);
  for(const key of ["starting","breaker","pf","capacitor","deviceWindow","tou","profile","seasonal","renewableCredit","cable","localCode"])rows.push([v("help."+key)]);
  if(analysis.startingUnavailable)rows.push([v("warning.startingUnavailable")]);
  return "\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}

// Additional styles consume existing tokens. Only the customer view uses a named A4 page.
const V2_STYLES = [
  ".load-calculator [hidden]{display:none!important}",
  ".load-calculator .load-v2-options{margin-top:1rem;border-top:1px solid var(--line);padding-top:.5rem}",
  ".load-calculator .load-v2-options .load-fields{margin:.8rem 0}",
  ".load-calculator .load-chart polyline{fill:none;stroke:var(--violet);stroke-width:3}",
  ".load-calculator .load-breakdown-table{min-width:980px}",
  ".load-calculator .load-bill-form{margin-top:1.5rem}",
  ".load-calculator .load-bill-view{margin:1.5rem 0;padding:1.4rem;border:1px solid var(--line);background:white}",
  ".load-calculator .load-bill-header{display:flex;align-items:center;gap:1.2rem;border-bottom:2px solid var(--violet);padding-bottom:1rem}",
  ".load-calculator .load-bill-logo{width:100px;height:100px;object-fit:contain;flex:none}",
  ".load-calculator .load-bill-header>div{min-width:0;overflow-wrap:anywhere}.load-calculator .load-bill-header h3{margin:.3rem 0}.load-calculator .load-bill-header p{margin:.3rem 0}",
  ".load-calculator .load-bill-customer{display:grid;grid-template-columns:1fr 1fr;gap:.5rem 1.2rem;margin:1rem 0}",
  ".load-calculator .load-bill-customer p{margin:.2rem 0;overflow-wrap:anywhere;white-space:pre-wrap}",
  ".load-calculator .load-bill-customer strong{display:block;font-size:.8rem}",
  ".load-calculator .load-bill-summary{border-top:2px solid var(--violet);margin-top:1rem;padding-top:.6rem}",
  ".load-calculator .load-bill-summary dl{margin:0}.load-calculator .load-bill-total-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;padding:.45rem 0;border-bottom:1px solid var(--line)}",
  ".load-calculator .load-bill-summary dd{margin:0;font-size:.95rem;text-align:right}.load-calculator .load-bill-summary dt{font-size:.85rem;min-width:0;overflow-wrap:anywhere}.load-calculator .load-bill-summary dd{min-width:0;overflow-wrap:anywhere}",
  ".load-calculator .load-bill-grand{font-weight:800;border-top:2px solid var(--violet);border-bottom:2px solid var(--violet);padding:.8rem 0}",
  ".load-calculator .load-bill-grand dd,.load-calculator .load-bill-grand dt{font-size:1.15rem;color:var(--navy)}",
  ".load-calculator .load-bill-footer{margin-top:1rem;padding-top:.6rem;border-top:1px solid var(--line);font-size:.8rem;overflow-wrap:anywhere}",
  "@media(max-width:480px){.load-calculator .load-bill-customer{grid-template-columns:1fr}.load-calculator .load-bill-view{padding:.7rem}.load-calculator .load-bill-logo{width:72px;height:72px}.load-calculator .load-bill-header{gap:.6rem}}",
  "@media print{.load-calculator .load-bill-view{display:none!important}.load-calculator .load-breakdown-table{min-width:0;font-size:7pt}.load-calculator .load-v2-metrics{break-inside:avoid}}"
].join("\n");

function billPrintStyles(lang) {
  const v=key=>loadV2Text(lang,key);
  return [
    "@page load-estimate{size:A4;margin:14mm 12mm 22mm;",
    "@bottom-left{content:"+JSON.stringify(LOAD_COMPANY.name+" · "+LOAD_COMPANY.website)+' "\\A " '+JSON.stringify(v("bill.noFinalInvoice"))+";white-space:pre-line;width:150mm;font:8pt/1.35 ui-sans-serif,system-ui,sans-serif;}",
    "@bottom-right{content:"+JSON.stringify(v("bill.page")+" ")+' counter(page) " / " counter(pages);width:25mm;text-align:right;font:8pt ui-sans-serif,system-ui,sans-serif;}}',
    "@media print{",
    "body[data-load-bill-print]{background:white;min-width:0}",
    "body[data-load-bill-print] #panel>:not(.load-calculator){display:none!important}",
    "body[data-load-bill-print] .load-calculator>:not(.load-bill-view){display:none!important}",
    "body[data-load-bill-print] .workspace{display:block}",
    "body[data-load-bill-print] .load-calculator .load-bill-view{display:block!important;page:load-estimate;margin:0;padding:0;border:0;font-size:10pt}",
    "body[data-load-bill-print] .load-bill-header{break-inside:avoid;break-after:avoid}",
    "body[data-load-bill-print] .load-bill-logo{width:23mm;height:23mm}",
    "body[data-load-bill-print] .load-bill-customer{break-inside:avoid}",
    "body[data-load-bill-print] .load-bill-view table{width:100%;table-layout:fixed;font-size:8pt}",
    "body[data-load-bill-print] .load-bill-view th,body[data-load-bill-print] .load-bill-view td{overflow-wrap:anywhere;padding:2mm 1.3mm}",
    "body[data-load-bill-print] .load-bill-view th:first-child{width:28%}",
    "body[data-load-bill-print] .load-bill-view thead{display:table-header-group}",
    "body[data-load-bill-print] .load-bill-summary{break-inside:avoid}",
    "body[data-load-bill-print] .load-bill-footer{break-inside:avoid}",
    "body[data-load-bill-print] .load-bill-view h3,body[data-load-bill-print] .load-bill-view h4{break-after:avoid}",
    "body[data-load-bill-print] .load-bill-view .load-help{font-size:8pt;line-height:1.4}",
    "}"
  ].join("\n");
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

export function mountLoadCalculator(container, {lang = "en", state = sessionState} = {}) {
  if (!Object.hasOwn(LOAD_COPY, lang)) lang = "en";
  const doc = container.ownerDocument, view = doc.defaultView;
  const t = (key, params) => loadText(lang, key, params);
  const v = (key, params) => loadV2Text(lang, key, params);
  const locale = lang === "pcm" ? "en-NG" : lang;
  const fmt = (value, digits = 3) => new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits, ...(value !== 0 && Math.abs(value) < 0.001 ? {notation:"scientific"} : {})
  }).format(value);
  const node = (tag, text, className) => {
    const element = doc.createElement(tag);
    if (text !== undefined) element.textContent = String(text);
    if (className) element.className = className;
    return element;
  };
  if (!doc.getElementById("electrical-load-styles")) {
    const style = node("style", STYLES+"\n"+V2_STYLES);style.id = "electrical-load-styles";doc.head.append(style);
  }
  state.extensions??=normalizeLoadV2Settings({},0.3);
  state.billing??=createBillingState();
  const v2Values={...flatV2Values(state.extensions),...state.extensionDraft};
  const today=new Date();
  const localDate=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
  if(state.billing.date===null)state.billing.date=localDate;
  if(state.billing.reference===null){
    const sequence=view.crypto.getRandomValues(new Uint32Array(1))[0]%10000;
    state.billing.reference=makeEstimateReference(localDate,sequence);
  }
  const prefix = "load-" + (++mountNumber) + "-";
  const monthName=month=>new Intl.DateTimeFormat(locale,{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(2024,month-1,1)));
  const root = node("div", undefined, "load-calculator");
  const form = node("form");form.noValidate = true;
  form.addEventListener("submit", event => event.preventDefault());
  const inputLayout = node("div", undefined, "load-input-layout");
  const builder = node("fieldset"), settingsBox = node("fieldset");
  builder.append(node("legend", t("deviceBuilder")));settingsBox.append(node("legend", t("globalSettings")));
  const builderFields = node("div", undefined, "load-fields"), settingsFields = node("div", undefined, "load-fields");
  builder.append(builderFields);settingsBox.append(settingsFields);inputLayout.append(builder, settingsBox);form.append(inputLayout);
  const controls = {}, globalControls = {}, v2Controls = {}, billControls = {};
  const status = node("p", "", "load-help load-screen-only");status.setAttribute("role", "status");status.setAttribute("aria-live", "polite");
  const invalid = node("p", "", "load-alert");invalid.setAttribute("role", "alert");invalid.hidden = true;
  const results = node("section");results.dataset.loadResults = "";results.setAttribute("aria-live", "off");
  const deviceSection = node("section");deviceSection.append(node("h3", t("deviceList")));
  const deviceBody = node("div");deviceSection.append(deviceBody);form.append(deviceSection);
  const exportActions = node("div", undefined, "load-actions");
  const exportButton = button("exportCsv", "export-csv"), printButton = button("print", "print");
  exportButton.textContent=v("action.extendedCsv");
  exportActions.append(exportButton, printButton);
  const profileControls = node("section", undefined, "load-screen-only");
  const profileActions = node("div", undefined, "load-actions");
  const saveProfileButton = button("saveProfile", "save-profile");
  const loadProfileButton = button("loadProfile", "load-profile"), deleteProfileButton = button("deleteProfile", "delete-profile");
  const profileStatus = node("p", "", "load-help");profileStatus.dataset.profileStatus = "";profileStatus.setAttribute("role", "status");
  profileActions.append(saveProfileButton, loadProfileButton, deleteProfileButton);
  profileControls.append(node("p", t("help.savedProfile"), "load-help"), node("p", t("help.profileActions"), "load-help"), profileActions, profileStatus);
  root.append(node("p", t("message.estimates"), "notice"), node("p", t("help.localOnly"), "load-help"), form, status, invalid, profileControls, exportActions, results);
  container.append(root);
  let timer, disposed = false, current = null, billStyle = null, printSequence = 0, billingAttempted = false;
  const billSection=node("section",undefined,"load-screen-only load-bill-form");billSection.dataset.customerEstimate="";
  const billBox=node("fieldset"),billFields=node("div",undefined,"load-fields");
  billBox.append(node("legend",v("section.customerEstimate")),billFields);billSection.append(billBox);
  const billStatus=node("p","","load-error");billStatus.hidden=true;billStatus.setAttribute("role","alert");
  const billActions=node("div",undefined,"load-actions"),billButton=node("button",v("action.printBill"),"primary");
  billButton.type="button";billButton.dataset.action="print-bill";billActions.append(billButton);
  billSection.append(node("p",v("help.customerPrivacy"),"load-help"),node("p",v("help.companyContact"),"load-help"),
    node("p",v("help.print"),"load-help"),billStatus,billActions);
  const billView=node("section",undefined,"load-bill-view");billView.dataset.loadBill="";billView.hidden=true;
  root.append(billSection,billView);
  let previousUnit = state.draft.powerUnit ?? "W", previousPhase = state.settings.phase ?? "single";

  function button(action, dataAction, callback, primary = false) {
    const b = node("button", t("action." + action), primary ? "primary" : "secondary");
    b.type = "button";b.dataset.action = dataAction;if (callback) b.addEventListener("click", callback);return b;
  }
  function makeField(parent, collection, key, value, options = {}) {
    const label = node("label", undefined, "field" + (options.wide ? " load-wide" : ""));
    const copy=options.v2?v:t;
    label.append(node("span",options.label??copy("field."+key),"field-label"));
    const input = node(options.choices ? "select" : options.multiline ? "textarea" : "input");input.name = key;input.id = prefix + key;
    if (options.choices) {
      for (const [choice, text] of options.choices) { const option = node("option", text);option.value = choice;input.append(option); }
    } else {
      if(options.multiline)input.rows=4;else input.type=options.type??"number";
      if (input.type === "number") { input.min = options.min ?? 0;input.max = options.max ?? 1e12;input.step = options.integer ? "1" : options.step??"any"; }
      if(["text","tel","email"].includes(input.type)||options.multiline)input.maxLength=options.maxLength??120;
      if(input.type==="date"){input.min="0001-01-01";input.max="9999-12-31";}
      if(options.autocomplete)input.autocomplete=options.autocomplete;
    }
    input.required = !options.optional && input.type !== "checkbox";
    if (input.type === "checkbox") input.checked = Boolean(value);else input.value = value ?? "";
    const error = node("span", "", "load-error");error.id = prefix + key + "-error";error.hidden = true;
    input.setAttribute("aria-describedby", error.id);
    label.append(input, error);
    if (options.help) {
      const help = node("span", copy("help." + options.help), "load-help");help.id = prefix + key + "-help";
      input.setAttribute("aria-describedby", error.id + " " + help.id);label.append(help);
    }
    parent.append(label);collection[key] = {input, error, options};return input;
  }
  const choices = values => values.map(value => [value, t("option." + value)]);
  const preset = makeField(builderFields, controls, "preset", state.draft.preset, {wide:true, choices:[["custom", t("option.custom")]]});
  for (const category of [...new Set(LOAD_PRESETS.map(item => item.category))]) {
    const group = node("optgroup");group.label = t("category." + category);
    for (const item of LOAD_PRESETS.filter(item => item.category === category)) {const option = node("option", t("preset." + item.id));option.value = item.id;group.append(option);}
    preset.append(group);
  }
  preset.value = state.draft.preset;
  if (state.draft.name === null) state.draft.name = t("preset." + LOAD_PRESETS[0].id);
  makeField(builderFields, controls, "name", state.draft.name, {type:"text", wide:true});
  for (const [key, options] of [
    ["quantity",{integer:true,max:1e6}], ["watts",{}], ["powerUnit",{choices:[["W","W"],["kW","kW"]]}],
    ["hoursPerDay",{max:24}], ["dutyCycle",{max:100}], ["standbyW",{}], ["pf",{max:1}],
    ["type",{choices:choices(["resistive","inductive","capacitive"])}], ["seasonalFactor",{max:1000}]
  ]) makeField(builderFields, controls, key, state.draft[key], options);
  for(const [key,options] of [
    ["inrushMultiplier",{min:1,max:10}],
    ["deviceWindowEnabled",{type:"checkbox",wide:true,help:"deviceWindow"}],
    ["deviceStartHour",{max:23.999999}],["deviceEndHour",{max:24}]
  ])makeField(builderFields,controls,key,state.draft[key]??(key==="inrushMultiplier"?1:key==="deviceStartHour"?18:key==="deviceEndHour"?22:false),{...options,v2:true});
  const editingNotice = node("p", t("help.editing"), "load-help");editingNotice.hidden = state.editing === null;builder.append(editingNotice);
  const builderActions = node("div", undefined, "load-actions");
  const add = button("addDevice", "add-device", saveDevice, true), cancel = button("cancelEdit", "cancel-edit", () => {state.editing = null;refreshEditing();});
  builderActions.append(add, cancel);builder.append(builderActions);
  makeField(settingsFields, globalControls, "phase", state.settings.phase, {choices:choices(["single","three"])});
  makeField(settingsFields, globalControls, "voltage", state.settings.voltage, {min:0.01,max:1e6,help:"voltage"});
  makeField(settingsFields, globalControls, "currency", state.settings.currency, {choices:CURRENCIES.map(currency => [currency,currency]),help:"currency"});
  for (const [key, options] of [
    ["tariff",{max:1e6}], ["households",{integer:true,max:1e6}], ["diversityFactor",{max:1}],
    ["demandFactor",{max:1}], ["growthMargin",{max:10000}], ["peakThresholdKW",{optional:true}],
    ["gridLimitKW",{optional:true}], ["co2Factor",{max:1000,help:"co2"}],
    ["renewableOffsetKWh",{help:"renewables"}], ...RENEWABLE_PRESETS.map(item => [item.field,{}]),
    ["batteryKWh",{optional:true,help:"battery"}], ["measurementInterval",{choices:choices(["second","minute"])}],
    ["occupancyEnabled",{type:"checkbox",wide:true,help:"schedule"}],
    ["startHour",{max:23.999999}], ["endHour",{max:24}]
  ]) makeField(settingsFields, globalControls, key, state.settings[key], options);


  makeField(settingsFields,v2Controls,"resolutionMinutes",v2Values.resolutionMinutes,{v2:true,wide:true,
    choices:[[60,v("option.hourly")],[15,v("option.quarterHour")]],help:"profile"});
  function optionSection(key,help){
    const details=node("details",undefined,"load-v2-options");details.dataset.v2Section=key;
    details.append(node("summary",v("section."+key)));
    const fields=node("div",undefined,"load-fields");details.append(fields);
    if(help)details.append(node("p",v("help."+help),"load-help"));
    settingsBox.append(details);return fields;
  }
  const startingFields=optionSection("starting","starting");
  for(const key of ["breakerRatingA","gridCurrentLimitA"])makeField(startingFields,v2Controls,key,v2Values[key],{v2:true,optional:true});
  const pfFields=optionSection("pf","pf");
  for(const [key,options] of [
    ["pfOld",{max:1}],["pfNew",{max:1}],["pfRealKW",{}],["penaltyRate",{max:1e6}],
    ["frequencyHz",{choices:[[50,"50"],[60,"60"]]}],
    ["capacitorConnection",{choices:["delta","wye"].map(key=>[key,v("option."+key)])}]
  ])makeField(pfFields,v2Controls,key,v2Values[key],{...options,v2:true});
  pfFields.parentElement.append(node("p",v("help.capacitor"),"load-help"));
  const touFields=optionSection("tou","tou");
  makeField(touFields,v2Controls,"touEnabled",v2Values.touEnabled,{v2:true,type:"checkbox",wide:true});
  for(const id of ["peak","offPeak","standard"]){
    for(const [suffix,options] of [["Rate",{max:1e6}],["Start",{max:23.75,step:0.25}],["End",{max:24,step:0.25}]]){
      const key=id+suffix;makeField(touFields,v2Controls,key,v2Values[key],{...options,v2:true});
    }
  }
  const cableFields=optionSection("cable","cable");
  for(const [key,options] of [
    ["cableLengthM",{min:Number.MIN_VALUE}],
    ["conductorMM2",{choices:STANDARD_CONDUCTOR_MM2.map(value=>[value,String(value)])}],
    ["material",{choices:["copper","aluminium"].map(key=>[key,v("option."+key)])}]
  ])makeField(cableFields,v2Controls,key,v2Values[key],{...options,v2:true});
  const seasonalFields=optionSection("seasonal","seasonal");
  makeField(seasonalFields,v2Controls,"selectedMonth",v2Values.selectedMonth,{v2:true,wide:true,
    choices:Array.from({length:12},(_,index)=>[index+1,monthName(index+1)])});
  for(let month=1;month<=12;month++)makeField(seasonalFields,v2Controls,"month"+month,v2Values["month"+month],
    {v2:true,max:1000,label:monthName(month)+" — "+v("field.monthFactor")});
  for(const [key,options] of [
    ["customerName",{type:"text",requiredText:true,maxLength:120}],
    ["phone",{type:"tel",requiredText:true,maxLength:60}],
    ["email",{type:"email",optional:true,maxLength:254}],
    ["address",{multiline:true,requiredText:true,wide:true,maxLength:2000}],
    ["reference",{type:"text",requiredText:true,maxLength:17}],
    ["date",{type:"date",requiredText:true}],
    ["billingBasis",{choices:["day","month","year","custom"].map(key=>[key,v("option."+key)])}],
    ["customDays",{min:1,max:3650,integer:true}],
    ["taxPercent",{max:100}],["taxLabel",{type:"text",requiredText:true,maxLength:60}]
  ])makeField(billFields,billControls,key,state.billing[key],{...options,v2:true,autocomplete:"off"});

  function setError(control, message = "") {
    control.error.textContent = message;control.error.hidden = !message;
    control.input.setAttribute("aria-invalid", message ? "true" : "false");
  }
  function controlWarning(key, control) {
    const copy=control.options.v2?v:t;
    return copy("warning.invalidNumber",{field:control.options.label??copy("field."+key),
      min:control.input.min||"0",max:control.input.max||"1"});
  }
  function readControls(collection, validate = true) {
    const data = {};let valid = true;
    for (const [key, control] of Object.entries(collection)) {
      const input = control.input;let value = input.type === "checkbox" ? input.checked : input.value;
      if (!validate) {data[key] = value;continue;}
      setError(control);
      if (input.disabled) continue;
      if (input.type === "number") {
        const empty = value.trim() === "";
        if (empty && control.options.optional) value = null;
        else {
          value = Number(value);
          if (empty || !Number.isFinite(value) || value < Number(input.min) || value > Number(input.max) || (control.options.integer && !Number.isSafeInteger(value))) {
            setError(control, controlWarning(key, control));valid = false;
          }
        }
      }
      if (key === "name" && (!value.trim() || value.trim().length > 120)) {setError(control, t("warning.nameRequired"));valid = false;}
      if(control.options.requiredText&&typeof value==="string"&&!value.trim()){
        setError(control,v("warning.requiredField",{field:v("field."+key)}));valid=false;
      }
      if(control.options.maxLength&&typeof value==="string"&&value.length>control.options.maxLength){
        setError(control,v("warning.invalidText",{field:v("field."+key),max:control.options.maxLength}));valid=false;
      }
      data[key] = key === "name" ? value.trim() : value;
    }
    return valid ? data : null;
  }
  function errorText(error) {
    if(error?.code==="tariffCoverage")return v("warning.invalidBands");
    const control=controls[error?.field]??globalControls[error?.field]??v2Controls[error?.field]??billControls[error?.field];
    if(error?.code==="requiredField")return v("warning.requiredField",{field:v("field."+error.field)});
    if(error?.code==="invalidText")return v("warning.invalidText",{field:v("field."+error.field),max:control?.options.maxLength??120});
    if(error?.code==="invalidNumber"&&control)return controlWarning(error.field,control);
    if(error?.code==="zeroPowerFactor"&&["pfOld","pfNew"].includes(error.field))return v("warning.invalidPF");
    if(Object.hasOwn(LOAD_V2_COPY[lang],"warning."+error?.code)&&!["invalidNumber"].includes(error.code))return v("warning."+error.code);
    return Object.hasOwn(LOAD_COPY[lang], "warning." + error?.code) && error.code !== "invalidNumber" ? t("warning." + error.code) : t("message.invalidResults");
  }
  function draftDevice(focus = false) {
    const raw = readControls(controls);
    if (!raw) {if (focus) builder.querySelector('[aria-invalid="true"]')?.focus();return null;}
    try {return normalizeLoadV2Device({...raw,operatingWindow:raw.deviceWindowEnabled?{startHour:raw.deviceStartHour,endHour:raw.deviceEndHour}:null});} catch (error) {
      const key=error.field==="startHour"?"deviceStartHour":error.field==="endHour"?"deviceEndHour":error.field;
      const control=controls[key];if(control)setError(control,["startHour","endHour"].includes(error.field)?v("warning.invalidSchedule"):errorText(error));else status.textContent=errorText(error);
      if (focus) (control?.input ?? add).focus();return null;
    }
  }
  function readSettings() {
    const raw = readControls(globalControls);
    if (!raw) return null;
    try {
      return {...normalizeLoadSettings({...raw, batteryKWh:raw.batteryKWh ?? 0, occupancySchedule:raw.occupancyEnabled ? {startHour:raw.startHour,endHour:raw.endHour} : null}), currency:raw.currency};
    } catch (error) {
      if (globalControls[error.field]) setError(globalControls[error.field], errorText(error));
      invalid.textContent = errorText(error);return null;
    }
  }
  function readExtensions(settings) {
    const raw=readControls(v2Controls);if(!raw)return null;
    try{
      const options={...raw,
        resolutionMinutes:Number(raw.resolutionMinutes),frequencyHz:Number(raw.frequencyHz),
        conductorMM2:Number(raw.conductorMM2),selectedMonth:Number(raw.selectedMonth),
        monthlyFactors:Array.from({length:12},(_,index)=>raw["month"+(index+1)])};
      if(raw.touEnabled)options.tariffBands=["peak","offPeak","standard"].map(id=>({id,rate:raw[id+"Rate"],startHour:raw[id+"Start"],endHour:raw[id+"End"]}));
      else options.tariffBands=state.extensions.tariffBands;
      return normalizeLoadV2Settings(options,settings.tariff);
    }catch(error){
      const control=v2Controls[error.field]??(error.field==="tariffBands"?v2Controls.touEnabled:null);
      if(control)setError(control,errorText(error));
      invalid.textContent=errorText(error);return null;
    }
  }
  function refreshV2Fields() {
    for(const key of ["deviceStartHour","deviceEndHour"]){
      const control=controls[key],enabled=controls.deviceWindowEnabled.input.checked;
      control.input.disabled=!enabled;control.input.closest(".field").hidden=!enabled;
    }
    for(const id of ["peak","offPeak","standard"])for(const suffix of ["Rate","Start","End"]){
      v2Controls[id+suffix].input.disabled=!v2Controls.touEnabled.input.checked;
    }
    const custom=billControls.billingBasis.input.value==="custom";
    billControls.customDays.input.disabled=!custom;billControls.customDays.input.closest(".field").hidden=!custom;
  }
  function captureExtensions(){state.extensionDraft=readControls(v2Controls,false);}
  function refreshEditing() {
    const editing = state.editing !== null;editingNotice.hidden = !editing;cancel.hidden = !editing;
    add.textContent = t("action." + (editing ? "applyChanges" : "addDevice"));
  }
  function refreshSchedule() {
    const enabled = globalControls.occupancyEnabled.input.checked;
    for (const key of ["startHour", "endHour"]) {globalControls[key].input.disabled = !enabled;globalControls[key].input.closest(".field").hidden = !enabled;}
  }
  function captureSettings() {state.settings = {...state.settings,...readControls(globalControls,false)};}
  function saveDevice() {
    const device = draftDevice(true);if (!device) return;
    const editing = state.editing !== null;
    if (!editing && state.devices.length >= MAX_LOAD_DEVICES) {status.textContent = t("warning.deviceLimit");return;}
    if (editing) state.devices[state.editing] = device;else state.devices.push(device);
    state.draft = readControls(controls,false);state.editing = null;
    status.textContent = t("message." + (editing ? "updated" : "added"));refreshEditing();renderDevices();schedule();
  }
  function editDevice(index) {
    const device = state.devices[index], powerUnit = device.watts > 1e12 ? "kW" : "W";
    state.editing = index;state.draft = {...device,preset:"custom",powerUnit,watts:device.watts/(powerUnit==="kW"?1000:1),
      inrushMultiplier:device.inrushMultiplier??1,deviceWindowEnabled:Boolean(device.operatingWindow),
      deviceStartHour:device.operatingWindow?.startHour??18,deviceEndHour:device.operatingWindow?.endHour??22};previousUnit = powerUnit;
    for(const [key,control] of Object.entries(controls)){if(control.input.type==="checkbox")control.input.checked=Boolean(state.draft[key]);else control.input.value=state.draft[key]??"";setError(control);}
    refreshV2Fields();refreshEditing();controls.name.input.focus();
  }
  function table(headers, rows, className = "") {
    const wrapper = node("div", undefined, "load-table-scroll");wrapper.tabIndex = 0;
    const table = node("table", undefined, className), head = node("thead"), heading = node("tr");
    for (const label of headers) {const th = node("th", label);th.scope = "col";heading.append(th);}
    head.append(heading);table.append(head);const body = node("tbody");
    for (const {values, data} of rows) {
      const row = node("tr");if (data) Object.assign(row.dataset,data);
      for (const value of values) {const cell = node("td");if (value?.nodeType) cell.append(value);else cell.textContent = String(value);row.append(cell);}
      body.append(row);
    }
    table.append(body);wrapper.append(table);return wrapper;
  }
  function renderDevices() {
    deviceBody.replaceChildren();
    if (!state.devices.length) {deviceBody.append(node("p",t("message.emptyDevices"),"load-help"));return;}
    const columns = ["name","quantity","watts","hoursPerDay","dutyCycle","standbyW","pf","type","seasonalFactor"];
    const rows = state.devices.map((d,index) => {
      const actions = node("div", undefined, "load-row-actions");
      const edit = button("edit","edit",()=>editDevice(index));edit.setAttribute("aria-label",t("action.edit")+": "+d.name);
      const remove = button("remove","remove",()=>{
        state.devices.splice(index,1);if (state.editing === index) state.editing = null;else if (state.editing > index) state.editing--;
        refreshEditing();renderDevices();schedule();status.textContent=t("message.removed");
        (deviceBody.querySelector("button") ?? add).focus();
      });remove.setAttribute("aria-label",t("action.remove")+": "+d.name);actions.append(edit,remove);
      return {data:{deviceRow:String(index)},values:[...columns.map(key=>key==="type"?t("option."+d[key]):typeof d[key]==="number"?fmt(d[key],6):d[key]),
        fmt(d.inrushMultiplier??1),d.operatingWindow?fmt(d.operatingWindow.startHour,6):t("notApplicable"),
        d.operatingWindow?fmt(d.operatingWindow.endHour,6):t("notApplicable"),actions]};
    });
    const headers = columns.map(key=>t("field."+key)+(key==="watts"?" (W)":""));headers.push(v("field.inrushMultiplier"),v("field.deviceStartHour"),v("field.deviceEndHour"),t("action.edit")+" / "+t("action.remove"));
    deviceBody.append(table(headers,rows,"load-device-table"));
    const actions=node("div",undefined,"load-actions");actions.append(button("clearAll","clear-all",()=>{state.devices=[];state.editing=null;refreshEditing();renderDevices();schedule();add.focus();}));deviceBody.append(actions);
  }

  function svgNode(tag,attrs={},text){
    const e=doc.createElementNS("http://www.w3.org/2000/svg",tag);
    for(const [key,value] of Object.entries(attrs))e.setAttribute(key,String(value));
    if(text!==undefined)e.textContent=text;return e;
  }
  function hourText(hour){return String(Math.floor(hour)).padStart(2,"0")+":"+String(Math.round((hour%1)*60)).padStart(2,"0");}
  function chart(profile, cumulative=false) {
    const title=cumulative?v("result.cumulativeEnergy"):t("profile"),unit=cumulative?"kWh":"kW";
    const svg=svgNode("svg",{viewBox:"0 0 760 232",role:"img","aria-label":title,class:"load-chart",
      [cumulative?"data-cumulative-chart":"data-load-chart"]:""});
    svg.append(svgNode("title",{},title),svgNode("desc",{},v("help.profile")));
    const values=profile.map(point=>cumulative?point.kWh:point.kW);
    const maximum=Math.max(...values)||1,left=60,top=18,height=164,width=680;
    for(let tick=0;tick<=4;tick++){
      const y=top+height-height*tick/4;
      svg.append(svgNode("line",{x1:left,y1:y,x2:left+width,y2:y}),
        svgNode("text",{x:left-8,y:y+4,"text-anchor":"end"},fmt(maximum*tick/4,3)));
    }
    if(cumulative){
      const points=profile.map(point=>(left+point.hour*width/24)+","+(top+height-point.kWh/maximum*height)).join(" ");
      svg.append(svgNode("polyline",{points,"data-cumulative-curve":"","data-final-kwh":profile.at(-1).kWh}));
    }else{
      const barWidth=width/profile.length,gap=Math.min(2,barWidth*.15);
      for(const point of profile){
        const barHeight=point.kW/maximum*height;
        const bar=svgNode("rect",{x:left+point.hour*width/24+gap,y:top+height-barHeight,width:barWidth-2*gap,
          height:barHeight,"data-profile-hour":point.hour,"data-kw":point.kW});
        bar.append(svgNode("title",{},hourText(point.hour)+": "+fmt(point.kW,6)+" kW"));svg.append(bar);
      }
    }
    for(const hour of [0,6,12,18,24])svg.append(svgNode("text",{x:left+hour*width/24,y:top+height+20,"text-anchor":"middle"},String(hour)));
    svg.append(svgNode("text",{x:left,y:12},unit),svgNode("text",{x:left+width/2,y:225,"text-anchor":"middle"},t("hour")));
    return svg;
  }
  function money(value,currency){return new Intl.NumberFormat(locale,{style:"currency",currency}).format(value);}
  // Forecast sums can land just below a half-cent because of floating-point residue.
  // Match CSV precision for display only; bill values already have integer-cent rounding.
  function forecastMoney(value,currency){return money(Number(value.toPrecision(15)),currency);}
  function extraMetrics(items,settings) {
    const metrics=node("dl",undefined,"load-metrics load-v2-metrics");
    for(const [key,value,unit=""] of items){
      const item=node("div",undefined,"load-metric");
      const display=value===null?t("notApplicable"):unit==="currency"?forecastMoney(value,settings.currency):fmt(value)+(unit?" "+unit:"");
      const output=node("dd",display);output.dataset.result=key;output.dataset.value=value===null?"":String(value);
      item.append(node("dt",v("result."+key)),output);metrics.append(item);
    }
    return metrics;
  }
  function v2Alert(key,params,marker){
    const warning=node("p",v("warning."+key,params),"load-alert");warning.setAttribute("role","alert");
    if(marker)warning.dataset.warning=marker;return warning;
  }
  function renderProfileDepth(analysis,settings){
    results.append(extraMetrics([["peakAverageRatio",analysis.profileStats.peakAverageRatio]],settings));
    results.append(node("h4",v("result.topPeakHours")));
    const peaks=table([t("hour"),t("loadKW")],analysis.profileStats.topHours.map(row=>({values:[hourText(row.hour)+"–"+hourText(row.hour+1),fmt(row.kW,6)]})));
    peaks.dataset.topHours="";results.append(peaks,node("h4",v("result.cumulativeEnergy")),chart(analysis.profileStats.cumulative,true));
  }
  function renderV2Results(analysis,settings,options) {
    results.append(node("h3",v("section.starting")),
      extraMetrics([["surgeCurrentA",analysis.surgeCurrentA,"A"],["startingKW",analysis.startingKW,"kW"],
        ["designCurrentA",analysis.designCurrentA,"A"],["suggestedBreakerA",analysis.suggestedBreakerA,"A"]],settings));
    if(analysis.startingUnavailable)results.append(v2Alert("startingUnavailable",{},"startingUnavailable"));
    if(analysis.suggestedBreakerA===null)results.append(v2Alert("breakerUnavailable",{},"breakerUnavailable"));
    if(analysis.connectedLimitExceeded)results.append(v2Alert("connectedExceeded",
      {value:fmt(analysis.summary.projectedConnectedLoadKW),limit:fmt(settings.gridLimitKW)},"connectedLimit"));
    for(const [exceeded,limit,key] of [[analysis.surgeBreakerExceeded,options.breakerRatingA,"surgeBreaker"],
      [analysis.surgeGridExceeded,options.gridCurrentLimitA,"surgeGrid"]]){
      if(exceeded)results.append(v2Alert("surgeExceeded",{value:fmt(analysis.surgeCurrentA),limit:fmt(limit)},key));
    }
    results.append(node("p",v("help.starting"),"load-help"),node("p",v("help.breaker"),"load-help"));
    const correction=analysis.correction;
    results.append(node("h3",v("section.pf")),extraMetrics([
      ["correctionKVAR",correction.correctionKVAR,"kVAR"],["capacitanceUF",correction.capacitanceUF,"µF"],
      ["reducedKVA",correction.reducedKVA,"kVA"],["penaltySavings",correction.penaltySavings,"currency"]
    ],settings));
    if(correction.correctionKVAR<0)results.append(v2Alert("pfDowngrade",{},"pfDowngrade"));
    if(correction.capacitanceUF!==null)results.append(node("p",correction.capacitorCount+" × "+fmt(correction.capacitanceUF)+" µF · "+
      (correction.capacitorConnection==="single"?t("option.single"):v("option."+correction.capacitorConnection))+" · "+
      fmt(correction.frequencyHz)+" Hz · "+fmt(correction.elementVoltageV)+" V","load-help"));
    results.append(node("p",v("help.capacitor"),"load-help"),node("p",v("help.pf"),"load-help"));
    results.append(node("h3",v("section.cable")),extraMetrics([
      ["dropV",analysis.voltageDrop.dropV,"V"],["dropPercent",analysis.voltageDrop.dropPercent,"%"]
    ],settings));
    if(analysis.voltageDrop.exceedsFivePercent)results.append(v2Alert("dropExceeded",{value:fmt(analysis.voltageDrop.dropPercent),limit:5},"voltageDrop"));
    results.append(node("p",v("help.cable"),"load-help"),node("p",v("help.localCode"),"load-help"));
    if(options.touEnabled){
      results.append(node("h3",v("section.tou")));
      const bands=table([v("section.tou"),t("field.startHour"),t("field.endHour"),t("field.tariff")+" ("+settings.currency+"/kWh)",
        v("result.bandEnergy"),v("result.grossCost"),v("result.renewableCredit"),v("result.bandCost")],
        analysis.bandCosts.map(band=>({data:{band:band.id},values:[v("band."+band.id),hourText(band.startHour),hourText(band.endHour),
          fmt(band.rate,6),fmt(band.kWh,6),forecastMoney(band.grossCost,settings.currency),forecastMoney(band.renewableCredit,settings.currency),forecastMoney(band.netCost,settings.currency)]})));
      bands.dataset.bandCosts="";results.append(bands,node("p",v("help.renewableCredit"),"load-help"));
    }
    const seasons=node("details");seasons.append(node("summary",v("section.seasonal")),
      table([v("field.selectedMonth"),v("field.monthFactor"),t("result.dailyKWh"),t("result.dailyCost")],
        analysis.seasonal.months.map(month=>({values:[monthName(month.month),fmt(month.factor,6),fmt(month.dailyKWh,6),forecastMoney(month.netCost,settings.currency)]}))),
      node("p",v("help.seasonal"),"load-help"));
    results.append(seasons);
    const inputs=node("section",undefined,"load-print-settings");inputs.append(node("h3",v("section.profile")));
    inputs.append(table([t("globalSettings"),t("results")],Object.entries(options).filter(([key])=>!["tariffBands","monthlyFactors"].includes(key)).map(([key,value])=>({
      values:[v("field."+key),value===null?t("notApplicable"):["material","capacitorConnection"].includes(key)?v("option."+value):typeof value==="boolean"?Number(value):value]}))));
    results.append(inputs);
  }

  function renderResults(summary, settings, analysis, options) {
    results.replaceChildren(node("h3",t("results")));
    for(const [exceeded,key,limit] of [[summary.peakThresholdExceeded,"peakThreshold",settings.peakThresholdKW],[summary.gridLimitExceeded,"gridLimit",settings.gridLimitKW]]){
      if(!exceeded)continue;const alert=node("p",t("warning."+(key==="gridLimit"?"gridExceeded":"peakExceeded"),{value:fmt(summary.peakDemandKW),limit:fmt(limit)}),"load-alert");alert.dataset.warning=key;alert.setAttribute("role","alert");results.append(alert);
    }
    const metrics=node("dl",undefined,"load-metrics");
    for(const [key,unit] of Object.entries(RESULT_UNITS)){
      const item=node("div",undefined,"load-metric");let label=t("result."+key);
      if(key==="peakDemandKW"&&options.resolutionMinutes===15)label=v("result.peak15Demand");
      if(key==="intervalEnergyWh")label+=" ("+t("option."+settings.measurementInterval)+")";
      let value=summary[key],display;
      if(value===null)display=t("notApplicable");
      else if(unit==="currency")display=forecastMoney(value,settings.currency);
      else display=fmt(key==="loadFactor"?value*100:value)+(unit==="hours"?" "+t("unit.hours"):" "+unit);
      const result=node("dd",display);result.dataset.result=key;result.dataset.value=value===null?"":String(value);
      item.append(node("dt",label),result);metrics.append(item);
    }
    results.append(metrics,node("h3",t("profile")),chart(summary.profile),node("p",v("help.profile"),"load-help"));
    renderProfileDepth(analysis,settings);
    const profileDetails=node("details");profileDetails.dataset.profileTable="";
    profileDetails.append(node("summary",options.resolutionMinutes===15?v("section.profile"):t("action.showProfileTable")),table([t("hour"),t("loadKW")],summary.profile.map(p=>({values:[p.hour,fmt(p.kW,6)]}))));results.append(profileDetails);
    results.append(node("h3",t("breakdown")));
    if(summary.breakdown.length)results.append(table([
      t("field.name"),t("result.activeKWh"),t("result.standbyKWh"),t("result.dailyKWh"),t("result.dailyCost"),
      v("result.ratedCurrentA"),v("result.surgeCurrentA"),v("result.startingKW"),v("result.dailyGrossCO2"),v("result.netCO2")
    ],summary.breakdown.map(row=>({data:{breakdownRow:String(row.index)},values:[
      row.name,fmt(row.activeKWh,6),fmt(row.standbyKWh,6),fmt(row.dailyKWh,6),forecastMoney(row.dailyCost,settings.currency),
      ...["ratedCurrentA","surgeCurrentA","startingKW"].map(key=>row[key]===null?t("notApplicable"):fmt(row[key],6)),
      fmt(row.grossCarbonKgCO2,6),fmt(row.carbonKgCO2,6)
    ]})),"load-breakdown-table"));
    const assumptions=node("details");assumptions.append(node("summary",t("assumptions")));
    for(const key of ["factors","schedule","power","standby","renewables","battery","co2","currency"])assumptions.append(node("p",t("help."+key),"load-help"));
    for(const key of ["seasonal","renewableCredit","deviceWindow","localCode"])assumptions.append(node("p",v("help."+key),"load-help"));
    results.append(assumptions);
    const printSettings=node("section",undefined,"load-print-settings");printSettings.append(node("h3",t("globalSettings")));
    printSettings.append(table([t("globalSettings"),t("results")],Object.entries(settings).filter(([key])=>key!=="occupancySchedule").map(([key,value])=>({values:[t("field."+key),value===null?t("notApplicable"):["phase","measurementInterval"].includes(key)?t("option."+value):value]}))));
    if(settings.occupancySchedule)printSettings.append(node("p",`${t("field.startHour")}: ${settings.occupancySchedule.startHour}; ${t("field.endHour")}: ${settings.occupancySchedule.endHour}`));
    results.append(printSettings);renderV2Results(analysis,settings,options);
  }

  function renderBill(bill,options) {
    billView.replaceChildren();
    const close=node("button",v("action.closeBill"),"secondary load-screen-only");
    close.type="button";close.dataset.action="close-bill";close.addEventListener("click",()=>clearBill(true));billView.append(close);
    // Classed divs avoid the surrounding application's generic header/footer print rules.
    const header=node("div",undefined,"load-bill-header"),logo=node("img",undefined,"load-bill-logo");
    logo.src=bill.company.logoUrl;logo.alt=bill.company.name;logo.width=100;logo.height=100;
    const identity=node("div");identity.append(node("h3",bill.company.name),node("p",bill.company.division),
      node("p",bill.company.product),node("h4",v("bill.estimate")));
    header.append(logo,identity);billView.append(header);
    const customer=node("div",undefined,"load-bill-customer");
    const detail=(label,value)=>{
      const row=node("p");row.append(node("strong",label),doc.createTextNode(value));customer.append(row);
    };
    detail(v("field.customerName"),bill.customer.name);detail(v("field.phone"),bill.customer.phone);
    if(bill.customer.email)detail(v("field.email"),bill.customer.email);
    detail(v("field.address"),bill.customer.address);detail(v("field.reference"),bill.reference);detail(v("field.date"),bill.date);
    billView.append(customer);
    const period=v("option."+bill.basis.type)+(bill.basis.type==="custom"?" · "+bill.basis.days:"")+
      (bill.basis.type==="month"?" · "+monthName(bill.basis.selectedMonth):"");
    billView.append(node("p",v("bill.period")+": "+period));
    const scale=bill.summary;
    billView.append(node("p",["households","demandFactor","diversityFactor","growthMargin"].map(key=>
      t("field."+key)+": "+fmt(scale[key],6)).join(" · "),"load-help"));
    billView.append(node("h4",v("bill.lineItems")),table([
      t("field.name"),t("field.quantity"),t("field.watts")+" (W)",t("field.hoursPerDay"),
      t("result.dailyKWh"),t("result.dailyCost"),v("result.periodCost")
    ],bill.lineItems.map(row=>({data:{billLine:String(row.index)},values:[
      row.description,fmt(row.quantity,0),fmt(row.ratedW,6),fmt(row.hoursPerDay,6),fmt(row.dailyKWh,6),
      money(row.dailyCost,bill.currency),money(row.periodCost,bill.currency)
    ]}))));
    const summary=node("section",undefined,"load-bill-summary");summary.append(node("h4",v("bill.summary")));
    const totals=node("dl");
    const line=(label,value,key,numeric,emphasis=false)=>{
      const row=node("div",undefined,"load-bill-total-row"+(emphasis?" load-bill-grand":""));
      const output=node("dd",value);
      if(key){output.dataset.billTotal=key;if(numeric!==undefined)output.dataset.value=String(numeric);}
      row.append(node("dt",label),output);totals.append(row);
    };
    for(const key of ["connectedLoadKW","peakDemandKW","dailyKWh","monthlyKWh","annualKWh"]){
      line(key==="peakDemandKW"&&options.resolutionMinutes===15?v("result.peak15Demand"):t("result."+key),fmt(bill.summary[key])+" "+(key.endsWith("KW")?"kW":"kWh"),key,bill.summary[key]);
    }
    const tariff=bill.summary.tariff;
    const tariffText=tariff.mode==="flat"?fmt(tariff.rate,6)+" "+bill.currency+"/kWh":
      tariff.bands.map(band=>v("band."+band.id)+" "+hourText(band.startHour)+"–"+hourText(band.endHour)+": "+fmt(band.rate,6)+" "+bill.currency+"/kWh").join("; ");
    line(t("field.tariff")+" · "+t("field.currency"),tariffText);
    line(v("result.subtotal"),money(bill.subtotal,bill.currency),"subtotal",bill.subtotal);
    line(bill.taxLabel+" ("+fmt(bill.taxPercent,4)+"%) · "+v("result.taxAmount"),money(bill.taxAmount,bill.currency),"taxAmount",bill.taxAmount);
    line(v("result.grandTotal"),money(bill.grandTotal,bill.currency),"grandTotal",bill.grandTotal,true);
    if(bill.summary.renewableAvailableKWh>0){
      line(t("result.renewableAppliedKWh"),fmt(bill.summary.renewableAppliedKWh)+" kWh");
      line(t("result.netGridKWh"),fmt(bill.summary.netGridKWh)+" kWh");
      line(v("result.grossCost")+" · "+v("bill.period"),money(bill.summary.periodGrossCost,bill.currency));
      line(v("result.renewableCredit")+" · "+v("bill.period"),money(bill.summary.periodRenewableCredit,bill.currency));
      line(v("result.netCost")+" · "+v("bill.period"),money(bill.summary.periodNetGridCost,bill.currency));
    }
    for(const key of ["dailyCost","monthlyCost","annualCost"])line(t("result."+key),money(bill.summary[key],bill.currency));
    summary.append(totals);billView.append(summary,node("h4",t("assumptions")));
    for(const key of bill.assumptionKeys){
      if(key==="loadV2.bill.noFinalInvoice")continue;
      billView.append(node("p",key.startsWith("loadV2.")?v(key.slice(7)):t(key.slice(5)),"load-help"));
    }
    billView.append(node("p",v("help.billRounding"),"load-help"));
    const footer=node("div",undefined,"load-bill-footer");
    footer.append(node("p",bill.company.name+" · "+bill.company.website),node("strong",v("bill.noFinalInvoice")));
    billView.append(footer);billView.hidden=false;return logo;
  }
  function clearBill(focus=false) {
    printSequence++;
    if(doc.body.dataset.loadBillPrint===prefix)delete doc.body.dataset.loadBillPrint;
    billStyle?.remove();billStyle=null;billView.hidden=true;billView.replaceChildren();
    billButton.disabled=current===null;
    if(focus&&!disposed&&root.isConnected)billButton.focus();
  }
  async function printBill() {
    clearBill();billStatus.hidden=true;billingAttempted=true;
    const result=recalculate(),billing=readControls(billControls);
    state.billing={...state.billing,...readControls(billControls,false)};
    if(!result||!billing){
      billSection.querySelector('[aria-invalid="true"]')?.focus();return;
    }
    let bill;
    try{bill=assembleLoadBill(state.devices,result.settings,result.extensions,billing);}
    catch(error){
      const control=billControls[error.field];
      if(control){setError(control,errorText(error));control.input.focus();}
      else {billStatus.textContent=errorText(error);billStatus.hidden=false;}
      return;
    }
    const sequence=++printSequence;
    billButton.disabled=true;
    try{
      const logo=renderBill(bill,result.extensions);
      await logo.decode();
      if(disposed||!root.isConnected||sequence!==printSequence)return;
      if(!logo.naturalWidth)throw new Error("Approved logo unavailable");
      billStyle=node("style",billPrintStyles(lang));billStyle.dataset.loadBillPrintStyles=prefix;
      billStyle.media="print";doc.head.append(billStyle);doc.body.dataset.loadBillPrint=prefix;
      view.print();
    }catch{
      if(disposed||!root.isConnected||sequence!==printSequence)return;
      clearBill();billStatus.textContent=v("warning.printFailed");billStatus.hidden=false;
    }
  }

  function recalculate() {
    clearTimeout(timer);if(disposed||!root.isConnected)return null;
    captureSettings();captureExtensions();const settings=readSettings();
    current=null;exportButton.disabled=true;printButton.disabled=true;saveProfileButton.disabled=true;billButton.disabled=true;
    if(!settings){invalid.hidden=false;invalid.textContent=t("message.invalidResults");results.hidden=true;return null;}
    const extensions=readExtensions(settings);
    if(!extensions){invalid.hidden=false;invalid.textContent=t("message.invalidResults");results.hidden=true;return null;}
    try{
      const analysis=calculateLoadV2Summary(state.devices,settings,extensions),summary=analysis.summary;
      renderResults(summary,settings,analysis,extensions);state.extensions=extensions;
      results.hidden=false;invalid.hidden=true;exportButton.disabled=false;printButton.disabled=false;saveProfileButton.disabled=false;billButton.disabled=false;
      current={summary,settings,extensions,analysis};status.textContent=t("message.resultsUpdated");return current;
    }catch(error){invalid.hidden=false;invalid.textContent=errorText(error);results.hidden=true;return null;}
  }
  function schedule() {
    clearTimeout(timer);exportButton.disabled=true;printButton.disabled=true;saveProfileButton.disabled=true;
    // The bill action always recalculates synchronously, including during this debounce.

    timer=view.setTimeout(recalculate,150);
  }
  preset.addEventListener("change",()=>{
    const selected=LOAD_PRESETS.find(item=>item.id===preset.value);
    if(selected){for(const key of ["watts","pf","type","standbyW","inrushMultiplier"])controls[key].input.value=selected[key];controls.name.input.value=t("preset."+selected.id);controls.powerUnit.input.value="W";previousUnit="W";}
    state.draft=readControls(controls,false);draftDevice();
  });
  controls.powerUnit.input.addEventListener("change",()=>{
    const next=controls.powerUnit.input.value,raw=controls.watts.input.value;
    if(raw.trim()!==""&&Number.isFinite(Number(raw)))controls.watts.input.value=Number(raw)*(previousUnit==="kW"?1000:1)/(next==="kW"?1000:1);
    previousUnit=next;state.draft=readControls(controls,false);draftDevice();
  });
  globalControls.phase.input.addEventListener("change",()=>{
    const next=globalControls.phase.input.value,voltage=globalControls.voltage.input;
    if(Number(voltage.value)===(previousPhase==="three"?400:230))voltage.value=next==="three"?400:230;
    previousPhase=next;captureSettings();schedule();
  });
  const changed=event=>{
    const key=event.target.name;
    if(["preset","powerUnit","phase"].includes(key))return;
    if(controls[key]){refreshV2Fields();state.draft=readControls(controls,false);draftDevice();}
    if(globalControls[key]){refreshSchedule();captureSettings();schedule();}
    if(v2Controls[key]){refreshV2Fields();captureExtensions();schedule();}
  };
  form.addEventListener("input",changed);form.addEventListener("change",changed);
  function profileMessage(key) {
    profileStatus.textContent=t(key);profileStatus.className=key.startsWith("warning.")?"load-error":"load-help";
  }
  function profileFailure(error) {
    profileMessage(error?.code==="profileInvalid"?"warning.profileInvalid":"warning.storageFailed");
  }
  saveProfileButton.addEventListener("click",()=>{
    const result=recalculate();if(!result)return;
    try{saveLoadV2Profile(view.localStorage,state.devices,result.settings,result.extensions);profileMessage("message.profileSaved");}
    catch(error){profileFailure(error);}
  });
  loadProfileButton.addEventListener("click",()=>{
    try{
      const saved=readLoadV2Profile(view.localStorage);
      if(!saved){profileMessage("message.noSavedProfile");return;}
      // Validate the entire stored profile before replacing current work.
      const defaults=createLoadState(), schedule=saved.settings.occupancySchedule;
      clearBill();state.devices=saved.devices;state.editing=null;
      state.extensions=saved.extensions;state.extensionDraft=null;state.billing=createBillingState();billingAttempted=false;
      billStatus.hidden=true;
      state.settings={...defaults.settings,...saved.settings,occupancyEnabled:Boolean(schedule),startHour:schedule?.startHour??18,endHour:schedule?.endHour??22};
      state.draft={...defaults.draft,name:t("preset."+LOAD_PRESETS[0].id)};
      for(const [collection,values] of [[globalControls,state.settings],[controls,state.draft],[v2Controls,flatV2Values(state.extensions)],[billControls,state.billing]]){
        for(const [key,control] of Object.entries(collection)){
          if(control.input.type==="checkbox")control.input.checked=Boolean(values[key]);else control.input.value=values[key]??"";
          setError(control);
        }
      }
      previousUnit="W";previousPhase=state.settings.phase;
      refreshSchedule();refreshV2Fields();refreshEditing();renderDevices();recalculate();profileMessage("message.profileLoaded");
    }catch(error){profileFailure(error);}
  });
  deleteProfileButton.addEventListener("click",()=>{
    try{deleteLoadProfile(view.localStorage);profileMessage("message.profileDeleted");}
    catch(error){profileFailure(error);}
  });
  exportButton.addEventListener("click",()=>{
    const result=recalculate();if(!result)return;
    let url;
    try{
      url=view.URL.createObjectURL(new Blob([buildLoadV2Csv(state.devices,result.settings,result.extensions,lang)],{type:"text/csv;charset=utf-8"}));
      const link=node("a");link.href=url;link.download="electrical-load-profile.csv";root.append(link);link.click();link.remove();
    }catch{status.textContent=t("warning.exportFailed");}
    finally{if(url)view.setTimeout(()=>view.URL.revokeObjectURL(url),1000);}
  });
  printButton.addEventListener("click",()=>{
    clearBill();if(!recalculate())return;
    const details=[...results.querySelectorAll("details")],wasOpen=details.map(item=>item.open);
    details.forEach(item=>item.open=true);
    try{view.print();}catch{status.textContent=t("warning.printFailed");}finally{details.forEach((item,index)=>item.open=wasOpen[index]);}
  });
  billSection.addEventListener("input",event=>{
    const key=event.target.name;if(!billControls[key])return;
    state.billing={...state.billing,...readControls(billControls,false)};
    setError(billControls[key]);billStatus.hidden=true;
    if(billingAttempted)readControls(billControls);
  });
  billSection.addEventListener("change",()=>{
    refreshV2Fields();state.billing={...state.billing,...readControls(billControls,false)};
  });
  billButton.addEventListener("click",printBill);
  let printingDetails=[];
  const beforePrint=()=>{
    if(doc.body.dataset.loadBillPrint===prefix)return;
    printingDetails=[...results.querySelectorAll("details")].map(item=>({item,open:item.open}));
    printingDetails.forEach(({item})=>item.open=true);
  };
  const afterPrint=()=>{
    printingDetails.forEach(({item,open})=>item.open=open);printingDetails=[];
    clearBill(false);
  };
  view.addEventListener("beforeprint",beforePrint);view.addEventListener("afterprint",afterPrint);
  const observer=new view.MutationObserver(()=>{if(!root.isConnected)dispose(false);});
  observer.observe(container,{childList:true});
  function dispose(remove=true){
    if(disposed)return;disposed=true;clearTimeout(timer);observer.disconnect();
    view.removeEventListener("beforeprint",beforePrint);view.removeEventListener("afterprint",afterPrint);
    clearBill(false);if(remove)root.remove();
  }
  refreshSchedule();refreshV2Fields();refreshEditing();renderDevices();draftDevice();recalculate();
  return {destroy(){dispose();},getSummary(){return current?.summary??null;}};
}
