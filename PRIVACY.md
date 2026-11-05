# Privacy and data handling

AdigunTokenCalculator is a static, browser-side utility. All 38 tools process calculator inputs in the active page using JavaScript. The application has no backend, account system, database, analytics, telemetry, advertising tags or remote calculation API.

## What is processed locally

- Text, model selection, token IDs and token-piece data in the tokenizer and text-statistics tools.
- Dates and numeric values in engineering, temperature, age, BMI, percentage, population, religion, practice-time, Zakat, Qibla, unit, loan, date-difference, GPA, fuel, sleep, time-zone, inflation, tip, calorie, pregnancy, water, BAC, base, Roman numeral, discount, recipe, holiday and statistics tools.
- Currency rates and amounts in the offline converter. Its ECB reference-rate snapshot is bundled in the application and can be edited in the page.
- Password characters and cryptographic random values in the password generator. The optional strength checker analyses up to 128 Unicode characters locally with a bundled zxcvbn model, loaded only when checking. Checked passwords are masked in the form and excluded from displayed results. Neither generated nor checked passwords are uploaded or intentionally stored.
- QR text/URLs in the local QR generator. QR content is encoded in the browser and is readable by anyone who scans the resulting code.
- Pasted text or explicitly selected/dropped files in the hash tool. Files are read locally in memory, with a 25 MB limit; their contents are not transmitted.
- Foreground/background colors in the color and contrast checker.
- Coordinates entered manually or returned by the browser geolocation API only after the user explicitly selects **Use my location** in the Qibla tool.
- Demographic percentages entered or edited by the user.

The BAC estimator requires the user to affirm an explicit educational-use acknowledgement before calculating. It is not a fitness-to-drive tool.

## Network behaviour

The browser downloads the published static HTML, CSS, JavaScript and locally bundled tokenizer/QR/password-strength assets from this GitHub Pages site. Calculator inputs are not included in those asset requests and are not transmitted to the project owner or a calculation service. The application makes no runtime API or third-party CDN requests. Source links open only when the user deliberately activates them.

The browser/device handles its own geolocation permission and location service. The application reads the returned coordinates in-page and does not send them to an application server.

## Storage and clipboard

The application does not intentionally persist calculator inputs in cookies, localStorage, sessionStorage or IndexedDB. Inputs remain in the current page until it is refreshed or closed. Token IDs, passwords, hashes, JSON output or other values can be copied only after the user deliberately selects a copy control; this writes to the device clipboard through the browser clipboard API. No clipboard read access is requested.

## Limits

A hosting provider necessarily serves static page assets and may process ordinary server request metadata under its own policies. Browser extensions, operating-system services and user-installed software are outside this application's control. This document describes the repository implementation; it is not a guarantee about third-party browser or hosting infrastructure.
