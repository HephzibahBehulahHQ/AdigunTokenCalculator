# Electrical Load Calculator

Route: `#/electrical-load`, under **Math & Engineering**. The calculator uses the existing AI product's tokens and violet accent. All inputs, calculations, chart rendering and exports run in the browser. No dependency, API, account, telemetry or backend was added.

## Using the tool

Select one of 19 appliance presets grouped into Lighting, Cooling, Appliances, Electronics and Utility. Edit the name, quantity, W/kW rating, hours/day, duty cycle, standby watts, power factor, load type and seasonal factor, then choose **Add Device**. Each added row has Edit and Remove actions. Editing loads the row back into the builder; **Apply changes** updates that row. A blank optional battery field means zero capacity; blank peak/grid limits mean no limit, while an explicitly entered zero is a real limit.

Global settings support single/three-phase supply, voltage, whole household/community count, tariff and currency label, demand/diversity factors, growth margin, peak/grid limits, CO₂ factor, generic renewable offset, separate solar and wind daily generation, battery capacity and second/minute interval energy. An optional preferred-hours window can cross midnight and accept fractional hours. Three-phase default voltage is 400 V line-to-line; single-phase defaults to 230 V. A user-edited voltage is preserved when phase changes.

Results refresh after a 150 ms debounce. Invalid global inputs hide stale results and disable exports until corrected. A zero PF is accepted only for zero operating real power; positive real power at PF=0 cannot produce finite apparent/reactive power. Errors are localized and associated with the relevant input using ARIA attributes.

## Calculation contract

For a device, let W be its per-device wattage, n its quantity, u its duty fraction, h its operating hours and s its seasonal multiplier:

| Quantity | Calculation |
| --- | --- |
| Duty-adjusted operating power | W × n × u |
| Operating real power P | operating W / 1000; the exported helper accepts an optional demand multiplier |
| Reactive power Q | P × tan(acos(PF)); negative for capacitive loads |
| Apparent power S | P / PF |
| Active daily energy | operating kW × h × s |
| Standby daily energy | standby W × n × (24 − h) / 1000 |
| Per-second / per-minute energy | operating W / 3600 or / 60, in Wh |
| Weekly / monthly / annual active energy | active daily kWh × 7 / 30 / 365 |

`dailyConsumptionKWh` and the per-device week/month/year helpers return active energy. Building totals, costs, carbon, the profile and the ranked breakdown include active **plus standby** energy. Standby applies outside operating hours; duty-cycle off-time within operating hours is not automatically counted as standby. PF is honored even where a preset's broad type label says resistive.

Aggregate apparent power is `hypot(sum P, sum Q)`, so opposing reactive components cancel. The model assumes sinusoidal supply and balanced three-phase loads; it does not model harmonic distortion or phase imbalance. Displayed operating P/Q/S assume all listed devices are on with the entered duty fractions, before the seasonal energy adjustment. Estimated line current is S × 1000 / V for single-phase, or S × 1000 / (√3 × V) for balanced three-phase.

### Building/community factors

Installed connected load is the sum of nameplate W × quantity, multiplied by household count. A separate projected connected load includes growth; a separate demand-adjusted connected load applies the demand factor to that projection.

The explicit forecast scenario multiplier is:

`households × (1 + growthMargin / 100) × demandFactor × diversityFactor`

It scales operating powers, active/standby energy and **every hourly profile bin** once. Thus reducing these factors also reduces forecast energy and cost. The requested 0–1 diversity input is a coincidence multiplier; it is not the reciprocal convention sometimes used for engineering diversity factors. Inputs should reflect one coherent scenario so usage is not unintentionally discounted twice.

### 24-hour profile and demand

Without a preferred window, each device starts at midnight for its entered duration. Fractional hours blend operating and standby power within the affected hourly bin. With a preferred window, operating time is distributed evenly inside that window first; any excess duration is spread evenly outside it. Equal start/end times mean the full day. No operating hours are dropped or squeezed into an artificially higher power.

Each point is an **hourly average kW**. The sum of the 24 values equals gross daily kWh. Peak demand is their maximum; average load is daily kWh / 24; load factor is average / peak, or zero for zero load. The chart and threshold alerts therefore describe this scenario's hourly demand, not measured instantaneous peaks or motor inrush.

### Renewables, battery, tariff and carbon

The generic daily offset, solar and wind inputs add together. Applied generation is capped at gross daily consumption; net grid energy cannot become negative. Excess generation is reported separately and has no assumed export revenue.

This is an ideal daily energy balance: credited generation is assumed to replace same-day grid consumption. Generation timing, storage losses and battery dispatch are not simulated, so actual grid imports can be higher. Daily generation alone does not change the gross hourly chart or its peak. Battery capacity gives an ideal lossless backup duration of capacity / average load; it does not independently reduce energy or peak demand.

Main cost and carbon results use net daily grid energy. Gross daily cost/carbon are also shown. Tariffs exclude standing charges, time-of-use bands, demand charges and export payments. Currency is only a label for the entered rate; there is no exchange conversion. The default 0.4 kg CO₂/kWh is an illustrative editable assumption, not current regional grid data. Month/year projections repeat the same scenario for 30/365 days.

## Reproducible fixture

A 100 W device with quantity 2, duty 50%, 6 hours/day, seasonal factor 1.5, standby 2 W and inductive PF 0.8 yields:

| Result | Value |
| --- | ---: |
| Operating real / reactive / apparent | 0.1 kW / 0.075 kVAR / 0.125 kVA |
| Active / standby / total daily energy | 0.9 / 0.072 / 0.972 kWh |
| Default hourly peak / average | 0.15 / 0.0405 kW |
| Load factor | 27% |
| Gross daily cost at 0.30 per kWh | 0.2916 currency units |

## Export, privacy and verification

CSV downloads include normalized input watts, settings, all summary results, the ranked device breakdown, all 24 hourly values and the assumptions. Numeric cells use decimal dots and up to 15 significant digits; Unicode names/labels use UTF-8. User text beginning with spreadsheet formula markers is escaped. Print/PDF uses the browser print dialog and scoped print CSS, including device inputs, settings, results, chart and profile table.

Input state stays in memory while navigating the app or changing language. A deliberately blank name remains blank, with its validation warning, until corrected. Reloading starts an empty device list; a saved profile is never loaded automatically.

### Optional local profile

**Save profile** stores one copy of the added/applied device rows and current valid global settings in this browser's localStorage. It replaces the previous saved copy. Unapplied builder edits, cached results and unrelated metadata are excluded. **Load saved profile** explicitly replaces the current list and settings, restores the preferred-hours window and resets the builder's editing state. **Delete saved profile** removes only this calculator's saved copy; it does not clear the current list or other app data. There is no automatic saving, loading, upload or account.

The UI warns that anyone using the same browser can read the saved copy. Use generic device labels without personal names, addresses or sensitive details. Browser clearing/private-mode policies can remove the saved copy; CSV export is a separate way to retain a report.

The versioned record uses the namespaced key `adigun.electrical-load.profile.v1`. Loading validates the whole record, calculation results, UI ranges and required device names before replacing current work. Corrupt, oversized, incomplete or unsupported records produce a localized warning while preserving the current list and settings. Storage access/quota failures are caught, including browsers whose localStorage getter throws. No sessionStorage is used.

Tests are additive in `tests/loadCalculator.test.js`, `loadProfile.test.js`, `loadPresets.test.js`, `loadI18n.test.js`, `loadStorage.test.js` and `loadUI.test.js`. They cover formula fixtures, invalid and boundary inputs, signed Q, factor scaling, profile conservation, tiny PF and PF correction, immutable inputs, all four locales, CSV injection handling, production build, device editing, keyboard activation, debounced validation, print styling, mobile overflow and absence of third-party requests. Storage tests cover complete round-trips, explicit save/reload/load/delete, invalid records, failed writes, scoped deletion, schedule restoration and preservation of unfinished edits across language changes. Browser checks require the already-pinned Playwright Chromium installation. Verification/deployment checkpoints are in `PROJECT_STATUS.md`; final exact-commit CI and Pages receipts are also recorded in the merged pull request.

## Formula references

The appliance values come from the owner's requested editable engineering estimates, not manufacturer-specific data. The following primary references were consulted on 5 November 2026 for the reactive-power/correction and coincidence conventions:

- Schneider Electric, [Theoretical principles to improve power factor](https://www.electrical-installation.org/enwiki/Theoretical_principles_to_improve_power_factor).
- Schneider Electric, [Estimation of actual maximum kVA demand](https://www.electrical-installation.org/enwiki/Estimation_of_actual_maximum_kVA_demand).


## V2 extensions

The existing route and original exports remain available. The added UI uses
`calculateLoadV2Summary(devices, settings, extensions)`; default options retain
the existing numerical scenario. The original `buildLoadCsv` export remains
available to callers, while the page's CSV button now uses `buildLoadV2Csv`.
No new dependency, service, account or telemetry is introduced.

### Starting current, PF correction and protection estimates

Each preset adds an editable `inrushMultiplier` between 1 and 10: motor
presets use 6, AC presets use 5, and the other presets use 1. A factor of 1 means
that no additional surge is modelled; it is not a verified absence of inrush.

- Rated current uses nameplate W × quantity, divided by voltage × PF for
  single phase, or √3 × line-to-line voltage × PF for balanced three phase.
- Starting current multiplies that rated current by the entered multiplier.
  Aggregate starting estimates include household and growth scaling, without
  reducing them by duty, demand or diversity. They assume simultaneous starting.
- Inductive/motor starting kW is nameplate kW × quantity × multiplier. This is
  a same-PF approximation and also applies to the broad inductive-labelled
  category; it is not a measured motor starting characteristic.
- An existing zero-duty device with PF = 0 can still produce its valid standby
  and energy results. Its uncomputable rated/surge estimates are N/A. Unknown
  contributions make the aggregate surge and entered-limit comparisons unknown,
  rather than silently treating them as zero. Zero households or quantity are
  known zero contributions. Standalone rated-current helpers remain strict.
- Design current is the existing aggregate operating apparent power divided by
  voltage (and √3 for three phase). The breaker suggestion selects the next
  rating at or above 1.25 × design current from 6, 10, 16, 20, 25, 32, 40, 50,
  63, 80, 100 and 125 A. Above the supplied list it reports N/A. The 125% margin
  is the requested planning assumption, not a universal wiring-code rule.
- Connected capacity including household/growth scaling is checked against the
  kW grid limit. Starting current is separately checked against user-entered
  breaker and grid-current limits in A.

PF correction reuses `powerFactorCorrectionKVAR`:

`Qc = P × [tan(acos(PF_old)) − tan(acos(PF_new))]`.

The µF result is **per capacitor element**, at the selected 50 or 60 Hz.
With Qc in kVAR and V in volts, single phase uses
`C = Qc × 10^9 / (2π f V²)`. A three-phase wye bank uses the same expression
with line-to-line V for each of three elements; a delta bank divides that
per-element result by three. The UI displays the element count, connection,
frequency and element voltage. A lower target PF produces a negative correction
and no capacitor suggestion. Reduced kVA and the assumed daily charge avoided
are shown separately. They do not reduce energy consumption or the energy bill.

Cable voltage drop uses one-way length and the selected standard conductor
cross-section. It is a resistance-only longitudinal estimate, with fixed guide
values ρ = 0.0237 Ω·mm²/m for copper and 0.0376 for aluminium:

`R = ρL/A; ΔV = 2 I R PF` for single phase, or
`ΔV = √3 I R PF` for balanced three phase.

The 5% alert is a planning threshold. Conductor temperature, reactance,
installation method, cable ampacity, fault current, earthing, breaker curves and
coordination require separate verification against applicable local rules.
The chosen cross-section is an input, not a certified ampacity selection.

### Device windows, tariffs and profile resolution

A device can opt into its own preferred operating window. This overrides the
global schedule for that device only. Hours are distributed inside the preferred
window first and outside it when necessary, preserving the entered daily hours
and energy. Windows may cross midnight; equal device-window endpoints mean a
full day. Disabled windows retain the original global/default schedule behavior.

The hourly profile has 24 average-kW bins; the 15-minute profile has 96 native
bins. It is calculated from exact overlap with operating windows, rather than
repeating hourly values. The chart, peak, load factor and peak-to-average ratio
use the selected interval. Top-three peak hours always rank hourly averages,
with ties ordered by earlier hour. Cumulative energy starts at 0 kWh at 00:00 and
ends at the daily total at 24:00. These are modelled interval averages, not
instantaneous starting peaks.

TOU pricing is optional. Peak, off-peak and standard windows use 15-minute
boundaries and must cover all 96 quarter-hours exactly once. Gaps and overlaps
are rejected. Equal tariff-window endpoints disable that band; 0–24 denotes a
full-day band. Rates are editable in the selected currency per kWh. TOU costing
uses the native quarter-hour profile regardless of the chart interval, and the
daily cost is the sum of the band costs. Disabling TOU preserves flat pricing.

Daily renewable generation is capped at daily use and allocated proportionally
across devices and tariff bands as bookkeeping. This does not model generation
timing, self-consumption or battery dispatch. Per-device net costs and CO₂
reconcile with the aggregate; gross CO₂ is also shown. PF penalty savings are an
independent estimate and are not deducted from these energy costs.

### Monthly factors and annual projections

All 12 active-energy factors are editable, defaulting to 1. Standby energy
remains unchanged. The base daily and weekly scenario and profile remain the
daily scenario; the selected month projects its own seasonal daily result over
30 days. Annual results weight all 12 factors over a fixed 365-day year using
31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30 and 31 days. Each monthly scenario
recomputes its own capped renewable credit, so a low-use month cannot receive a
credit greater than its use.

The seasonal table shows each month's factor and **daily** scenario. Annual
totals already include their day weights and must not be multiplied again.

### Customer bill / estimate

**Print customer estimate / PDF** builds a distinct customer-facing document.
The original engineer print action remains separate. The company identity is
inherited from the approved templates:

- Company: **Hephzibah Behulah**; division: **HB Artificial Intelligence**;
  product: **AdigunTokenCalculator**.
- Unchanged local artwork: `assets/hephzibah-behulah-official.jpg`.
- Approved contact: **https://hephzibahbehulah.com/**. No company postal address,
  telephone or email has been invented.
- Global source: [README at bd116504412b37105166805018f64a6e7bbe3cde](https://github.com/HephzibahBehulahHQ/HephzibahBehulahHQ.github.io/blob/bd116504412b37105166805018f64a6e7bbe3cde/README.md).
- Corporate naming/contact source: [brand-and-product-naming.md at 52f01f9986d97088413ca9785bc7a2d3f2967123](https://github.com/HephzibahBehulahHQ/hb-design-system/blob/52f01f9986d97088413ca9785bc7a2d3f2967123/docs/brand-and-product-naming.md).
- AI identity source: [README at 4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd](https://github.com/HephzibahBehulahHQ/hb-artificial-intelligence/blob/4d4eb7e9108f88f6a406cec52e3e9a551eb09bdd/README.md).

Customer name, separate phone number, multiline address, reference and date are
required. Email is optional and validated when supplied. Defaults use the
browser's local calendar date and an `EST-YYYYMMDD-####` reference; the suffix
is a convenient local reference, not a globally unique identifier. Dates must
be real calendar dates. An edited estimate date may differ from its original
reference date. Text remains text, including any entered markup.

Choose day, selected month, year or 1–3650 custom days as the estimate basis.
Line items retain entry order and show quantity, rated W, daily hours, base-day
energy and cost, plus the charge for the selected period. Month/year period
charges use the entered seasonal factors; custom days use the base daily
scenario. Community/demand/diversity/growth assumptions are printed.

Tax defaults to 0%, accepts 0–100%, and has an editable label. Each net period
line is calculated at full precision and rounded to two decimal places before
the subtotal is summed. Tax is rounded once from that subtotal, and grand total
is the sum of their integer cents. Monetary values outside safe integer-cent
arithmetic are rejected. For example, a 27.00 subtotal with 15% tax produces
4.05 tax and 31.05 total. Renewable credit is already reflected in the line
charges and is never subtracted a second time. Daily/monthly/yearly projections
are before tax; the emphasized grand total applies to the chosen period.

Invalid required fields, date/reference, tax or calculation inputs block the
print view and `window.print()`. The current calculation is refreshed at the
click, so a pending 150 ms update cannot print stale totals. The approved logo
must load successfully. Print mode is cleared after printing, on failure,
on close and on route destruction. Customer details stay in memory and are
excluded from both CSV builders and saved profiles; reloading clears them.

A dedicated named A4 stylesheet sets page margins, a logo/customer header,
repeating table headings, readable tax/grand-total rows, and company-contact
page footers with page counters. The footer states **“This is an estimate, not a
final invoice.”** Save as PDF through the browser's normal print dialog. Browser
paper, margin and automatic-header settings can override the requested layout;
page-margin counters depend on browser support. See [Chrome's page-margin
documentation](https://developer.chrome.com/blog/print-margins). Engineer print
also expands its assumptions/details and excludes customer fields.

### Extended export and profile storage

The page's CSV contains current v2 summary costs, device inrush/windows and
rated/surge/start values, PF correction, TOU bands, monthly factors, per-device
cost/CO₂, the selected 24/96-point profile and cumulative energy. It is a
sectioned report: global PF correction is reported once, rather than falsely
attributing the same capacitor bank to every device. Text-cell formula escaping
and decimal-dot numeric output remain in place. CSV and bill printing are
separate actions.

The v2 profile format keeps the established storage key and adds only normalized
calculation inputs. It stores all new device and global options, but no bill,
customer, draft, cached result or arbitrary metadata. Version-1 profiles load
through an in-memory migration with multiplier 1 and no device window, without
rewriting storage. Explicit Save writes version 2. Invalid or unavailable
storage cannot replace a valid current/saved profile. The original v1 storage
exports remain available for v1 callers.

### V2 verification and formula sources

New unit tests cover interval conservation, default compatibility, independent
TOU/seasonal totals, surge/current/capacitor/drop formulas, unavailable PF=0
starting estimates, v1/v2 persistence, all four locales, customer validation,
tax boundaries and currency rounding. Browser tests exercise the production
Vite bundle, input/output wiring, privacy, print cleanup and a real multi-page
A4 PDF. Local browser checks are skipped when Chromium is unavailable; the
existing CI Chromium job must pass before release. This does not claim a manual
screen-reader review or universal printer/browser compatibility.

Additional primary references:

- Schneider Electric, [Calculation of voltage drop in steady load conditions](https://www.electrical-installation.org/enwiki/Calculation_of_voltage_drop_in_steady_load_conditions): conductor resistance and phase-dependent drop equations.
- Schneider Electric, [Selection of a circuit-breaker](https://www.electrical-installation.org/enwiki/Selection_of_a_circuit-breaker): installation conditions and protection coordination.
- ABB, [Power factor correction and harmonic filtering in electrical plants](https://library.e.abb.com/public/4ffab4cf79db502fc12574ef004deed3/1SDC007107G0201.pdf), tables 9.1–9.2: three-phase capacitor connections.
