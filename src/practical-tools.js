import {aiExpansion} from "./aiExpansion.js";
import {tradingExpansion} from "./tradingExpansion.js";
import {electronicsExpansion} from "./electronicsExpansion.js";
import {I} from "./i18n.js";

const locales = ["en", "de", "yo", "pcm"];
export const practicalCategories = [
  ["Home & Construction", "Home & Construction|Haus & Bau|Ilé àti Ìkọ́lé|House & Building"],
  ["Garden & Water", "Garden & Water|Garten & Wasser|Ọgbà àti Omi|Garden & Water"],
  ["Business & Work", "Business & Work|Geschäft & Arbeit|Òwò àti Iṣẹ́|Business & Work"],
  ["Education & Sport", "Education & Sport|Bildung & Sport|Ẹ̀kọ́ àti Eré Ìdárayá|School & Sport"],
  ["Electronics & Automation", "Electronics & Automation|Elektronik & Automatisierung|Ẹ̀rọ Iná àti Ìṣàkóso Aládàáṣe|Electronics & Automation"],
  ["Trading", "Trading|Handel|Ìṣòwò|Trading"],
  ["Faith & Outreach", "Faith & Outreach|Glaube & Gemeindearbeit|Ìgbàgbọ́ àti Ìtànkálẹ̀|Faith & Outreach"],
  ["Civics & Politics", "Civics & Politics|Bürgerkunde & Politik|Ìlú àti Òṣèlú|Civics & Politics"],
];

const number = (key, label, min = 0, max = 1e12) => ({key, label, min, max});
const positive = (key, label) => number(key, label, 0.000001);
const whole = (key, label, min = 1) => ({...number(key, label, min), whole:true});
const percent = (key, label, min = 0) => number(key, label, min, 100);
const tool = (category, title, description, fields, outputs, calculate) =>
  ({category, title, description, fields, outputs, calculate});
const above = (condition, field) => {
  if (!condition) throw Object.assign(new RangeError("number"), {field});
};
const roundUp = value => Math.ceil(value - Number.EPSILON * Math.abs(value));

export const practicalTools = {
  "paint-coverage": tool("Home & Construction",
    "Paint and tins|Farbbedarf und Gebinde|Kíkún ògiri àti agolo|Paint and tins",
    "Estimate paint and whole tins for walls, excluding doors and windows.|Farbmenge und ganze Gebinde für Wände ohne Türen und Fenster berechnen.|Ṣírò àwọ̀ àti agolo fún ògiri, yọ ilẹ̀kùn àti fèrèsé kúrò.|Work out paint and full tins for walls after you remove doors and windows.",
    [
      positive("wallAreaM2","Wall area (m²)|Wandfläche (m²)|Àyè ògiri (m²)|Wall area (m²)"),
      number("openingAreaM2","Doors and windows (m²)|Türen und Fenster (m²)|Ilẹ̀kùn àti fèrèsé (m²)|Doors and windows (m²)"),
      whole("paintCoats","Coats|Anstriche|Ìpele àwọ̀|Coats"),
      positive("coverageM2PerL","Coverage (m²/L)|Ergiebigkeit (m²/L)|Àyè fún lítà (m²/L)|Coverage (m²/L)"),
      positive("tinSizeL","Tin size (L)|Gebindegröße (L)|Ìwọ̀n agolo (L)|Tin size (L)"),
    ], [
      "Paint needed (L)|Farbbedarf (L)|Àwọ̀ tí a nílò (L)|Paint wey you need (L)",
      "Whole tins|Ganze Gebinde|Agolo odidi|Full tins",
    ], (wall, openings, coats, coverage, tin) => {
      above(openings < wall, "openingAreaM2");
      const litres = (wall - openings) * coats / coverage;
      return [litres, roundUp(litres / tin)];
    }),

  "concrete-slab": tool("Home & Construction",
    "Concrete slab|Betonplatte|Pẹlẹbẹ kọ́ńkírítì|Concrete slab",
    "Calculate concrete volume, including waste, and bags based on the yield on the bag.|Betonvolumen einschließlich Zuschlag und Sackzahl nach Herstellerergiebigkeit berechnen.|Ṣírò ìwọ̀n kọ́ńkírítì pẹ̀lú àfikún àti iye àpò gẹ́gẹ́ bí èso àpò.|Work out concrete volume with waste, plus bags from the yield on each bag.",
    [
      positive("slabLengthM","Slab length (m)|Plattenlänge (m)|Gígùn pẹlẹbẹ (m)|Slab length (m)"),
      positive("slabWidthM","Slab width (m)|Plattenbreite (m)|Ìbú pẹlẹbẹ (m)|Slab width (m)"),
      positive("slabDepthCm","Slab thickness (cm)|Plattendicke (cm)|Sísanra pẹlẹbẹ (cm)|Slab thickness (cm)"),
      percent("concreteWastePct","Waste allowance (%)|Verlustzuschlag (%)|Àfikún fún ìsọnù (%)|Waste allowance (%)"),
      positive("bagYieldL","Mixed yield per bag (L)|Frischbeton je Sack (L)|Kọ́ńkírítì láti inú àpò kan (L)|Mixed yield per bag (L)"),
    ], [
      "Concrete to order (m³)|Bestellmenge Beton (m³)|Kọ́ńkírítì láti rà (m³)|Concrete to order (m³)",
      "Bags to buy|Benötigte Säcke|Àpò láti rà|Bags to buy",
    ], (length, width, depth, waste, bag) => {
      const volume = length * width * depth / 100 * (1 + waste / 100);
      return [volume, roundUp(volume * 1000 / bag)];
    }),

  "tile-order": tool("Home & Construction",
    "Tiles and boxes|Fliesen und Kartons|Táìlì àti àpótí|Tiles and boxes",
    "Estimate tile order by area with a cutting allowance. The result does not model the laying pattern.|Fliesenbedarf nach Fläche mit Verschnitt berechnen. Das Verlegemuster bleibt unberücksichtigt.|Ṣírò táìlì nípa àyè pẹ̀lú àfikún fún gígé. Àbájáde kò ka àpẹẹrẹ ìtẹ̀ táìlì.|Estimate tiles by area with extra for cutting. The result no check your laying pattern.",
    [
      positive("floorAreaM2","Area to tile (m²)|Fliesenfläche (m²)|Àyè táìlì (m²)|Area to tile (m²)"),
      positive("tileLengthCm","Tile length (cm)|Fliesenlänge (cm)|Gígùn táìlì (cm)|Tile length (cm)"),
      positive("tileWidthCm","Tile width (cm)|Fliesenbreite (cm)|Ìbú táìlì (cm)|Tile width (cm)"),
      percent("tileWastePct","Cutting allowance (%)|Verschnitt (%)|Àfikún fún gígé (%)|Extra for cutting (%)"),
      whole("tilesPerBox","Tiles per box|Fliesen je Karton|Táìlì nínú àpótí kan|Tiles per box"),
    ], [
      "Tiles needed|Benötigte Fliesen|Táìlì tí a nílò|Tiles wey you need",
      "Whole boxes|Ganze Kartons|Àpótí odidi|Full boxes",
    ], (area, length, width, waste, perBox) => {
      const tiles = roundUp(area * 10000 * (1 + waste / 100) / (length * width));
      return [tiles, roundUp(tiles / perBox)];
    }),

  "rainwater-harvest": tool("Garden & Water",
    "Rainwater collection|Regenwassersammlung|Kíkó omi òjò|Rainwater collection",
    "Estimate runoff from the roof’s horizontal footprint, then account for free tank space.|Abfluss aus der horizontalen Dachfläche schätzen und freien Tankraum berücksichtigen.|Ṣírò omi láti àyè òrùlé lórí ilẹ̀, kí o sì ka àlàfo inú táńkì.|Estimate runoff from the roof area as you see am from above, then check free tank space.",
    [
      positive("roofAreaM2","Horizontal roof area (m²)|Horizontale Dachfläche (m²)|Àyè òrùlé lórí ilẹ̀ (m²)|Roof area from above (m²)"),
      number("rainfallMm","Rainfall (mm)|Niederschlag (mm)|Òjò (mm)|Rainfall (mm)"),
      percent("runoffPct","Runoff collected (%)|Erfasster Abfluss (%)|Omi òjò tí a kó (%)|Runoff wey you collect (%)"),
      number("freeTankLitres","Free tank space (L)|Freier Tankraum (L)|Àlàfo inú táńkì (L)|Free space for tank (L)"),
    ], [
      "Stored water (L)|Gespeichertes Wasser (L)|Omi tí a tọ́jú (L)|Water wey tank hold (L)",
      "Overflow (L)|Überlauf (L)|Omi tó ṣàn kọjá (L)|Overflow (L)",
    ], (area, rain, runoff, space) => {
      const water = area * rain * runoff / 100;
      return [Math.min(water, space), Math.max(0, water - space)];
    }),

  "drip-irrigation": tool("Garden & Water",
    "Drip irrigation runtime|Tropfbewässerungsdauer|Àkókò fífi omi rọ̀ sí ewéko|Drip irrigation time",
    "Use the desired water depth and actual emitter flow to estimate volume and watering time.|Aus gewünschter Wasserhöhe und tatsächlichem Tropferdurchfluss Volumen und Laufzeit berechnen.|Lo gíga omi tí o fẹ́ àti bí omi ṣe ń jáde láti rí ìwọ̀n omi àti àkókò.|Use the water depth you want and the real emitter flow to work out litres and time.",
    [
      positive("gardenAreaM2","Bed area (m²)|Beetfläche (m²)|Àyè ibùsùn ewéko (m²)|Garden bed area (m²)"),
      number("targetWaterMm","Target water depth (mm)|Gewünschte Wasserhöhe (mm)|Gíga omi tí o fẹ́ (mm)|Water depth wey you want (mm)"),
      whole("emitterCount","Drip emitters|Anzahl Tropfer|Iye ibi tí omi ti ń jáde|Number of drip emitters"),
      positive("emitterLitresPerHour","Flow per emitter (L/h)|Durchfluss je Tropfer (L/h)|Omi láti ibi kan (L/h)|Flow per emitter (L/h)"),
    ], [
      "Water required (L)|Wasserbedarf (L)|Omi tí a nílò (L)|Water wey you need (L)",
      "Watering time (min)|Bewässerungszeit (min)|Àkókò fífi omi (ìṣẹ́jú)|Watering time (min)",
    ], (area, depth, count, flow) => [area * depth, area * depth / (count * flow) * 60]),

  "plant-spacing": tool("Garden & Water",
    "Garden bed plant count|Pflanzenzahl im Beet|Iye ewéko nínú ibùsùn|Garden bed plant count",
    "Count plants on a rectangular grid with half a spacing left at each edge. Paths are excluded.|Pflanzen im rechteckigen Raster mit halbem Abstand am Rand zählen. Wege bleiben außen vor.|Ka ewéko ní àtòjọ onígun mẹ́rin, kí ìdajì àlàfo wà létí. A kò ka ọ̀nà.|Count plants for straight rows. Leave half the spacing at each edge and leave paths out.",
    [
      positive("bedLengthM","Bed length (m)|Beetlänge (m)|Gígùn ibùsùn (m)|Bed length (m)"),
      positive("bedWidthM","Bed width (m)|Beetbreite (m)|Ìbú ibùsùn (m)|Bed width (m)"),
      positive("plantSpacingCm","Spacing along row (cm)|Abstand in der Reihe (cm)|Àlàfo láàárín ewéko (cm)|Space along each row (cm)"),
      positive("rowSpacingCm","Spacing between rows (cm)|Reihenabstand (cm)|Àlàfo láàárín ìlà (cm)|Space between rows (cm)"),
    ], [
      "Rows|Reihen|Ìlà|Rows", "Plants per row|Pflanzen je Reihe|Ewéko ní ìlà kan|Plants per row",
      "Total plants|Pflanzen insgesamt|Àpapọ̀ ewéko|Total plants",
    ], (length, width, spacing, rowSpacing) => {
      const rows = Math.floor(width * 100 / rowSpacing);
      const plants = Math.floor(length * 100 / spacing);
      return [rows, plants, rows * plants];
    }),

  "product-break-even": tool("Business & Work",
    "Break-even sales|Gewinnschwelle|Títà láti bo ináwó|Break-even sales",
    "Find how many units cover fixed costs. Enter all money amounts in the same currency and period.|Absatz zur Deckung der Fixkosten berechnen. Alle Beträge in derselben Währung und Periode eingeben.|Rí iye ọjà tí yóò bo ináwó dúró. Lo owó orílẹ̀-èdè àti àkókò kan náà.|Find how many units cover fixed costs. Use the same currency and period for every amount.",
    [
      number("fixedCosts","Fixed costs|Fixkosten|Ináwó dúró|Fixed costs"),
      positive("sellingPrice","Selling price per unit|Verkaufspreis je Stück|Iye títà ẹyọ kan|Selling price per unit"),
      number("variableCost","Variable cost per unit|Variable Kosten je Stück|Ináwó ẹyọ kan|Variable cost per unit"),
    ], [
      "Contribution per unit|Deckungsbeitrag je Stück|Owó tó kù fún ẹyọ kan|Money left per unit",
      "Units to break even|Absatz an der Gewinnschwelle|Ẹyọ láti bo ináwó|Units to break even",
      "Revenue at that volume|Umsatz bei dieser Menge|Owó títà ní iye yẹn|Revenue for that quantity",
    ], (fixed, price, cost) => {
      above(price > cost, "variableCost");
      const margin = Number((price - cost).toPrecision(14));
      const quantity = roundUp(fixed / margin);
      return [margin, quantity, quantity * price];
    }),

  "shift-staffing": tool("Business & Work",
    "Shift staffing|Schichtbesetzung|Iye òṣìṣẹ́ fún ìṣísẹ̀|Shift staffing",
    "Estimate minimum staff for a workload and shift after deducting breaks and other planned downtime.|Mindestpersonal je Schicht nach Abzug von Pausen und geplanter Ausfallzeit schätzen.|Ṣírò iye òṣìṣẹ́ tó kéré jù fún iṣẹ́, lẹ́yìn yíyọ ìsinmi àti àkókò tí iṣẹ́ dúró.|Estimate the least staff for the work after you remove breaks and other planned downtime.",
    [
      whole("itemsToProcess","Items to process|Zu bearbeitende Stückzahl|Iye ohun láti ṣe|Items to process",0),
      positive("itemsPerStaffHour","Items per productive staff-hour|Stück je produktiver Personalstunde|Iye iṣẹ́ tí òṣìṣẹ́ kan ṣe ní wákàtí|Items per active worker-hour"),
      positive("shiftHours","Shift length (h)|Schichtlänge (h)|Gígùn ìṣísẹ̀ (wákàtí)|Shift length (h)"),
      number("downtimeMinutes","Downtime per person (min)|Ausfallzeit je Person (min)|Àkókò àìṣiṣẹ́ fún ẹnìkan (ìṣẹ́jú)|Downtime per person (min)"),
    ], [
      "Productive hours per person|Produktive Stunden je Person|Wákàtí iṣẹ́ ẹnìkan|Active hours per person",
      "Minimum staff|Mindestpersonal|Iye òṣìṣẹ́ tó kéré jù|Minimum staff",
    ], (items, rate, shift, downtime) => {
      above(downtime < shift * 60, "downtimeMinutes");
      const productive = shift - downtime / 60;
      return [productive, roundUp(items / (rate * productive))];
    }),

  "final-grade-target": tool("Education & Sport",
    "Final exam score needed|Benötigte Abschlussprüfungsnote|Àmì ìdánwò ìparí tí a nílò|Final exam score wey you need",
    "Use your current coursework average and exam weight to find the required score. Above 100% means the target is unreachable.|Benötigte Prüfungsnote aus aktuellem Schnitt und Prüfungsgewicht berechnen. Über 100 % ist das Ziel unerreichbar.|Lo ìpíndọ́gba iṣẹ́ kíláàsì àti ìwọ̀n ìdánwò. Iye tó ju 100% lọ túmọ̀ sí pé a kò lè dé ibi àfojúsùn.|Use your coursework average and exam weight. If e pass 100%, the target no dey possible.",
    [
      percent("courseworkAveragePct","Coursework average (%)|Aktueller Kursschnitt (%)|Ìpíndọ́gba iṣẹ́ kíláàsì (%)|Coursework average (%)"),
      percent("examWeightPct","Exam weight (%)|Prüfungsgewicht (%)|Ìwọ̀n ìdánwò (%)|Exam weight (%)",0.01),
      percent("targetGradePct","Target overall grade (%)|Angestrebte Gesamtnote (%)|Àmì àpapọ̀ tí o fẹ́ (%)|Overall grade wey you want (%)"),
    ], [
      "Exam score needed (%)|Benötigte Prüfungsnote (%)|Àmì ìdánwò tí a nílò (%)|Exam score wey you need (%)",
      "Best possible grade (%)|Bestmögliche Gesamtnote (%)|Àmì àpapọ̀ tó ga jù (%)|Highest grade possible (%)",
    ], (coursework, weight, target) => {
      const earned = coursework * (100 - weight) / 100;
      return [Math.max(0,(target - earned) * 100 / weight), earned + weight];
    }),

  "running-pace": tool("Education & Sport",
    "Running pace and finish time|Lauftempo und Zielzeit|Ìyára sáré àti àkókò ìparí|Running pace and finish time",
    "Calculate your average pace from elapsed time and project a finish time at the same pace.|Durchschnittstempo berechnen und Zielzeit bei gleichem Tempo schätzen.|Ṣírò ìyára àárín láti inú àkókò tí o lò, kí o sì fojú díwọ̀n àkókò ìparí ní ìyára kan náà.|Work out your average pace and estimate when you fit finish another distance at the same pace.",
    [
      positive("distanceRunKm","Distance already run (km)|Gelaufene Strecke (km)|Ọ̀nà tí o ti sáré (km)|Distance wey you don run (km)"),
      positive("elapsedRunMinutes","Elapsed time (decimal min)|Gelaufene Zeit (Dezimalminuten)|Àkókò tí o lò (ìṣẹ́jú eleemewa)|Time wey you use (decimal min)"),
      positive("finishDistanceKm","Target distance (km)|Zieldistanz (km)|Ọ̀nà àfojúsùn (km)|Target distance (km)"),
    ], [
      "Pace (min/km)|Tempo (min/km)|Ìyára (ìṣẹ́jú/km)|Pace (min/km)",
      "Speed (km/h)|Geschwindigkeit (km/h)|Ìyára (km/h)|Speed (km/h)",
      "Projected finish time (min)|Geschätzte Zielzeit (min)|Àkókò ìparí tí a fojú díwọ̀n (ìṣẹ́jú)|Estimated finish time (min)",
    ], (distance, elapsed, finish) => [elapsed / distance, distance / elapsed * 60, elapsed / distance * finish]),

  "print-resolution": tool("Conversion",
    "Image print resolution|Bildauflösung für den Druck|Ìpinnu àwòrán títẹ̀|Image print resolution",
    "Find pixels per inch on each axis and the largest uncropped print size at your chosen density.|Pixel pro Zoll je Achse und die maximale unbeschnittene Druckgröße bei gewählter Dichte berechnen.|Ṣírò píkísẹ́lì fún ínṣì ní apá méjèèjì àti ìwọ̀n títẹ̀ tó pọ̀ jù láìgé àwòrán.|Find pixels per inch for width and height, plus the biggest print at the density you choose without cropping.",
    [
      whole("imageWidthPx","Image width (px)|Bildbreite (px)|Ìbú àwòrán (px)|Image width (px)"),
      whole("imageHeightPx","Image height (px)|Bildhöhe (px)|Gíga àwòrán (px)|Image height (px)"),
      positive("printWidthCm","Print width (cm)|Druckbreite (cm)|Ìbú ìtẹ̀jáde (cm)|Print width (cm)"),
      positive("printHeightCm","Print height (cm)|Druckhöhe (cm)|Gíga ìtẹ̀jáde (cm)|Print height (cm)"),
      positive("targetPrintPpi","Target density (ppi)|Gewünschte Dichte (ppi)|Ìpọ̀ píkísẹ́lì tí o fẹ́ (ppi)|Target density (ppi)"),
    ], [
      "Horizontal density (ppi)|Horizontale Dichte (ppi)|Ìpọ̀ píkísẹ́lì ní ìbú (ppi)|Horizontal density (ppi)",
      "Vertical density (ppi)|Vertikale Dichte (ppi)|Ìpọ̀ píkísẹ́lì ní gíga (ppi)|Vertical density (ppi)",
      "Maximum print width (cm)|Maximale Druckbreite (cm)|Ìbú ìtẹ̀jáde tó pọ̀ jù (cm)|Maximum print width (cm)",
      "Maximum print height (cm)|Maximale Druckhöhe (cm)|Gíga ìtẹ̀jáde tó pọ̀ jù (cm)|Maximum print height (cm)",
    ], (width, height, printWidth, printHeight, density) => [
      width * 2.54 / printWidth, height * 2.54 / printHeight, width / density * 2.54, height / density * 2.54,
    ]),

  "download-time": tool("Developer",
    "Download time|Download-Dauer|Àkókò gbígbà fáìlì|Download time",
    "Estimate transfer time from decimal GB, link speed and an allowance for overhead or congestion.|Übertragungszeit aus dezimalen GB, Leitungsrate und Abschlag für Overhead oder Überlastung berechnen.|Ṣírò àkókò gbígbà láti inú GB eleemewa, ìyára àti ìdínkù nítorí iṣẹ́ àfikún tàbí ọ̀pọ̀ olùlò.|Estimate download time from decimal GB, link speed and how much of that speed you fit really use.",
    [
      positive("downloadSizeGb","File size (GB)|Dateigröße (GB)|Ìwọ̀n fáìlì (GB)|File size (GB)"),
      positive("linkSpeedMbps","Link speed (Mbps)|Leitungsrate (Mbit/s)|Ìyára ìsopọ̀ (Mbps)|Link speed (Mbps)"),
      percent("linkEfficiencyPct","Usable share of link speed (%)|Nutzbarer Anteil der Leitungsrate (%)|Ìpín ìyára tí a lè lò (%)|Share of link speed wey you fit use (%)",0.01),
    ], [
      "Effective speed (Mbps)|Effektive Rate (Mbit/s)|Ìyára gidi (Mbps)|Effective speed (Mbps)",
      "Transfer time (min)|Übertragungszeit (min)|Àkókò gbígbà (ìṣẹ́jú)|Transfer time (min)",
    ], (size, speed, efficiency) => {
      const effective = speed * efficiency / 100;
      return [effective, size * 8000 / effective / 60];
    }),

  "fence-posts": tool("Home & Construction",
    "Fence posts and bays|Zaunpfosten und Felder|Òpó àti ààyè ọgbà|Fence posts and sections",
    "Plan evenly spaced posts for one straight fence with a post at each end. Measure each side separately.|Gleichmäßig gesetzte Pfosten für eine gerade Zaunseite mit zwei Endpfosten planen. Jede Seite separat messen.|Ṣètò òpó tó jìnnà síra déédéé fún ọgbà tààrà pẹ̀lú òpó ní òpin méjèèjì. Wọn ẹ̀gbẹ́ kọ̀ọ̀kan lọ́tọ̀.|Plan even spacing for one straight fence with one post for each end. Measure each side on its own.",
    [
      positive("fenceRunM","Straight fence length (m)|Gerade Zaunlänge (m)|Gígùn ọgbà tààrà (m)|Straight fence length (m)"),
      positive("maxPostSpacingM","Maximum post spacing (m)|Maximaler Pfostenabstand (m)|Àlàfo tó pọ̀ jù láàárín òpó (m)|Biggest space between posts (m)"),
    ],[
      "Fence bays|Zaunfelder|Ààyè láàárín òpó|Fence sections",
      "Total posts|Pfosten insgesamt|Àpapọ̀ òpó|Total posts",
      "Actual spacing (m)|Tatsächlicher Abstand (m)|Àlàfo gidi (m)|Actual spacing (m)",
    ],(length, spacing)=>{
      const bays=roundUp(length/spacing);
      return [bays,bays+1,length/bays];
    }),

  "ramp-geometry": tool("Home & Construction",
    "Ramp geometry|Rampengeometrie|Ìwọ̀n ọ̀nà òkè|Ramp geometry",
    "Calculate incline and ramp length from a rise and horizontal run.|Steigung und Rampenlänge aus Höhe und horizontaler Strecke berechnen.|Ṣírò ìtẹ̀sí àti gígùn ọ̀nà òkè láti inú gíga àti jíjìn lórí ilẹ̀.|Work out the slope and ramp length from the rise and the flat distance.",
    [
      number("rampRiseCm","Vertical rise (cm)|Höhenunterschied (cm)|Ìgòkè (cm)|Vertical rise (cm)"),
      positive("rampRunCm","Horizontal run (cm)|Waagerechte Strecke (cm)|Jíjìn lórí ilẹ̀ (cm)|Flat distance (cm)"),
    ],[
      "Slope (%)|Steigung (%)|Ìtẹ̀sí (%)|Slope (%)",
      "Incline (°)|Neigungswinkel (°)|Igun (°)|Incline (°)",
      "Ramp length (cm)|Rampenlänge (cm)|Gígùn ọ̀nà òkè (cm)|Ramp length (cm)",
    ],(rise, run)=>[rise/run*100,Math.atan2(rise,run)*180/Math.PI,Math.hypot(rise,run)]),

  "cycling-gear-speed": tool("Education & Sport",
    "Cycling gear speed|Geschwindigkeit aus Fahrradübersetzung|Ìyára kẹ̀kẹ́ ní jíà|Bicycle gear speed",
    "Calculate distance per pedal revolution and speed from gearing, wheel rollout and cadence.|Weg je Kurbelumdrehung und Geschwindigkeit aus Übersetzung, Radumfang und Trittfrequenz berechnen.|Ṣírò jíjìn fún yíyí ẹsẹ̀ kan àti ìyára láti inú jíà, àyíká kẹ̀kẹ́ àti iye yíyí.|Use gear teeth, wheel rollout and pedalling rate to work out distance per turn and speed.",
    [
      whole("frontChainringTeeth","Front chainring teeth|Zähne am Kettenblatt|Eyín jíà iwájú|Front chainring teeth"),
      whole("rearSprocketTeeth","Rear sprocket teeth|Zähne am Ritzel|Eyín jíà ẹ̀yìn|Rear sprocket teeth"),
      positive("wheelRolloutCm","Wheel rollout (cm)|Radumfang (cm)|Àyíká kẹ̀kẹ́ (cm)|Wheel rollout (cm)"),
      number("pedalCadenceRpm","Cadence (rpm)|Trittfrequenz (U/min)|Yíyí ẹsẹ̀ ní ìṣẹ́jú kan|Pedalling rate (rpm)"),
    ],[
      "Distance per pedal revolution (m)|Weg je Kurbelumdrehung (m)|Jíjìn fún yíyí ẹsẹ̀ kan (m)|Distance per pedal turn (m)",
      "Ground speed (km/h)|Geschwindigkeit (km/h)|Ìyára (km/h)|Ground speed (km/h)",
    ],(front,rear,rollout,cadence)=>{
      const metres=front/rear*rollout/100;
      return [metres,metres*cadence*60/1000];
    }),

  "ev-charging-session": tool("Conversion",
    "EV charging session|Ladevorgang für E-Autos|Àkókò fífi iná sínú ọkọ̀|EV charging session",
    "Estimate wall energy and duration from usable battery capacity, charge targets and average wall power.|Netzenergie und Dauer aus nutzbarer Akkukapazität, Ladeständen und mittlerer Ladeleistung schätzen.|Ṣírò iná láti ògiri àti àkókò láti inú agbára batiri, ìpele tí o fẹ́ àti agbára ìpíndọ́gba.|Estimate energy from the wall and charging time with usable battery size, charge targets and average wall power.",
    [
      positive("usableBatteryKwh","Usable battery capacity (kWh)|Nutzbare Akkukapazität (kWh)|Agbára batiri tí a lè lò (kWh)|Usable battery capacity (kWh)"),
      percent("batteryStartPct","Starting charge (%)|Ladestand zu Beginn (%)|Ìpele batiri ní ìbẹ̀rẹ̀ (%)|Starting charge (%)"),
      percent("batteryTargetPct","Target charge (%)|Gewünschter Ladestand (%)|Ìpele batiri tí o fẹ́ (%)|Target charge (%)"),
      positive("averageWallKw","Average wall power (kW)|Mittlere Netzleistung (kW)|Agbára iná ìpíndọ́gba (kW)|Average wall power (kW)"),
      percent("chargingEfficiencyPct","Charging efficiency (%)|Ladewirkungsgrad (%)|Ìpín iná tó wọ batiri (%)|Charging efficiency (%)",0.01),
    ],[
      "Energy added to battery (kWh)|Energie im Akku (kWh)|Iná tó wọ batiri (kWh)|Energy wey enter battery (kWh)",
      "Energy drawn from wall (kWh)|Energie aus dem Netz (kWh)|Iná láti ògiri (kWh)|Energy wey come from wall (kWh)",
      "Estimated charging time (h)|Geschätzte Ladezeit (h)|Àkókò fífi iná (wákàtí)|Estimated charging time (h)",
    ],(capacity,start,target,power,efficiency)=>{
      above(target>=start,"batteryTargetPct");
      const battery=capacity*(target-start)/100;
      const wall=battery*100/efficiency;
      return [battery,wall,wall/power];
    }),

  "dough-hydration": tool("Conversion",
    "Bread dough hydration|Teighydration|Ìpín omi nínú ìyẹ̀fun búrẹ́dì|Bread dough hydration",
    "Calculate water and salt as percentages of total flour. Include any preferment flour and water in your totals.|Wasser und Salz als Prozentsatz der gesamten Mehlmenge berechnen. Mehl und Wasser aus Vorteig mitrechnen.|Ṣírò ìpín omi àti iyọ̀ sí gbogbo ìyẹ̀fun. Ka omi àti ìyẹ̀fun inú ìpèsè àkọ́kọ́ pẹ̀lú.|Work out water and salt as percentages of all flour. Count flour and water inside any starter too.",
    [
      positive("totalFlourG","Total flour (g)|Mehl gesamt (g)|Gbogbo ìyẹ̀fun (g)|Total flour (g)"),
      number("totalWaterG","Total water (g)|Wasser gesamt (g)|Gbogbo omi (g)|Total water (g)"),
      number("doughSaltG","Salt (g)|Salz (g)|Iyọ̀ (g)|Salt (g)"),
    ],[
      "Hydration (%)|Hydration (%)|Ìpín omi (%)|Hydration (%)",
      "Salt percentage (%)|Salzanteil (%)|Ìpín iyọ̀ (%)|Salt percentage (%)",
    ],(flour,water,salt)=>[water/flour*100,salt/flour*100]),

  "pcm-audio-size": tool("Developer",
    "Uncompressed audio size|Größe unkomprimierter Audiodaten|Ìwọ̀n ohùn tí a kò fún pọ̀|Uncompressed audio size",
    "Estimate raw PCM data size and bitrate from duration, sample rate, stored bytes per sample and channels. File headers are excluded.|PCM-Rohgröße und Bitrate aus Dauer, Abtastrate, Bytes pro Abtastwert und Kanälen schätzen. Dateiköpfe bleiben unberücksichtigt.|Ṣírò ìwọ̀n PCM àti ìṣàn bítì láti inú àkókò, iye àpẹẹrẹ, báìtì fún àpẹẹrẹ àti ikanni. A kò ka orí fáìlì.|Estimate PCM data size and bitrate from time, sample rate, stored bytes and channels. File header no dey inside.",
    [
      positive("audioMinutes","Audio duration (min)|Audiodauer (min)|Àkókò ohùn (ìṣẹ́jú)|Audio duration (min)"),
      whole("samplesPerSecond","Sample rate (Hz)|Abtastrate (Hz)|Iye àpẹẹrẹ ní ìṣẹ́jú-àáyá (Hz)|Sample rate (Hz)"),
      whole("bytesPerAudioSample","Stored bytes per sample|Bytes je Abtastwert|Báìtì tí a tọ́jú fún àpẹẹrẹ|Stored bytes per sample"),
      whole("audioChannels","Audio channels|Audiokanäle|Ikanni ohùn|Audio channels"),
    ],[
      "Raw size (decimal MB)|Rohgröße (dezimale MB)|Ìwọ̀n gidi (MB eleemewa)|Raw size (decimal MB)",
      "Data rate (Mbps)|Datenrate (Mbit/s)|Ìṣàn dátà (Mbps)|Data rate (Mbps)",
    ],(minutes,rate,bytes,channels)=>{
      const bytesPerSecond=rate*bytes*channels;
      return [bytesPerSecond*minutes*60/1e6,bytesPerSecond*8/1e6];
    }),

  "pump-energy": tool("Electronics & Automation",
    "Water pump power and energy|Pumpenleistung und Energie|Agbára fifa omi|Water pump power and energy",
    "Estimate hydraulic power, input power and energy for fresh water at a steady flow and head.|Hydraulische Leistung, Eingangsleistung und Energie für Frischwasser bei konstantem Durchfluss und Förderhöhe schätzen.|Ṣírò agbára omi, agbára tí fifa ń gba àti iná tí ó lò fún omi tútù ní ìṣàn tó dúró.|Estimate water power, input power and energy when fresh water dey flow steady.",
    [
      positive("pumpFlowLpm","Water flow (L/min)|Wasserdurchfluss (L/min)|Ìṣàn omi (L/ìṣẹ́jú)|Water flow (L/min)"),
      positive("pumpHeadM","Total head (m)|Gesamtförderhöhe (m)|Gíga fífa omi lápapọ̀ (m)|Total head (m)"),
      percent("pumpOverallEfficiencyPct","Overall efficiency (%)|Gesamtwirkungsgrad (%)|Ìmúlò agbára lápapọ̀ (%)|Overall efficiency (%)",0.01),
      number("pumpHours","Running time (h)|Laufzeit (h)|Àkókò iṣẹ́ (wákàtí)|Running time (h)"),
    ],[
      "Hydraulic power (kW)|Hydraulische Leistung (kW)|Agbára omi (kW)|Water power (kW)",
      "Input power (kW)|Eingangsleistung (kW)|Agbára tí fifa ń gba (kW)|Input power (kW)",
      "Input energy (kWh)|Energiebedarf (kWh)|Iná tí fifa lò (kWh)|Input energy (kWh)",
    ],(flow,head,efficiency,hours)=>{
      const hydraulic=flow*9.80665*head/60000;
      const input=hydraulic*100/efficiency;
      return [hydraulic,input,input*hours];
    }),

  "conveyor-throughput": tool("Electronics & Automation",
    "Conveyor throughput|Förderbanddurchsatz|Iye ẹrù lórí bẹ́líìtì|Conveyor throughput",
    "Estimate steady single-lane output using belt speed, centre-to-centre item spacing and working time.|Konstante einspurige Leistung aus Bandgeschwindigkeit, Mittenabstand und Betriebsdauer schätzen.|Ṣírò iye ẹrù ní ojú ọ̀nà kan pẹ̀lú ìyára bẹ́líìtì, àlàfo àárín ẹrù àti àkókò iṣẹ́.|Estimate how many items pass for one lane from belt speed, item spacing and working time.",
    [
      positive("beltMetresPerMinute","Belt speed (m/min)|Bandgeschwindigkeit (m/min)|Ìyára bẹ́líìtì (m/ìṣẹ́jú)|Belt speed (m/min)"),
      positive("itemPitchCm","Centre-to-centre spacing (cm)|Mittenabstand (cm)|Àlàfo láàárín àárín ẹrù (cm)|Space from centre to centre (cm)"),
      number("conveyorRunMinutes","Working time (min)|Betriebsdauer (min)|Àkókò iṣẹ́ (ìṣẹ́jú)|Working time (min)"),
    ],[
      "Items per minute|Stück pro Minute|Ẹrù ní ìṣẹ́jú kan|Items per minute",
      "Estimated complete items|Geschätzte ganze Stück|Iye ẹrù odidi tí a fojú díwọ̀n|Estimated complete items",
    ],(speed,pitch,minutes)=>{
      const rate=speed*100/pitch;
      return [rate,Math.floor(rate*minutes)];
    }),

  "inventory-reorder": tool("Trading",
    "Stock reorder point|Bestellpunkt für Lagerbestand|Iye ọjà fún àṣẹ tuntun|Stock reorder point",
    "Combine expected daily demand, supplier lead time and reserve stock to find when to reorder.|Tagesbedarf, Lieferzeit und Sicherheitsbestand zum Bestellpunkt kombinieren.|Lo iye tí a ń tà lójoojúmọ́, àkókò ìfijiṣẹ́ àti ọjà àfikún láti mọ ìgbà àṣẹ tuntun.|Use daily demand, supplier delivery time and reserve stock to know when to order again.",
    [
      number("dailyUnitsSold","Expected demand (units/day)|Erwarteter Bedarf (Stück/Tag)|Iye ọjà lójoojúmọ́|Expected demand (units/day)"),
      number("supplierLeadDays","Supplier lead time (days)|Lieferzeit (Tage)|Àkókò ìfijiṣẹ́ (ọjọ́)|Supplier lead time (days)"),
      whole("reserveStockUnits","Reserve stock (units)|Sicherheitsbestand (Stück)|Ọjà àfikún (ẹyọ)|Reserve stock (units)",0),
      whole("stockPositionUnits","Stock on hand plus open orders (units)|Lagerbestand plus offene Bestellungen (Stück)|Ọjà lọ́wọ́ pẹ̀lú àṣẹ tó ṣì ń bọ̀ (ẹyọ)|Stock wey dey plus orders wey never land (units)",0),
    ],[
      "Expected demand during lead time|Erwarteter Bedarf während der Lieferzeit|Iye tí a ń retí ní àkókò ìfijiṣẹ́|Expected demand before delivery",
      "Reorder at this stock position|Bestellpunkt|Iye ọjà fún àṣẹ tuntun|Stock level for new order",
      "Units below reorder point|Fehlmenge bis zum Bestellpunkt|Ẹyọ tí ó kù sí ibi àṣẹ|Units below reorder point",
    ],(demand,lead,reserve,position)=>{
      const expected=demand*lead;
      const point=roundUp(expected+reserve);
      return [expected,point,Math.max(0,point-position)];
    }),

  "llm-output-capacity": tool("Token & AI",
    "LLM output capacity|LLM-Ausgabekapazität|Agbára ìjáde LLM|LLM output capacity",
    "Size identical inference instances for a target request rate using measured output throughput and average output length.|Anzahl gleicher Inferenzinstanzen aus gemessener Ausgaberate, durchschnittlicher Ausgabelänge und gewünschter Anfragerate berechnen.|Ṣírò iye ẹ̀rọ LLM láti inú ìyára ìjáde tí a wọn, gígùn ìjáde àárín àti iye ìbéèrè.|Work out how many identical LLM instances you need from measured token speed, average output length and request rate.",
    [
      positive("instanceOutputTokensSec","Measured output per instance (tokens/s)|Gemessene Ausgabe pro Instanz (Token/s)|Ìjáde ẹ̀rọ kan tí a wọn (tọ́kẹ́nì/s)|Measured output per instance (tokens/s)"),
      positive("averageOutputTokenCount","Average output per request (tokens)|Mittlere Ausgabelänge je Anfrage (Token)|Ìjáde àárín fún ìbéèrè kan (tọ́kẹ́nì)|Average output per request (tokens)"),
      number("targetRequestsPerMinute","Target requests per minute|Gewünschte Anfragen pro Minute|Ìbéèrè àfojúsùn ní ìṣẹ́jú kan|Target requests per minute"),
      percent("instanceUtilizationPct","Planned utilization (%)|Geplante Auslastung (%)|Ìpín agbára tí a fẹ́ lò (%)|Planned usage (%)",0.01),
    ],[
      "Planned rate per instance (requests/min)|Geplante Rate je Instanz (Anfragen/min)|Ìbéèrè fún ẹ̀rọ kan (ìbéèrè/ìṣẹ́jú)|Planned rate per instance (requests/min)",
      "Whole instances required|Benötigte Instanzen|Iye ẹ̀rọ odidi tí a nílò|Full instances wey you need",
    ],(tokens,perRequest,target,utilization)=>{
      const rate=tokens*60/perRequest*utilization/100;
      return [rate,roundUp(target/rate)];
    }),

  "scripture-reading-plan": tool("Faith & Outreach",
    "Scripture reading schedule|Bibel-Leseplan|Ètò kíkà Ìwé Mímọ́|Scripture reading plan",
    "Spread a chosen number of chapters over active reading days. Allocate at most one extra chapter to the busier days.|Eine gewählte Kapitelzahl auf Lesetage verteilen. An stärker belegten Tagen kommt höchstens ein Kapitel hinzu.|Pín iye orí tí o yàn sí àwọn ọjọ́ kíkà. Fi orí kan ṣoṣo kún ọjọ́ tí ó pọ̀ jù.|Share the chapters across reading days. The busier days get only one extra chapter.",
    [
      whole("chaptersToRead","Chapters to read|Zu lesende Kapitel|Orí láti kà|Chapters to read"),
      whole("readingWeeks","Plan length (weeks)|Planlänge (Wochen)|Gígùn ètò (ọ̀sẹ̀)|Plan length (weeks)"),
      {...whole("readingDaysPerWeek","Reading days per week|Lesetage pro Woche|Ọjọ́ kíkà ní ọ̀sẹ̀ kan|Reading days each week"),max:7},
    ],[
      "Active reading days|Aktive Lesetage|Ọjọ́ kíkà|Active reading days",
      "Base chapters per day|Grundzahl der Kapitel pro Tag|Iye orí ìpìlẹ̀ ní ọjọ́ kan|Base chapters per day",
      "Days with one extra chapter|Tage mit einem zusätzlichen Kapitel|Ọjọ́ pẹ̀lú orí àfikún kan|Days with one extra chapter",
    ],(chapters,weeks,days)=>{
      const active=weeks*days;
      return [active,Math.floor(chapters/active),chapters%active];
    }),

  "community-event-seating": tool("Business & Work",
    "Community event seating|Sitzplanung für Veranstaltungen|Ètò ìjókòó fún àpéjọ|Community event seating",
    "Plan table quantities for attendees and a seating reserve using the actual seats per table.|Tischzahl für Teilnehmende und Sitzreserve anhand der Plätze je Tisch berechnen.|Ṣírò iye tábìlì fún àwọn tó ń bọ̀ àti àfikún, gẹ́gẹ́ bí iye àga tábìlì kan.|Work out tables for attendees and spare seats using the real number wey each table fit hold.",
    [
      whole("eventAttendees","Expected attendees|Erwartete Teilnehmende|Iye ènìyàn tí a ń retí|Expected attendees"),
      whole("seatsPerTable","Seats per table|Sitzplätze je Tisch|Àga fún tábìlì kan|Seats per table"),
      percent("seatingReservePct","Extra seating (%)|Sitzreserve (%)|Ìjókòó àfikún (%)|Extra seating (%)"),
    ],[
      "Seats to plan for|Einzuplanende Sitzplätze|Àga tí a nílò|Seats to plan for",
      "Whole tables|Ganze Tische|Tábìlì odidi|Full tables",
      "Spare seats after reserving|Weitere freie Plätze|Àga tó ṣì kù|Spare seats after reserve",
    ],(guests,capacity,reserve)=>{
      const seats=guests+roundUp(guests*reserve/100);
      const tables=roundUp(seats/capacity);
      return [seats,tables,tables*capacity-seats];
    }),

  "community-match-funding": tool("Civics & Politics",
    "Community project match funding|Kofinanzierung für Gemeinschaftsprojekte|Owó àfikún fún iṣẹ́ àwùjọ|Community project match funding",
    "Apply a matching rate and sponsor cap to eligible donations, then compare funds with the project budget. Use one currency.|Förderquote und Höchstbetrag auf förderfähige Spenden anwenden und mit dem Projektbudget vergleichen. Eine Währung verwenden.|Lo ìpín owó àfikún àti ààlà olùrànlọ́wọ́ sí ẹ̀bùn tó yẹ, kí o sì fi wé ètò ináwó. Lo owó kan náà.|Use match rate and sponsor limit for donations wey qualify, then compare total with project budget. Use one currency.",
    [
      number("eligibleDonations","Eligible donations|Förderfähige Spenden|Ẹ̀bùn tó yẹ|Donations wey qualify"),
      number("sponsorMatchPct","Sponsor match rate (%)|Förderquote (%)|Ìpín owó àfikún (%)|Sponsor match rate (%)",0,1000),
      number("sponsorMatchLimit","Sponsor matching cap|Förderhöchstbetrag|Ààlà owó olùrànlọ́wọ́|Sponsor matching cap"),
      positive("communityProjectBudget","Project budget|Projektbudget|Ètò ináwó iṣẹ́|Project budget"),
    ],[
      "Sponsor contribution|Förderbeitrag|Owó olùrànlọ́wọ́|Sponsor contribution",
      "Combined funds|Gesamtmittel|Gbogbo owó tó wà|Combined funds",
      "Budget still unfunded|Noch nicht finanziertes Budget|Owó tí kò tíì pé|Money still needed",
    ],(donations,rate,cap,budget)=>{
      const match=Math.min(cap,donations*rate/100);
      const total=donations+match;
      return [match,total,Math.max(0,budget-total)];
    }),

  "trade-fee-break-even": tool("Trading",
    "Trade fee break-even price|Gewinnschwelle nach Handelsgebühren|Iye tí ó bo owó ìdúnàádúrà|Trade fee break-even price",
    "Find the exit price that covers your entry cost and fees on both orders. Use the same fee schedule and currency for each side.|Ausstiegspreis berechnen, der Einstiegskosten und Gebühren für beide Aufträge deckt. Auf beiden Seiten dasselbe Gebührenmodell und dieselbe Währung verwenden.|Rí iye títà tí ó bo iye rírà àti owó ìdúnàádúrà méjèèjì. Lo ìlànà owó àti owó orílẹ̀-èdè kan náà.|Find the sell price wey cover your buy cost and fees for both orders. Use the same fee rate and currency for both sides.",
    [
      positive("tradeEntryUnitPrice","Entry price per unit|Einstiegskurs je Einheit|Iye rírà fún ẹyọ kan|Buy price per unit"),
      positive("tradeAssetQuantity","Quantity traded|Gehandelte Menge|Iye ohun tí a rà|Quantity traded"),
      number("tradeFeePct","Fee per order (%)|Gebühr je Auftrag (%)|Owó ìdúnàádúrà kọ̀ọ̀kan (%)|Fee per order (%)",0,99.99),
      number("fixedTradeFee","Fixed fee per order|Fixgebühr je Auftrag|Owó dúró fún ìdúnàádúrà kan|Fixed fee per order"),
    ],[
      "Total entry cost|Gesamte Einstiegskosten|Gbogbo owó rírà|Total buy cost",
      "Break-even exit price per unit|Ausstiegskurs an der Gewinnschwelle|Iye títà ẹyọ kan láti bo ináwó|Break-even sell price per unit",
      "Increase needed from entry (%)|Nötiger Kursanstieg (%)|Ìfikún tí a nílò láti iye rírà (%)|Increase wey price need (%)",
    ],(entry,quantity,fee,fixed)=>{
      const rate=fee/100;
      const entryCost=entry*quantity*(1+rate)+fixed;
      const exit=(entryCost+fixed)/(quantity*(1-rate));
      return [entryCost,exit,Math.max(0,(exit/entry-1)*100)];
    }),

  "election-turnout": tool("Civics & Politics",
    "Election turnout and ballot rates|Wahlbeteiligung und Stimmzettelquoten|Ìkópa ìdìbò àti ìpín ìwé ìbò|Election turnout and ballot rates",
    "Calculate turnout from registered voters and ballot validity from ballots cast. Use counts from the same election and area.|Wahlbeteiligung aus Wahlberechtigten und Gültigkeitsquote aus abgegebenen Stimmzetteln berechnen. Zahlen derselben Wahl und Region verwenden.|Ṣírò ìkópa láti inú iye olùdìbò tí a forúkọ sílẹ̀, àti ìwúlò ìwé ìbò láti inú gbogbo ìwé tí a dì. Lo ìdìbò àti agbègbè kan náà.|Work out turnout from registered voters and ballot validity from all ballots cast. Use figures from the same election and area.",
    [
      whole("registeredVoterCount","Registered voters|Registrierte Wahlberechtigte|Olùdìbò tí a forúkọ sílẹ̀|Registered voters"),
      whole("ballotsCastCount","Ballots cast|Abgegebene Stimmzettel|Iye ìwé ìbò tí a dì|Ballots cast",0),
      whole("validBallotsCount","Valid ballots|Gültige Stimmzettel|Ìwé ìbò tó wúlò|Valid ballots",0),
    ],[
      "Registered voter turnout (%)|Wahlbeteiligung (%)|Ìpín olùdìbò tó dìbò (%)|Registered voter turnout (%)",
      "Ballots not counted as valid|Nicht als gültig gezählte Stimmzettel|Ìwé ìbò tí a kò kà sí èyí tó wúlò|Ballots wey no count as valid",
      "Valid ballot share (%)|Anteil gültiger Stimmzettel (%)|Ìpín ìwé ìbò tó wúlò (%)|Valid ballot share (%)",
    ],(registered,cast,valid)=>{
      above(cast<=registered,"ballotsCastCount");
      above(valid<=cast,"validBallotsCount");
      return [cast/registered*100,cast-valid,cast?valid/cast*100:null];
    }),

  "dc-cable-voltage-drop": tool("Electronics & Automation",
    "DC cable voltage drop|Gleichspannungsabfall im Kabel|Ìdínkù foliteji nínú okùn DC|DC cable voltage drop",
    "Estimate voltage drop and heating loss for a two-wire DC run using the conductor resistance supplied for one wire.|Spannungsabfall und Leitungsverlust einer zweiadrigen Gleichstromstrecke aus dem Widerstand eines einzelnen Leiters schätzen.|Ṣírò ìdínkù foliteji àti agbára tó sọnù nínú okùn DC méjì pẹ̀lú ìdènà okùn kan.|Estimate voltage drop and cable heat loss for a two-wire DC run using the resistance for one wire.",
    [
      positive("dcSupplyVolts","Supply voltage (V)|Versorgungsspannung (V)|Foliteji ìpèsè (V)|Supply voltage (V)"),
      positive("dcOneWayMetres","One-way cable length (m)|Einfache Leitungslänge (m)|Gígùn okùn lọ ní ọ̀nà kan (m)|One-way cable length (m)"),
      positive("conductorOhmsPerKm","Single-conductor resistance (Ω/km)|Widerstand eines Leiters (Ω/km)|Ìdènà okùn kan (Ω/km)|Resistance for one wire (Ω/km)"),
      number("dcLoadAmps","Load current (A)|Laststrom (A)|Ìṣàn iná ẹrù (A)|Load current (A)"),
    ],[
      "Cable voltage drop (V)|Spannungsabfall (V)|Ìdínkù foliteji (V)|Cable voltage drop (V)",
      "Voltage at load (V)|Spannung an der Last (V)|Foliteji ní ẹrù (V)|Voltage for load (V)",
      "Cable power loss (W)|Leistungsverlust im Kabel (W)|Agbára tí ó sọnù nínú okùn (W)|Cable power loss (W)",
    ],(supply,length,resistance,current)=>{
      const drop=2*length/1000*resistance*current;
      above(drop<=supply,"dcLoadAmps");
      return [drop,supply-drop,drop*current];
    }),

  "two-lot-cost-basis": tool("Trading",
    "Two-lot purchase cost|Einstandskosten zweier Käufe|Owó rírà ìpele méjì|Cost of two purchases",
    "Combine two purchases of the same asset. Include acquisition fees to calculate your average cost per unit. Use one currency.|Zwei Käufe desselben Werts zusammenfassen. Kaufgebühren in den Einstandspreis je Einheit einrechnen. Eine Währung verwenden.|Darapọ̀ rírà ohun kan ní ìpele méjì. Ka owó iṣẹ́ rírà sí iye ẹyọ kan. Lo owó kan náà.|Join two buys of the same asset. Add buy fees to get average cost per unit. Use one currency.",
    [
      positive("firstLotUnits","First purchase quantity|Menge des ersten Kaufs|Iye rírà àkọ́kọ́|First buy quantity"),
      positive("firstLotPrice","First purchase price per unit|Erster Kaufpreis je Einheit|Iye ẹyọ kan ní rírà àkọ́kọ́|First buy price per unit"),
      positive("secondLotUnits","Second purchase quantity|Menge des zweiten Kaufs|Iye rírà kejì|Second buy quantity"),
      positive("secondLotPrice","Second purchase price per unit|Zweiter Kaufpreis je Einheit|Iye ẹyọ kan ní rírà kejì|Second buy price per unit"),
      number("acquisitionFees","Total fees for both buys|Summe der Kaufgebühren|Gbogbo owó iṣẹ́ rírà méjèèjì|Total fees for both buys"),
    ],[
      "Combined quantity|Gesamtmenge|Àpapọ̀ iye ẹyọ|Combined quantity",
      "Total cost including fees|Gesamtkosten mit Gebühren|Gbogbo owó pẹ̀lú owó iṣẹ́|Total cost with fees",
      "Average cost per unit|Einstandspreis je Einheit|Iye owó àárín fún ẹyọ kan|Average cost per unit",
    ],(first,firstPrice,second,secondPrice,fees)=>{
      const total=first*firstPrice+second*secondPrice+fees;
      return [first+second,total,total/(first+second)];
    }),

  "ai-dataset-split": tool("Token & AI",
    "AI dataset split sizes|Größen der KI-Datensatzaufteilung|Ìpín àkójọpọ̀ dátà AI|AI dataset split sizes",
    "Allocate whole records to training, validation and test sets. Training gets the remaining share after the two holdouts.|Ganze Datensätze auf Training, Validierung und Test verteilen. Training erhält den Rest nach den beiden zurückgehaltenen Teilen.|Pín àkọsílẹ̀ odidi sí ìdánilẹ́kọ̀ọ́, àyẹ̀wò àti ìdánwò. Ìdánilẹ́kọ̀ọ́ gba ìpín tó kù.|Share whole records between training, validation and test sets. Training gets the share wey remain.",
    [
      whole("datasetRecordCount","Total records|Datensätze insgesamt|Àpapọ̀ àkọsílẹ̀|Total records"),
      percent("validationSetPct","Validation share (%)|Validierungsanteil (%)|Ìpín àyẹ̀wò (%)|Validation share (%)"),
      percent("testSetPct","Test share (%)|Testanteil (%)|Ìpín ìdánwò (%)|Test share (%)"),
    ],[
      "Training records|Trainingsdatensätze|Àkọsílẹ̀ ìdánilẹ́kọ̀ọ́|Training records",
      "Validation records|Validierungsdatensätze|Àkọsílẹ̀ àyẹ̀wò|Validation records",
      "Test records|Testdatensätze|Àkọsílẹ̀ ìdánwò|Test records",
    ],(records,validation,test)=>{
      const holdout=validation+test;
      above(holdout<=100,"testSetPct");
      const shares=[100-holdout,validation,test].map(share=>records*(share/100));
      const counts=shares.map(Math.floor);
      const ranking=[0,1,2].sort((a,b)=>(shares[b]-counts[b])-(shares[a]-counts[a]));
      const remainder=records-counts.reduce((sum,count)=>sum+count,0);
      for(const index of ranking.slice(0,remainder))counts[index]++;
      return counts;
    }),

  "sermon-timing": tool("Faith & Outreach",
    "Sermon and reading timing|Zeitplanung für Predigt und Lesung|Àkókò ìwàásù àti kíkà|Sermon and reading timing",
    "Estimate delivery and Scripture reading time separately, then include pauses or transitions.|Predigt und Schriftlesung getrennt schätzen und Pausen oder Übergänge berücksichtigen.|Ṣírò àkókò ìwàásù àti kíkà Ìwé Mímọ́ lọ́tọ̀, kí o sì fi ìsinmi tàbí ìyípadà kún un.|Estimate preaching and Scripture reading time apart, then add pauses or changeovers.",
    [
      whole("sermonWordCount","Sermon manuscript words|Wörter im Predigtmanuskript|Ọ̀rọ̀ inú ìwàásù|Sermon manuscript words",0),
      positive("sermonWordsPerMinute","Sermon delivery (words/min)|Predigttempo (Wörter/min)|Ìyára ìwàásù (ọ̀rọ̀/ìṣẹ́jú)|Sermon delivery (words/min)"),
      whole("scriptureWordCount","Scripture reading words|Wörter der Schriftlesung|Ọ̀rọ̀ inú kíkà Ìwé Mímọ́|Scripture reading words",0),
      positive("readingWordsPerMinute","Reading pace (words/min)|Lesetempo (Wörter/min)|Ìyára kíkà (ọ̀rọ̀/ìṣẹ́jú)|Reading speed (words/min)"),
      number("transitionMinutes","Pauses and transitions (min)|Pausen und Übergänge (min)|Ìsinmi àti ìyípadà (ìṣẹ́jú)|Pauses and changeovers (min)"),
    ],[
      "Sermon delivery (min)|Predigtdauer (min)|Àkókò ìwàásù (ìṣẹ́jú)|Sermon delivery (min)",
      "Scripture reading (min)|Schriftlesung (min)|Àkókò kíkà Ìwé Mímọ́ (ìṣẹ́jú)|Scripture reading (min)",
      "Total time needed (min)|Gesamtdauer (min)|Gbogbo àkókò tí a nílò (ìṣẹ́jú)|Total time wey you need (min)",
    ],(sermon,delivery,scripture,reading,pauses)=>{
      const speaking=sermon/delivery, read=scripture/reading;
      return [speaking,read,speaking+read+pauses];
    }),

  "public-service-backlog": tool("Civics & Politics",
    "Public service backlog|Rückstand im Bürgerservice|Iṣẹ́ araalu tí ó kù|Public service backlog",
    "Project open requests at steady intake and closure rates. A dash means the existing backlog cannot clear at those rates.|Offene Anfragen bei konstantem Eingang und Abschluss schätzen. Ein Strich bedeutet, dass der bestehende Rückstand so nicht abgebaut wird.|Fojú díwọ̀n ìbéèrè tí ó ṣì ṣí pẹ̀lú iye tí ń wọlé àti tí a ń parí. Àmì gígùn túmọ̀ sí pé iṣẹ́ tó kù kò lè tán ní ìyára yẹn.|Estimate open requests if intake and closures stay steady. A dash means the backlog no fit clear at those rates.",
    [
      whole("openServiceRequests","Open requests now|Aktuell offene Anfragen|Ìbéèrè tó ṣì ṣí báyìí|Open requests now",0),
      number("incomingRequestsWeek","New requests per week|Neue Anfragen pro Woche|Ìbéèrè tuntun lọ́sẹ̀ kan|New requests per week"),
      number("closedRequestsWeek","Requests closed per week|Abgeschlossene Anfragen pro Woche|Ìbéèrè tí a parí lọ́sẹ̀ kan|Requests closed per week"),
      whole("serviceForecastWeeks","Forecast period (weeks)|Prognosezeitraum (Wochen)|Àkókò ìfojúdíwọ̀n (ọ̀sẹ̀)|Forecast period (weeks)"),
    ],[
      "Expected open requests at end|Erwartete offene Anfragen am Ende|Ìbéèrè tí ó lè kù ní ìparí|Expected open requests at end",
      "Full weeks to clear current backlog|Volle Wochen bis zum Abbau des Rückstands|Ọ̀sẹ̀ odidi láti parí iṣẹ́ tó kù|Full weeks to clear current backlog",
    ],(open,incoming,closed,weeks)=>{
      const netClosed=closed-incoming;
      return [Math.max(0,open-netClosed*weeks),open===0?0:netClosed>0?roundUp(open/netClosed):null];
    }),

  "led-series-resistor": tool("Electronics & Automation",
    "LED series resistor|LED-Vorwiderstand|Resístọ̀ LED ní tẹ̀léra|LED series resistor",
    "Estimate resistance and resistor dissipation for a steady DC supply and a string of identical LEDs in series.|Widerstand und Verlustleistung für eine konstante Gleichspannungsquelle und gleiche LEDs in Reihe schätzen.|Ṣírò ìdènà àti agbára tó sọnù fún orísun DC tó dúró àti LED kan náà ní tẹ̀léra.|Estimate resistor value and heat for steady DC and matching LEDs for one series.",
    [
      number("ledSupplyVolts","DC supply (V)|Gleichspannung (V)|Foliteji DC (V)|DC supply (V)",0.01,60),
      positive("ledForwardVolts","Forward voltage per LED (V)|Durchlassspannung je LED (V)|Foliteji iwájú LED kan (V)|Forward voltage per LED (V)"),
      whole("ledsInSeries","LEDs in series|LEDs in Reihe|LED ní tẹ̀léra|LEDs in series"),
      positive("ledTargetMilliamps","Target current (mA)|Zielstrom (mA)|Ìṣàn tí a fẹ́ (mA)|Target current (mA)"),
    ],[
      "Resistor voltage (V)|Spannung am Widerstand (V)|Foliteji resístọ̀ (V)|Resistor voltage (V)",
      "Calculated resistance (Ω)|Berechneter Widerstand (Ω)|Ìdènà tí a ṣírò (Ω)|Calculated resistance (Ω)",
      "Resistor dissipation (W)|Verlustleistung am Widerstand (W)|Agbára tí resístọ̀ ń tú (W)|Resistor heat loss (W)",
    ],(supply,forward,count,milliamps)=>{
      const voltage=supply-forward*count;
      above(voltage>0,"ledsInSeries");
      const current=milliamps/1000;
      return [voltage,voltage/current,voltage*current];
    }),

  "drawdown-recovery": tool("Trading",
    "Drawdown and recovery|Verlust und Erholung|Ìdínkù àti ìpadà bọ̀|Drawdown and recovery",
    "Compare a current account value with its earlier peak. Use the same currency and exclude the effect of deposits and withdrawals.|Aktuellen Kontowert mit früherem Höchststand vergleichen. Gleiche Währung verwenden und Ein- und Auszahlungen herausrechnen.|Fi iye owó lọ́wọ́ wé iye tó ga jù tẹ́lẹ̀. Lo owó kan náà, yọ owó tí a fi kún tàbí yọ kúrò.|Compare current account value with the old peak. Use one currency and leave deposits and withdrawals out.",
    [
      positive("accountPeakValue","Earlier peak value|Früherer Höchststand|Iye tó ga jù tẹ́lẹ̀|Earlier peak value"),
      number("currentAccountValue","Current account value|Aktueller Kontowert|Iye owó báyìí|Current account value"),
    ],[
      "Value lost|Wertverlust|Iye tó sọnù|Value lost",
      "Drawdown from peak (%)|Rückgang vom Höchststand (%)|Ìdínkù láti ibi gíga (%)|Drawdown from peak (%)",
      "Gain required to recover (%)|Nötiger Gewinn zur Erholung (%)|Èrè tí a nílò láti padà (%)|Gain wey you need to recover (%)",
    ],(peak,current)=>{
      above(current<=peak,"currentAccountValue");
      const loss=peak-current;
      return [loss,loss/peak*100,current>0?loss/current*100:null];
    }),

  "ai-model-weight-memory": tool("Token & AI",
    "AI model weight memory|Speicherbedarf für KI-Modellgewichte|Ìrántí fún ìwọ̀n àwòṣe AI|AI model weight memory",
    "Estimate ideal weight storage plus an explicit allowance for runtime overhead. Enter the allowance separately for cache and buffers.|Ideale Speichergröße der Gewichte plus einen Zuschlag für die Laufzeit angeben. Cache und Puffer im Zuschlag berücksichtigen.|Ṣírò ibi ìpamọ́ ìwọ̀n àwòṣe àti àfikún ìrántí fún iṣẹ́. Ka cache àti buffer sínú àfikún.|Estimate weight storage and add your own runtime allowance for cache and buffers.",
    [
      positive("modelParametersBillions","Model parameters (billions)|Modellparameter (Milliarden)|Àwọn paramita àwòṣe (bílíọ̀nù)|Model parameters (billions)"),
      {...whole("modelBitsPerParameter","Stored bits per parameter|Gespeicherte Bits je Parameter|Bítì fún paramita kan|Stored bits per parameter"),max:64},
      number("modelRuntimeAllowanceGib","Extra runtime memory (GiB)|Zusätzlicher Laufzeitspeicher (GiB)|Ìrántí àfikún fún iṣẹ́ (GiB)|Extra runtime memory (GiB)"),
    ],[
      "Ideal weights (GB)|Ideale Gewichtsgröße (GB)|Ìwọ̀n àwòṣe (GB)|Ideal weights (GB)",
      "Ideal weights (GiB)|Ideale Gewichtsgröße (GiB)|Ìwọ̀n àwòṣe (GiB)|Ideal weights (GiB)",
      "Total with allowance (GiB)|Gesamt mit Zuschlag (GiB)|Àpapọ̀ pẹ̀lú àfikún (GiB)|Total with allowance (GiB)",
    ],(parameters,bits,allowance)=>{
      const gb=parameters*bits/8;
      const gib=gb*1e9/2**30;
      return [gb,gib,gib+allowance];
    }),

  "outreach-print-order": tool("Faith & Outreach",
    "Outreach print order|Druckauftrag für Gemeindearbeit|Àṣẹ ìtẹ̀wé fún ìtànkálẹ̀|Outreach print order",
    "Plan outreach handouts with spare copies, pack rounding and a printing budget. Use one currency.|Handzettel für Gemeindearbeit mit Reserve, Packungsrundung und Druckbudget planen. Eine Währung verwenden.|Ṣètò ìwé ìtànkálẹ̀ pẹ̀lú àfikún, àpò odidi àti ètò owó. Lo owó kan náà.|Plan outreach handouts with spare copies, full packs and print cost. Use one currency.",
    [
      whole("outreachRecipients","People to reach|Zu erreichende Personen|Iye ènìyàn tí a fẹ́ dé ọ̀dọ̀|People to reach"),
      percent("extraHandoutPct","Extra copies (%)|Reserveexemplare (%)|Ìwé àfikún (%)|Extra copies (%)"),
      whole("handoutsPerPack","Copies per pack|Exemplare je Packung|Ìwé nínú àpò kan|Copies per pack"),
      number("outreachPackPrice","Price per printed pack|Preis je Druckpackung|Iye owó àpò ìtẹ̀wé kan|Price per printed pack"),
    ],[
      "Copies to plan for|Einzuplanende Exemplare|Iye ìwé tí a nílò|Copies to plan for",
      "Packs to order|Zu bestellende Packungen|Àpò láti pàṣẹ|Packs to order",
      "Total printing cost|Gesamtdruckkosten|Gbogbo owó ìtẹ̀wé|Total print cost",
    ],(people,extra,perPack,price)=>{
      const copies=people+roundUp(people*extra/100);
      const packs=roundUp(copies/perPack);
      return [copies,packs,packs*price];
    }),

  "public-comment-slots": tool("Civics & Politics",
    "Public meeting comment slots|Redeplätze für öffentliche Sitzungen|Àyè ọ̀rọ̀ ní ìpàdé gbogbogbò|Public meeting comment slots",
    "Reserve time for agenda business, then count how many equal speaker slots fit in the remainder, including changeovers.|Zeit für Tagesordnungspunkte abziehen und gleich lange Redeplätze einschließlich Wechselzeiten zählen.|Yọ àkókò iṣẹ́ ìpàdé kúrò, kí o sì ka iye àyè ọ̀rọ̀ tó dọ́gba pẹ̀lú ìyípadà.|Keep time for meeting business, then count equal speaker slots wey fit, including changeovers.",
    [
      positive("meetingDurationMinutes","Full meeting length (min)|Gesamte Sitzungsdauer (min)|Gbogbo gígùn ìpàdé (ìṣẹ́jú)|Full meeting length (min)"),
      number("scheduledBusinessMinutes","Scheduled agenda time (min)|Feste Tagesordnungszeit (min)|Àkókò iṣẹ́ tí a ṣètò (ìṣẹ́jú)|Scheduled agenda time (min)"),
      positive("speakerMinutesEach","Speaking time per person (min)|Redezeit je Person (min)|Àkókò ọ̀rọ̀ fún ẹnìkan (ìṣẹ́jú)|Speaking time per person (min)"),
      number("speakerChangeMinutes","Changeover per slot (min)|Wechselzeit je Platz (min)|Àkókò ìyípadà fún àyè kan (ìṣẹ́jú)|Changeover per slot (min)"),
    ],[
      "Public comment time available (min)|Verfügbare Zeit für Wortmeldungen (min)|Àkókò ọ̀rọ̀ tó wà (ìṣẹ́jú)|Public comment time available (min)",
      "Full speaker slots|Ganze Redeplätze|Àyè ọ̀rọ̀ odidi|Full speaker slots",
      "Unallocated time (min)|Unverplante Zeit (min)|Àkókò tí a kò pín (ìṣẹ́jú)|Time left unallocated (min)",
    ],(total,business,speaker,change)=>{
      above(business<=total,"scheduledBusinessMinutes");
      const available=total-business;
      const block=speaker+change;
      const slots=Math.floor(available/block+Number.EPSILON*available/block);
      return [available,slots,Math.max(0,available-slots*block)];
    }),

  "transformer-turns": tool("Electronics & Automation",
    "Ideal transformer turns ratio|Ideales Transformator-Übersetzungsverhältnis|Ìpín yípo ẹ̀rọ amúná|Ideal transformer turns ratio",
    "Calculate ideal secondary voltage and reflected primary current from winding turns and secondary load current.|Ideale Sekundärspannung und reflektierten Primärstrom aus Windungszahlen und Sekundärstrom berechnen.|Ṣírò foliteji ẹ̀ka kejì àti ìṣàn ẹ̀ka àkọ́kọ́ láti inú iye yípo àti ìṣàn ẹrù.|Work out ideal secondary voltage and primary current from winding turns and the current for the secondary load.",
    [
      positive("transformerPrimaryVolts","Primary voltage (V RMS)|Primärspannung (V effektiv)|Foliteji àkọ́kọ́ (V RMS)|Primary voltage (V RMS)"),
      whole("transformerPrimaryTurns","Primary winding turns|Primärwindungen|Yípo ẹ̀ka àkọ́kọ́|Primary winding turns"),
      whole("transformerSecondaryTurns","Secondary winding turns|Sekundärwindungen|Yípo ẹ̀ka kejì|Secondary winding turns"),
      number("transformerSecondaryAmps","Secondary load current (A RMS)|Sekundärlaststrom (A effektiv)|Ìṣàn ẹrù ẹ̀ka kejì (A RMS)|Secondary load current (A RMS)"),
    ],[
      "Secondary voltage (V RMS)|Sekundärspannung (V effektiv)|Foliteji ẹ̀ka kejì (V RMS)|Secondary voltage (V RMS)",
      "Primary load current (A RMS)|Primärlaststrom (A effektiv)|Ìṣàn ẹrù ẹ̀ka àkọ́kọ́ (A RMS)|Primary load current (A RMS)",
      "Apparent load (VA)|Scheinleistung (VA)|Agbára tí ó hàn (VA)|Apparent load (VA)",
    ],(volts,primary,secondary,amps)=>{
      const ratio=secondary/primary;
      return [volts*ratio,amps*ratio,volts*ratio*amps];
    }),

  "trade-payoff": tool("Trading",
    "Trade payoff after costs|Handelsergebnis nach Kosten|Èrè ìdúnàádúrà lẹ́yìn ináwó|Trade payoff after costs",
    "Use two hypothetical exit prices for a long position. The output shows the outcome if either price is reached and the win rate needed to break even across repeat trades.|Zwei hypothetische Ausstiegskurse für eine Long-Position verwenden. Ergebnis je Kurs und nötige Trefferquote für wiederholte Geschäfte berechnen.|Lo iye títà méjì tí o fojú díwọ̀n. Ṣírò ohun tó ṣẹlẹ̀ ní iye kọ̀ọ̀kan àti ìpín ìṣẹ́gun láti bo ináwó.|Use two possible sell prices for a long position. Check profit or loss for each and the win rate wey fit cover loss over repeated trades.",
    [
      positive("payoffEntryPrice","Entry price per unit|Einstiegskurs je Einheit|Iye rírà fún ẹyọ kan|Buy price per unit"),
      positive("favorableExitPrice","Higher exit price per unit|Höherer Ausstiegskurs je Einheit|Iye títà tó ga fún ẹyọ kan|Higher sell price per unit"),
      number("adverseExitPrice","Lower exit price per unit|Niedrigerer Ausstiegskurs je Einheit|Iye títà tó kéré fún ẹyọ kan|Lower sell price per unit"),
      positive("payoffTradeQuantity","Position quantity|Positionsmenge|Iye ẹyọ àpapọ̀|Position quantity"),
      number("payoffRoundTripCost","Total entry and exit costs|Gesamte Ein- und Ausstiegskosten|Gbogbo owó iṣẹ́ rírà àti títà|Total buy and sell costs"),
    ],[
      "Net gain at higher price|Nettogewinn zum höheren Kurs|Èrè gidi ní iye gíga|Net gain for higher price",
      "Net loss at lower price|Nettoverlust zum niedrigeren Kurs|Òfo gidi ní iye kékeré|Net loss for lower price",
      "Break-even win rate (%)|Trefferquote an der Gewinnschwelle (%)|Ìpín ìṣẹ́gun láti bo ináwó (%)|Break-even win rate (%)",
    ],(entry,high,low,quantity,cost)=>{
      above(high>entry&&quantity*(high-entry)>cost,"favorableExitPrice");
      above(low<entry,"adverseExitPrice");
      const gain=quantity*(high-entry)-cost;
      const loss=quantity*(entry-low)+cost;
      return [gain,loss,loss/(gain+loss)*100];
    }),

  "ai-annotation-capacity": tool("Token & AI",
    "Dataset labeling and review effort|Aufwand für Datenannotation und Prüfung|Iṣẹ́ fífi àmì sí dátà àti àyẹ̀wò|Dataset labeling and review effort",
    "Estimate separate labeling and quality-review hours, with team days if the two stages run in sequence.|Stunden für Annotation und Qualitätsprüfung getrennt schätzen und Teamtage für aufeinanderfolgende Stufen berechnen.|Ṣírò wákàtí fífi àmì àti àyẹ̀wò lọ́tọ̀, pẹ̀lú ọjọ́ ẹgbẹ́ bí iṣẹ́ méjèèjì bá tẹ̀léra.|Estimate hours for labeling and quality review apart, and team days if the work happens one stage after the other.",
    [
      whole("recordsToAnnotate","Records to label|Zu annotierende Datensätze|Àkọsílẹ̀ láti fi àmì sí|Records to label"),
      positive("annotationMinutesPerRecord","Labeling time (min/record)|Annotationszeit (min/Datensatz)|Àkókò fífi àmì (ìṣẹ́jú/àkọsílẹ̀)|Labeling time (min/record)"),
      percent("reviewSamplePct","Records to review (%)|Zu prüfende Datensätze (%)|Àkọsílẹ̀ fún àyẹ̀wò (%)|Records to review (%)"),
      positive("reviewMinutesPerRecord","Review time (min/record)|Prüfzeit (min/Datensatz)|Àkókò àyẹ̀wò (ìṣẹ́jú/àkọsílẹ̀)|Review time (min/record)"),
      positive("productiveTeamHoursDay","Combined team hours per day|Produktive Teamstunden pro Tag|Wákàtí iṣẹ́ ẹgbẹ́ lójoojúmọ́|Combined team hours per day"),
    ],[
      "Labeling hours|Annotationsstunden|Wákàtí fífi àmì|Labeling hours",
      "Review hours|Prüfstunden|Wákàtí àyẹ̀wò|Review hours",
      "Total team days|Teamtage insgesamt|Gbogbo ọjọ́ ẹgbẹ́|Total team days",
    ],(records,label,review,minutes,team)=>{
      const labelHours=records*label/60;
      const reviewHours=roundUp(records*review/100)*minutes/60;
      return [labelHours,reviewHours,(labelHours+reviewHours)/team];
    }),

  "service-livestream-data": tool("Faith & Outreach",
    "Service livestream data budget|Datenbudget für Gottesdienst-Livestreams|Ìwọ̀n dátà fún ìgbéjáde ìjọsìn|Service livestream data budget",
    "Estimate upload bandwidth and data for a service streamed at a steady video and audio bitrate, including your overhead allowance.|Uploadrate und Datenmenge für einen Gottesdienst mit konstanter Video- und Audiorate samt Zuschlag schätzen.|Ṣírò ìyára àti iye dátà ìgbéjáde ìjọsìn pẹ̀lú ìṣàn fídíò àti ohùn tó dúró àti àfikún tí o yàn.|Estimate upload speed and data for service livestream when the video and audio rate stay steady. Add your overhead allowance.",
    [
      positive("serviceStreamMinutes","Stream length (min)|Streamdauer (min)|Àkókò ìgbéjáde (ìṣẹ́jú)|Stream length (min)"),
      positive("churchVideoMbps","Video bitrate (Mbps)|Videobitrate (Mbit/s)|Ìṣàn fídíò (Mbps)|Video bitrate (Mbps)"),
      number("churchAudioKbps","Audio bitrate (kbps)|Audiobitrate (kbit/s)|Ìṣàn ohùn (kbps)|Audio bitrate (kbps)"),
      percent("streamOverheadPct","Overhead allowance (%)|Overhead-Zuschlag (%)|Ìṣàn àfikún (%)|Extra overhead (%)"),
      whole("directUploadFeeds","Outgoing feeds from this connection|Ausgehende Streams über diesen Anschluss|Iye ìgbéjáde láti ìsopọ̀ yìí|Outgoing feeds from this connection"),
    ],[
      "Estimated total upload (Mbps)|Geschätzte gesamte Uploadrate (Mbit/s)|Ìyára fífi dátà ránṣẹ́ lápapọ̀ (Mbps)|Estimated total upload (Mbps)",
      "Estimated upload data (GB)|Geschätzte Uploadmenge (GB)|Iye dátà tí a ránṣẹ́ (GB)|Estimated upload data (GB)",
    ],(minutes,video,audio,extra,feeds)=>{
      const bandwidth=(video+audio/1000)*(1+extra/100)*feeds;
      return [bandwidth,bandwidth*minutes*60/8000];
    }),

  "meeting-quorum": tool("Civics & Politics",
    "Meeting quorum count|Beschlussfähigkeitsgrenze|Iye ènìyàn tó yẹ fún ìpàdé|Meeting quorum count",
    "Apply the attendance percentage in your meeting rules to eligible members, rounding up to a whole person.|Den Mindestanteil aus der Geschäftsordnung auf stimmberechtigte Mitglieder anwenden und aufrunden.|Lo ìpín wíwà nínú òfin ìpàdé fún ọmọ ẹgbẹ́ tó yẹ, yí i sókè sí ènìyàn odidi.|Use the attendance percentage for your own meeting rules. Round up to a whole person.",
    [
      whole("membersEligibleForQuorum","Eligible members|Stimmberechtigte Mitglieder|Ọmọ ẹgbẹ́ tó yẹ|Eligible members"),
      percent("requiredQuorumPct","Required attendance (%)|Erforderlicher Anwesenheitsanteil (%)|Ìpín wíwà tó yẹ (%)|Required attendance (%)",0.01),
      whole("membersPresentForQuorum","Eligible members present|Anwesende stimmberechtigte Mitglieder|Ọmọ ẹgbẹ́ tó yẹ tó wà|Eligible members present",0),
    ],[
      "Required members present|Erforderliche anwesende Mitglieder|Ọmọ ẹgbẹ́ tó gbọ́dọ̀ wà|Required members present",
      "Attendance share (%)|Anwesenheitsanteil (%)|Ìpín ọmọ ẹgbẹ́ tó wà (%)|Attendance share (%)",
      "Additional members needed|Noch benötigte Mitglieder|Ọmọ ẹgbẹ́ míì tí a nílò|Extra members wey you need",
    ],(members,percentage,present)=>{
      above(present<=members,"membersPresentForQuorum");
      const needed=roundUp(members*percentage/100);
      return [needed,present/members*100,Math.max(0,needed-present)];
    }),

  "shaft-torque": tool("Electronics & Automation",
    "Motor shaft torque|Motordrehmoment an der Welle|Yíyí agbára ọ̀pá mọ́tò|Motor shaft torque",
    "Convert mechanical shaft power and rotational speed to torque. Use the mechanical output power of the motor.|Mechanische Wellenleistung und Drehzahl in Drehmoment umrechnen. Mechanische Ausgangsleistung des Motors eingeben.|Yí agbára ọ̀pá mọ́tò àti ìyára yíyí padà sí agbára yíyí. Lo agbára tí mọ́tò ń fún ọ̀pá.|Use shaft output power and rotational speed to work out torque.",
    [
      number("mechanicalShaftKw","Mechanical shaft power (kW)|Mechanische Wellenleistung (kW)|Agbára ọ̀pá mọ́tò (kW)|Mechanical shaft power (kW)"),
      positive("shaftRevolutionsMinute","Shaft speed (rpm)|Wellendrehzahl (U/min)|Ìyára ọ̀pá mọ́tò (rpm)|Shaft speed (rpm)"),
    ],[
      "Rotational speed (rad/s)|Winkelgeschwindigkeit (rad/s)|Ìyára yíyí (rad/s)|Rotational speed (rad/s)",
      "Shaft torque (N·m)|Wellendrehmoment (N·m)|Agbára yíyí ọ̀pá (N·m)|Shaft torque (N·m)",
    ],(power,rpm)=>{
      const speed=rpm*2*Math.PI/60;
      return [speed,power*1000/speed];
    }),

  "fx-round-trip": tool("Trading",
    "FX spread and round-trip cost|Devisenspread und Kosten für Kauf und Rückverkauf|Àlàfo iye owó àjèjì àti ináwó rírà padà|FX spread and round-trip cost",
    "Estimate an immediate buy and sell at the quoted ask and bid. Use quote currency per one base unit and one commission rate for both orders.|Sofortigen Kauf und Rückverkauf zum Brief- und Geldkurs schätzen. Kurswährung je Basiseinheit und gleichen Provisionssatz verwenden.|Fojú díwọ̀n rírà àti títà lẹ́sẹ̀kẹsẹ̀. Lo owó kejì fún ẹyọ owó ìpìlẹ̀ kan àti ìpín owó iṣẹ́ kan náà.|Estimate a buy and sell at the quoted ask and bid. Use quote currency per base unit and the same commission for both.",
    [
      positive("fxBaseUnits","Base currency units|Einheiten der Basiswährung|Ẹyọ owó ìpìlẹ̀|Base currency units"),
      positive("fxBidQuote","Bid (quote currency per base unit)|Geldkurs (Kurswährung pro Basiseinheit)|Iye títà fún ẹyọ ìpìlẹ̀ kan|Bid (quote currency per base unit)"),
      positive("fxAskQuote","Ask (quote currency per base unit)|Briefkurs (Kurswährung pro Basiseinheit)|Iye rírà fún ẹyọ ìpìlẹ̀ kan|Ask (quote currency per base unit)"),
      percent("fxCommissionPct","Commission per order (%)|Provision pro Auftrag (%)|Owó iṣẹ́ ìdúnàádúrà kan (%)|Commission per order (%)"),
    ],[
      "Buy cost in quote currency|Kaufkosten in Kurswährung|Ináwó rírà nínú owó kejì|Buy cost in quote currency",
      "Immediate sale proceeds|Sofortiger Verkaufserlös|Owó títà lẹ́sẹ̀kẹsẹ̀|Immediate sell proceeds",
      "Round-trip cost|Kosten für Kauf und Rückverkauf|Gbogbo ináwó rírà àti títà|Round-trip cost",
      "Spread around midpoint (basis points)|Spread um Mittelkurs (Basispunkte)|Àlàfo yíká iye àárín (bp)|Spread around midpoint (basis points)",
    ],(units,bid,ask,commission)=>{
      above(ask>=bid,"fxAskQuote");
      const buy=units*ask*(1+commission/100);
      const sell=units*bid*(1-commission/100);
      return [buy,sell,buy-sell,(ask-bid)/((ask+bid)/2)*10000];
    }),

  "llm-batch-token-cost": tool("Token & AI",
    "LLM batch token cost|Tokenkosten eines LLM-Batches|Ináwó tọ́kẹ́nì fún ìdì LLM|LLM batch token cost",
    "Estimate input and output charges from token counts and rates you enter. Use one currency and prices per million tokens.|Eingabe- und Ausgabekosten aus eigenen Tokenzahlen und Tarifen schätzen. Eine Währung und Preise pro Million Token verwenden.|Ṣírò ináwó ìwọlé àti ìjáde láti inú iye tọ́kẹ́nì àti owó tí o tẹ̀. Lo owó kan náà àti iye fún mílíọ̀nù tọ́kẹ́nì.|Estimate input and output charges from the token counts and rates you put in. Use one currency and prices per million tokens.",
    [
      whole("batchRequestCount","Requests in batch|Anfragen im Batch|Ìbéèrè nínú ìdì|Requests in batch"),
      number("meanInputTokens","Average input tokens per request|Mittlere Eingabetoken je Anfrage|Tọ́kẹ́nì ìwọlé àárín fún ìbéèrè kan|Average input tokens each request"),
      number("meanOutputTokens","Average output tokens per request|Mittlere Ausgabetoken je Anfrage|Tọ́kẹ́nì ìjáde àárín fún ìbéèrè kan|Average output tokens each request"),
      number("inputCostPerMillion","Input price per million tokens|Eingabepreis pro Million Token|Owó ìwọlé fún mílíọ̀nù tọ́kẹ́nì|Input price per million tokens"),
      number("outputCostPerMillion","Output price per million tokens|Ausgabepreis pro Million Token|Owó ìjáde fún mílíọ̀nù tọ́kẹ́nì|Output price per million tokens"),
    ],[
      "Estimated input charge|Geschätzte Eingabekosten|Ináwó ìwọlé tí a fojú díwọ̀n|Estimated input charge",
      "Estimated output charge|Geschätzte Ausgabekosten|Ináwó ìjáde tí a fojú díwọ̀n|Estimated output charge",
      "Estimated batch charge|Geschätzte Batchkosten|Ináwó gbogbo ìdì|Estimated total batch charge",
    ],(requests,input,output,inputPrice,outputPrice)=>{
      const inputCost=requests*input/1e6*inputPrice;
      const outputCost=requests*output/1e6*outputPrice;
      return [inputCost,outputCost,inputCost+outputCost];
    }),

  "worship-song-range": tool("Faith & Outreach",
    "Worship song transposition range|Transpositionsbereich für Gemeindelieder|Àlàfo yíyí ohùn orin ìjọsìn|Worship song transposition range",
    "Compare the melody range with the comfortable singing range. Use MIDI note numbers. Negative shifts lower the key, and dashes mean the range is too wide.|Melodieumfang und bequemen Stimmumfang vergleichen. MIDI-Notennummern verwenden. Negative Werte senken die Tonart. Striche zeigen einen zu großen Umfang.|Fi àlàfo orin wé àlàfo ohùn tó rọrùn. Lo nọ́mbà MIDI. Iye òdì dín ohùn kù, àmì gígùn sì fi hàn pé àlàfo tóbi jù.|Compare the melody range with the range wey easy to sing. Use MIDI note numbers. Negative shifts lower the key. Dashes mean the melody range too wide.",
    [
      {...whole("melodyLowestMidi","Lowest melody note (MIDI)|Tiefster Melodieton (MIDI)|Ohùn orin tó rẹlẹ̀ jù (MIDI)|Lowest melody note (MIDI)",0),max:127},
      {...whole("melodyHighestMidi","Highest melody note (MIDI)|Höchster Melodieton (MIDI)|Ohùn orin tó ga jù (MIDI)|Highest melody note (MIDI)",0),max:127},
      {...whole("comfortableLowestMidi","Lowest comfortable note (MIDI)|Tiefster bequemer Stimmton (MIDI)|Ohùn tó rẹlẹ̀ tí ó rọrùn (MIDI)|Lowest comfortable note (MIDI)",0),max:127},
      {...whole("comfortableHighestMidi","Highest comfortable note (MIDI)|Höchster bequemer Stimmton (MIDI)|Ohùn tó ga tí ó rọrùn (MIDI)|Highest comfortable note (MIDI)",0),max:127},
    ],[
      "Melody span (semitones)|Melodieumfang (Halbtöne)|Àlàfo orin (ìdajì-ohùn)|Melody span (semitones)",
      "Lowest allowed shift (semitones)|Niedrigste mögliche Verschiebung (Halbtöne)|Ìyípadà tó rẹlẹ̀ jù (ìdajì-ohùn)|Lowest allowed shift (semitones)",
      "Highest allowed shift (semitones)|Höchste mögliche Verschiebung (Halbtöne)|Ìyípadà tó ga jù (ìdajì-ohùn)|Highest allowed shift (semitones)",
    ],(low,high,comfortableLow,comfortableHigh)=>{
      above(high>=low,"melodyHighestMidi");
      above(comfortableHigh>=comfortableLow,"comfortableHighestMidi");
      const min=comfortableLow-low, max=comfortableHigh-high;
      return [high-low,min<=max?min:null,min<=max?max:null];
    }),

  "council-seat-projection": tool("Civics & Politics",
    "Three-list seat projection|Sitzprojektion für drei Listen|Ìṣírò ìjókòó fún àtòjọ mẹ́ta|Three-list seat projection",
    "Model proportional seats for three lists with the largest-remainder method. Equal remainders follow the listed order. No vote threshold is applied.|Proportionale Sitze für drei Listen nach dem Verfahren der größten Reste modellieren. Bei Gleichstand gilt die Reihenfolge. Keine Sperrklausel.|Ṣírò ìjókòó díẹ̀-díẹ̀ fún àtòjọ mẹ́ta pẹ̀lú àṣẹ́kù tó ga jù. Bí wọ́n bá dọ́gba, tẹ̀lé bí a ṣe tò wọ́n. Kò sí iye ìbò tó kéré jù.|Estimate seats for three lists with the largest-remainder method. Ties follow list order. This model no use vote threshold.",
    [
      whole("seatsToAllocate","Seats to allocate|Zu verteilende Sitze|Ìjókòó láti pín|Seats to allocate"),
      whole("firstListVotes","Votes for first list|Stimmen für erste Liste|Ìbò fún àtòjọ àkọ́kọ́|Votes for first list",0),
      whole("secondListVotes","Votes for second list|Stimmen für zweite Liste|Ìbò fún àtòjọ kejì|Votes for second list",0),
      whole("thirdListVotes","Votes for third list|Stimmen für dritte Liste|Ìbò fún àtòjọ kẹta|Votes for third list",0),
    ],[
      "First list seats|Sitze der ersten Liste|Ìjókòó àtòjọ àkọ́kọ́|First list seats",
      "Second list seats|Sitze der zweiten Liste|Ìjókòó àtòjọ kejì|Second list seats",
      "Third list seats|Sitze der dritten Liste|Ìjókòó àtòjọ kẹta|Third list seats",
    ],(seats,first,second,third)=>{
      const total=BigInt(first+second+third);
      above(total>0n,"firstListVotes");
      const shares=[first,second,third].map(votes=>BigInt(votes)*BigInt(seats));
      const allocations=shares.map(weight=>Number(weight/total));
      const remainders=shares.map(weight=>weight%total);
      const ranking=[0,1,2].sort((a,b)=>remainders[a]===remainders[b]?a-b:remainders[a]>remainders[b]?-1:1);
      const left=seats-allocations.reduce((sum,count)=>sum+count,0);
      for(const index of ranking.slice(0,left))allocations[index]++;
      return allocations;
    }),

  "loaded-voltage-divider": tool("Electronics & Automation",
    "Loaded voltage divider|Belasteter Spannungsteiler|Olùpín foliteji pẹ̀lú ẹrù|Loaded voltage divider",
    "Compare the divider output before and after you connect a resistive load across the lower resistor.|Teilerausgang ohne Last und mit einem Lastwiderstand parallel zum unteren Widerstand vergleichen.|Fi foliteji olùpín wé ṣáájú àti lẹ́yìn fífi ẹrù so mọ́ resístọ̀ ìsàlẹ̀.|Compare output before and after you put a resistive load across the bottom resistor.",
    [
      positive("dividerInputVoltage","DC input (V)|Gleichspannung am Eingang (V)|Foliteji ìwọlé DC (V)|DC input (V)"),
      positive("upperDividerOhms","Upper resistor (Ω)|Oberer Widerstand (Ω)|Resístọ̀ òkè (Ω)|Upper resistor (Ω)"),
      positive("lowerDividerOhms","Lower resistor (Ω)|Unterer Widerstand (Ω)|Resístọ̀ ìsàlẹ̀ (Ω)|Lower resistor (Ω)"),
      positive("dividerLoadOhms","Load resistance (Ω)|Lastwiderstand (Ω)|Ìdènà ẹrù (Ω)|Load resistance (Ω)"),
    ],[
      "Unloaded output (V)|Unbelasteter Ausgang (V)|Foliteji láìsí ẹrù (V)|Unloaded output (V)",
      "Loaded output (V)|Belasteter Ausgang (V)|Foliteji pẹ̀lú ẹrù (V)|Loaded output (V)",
      "Load current (mA)|Laststrom (mA)|Ìṣàn ẹrù (mA)|Load current (mA)",
    ],(input,upper,lower,load)=>{
      const parallel=lower*load/(lower+load);
      const loaded=input*parallel/(upper+parallel);
      return [input*lower/(upper+lower),loaded,loaded/load*1000];
    }),

  "futures-tick-result": tool("Trading",
    "Futures tick profit and loss|Gewinn und Verlust je Futures-Tick|Èrè àti òfo fún ìgbésẹ̀ futures|Futures tick profit and loss",
    "Calculate the result of a long futures position from the price movement, contract tick size and value, and total fees. Use one currency.|Ergebnis einer Long-Futures-Position aus Kursbewegung, Tickgröße, Tickwert und Gebühren berechnen. Eine Währung verwenden.|Ṣírò èrè tàbí òfo futures rírà láti inú ìyípadà iye, ìgbésẹ̀ àti owó iṣẹ́. Lo owó kan náà.|Work out a long futures trade from price movement, tick size, tick value and all fees. Use one currency.",
    [
      positive("futuresEntryPrice","Entry price|Einstiegskurs|Iye ìwọlé|Entry price"),
      positive("futuresExitPrice","Exit price|Ausstiegskurs|Iye ìjáde|Exit price"),
      positive("contractTickSize","Contract minimum price increment|Kleinste Preisänderung je Kontrakt|Ìgbésẹ̀ iye tó kéré jù|Contract minimum price step"),
      positive("contractTickValue","Money per tick per contract|Geldwert pro Tick und Kontrakt|Owó ìgbésẹ̀ kan fún àdéhùn kan|Money for each tick per contract"),
      whole("numberOfFuturesContracts","Contracts held|Gehaltene Kontrakte|Iye àdéhùn tí a mú|Contracts held"),
      number("futuresTotalFees","Total entry and exit fees|Gesamte Ein- und Ausstiegsgebühren|Gbogbo owó iṣẹ́ ìwọlé àti ìjáde|Total entry and exit fees"),
    ],[
      "Signed price movement (ticks)|Kursbewegung mit Vorzeichen (Ticks)|Ìyípadà iye pẹ̀lú àmì (ticks)|Signed price movement (ticks)",
      "Trade result before fees|Handelsergebnis vor Gebühren|Àbájáde kí a tó yọ owó iṣẹ́|Trade result before fees",
      "Trade result after fees|Handelsergebnis nach Gebühren|Àbájáde lẹ́yìn owó iṣẹ́|Trade result after fees",
    ],(entry,exit,tick,value,contracts,fees)=>{
      const movement=(exit-entry)/tick;
      const ticks=Math.round(movement);
      above(Math.abs(movement-ticks)<0.00001,"futuresExitPrice");
      const gross=ticks*value*contracts;
      return [ticks||0,gross||0,gross-fees];
    }),

  "classification-metrics": tool("Token & AI",
    "Binary classification metrics|Metriken für binäre Klassifikation|Ìwọ̀n ìpín sí ẹ̀ka méjì|Binary classification metrics",
    "Calculate precision, recall, specificity and F1 from your confusion matrix. A dash indicates a metric with no denominator.|Präzision, Sensitivität, Spezifität und F1 aus der Konfusionsmatrix berechnen. Ein Strich kennzeichnet eine undefinierte Metrik.|Ṣírò ìpéye, ìrántí, ìdánimọ̀ odi àti F1 láti inú àbájáde ẹ̀ka. Àmì gígùn túmọ̀ sí pé kò sí iye láti fi pín.|Work out precision, recall, specificity and F1 from the confusion matrix. A dash means the metric no get denominator.",
    [
      whole("truePositiveCount","True positives|Richtig Positive|Rere tó tọ́|True positives",0),
      whole("falsePositiveCount","False positives|Falsch Positive|Rere tí kò tọ́|False positives",0),
      whole("trueNegativeCount","True negatives|Richtig Negative|Odi tó tọ́|True negatives",0),
      whole("falseNegativeCount","False negatives|Falsch Negative|Odi tí kò tọ́|False negatives",0),
    ],[
      "Precision (%)|Präzision (%)|Ìpéye (%)|Precision (%)",
      "Recall (%)|Sensitivität (%)|Ìrántí (%)|Recall (%)",
      "Specificity (%)|Spezifität (%)|Ìdánimọ̀ odi (%)|Specificity (%)",
      "F1 score (%)|F1-Wert (%)|Ìwọ̀n F1 (%)|F1 score (%)",
    ],(tp,fp,tn,fn)=>{
      above(tp+fp+tn+fn>0,"truePositiveCount");
      const ratio=(top,bottom)=>bottom?100*top/bottom:null;
      return [ratio(tp,tp+fp),ratio(tp,tp+fn),ratio(tn,tn+fp),ratio(2*tp,2*tp+fp+fn)];
    }),

  "food-relief-parcels": tool("Faith & Outreach",
    "Food relief parcel capacity|Kapazität für Lebensmittelpakete|Iye àpò oúnjẹ ìrànlọ́wọ́|Food relief parcel capacity",
    "Find how many households can receive one complete parcel with the available staple food and packed items.|Haushalte mit einem vollständigen Paket aus verfügbaren Grundnahrungsmitteln und Packartikeln ermitteln.|Rí iye ìdílé tí ó lè gba àpò oúnjẹ pípé pẹ̀lú oúnjẹ àti ohun tí ó wà.|Check how many households fit get one complete food parcel with the staple and packed items wey dey.",
    [
      whole("recipientHouseholds","Households to serve|Zu versorgende Haushalte|Ìdílé tí a fẹ́ ràn lọ́wọ́|Households to serve"),
      positive("stapleKgPerParcel","Staple food per parcel (kg)|Grundnahrungsmittel je Paket (kg)|Oúnjẹ ìpìlẹ̀ nínú àpò kan (kg)|Staple food per parcel (kg)"),
      number("stapleKgInStock","Staple food in stock (kg)|Vorrat an Grundnahrungsmitteln (kg)|Oúnjẹ ìpìlẹ̀ tí ó wà (kg)|Staple food available (kg)"),
      whole("packedItemsPerParcel","Packed items per parcel|Packartikel je Paket|Ohun tí a dì nínú àpò kan|Packed items per parcel"),
      whole("packedItemsAvailable","Packed items available|Verfügbare Packartikel|Ohun tí a dì tí ó wà|Packed items available",0),
    ],[
      "Complete parcels for households|Vollständige Pakete für Haushalte|Àpò pípé fún ìdílé|Complete parcels for households",
      "Unserved households|Nicht versorgte Haushalte|Ìdílé tí kò tíì gba|Households wey never get parcel",
      "Extra staple food needed (kg)|Zusätzlich benötigte Grundnahrungsmittel (kg)|Oúnjẹ àfikún tí a nílò (kg)|Extra staple food needed (kg)",
      "Extra packed items needed|Zusätzlich benötigte Packartikel|Ohun àfikún tí a nílò|Extra packed items needed",
    ],(households,kilos,stock,perParcel,items)=>{
      const complete=Math.min(households,Math.floor(stock/kilos),Math.floor(items/perParcel));
      return [complete,households-complete,Math.max(0,households*kilos-stock),Math.max(0,households*perParcel-items)];
    }),

  "civic-survey-interval": tool("Civics & Politics",
    "Civic survey support interval|Intervall für Zustimmung in Umfragen|Àlàfo ìtìlẹ́yìn nínú ìwádìí|Civic survey support interval",
    "Estimate a Wilson interval for a simple random sample. Enter 1.96 for an approximate 95% interval. Weighting and nonresponse are excluded.|Wilson-Intervall für eine einfache Zufallsstichprobe schätzen. Für etwa 95 % den Wert 1,96 eingeben. Gewichtung und Antwortausfall bleiben unberücksichtigt.|Ṣírò àlàfo Wilson fún àpẹẹrẹ tí a yàn laileto. Tẹ 1.96 fún àlàfo 95% ní ìsúnmọ́. A kò ka ìwọ̀n àfikún tàbí àìdáhùn.|Estimate a Wilson interval for a simple random sample. Enter 1.96 for about 95%. The model no include weighting or missing replies.",
    [
      whole("civicSurveyRespondents","Number of respondents|Anzahl Befragte|Iye olùdáhùn|Number of respondents"),
      whole("civicSurveySupporters","Respondents in support|Befragte mit Zustimmung|Olùdáhùn tó ṣe àtìlẹ́yìn|Respondents in support",0),
      number("surveyNormalCritical","Confidence multiplier (z)|Kritischer Normalwert (z)|Olùsọdipúpọ̀ ìgbẹ́kẹ̀lé (z)|Confidence multiplier (z)",0.01,10),
    ],[
      "Observed support (%)|Beobachtete Zustimmung (%)|Ìtìlẹ́yìn tí a rí (%)|Observed support (%)",
      "Lower estimate (%)|Untere Intervallgrenze (%)|Ààlà ìsàlẹ̀ (%)|Lower estimate (%)",
      "Upper estimate (%)|Obere Intervallgrenze (%)|Ààlà òkè (%)|Upper estimate (%)",
    ],(total,support,z)=>{
      above(support<=total,"civicSurveySupporters");
      const p=support/total, z2=z*z, scale=1+z2/total;
      const midpoint=(p+z2/(2*total))/scale;
      const half=z*Math.sqrt((p*(1-p)+z2/(4*total))/total)/scale;
      return [p*100,Math.max(0,midpoint-half)*100,Math.min(1,midpoint+half)*100];
    }),

  "current-loop-scaling": tool("Electronics & Automation",
    "4–20 mA sensor scaling|4–20-mA-Sensorskalierung|Ìyípadà ìwọ̀n sensọ 4–20 mA|4–20 mA sensor scaling",
    "Convert a current reading to the sensor’s engineering units and percent of span. Readings outside the range extrapolate linearly.|Strommesswert in die physikalische Einheit und Prozent des Messbereichs umrechnen. Außerhalb des Bereichs wird linear extrapoliert.|Yí ìṣàn tí a wọn padà sí ìwọ̀n sensọ àti ìpín ààyè rẹ̀. Iye tó jáde kúrò ní ààyè ń tẹ̀síwájú ní ìlà tààrà.|Convert current to the sensor’s unit and percent of span. Outside the range, the line keeps going.",
    [
      {...number("loopMeasuredMilliamps","Measured current (mA)|Gemessener Strom (mA)|Ìṣàn tí a wọn (mA)|Measured current (mA)"),max:40},
      number("loopSignalAtFour","Sensor value at 4 mA|Sensorwert bei 4 mA|Iye sensọ ní 4 mA|Sensor value for 4 mA",-1e12),
      number("loopSignalAtTwenty","Sensor value at 20 mA|Sensorwert bei 20 mA|Iye sensọ ní 20 mA|Sensor value for 20 mA",-1e12),
    ],[
      "Scaled sensor value|Skalierter Sensorwert|Iye sensọ lẹ́yìn ìṣírò|Scaled sensor value",
      "Measured span (%)|Anteil der Messspanne (%)|Ìpín ààyè ìwọ̀n (%)|Measured span (%)",
    ],(milliamps,lower,upper)=>{
      above(upper!==lower,"loopSignalAtTwenty");
      const share=(milliamps-4)/16;
      return [lower+share*(upper-lower),100*share];
    }),

  "position-loss-budget": tool("Trading",
    "Position size from a loss budget|Positionsgröße aus Verlustbudget|Iye ẹyọ gẹ́gẹ́ bí ààlà òfo|Position size from loss budget",
    "Model a whole-unit long position under a hypothetical exit loss and per-unit costs. Price gaps can change the actual loss.|Ganze Stückzahl einer Long-Position aus hypothetischem Ausstiegsverlust und Stückkosten modellieren. Kurslücken können den tatsächlichen Verlust verändern.|Ṣírò iye ẹyọ odidi fún rírà pẹ̀lú òfo tí a fojú díwọ̀n àti owó iṣẹ́ ẹyọ. Ìfo iye lè yí òfo gidi padà.|Work out whole units for a long position using a possible exit and fees. Price jumps fit change the real loss.",
    [
      positive("positionEntryPrice","Entry price per unit|Einstiegskurs je Einheit|Iye ìwọlé fún ẹyọ|Entry price per unit"),
      number("positionAssumedExitPrice","Assumed lower exit price|Angenommener niedrigerer Ausstiegskurs|Iye ìjáde kékeré tí a fojú díwọ̀n|Assumed lower exit price"),
      number("positionFeePerUnit","Estimated total fees per unit|Geschätzte Gesamtgebühren je Einheit|Owó iṣẹ́ ẹyọ kan|Estimated total fees per unit"),
      number("positionMaximumLoss","Maximum modeled loss budget|Maximales modelliertes Verlustbudget|Ààlà òfo tí a fojú díwọ̀n|Maximum modeled loss budget"),
    ],[
      "Modeled loss per unit|Modellierter Verlust je Einheit|Òfo ẹyọ kan tí a ṣírò|Modeled loss per unit",
      "Maximum whole units|Maximale ganze Stückzahl|Iye ẹyọ odidi tó pọ̀ jù|Maximum full units",
      "Modeled loss at that size|Modellierter Verlust bei dieser Größe|Òfo tí a ṣírò ní iye yẹn|Modeled loss for that size",
    ],(entry,exit,fees,budget)=>{
      above(exit<entry,"positionAssumedExitPrice");
      const exposure=Number((entry-exit+fees).toPrecision(14));
      const quantity=Math.floor(budget/exposure);
      return [exposure,quantity,quantity*exposure];
    }),

  "embedding-index-storage": tool("Token & AI",
    "Embedding index storage|Speicher für Embedding-Indizes|Ìpamọ́ atọ́ka embedding|Embedding index storage",
    "Estimate raw vector storage and add a measured per-vector allowance for metadata and indexing. Uses decimal gigabytes.|Rohspeicher für Vektoren plus einen gemessenen Zuschlag je Vektor für Metadaten und Index berechnen. Verwendet dezimale Gigabyte.|Ṣírò ibi ìpamọ́ vector àti àfikún tí a wọn fún dátà àfikún àti atọ́ka. Lo GB eleemewa.|Estimate raw vector storage and add your measured metadata and indexing bytes per vector. Uses decimal GB.",
    [
      whole("storedEmbeddingCount","Embeddings to store|Zu speichernde Embeddings|Iye embedding láti tọ́jú|Embeddings to store"),
      whole("embeddingDimensionCount","Dimensions per embedding|Dimensionen je Embedding|Ìwọ̀n inú embedding kan|Dimensions per embedding"),
      {...whole("bytesPerVectorDimension","Stored bytes per dimension|Gespeicherte Bytes je Dimension|Báìtì fún ìwọ̀n kan|Stored bytes per dimension"),max:8},
      whole("indexExtraBytesPerVector","Metadata and index bytes per vector|Metadaten- und Indexbytes je Vektor|Báìtì àfikún fún vector kan|Metadata and index bytes per vector",0),
    ],[
      "Raw vectors (GB)|Rohvektoren (GB)|Vector gidi (GB)|Raw vectors (GB)",
      "Metadata and index (GB)|Metadaten und Index (GB)|Dátà àfikún àti atọ́ka (GB)|Metadata and index (GB)",
      "Estimated storage (GB)|Geschätzter Speicher (GB)|Ìpamọ́ tí a fojú díwọ̀n (GB)|Estimated storage (GB)",
    ],(count,dimensions,bytes,extra)=>{
      const raw=count*dimensions*bytes/1e9;
      const overhead=count*extra/1e9;
      return [raw,overhead,raw+overhead];
    }),

  "wireless-mic-batteries": tool("Faith & Outreach",
    "Service microphone batteries|Mikrofonbatterien für Gottesdienste|Batiri gbohùngbohùn ìjọsìn|Service microphone batteries",
    "Plan battery sets for identical wireless microphones used throughout a service. Enter measured runtime per fresh set and any spare sets.|Batteriesätze für gleiche Funkmikrofone während eines Gottesdienstes planen. Gemessene Laufzeit eines neuen Satzes und Reserve eingeben.|Ṣètò batiri fún gbohùngbohùn aláìlókùn tó jọra ní ìjọsìn. Tẹ àkókò ìdánwò batiri tuntun àti iye àfikún.|Plan battery sets for identical wireless mics used throughout service. Enter the measured runtime and your spare sets.",
    [
      whole("wirelessMicCount","Microphones in use|Verwendete Mikrofone|Iye gbohùngbohùn tí a lò|Microphones in use"),
      positive("micUseHours","Service runtime (h)|Einsatzdauer (h)|Àkókò iṣẹ́ (wákàtí)|Service runtime (h)"),
      positive("micSetHours","Measured runtime per set (h)|Gemessene Laufzeit je Satz (h)|Àkókò tí batiri kan lè ṣiṣẹ́ (wákàtí)|Measured runtime per set (h)"),
      whole("cellsPerMicSet","Batteries in one set|Batterien je Satz|Batiri nínú ìdì kan|Batteries in one set"),
      whole("eventMicSpareSets","Extra sets for the whole event|Reservesätze für die Veranstaltung|Ìdì batiri àfikún fún àpéjọ|Extra sets for the whole event",0),
    ],[
      "Changes per microphone|Wechsel je Mikrofon|Ìyípadà fún gbohùngbohùn kan|Changes per microphone",
      "Sets to pack including spares|Einzupackende Sätze mit Reserve|Ìdì batiri pẹ̀lú àfikún|Sets to pack including spares",
      "Individual batteries to pack|Einzupackende Einzelbatterien|Iye batiri kọ̀ọ̀kan|Individual batteries to pack",
    ],(count,hours,runtime,cells,spares)=>{
      const sets=roundUp(hours/runtime);
      const total=count*sets+spares;
      return [sets-1,total,total*cells];
    }),

  "motion-approval": tool("Civics & Politics",
    "Motion approval threshold|Zustimmungsgrenze für Anträge|Ààlà ìtẹ́wọ́gbà àbá|Motion approval threshold",
    "Apply an at-least percentage rule to the denominator your meeting uses. The result rounds the minimum yes votes up to a whole vote.|Eine Mindestquote auf die maßgebliche Grundgesamtheit anwenden. Die erforderlichen Ja-Stimmen werden aufgerundet.|Lo ìpín tó kéré jù sí iye ìbò tí ìpàdé ń lò. Yí iye ìbò bẹ́ẹ̀ni sókè sí odidi.|Use the denominator for your meeting rules and the at-least share you need. Round the required yes votes up.",
    [
      whole("motionCountedVoteBase","Votes or seats in the rule’s denominator|Stimmen oder Sitze in der Regelbasis|Ìbò tàbí ìjókòó tí òfin ń kà|Votes or seats wey the rule counts"),
      percent("motionApprovalShare","Approval required, at least (%)|Erforderliche Zustimmung, mindestens (%)|Ìpín ìtẹ́wọ́gbà tó kéré jù (%)|Approval required, at least (%)",0.01),
      whole("motionYesVotes","Yes votes received|Erhaltene Ja-Stimmen|Ìbò bẹ́ẹ̀ni tí a rí|Yes votes received",0),
    ],[
      "Minimum yes votes|Erforderliche Ja-Stimmen|Ìbò bẹ́ẹ̀ni tó kéré jù|Minimum yes votes",
      "Actual yes share (%)|Tatsächlicher Ja-Anteil (%)|Ìpín bẹ́ẹ̀ni gidi (%)|Actual yes share (%)",
      "Additional yes votes needed|Noch benötigte Ja-Stimmen|Ìbò bẹ́ẹ̀ni míì tí a nílò|Extra yes votes wey you need",
    ],(denominator,share,yes)=>{
      above(yes<=denominator,"motionYesVotes");
      const minimum=roundUp(denominator*share/100);
      return [minimum,yes/denominator*100,Math.max(0,minimum-yes)];
    }),

  "lc-resonance": tool("Electronics & Automation",
    "LC resonant frequency|LC-Resonanzfrequenz|Igbohunsafẹfẹ ìfaradà LC|LC resonant frequency",
    "Estimate the resonant frequency and characteristic impedance of an ideal inductor and capacitor. Real components add losses.|Resonanzfrequenz und charakteristische Impedanz einer idealen Spule und eines Kondensators schätzen. Reale Bauteile verursachen Verluste.|Ṣírò igbohunsafẹfẹ àti ìdènà àbùdá fofò fún inductor àti capacitor. Ohun gidi lè ní ìsọnù.|Estimate resonance and characteristic impedance for an ideal inductor and capacitor. Real parts get losses.",
    [
      positive("inductanceMicrohenry","Inductance (µH)|Induktivität (µH)|Inductance (µH)|Inductance (µH)"),
      positive("capacitanceNanofarad","Capacitance (nF)|Kapazität (nF)|Capacitance (nF)|Capacitance (nF)"),
    ],[
      "Resonant frequency (kHz)|Resonanzfrequenz (kHz)|Igbohunsafẹfẹ ìfaradà (kHz)|Resonant frequency (kHz)",
      "Characteristic impedance (Ω)|Charakteristische Impedanz (Ω)|Ìdènà àbùdá (Ω)|Characteristic impedance (Ω)",
    ],(microhenry,nanofarad)=>{
      const inductance=microhenry/1e6, capacitance=nanofarad/1e9;
      return [1/(2*Math.PI*Math.sqrt(inductance*capacitance))/1000,Math.sqrt(inductance/capacitance)];
    }),

  "long-call-expiry": tool("Trading",
    "Long call at expiration|Gekaufte Kaufoption am Verfall|Àṣàyàn rírà ní ọjọ́ ìparí|Long call at expiration",
    "Model a bought call at expiration using a strike, premium, contract multiplier and trade fees. Enter money amounts in one currency.|Eine gekaufte Kaufoption am Verfall mit Basispreis, Prämie, Kontraktmultiplikator und Gebühren modellieren. Eine Währung verwenden.|Ṣírò àṣàyàn rírà ní ìparí pẹ̀lú iye ìmúṣẹ, owó àṣàyàn, iye ẹyọ àti owó iṣẹ́. Lo owó kan náà.|Model a bought call at expiry using strike, premium, contract size and fees. Use one currency.",
    [
      positive("callStrikeUnitPrice","Strike price per underlying unit|Basispreis je Einheit|Iye ìmúṣẹ ẹyọ kan|Strike price per underlying unit"),
      number("callExpiryUnderlyingPrice","Underlying price at expiration|Basiswertkurs am Verfall|Iye ohun náà ní ìparí|Underlying price at expiration"),
      number("callPremiumPerUnit","Premium paid per underlying unit|Gezahlte Prämie je Einheit|Owó àṣàyàn tí a san fún ẹyọ|Premium paid per underlying unit"),
      whole("callUnitsEach","Underlying units per contract|Basiseinheiten je Kontrakt|Ẹyọ inú àdéhùn kan|Underlying units per contract"),
      whole("longCallContractCount","Call contracts bought|Gekaufte Kaufoptionskontrakte|Iye àṣàyàn rírà tí a rà|Call contracts bought"),
      number("longCallTotalFees","Total fees|Gesamtgebühren|Gbogbo owó iṣẹ́|Total fees"),
    ],[
      "Gross exercise value|Bruttoausübungswert|Àpapọ̀ iye ìmúṣẹ|Gross exercise value",
      "Net result at expiration|Nettoergebnis am Verfall|Àbájáde gidi ní ìparí|Net result at expiration",
      "Break-even underlying price|Basiswertkurs an der Gewinnschwelle|Iye láti bo ináwó|Break-even underlying price",
    ],(strike, price, premium, units, contracts, fees)=>{
      const covered=units*contracts;
      const exercise=Math.max(0,price-strike)*covered;
      return [exercise,exercise-covered*premium-fees,strike+premium+fees/covered];
    }),

  "llm-context-budget": tool("Token & AI",
    "LLM context budget|LLM-Kontextbudget|Ààlà àyíká LLM|LLM context budget",
    "Subtract fixed prompt and response reservations from a context window. Then count how many whole, equal-size retrieval chunks fit.|Reservierte Prompt- und Antworttoken vom Kontextfenster abziehen. Danach ganze gleich große Retrieval-Blöcke zählen.|Yọ tọ́kẹ́nì ìbéèrè àti ìdáhùn tí a pèsè kúrò ní àyíká. Ka àwọn ìpín ìwádìí odidi tó lè wọlé.|Remove fixed prompt and reply tokens from the context window, then count full retrieval chunks of the same size.",
    [
      whole("llmContextWindowTokens","Context window (tokens)|Kontextfenster (Token)|Àyíká (tọ́kẹ́nì)|Context window (tokens)"),
      whole("llmFixedPromptTokens","Fixed prompt and formatting (tokens)|Fester Prompt und Formatierung (Token)|Ìbéèrè dúró àti fọ́ọ̀mù (tọ́kẹ́nì)|Fixed prompt and formatting (tokens)",0),
      whole("llmReplyReservationTokens","Reserved reply (tokens)|Reservierte Antwort (Token)|Ìdáhùn tí a pèsè (tọ́kẹ́nì)|Reserved reply (tokens)",0),
      whole("llmChunkTokensWithOverhead","One chunk including its header (tokens)|Ein Block mit Kopfzeile (Token)|Ìpín kan pẹ̀lú orí rẹ̀ (tọ́kẹ́nì)|One chunk with its header (tokens)"),
    ],[
      "Available retrieval tokens|Verfügbare Retrieval-Token|Tọ́kẹ́nì ìwádìí tó wà|Available retrieval tokens",
      "Whole retrieval chunks|Ganze Retrieval-Blöcke|Ìpín ìwádìí odidi|Full retrieval chunks",
      "Unused tokens after fitting chunks|Freie Token nach Befüllung|Tọ́kẹ́nì tó ṣì kù|Tokens wey remain after chunks",
    ],(window,prompt,reply,chunk)=>{
      const available=window-prompt-reply;
      above(available>=0,"llmReplyReservationTokens");
      return [available,Math.floor(available/chunk),available%chunk];
    }),

  "service-booklet-printing": tool("Faith & Outreach",
    "Service booklet paper count|Papierbedarf für Gottesdiensthefte|Iye bébà ìwé ìjọsìn|Service booklet paper count",
    "Plan folded, double-sided booklets with four finished pages per sheet. Blank pages fill the last sheet where needed.|Gefalzte, beidseitig bedruckte Hefte mit vier fertigen Seiten pro Bogen planen. Leerseiten füllen bei Bedarf den letzten Bogen.|Ṣètò ìwé kékeré tí a tẹ̀ ní ẹ̀gbẹ́ méjèèjì, ojú mẹ́rin fún bébà kan. Ojú òfo kún bébà ìkẹyìn bí ó bá yẹ.|Plan folded double-sided booklets with four finished pages per sheet. Add blank pages to the last sheet if needed.",
    [
      whole("bookletPagesPerCopy","Content pages per booklet|Inhaltsseiten je Heft|Ojú àkóónú fún ìwé kan|Content pages per booklet"),
      whole("serviceBookletCopies","Booklets to print|Zu druckende Hefte|Ìwé kékeré láti tẹ̀|Booklets to print"),
      percent("bookletPaperSparePct","Extra paper for printing (%)|Papierreserve für den Druck (%)|Bébà àfikún fún ìtẹ̀wé (%)|Extra paper for printing (%)"),
    ],[
      "Sheets per booklet|Bögen je Heft|Bébà nínú ìwé kan|Sheets per booklet",
      "Blank pages per booklet|Leerseiten je Heft|Ojú òfo fún ìwé kan|Blank pages per booklet",
      "Total sheets with reserve|Bögen insgesamt mit Reserve|Gbogbo bébà pẹ̀lú àfikún|Total sheets with spare paper",
    ],(pages,copies,reserve)=>{
      const sheets=roundUp(pages/4);
      const total=sheets*copies;
      return [sheets,sheets*4-pages,total+roundUp(total*reserve/100)];
    }),

  "ballot-stock-reconciliation": tool("Civics & Politics",
    "Ballot paper reconciliation|Stimmzettelbestand abgleichen|Ìbámu iye ìwé ìbò|Ballot paper reconciliation",
    "Compare received papers with four separate end-of-count totals. Use mutually exclusive counts so each paper appears only once.|Erhaltene Stimmzettel mit vier getrennten Schlussbeständen vergleichen. Jeden Zettel nur einer Kategorie zuordnen.|Fi iye ìwé tí a gbà wé iye mẹ́rin ní ìparí. Ka ìwé kọ̀ọ̀kan sí ẹ̀ka kan ṣoṣo.|Compare papers wey arrive with four separate final counts. Count each paper only once.",
    [
      whole("ballotPapersReceived","Ballot papers received|Erhaltene Stimmzettel|Ìwé ìbò tí a gbà|Ballot papers received"),
      whole("unusedBallotPapers","Unused papers at closing|Ungenutzte Stimmzettel am Ende|Ìwé ìbò tí a kò lò ní ìparí|Unused papers at closing",0),
      whole("spoiledBallotPapersOutsideBox","Spoiled papers outside the box|Ungültig gemachte Zettel außerhalb der Urne|Ìwé ìbò tó bàjẹ́ níta àpótí|Spoiled papers outside box",0),
      whole("ballotPapersFoundInBox","Papers found in the box|Stimmzettel in der Urne|Ìwé ìbò tí a rí nínú àpótí|Papers found in the box",0),
      whole("issuedNotReturnedPapers","Issued papers not returned|Ausgegebene, nicht zurückgegebene Zettel|Ìwé tí a fún tí a kò dá padà|Issued papers wey never return",0),
    ],[
      "Total papers accounted for|Stimmzettel insgesamt erfasst|Gbogbo ìwé tí a ti kà|Total papers accounted for",
      "Received minus accounted for|Erhalten minus erfasst|Ìwé tí a gbà dín iye tí a kà kù|Received minus accounted for",
    ],(received,unused,spoiled,box,unreturned)=>{
      const accounted=unused+spoiled+box+unreturned;
      return [accounted,received-accounted];
    }),
  ...electronicsExpansion,
  ...tradingExpansion,
  ...aiExpansion,
};

const localize = (text, locale) => text.split("|")[Math.max(0, locales.indexOf(locale))];

export function registerPracticalTools(keys, schema) {
  for (const [key, definition] of Object.entries(practicalTools)) {
    keys.push(key);
    schema[key] = definition.fields.map(field => [field.key, "number"]);
    for (const locale of locales) {
      const copy = I[locale];
      copy.names.push(localize(definition.title, locale));
      copy.descriptions.push(localize(definition.description, locale));
      copy.groups.push(copy.toolCategoryLabels[definition.category]);
      copy.toolCategoryByKey[key] = definition.category;
      const fields = definition.fields.map(field => [field.key, localize(field.label, locale)]);
      Object.assign(copy.fields, Object.fromEntries(fields));
    }
  }
}

export function registerPracticalCategories() {
  for (const locale of locales) {
    const copy = I[locale];
    for (const [id, labels] of practicalCategories) {
      const label = localize(labels, locale);
      copy.categories.push(label);
      copy.toolCategoryLabels[id] = label;
    }
  }
}

export function calculatePracticalTool(key, data, locale = "en") {
  const definition = practicalTools[key];
  const inputs = definition.fields.map(field => {
    const raw = data[field.key];
    const value = Number(raw);
    above(raw != null && String(raw).trim() !== "" && Number.isFinite(value)
      && value >= field.min && value <= field.max && (!field.whole || Number.isSafeInteger(value)), field.key);
    return value;
  });
  const values = definition.calculate(...inputs);
  above(values.every(value => value === null || (Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER)), definition.fields[0].key);
  return values.map((value, index) => [localize(definition.outputs[index], locale), value]);
}
