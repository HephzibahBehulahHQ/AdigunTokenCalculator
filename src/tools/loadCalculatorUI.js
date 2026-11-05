import {I} from "../i18n.js";
import {LOAD_PRESETS, RENEWABLE_PRESETS} from "../data/loadPresets.js";
import {calculateLoadSummary} from "../calculators/loadCalculator.js";
import {MAX_LOAD_DEVICES, normalizeLoadDevice, normalizeLoadSettings, invalidLoadInput} from "../calculators/loadProfile.js";
import {LOAD_COPY, loadText} from "./loadCalculator-i18n.js";
import {saveLoadProfile, readLoadProfile, deleteLoadProfile} from "./loadProfileStorage.js";

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
    draft: {...LOAD_PRESETS[0], preset:LOAD_PRESETS[0].id, name:null, powerUnit:"W", quantity:1, hoursPerDay:8, dutyCycle:100, seasonalFactor:1}
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
    const style = node("style", STYLES);style.id = "electrical-load-styles";doc.head.append(style);
  }
  const prefix = "load-" + (++mountNumber) + "-";
  const root = node("div", undefined, "load-calculator");
  const form = node("form");form.noValidate = true;
  form.addEventListener("submit", event => event.preventDefault());
  const inputLayout = node("div", undefined, "load-input-layout");
  const builder = node("fieldset"), settingsBox = node("fieldset");
  builder.append(node("legend", t("deviceBuilder")));settingsBox.append(node("legend", t("globalSettings")));
  const builderFields = node("div", undefined, "load-fields"), settingsFields = node("div", undefined, "load-fields");
  builder.append(builderFields);settingsBox.append(settingsFields);inputLayout.append(builder, settingsBox);form.append(inputLayout);
  const controls = {}, globalControls = {};
  const status = node("p", "", "load-help load-screen-only");status.setAttribute("role", "status");status.setAttribute("aria-live", "polite");
  const invalid = node("p", "", "load-alert");invalid.setAttribute("role", "alert");invalid.hidden = true;
  const results = node("section");results.dataset.loadResults = "";results.setAttribute("aria-live", "off");
  const deviceSection = node("section");deviceSection.append(node("h3", t("deviceList")));
  const deviceBody = node("div");deviceSection.append(deviceBody);form.append(deviceSection);
  const exportActions = node("div", undefined, "load-actions");
  const exportButton = button("exportCsv", "export-csv"), printButton = button("print", "print");
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
  let timer, disposed = false, current = null;
  let previousUnit = state.draft.powerUnit ?? "W", previousPhase = state.settings.phase ?? "single";

  function button(action, dataAction, callback, primary = false) {
    const b = node("button", t("action." + action), primary ? "primary" : "secondary");
    b.type = "button";b.dataset.action = dataAction;if (callback) b.addEventListener("click", callback);return b;
  }
  function makeField(parent, collection, key, value, options = {}) {
    const label = node("label", undefined, "field" + (options.wide ? " load-wide" : ""));
    label.append(node("span", t("field." + key), "field-label"));
    const input = node(options.choices ? "select" : "input");input.name = key;input.id = prefix + key;
    if (options.choices) {
      for (const [choice, text] of options.choices) { const option = node("option", text);option.value = choice;input.append(option); }
    } else {
      input.type = options.type ?? "number";
      if (input.type === "number") { input.min = options.min ?? 0;input.max = options.max ?? 1e12;input.step = options.integer ? "1" : "any"; }
      if (input.type === "text") input.maxLength = 120;
    }
    input.required = !options.optional && input.type !== "checkbox";
    if (input.type === "checkbox") input.checked = Boolean(value);else input.value = value ?? "";
    const error = node("span", "", "load-error");error.id = prefix + key + "-error";error.hidden = true;
    input.setAttribute("aria-describedby", error.id);
    label.append(input, error);
    if (options.help) {
      const help = node("span", t("help." + options.help), "load-help");help.id = prefix + key + "-help";
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

  function setError(control, message = "") {
    control.error.textContent = message;control.error.hidden = !message;
    control.input.setAttribute("aria-invalid", message ? "true" : "false");
  }
  function controlWarning(key, control) {
    return t("warning.invalidNumber", {field:t("field." + key), min:control.input.min || "0", max:control.input.max || "1"});
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
      data[key] = key === "name" ? value.trim() : value;
    }
    return valid ? data : null;
  }
  function errorText(error) {
    return Object.hasOwn(LOAD_COPY[lang], "warning." + error?.code) && error.code !== "invalidNumber" ? t("warning." + error.code) : t("message.invalidResults");
  }
  function draftDevice(focus = false) {
    const raw = readControls(controls);
    if (!raw) {if (focus) builder.querySelector('[aria-invalid="true"]')?.focus();return null;}
    try {return normalizeLoadDevice(raw);} catch (error) {
      const control = controls[error.field];if (control) setError(control, errorText(error));else status.textContent = errorText(error);
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
    state.editing = index;state.draft = {...device,preset:"custom",powerUnit,watts:device.watts/(powerUnit==="kW"?1000:1)};previousUnit = powerUnit;
    for (const [key, control] of Object.entries(controls)) {control.input.value = state.draft[key] ?? "";setError(control);}
    refreshEditing();controls.name.input.focus();
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
      return {data:{deviceRow:String(index)},values:[...columns.map(key=>key==="type"?t("option."+d[key]):typeof d[key]==="number"?fmt(d[key],6):d[key]),actions]};
    });
    const headers = columns.map(key=>t("field."+key)+(key==="watts"?" (W)":""));headers.push(t("action.edit")+" / "+t("action.remove"));
    deviceBody.append(table(headers,rows,"load-device-table"));
    const actions=node("div",undefined,"load-actions");actions.append(button("clearAll","clear-all",()=>{state.devices=[];state.editing=null;refreshEditing();renderDevices();schedule();add.focus();}));deviceBody.append(actions);
  }
  function chart(profile) {
    const svgNode=(tag,attrs={},text)=>{const e=doc.createElementNS("http://www.w3.org/2000/svg",tag);for(const [key,value] of Object.entries(attrs))e.setAttribute(key,String(value));if(text!==undefined)e.textContent=text;return e;};
    const svg=svgNode("svg",{viewBox:"0 0 760 232",role:"img","aria-label":t("profile"),class:"load-chart"});
    svg.append(svgNode("title",{},t("profile")),svgNode("desc",{},t("help.profile")));
    const maximum=Math.max(...profile.map(point=>point.kW))||1,left=60,top=18,height=164,width=680;
    for(let tick=0;tick<=4;tick++){
      const y=top+height-height*tick/4;svg.append(svgNode("line",{x1:left,y1:y,x2:left+width,y2:y}),svgNode("text",{x:left-8,y:y+4,"text-anchor":"end"},fmt(maximum*tick/4,3)));
    }
    for(const point of profile){
      const barHeight=point.kW/maximum*height;
      const bar=svgNode("rect",{x:left+point.hour*width/24+2,y:top+height-barHeight,width:width/24-4,height:barHeight,"data-profile-hour":point.hour,"data-kw":point.kW});
      bar.append(svgNode("title",{},`${t("hour")} ${point.hour}: ${fmt(point.kW,6)} kW`));svg.append(bar);
      if([0,6,12,18,23].includes(point.hour))svg.append(svgNode("text",{x:left+(point.hour+0.5)*width/24,y:top+height+20,"text-anchor":"middle"},String(point.hour)));
    }
    svg.append(svgNode("text",{x:left,y:12},"kW"),svgNode("text",{x:left+width/2,y:225,"text-anchor":"middle"},t("hour")));return svg;
  }
  function renderResults(summary, settings) {
    results.replaceChildren(node("h3",t("results")));
    for(const [exceeded,key,limit] of [[summary.peakThresholdExceeded,"peakThreshold",settings.peakThresholdKW],[summary.gridLimitExceeded,"gridLimit",settings.gridLimitKW]]){
      if(!exceeded)continue;const alert=node("p",t("warning."+(key==="gridLimit"?"gridExceeded":"peakExceeded"),{value:fmt(summary.peakDemandKW),limit:fmt(limit)}),"load-alert");alert.dataset.warning=key;alert.setAttribute("role","alert");results.append(alert);
    }
    const metrics=node("dl",undefined,"load-metrics");
    for(const [key,unit] of Object.entries(RESULT_UNITS)){
      const item=node("div",undefined,"load-metric");let label=t("result."+key);
      if(key==="intervalEnergyWh")label+=" ("+t("option."+settings.measurementInterval)+")";
      let value=summary[key],display;
      if(value===null)display=t("notApplicable");
      else if(unit==="currency")display=new Intl.NumberFormat(locale,{style:"currency",currency:settings.currency}).format(value);
      else display=fmt(key==="loadFactor"?value*100:value)+(unit==="hours"?" "+t("unit.hours"):" "+unit);
      const result=node("dd",display);result.dataset.result=key;result.dataset.value=value===null?"":String(value);
      item.append(node("dt",label),result);metrics.append(item);
    }
    results.append(metrics,node("h3",t("profile")),chart(summary.profile),node("p",t("help.profile"),"load-help"));
    const profileDetails=node("details");profileDetails.dataset.profileTable="";
    profileDetails.append(node("summary",t("action.showProfileTable")),table([t("hour"),t("loadKW")],summary.profile.map(p=>({values:[p.hour,fmt(p.kW,6)]}))));results.append(profileDetails);
    results.append(node("h3",t("breakdown")));
    if(summary.breakdown.length)results.append(table([t("field.name"),t("result.activeKWh"),t("result.standbyKWh"),t("result.dailyKWh")],summary.breakdown.map(row=>({data:{breakdownRow:String(row.index)},values:[row.name,fmt(row.activeKWh,6),fmt(row.standbyKWh,6),fmt(row.dailyKWh,6)]}))));
    const assumptions=node("details");assumptions.append(node("summary",t("assumptions")));
    for(const key of ["factors","schedule","power","standby","renewables","battery","periods"])assumptions.append(node("p",t("help."+key),"load-help"));results.append(assumptions);
    const printSettings=node("section",undefined,"load-print-settings");printSettings.append(node("h3",t("globalSettings")));
    printSettings.append(table([t("globalSettings"),t("results")],Object.entries(settings).filter(([key])=>key!=="occupancySchedule").map(([key,value])=>({values:[t("field."+key),value===null?t("notApplicable"):["phase","measurementInterval"].includes(key)?t("option."+value):value]}))));
    if(settings.occupancySchedule)printSettings.append(node("p",`${t("field.startHour")}: ${settings.occupancySchedule.startHour}; ${t("field.endHour")}: ${settings.occupancySchedule.endHour}`));
    results.append(printSettings);
  }
  function recalculate() {
    clearTimeout(timer);if(disposed||!root.isConnected)return null;
    captureSettings();const settings=readSettings();
    current=null;exportButton.disabled=true;printButton.disabled=true;saveProfileButton.disabled=true;
    if(!settings){invalid.hidden=false;invalid.textContent=t("message.invalidResults");results.hidden=true;return null;}
    try{
      const summary=calculateLoadSummary(state.devices,settings);renderResults(summary,settings);
      results.hidden=false;invalid.hidden=true;exportButton.disabled=false;printButton.disabled=false;saveProfileButton.disabled=false;
      current={summary,settings};status.textContent=t("message.resultsUpdated");return current;
    }catch(error){invalid.hidden=false;invalid.textContent=errorText(error);results.hidden=true;return null;}
  }
  function schedule() {
    clearTimeout(timer);exportButton.disabled=true;printButton.disabled=true;saveProfileButton.disabled=true;
    timer=view.setTimeout(recalculate,150);
  }
  preset.addEventListener("change",()=>{
    const selected=LOAD_PRESETS.find(item=>item.id===preset.value);
    if(selected){for(const key of ["watts","pf","type","standbyW"])controls[key].input.value=selected[key];controls.name.input.value=t("preset."+selected.id);controls.powerUnit.input.value="W";previousUnit="W";}
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
    if(controls[key]){state.draft=readControls(controls,false);draftDevice();}
    if(globalControls[key]){refreshSchedule();captureSettings();schedule();}
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
    try{saveLoadProfile(view.localStorage,state.devices,result.settings);profileMessage("message.profileSaved");}
    catch(error){profileFailure(error);}
  });
  loadProfileButton.addEventListener("click",()=>{
    try{
      const saved=readLoadProfile(view.localStorage);
      if(!saved){profileMessage("message.noSavedProfile");return;}
      // Validate the entire stored profile before replacing current work.
      const defaults=createLoadState(), schedule=saved.settings.occupancySchedule;
      state.devices=saved.devices;state.editing=null;
      state.settings={...defaults.settings,...saved.settings,occupancyEnabled:Boolean(schedule),startHour:schedule?.startHour??18,endHour:schedule?.endHour??22};
      state.draft={...defaults.draft,name:t("preset."+LOAD_PRESETS[0].id)};
      for(const [collection,values] of [[globalControls,state.settings],[controls,state.draft]]){
        for(const [key,control] of Object.entries(collection)){
          if(control.input.type==="checkbox")control.input.checked=Boolean(values[key]);else control.input.value=values[key]??"";
          setError(control);
        }
      }
      previousUnit="W";previousPhase=state.settings.phase;
      refreshSchedule();refreshEditing();renderDevices();recalculate();profileMessage("message.profileLoaded");
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
      url=view.URL.createObjectURL(new Blob([buildLoadCsv(state.devices,result.settings,lang)],{type:"text/csv;charset=utf-8"}));
      const link=node("a");link.href=url;link.download="electrical-load-profile.csv";root.append(link);link.click();link.remove();
    }catch{status.textContent=t("warning.exportFailed");}
    finally{if(url)view.setTimeout(()=>view.URL.revokeObjectURL(url),1000);}
  });
  printButton.addEventListener("click",()=>{
    if(!recalculate())return;
    const details=[...results.querySelectorAll("details")],wasOpen=details.map(item=>item.open);
    details.forEach(item=>item.open=true);
    try{view.print();}catch{status.textContent=t("warning.printFailed");}finally{details.forEach((item,index)=>item.open=wasOpen[index]);}
  });
  refreshSchedule();refreshEditing();renderDevices();draftDevice();recalculate();
  return {destroy(){disposed=true;clearTimeout(timer);root.remove();},getSummary(){return current?.summary??null;}};
}
