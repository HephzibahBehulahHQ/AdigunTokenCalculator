import {field, requireField} from "./calculator-fields.js";

export const faithExpansion = {
  "outreach-van-trips": {
    category: "Faith & Outreach",
    title: "Outreach passenger van trips|Fahrten für Gemeindearbeit|Ìrìn ọkọ̀ fún ìtànkálẹ̀|Outreach passenger van trips",
    description: "Count outbound trips using passenger seats that exclude the driver.|Fahrten mit Sitzplätzen ohne Fahrer zählen.|Ka ìrìn pẹ̀lú àga èrò láìka awakọ̀.|Count trips with passenger seats excluding driver.",
    fields: [
      field("outreachTravelers", "People needing a ride|Mitfahrende Personen|Ènìyàn tí ó nílò ọkọ̀|People needing a ride", 1, 1000000000000, true),
      field("outreachVanCount", "Available vans|Verfügbare Kleinbusse|Ọkọ̀ kékeré tó wà|Available vans", 1, 1000000000000, true),
      field("outreachPassengerSeats", "Passenger seats per van|Fahrgastplätze je Kleinbus|Àga èrò nínú ọkọ̀ kan|Passenger seats per van", 1, 1000000000000, true),
    ],
    outputs: ["Total van trips|Fahrten insgesamt|Gbogbo ìrìn ọkọ̀|Total van trips","Departure waves|Abfahrtswellen|Ìgbà tí ọkọ̀ jáde|Departure waves"],
    calculate: (n,v,s)=>[Math.ceil(n/s),Math.ceil(n/(v*s))],
  },

  "outreach-walking-route": {
    category: "Faith & Outreach",
    title: "Walking outreach route time|Dauer eines Besuchsrundgangs|Àkókò ìrìn ìbẹ̀wò|Walking outreach route time",
    description: "Estimate walking and visit time for an entered route length and number of stops.|Zeit für Weg und Besuche aus Strecke und Halten schätzen.|Ṣírò àkókò ìrìn àti ìbẹ̀wò láti gígùn ọ̀nà àti ibi dídúró.|Estimate walk and visits from distance and stops.",
    fields: [
      field("outreachRouteKm", "Walking route (km)|Fußstrecke (km)|Ọ̀nà ìrìn (km)|Walking route (km)", 0, 1000000000000, false),
      field("outreachWalkingKph", "Average walking speed (km/h)|Gehgeschwindigkeit (km/h)|Ìyára ìrìn (km/h)|Average walking speed (km/h)", 0.000001, 1000000000000, false),
      field("outreachVisitStops", "Planned visits|Geplante Besuche|Ìbẹ̀wò tí a ṣètò|Planned visits", 0, 1000000000000, true),
      field("outreachMinutesPerVisit", "Time per visit (min)|Zeit je Besuch (min)|Àkókò ìbẹ̀wò kan (ìṣẹ́jú)|Time per visit (min)", 0, 1000000000000, false),
    ],
    outputs: ["Walking time (min)|Gehzeit (min)|Àkókò ìrìn (ìṣẹ́jú)|Walking time (min)","Total route time (min)|Gesamtdauer (min)|Gbogbo àkókò (ìṣẹ́jú)|Total route time (min)"],
    calculate: (d,s,n,t)=>[60*d/s,60*d/s+n*t],
  },

  "church-translation-staffing": {
    category: "Faith & Outreach",
    title: "Service interpretation coverage|Dolmetschbesetzung im Gottesdienst|Iye atúmọ̀ èdè fún ìjọsìn|Service interpretation coverage",
    description: "Plan simultaneous interpreters for each language and a per-interpreter time limit, with sessions starting together.|Gleichzeitige Dolmetschbesetzung aus Zeitgrenze und Sprachen planen.|Ṣètò iye atúmọ̀ èdè láti ààlà àkókò àti iye èdè.|Plan simultaneous interpreter coverage from languages and a time limit.",
    fields: [
      field("interpretationLanguages", "Languages needing interpretation|Zu dolmetschende Sprachen|Èdè tí ó nílò atúmọ̀|Languages needing interpretation", 1, 1000000000000, true),
      field("interpretationSessionMinutes", "Session length (min)|Sitzungsdauer (min)|Gígùn ìpàdé (ìṣẹ́jú)|Session length (min)", 0.000001, 1000000000000, false),
      field("interpretationMaxMinutes", "Maximum microphone time per interpreter (min)|Maximale Einsatzdauer je Dolmetscher (min)|Àkókò tó pọ̀ jù fún atúmọ̀ kan (ìṣẹ́jú)|Maximum mic time per interpreter (min)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Interpreters per language|Dolmetscher je Sprache|Atúmọ̀ fún èdè kan|Interpreters per language","Total interpreter assignments|Einsätze insgesamt|Gbogbo iṣẹ́ atúmọ̀|Total interpreter assignments"],
    calculate: (n,t,l)=>{const p=Math.ceil(t/l);return [p,p*n];},
  },

  "interpretation-receiver-stock": {
    category: "Faith & Outreach",
    title: "Interpretation receiver stock|Bestand an Dolmetschempfängern|Iye ẹ̀rọ gbígbà ìtumọ̀|Interpretation receiver stock",
    description: "Compare interpretation headset demand including reserve with charged receivers ready for use.|Empfänger inklusive Reserve mit geladenem Bestand vergleichen.|Fi iye ẹ̀rọ pẹ̀lú àfikún wé èyí tó ti gba iná.|Compare demand plus spares with charged receivers.",
    fields: [
      field("interpretationListeners", "Expected listeners|Erwartete Zuhörer|Olùgbọ́ tí a retí|Expected listeners", 0, 1000000000000, true),
      field("interpretationReceiverSpares", "Reserve receivers (%)|Empfängerreserve (%)|Ẹ̀rọ àfikún (%)|Reserve receivers (%)", 0, 100, false),
      field("receiversChargedCount", "Charged receivers available|Geladene verfügbare Empfänger|Ẹ̀rọ tó ti gba iná|Charged receivers available", 0, 1000000000000, true),
    ],
    outputs: ["Receivers required|Benötigte Empfänger|Ẹ̀rọ tí a nílò|Receivers needed","Receiver shortage|Fehlende Empfänger|Ẹ̀rọ tí ó ṣì kù|Receiver shortage"],
    calculate: (d,r,a)=>{const n=d+Math.ceil(d*r/100);return [n,Math.max(0,n-a)];},
  },

  "offering-cash-reconciliation": {
    category: "Faith & Outreach",
    title: "Offering cash reconciliation|Barspendenabgleich|Ìbámu owó ẹ̀bùn|Offering cash reconciliation",
    description: "Compare opening change plus recorded cash offerings minus paid-out amounts with the counted cash.|Erwartetes Bargeld aus Anfangsbestand, Spenden und Auszahlungen mit der Zählung vergleichen.|Fi owó tí a retí wé iye tí a kà lẹ́yìn ẹ̀bùn àti ìsanwó.|Compare expected cash with the actual cash count.",
    fields: [
      field("offeringOpeningFloat", "Opening change float|Wechselgeld zu Beginn|Owó pàṣípààrọ̀ ìbẹ̀rẹ̀|Opening change float", 0, 1000000000000, false),
      field("offeringLoggedCash", "Cash offerings recorded|Erfasste Barspenden|Owó ẹ̀bùn tí a kọ sílẹ̀|Recorded cash offerings", 0, 1000000000000, false),
      field("offeringPaidOut", "Logged cash paid out|Erfasste Auszahlungen|Owó tí a san jáde|Logged cash paid out", 0, 1000000000000, false),
      field("offeringCountedCash", "Cash counted|Gezähltes Bargeld|Owó tí a kà|Cash counted", 0, 1000000000000, false),
    ],
    outputs: ["Expected cash balance|Erwarteter Kassenbestand|Owó tí a retí|Expected cash balance","Counted minus expected|Gezählt minus erwartet|Owó tí a kà dín tí a retí|Counted minus expected"],
    calculate: (f,i,p,c)=>{const e=f+i-p;requireField(e>=0,'offeringPaidOut');return [e,c-e];},
  },

  "pledge-collection-forecast": {
    category: "Faith & Outreach",
    title: "Pledge collection forecast|Prognose der Spendeneingänge|Àsọtẹ́lẹ̀ owó ìlérí|Pledge collection forecast",
    description: "Estimate expected recurring pledge receipts with an entered collection rate and campaign target.|Wiederkehrende Zusagen mit Einbringungsquote und Ziel vergleichen.|Fi owó ìlérí oṣù wé àfojúsùn pẹ̀lú ìpín gbígbà.|Forecast recurring pledges with the collection rate and target.",
    fields: [
      field("pledgingHouseholds", "Households pledging|Haushalte mit Zusage|Ìdílé tó ṣèlérí|Households pledging", 1, 1000000000000, true),
      field("pledgeMonthlyMean", "Mean monthly pledge|Mittlere Monatszusage|Ìlérí oṣù àárín|Average monthly pledge", 0, 1000000000000, false),
      field("pledgeCampaignMonths", "Campaign months|Kampagnenmonate|Oṣù ìpolongo|Campaign months", 1, 1000000000000, true),
      field("pledgeCollectionPct", "Expected collection (%)|Erwartete Einbringung (%)|Ìpín gbígbà tí a retí (%)|Expected collection (%)", 0, 100, false),
      field("pledgeCampaignTarget", "Campaign target|Kampagnenziel|Àfojúsùn ìpolongo|Campaign target", 0, 1000000000000, false),
    ],
    outputs: ["Expected receipts|Erwartete Einnahmen|Owó tí a retí|Expected receipts","Funding gap|Finanzierungslücke|Àlàfo owó|Funding gap"],
    calculate: (h,m,n,p,t)=>{const e=h*m*n*p/100;return [e,Math.max(0,t-e)];},
  },

  "potluck-dietary-portions": {
    category: "Faith & Outreach",
    title: "Dietary meal portions|Portionen für Sonderkost|Ìpín oúnjẹ àkànṣe|Dietary meal portions",
    description: "Separate servings for one dietary group from regular servings and apply the same reserve to each.|Standard- und Sonderkostportionen getrennt inklusive Reserve berechnen.|Ka oúnjẹ deede àti àkànṣe lọ́tọ̀ pẹ̀lú àfikún.|Count regular and special servings separately with reserve.",
    fields: [
      field("potluckExpectedGuests", "Expected guests|Erwartete Gäste|Àlejò tí a retí|Expected guests", 1, 1000000000000, true),
      field("potluckSpecialMeals", "Guests needing the dietary meal|Gäste mit Sonderkost|Àlejò tó nílò oúnjẹ àkànṣe|Guests needing special meals", 0, 1000000000000, true),
      field("potluckMealReserve", "Serving reserve (%)|Portionsreserve (%)|Ìpín oúnjẹ àfikún (%)|Serving reserve (%)", 0, 100, false),
    ],
    outputs: ["Regular servings|Standardportionen|Ìpín oúnjẹ deede|Regular servings","Dietary servings|Sonderkostportionen|Ìpín oúnjẹ àkànṣe|Special servings"],
    calculate: (n,s,p)=>{requireField(s<=n,'potluckSpecialMeals');return [n-s+Math.ceil((n-s)*p/100),s+Math.ceil(s*p/100)];},
  },

  "food-pantry-shelf-coverage": {
    category: "Faith & Outreach",
    title: "Pantry stock coverage|Reichweite eines Lebensmittelvorrats|Àkókò tí oúnjẹ ìrànlọ́wọ́ lè tó|Pantry stock coverage",
    description: "Project complete service days until reserve stock is reached and avoid counting future deliveries.|Volle Servicetage bis zur Reserve ohne künftige Lieferungen bestimmen.|Ka ọjọ́ iṣẹ́ odidi dé àfikún láìka ọjà ọjọ́ iwájú.|Count days before touching reserve, without future deliveries.",
    fields: [
      field("foodPantryShelfUnits", "Units on shelf now|Aktueller Lagerbestand|Ẹyọ oúnjẹ tó wà|Units on shelf now", 0, 1000000000000, true),
      field("foodPantryDailyUnits", "Units given per service day|Ausgabe je Servicetag|Ẹyọ tí a fún ní ọjọ́ iṣẹ́ kan|Units given per service day", 1, 1000000000000, true),
      field("foodPantryReserveUnits", "Reserve units to retain|Vorbehaltene Einheiten|Ẹyọ àfikún láti pa mọ́|Reserve units to retain", 0, 1000000000000, true),
    ],
    outputs: ["Complete service days|Volle Servicetage|Ọjọ́ iṣẹ́ odidi|Full service days","Units after those days|Einheiten danach|Ẹyọ lẹ́yìn ọjọ́ wọ̀nyẹn|Units left after those days"],
    calculate: (n,d,r)=>{const days=Math.max(0,Math.floor((n-r)/d));return [days,n-days*d];},
  },

  "volunteer-meal-assembly": {
    category: "Faith & Outreach",
    title: "Food parcel assembly capacity|Packleistung für Lebensmittelpakete|Agbára ṣíṣe àpò oúnjẹ|Food parcel assembly capacity",
    description: "Plan whole parcel output from multiple packing lines after setup time.|Ganze Pakete für parallele Packlinien nach Abzug der Aufbauzeit schätzen.|Ka àpò odidi fún ìlà tó ṣiṣẹ́ lẹ́yìn ìmúrasílẹ̀.|Plan output across packing lines after setup.",
    fields: [
      field("parcelPackingLines", "Parallel packing lines|Parallele Packlinien|Ìlà ṣíṣe àpò|Parallel packing lines", 1, 1000000000000, true),
      field("parcelLinePerHour", "Parcels per line per hour|Pakete je Linie und Stunde|Àpò fún ìlà ní wákàtí kan|Parcels per line every hour", 0.000001, 1000000000000, false),
      field("parcelSessionMinutes", "Session minutes including setup|Einsatzminuten einschließlich Aufbau|Ìṣẹ́jú iṣẹ́ pẹ̀lú ìmúrasílẹ̀|Session minutes including setup", 0.000001, 1000000000000, false),
      field("parcelSetupMinutes", "Setup minutes|Aufbauminuten|Ìṣẹ́jú ìmúrasílẹ̀|Setup minutes", 0, 1000000000000, false),
    ],
    outputs: ["Productive minutes|Produktive Minuten|Ìṣẹ́jú iṣẹ́ gidi|Productive minutes","Estimated whole parcels|Geschätzte ganze Pakete|Àpò odidi tí a fojú díwọ̀n|Estimated full parcels"],
    calculate: (l,r,t,s)=>{requireField(s<=t,'parcelSetupMinutes');return [t-s,Math.floor(l*r*(t-s)/60)];},
  },

  "choir-rehearsal-recording": {
    category: "Faith & Outreach",
    title: "Choir recording session time|Aufnahmezeit eines Chors|Àkókò gbigbasilẹ orin ẹgbẹ́|Choir recording session time",
    description: "Estimate recording minutes for full takes with short resets between takes.|Aufnahmezeit für ganze Durchläufe mit kurzen Pausen schätzen.|Ṣírò àkókò gbigbasilẹ pẹ̀lú ìsinmi láàárín.|Estimate full takes and the resets between them.",
    fields: [
      field("choirSongCount", "Songs to rehearse or record|Zu probende oder aufzunehmende Lieder|Orin láti dánwò tàbí gbasilẹ|Songs to rehearse or record", 1, 1000000000000, true),
      field("choirMeanPieceMinutes", "Mean song length (min)|Mittlere Lieddauer (min)|Àkókò orin àárín (ìṣẹ́jú)|Average song length (min)", 0.000001, 1000000000000, false),
      field("choirTakesPerSong", "Full takes per song|Vollständige Aufnahmen je Lied|Gbigbasilẹ pípé fún orin kan|Full takes per song", 1, 1000000000000, true),
      field("choirResetMinutes", "Reset between takes per song (min)|Pause zwischen Aufnahmen pro Lied (min)|Àkókò àtúnṣe láàárín gbigbasilẹ (ìṣẹ́jú)|Reset between takes (min)", 0, 1000000000000, false),
    ],
    outputs: ["Performance time (min)|Aufführungszeit (min)|Àkókò orin (ìṣẹ́jú)|Performance time (min)","Session time including resets (min)|Gesamtzeit mit Wechseln (min)|Gbogbo àkókò pẹ̀lú àtúnṣe (ìṣẹ́jú)|Session time with resets (min)"],
    calculate: (n,t,k,b)=>[n*t*k,n*(t*k+(k-1)*b)],
  },

  "volunteer-outreach-appointments": {
    category: "Faith & Outreach",
    title: "Outreach appointment schedule|Terminplanung für Gemeindearbeit|Ètò àkókò ìpàdé ìtànkálẹ̀|Outreach appointment schedule",
    description: "Count whole appointments across parallel teams after travel and setup are reserved.|Ganze Termine für parallele Teams nach Fahrt und Aufbau zählen.|Ka ìpàdé odidi fún ẹgbẹ́ lẹ́yìn ìrìn àti ìmúrasílẹ̀.|Count full appointments after travel and setup.",
    fields: [
      field("outreachAppointmentTeams", "Available teams|Verfügbare Teams|Ẹgbẹ́ tó wà|Available teams", 1, 1000000000000, true),
      field("outreachTimeWindowMinutes", "Minutes available per team|Verfügbare Minuten je Team|Ìṣẹ́jú tó wà fún ẹgbẹ́ kan|Minutes available per team", 0.000001, 1000000000000, false),
      field("outreachFixedTeamMinutes", "Travel and setup per team (min)|Fahrt und Aufbau je Team (min)|Ìrìn àti ìmúrasílẹ̀ fún ẹgbẹ́ kan (ìṣẹ́jú)|Travel and setup per team (min)", 0, 1000000000000, false),
      field("outreachVisitSlotMinutes", "Minutes reserved per appointment|Reservierte Minuten je Termin|Ìṣẹ́jú fún ìpàdé kan|Minutes reserved each appointment", 0.000001, 1000000000000, false),
    ],
    outputs: ["Appointments per team|Termine je Team|Ìpàdé fún ẹgbẹ́ kan|Appointments for one team","Total appointment capacity|Terminkapazität insgesamt|Gbogbo agbára ìpàdé|Total appointment capacity"],
    calculate: (n,t,f,s)=>{requireField(f<=t,'outreachFixedTeamMinutes');const a=Math.floor((t-f)/s);return [a,n*a];},
  },

  "outreach-material-weight": {
    category: "Faith & Outreach",
    title: "Outreach handout transport weight|Transportgewicht für Handzettel|Ìwọ̀n ẹrù ìwé ìtànkálẹ̀|Outreach handout transport weight",
    description: "Pack full or partly filled boxes and include empty box weight in the shipment.|Volle und teilweise gefüllte Kartons samt Leergewicht berechnen.|Ka àpótí pípé tàbí apá àti ìwọ̀n àpótí òfo.|Count boxes and include their empty weight.",
    fields: [
      field("transportHandouts", "Handouts to move|Zu befördernde Handzettel|Ìwé láti gbé|Handouts to move", 1, 1000000000000, true),
      field("transportEachGrams", "Weight per handout (g)|Gewicht je Handzettel (g)|Ìwọ̀n ìwé kan (g)|Weight per handout (g)", 0.000001, 1000000000000, false),
      field("transportBoxCapacity", "Handouts per box|Handzettel je Karton|Ìwé nínú àpótí kan|Handouts per box", 1, 1000000000000, true),
      field("transportTareKg", "Empty box weight (kg)|Leergewicht je Karton (kg)|Ìwọ̀n àpótí òfo (kg)|Empty box weight (kg)", 0, 1000000000000, false),
    ],
    outputs: ["Boxes required|Benötigte Kartons|Àpótí tí a nílò|Boxes required","Total loaded weight (kg)|Gesamtgewicht beladen (kg)|Gbogbo ìwọ̀n ẹrù (kg)|Total packed weight (kg)"],
    calculate: (n,g,b,t)=>{const c=Math.ceil(n/b);return [c,n*g/1000+c*t];},
  },

  "church-stream-archive": {
    category: "Faith & Outreach",
    title: "Service video archive capacity|Speicher für Gottesdienstarchive|Ìpamọ́ fídíò ìjọsìn|Service video archive capacity",
    description: "Plan archive duration using the measured size of each service recording and retained duplicate copies.|Archivdauer aus gemessener Aufnahmegröße und Kopienzahl ermitteln.|Ṣírò àkókò ìpamọ́ láti ìwọ̀n gbigbasilẹ àti iye àdàkọ.|Estimate archive retention from measured size and copies.",
    fields: [
      field("serviceRecordingGb", "Measured recording size (GB)|Gemessene Aufnahmegröße (GB)|Ìwọ̀n fíìmù ìjọsìn (GB)|Measured recording size (GB)", 0.000001, 1000000000000, false),
      field("serviceRecordingsWeek", "Recordings per week|Aufnahmen pro Woche|Gbigbasilẹ lọ́sẹ̀ kan|Recordings per week", 1, 1000000000000, true),
      field("serviceArchiveCopies", "Copies of each recording|Kopien je Aufnahme|Àdàkọ fún gbigbasilẹ kan|Copies for each recording", 1, 1000000000000, true),
      field("serviceArchiveStorage", "Available aggregate storage (GB)|Verfügbarer Gesamtspeicher (GB)|Gbogbo ibi ìpamọ́ tó wà (GB)|Total space available (GB)", 0, 1000000000000, false),
    ],
    outputs: ["Weekly archive growth (GB)|Wöchentlicher Speicherzuwachs (GB)|Ìdàgbàsókè ìpamọ́ lọ́sẹ̀ (GB)|Weekly archive growth (GB)","Complete weeks retained|Volle aufbewahrte Wochen|Ọ̀sẹ̀ odidi tí a tọ́jú|Full weeks retained"],
    calculate: (s,n,c,g)=>[s*n*c,Math.floor(g/(s*n*c))],
  },

  "scripture-lesson-copy-count": {
    category: "Faith & Outreach",
    title: "Scripture lesson classroom copies|Kopien für Bibelunterricht|Àdàkọ ẹ̀kọ́ Ìwé Mímọ́|Scripture lesson copies",
    description: "Plan student and leader copies across classes, including extra student copies in each class.|Teilnehmer- und Leitungskopien einschließlich Reserve pro Klasse planen.|Ṣètò àdàkọ akẹ́kọ̀ọ́ àti aṣáájú pẹ̀lú àfikún.|Plan student and leader copies across classes.",
    fields: [
      field("bibleLessonClasses", "Classes receiving the lesson|Teilnehmende Klassen|Kíláàsì tó gba ẹ̀kọ́|Classes getting the lesson", 1, 1000000000000, true),
      field("bibleLessonStudentsEach", "Students per class|Teilnehmende je Klasse|Akẹ́kọ̀ọ́ fún kíláàsì kan|Students for each class", 1, 1000000000000, true),
      field("bibleLessonReserveEach", "Extra student copies per class|Reservekopien je Klasse|Àdàkọ àfikún fún kíláàsì kan|Extra student copies per class", 0, 1000000000000, true),
      field("bibleLessonLeadersEach", "Leader copies per class|Leitungskopien je Klasse|Àdàkọ aṣáájú fún kíláàsì kan|Leader copies per class", 0, 1000000000000, true),
    ],
    outputs: ["Student copies|Teilnehmerkopien|Àdàkọ akẹ́kọ̀ọ́|Student copies","Leader copies|Leitungskopien|Àdàkọ aṣáájú|Leader copies","Total copies|Kopien insgesamt|Gbogbo àdàkọ|Total copies"],
    calculate: (c,s,r,l)=>[c*(s+r),c*l,c*(s+r+l)],
  },

  "accessible-programme-pages": {
    category: "Faith & Outreach",
    title: "Large-print programme runs|Großdruck-Auflage für Programme|Iye ìtẹ̀wé ńlá fún ètò|Large-print programme runs",
    description: "Estimate double-sided sheets for separate standard and large-print runs at their actual page counts.|Doppelseitige Bögen für Standard- und Großdruck getrennt zählen.|Ka bébà ẹ̀gbẹ́ méjèèjì fún ìtẹ̀wé deede àti ńlá lọ́tọ̀.|Count double-sided sheets for standard and large print.",
    fields: [
      field("programStandardPages", "Standard pages per copy|Standardseiten je Kopie|Ojú deede nínú àdàkọ kan|Standard pages per copy", 1, 1000000000000, true),
      field("programStandardCopies", "Standard copies|Standardkopien|Àdàkọ deede|Standard copies", 0, 1000000000000, true),
      field("programLargePrintPages", "Large-print pages per copy|Großdruckseiten je Kopie|Ojú ìtẹ̀wé ńlá fún àdàkọ kan|Large-print pages per copy", 1, 1000000000000, true),
      field("programLargePrintCopies", "Large-print copies|Großdruckkopien|Àdàkọ ìtẹ̀wé ńlá|Large-print copies", 0, 1000000000000, true),
    ],
    outputs: ["Standard run sheets|Bögen für Standarddruck|Bébà ìtẹ̀wé deede|Standard run sheets","Large-print run sheets|Bögen für Großdruck|Bébà ìtẹ̀wé ńlá|Large-print sheets","Combined physical sheets|Bögen insgesamt|Gbogbo bébà gidi|Total sheets"],
    calculate: (p,c,q,n)=>{const x=Math.ceil(p/2)*c,y=Math.ceil(q/2)*n;return [x,y,x+y];},
  },

  "choir-stand-capacity": {
    category: "Faith & Outreach",
    title: "Choir music stand planning|Notenständerplanung für Chöre|Ètò dúró orin ẹgbẹ́|Choir music stand planning",
    description: "Count shared score stands and separate stands assigned to any soloists.|Geteilte Notenständer und eigene Ständer für Solisten zählen.|Ka dúró orin tí a pín àti ti akọrin kan.|Count shared stands and dedicated stands.",
    fields: [
      field("choirSharedReaders", "Singers sharing music stands|Sänger mit geteiltem Notenständer|Akọrin tó pín dúró orin|Singers sharing music stands", 0, 1000000000000, true),
      field("choirReadersPerStand", "Singers per shared stand|Sänger je gemeinsamem Ständer|Akọrin fún dúró kan|Singers per shared stand", 1, 1000000000000, true),
      field("choirDedicatedStands", "Dedicated stands|Einzelständer|Dúró orin ti ẹnìkan|Dedicated stands", 0, 1000000000000, true),
      field("choirStandsAvailable", "Stands available|Verfügbare Ständer|Dúró orin tó wà|Stands available", 0, 1000000000000, true),
    ],
    outputs: ["Total stands needed|Benötigte Ständer insgesamt|Gbogbo dúró orin tí a nílò|Total stands needed","Additional stands needed|Fehlende Ständer|Dúró orin tó ṣì kù|Extra stands needed"],
    calculate: (n,p,d,a)=>{const t=Math.ceil(n/p)+d;return [t,Math.max(0,t-a)];},
  },

  "volunteer-night-shelter-shifts": {
    category: "Faith & Outreach",
    title: "Shelter night shift coverage|Nachtschichtabdeckung in Notunterkünften|Ìpèsè iṣẹ́ alẹ́ ilé ààbò|Shelter night shift coverage",
    description: "Count volunteer assignments for an overnight shelter and find minimum headcount under a per-person assignment limit.|Einsätze und Mindestpersonal bei einer Grenze pro Person kalkulieren.|Ka iṣẹ́ alẹ́ àti iye olùrànlọ́wọ́ lábẹ́ ààlà ẹnìkan.|Count shelter shifts and headcount under a per-person limit.",
    fields: [
      field("shelterOpenNights", "Nights open|Geöffnete Nächte|Alẹ́ tí ó ṣí|Nights open", 1, 1000000000000, true),
      field("shelterShiftsNight", "Non-overlapping shifts per night|Schichten je Nacht ohne Überlappung|Ìṣísẹ̀ alẹ́ kan|Non-overlapping shifts per night", 1, 1000000000000, true),
      field("shelterPersonsShift", "People required per shift|Benötigte Personen je Schicht|Ènìyàn fún ìṣísẹ̀ kan|People needed per shift", 1, 1000000000000, true),
      field("shelterPersonLimit", "Maximum assignments per volunteer|Maximale Einsätze je Helfer|Iṣẹ́ tó pọ̀ jù fún olùrànlọ́wọ́ kan|Maximum assignments per volunteer", 1, 1000000000000, true),
    ],
    outputs: ["Assignments to fill|Zu besetzende Einsätze|Iṣẹ́ tí a gbọ́dọ̀ kún|Assignments to fill","Minimum volunteer count|Mindestanzahl Freiwilliger|Iye olùrànlọ́wọ́ tó kéré jù|Minimum volunteers"],
    calculate: (n,s,p,l)=>[n*s*p,Math.max(p,Math.ceil(n*s*p/l))],
  },

  "fellowship-break-time": {
    category: "Faith & Outreach",
    title: "Service intermission reset|Umbaupause im Gottesdienst|Àkókò àtúnṣe ìsinmi ìjọsìn|Service intermission reset",
    description: "Estimate whether ushering, cleanup and audio resetting fit when each task is handled sequentially.|Prüfen, ob Einlass, Reinigung und Audio-Umbau nacheinander in die Pause passen.|Ṣàyẹ̀wò bóyá gbígba ènìyàn, ìmótótó àti àtúnṣe ohùn tó àkókò ìsinmi.|See whether sequential ushering, cleanup and audio reset fit.",
    fields: [
      field("serviceIntermissionMinutes", "Intermission available (min)|Verfügbare Pause (min)|Àkókò ìsinmi tó wà (ìṣẹ́jú)|Intermission available (min)", 0, 1000000000000, false),
      field("serviceUsheringTime", "Ushering time (min)|Einlasszeit (min)|Àkókò gbígba ènìyàn (ìṣẹ́jú)|Ushering time (min)", 0, 1000000000000, false),
      field("serviceCleanupTime", "Cleanup (min)|Aufräumzeit (min)|Àkókò ìmótótó (ìṣẹ́jú)|Cleanup time (min)", 0, 1000000000000, false),
      field("serviceAudioResetTime", "Audio reset (min)|Audio-Umrüstung (min)|Àkókò àtúnṣe ohùn (ìṣẹ́jú)|Audio reset (min)", 0, 1000000000000, false),
    ],
    outputs: ["Time needed (min)|Benötigte Zeit (min)|Àkókò tí a nílò (ìṣẹ́jú)|Time needed (min)","Signed time left (min)|Restzeit mit Vorzeichen (min)|Àkókò tó kù pẹ̀lú àmì (ìṣẹ́jú)|Signed time left (min)"],
    calculate: (i,a,b,c)=>[a+b+c,i-a-b-c],
  },

  "outreach-donor-receipt-cost": {
    category: "Faith & Outreach",
    title: "Donation receipt mailing cost|Porto für Spendenbescheinigungen|Owó fífi ẹ̀rí ẹ̀bùn ránṣẹ́|Donation receipt mailing cost",
    description: "Separate mailed from digital donor receipts and calculate packing and postage for physical copies.|Digitale und postalische Bescheinigungen trennen und Briefkosten berechnen.|Yà ẹ̀rí ayélujára kúrò ní bébà kí o ka owó fífi ránṣẹ́.|Split digital and mailed receipts and price the mail.",
    fields: [
      field("receiptsIssuedTotal", "Receipts to issue|Auszustellende Bescheinigungen|Ẹ̀rí tí a ó ṣe|Receipts to issue", 0, 1000000000000, true),
      field("receiptsDigitalCount", "Receipts delivered digitally|Digital zugestellte Bescheinigungen|Ẹ̀rí tí a rán lórí ayélujára|Receipts sent digitally", 0, 1000000000000, true),
      field("receiptPostageEach", "Postage per mailed receipt|Porto je Brief|Owó fífi ẹ̀rí kan ránṣẹ́|Postage per mailed receipt", 0, 1000000000000, false),
      field("receiptEnvelopeCost", "Envelope and print per receipt|Umschlag und Druck je Brief|Owó àpò àti ìtẹ̀wé|Envelope and print per receipt", 0, 1000000000000, false),
    ],
    outputs: ["Physical receipts|Bescheinigungen per Post|Ẹ̀rí lórí bébà|Receipts to mail","Total mailing cost|Versandkosten insgesamt|Gbogbo owó fífi ránṣẹ́|Total mailing cost"],
    calculate: (n,d,p,e)=>{requireField(d<=n,'receiptsDigitalCount');return [n-d,(n-d)*(p+e)];},
  },

  "church-stage-power-budget": {
    category: "Faith & Outreach",
    title: "Service stage power budget|Leistungsbudget für Gottesdienstbühnen|Ààlà agbára pẹpẹ ìjọsìn|Service stage power budget",
    description: "Compare measured audio and lighting load against a supplied wattage budget and planned headroom.|Gemessene Audio- und Lichtlast mit Leistungsbudget und Puffer vergleichen.|Fi agbára ohùn àti ìmọ́lẹ̀ tí a wọn wé ààlà àti àfikún.|Compare measured audio and lighting draw with the budget and headroom.",
    fields: [
      field("serviceAudioDrawW", "Measured audio draw (W)|Gemessene Audioleistung (W)|Agbára ohùn tí a wọn (W)|Measured audio draw (W)", 0, 1000000000000, false),
      field("serviceLightingDrawW", "Measured lighting draw (W)|Gemessene Lichtleistung (W)|Agbára ìmọ́lẹ̀ tí a wọn (W)|Measured lighting draw (W)", 0, 1000000000000, false),
      field("serviceWattBudget", "Available power budget (W)|Verfügbares Leistungsbudget (W)|Ààlà agbára tó wà (W)|Available power budget (W)", 0.000001, 1000000000000, false),
      field("serviceLoadHeadroom", "Budget reserved as headroom (%)|Reservierter Puffer (%)|Ìpín ààlà àfikún (%)|Budget reserved as headroom (%)", 0, 100, false),
    ],
    outputs: ["Measured combined draw (W)|Gemessene Gesamtlast (W)|Àpapọ̀ agbára tí a wọn (W)|Measured combined draw (W)","Signed spare planned power (W)|Geplanter Leistungsspielraum (W)|Agbára tó kù pẹ̀lú àmì (W)|Signed spare planned power (W)"],
    calculate: (a,b,w,h)=>[a+b,w*(1-h/100)-a-b],
  },
};
