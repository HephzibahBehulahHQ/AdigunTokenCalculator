# Privacy and data handling

AdigunTokenCalculator is a static, browser-side utility. All 39 tools process calculator inputs in browser memory, including local background workers for tokenization and JSON formatting. The application has no backend, account system, database, analytics, telemetry, advertising tags or remote calculation API.

## What is processed locally

- Text, model selection, token IDs and token-piece data in the tokenizer and text-statistics tools.
- Dates and numeric values in engineering, temperature, age, BMI, percentage, population, religion, practice-time, Zakat, Qibla, unit, loan, date-difference, GPA, fuel, sleep, time-zone, inflation, tip, calorie, pregnancy, water, BAC, base, Roman numeral, discount, recipe, holiday and statistics tools.
- Currency rates and amounts in the offline converter. Its ECB reference-rate snapshot is bundled in the application and can be edited in the page.
- Password characters and cryptographic random values in the password generator. The optional strength checker analyses up to 128 Unicode characters locally with a bundled zxcvbn model, executed only when checking. Offline preparation can download/cache the model script before it is used; this stores the model, not a password. Checked passwords are masked in the form and excluded from displayed results. Neither generated nor checked passwords are uploaded or intentionally stored.
- QR text/URLs in the local QR generator. QR content is encoded in the browser and is readable by anyone who scans the resulting code.
- Pasted text or explicitly selected/dropped files in the hash tool. Files are read locally in memory, with a 25 MB limit; their contents are not transmitted.
- Foreground/background colors in the color and contrast checker.
- Coordinates entered manually or returned by the browser geolocation API only after the user explicitly selects **Use my location** in the Qibla tool.
- Demographic percentages entered or edited by the user.
- Electrical device labels, power ratings, schedules, tariffs and other load-planning settings. A profile is saved in this browser only when the user selects **Save**.
- Customer name, phone, address, optional email and estimate reference/date entered for an electrical cost estimate. These details stay in page memory and are excluded from saved load profiles and CSV exports; the requested customer print/PDF output includes them.

The BAC estimator opens a warning dialog and requires an explicit educational-use acknowledgement before revealing its form. Cancel or Escape returns to the directory. Reset or re-entry requires fresh acknowledgement; consent is not persisted. It is not a fitness-to-drive tool.

## Network behaviour

The browser downloads the published static HTML, CSS, JavaScript, worker scripts, WebAssembly, images, notices and locally bundled tokenizer/QR/password-strength assets from this GitHub Pages site. Production offline preparation downloads the complete build manifest, including lazy tool assets, and the browser can request updated application files on later visits. Calculator inputs are not included in those asset requests and are not transmitted to the project owner or a calculation service. The application makes no runtime calculation API or third-party CDN requests. Source links open only when the user deliberately activates them.

The browser/device handles its own geolocation permission and location service. The application reads the returned coordinates in-page and does not send them to an application server.

## Offline application files

The production service worker uses browser CacheStorage for the known, same-origin files listed by the build. Cache entries use canonical application-asset URLs. Calculator inputs, URL/query history, generated files, customer details and unrelated-origin requests are not written into this cache. The registration and cache contain application code/data only; tokenization and JSON workers exchange input/result messages in browser memory without sending them to the service worker for storage.

The footer declares readiness after the full manifest is cached, verified and controlling the page. Preparation failures offer Retry. New builds are prepared in a separate versioned cache; activation keeps the current build and one previous build while pruning only this application's scope-specific cache namespace. An offered update warns that reloading clears unsaved work and waits for explicit action while the page is open; the application does not reload automatically. The browser may activate a waiting worker after old pages close.

Cached files can survive a browser restart, but site-data clearing, storage restrictions or browser eviction can remove them. Readiness is rechecked on page visibility/connectivity changes. Removing application caches does not itself delete the separate electrical `localStorage` profile; clearing all site data removes both. Offline preparation is not registered in development mode.

## Storage and clipboard

Calculator inputs stay in page memory by default. The application does not use cookies, sessionStorage or IndexedDB to store those inputs. Passwords, coordinates, health inputs and customer estimate details are not included in the application's saved profile.

The Electrical Load Calculator offers one opt-in profile in `localStorage`, under `adigun.electrical-load.profile.v1`. **Save** replaces the previous saved copy with the applied device list, including device labels, and current validated load settings. It excludes unfinished device-builder edits and customer estimate details. Saving and restoring are not automatic: **Load** reads and validates the saved copy before replacing the current load profile, and **Delete** removes that saved copy only. The saved profile can survive a page refresh or browser restart until deleted or removed through browser site-data controls. Anyone using the same browser profile can read it; use generic device labels without names, addresses or sensitive details.

Token IDs, passwords, hashes, JSON output or other values can be copied only after the user deliberately selects a copy control; this writes to the device clipboard through the browser clipboard API. No clipboard read access is requested.

## Downloads and customer estimates

QR downloads and electrical CSV exports are generated locally after the user selects the corresponding action. Electrical CSV files contain device labels, load settings and calculated results, but exclude the customer estimate fields. **Print customer estimate / PDF** prepares an estimate containing the entered customer details and amounts and opens the browser's print workflow. A PDF or paper copy is created through the user's browser/printing choices, not uploaded by the application.

Downloaded files, clipboard contents and printed/PDF copies are outside the saved-profile slot. Deleting a profile or clearing the page does not remove those copies. Browser and operating-system download, clipboard and printing behavior remains under the user's control.

## Limits

A hosting provider necessarily serves static page assets and may process ordinary server request metadata under its own policies. Browser extensions, operating-system services and user-installed software are outside this application's control. This document describes the repository implementation; it is not a guarantee about third-party browser or hosting infrastructure.
