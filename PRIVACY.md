# Privacy and data handling

AdigunTokenCalculator is a static, browser-side utility. Calculator inputs are processed in the active page using JavaScript; the application has no backend, account system, database, analytics, telemetry, advertising tags or remote calculation API.

## What is processed locally
- Text entered into the tokenizer and text-statistics tools.
- Dates and numeric values entered into age, BMI, percentage, engineering, loan, fuel, practice, Zakat, unit, GPA, sleep and countdown tools.
- Coordinates entered manually or returned by the browser geolocation API after the user explicitly selects **Use my location** in the Qibla tool.
- Demographic percentages entered or edited by the user.

## Network behaviour
The browser downloads the published static HTML, CSS, JavaScript and locally bundled tokenizer rank chunks from this GitHub Pages site. Calculator inputs are not included in those asset requests and are not transmitted to the project owner or a calculation service. The application makes no runtime API or CDN requests. Source links open only when the user deliberately activates them.

The browser/device handles its own geolocation permission and location service. The application reads the returned coordinates in-page and does not send them to an application server.

## Storage and clipboard
The application does not intentionally persist calculator inputs in cookies, localStorage, sessionStorage or IndexedDB. Inputs remain in the current page until it is refreshed or closed. Token IDs or reconstructed text can be copied only after the user selects a copy control; this writes to the device clipboard through the browser clipboard API.

## Limits
A hosting provider necessarily serves static page assets and may process ordinary server request metadata under its own policies. Browser extensions, operating-system services and user-installed software are outside this application's control. This document describes the repository implementation; it is not a guarantee about third-party browser or hosting infrastructure.
