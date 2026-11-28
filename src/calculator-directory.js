const languages = ["en", "de", "yo", "pcm"];
const textFor = (values, language) => values.split("|")[Math.max(0, languages.indexOf(language))];

export const directoryCopy = {
  allTracks: "All tracks|Alle Bereiche|Gbogbo ẹ̀ka|All tracks",
  allSubcategories: "All subcategories|Alle Unterkategorien|Gbogbo ẹ̀ka kékeré|All subcategories",
  subcategories: "Subcategories|Unterkategorien|Àwọn ẹ̀ka kékeré|Subcategories",
  clear: "Clear search|Suche löschen|Pa ìwádìí rẹ́|Clear search",
  resultCount: "{count} of {total} calculators|{count} von {total} Rechnern|{count} nínú {total} ẹ̀rọ ìṣírò|{count} of {total} calculators",
  searchHelp: "Search names, tasks, or abbreviations like VAT, GPS, or PWM.|Suche nach Namen, Aufgaben oder Kürzeln wie MwSt., GPS oder PWM.|Wá orúkọ, iṣẹ́ tàbí àkótán bí VAT, GPS tàbí PWM.|Search name, task or short form like VAT, GPS or PWM.",
  noResults: "No calculators match. Try fewer words or choose All tracks.|Keine passenden Rechner. Verwende weniger Wörter oder wähle Alle Bereiche.|Kò sí ẹ̀rọ ìṣírò tó bá mu. Lo ọ̀rọ̀ díẹ̀ tàbí yan Gbogbo ẹ̀ka.|No calculator match. Try fewer words or choose All tracks.",
};

const track = (id, label, icon, groups) => ({id, label, icon, groups});
const group = (id, label, keys) => ({id, label, keys:keys.split(" ")});

export const directoryTracks = [
  track("ai","Token & AI|Token & KI|Tọ́kẹ́nì àti AI|Token & AI","◈",[
    group("tokens","Tokens & model costs|Token & Modellkosten|Tọ́kẹ́nì àti owó àwòṣe|Tokens & model costs","token llm-batch-token-cost llm-context-budget ai-token-cache-cost"),
    group("ai-data","Datasets & review|Datensätze & Prüfung|Àkọsílẹ̀ àti àyẹ̀wò|Datasets & review","ai-dataset-split ai-annotation-capacity ai-dataset-dedup-yield ai-document-review-coverage"),
    group("ai-evaluation","Model evaluation|Modellbewertung|Àyẹ̀wò àwòṣe|Model evaluation","classification-metrics ai-macro-f1 ai-balanced-accuracy ai-matthews-correlation ai-reviewer-agreement ai-brier-score ai-caption-word-error ai-model-error-change"),
    group("retrieval","Retrieval & embeddings|Abruf & Embeddings|Ìwádìí àti embedding|Retrieval & embeddings","embedding-index-storage ai-retrieval-precision-recall ai-mean-reciprocal-rank ai-retrieval-window-count"),
    group("ai-operations","Training & operations|Training & Betrieb|Ìdánilẹ́kọ̀ọ́ àti iṣẹ́|Training & operations","llm-output-capacity ai-model-weight-memory ai-training-optimizer-steps ai-inference-concurrency ai-latency-slo-budget ai-accelerator-hours ai-quantized-artifact-savings ai-canary-traffic-count ai-api-run-quota"),
    group("text-and-coding","Text, coding & privacy|Text, Code & Datenschutz|Ọ̀rọ̀, kóòdù àti àṣírí|Text, code & privacy","text json bases qr hash password morse download-time"),
    group("digital-media","Digital media & design|Digitale Medien & Gestaltung|Ohùn, àwòrán àti àpẹrẹ|Digital media & design","color print-resolution pcm-audio-size"),
  ]),
  track("electronics","Electronics & Automation|Elektronik & Automatisierung|Ẹ̀rọ iná àti ìṣàkóso aládàáṣe|Electronics & Automation","⚡",[
    group("circuits","Circuit analysis|Schaltungsanalyse|Ìtúpalẹ̀ àyíká iná|Circuit analysis","ohms-law-series parallel-resistor-load loaded-voltage-divider led-series-resistor rc-charge-time capacitor-stored-energy inductor-current-ramp lc-resonance"),
    group("electrical-power","Electrical power & energy|Elektrische Leistung & Energie|Agbára àti iná|Electrical power & energy","electrical-load dc-cable-voltage-drop transformer-turns ac-power-triangle pwm-resistive-power thermal-resistance-rise ev-charging-session"),
    group("signals","Sensors & digital signals|Sensoren & digitale Signale|Sensọ àti àmì onínọ́mbà|Sensors & digital signals","current-loop-scaling digital-sampling-rate adc-code-step uart-frame-transmission encoder-machine-speed"),
    group("industrial","Motors & manufacturing|Motoren & Fertigung|Mọ́tò àti ìṣelọpọ|Motors & manufacturing","shaft-torque stepper-travel-resolution gearbox-output vfd-synchronous-speed synchronous-belt-ratio conveyor-throughput process-cycle-takt oee-machine-effectiveness"),
    group("fluid","Pumps, water & irrigation|Pumpen, Wasser & Bewässerung|Fifa omi àti ìbomi rin|Pumps, water & irrigation","pump-energy hydraulic-cylinder-force tank-fill-duration rainwater-harvest drip-irrigation plant-spacing"),
    group("construction","Construction & materials|Bau & Material|Ìkọ́lé àti ohun èlò|Construction & materials","paint-coverage concrete-slab tile-order fence-posts ramp-geometry"),
    group("engineering-math","Engineering math & units|Technische Mathematik & Einheiten|Ìṣírò ẹ̀rọ àti ìwọ̀n|Engineering math & units","math temp units"),
  ]),
  track("trading","Trading|Handel|Ìṣòwò|Trading","↗",[
    group("trade-risk","Trade execution & risk|Handelsausführung & Risiko|Ìdúnàádúrà àti ewu|Trade execution & risk","trade-fee-break-even trade-payoff position-loss-budget trade-order-book-fill drawdown-recovery"),
    group("trade-performance","Portfolio performance|Portfolioperformance|Ìṣe àkójọpọ̀ ọjà|Portfolio performance","two-lot-cost-basis cagr-return trade-dividend-yield trade-multiple-lots-exit trade-real-return trade-profit-factor trade-benefit-expectancy trade-contribution-return trade-stock-split"),
    group("derivatives","Derivatives & bonds|Derivate & Anleihen|Àṣàyàn ọjà àti ìwé ìdè owó|Derivatives & bonds","futures-tick-result long-call-expiry trading-funding-payment trade-bond-price trade-simple-forward trade-cash-secured-put"),
    group("inventory-pricing","Inventory & business pricing|Bestand & Preiskalkulation|Ọjà inú ilé àti iye títà|Stock & business pricing","product-break-even inventory-reorder margin-markup-pair target-margin-price inventory-turnover-days trade-invoice-unit-landed trade-inventory-shrink"),
    group("fx","Currency & remittances|Währungen & Geldtransfer|Owó àjèjì àti fífi owó ránṣẹ́|Currency & remittances","currency fx-round-trip trade-fx-exchange-fee"),
    group("personal-finance","Household finance & bills|Haushaltsfinanzen & Rechnungen|Ètò owó ilé àti ìwé owó|Household finance & bills","percent loan inflation tip discount fuel trade-invoice-cash-discount"),
  ]),
  track("faith","Faith & Outreach|Glaube & Gemeindearbeit|Ìgbàgbọ́ àti ìtànkálẹ̀|Faith & Outreach","✝",[
    group("faith-learning","Scripture, worship & study|Bibel, Gottesdienst & Studium|Ìwé Mímọ́, ìjọsìn àti ẹ̀kọ́|Scripture, worship & study","scripture-reading-plan sermon-timing scripture-lesson-copy-count qibla worship-song-range choir-rehearsal-recording choir-stand-capacity"),
    group("relief","Meals & community relief|Mahlzeiten & Gemeindehilfe|Oúnjẹ àti ìrànlọ́wọ́ àwùjọ|Meals & community relief","food-relief-parcels potluck-dietary-portions food-pantry-shelf-coverage volunteer-meal-assembly volunteer-night-shelter-shifts recipe dough-hydration"),
    group("faith-events","Service & volunteer logistics|Gottesdienst- & Helferlogistik|Ìṣètò ìjọsìn àti olùrànlọ́wọ́|Service & volunteer logistics","community-event-seating outreach-van-trips outreach-walking-route church-translation-staffing interpretation-receiver-stock volunteer-outreach-appointments fellowship-break-time"),
    group("faith-media","Printing, audio & streaming|Druck, Audio & Streaming|Ìtẹ̀wé, ohùn àti ìgbéjáde|Printing, audio & streaming","outreach-print-order service-booklet-printing outreach-material-weight accessible-programme-pages service-livestream-data church-stream-archive wireless-mic-batteries church-stage-power-budget"),
    group("faith-fundraising","Giving & fundraising|Spenden & Finanzierung|Ẹ̀bùn àti ìkójọ owó|Giving & fundraising","zakat offering-cash-reconciliation pledge-collection-forecast outreach-donor-receipt-cost"),
  ]),
  track("civics","Civics & Politics|Bürgerkunde & Politik|Ìlú àti òṣèlú|Civics & Politics","▥",[
    group("elections","Elections & representation|Wahlen & Vertretung|Ìdìbò àti aṣojú|Elections & representation","election-turnout council-seat-projection ballot-stock-reconciliation civic-mail-ballot-returns civic-precinct-processing civic-petition-signature-buffer civic-settlement-representation"),
    group("governance","Meetings & decision rules|Sitzungen & Beschlussregeln|Ìpàdé àti òfin ìpinnu|Meetings & decision rules","meeting-quorum motion-approval public-comment-slots civic-committee-attendance-rate"),
    group("public-budgets","Public budgets & grants|Öffentliche Budgets & Förderung|Ètò owó àti ìrànlọ́wọ́ ìjọba|Public budgets & grants","community-match-funding civic-budget-burn civic-grant-reimbursement civic-park-maintenance-cost civic-council-payroll-budget civic-unit-service-cost"),
    group("public-services","Public services & infrastructure|Öffentliche Dienste & Infrastruktur|Iṣẹ́ araalu àti amáyédẹrùn|Public services & infrastructure","public-service-backlog civic-service-target-coverage civic-transit-fleet-headway civic-street-sweeping-shifts civic-library-holds civic-records-scanning-volume civic-consultation-capacity civic-recycling-diversion civic-sidewalk-repair-rollout shift-staffing"),
    group("public-data","Surveys, statistics & population|Umfragen, Statistik & Bevölkerung|Ìwádìí, ìṣirò àti olùgbé|Surveys, statistics & population","civic-survey-interval civic-survey-response-status stats world demographics"),
    group("education","Learning, dates & calendars|Bildung, Termine & Kalender|Ẹ̀kọ́, ọjọ́ àti kàlẹ́ńdà|Learning, dates & calendars","gpa final-grade-target practice dates timezone holidays age roman"),
    group("wellbeing","Health, sport & daily life|Gesundheit, Sport & Alltag|Ìlera, eré àti ìgbé ayé|Health, sport & daily life","bmi running-pace cycling-gear-speed sleep calories pregnancy water bac"),
  ]),
];

const aliases = {
  token:"tiktoken tokenizer bpe GPT-4o o200k cl100k llm prompt",
  "llm-context-budget":"rag context window retrieval chunks max input prompt",
  "llm-batch-token-cost":"AI API billing price per million estimation",
  "ai-caption-word-error":"WER transcription ASR speech recognition",
  "ai-mean-reciprocal-rank":"MRR search rank",
  "ai-matthews-correlation":"MCC classification",
  "ai-latency-slo-budget":"SLA SLO latency deadline error budget",
  "ai-retrieval-window-count":"RAG overlap stride text splitter",
  "embedding-index-storage":"vector database RAG index storage",
  "ai-model-weight-memory":"VRAM GPU RAM quantization",
  "password":"passphrase entropy generate credentials zxcvbn",
  "print-resolution":"DPI PPI pixels photo printing",
  "ai-document-review-coverage":"OCR document processing quality assurance",
  "json":"JSON prettify format minify validator",
  "hash":"sha256 sha 256 sha1 sha 1 md5 file checksum fingerprint",
  "color":"WCAG accessibility contrast ratio hex RGB HSL",
  "electrical-load":"electricity consumption home appliances kWh energy bill power",
  "rc-charge-time":"capacitor resistor time constant charging",
  "dc-cable-voltage-drop":"wire resistance cable length volts",
  "ac-power-triangle":"power factor kVA kvar RMS apparent reactive",
  "vfd-synchronous-speed":"induction motor VFD rpm pole slip",
  "adc-code-step":"ADC quantization LSB analog digital",
  "oee-machine-effectiveness":"OEE TPM uptime availability performance quality",
  "process-cycle-takt":"lean manufacturing cycle time production cadence",
  "current-loop-scaling":"4-20mA 4 20 mA transmitter PLC analog input",
  "target-margin-price":"gross margin pricing markup price profit",
  "fx-round-trip":"forex bid ask spread conversion basis points",
  "currency":"exchange rates foreign exchange FX EUR USD Währung Wechselkurs",
  "trade-fx-exchange-fee":"remittance transfer conversion money sent",
  "trade-invoice-cash-discount":"early payment terms invoice skonto",
  "discount":"VAT MwSt Umsatzsteuer sales tax price reduction GST",
  "loan":"mortgage amortization interest monthly payment installment",
  "ev-charging-session":"electric vehicle EV charging battery",
  "qibla":"Mecca Makkah Kaaba prayer compass GPS heading",
  "wireless-mic-batteries":"wireless mic AA cells battery runtime",
  "scripture-reading-plan":"Bible devotional reading chapters",
  "offering-cash-reconciliation":"church donation cash count collection",
  "food-relief-parcels":"food bank pantry food parcels household supplies",
  "meeting-quorum":"attendance minimum committee voting quorum",
  "motion-approval":"council vote yes votes resolution majority supermajority",
  "ballot-stock-reconciliation":"ballot audit count discrepancy election polling papers Wahl Stimmzettel",
  "civic-transit-fleet-headway":"bus fleet public transport frequency schedule",
  "civic-survey-interval":"polling Wilson confidence interval margin of error sampling",
  "election-turnout":"voter participation turnout ballots Wahlbeteiligung",
  "gpa":"grade point average marks credits grades",
  "bmi":"body mass index kg weight height",
  "bac":"blood alcohol concentration alcohol Widmark",
};

const memberships = new Map();
for(const track of directoryTracks){
  for(const group of track.groups){
    for(const key of group.keys){
      if(memberships.has(key))throw new Error("Duplicate calculator directory entry: "+key);
      memberships.set(key,{track,group});
    }
  }
}

export function directoryLocation(key){
  return memberships.get(key);
}

export function validateDirectory(keys){
  const unknown=[...memberships.keys()].filter(key=>!keys.includes(key));
  const missing=keys.filter(key=>!memberships.has(key));
  if(unknown.length||missing.length)throw new Error("Calculator directory mismatch: unknown "+unknown.join(", ")+"; missing "+missing.join(", "));
}

export function directoryText(value,locale){
  return textFor(value,locale);
}

export function normalizeDirectorySearch(value){
  return value.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/ß/g,"ss").replace(/[^\p{L}\p{N}]+/gu," ").trim();
}

export function calculatorSearchIndex({key,title,description,alternates,fields}){
  const place=directoryLocation(key);
  const titles=normalizeDirectorySearch([title,...alternates].join(" "));
  const keywords=normalizeDirectorySearch([key,aliases[key]||"",...fields].join(" "));
  const details=normalizeDirectorySearch([description,place.track.label,place.group.label].join(" "));
  return {title:normalizeDirectorySearch(title),titles:titles.split(" "),keywords:keywords.split(" "),details:details.split(" ")};
}

export function calculatorSearchScore(entry,query){
  if(!query)return 0;
  if(entry.title===query)return 100;
  if(entry.title.startsWith(query))return 85;
  if((" "+entry.title).includes(" "+query))return 70;
  const terms=[...new Set(query.split(" "))];
  const match=(words,term)=>words.some(word=>term.length<=2?word===term:word.startsWith(term));
  const matches=terms.map(term=>match(entry.titles,term)?7:match(entry.keywords,term)?5:match(entry.details,term)?2:0);
  return matches.every(Boolean)?matches.reduce((sum,value)=>sum+value,0)/terms.length:-1;
}
