import {field, requireField} from "./calculator-fields.js";

export const aiExpansion = {
  "ai-macro-f1": {
    category: "Token & AI",
    title: "Three-class macro F1|Makro-F1 für drei Klassen|Àárín F1 ẹ̀ka mẹ́ta|Three-class macro F1",
    description: "Average per-class F1 equally, regardless of class frequency.|F1-Werte der Klassen ungeachtet ihrer Häufigkeit gleich mitteln.|Ṣe àárín ìwọ̀n F1 ẹ̀ka kọọkan láìka bí ẹ̀ka ṣe wọ́pọ̀.|Average each class F1 equally, no matter how common the class is.",
    fields: [
      field("macroCommonF1", "First class F1 (%)|F1 der ersten Klasse (%)|F1 ẹ̀ka àkọ́kọ́ (%)|First class F1 (%)", 0, 100, false),
      field("macroSecondF1", "Second class F1 (%)|F1 der zweiten Klasse (%)|F1 ẹ̀ka kejì (%)|Second class F1 (%)", 0, 100, false),
      field("macroRareF1", "Third class F1 (%)|F1 der dritten Klasse (%)|F1 ẹ̀ka kẹta (%)|Third class F1 (%)", 0, 100, false),
    ],
    outputs: ["Macro F1 (%)|Makro-F1 (%)|Àárín F1 (%)|Macro F1 (%)","Lowest class F1 (%)|Niedrigster Klassen-F1 (%)|F1 ẹ̀ka tó kéré jù (%)|Lowest class F1 (%)"],
    calculate: (p,q,r)=>[(p+q+r)/3,Math.min(p,q,r)],
  },

  "ai-balanced-accuracy": {
    category: "Token & AI",
    title: "Binary balanced accuracy|Binäre balancierte Genauigkeit|Ìpéye dọ́gba ẹ̀ka méjì|Binary balanced accuracy",
    description: "Give positive and negative classes equal weight even when their sample counts differ.|Positive und negative Klasse trotz ungleicher Stichproben gleich gewichten.|Fún ẹ̀ka rere àti odi ní ìwọ̀n kan náà bí iye wọn tilẹ̀ yàtọ̀.|Give both classes equal weight even if their sample sizes differ.",
    fields: [
      field("balancedHitPositive", "Correct positive cases|Korrekt positive Fälle|Ẹ̀ka rere tó tọ́|Correct positive cases", 0, 1000000000000, true),
      field("balancedAllPositive", "All actual positives|Alle tatsächlich positiven Fälle|Gbogbo rere gidi|All actual positives", 1, 1000000000000, true),
      field("balancedHitNegative", "Correct negative cases|Korrekt negative Fälle|Ẹ̀ka odi tó tọ́|Correct negative cases", 0, 1000000000000, true),
      field("balancedAllNegative", "All actual negatives|Alle tatsächlich negativen Fälle|Gbogbo odi gidi|All actual negatives", 1, 1000000000000, true),
    ],
    outputs: ["Balanced accuracy (%)|Balancierte Genauigkeit (%)|Ìpéye dọ́gba (%)|Balanced accuracy (%)","Overall accuracy (%)|Gesamtgenauigkeit (%)|Ìpéye lápapọ̀ (%)|Overall accuracy (%)"],
    calculate: (p,a,n,b)=>{requireField(p<=a,'balancedHitPositive');requireField(n<=b,'balancedHitNegative');return [50*(p/a+n/b),100*(p+n)/(a+b)];},
  },

  "ai-matthews-correlation": {
    category: "Token & AI",
    title: "Matthews correlation|Matthews-Korrelation|Ìbáṣepọ̀ Matthews|Matthews correlation",
    description: "Measure binary classification agreement from all four confusion counts; a dash means the correlation is undefined.|Übereinstimmung aus allen vier Konfusionswerten messen. Ein Strich steht für undefiniert.|Wọn ìbáṣepọ̀ pẹ̀lú iye mẹ́rin. Àmì gígùn túmọ̀ sí àìṣàlàyé.|Measure agreement using all four confusion counts. Dash means undefined.",
    fields: [
      field("mccCorrectPos", "True positives|Richtig Positive|Rere tó tọ́|True positives", 0, 1000000000000, true),
      field("mccFalsePos", "False positives|Falsch Positive|Rere tí kò tọ́|False positives", 0, 1000000000000, true),
      field("mccCorrectNeg", "True negatives|Richtig Negative|Odi tó tọ́|True negatives", 0, 1000000000000, true),
      field("mccFalseNeg", "False negatives|Falsch Negative|Odi tí kò tọ́|False negatives", 0, 1000000000000, true),
    ],
    outputs: ["Matthews correlation|Matthews-Korrelation|Ìbáṣepọ̀ Matthews|Matthews correlation"],
    calculate: (tp,fp,tn,fn)=>{const d=Math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn));return [d?(tp*tn-fp*fn)/d:null];},
  },

  "ai-reviewer-agreement": {
    category: "Token & AI",
    title: "Binary reviewer agreement|Binäre Prüferübereinstimmung|Ìfaramọ́ olùṣàyẹ̀wò méjì|Binary reviewer agreement",
    description: "Evaluate two reviewers’ agreement and Cohen’s kappa for two labels.|Übereinstimmung zweier Prüfer und Cohens Kappa für zwei Labels berechnen.|Ṣírò ìfaramọ́ olùṣàyẹ̀wò méjì àti kappa Cohen fún àmì méjì.|Work out raw agreement and Cohen’s kappa for two reviewers and two labels.",
    fields: [
      field("kappaBothYes", "Both selected yes|Beide wählten Ja|Méjèèjì yan bẹ́ẹ̀ni|Both chose yes", 0, 1000000000000, true),
      field("kappaFirstYes", "Only first selected yes|Nur erster Prüfer wählte Ja|Àkọ́kọ́ nìkan yan bẹ́ẹ̀ni|Only first chose yes", 0, 1000000000000, true),
      field("kappaSecondYes", "Only second selected yes|Nur zweiter Prüfer wählte Ja|Kejì nìkan yan bẹ́ẹ̀ni|Only second chose yes", 0, 1000000000000, true),
      field("kappaBothNo", "Both selected no|Beide wählten Nein|Méjèèjì yan bẹ́ẹ̀kọ́|Both chose no", 0, 1000000000000, true),
    ],
    outputs: ["Observed agreement (%)|Beobachtete Übereinstimmung (%)|Ìfaramọ́ tí a rí (%)|Observed agreement (%)","Cohen’s kappa|Cohens Kappa|Kappa Cohen|Cohen’s kappa"],
    calculate: (a,b,c,d)=>{const n=a+b+c+d;requireField(n>0,'kappaBothYes');const x=(a+b)/n,y=(a+c)/n,e=x*y+(1-x)*(1-y),o=(a+d)/n;return [100*o,e===1?null:(o-e)/(1-e)];},
  },

  "ai-brier-score": {
    category: "Token & AI",
    title: "Grouped Brier score|Gruppierter Brier-Score|Ìwọ̀n Brier fún ẹgbẹ́|Grouped Brier score",
    description: "Calculate binary forecast error using two groups of predictions with a shared model probability in each group.|Binären Vorhersagefehler aus zwei Gruppen gleicher Modellwahrscheinlichkeit berechnen.|Ṣírò àṣìṣe àsọtẹ́lẹ̀ nínú ẹgbẹ́ méjì tí ọkọọkan ní ìṣeeṣe kan.|Measure prediction error from two batches where each batch has one model probability.",
    fields: [
      field("brierFirstSize", "First group predictions|Vorhersagen in Gruppe eins|Àsọtẹ́lẹ̀ ẹgbẹ́ àkọ́kọ́|First group predictions", 1, 1000000000000, true),
      field("brierFirstProbability", "First group probability (%)|Wahrscheinlichkeit Gruppe eins (%)|Ìṣeeṣe ẹgbẹ́ àkọ́kọ́ (%)|First group probability (%)", 0, 100, false),
      field("brierFirstEvents", "First group actual positives|Positive Ereignisse in Gruppe eins|Rere gidi ẹgbẹ́ àkọ́kọ́|First group actual positives", 0, 1000000000000, true),
      field("brierSecondSize", "Second group predictions|Vorhersagen in Gruppe zwei|Àsọtẹ́lẹ̀ ẹgbẹ́ kejì|Second group predictions", 1, 1000000000000, true),
      field("brierSecondProbability", "Second group probability (%)|Wahrscheinlichkeit Gruppe zwei (%)|Ìṣeeṣe ẹgbẹ́ kejì (%)|Second group probability (%)", 0, 100, false),
      field("brierSecondEvents", "Second group actual positives|Positive Ereignisse in Gruppe zwei|Rere gidi ẹgbẹ́ kejì|Second group actual positives", 0, 1000000000000, true),
    ],
    outputs: ["Brier score|Brier-Score|Ìwọ̀n Brier|Brier score","Observed positive share (%)|Beobachteter Positivanteil (%)|Ìpín rere tí a rí (%)|Observed positive share (%)"],
    calculate: (n,p,a,m,q,b)=>{requireField(a<=n,'brierFirstEvents');requireField(b<=m,'brierSecondEvents');const x=p/100,y=q/100;return [(a*(1-x)**2+(n-a)*x*x+b*(1-y)**2+(m-b)*y*y)/(n+m),100*(a+b)/(n+m)];},
  },

  "ai-retrieval-precision-recall": {
    category: "Token & AI",
    title: "Retrieval precision and recall|Präzision und Sensitivität beim Retrieval|Ìpéye àti ìrántí ìwádìí|Retrieval precision and recall",
    description: "Compare relevant hits with results returned and all known relevant items for one query.|Relevante Treffer mit Abrufmenge und sämtlichen relevanten Elementen vergleichen.|Fi èsì tó yẹ wé gbogbo èsì tí a rí àti gbogbo ohun tó yẹ.|Compare useful hits with returned results and all known relevant items.",
    fields: [
      field("retrievalReturned", "Results returned|Abgerufene Ergebnisse|Èsì tí a rí|Results returned", 1, 1000000000000, true),
      field("retrievalKnownRelevant", "Known relevant items|Bekannte relevante Elemente|Gbogbo ohun tó yẹ|Known relevant items", 1, 1000000000000, true),
      field("retrievalTrueHits", "Relevant hits returned|Relevante Treffer|Èsì tó yẹ tí a rí|Relevant hits returned", 0, 1000000000000, true),
    ],
    outputs: ["Precision at returned count (%)|Präzision der Abrufmenge (%)|Ìpéye èsì (%)|Precision at returned count (%)","Recall at returned count (%)|Sensitivität der Abrufmenge (%)|Ìrántí èsì (%)|Recall at returned count (%)"],
    calculate: (n,r,h)=>{requireField(h<=Math.min(n,r),'retrievalTrueHits');return [100*h/n,100*h/r];},
  },

  "ai-mean-reciprocal-rank": {
    category: "Token & AI",
    title: "Mean reciprocal rank|Mittlerer reziproker Rang|Àárín ìdàkejì ipò|Mean reciprocal rank",
    description: "Average the reciprocal rank of the first relevant hit for three queries. Enter zero when no pertinent result was found.|Reziproken Rang des ersten relevanten Treffers für drei Anfragen mitteln. Null für keinen Treffer eingeben.|Ṣe àárín ìdàkejì ipò èsì àkọ́kọ́ fún ìbéèrè mẹ́ta. Tẹ òdo bí kò bá sí èsì tó yẹ.|Average inverse first-hit rank for three queries. Use zero when nothing relevant came back.",
    fields: [
      field("firstQueryHitRank", "First relevant rank for query one|Erster relevanter Rang bei Anfrage eins|Ipò èsì tó yẹ ìbéèrè àkọ́kọ́|First relevant rank for query one", 0, 1000000000000, true),
      field("secondQueryHitRank", "First relevant rank for query two|Erster relevanter Rang bei Anfrage zwei|Ipò èsì tó yẹ ìbéèrè kejì|First relevant rank for query two", 0, 1000000000000, true),
      field("thirdQueryHitRank", "First relevant rank for query three|Erster relevanter Rang bei Anfrage drei|Ipò èsì tó yẹ ìbéèrè kẹta|First relevant rank for query three", 0, 1000000000000, true),
    ],
    outputs: ["Mean reciprocal rank|Mittlerer reziproker Rang|Àárín ìdàkejì ipò|Mean reciprocal rank","Queries with a hit|Anfragen mit Treffer|Ìbéèrè tó ní èsì|Queries with a hit"],
    calculate: (...r)=>[r.reduce((s,k)=>s+(k?1/k:0),0)/3,r.filter(Boolean).length],
  },

  "ai-caption-word-error": {
    category: "Token & AI",
    title: "Speech recognition word error rate|Wortfehlerrate der Spracherkennung|Ìpín àṣìṣe ọ̀rọ̀|Speech recognition word error rate",
    description: "Calculate word error rate from reference words plus substitutions, deletions and insertions.|Wortfehlerrate aus Referenzwörtern, Ersetzungen, Löschungen und Einfügungen berechnen.|Ṣírò ìpín àṣìṣe láti inú ọ̀rọ̀ ìtọ́kasí, àyípadà, ohun tí a yọ àti tí a fi kún.|Use the reference count and word substitutions, deletions and insertions.",
    fields: [
      field("werReferenceWords", "Reference words|Referenzwörter|Ọ̀rọ̀ ìtọ́kasí|Reference words", 1, 1000000000000, true),
      field("werSubstitutions", "Substitutions|Ersetzungen|Àyípadà ọ̀rọ̀|Substitutions", 0, 1000000000000, true),
      field("werDeletions", "Deletions|Löschungen|Ọ̀rọ̀ tí a yọ|Deletions", 0, 1000000000000, true),
      field("werInsertions", "Insertions|Einfügungen|Ọ̀rọ̀ tí a fi kún|Insertions", 0, 1000000000000, true),
    ],
    outputs: ["Word error rate (%)|Wortfehlerrate (%)|Ìpín àṣìṣe ọ̀rọ̀ (%)|Word error rate (%)","Total edits|Bearbeitungen insgesamt|Àpapọ̀ àtúnṣe|Total word edits"],
    calculate: (n,s,d,i)=>{requireField(s+d<=n,'werDeletions');return [100*(s+d+i)/n,s+d+i];},
  },

  "ai-retrieval-window-count": {
    category: "Token & AI",
    title: "Overlapping document chunks|Überlappende Dokumentabschnitte|Ìpín ìwé tó bò ara wọn|Overlapping document chunks",
    description: "Count windows for one document with an overlapping stride and a final short chunk with no padding.|Fenster eines Dokuments mit Überlappung und kurzem letzten Abschnitt ohne Auffüllung zählen.|Ka àwọn ìpín ìwé tó bò ara wọn pẹ̀lú ìpín ìkẹyìn kékeré láìfikún.|Count chunks with overlap and an unpadded short final chunk.",
    fields: [
      field("documentTotalTokens", "Document tokens|Dokument-Token|Tọ́kẹ́nì inú ìwé|Document tokens", 1, 1000000000000, true),
      field("windowChunkCapacity", "Chunk size (tokens)|Abschnittsgröße (Token)|Ìwọ̀n ìpín (tọ́kẹ́nì)|Chunk size (tokens)", 1, 1000000000000, true),
      field("windowOverlapTokens", "Overlap (tokens)|Überlappung (Token)|Ìbòpọ̀ (tọ́kẹ́nì)|Overlap (tokens)", 0, 1000000000000, true),
    ],
    outputs: ["Chunk count|Abschnittszahl|Iye ìpín|Chunk count","Tokens in final chunk|Token im letzten Abschnitt|Tọ́kẹ́nì ìpín ìkẹyìn|Tokens in final chunk","Tokens emitted including duplicates|Ausgegebene Token inklusive Duplikaten|Gbogbo tọ́kẹ́nì pẹ̀lú àdàkọ|Tokens emitted with duplicates"],
    calculate: (n,c,o)=>{requireField(o<c,'windowOverlapTokens');const chunks=n<=c?1:1+Math.ceil((n-c)/(c-o));return [chunks,n-(chunks-1)*(c-o),n+(chunks-1)*o];},
  },

  "ai-training-optimizer-steps": {
    category: "Token & AI",
    title: "Optimizer steps and batches|Optimierungsschritte und Batches|Ìgbésẹ̀ optimizer àti ìdì|Optimizer steps and batches",
    description: "Count steps per epoch when the last batch is retained and accumulated gradients are flushed at every epoch end.|Schritte je Epoche mit letztem Teilbatch und Abschluss der Gradientenakkumulation zählen.|Ka ìgbésẹ̀ fún epoch pẹ̀lú ìdì ìkẹyìn àti ìkójọ gradient.|Count steps if the partial batch stays and gradients flush at each epoch end.",
    fields: [
      field("trainExamplesPerEpoch", "Examples per epoch|Beispiele pro Epoche|Àpẹẹrẹ fún epoch kan|Examples per epoch", 1, 1000000000000, true),
      field("trainMicroBatch", "Examples per micro-batch|Beispiele je Mikro-Batch|Àpẹẹrẹ nínú ìdì kékeré|Examples per micro-batch", 1, 1000000000000, true),
      field("trainGradAccumulation", "Micro-batches per optimizer step|Mikro-Batches je Optimierungsschritt|Ìdì kékeré fún ìgbésẹ̀ optimizer|Micro-batches per optimizer step", 1, 1000000000000, true),
      field("trainEpochCount", "Epochs|Epochen|Iye epoch|Epochs", 1, 1000000000000, true),
    ],
    outputs: ["Micro-batches per epoch|Mikro-Batches pro Epoche|Ìdì kékeré fún epoch kan|Micro-batches per epoch","Optimizer steps overall|Optimierungsschritte insgesamt|Gbogbo ìgbésẹ̀ optimizer|Total optimizer steps"],
    calculate: (n,b,a,e)=>{const m=Math.ceil(n/b);return [m,Math.ceil(m/a)*e];},
  },

  "ai-inference-concurrency": {
    category: "Token & AI",
    title: "Mean in-flight inference requests|Mittlere parallele Inferenzanfragen|Ìbéèrè inference tó ń lọ ní àárín|Mean in-flight inference requests",
    description: "Estimate mean concurrency from a steady arrival rate and measured mean completion time.|Mittlere Parallelität aus gleichbleibender Anfragerate und mittlerer Dauer schätzen.|Ṣírò ìbéèrè tó ń lọ ní àárín láti inú ìṣàn ìbéèrè àti àkókò ìparí.|Estimate average in-flight requests from steady traffic and average completion time.",
    fields: [
      field("inFlightArrivalRate", "Arrivals per second|Anfragen pro Sekunde|Ìbéèrè ní ìṣẹ́jú-àáyá|Arrivals per second", 0, 1000000000000, false),
      field("inFlightMeanLatency", "Mean completion time (ms)|Mittlere Dauer (ms)|Àkókò ìparí àárín (ms)|Average completion time (ms)", 0, 1000000000000, false),
    ],
    outputs: ["Mean in-flight requests|Mittlere parallele Anfragen|Ìbéèrè tó ń lọ ní àárín|Mean in-flight requests"],
    calculate: (r,m)=>[r*m/1000],
  },

  "ai-latency-slo-budget": {
    category: "Token & AI",
    title: "Request latency error budget|Fehlerbudget für Anfragelatenz|Ààlà àṣìṣe àkókò ìbéèrè|Request latency error budget",
    description: "Count how many slow requests a percentage target allows and how much remains after observed misses.|Zulässige langsame Anfragen und verbleibendes Budget nach beobachteten Verfehlungen bestimmen.|Ka ìbéèrè lọ́ra tó yẹ àti iye tó kù lẹ́yìn ìkùnà tí a rí.|Count slow requests the target allows and how many are left.",
    fields: [
      field("latencyPeriodRequests", "Measured requests|Gemessene Anfragen|Ìbéèrè tí a wọn|Measured requests", 1, 1000000000000, true),
      field("latencyTargetShare", "Requests within target required (%)|Geforderter Anteil im Ziel (%)|Ìpín ìbéèrè tó gbọdọ̀ dé àfojúsùn (%)|Required requests within target (%)", 0, 100, false),
      field("latencyMissedRequests", "Requests over deadline|Anfragen über Frist|Ìbéèrè tó kọjá àkókò|Requests over deadline", 0, 1000000000000, true),
    ],
    outputs: ["Slow requests allowed|Zulässige langsame Anfragen|Ìbéèrè lọ́ra tó yẹ|Allowed slow requests","Remaining budget, signed|Verbleibendes Budget mit Vorzeichen|Ààlà tó kù pẹ̀lú àmì|Remaining budget, signed"],
    calculate: (n,p,m)=>{requireField(m<=n,'latencyMissedRequests');const allowed=n-Math.ceil(n*p/100);return [allowed,allowed-m];},
  },

  "ai-accelerator-hours": {
    category: "Token & AI",
    title: "Accelerator hours and energy|Beschleunigerstunden und Energie|Wákàtí accelerator àti agbára|Accelerator hours and energy",
    description: "Estimate device-hours, energy and compute cost from concurrent devices and metered power.|Gerätestunden, Energie und Rechenkosten aus Gerätezahl und gemessener Leistung schätzen.|Ṣírò wákàtí ẹ̀rọ, agbára àti ináwó láti inú iye ẹ̀rọ àti agbára tí a wọn.|Estimate device hours, energy and compute cost.",
    fields: [
      field("acceleratorDeviceCount", "Accelerators in use|Verwendete Beschleuniger|Iye accelerator tí a lò|Accelerators in use", 1, 1000000000000, true),
      field("acceleratorElapsedHours", "Elapsed runtime (hours)|Laufzeit (Stunden)|Àkókò iṣẹ́ (wákàtí)|Elapsed runtime (hours)", 0, 1000000000000, false),
      field("acceleratorMeanWatts", "Average watts per device|Mittlere Watt pro Gerät|Agbára àárín fún ẹ̀rọ (W)|Average watts per device", 0, 1000000000000, false),
      field("acceleratorPriceHourly", "Price per device-hour|Preis je Gerätestunde|Owó wákàtí ẹ̀rọ kan|Price per device-hour", 0, 1000000000000, false),
    ],
    outputs: ["Device-hours|Gerätestunden|Wákàtí gbogbo ẹ̀rọ|Device-hours","Estimated device energy (kWh)|Geschätzte Geräteenergie (kWh)|Agbára ẹ̀rọ (kWh)|Estimated device energy (kWh)","Estimated compute cost|Geschätzte Rechenkosten|Ináwó ìṣírò|Estimated compute cost"],
    calculate: (d,t,w,p)=>[d*t,d*t*w/1000,d*t*p],
  },

  "ai-quantized-artifact-savings": {
    category: "Token & AI",
    title: "Model artifact storage savings|Speicherersparnis bei Modellartefakten|Ìfipamọ́ ibi ìpamọ́ àwòṣe|Model artifact storage savings",
    description: "Compare measured sizes before and after compression and project savings for retained copies.|Gemessene Größen vor und nach Kompression vergleichen und die Ersparnis je Kopienzahl berechnen.|Fi ìwọ̀n ṣáájú àti lẹ́yìn ìdínkù wé kí o ka àdàkọ.|Compare sizes before and after compression and project savings over kept copies.",
    fields: [
      field("artifactOriginalMb", "Original artifact (MB)|Ursprüngliches Artefakt (MB)|Àwòṣe àkọ́kọ́ (MB)|Original artifact (MB)", 0.000001, 1000000000000, false),
      field("artifactCompressedMb", "Compressed artifact (MB)|Komprimiertes Artefakt (MB)|Àwòṣe tí a dín (MB)|Compressed artifact (MB)", 0.000001, 1000000000000, false),
      field("artifactCopiesRetained", "Copies retained|Aufbewahrte Kopien|Àdàkọ tí a tọ́jú|Copies kept", 1, 1000000000000, true),
    ],
    outputs: ["Size change, signed (MB)|Größenänderung mit Vorzeichen (MB)|Ìyípadà ìwọ̀n pẹ̀lú àmì (MB)|Signed size change (MB)","Storage saved (MB)|Gesparter Speicher (MB)|Ìpamọ́ tí a fipamọ́ (MB)|Storage saved (MB)"],
    calculate: (x,y,n)=>[y-x,(x-y)*n],
  },

  "ai-canary-traffic-count": {
    category: "Token & AI",
    title: "Canary rollout sample size|Stichprobe für Canary-Tests|Iye àpẹẹrẹ ìdánwò canary|Canary rollout sample size",
    description: "Estimate experimental requests and background requests at a fixed traffic rate and rollout split.|Canary- und Basisanfragen bei gleichbleibendem Verkehr und festem Anteil schätzen.|Ṣírò ìbéèrè ìdánwò àti ti ìpìlẹ̀ pẹ̀lú ìṣàn tí kò yí.|Estimate experimental and baseline requests at steady traffic.",
    fields: [
      field("canaryDailyRequests", "Projected requests per day|Erwartete Anfragen pro Tag|Ìbéèrè tí a retí lójoojúmọ́|Expected requests per day", 1, 1000000000000, true),
      field("canaryAllocationPct", "Traffic sent to canary (%)|Verkehr zum Canary (%)|Ìpín ìbéèrè canary (%)|Traffic to canary (%)", 0, 100, false),
      field("canaryObservationDays", "Observation period (days)|Beobachtungszeit (Tage)|Àkókò àkíyèsí (ọjọ́)|Observation period (days)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Expected canary requests|Erwartete Canary-Anfragen|Ìbéèrè canary tí a retí|Expected canary requests","Expected baseline requests|Erwartete Basis-Anfragen|Ìbéèrè ìpìlẹ̀ tí a retí|Expected baseline requests"],
    calculate: (n,p,t)=>[n*t*p/100,n*t*(1-p/100)],
  },

  "ai-token-cache-cost": {
    category: "Token & AI",
    title: "Cached input token cost|Kosten für Input-Token aus Cache|Owó tọ́kẹ́nì láti cache|Cached input token cost",
    description: "Split input tokens into cached and uncached portions and compare the bill with fully uncached inputs.|Eingabetoken in Cache- und Standardanteil teilen und Kosten mit dem Standardpreis vergleichen.|Pín tọ́kẹ́nì sí cache àti èyí tí kò sí, kí o sì fi owó wé.|Split cached and uncached input and compare the bill.",
    fields: [
      field("cacheInputTotalTokens", "Total input tokens|Eingabetoken insgesamt|Gbogbo tọ́kẹ́nì ìwọlé|Total input tokens", 1, 1000000000000, true),
      field("cacheInputHitPct", "Cached token share (%)|Cache-Anteil (%)|Ìpín tọ́kẹ́nì cache (%)|Cached token share (%)", 0, 100, false),
      field("cacheInputStandardPrice", "Standard price per million|Standardpreis pro Million|Owó ìpìlẹ̀ fún mílíọ̀nù|Standard price per million", 0, 1000000000000, false),
      field("cacheInputHitPrice", "Cached price per million|Cache-Preis pro Million|Owó cache fún mílíọ̀nù|Cached price per million", 0, 1000000000000, false),
    ],
    outputs: ["Blended input charge|Gemischte Eingabekosten|Owó ìwọlé pẹ̀lú cache|Combined input charge","Savings versus standard|Ersparnis gegenüber Standardpreis|Ìfipamọ́ owó lórí owó ìpìlẹ̀|Savings versus standard cost"],
    calculate: (n,p,a,b)=>{const h=n*p/100/1e6,u=n/1e6-h;return [u*a+h*b,h*(a-b)];},
  },

  "ai-document-review-coverage": {
    category: "Token & AI",
    title: "Document review capacity|Kapazität für Dokumentprüfung|Agbára àyẹ̀wò ìwé|Document review capacity",
    description: "Calculate full documents that fit in a reviewer time budget and any backlog that remains.|Ganze prüfbare Dokumente im Zeitbudget und verbleibenden Rückstand berechnen.|Ka ìwé tí a lè parí nínú àkókò àti ohun tó kù.|Count whole documents that fit and the backlog left.",
    fields: [
      field("reviewQueuedDocuments", "Documents waiting|Wartende Dokumente|Ìwé tó dúró|Documents waiting", 0, 1000000000000, true),
      field("reviewMeanDocMinutes", "Review time per document (min)|Prüfzeit je Dokument (min)|Àkókò àyẹ̀wò ìwé kan (ìṣẹ́jú)|Review time per document (min)", 0.000001, 1000000000000, false),
      field("reviewBudgetHours", "Combined reviewer hours available|Verfügbare Prüfstunden insgesamt|Gbogbo wákàtí olùṣàyẹ̀wò tó wà|Combined reviewer hours available", 0, 1000000000000, false),
    ],
    outputs: ["Documents completed|Abgeschlossene Dokumente|Ìwé tí a parí|Documents completed","Documents remaining|Verbleibende Dokumente|Ìwé tó kù|Documents remaining"],
    calculate: (n,m,h)=>{const p=Math.min(n,Math.floor(60*h/m));return [p,n-p];},
  },

  "ai-dataset-dedup-yield": {
    category: "Token & AI",
    title: "Dataset deduplication yield|Verbleib nach Deduplizierung|Iye dátà lẹ́yìn yíyọ àdàkọ|Dataset deduplication yield",
    description: "Estimate records and storage after removing duplicate and rejected records as disjoint counts.|Datensätze und Speicher nach Abzug disjunkter Duplikat- und Ausschlussmengen schätzen.|Ṣírò àkọsílẹ̀ àti ibi ìpamọ́ lẹ́yìn yíyọ àdàkọ àti ohun tí a kọ̀.|Estimate records and storage after removing separate duplicate and rejected counts.",
    fields: [
      field("dedupSourceRecords", "Source records|Quelldatensätze|Àkọsílẹ̀ orísun|Source records", 1, 1000000000000, true),
      field("dedupDuplicateRecords", "Duplicate records removed|Entfernte Duplikate|Àdàkọ tí a yọ|Duplicate records removed", 0, 1000000000000, true),
      field("dedupRejectedNonDuplicates", "Other distinct records rejected|Andere abgelehnte Datensätze|Àkọsílẹ̀ míì tí a kọ̀|Other distinct rejected records", 0, 1000000000000, true),
      field("dedupMeanBytesRecord", "Average stored bytes per retained record|Gespeicherte Bytes pro behaltenem Datensatz|Báìtì àárín fún àkọsílẹ̀ tó kù|Average stored bytes per kept record", 0.000001, 1000000000000, false),
    ],
    outputs: ["Records retained|Behaltene Datensätze|Àkọsílẹ̀ tó kù|Records kept","Retention (%)|Verbleib (%)|Ìpín tó kù (%)|Retention (%)","Estimated decimal MB|Geschätzte dezimale MB|MB eleemewa tí a fojú díwọ̀n|Estimated decimal MB"],
    calculate: (n,d,r,b)=>{requireField(d+r<=n,'dedupRejectedNonDuplicates');const k=n-d-r;return [k,100*k/n,k*b/1e6];},
  },

  "ai-api-run-quota": {
    category: "Token & AI",
    title: "Batch API calls and rate floor|Batch-API-Aufrufe und Zeituntergrenze|Ìbéèrè API ìdì àti àkókò tó kéré jù|Batch API calls and rate floor",
    description: "Convert item count to whole batch calls and estimate a sustained-rate processing time, excluding service latency.|Einträge in ganze Batch-Aufrufe umrechnen und Dauer ohne Dienstlatenz schätzen.|Yí iye ohun padà sí ìbéèrè odidi, kí o ṣírò àkókò láìka ìdúró iṣẹ́.|Count full API calls and estimate from steady rate, without service latency.",
    fields: [
      field("apiBatchItems", "Items to send|Zu sendende Einträge|Ohun tí a fẹ́ rán|Items to send", 1, 1000000000000, true),
      field("apiItemsEachRequest", "Items per batch request|Einträge je Batch-Anfrage|Ohun fún ìbéèrè kan|Items per batch request", 1, 1000000000000, true),
      field("apiRateLimit", "Sustained calls per minute|Anhaltende Aufrufe pro Minute|Ìbéèrè fún ìṣẹ́jú kan|Sustained calls per minute", 0.000001, 1000000000000, false),
    ],
    outputs: ["API calls needed|Benötigte API-Aufrufe|Ìbéèrè API tí a nílò|API calls needed","Sustained-rate time (min)|Zeit bei Dauerrate (min)|Àkókò ní ìṣàn dúró (ìṣẹ́jú)|Time at sustained rate (min)"],
    calculate: (n,b,r)=>{const c=Math.ceil(n/b);return [c,c/r];},
  },

  "ai-model-error-change": {
    category: "Token & AI",
    title: "Model error change|Änderung der Modellfehlerrate|Ìyípadà àṣìṣe àwòṣe|Model error change",
    description: "Compare baseline and candidate error counts on the same number of evaluation cases.|Fehler von Basis- und Kandidatenmodell bei gleicher Testfallzahl vergleichen.|Fi àṣìṣe àwòṣe ìpìlẹ̀ wé ti tuntun pẹ̀lú iye àpẹẹrẹ kan náà.|Compare baseline and candidate errors on the same number of cases.",
    fields: [
      field("evalComparisonCases", "Evaluation cases per model|Testfälle je Modell|Iye àpẹẹrẹ ìdánwò fún àwòṣe kan|Evaluation cases per model", 1, 1000000000000, true),
      field("evalBaselineErrors", "Baseline errors|Fehler des Basismodells|Àṣìṣe àwòṣe ìpìlẹ̀|Baseline errors", 0, 1000000000000, true),
      field("evalCandidateErrors", "Candidate errors|Fehler des Kandidaten|Àṣìṣe àwòṣe tuntun|Candidate errors", 0, 1000000000000, true),
    ],
    outputs: ["Candidate error (%)|Fehlerrate des Kandidaten (%)|Ìpín àṣìṣe àwòṣe tuntun (%)|Candidate error (%)","Error percentage-point change|Fehleränderung in Prozentpunkten|Ìyípadà àṣìṣe ní ojúami ìpín|Error change in percentage points","Relative error reduction (%)|Relative Fehlerreduktion (%)|Ìdínkù àṣìṣe ní ìbátan (%)|Relative error reduction (%)"],
    calculate: (n,a,b)=>{requireField(a<=n,'evalBaselineErrors');requireField(b<=n,'evalCandidateErrors');return [100*b/n,100*(b-a)/n,a?100*(a-b)/a:null];},
  },
};
