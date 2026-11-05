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

Input state is retained only in memory while navigating the app or changing language. Reloading clears it. There is no localStorage/sessionStorage persistence; export before leaving.

Tests are additive in `tests/loadCalculator.test.js`, `loadProfile.test.js`, `loadPresets.test.js`, `loadI18n.test.js` and `loadUI.test.js`. They cover formula fixtures, invalid and boundary inputs, signed Q, factor scaling, profile conservation, tiny PF, immutable inputs, all four locales, CSV injection handling, production build, device editing, keyboard activation, debounced validation, print styling, mobile overflow and absence of third-party requests. Browser checks require the already-pinned Playwright Chromium installation. Exact verification/deployment receipts belong in `PROJECT_STATUS.md`.

## Formula references

The appliance values come from the owner's requested editable engineering estimates, not manufacturer-specific data. The following primary references were consulted on 5 November 2026 for the reactive-power/correction and coincidence conventions:

- Schneider Electric, [Theoretical principles to improve power factor](https://www.electrical-installation.org/enwiki/Theoretical_principles_to_improve_power_factor).
- Schneider Electric, [Estimation of actual maximum kVA demand](https://www.electrical-installation.org/enwiki/Estimation_of_actual_maximum_kVA_demand).
