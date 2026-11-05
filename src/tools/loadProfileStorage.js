import {calculateLoadSummary} from "../calculators/loadCalculator.js";
import {invalidLoadInput, normalizeLoadDevice, normalizeLoadDevices, normalizeLoadSettings} from "../calculators/loadProfile.js";

// One opt-in slot. This module never accesses window or storage on import.
export const LOAD_PROFILE_STORAGE_KEY = "adigun.electrical-load.profile.v1";
export const MAX_SAVED_PROFILE_CHARS = 1_000_000;
const FORMAT = "adigun-electrical-load";
const CURRENCIES = ["EUR", "NGN", "USD", "GBP"];
const DEVICE_FIELDS = Object.keys(normalizeLoadDevice({}));
const SETTING_FIELDS = [...Object.keys(normalizeLoadSettings()), "currency"];
const invalidProfile = () => invalidLoadInput("savedProfile", "profileInvalid");
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const hasFields = (value, fields) => record(value) && fields.every(field => Object.hasOwn(value, field));

function validateEditableProfile(devices, settings) {
  // Stored inputs must remain editable using this calculator's field limits.
  // Canonical watts may include an entered kW rating, hence the 1000× limit.
  for (const device of devices) {
    if (!device.name.trim() || device.quantity > 1e6 || device.watts > 1e15 ||
        device.standbyW > 1e12 || device.seasonalFactor > 1000) throw invalidProfile();
  }
  const maximums = {
    voltage:1e6, households:1e6, growthMargin:10000, tariff:1e6, co2Factor:1000,
    renewableOffsetKWh:1e12, solarKWh:1e12, windKWh:1e12, batteryKWh:1e12,
    gridLimitKW:1e12, peakThresholdKW:1e12
  };
  if (settings.voltage < 0.01 || Object.entries(maximums).some(([key,max]) => settings[key] !== null && settings[key] > max) ||
      (settings.occupancySchedule && settings.occupancySchedule.startHour > 23.999999)) throw invalidProfile();
}

function normalizedProfile(devices, settings) {
  const normalizedDevices = normalizeLoadDevices(devices);
  const normalizedSettings = normalizeLoadSettings(settings);
  const currency = settings.currency === undefined ? "EUR" : settings.currency;
  if (!CURRENCIES.includes(currency)) throw invalidProfile();
  validateEditableProfile(normalizedDevices, normalizedSettings);
  // Reject arithmetic overflow before saving or replacing current UI state.
  calculateLoadSummary(normalizedDevices, normalizedSettings);
  return {devices:normalizedDevices, settings:{...normalizedSettings, currency}};
}

export function serializeLoadProfile(devices, settings = {}) {
  const profile = normalizedProfile(devices, settings);
  const serialized = JSON.stringify({format:FORMAT, version:1, ...profile});
  if (serialized.length > MAX_SAVED_PROFILE_CHARS) throw invalidProfile();
  return serialized;
}

export function parseLoadProfile(serialized) {
  try {
    if (typeof serialized !== "string" || serialized.length > MAX_SAVED_PROFILE_CHARS) throw invalidProfile();
    const payload = JSON.parse(serialized);
    if (!record(payload) || payload.format !== FORMAT || payload.version !== 1 ||
        !Array.isArray(payload.devices) || !hasFields(payload.settings, SETTING_FIELDS) ||
        !payload.devices.every(device => hasFields(device, DEVICE_FIELDS) && device.powerUnit === "W")) throw invalidProfile();
    // Normalization copies only known calculation fields; no stored markup,
    // draft edit, result cache, prototype or arbitrary metadata is restored.
    return normalizedProfile(payload.devices, payload.settings);
  } catch {
    throw invalidProfile();
  }
}

function storageOperation(operation) {
  try { return operation(); }
  catch { throw invalidLoadInput("storage", "storageFailed"); }
}

export function saveLoadProfile(storage, devices, settings = {}) {
  const serialized = serializeLoadProfile(devices, settings);
  storageOperation(() => storage.setItem(LOAD_PROFILE_STORAGE_KEY, serialized));
}

export function readLoadProfile(storage) {
  const serialized = storageOperation(() => storage.getItem(LOAD_PROFILE_STORAGE_KEY));
  return serialized === null ? null : parseLoadProfile(serialized);
}

export function deleteLoadProfile(storage) {
  storageOperation(() => storage.removeItem(LOAD_PROFILE_STORAGE_KEY));
}
