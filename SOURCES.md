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

- Offline currency rates are the European Central Bank's [euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html), snapshot dated **4 November 2026**. The app stores EUR as 1 and each quoted currency as units per EUR. Users may edit the snapshot. The ECB explicitly says these reference rates are for information and strongly discourages transaction use. They are not live prices or financial advice.
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
