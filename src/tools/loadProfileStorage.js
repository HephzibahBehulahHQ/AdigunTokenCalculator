import {calculateLoadSummary, calculateLoadV2Summary, normalizeLoadV2Settings, normalizeTariffBands} from "../calculators/loadCalculator.js";
import {invalidLoadInput, normalizeLoadDevice, normalizeLoadDevices, normalizeLoadSettings,
  normalizeLoadV2Device, normalizeLoadV2Devices} from "../calculators/loadProfile.js";

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

// Version two shares the explicit one-slot controls. Existing version-one APIs
// keep their original schema and behavior; reading v1 never rewrites the slot.
const V2_DEVICE_FIELDS = Object.keys(normalizeLoadV2Device({}));
const V2_EXTENSION_FIELDS = Object.keys(normalizeLoadV2Settings());
const V2_BAND_FIELDS = ["id", "startHour", "endHour", "rate"];

function normalizedV2Profile(devices, settings, extensions) {
  const normalizedDevices = normalizeLoadV2Devices(devices);
  // Reuse the established currency, editable-input bounds and v1 validation.
  const base = normalizedProfile(normalizedDevices, settings);
  const normalizedExtensions = normalizeLoadV2Settings(extensions, base.settings.tariff);
  for (const device of normalizedDevices) {
    if (device.operatingWindow && device.operatingWindow.startHour > 23.999999) throw invalidProfile();
  }
  const profile = {devices:normalizedDevices, settings:base.settings, extensions:normalizedExtensions};
  // Validate all derived v2 results before an explicit save or state replacement.
  // Normalizers whitelist calculation fields; customer/billing/draft data is absent.
  calculateLoadV2Summary(profile.devices, profile.settings, profile.extensions);
  return profile;
}

export function serializeLoadV2Profile(devices, settings = {}, extensions = {}) {
  try {
    const profile = normalizedV2Profile(devices, settings, extensions);
    const serialized = JSON.stringify({format:FORMAT, version:2, ...profile});
    if (serialized.length > MAX_SAVED_PROFILE_CHARS) throw invalidProfile();
    return serialized;
  } catch {
    throw invalidProfile();
  }
}

export function parseLoadV2Profile(serialized) {
  try {
    if (typeof serialized !== "string" || serialized.length > MAX_SAVED_PROFILE_CHARS) throw invalidProfile();
    const payload = JSON.parse(serialized);
    if (record(payload) && payload.version === 1) {
      const legacy = parseLoadProfile(serialized);
      return normalizedV2Profile(legacy.devices, legacy.settings, {});
    }
    if (!record(payload) || payload.format !== FORMAT || payload.version !== 2 ||
        !Array.isArray(payload.devices) || !hasFields(payload.settings, SETTING_FIELDS) ||
        !hasFields(payload.extensions, V2_EXTENSION_FIELDS) ||
        !payload.devices.every(device => hasFields(device, V2_DEVICE_FIELDS) && device.powerUnit === "W") ||
        !Array.isArray(payload.extensions.tariffBands) ||
        !payload.extensions.tariffBands.every(band => hasFields(band, V2_BAND_FIELDS))) throw invalidProfile();
    // A persisted schema is stricter than a disabled draft TOU form: corrupt
    // stored bands must not silently turn into defaults during restoration.
    normalizeTariffBands(payload.extensions.tariffBands);
    return normalizedV2Profile(payload.devices, payload.settings, payload.extensions);
  } catch {
    throw invalidProfile();
  }
}

export function saveLoadV2Profile(storage, devices, settings = {}, extensions = {}) {
  const serialized = serializeLoadV2Profile(devices, settings, extensions);
  storageOperation(() => storage.setItem(LOAD_PROFILE_STORAGE_KEY, serialized));
}

export function readLoadV2Profile(storage) {
  const serialized = storageOperation(() => storage.getItem(LOAD_PROFILE_STORAGE_KEY));
  return serialized === null ? null : parseLoadV2Profile(serialized);
}
