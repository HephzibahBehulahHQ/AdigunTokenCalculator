# Sources and calculation methodology

This file records the external references and explicit assumptions used by the browser-side tools. All calculations run locally. A source reference does not imply a live connection.

## Tokenization

- OpenAI's [tiktoken repository](https://github.com/openai/tiktoken) documents the encodings and model mappings. The OpenAI Cookbook's [token-counting guide](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb) maps GPT-4o and GPT-4o mini to `o200k_base`, and GPT-4 / GPT-3.5 Turbo to `cl100k_base`.
- The current upstream [model mapping source](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py) is reviewed when model families change.
- The app bundles `js-tiktoken@1.0.21` and rank data locally. It counts the exact supplied text, not message framing, tools, images, audio, or API billing units. See [architecture](docs/ARCHITECTURE.md) for the pinned byte reconstruction adapter limitation.

## Population and religion

- World population estimates use UN DESA, [World Population Prospects 2024](https://population.un.org/wpp/), medium-variant 1 July estimates. The app linearly interpolates between dated mid-year projections and labels the result as an estimate, not a live count. Births, deaths and CO₂ are omitted because no separate verified daily baselines are shipped.
- Religion shares are seeded from Pew Research Center, [How the global religious landscape changed from 2010 to 2020](https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/), published 9 June 2025. Shares are editable; the “other religions” aggregate includes folk/traditional and smaller traditions.

## Currency and finance

- Offline currency rates are the European Central Bank's [euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), snapshot dated **4 November 2026**. The app stores EUR as 1 and each quoted currency as units per EUR. The 30-currency table is attributed to the European Central Bank (ECB), snapshot 4 November 2026; users may edit the snapshot. The ECB explicitly says these reference rates are for information and strongly discourages transaction use. They are not live prices or financial advice.
- Inflation is a compound-rate calculator using the annual percentage entered by the user. It is not a CPI database and does not claim an official historical inflation series.
- Loan, tip, discount, fuel and zakat tools apply the formulas and assumptions stated in their visible notices. They are estimates, not offers, advice or religious rulings.

## Health-related estimates

- The calorie estimator uses the Mifflin–St Jeor resting-energy equation from Mifflin et al., *A new predictive equation for resting energy expenditure in healthy individuals*, American Journal of Clinical Nutrition (1990), [DOI 10.1093/ajcn/51.2.241](https://doi.org/10.1093/ajcn/51.2.241). Activity multipliers and macro split are explicit estimates and are editable. It is limited to adults aged 18+ and is not a diet prescription.
- Pregnancy dating uses the conventional 280-day estimate from the first day of the last menstrual period; conception-date input is converted using a 266-day estimate. ACOG notes that first-trimester ultrasound is the most accurate method to establish or confirm gestational age and that LMP assumptions can be inaccurate. See [Methods for Estimating the Due Date](https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date). The calculator is not prenatal care.
- The water tool deliberately labels 30–35 mL/kg plus a user-entered adjustment as an **editable planning heuristic**, not an official daily requirement. It is not appropriate for individual medical decisions.
- The BAC tool uses a simplified Widmark-style estimate. The US National Institute of Standards and Technology's [Guidelines for Performing Alcohol Calculations in Forensic Toxicology](https://www.nist.gov/system/files/documents/2022/05/02/OSAC%202020-S-0003_Guidelines%20for%20Performing%20Alcohol%20Calculations%20in%20Forensic%20Tox_REGISTRY%20VERSION.pdf) describes Widmark's relationship and its forensic context. The app's simplified factors do not account for individual absorption, distribution, metabolism, food, medications or measurement uncertainty. **Never use the estimate to decide whether to drive.**
- BMI and sleep tools retain their visible screening / non-medical disclaimers.

## Time, language and developer utilities

- Time-zone conversion uses the browser's built-in IANA time-zone data through ECMAScript `Intl.DateTimeFormat`. Nonexistent spring-forward wall times are rejected; ambiguous fall-back times use the earlier occurrence and are flagged.
- Holiday dates use Gregorian computus for Easter and explicit calendar rules for the selected region. The output is a date reference, not legal confirmation of statutory holiday entitlement.
- Morse mappings follow ITU-R [Recommendation M.1677-1: International Morse code](https://www.itu.int/rec/R-REC-M.1677/en).
- QR codes are generated locally with `qrcode-generator@2.0.4`, MIT licensed. The QR content is readable by anyone who scans it.
- SHA-1 and SHA-256 use the browser [Web Crypto digest API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest); MD5 is implemented locally for legacy checksum compatibility only. SHA-1 and MD5 must not be used for security-sensitive purposes. A hash is not encryption.
- Color contrast uses the WCAG relative-luminance ratio. See [WCAG 2.2, Success Criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) and [1.4.6](https://www.w3.org/TR/WCAG22/#contrast-enhanced).
- JSON formatting uses the native `JSON.parse` / `JSON.stringify` behavior. Base conversion uses JavaScript `BigInt`.

## Source refresh policy

Recheck date-sensitive snapshots before release. Never label a stored snapshot “live”. If a baseline or official rule cannot be verified, omit it or mark it as user-supplied / illustrative. Human review is required for health notices, locale quality and public-holiday interpretation.

### Population baseline verification state

The official [UNData WPP 2024 record](https://data.un.org/Data.aspx?d=PopDiv&f=variableID%3A12%3BcrID%3A900%3BvarID%3A2) identifies the series as “Total population, both sexes combined (thousands)” for World / Medium and cites the 2024 Revision. The application currently seeds 1 July 2025 and 1 July 2026 values from that WPP 2024 medium-variant series. Those numbers have been cross-checked against independent public reproductions, but the direct downloadable UN dataset file and its checksum have not yet been archived in this repository. Therefore, exact baseline-to-file verification remains an open release check; do not describe this dataset audit as fully closed.


## Remaining original-tool constants and formula references

- **BMI:** CDC's adult BMI calculation is weight in kg divided by height in metres squared; the imperial factor is 703. BMI is a screening measure, not a diagnosis. [CDC calculation](https://www.cdc.gov/growth-chart-training/hcp/using-bmi/calculating-bmi.html) and [adult categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html).
- **Qibla:** bearing uses the great-circle initial-bearing formula. The Kaaba reference coordinate is approximately 21.4225° N, 39.8262° E, rounded from the [German Archaeological Institute (DAI) iDAI.gazetteer entry 1008211](https://gazetteer.dainst.org/doc/1008211.html), licensed CC BY; Google's [Qibla Finder explanation](https://support.google.com/faqs/answer/7364753?hl=en) describes the same great-circle approach. Geolocation remains an explicit user action.
- **Unit and fuel conversions:** length, mass, volume and area constants are based on SI definitions and [NIST SP 811 conversion factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9). Exact gallon distinctions are retained: US gallon = 3.785411784 L; Imperial gallon = 4.54609 L. Decimal and binary digital units are explicitly distinct (1000 vs 1024 prefixes); see the [BIPM SI Brochure](https://www.bipm.org/en/publications/si-brochure/).
- **Zakat:** the default editable rate is 2.5%, consistent with [Islamic Relief's zakat rules](https://www.islamic-relief.org.uk/giving/islamic-giving/zakat/zakat-rules/). Eligibility, nisab, lunar-year ownership, debt treatment and school-specific rulings are not calculated; this is arithmetic only, not a religious ruling.
- **Water:** the broad 30–35 mL/kg adult band is adapted from [German Nutrition Society (DGE) reference values](https://www.dge.de/wissenschaft/referenzwerte/wasser/), which vary by age and describe total water from drinks and food. The app does not ask age and therefore labels this a rough adjustable total-water estimate, not a drinking-water prescription.
- **Holidays:** Easter dates use Gregorian computus. US federal holiday examples are checked against [US OPM](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/); England and Wales bank-holiday rules against [GOV.UK](https://www.gov.uk/bank-holidays); Canada examples against [Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/public-holidays.html). Region lists are intentionally incomplete: Germany and Nigeria include a common fixed/Christian subset, and variable lunar holidays, substitute days and province/state exceptions are not comprehensive. Never treat this as a legal calendar.
- **Word reading time:** 200 words per minute is a product heuristic, not a universal reading speed.
- **Contemplative practice:** annual and lifetime projections use 52 weeks per year; this is an explicit arithmetic assumption.
- **Sleep cycle:** 90 minutes is a user-adjustable heuristic, not a physiological guarantee.
- **Loan, tip, discount, percentage, recipe and statistics:** standard arithmetic formulas; no external rates or prices are supplied.
- **Age and date difference:** calendar arithmetic uses the browser's local date/time context; the app documents its exclusive/inclusive convention in the UI.
- **GPA:** the 4.0 mapping is illustrative; percentage mode remains separate and is not silently converted to GPA.


## Deliberate exclusions (scope boundary)

- **AI prediction, fortune-telling and personality/relationship scoring:** excluded because they imply unsupported predictive certainty or misrepresent statistical/AI capability.
- **Medical diagnosis and treatment recommendations:** excluded; the health tools remain limited to explicitly labelled estimates/screening calculations.
- **Live stock/crypto tickers or live currency APIs:** excluded because they require runtime external services and would violate the static local-only architecture. Currency conversion uses a dated offline snapshot.
- **User accounts, cloud profiles and persistent sensitive data:** excluded because they break the static, client-side privacy model.
