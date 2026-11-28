import {I} from "./i18n.js";

const locales = ["en", "de", "yo", "pcm"];
export const practicalCategories = [
  ["Home & Construction", "Home & Construction|Haus & Bau|Ilé àti Ìkọ́lé|House & Building"],
  ["Garden & Water", "Garden & Water|Garten & Wasser|Ọgbà àti Omi|Garden & Water"],
  ["Business & Work", "Business & Work|Geschäft & Arbeit|Òwò àti Iṣẹ́|Business & Work"],
  ["Education & Sport", "Education & Sport|Bildung & Sport|Ẹ̀kọ́ àti Eré Ìdárayá|School & Sport"],
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

  "pump-energy": tool("Business & Work",
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

  "conveyor-throughput": tool("Business & Work",
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

  "inventory-reorder": tool("Business & Work",
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

  "scripture-reading-plan": tool("World & Culture",
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

  "community-match-funding": tool("Business & Work",
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

  "trade-fee-break-even": tool("Finance",
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

  "election-turnout": tool("World & Culture",
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
  above(values.every(value => value === null || (Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER)), definition.fields[0].key);
  return values.map((value, index) => [localize(definition.outputs[index], locale), value]);
}
