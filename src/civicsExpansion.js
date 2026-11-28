import {field, requireField} from "./calculator-fields.js";

export const civicsExpansion = {
  "civic-mail-ballot-returns": {
    category: "Civics & Politics",
    title: "Mail ballot return rate|Rücklaufquote von Briefwahlunterlagen|Ìpín ìpadà ìwé ìbò lẹ́tà|Mail ballot return rate",
    description: "Compare issued and returned mail ballots at one reporting cutoff.|Ausgestellte und zurückgegebene Briefwahlunterlagen zu einem Stichtag vergleichen.|Fi ìwé ìbò lẹ́tà tí a fún wé èyí tí ó padà ní àkókò kan.|Compare issued and returned mail ballots at one cutoff.",
    fields: [
      field("mailIssuedBallots", "Mail ballots issued|Ausgestellte Briefwahlunterlagen|Ìwé ìbò lẹ́tà tí a fún|Mail ballots issued", 1, 1000000000000, true),
      field("mailReturnedBallots", "Mail ballots received|Eingegangene Briefwahlunterlagen|Ìwé ìbò lẹ́tà tí a gbà|Mail ballots received", 0, 1000000000000, true),
    ],
    outputs: ["Return share (%)|Rücklaufanteil (%)|Ìpín tí ó padà (%)|Return share (%)","Not returned at cutoff|Zum Stichtag nicht zurück|Iye tí kò padà ní àkókò|Not returned at cutoff"],
    calculate: (i,r)=>{requireField(r<=i,'mailReturnedBallots');return [100*r/i,i-r];},
  },

  "civic-precinct-processing": {
    category: "Civics & Politics",
    title: "Polling station process capacity|Abfertigungskapazität im Wahllokal|Agbára iṣẹ́ ibi ìdìbò|Polling station process capacity",
    description: "Find the slower step in a two-stage check-in and booth layout, using measured processing times.|Engpass zwischen Anmeldung und Kabinen aus gemessenen Zeiten ermitteln.|Rí ibi tí iṣẹ́ lọ́ra láàárín ìforúkọsílẹ̀ àti yàrá ìbò.|Find the slower step across check-in and booths.",
    fields: [
      field("pollCheckinDesks", "Parallel check-in desks|Parallele Anmeldetische|Tábìlì ìforúkọsílẹ̀ tó ṣiṣẹ́ pọ̀|Parallel check-in desks", 1, 1000000000000, true),
      field("pollCheckinSeconds", "Mean check-in time (s)|Mittlere Anmeldung (s)|Àkókò ìforúkọsílẹ̀ àárín (s)|Mean check-in time (s)", 0.000001, 1000000000000, false),
      field("pollBoothCount", "Active voting booths|Aktive Wahlkabinen|Yàrá ìbò tó ń ṣiṣẹ́|Active voting booths", 1, 1000000000000, true),
      field("pollMeanBoothSeconds", "Mean booth use (s)|Mittlere Kabinennutzung (s)|Àkókò yàrá ìbò àárín (s)|Mean booth use (s)", 0.000001, 1000000000000, false),
      field("pollOpenHours", "Hours in operation|Betriebsstunden|Wákàtí iṣẹ́|Hours open", 0.000001, 1000000000000, false),
    ],
    outputs: ["Check-in voters per hour|Anmeldungen pro Stunde|Olùdìbò ìforúkọsílẹ̀ fún wákàtí|Check-ins per hour","Booth voters per hour|Kabinenbesuche pro Stunde|Olùdìbò yàrá fún wákàtí|Booth visits per hour","Estimated whole voters processed|Geschätzte vollständig abgefertigte Wähler|Iye olùdìbò tí a lè parí|Estimated full voter throughput"],
    calculate: (d,s,b,t,h)=>{const a=d*3600/s,c=b*3600/t;return [a,c,Math.floor(h*Math.min(a,c))];},
  },

  "civic-petition-signature-buffer": {
    category: "Civics & Politics",
    title: "Petition submission signature buffer|Puffer für Eingabeunterschriften|Àfikún ìfọwọ́sí ẹ̀bẹ̀|Petition signature buffer",
    description: "Use the validity rate and minimum count you enter to estimate a raw submission buffer.|Rohziel aus erwarteter Gültigkeit und eingegebener Mindestzahl berechnen.|Ṣírò àfikún láti ìpín ìfọwọ́sí tó tọ́ àti iye tí a tẹ̀.|Estimate a buffer from validity and the minimum you enter.",
    fields: [
      field("petitionRequiredValid", "Minimum valid signatures|Erforderliche gültige Unterschriften|Ìfọwọ́sí tó tọ́ tí a nílò|Minimum valid signatures", 1, 1000000000000, true),
      field("petitionExpectedValidity", "Expected validity (%)|Erwartete Gültigkeit (%)|Ìpín ìfọwọ́sí tó tọ́ (%)|Expected validity (%)", 0.000001, 100, false),
      field("petitionCollectedRaw", "Raw signatures collected|Gesammelte Rohunterschriften|Gbogbo ìfọwọ́sí tí a kó|Raw signatures collected", 0, 1000000000000, true),
    ],
    outputs: ["Estimated raw submission target|Geschätztes Rohziel|Àfojúsùn gbogbo ìfọwọ́sí|Estimated raw target","Raw signatures still needed|Weitere Rohunterschriften nötig|Ìfọwọ́sí tó ṣì kù|Raw signatures still needed"],
    calculate: (v,p,r)=>{const t=Math.ceil(v*100/p);return [t,Math.max(0,t-r)];},
  },

  "civic-settlement-representation": {
    category: "Civics & Politics",
    title: "District representation ratio|Vertretungsverhältnis im Bezirk|Ìpín aṣojú agbègbè|District representation ratio",
    description: "Compare residents per seat with a reference area using counts from the same reporting basis.|Einwohner je Sitz mit einem Gebiet auf derselben Datenbasis vergleichen.|Fi olùgbé fún ìjókòó kan wé agbègbè míì lórí ìpìlẹ̀ kan náà.|Compare residents per seat across areas on the same basis.",
    fields: [
      field("representedDistrictResidents", "Residents in district|Einwohner im Bezirk|Olùgbé agbègbè|District residents", 1, 1000000000000, true),
      field("representedDistrictSeats", "Seats in district|Sitze im Bezirk|Ìjókòó agbègbè|District seats", 1, 1000000000000, true),
      field("representedRefResidents", "Residents in reference area|Einwohner im Vergleichsgebiet|Olùgbé agbègbè àfíwé|Reference area residents", 1, 1000000000000, true),
      field("representedRefSeats", "Reference area seats|Sitze im Vergleichsgebiet|Ìjókòó agbègbè àfíwé|Reference area seats", 1, 1000000000000, true),
    ],
    outputs: ["District residents per seat|Bezirkseinwohner je Sitz|Olùgbé agbègbè fún ìjókòó kan|District residents per seat","Reference residents per seat|Vergleichseinwohner je Sitz|Olùgbé àfíwé fún ìjókòó kan|Reference residents per seat","Relative difference (%)|Relative Abweichung (%)|Ìyàtọ̀ ní ìbátan (%)|Relative difference (%)"],
    calculate: (d,s,a,b)=>[d/s,a/b,100*(d*b/(s*a)-1)],
  },

  "civic-survey-response-status": {
    category: "Civics & Politics",
    title: "Public survey response accounting|Rücklaufbilanz öffentlicher Umfragen|Ìkà èsì ìwádìí gbogbogbò|Public survey response accounting",
    description: "Account for complete and partial replies among delivered survey invitations.|Vollständige und teilweise Antworten unter zugestellten Einladungen erfassen.|Ka èsì pípé àti apá lára ìpè tó dé.|Count complete and partial replies among delivered invitations.",
    fields: [
      field("civicInvitationsSent", "Invitations sent|Versandte Einladungen|Ìpè tí a rán|Invitations sent", 1, 1000000000000, true),
      field("civicInvitationsUndelivered", "Undelivered invitations|Unzustellbare Einladungen|Ìpè tí kò dé|Undelivered invitations", 0, 1000000000000, true),
      field("civicSurveyCompleteReplies", "Complete replies|Vollständige Antworten|Èsì pípé|Complete replies", 0, 1000000000000, true),
      field("civicSurveyPartialReplies", "Partial replies|Teilantworten|Èsì apá kan|Partial replies", 0, 1000000000000, true),
    ],
    outputs: ["Delivered invitations|Zugestellte Einladungen|Ìpè tó dé|Delivered invitations","Any reply share (%)|Anteil aller Antworten (%)|Ìpín èsì gbogbo (%)|Any reply share (%)","Complete reply share (%)|Vollständige Antwortquote (%)|Ìpín èsì pípé (%)|Complete reply share (%)"],
    calculate: (n,u,c,p)=>{requireField(u<n,'civicInvitationsUndelivered');const d=n-u;requireField(c+p<=d,'civicSurveyPartialReplies');return [d,100*(c+p)/d,100*c/d];},
  },

  "civic-budget-burn": {
    category: "Civics & Politics",
    title: "Public budget spend projection|Prognose öffentlicher Ausgaben|Àsọtẹ́lẹ̀ ináwó ìjọba|Public budget spend projection",
    description: "Project spending from recorded monthly pace and known additional committed expenses.|Ausgaben aus Monatsrate und bekannten zusätzlichen Verpflichtungen hochrechnen.|Ṣírò ináwó ọjọ́ iwájú láti ìpín oṣù àti ìlérí owó míì.|Project spending from monthly pace and known extras.",
    fields: [
      field("publicBudgetApproved", "Approved budget|Bewilligtes Budget|Ètò owó tí a fọwọ́ sí|Approved budget", 0.000001, 1000000000000, false),
      field("publicBudgetSpent", "Spending to date|Bisherige Ausgaben|Owó tí a ná títí di báyìí|Spending to date", 0, 1000000000000, false),
      field("publicBudgetMonthsUsed", "Elapsed accounting months|Abgelaufene Abrechnungsmonate|Oṣù ìkà tó kọjá|Elapsed accounting months", 0.000001, 1000000000000, false),
      field("publicBudgetMonthsRemaining", "Months remaining|Verbleibende Monate|Oṣù tó kù|Months remaining", 0, 1000000000000, false),
      field("publicBudgetAdditionalCommitments", "Additional commitments not in monthly pace|Weitere Verpflichtungen außerhalb der Monatsrate|Ìlérí owó míì tí kò sí nínú oṣù|Extra commitments outside the monthly pace", 0, 1000000000000, false),
    ],
    outputs: ["Average monthly spend|Mittlere Monatsausgaben|Owó àárín fún oṣù kan|Average monthly spend","Projected total spend|Prognostizierte Gesamtausgaben|Gbogbo owó tí a retí|Projected total spend","Projected signed balance|Prognostizierter Saldo|Owó tó kù pẹ̀lú àmì|Projected signed balance"],
    calculate: (b,s,u,r,c)=>{const p=s/u;const t=s+p*r+c;return [p,t,b-t];},
  },

  "civic-grant-reimbursement": {
    category: "Civics & Politics",
    title: "Grant reimbursement claim|Förderkostenerstattung|Owó ìsanpadà ìrànlọ́wọ́|Grant reimbursement claim",
    description: "Calculate a current claim using eligible costs, a reimbursement rate, an overall award and previously paid claims.|Aktuellen Antrag aus förderfähigen Kosten, Quote, Fördergrenze und bisherigen Zahlungen berechnen.|Ṣírò ìsanpadà láti inú ináwó, ìpín, ààlà àti owó tí a ti san.|Estimate one claim with eligible cost, rate, award and prior claims.",
    fields: [
      field("grantEligibleCost", "Eligible cost for this claim|Förderfähige Kosten dieses Antrags|Ìnáwó tó yẹ fún ìbéèrè yìí|Eligible cost for this claim", 0, 1000000000000, false),
      field("grantReimbursementPct", "Reimbursement rate (%)|Erstattungssatz (%)|Ìpín ìsanpadà (%)|Reimbursement rate (%)", 0, 100, false),
      field("grantAwardCeiling", "Total award ceiling|Gesamter Förderhöchstbetrag|Ààlà gbogbo ìrànlọ́wọ́|Total award ceiling", 0, 1000000000000, false),
      field("grantClaimsAlreadyPaid", "Previous reimbursements paid|Bisherige Erstattungen|Ìsanpadà tí a ti san|Previous reimbursements paid", 0, 1000000000000, false),
    ],
    outputs: ["Estimated current reimbursement|Geschätzte aktuelle Erstattung|Ìsanpadà tí a fojú díwọ̀n|Estimated current reimbursement","Award left after claim|Förderrest nach Antrag|Ìrànlọ́wọ́ tó kù lẹ́yìn ìbéèrè|Award left after claim"],
    calculate: (c,r,g,p)=>{requireField(p<=g,'grantClaimsAlreadyPaid');const x=Math.min(c*r/100,g-p);return [x,g-p-x];},
  },

  "civic-service-target-coverage": {
    category: "Civics & Politics",
    title: "Residents covered by service|Einwohner mit Leistungszugang|Olùgbé tí iṣẹ́ dé|Residents covered by service",
    description: "Compare a service's current coverage share with an entered target for the same resident population.|Aktuelle Abdeckung und eingegebenes Ziel für dieselbe Bevölkerung vergleichen.|Fi ìpín iṣẹ́ báyìí wé àfojúsùn fún olùgbé kan náà.|Compare current reach with a target for the same population.",
    fields: [
      field("coveredResidentsTotal", "Residents in service scope|Einwohner im Leistungsgebiet|Olùgbé nínú agbègbè iṣẹ́|Residents in scope", 1, 1000000000000, true),
      field("coveredResidentsCurrent", "Residents currently served|Derzeit versorgte Einwohner|Olùgbé tí iṣẹ́ dé báyìí|Residents currently served", 0, 1000000000000, true),
      field("coveredResidentsTargetPct", "Target coverage (%)|Zielabdeckung (%)|Ìpín àfojúsùn (%)|Target coverage (%)", 0, 100, false),
    ],
    outputs: ["Current coverage (%)|Aktuelle Abdeckung (%)|Ìpín iṣẹ́ báyìí (%)|Current coverage (%)","Additional residents to reach target|Weitere Einwohner bis zum Ziel|Olùgbé tó ṣì kù sí àfojúsùn|Extra residents to reach target"],
    calculate: (n,c,t)=>{requireField(c<=n,'coveredResidentsCurrent');return [100*c/n,Math.max(0,Math.ceil(n*t/100)-c)];},
  },

  "civic-transit-fleet-headway": {
    category: "Civics & Politics",
    title: "Bus route headway and fleet|Bustakt und Fahrzeugbedarf|Àkókò àárín bọ́ọ̀sì àti iye ọkọ̀|Bus route headway and fleet",
    description: "Estimate buses needed for a target departure interval and the interval achievable with the existing fleet on a repeat loop.|Fahrzeuge für einen Zieltakt und Takt der vorhandenen Flotte berechnen.|Ṣírò ọkọ̀ fún àkókò ìjáde àfojúsùn àti ìjáde ọkọ̀ tó wà.|Estimate fleet for the target interval and interval with existing buses.",
    fields: [
      field("busRoundTripMinutes", "Round trip including recovery (min)|Umlauf mit Wendezeit (min)|Ìrìn yípo pẹ̀lú ìsinmi (ìṣẹ́jú)|Round trip including recovery (min)", 0.000001, 1000000000000, false),
      field("busTargetHeadwayMinutes", "Target departure interval (min)|Zielabstand der Abfahrten (min)|Àkókò àfojúsùn láàárín ìjáde (ìṣẹ́jú)|Target departure interval (min)", 0.000001, 1000000000000, false),
      field("busCurrentVehicleCount", "Vehicles in service|Fahrzeuge im Einsatz|Ọkọ̀ tó ń ṣiṣẹ́|Vehicles in service", 1, 1000000000000, true),
    ],
    outputs: ["Vehicles needed|Benötigte Fahrzeuge|Ọkọ̀ tí a nílò|Vehicles needed","Current even headway (min)|Gleichmäßiger aktueller Takt (min)|Àkókò àárín ìjáde báyìí (ìṣẹ́jú)|Current even headway (min)"],
    calculate: (r,t,n)=>[Math.ceil(r/t),r/n],
  },

  "civic-street-sweeping-shifts": {
    category: "Civics & Politics",
    title: "Street sweeping shift coverage|Schichtleistung der Straßenreinigung|Agbára fífọ ọ̀nà fún ìṣísẹ̀|Street sweeping coverage",
    description: "Forecast road length swept from parallel vehicles, measured productive pace and setup time per shift.|Gereinigte Straßenlänge aus Fahrzeugzahl, Tempo und Aufbauzeit schätzen.|Ṣírò gígùn ọ̀nà tí a fọ láti inú ẹ̀rọ, ìyára àti ìmúrasílẹ̀.|Estimate length swept from crew pace and shift setup.",
    fields: [
      field("sweepingStreetKm", "Route length to sweep (km)|Zu reinigende Straßenlänge (km)|Gígùn ọ̀nà láti fọ (km)|Road length to sweep (km)", 0, 1000000000000, false),
      field("sweepingVehicleCount", "Sweepers available|Verfügbare Kehrmaschinen|Ẹ̀rọ fífọ tó wà|Sweepers available", 1, 1000000000000, true),
      field("sweepingKmHour", "Productive pace per sweeper (km/h)|Produktive Geschwindigkeit je Fahrzeug (km/h)|Ìyára iṣẹ́ fún ẹ̀rọ kan (km/h)|Productive pace each sweeper (km/h)", 0.000001, 1000000000000, false),
      field("sweepingShiftHours", "Shift length (h)|Schichtdauer (h)|Gígùn ìṣísẹ̀ (wákàtí)|Shift length (h)", 0.000001, 1000000000000, false),
      field("sweepingSetupHours", "Preparation per shift (h)|Vorbereitung je Schicht (h)|Ìmúrasílẹ̀ fún ìṣísẹ̀ (wákàtí)|Preparation per shift (h)", 0, 1000000000000, false),
    ],
    outputs: ["Fleet coverage per shift (km)|Flächenleistung je Schicht (km)|Gígùn tí gbogbo ẹ̀rọ lè fọ (km)|Fleet coverage per shift (km)","Shifts needed|Benötigte Schichten|Ìṣísẹ̀ tí a nílò|Shifts needed"],
    calculate: (l,n,v,h,b)=>{requireField(b<h,'sweepingSetupHours');const t=n*v*(h-b);return [t,Math.ceil(l/t)];},
  },

  "civic-library-holds": {
    category: "Civics & Politics",
    title: "Library hold queue estimate|Warteschätzung für Bibliotheksvormerkungen|Àkókò ìdúró fún ìwé ìkàwé|Library hold queue estimate",
    description: "Estimate queue days when all copies circulate at the entered mean loan duration and every hold is served.|Wartezeit bei gleichbleibender Ausleihdauer und bedienten Vormerkungen schätzen.|Ṣírò ìdúró bí àkókò yíyá bá dúró tí a sì pèsè ìwé fún gbogbo ìbéèrè.|Estimate wait when loans take the same time and holds are served.",
    fields: [
      field("libraryHoldsAhead", "Holds ahead of this request|Vormerkungen vor dieser Anfrage|Ìbéèrè tó wà níwájú|Holds ahead of this request", 0, 1000000000000, true),
      field("libraryCopiesCirculating", "Circulating copies|Ausleihbare Exemplare|Àdàkọ tí a ń yá|Circulating copies", 1, 1000000000000, true),
      field("libraryMeanLoanDuration", "Mean loan cycle (days)|Mittlerer Ausleihzyklus (Tage)|Àkókò yíyá àárín (ọjọ́)|Mean loan cycle (days)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Fulfillment rate (holds/day)|Bedienrate (Vormerkungen/Tag)|Ìpèsè ìwé fún ọjọ́ kan|Fulfillment rate (holds/day)","Estimated queue time (days)|Geschätzte Wartezeit (Tage)|Àkókò ìdúró (ọjọ́)|Estimated queue time (days)"],
    calculate: (q,n,d)=>[n/d,q*d/n],
  },

  "civic-park-maintenance-cost": {
    category: "Civics & Politics",
    title: "Park mowing annual budget|Jahresbudget für Parkmahd|Ètò owó gígé koríko ọgbà|Park mowing annual budget",
    description: "Calculate per-visit and yearly mowing charges from maintained area and a fixed callout charge.|Mähkosten je Einsatz und Jahr aus Fläche und Anfahrt bestimmen.|Ṣírò owó gígé koríko fún ìbẹ̀wò àti ọdún.|Estimate mowing costs from the area and fixed visit charge.",
    fields: [
      field("maintainedParkHectares", "Area maintained (ha)|Gepflegte Fläche (ha)|Àyè tí a bójú tó (ha)|Area maintained (ha)", 0.000001, 1000000000000, false),
      field("maintainedParkPerHa", "Mowing charge per hectare|Mähpreis je Hektar|Owó gígé fún hektari kan|Mowing charge per hectare", 0, 1000000000000, false),
      field("maintainedParkCallout", "Fixed charge per visit|Fixkosten je Einsatz|Owó dúró fún ìbẹ̀wò|Fixed charge per visit", 0, 1000000000000, false),
      field("maintainedParkVisits", "Scheduled yearly visits|Geplante Einsätze pro Jahr|Ìbẹ̀wò tí a ṣètò lọ́dún|Scheduled yearly visits", 0, 1000000000000, true),
    ],
    outputs: ["Cost per visit|Kosten je Einsatz|Owó ìbẹ̀wò kan|Cost per visit","Annual cost|Jahreskosten|Owó ọdún|Annual cost"],
    calculate: (a,p,f,n)=>[a*p+f,(a*p+f)*n],
  },

  "civic-records-scanning-volume": {
    category: "Civics & Politics",
    title: "Public records scanning capacity|Scanleistung für öffentliche Akten|Agbára ṣíṣàwòrán àkọsílẹ̀ ìjọba|Public records scanning capacity",
    description: "Estimate working days and storage from measured scanning rate and typical scanned file size.|Arbeitstage und Speicher aus Scanrate und Seitengröße schätzen.|Ṣírò ọjọ́ iṣẹ́ àti ìpamọ́ láti ìyára ṣíṣàwòrán àti ìwọ̀n ojú ìwé.|Estimate workdays and storage from scanning pace and file size.",
    fields: [
      field("publicScanningPages", "Pages to digitize|Zu digitalisierende Seiten|Ojú ìwé láti ṣàwòrán|Pages to digitize", 1, 1000000000000, true),
      field("publicScanningRate", "Scanned pages per productive hour|Seiten pro produktiver Stunde|Ojú ìwé fún wákàtí iṣẹ́|Scanned pages per productive hour", 0.000001, 1000000000000, false),
      field("publicScanningCrewHours", "Combined productive hours per day|Produktive Teamstunden je Tag|Gbogbo wákàtí iṣẹ́ ẹgbẹ́ fún ọjọ́|Combined productive hours per day", 0.000001, 1000000000000, false),
      field("publicScanningTypicalPageKb", "Mean stored KB per page|Mittlere gespeicherte kB pro Seite|KB àárín fún ojú ìwé|Mean stored KB per page", 0, 1000000000000, false),
    ],
    outputs: ["Whole working days|Volle Arbeitstage|Ọjọ́ iṣẹ́ odidi|Whole working days","Estimated decimal MB|Geschätzte dezimale MB|MB eleemewa|Estimated decimal MB"],
    calculate: (n,r,h,k)=>[Math.ceil(n/(r*h)),n*k/1000],
  },

  "civic-council-payroll-budget": {
    category: "Civics & Politics",
    title: "Council meeting allowance budget|Budget für Sitzungsgelder|Ètò owó ìpàdé ìgbìmọ̀|Council meeting allowance budget",
    description: "Estimate total meeting allowances at the entered rates and expected attendance. Apply your own reimbursement rules separately.|Sitzungsgelder und Kosten aus eingegebenen Sätzen und Anwesenheit planen.|Ṣètò owó ìpàdé láti inú iye owó àti ọmọ ẹgbẹ́ tí a retí.|Estimate allowances from rates and expected attendance.",
    fields: [
      field("councilMembersPaid", "Members receiving allowance per meeting|Mitglieder mit Sitzungsgeld je Termin|Ọmọ ẹgbẹ́ tó gba owó fún ìpàdé kan|Members paid per meeting", 0, 1000000000000, true),
      field("councilAllowanceEach", "Allowance per attending member|Sitzungsgeld je anwesendem Mitglied|Owó ìpàdé fún ọmọ ẹgbẹ́ kan|Allowance per attending member", 0, 1000000000000, false),
      field("councilMeetingCount", "Meetings in budget period|Sitzungen im Budgetzeitraum|Ìpàdé nínú àkókò ètò owó|Meetings in budget period", 0, 1000000000000, true),
      field("councilFixedMeetingCosts", "Other fixed cost per meeting|Weitere Fixkosten je Sitzung|Owó dúró míì fún ìpàdé kan|Other fixed cost each meeting", 0, 1000000000000, false),
    ],
    outputs: ["Member allowances over period|Sitzungsgelder im Zeitraum|Owó ọmọ ẹgbẹ́ nínú àkókò|Member allowances over period","Total meeting budget|Gesamtbudget Sitzungen|Gbogbo ètò owó ìpàdé|Total meeting budget"],
    calculate: (m,a,n,f)=>[m*a*n,(m*a+f)*n],
  },

  "civic-consultation-capacity": {
    category: "Civics & Politics",
    title: "Consultation appointment coverage|Terminabdeckung einer Bürgersprechstunde|Ìpèsè àkókò ìjíròrò araalu|Consultation appointment coverage",
    description: "Compare appointment requests with complete slots in parallel desks, after breaks per desk.|Terminanfragen mit ganzen Beratungsplätzen nach Abzug der Pausen vergleichen.|Fi ìbéèrè ìpàdé wé àkókò odidi lẹ́yìn ìsinmi.|Compare requests with slots left after breaks.",
    fields: [
      field("publicConsultationRequests", "Appointment requests|Terminanfragen|Ìbéèrè ìpàdé|Appointment requests", 0, 1000000000000, true),
      field("publicConsultationDeskCount", "Parallel advisory desks|Parallele Beratungsplätze|Tábìlì ìjíròrò tó ṣiṣẹ́ pọ̀|Parallel consultation desks", 1, 1000000000000, true),
      field("publicConsultationOpenMin", "Open time per desk (min)|Öffnungsdauer je Platz (min)|Àkókò ṣíṣí fún tábìlì (ìṣẹ́jú)|Open time per desk (min)", 0.000001, 1000000000000, false),
      field("publicConsultationBreakMin", "Breaks per desk (min)|Pausen je Platz (min)|Ìsinmi fún tábìlì (ìṣẹ́jú)|Breaks per desk (min)", 0, 1000000000000, false),
      field("publicConsultationSlotMin", "Time per appointment (min)|Dauer je Termin (min)|Àkókò fún ìpàdé kan (ìṣẹ́jú)|Time each appointment (min)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Total complete slots|Vollständige Termine insgesamt|Gbogbo àkókò ìpàdé odidi|Total complete slots","Requests without a slot|Anfragen ohne Termin|Ìbéèrè tí kò rí àkókò|Requests without a slot"],
    calculate: (r,n,t,b,s)=>{requireField(b<=t,'publicConsultationBreakMin');const c=n*Math.floor((t-b)/s);return [c,Math.max(0,r-c)];},
  },

  "civic-recycling-diversion": {
    category: "Civics & Politics",
    title: "Municipal waste diversion share|Kommunale Abfallverwertungsquote|Ìpín egbin tí a tún lò|Municipal waste diversion share",
    description: "Compare separately weighed recycling and organic streams with disposal over one reporting period.|Wertstoffe und Bioabfälle mit Entsorgung im selben Zeitraum vergleichen.|Fi egbin àtúnlò àti ẹ̀dá wé èyí tí a sọ nù.|Compare recycling and organics with waste sent for disposal.",
    fields: [
      field("civicRecyclingTonnes", "Recycling collected (t)|Gesammelte Wertstoffe (t)|Egbin àtúnlò tí a kó (t)|Recycling collected (t)", 0, 1000000000000, false),
      field("civicOrganicTonnes", "Organics diverted (t)|Getrennte Bioabfälle (t)|Egbin ẹ̀dá tí a yà (t)|Organics diverted (t)", 0, 1000000000000, false),
      field("civicResidualWasteTonnes", "Waste sent for disposal (t)|Zur Entsorgung verbrachter Abfall (t)|Egbin tí a sọ nù (t)|Waste sent for disposal (t)", 0, 1000000000000, false),
    ],
    outputs: ["Total weighed waste (t)|Gesamte gewogene Abfälle (t)|Gbogbo egbin tí a wọn (t)|Total weighed waste (t)","Diverted share (%)|Verwertungsanteil (%)|Ìpín tí a yà (%)|Diverted share (%)"],
    calculate: (r,o,w)=>{const n=r+o+w;requireField(n>0,'civicResidualWasteTonnes');return [n,100*(r+o)/n];},
  },

  "civic-sidewalk-repair-rollout": {
    category: "Civics & Politics",
    title: "Sidewalk repair rollout|Sanierungsplan für Gehwege|Ètò àtúnṣe ọ̀nà ẹsẹ̀|Sidewalk repair rollout",
    description: "Estimate crew workdays and remaining pavement length after a planned deployment window.|Arbeitstage und Restlänge nach geplantem Einsatz berechnen.|Ṣírò ọjọ́ iṣẹ́ àti gígùn tó kù lẹ́yìn àkókò tí a ṣètò.|Estimate crew days and remaining length after the planned window.",
    fields: [
      field("civicSidewalkRepairMeters", "Length needing repair (m)|Zu sanierende Länge (m)|Gígùn tó nílò àtúnṣe (m)|Length needing repair (m)", 0, 1000000000000, false),
      field("civicSidewalkCrewCount", "Parallel repair crews|Parallele Reparaturkolonnen|Ẹgbẹ́ àtúnṣe tó ṣiṣẹ́ pọ̀|Parallel repair crews", 1, 1000000000000, true),
      field("civicSidewalkMetersDay", "Completed metres per crew-day|Fertige Meter je Kolonnentag|Mítà tí ẹgbẹ́ kan parí lọ́jọ́|Completed metres per crew-day", 0.000001, 1000000000000, false),
      field("civicSidewalkWorkdays", "Workdays scheduled|Vorgesehene Arbeitstage|Ọjọ́ iṣẹ́ tí a ṣètò|Workdays scheduled", 0, 1000000000000, true),
    ],
    outputs: ["Whole workdays to finish|Volle Arbeitstage bis Abschluss|Ọjọ́ iṣẹ́ odidi láti parí|Full workdays to finish","Remaining after scheduled days (m)|Rest nach geplanten Tagen (m)|Gígùn tó kù lẹ́yìn ọjọ́ iṣẹ́ (m)|Remaining after scheduled days (m)"],
    calculate: (m,c,r,d)=>[Math.ceil(m/(c*r)),Math.max(0,m-c*r*d)],
  },

  "civic-unit-service-cost": {
    category: "Civics & Politics",
    title: "Public service cost per completion|Kosten je erledigter Leistung|Owó iṣẹ́ tí a parí|Public service cost each completion",
    description: "Allocate direct program spending and shared overhead to completed cases in the same reporting period.|Direkte Ausgaben und Gemeinkosten auf erledigte Fälle desselben Zeitraums umlegen.|Pín ináwó gidi àti àfikún sí iṣẹ́ tí a parí ní àkókò kan náà.|Share direct spending and overhead across completed cases.",
    fields: [
      field("civicCostDirectSpending", "Direct program spending|Direkte Programmausgaben|Owó iṣẹ́ gidi|Direct program spending", 0, 1000000000000, false),
      field("civicCostSharedOverhead", "Allocated shared overhead|Zugewiesene Gemeinkosten|Owó àfikún tí a pín|Allocated shared overhead", 0, 1000000000000, false),
      field("civicCostCompletedCases", "Cases completed in the period|Abgeschlossene Fälle im Zeitraum|Iṣẹ́ tí a parí nínú àkókò|Cases completed in period", 1, 1000000000000, true),
    ],
    outputs: ["Total allocated spend|Zugewiesene Gesamtausgaben|Gbogbo owó tí a pín|Total allocated spend","Cost per completed case|Kosten je abgeschlossenem Fall|Owó fún iṣẹ́ kan tí a parí|Cost per completed case"],
    calculate: (d,o,n)=>[d+o,(d+o)/n],
  },

  "civic-committee-attendance-rate": {
    category: "Civics & Politics",
    title: "Committee attendance accounting|Anwesenheitsbilanz eines Ausschusses|Ìkà wíwà ìgbìmọ̀|Committee attendance accounting",
    description: "Compare member attendances with offered member-slots over several meetings of a fixed-size committee.|Anwesenheiten über Sitzungen eines Ausschusses mit gleichbleibender Größe abrechnen.|Ka wíwà ọmọ ẹgbẹ́ ní ìpàdé ìgbìmọ̀ tí iye rẹ̀ dúró.|Compare observed and possible member attendances.",
    fields: [
      field("committeeEligibleSeats", "Seats throughout reporting period|Sitze im gesamten Zeitraum|Ìjókòó nínú gbogbo àkókò|Seats throughout reporting period", 1, 1000000000000, true),
      field("committeeHeldMeetings", "Meetings held|Abgehaltene Sitzungen|Ìpàdé tí a ṣe|Meetings held", 1, 1000000000000, true),
      field("committeeObservedAttendances", "Total member attendances|Anwesenheiten insgesamt|Gbogbo ìgbà ọmọ ẹgbẹ́ wà|Total member attendances", 0, 1000000000000, true),
    ],
    outputs: ["Possible member attendances|Mögliche Anwesenheiten|Ìgbà tí ọmọ ẹgbẹ́ lè wà|Possible member attendances","Attendance rate (%)|Anwesenheitsquote (%)|Ìpín wíwà (%)|Attendance share (%)","Average members present|Mittlere anwesende Mitglieder|Iye ọmọ ẹgbẹ́ tó wà ní àárín|Average members present"],
    calculate: (s,n,p)=>{const t=s*n;requireField(p<=t,'committeeObservedAttendances');return [t,100*p/t,p/n];},
  },
};
