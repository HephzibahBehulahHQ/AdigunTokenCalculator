import {I} from "./i18n.js";
import "./copy.js";
import "./additional-i18n.js";
import {RESULT_COPY,RESULT_LABELS} from "./result-i18n.js";

const features={
  en:{
    fields:{
      colorMode:"Input colour format",
      red:"Red (0–255)",green:"Green (0–255)",blue:"Blue (0–255)",
      hue:"Hue (degrees, 0–360)",saturation:"Saturation (%)",lightness:"Lightness (%)",
      passwordMode:"Password action",passwordInput:"Password to check (up to 128 characters)"
    },
    options:{
      "colorMode:hex":"Enter HEX","colorMode:rgb":"Enter RGB","colorMode:hsl":"Enter HSL",
      "passwordMode:generate":"Generate password","passwordMode:check":"Check password strength"
    },
    copy:{
      strength0:"Very weak",strength1:"Weak",strength2:"Moderate",strength3:"Strong",strength4:"Very strong",
      pattern_bruteforce:"Characters without a recognised pattern",
      pattern_dictionary:"Words, names or common passwords",
      pattern_spatial:"Keyboard patterns",
      pattern_repeat:"Repeated characters or groups",
      pattern_sequence:"Ordered sequences",
      pattern_regex:"Recognised text patterns",
      pattern_date:"Dates",pattern_other:"Other patterns",
      passwordStrengthNotice:"This strength score is an estimate, not a security guarantee. The app analyses your password in this browser without storing or sending it."
    },
    labels:{StrengthScore:"Strength score",DetectedPatterns:"Detected patterns"},
    passwordName:"Password generator & strength checker",
    passwordDescription:"Generate a random password or estimate an existing password's strength. Everything runs locally in this browser.",
    colorDescription:"Convert between HEX, RGB and HSL in any direction and calculate WCAG contrast ratios."
  },
  de:{
    fields:{
      colorMode:"Eingabeformat der Farbe",
      red:"Rot (0–255)",green:"Grün (0–255)",blue:"Blau (0–255)",
      hue:"Farbton (Grad, 0–360)",saturation:"Sättigung (%)",lightness:"Helligkeit (%)",
      passwordMode:"Passwortaktion",passwordInput:"Passwort zur Prüfung (max. 128 Zeichen)"
    },
    options:{
      "colorMode:hex":"HEX eingeben","colorMode:rgb":"RGB eingeben","colorMode:hsl":"HSL eingeben",
      "passwordMode:generate":"Passwort erstellen","passwordMode:check":"Passwortstärke prüfen"
    },
    copy:{
      strength0:"Sehr schwach",strength1:"Schwach",strength2:"Mittel",strength3:"Stark",strength4:"Sehr stark",
      pattern_bruteforce:"Zeichen ohne erkanntes Muster",
      pattern_dictionary:"Wörter, Namen oder häufige Passwörter",
      pattern_spatial:"Tastaturmuster",
      pattern_repeat:"Wiederholte Zeichen oder Zeichengruppen",
      pattern_sequence:"Geordnete Zeichenfolgen",
      pattern_regex:"Bekannte Zeichenmuster",
      pattern_date:"Datumsangaben",pattern_other:"Sonstige Muster",
      passwordStrengthNotice:"Die Stärke ist eine Schätzung und keine Sicherheitsgarantie. Die App prüft Ihr Passwort in diesem Browser, ohne es zu speichern oder zu übertragen."
    },
    labels:{StrengthScore:"Stärkebewertung",DetectedPatterns:"Erkannte Muster"},
    passwordName:"Passwortgenerator & Stärkeprüfung",
    passwordDescription:"Ein zufälliges Passwort erstellen oder die Stärke eines vorhandenen Passworts schätzen. Alles läuft lokal in diesem Browser.",
    colorDescription:"HEX, RGB und HSL gegenseitig umrechnen und WCAG-Kontrastverhältnisse berechnen."
  },
  yo:{
    fields:{
      colorMode:"Ọ̀nà tí a fi ń tẹ àwọ̀ sílẹ̀",
      red:"Pupa (0–255)",green:"Àwọ̀ ewé (0–255)",blue:"Búlúù (0–255)",
      hue:"Irú àwọ̀ (0–360°)",saturation:"Bí àwọ̀ ṣe jinlẹ̀ (%)",lightness:"Bí àwọ̀ ṣe mọ́lẹ̀ (%)",
      passwordMode:"Iṣẹ́ ọ̀rọ̀ aṣínà",passwordInput:"Ọ̀rọ̀ aṣínà láti ṣàyẹ̀wò (kò ju àmì 128 lọ)"
    },
    options:{
      "colorMode:hex":"Tẹ HEX sílẹ̀","colorMode:rgb":"Tẹ RGB sílẹ̀","colorMode:hsl":"Tẹ HSL sílẹ̀",
      "passwordMode:generate":"Ṣẹ̀dá ọ̀rọ̀ aṣínà","passwordMode:check":"Ṣàyẹ̀wò agbára ọ̀rọ̀ aṣínà"
    },
    copy:{
      strength0:"Kò lágbára rárá",strength1:"Kò lágbára tó",strength2:"Agbára rẹ̀ wà ní àárín",strength3:"Ó lágbára",strength4:"Ó lágbára gan-an",
      pattern_bruteforce:"Àwọn àmì tí kò ní àpẹẹrẹ tí a mọ̀",
      pattern_dictionary:"Ọ̀rọ̀, orúkọ tàbí ọ̀rọ̀ aṣínà tí a sábà máa ń lò",
      pattern_spatial:"Àpẹẹrẹ lórí pátákó ìtẹ̀wé",
      pattern_repeat:"Àwọn àmì tàbí ẹgbẹ́ àmì tó ń tún ara wọn ṣe",
      pattern_sequence:"Àwọn àmì tó tẹ̀lé ara wọn",
      pattern_regex:"Àpẹẹrẹ ọ̀rọ̀ tí a mọ̀",
      pattern_date:"Ọjọ́",pattern_other:"Àwọn àpẹẹrẹ mìíràn",
      passwordStrengthNotice:"Àfojúsùn ni ìwọ̀n agbára yìí; kò ṣe ìdánilójú ààbò. Ìṣàfilọ́lẹ̀ yìí ń ṣàyẹ̀wò ọ̀rọ̀ aṣínà rẹ nínú aṣàwákiri yìí láìfi pamọ́ tàbí ránṣẹ́ sí ibòmíràn."
    },
    labels:{StrengthScore:"Ìwọ̀n agbára",DetectedPatterns:"Àwọn àpẹẹrẹ tí a rí"},
    passwordName:"Ìṣẹ̀dá àti àyẹ̀wò agbára ọ̀rọ̀ aṣínà",
    passwordDescription:"Ṣẹ̀dá ọ̀rọ̀ aṣínà tuntun tàbí ṣàyẹ̀wò agbára èyí tó wà tẹ́lẹ̀; gbogbo rẹ̀ ń ṣiṣẹ́ nínú aṣàwákiri rẹ.",
    colorDescription:"Yí àwọ̀ padà láàárín HEX, RGB àti HSL ní ọ̀nà èyíkéyìí, kí o sì ṣírò ìpín ìyàtọ̀ ìmọ́lẹ̀ gẹ́gẹ́ bí WCAG."
  },
  pcm:{
    fields:{
      colorMode:"Colour format wey you wan enter",
      red:"Red (0–255)",green:"Green (0–255)",blue:"Blue (0–255)",
      hue:"Hue (degrees, 0–360)",saturation:"Saturation (%)",lightness:"Lightness (%)",
      passwordMode:"Wetin you wan do with password",passwordInput:"Password to check (no pass 128 characters)"
    },
    options:{
      "colorMode:hex":"Enter HEX","colorMode:rgb":"Enter RGB","colorMode:hsl":"Enter HSL",
      "passwordMode:generate":"Generate password","passwordMode:check":"Check how strong password be"
    },
    copy:{
      strength0:"E weak well well",strength1:"E weak",strength2:"E dey average",strength3:"E strong",strength4:"E strong well well",
      pattern_bruteforce:"Characters wey no match known pattern",
      pattern_dictionary:"Words, names or common passwords",
      pattern_spatial:"Keyboard patterns",
      pattern_repeat:"Characters or groups wey repeat",
      pattern_sequence:"Characters wey follow each other in order",
      pattern_regex:"Text patterns wey we recognise",
      pattern_date:"Dates",pattern_other:"Other patterns",
      passwordStrengthNotice:"This strength score na estimate; e no guarantee security. The app checks your password for this browser without storing or sending am anywhere."
    },
    labels:{StrengthScore:"Strength score",DetectedPatterns:"Patterns wey we find"},
    passwordName:"Password generator & strength checker",
    passwordDescription:"Generate random password or estimate how strong your password be. Everything run for this browser.",
    colorDescription:"Convert colour from any of HEX, RGB or HSL to the others, and calculate WCAG contrast ratio."
  }
};

for(const locale of ["en","de","yo","pcm"]){
  const feature=features[locale];
  I[locale].thirdPartyNotices={en:"Third-party notices",de:"Hinweise zu Drittanbietern",yo:"Àwọn àkíyèsí ẹnikẹta",pcm:"Third-party notices"}[locale];
  Object.assign(I[locale].fields,feature.fields);
  Object.assign(I[locale].options,feature.options);
  Object.assign(RESULT_COPY[locale],feature.copy);
  Object.assign(RESULT_LABELS[locale],feature.labels);
  I[locale].names[28]=feature.passwordName;
  I[locale].descriptions[28]=feature.passwordDescription;
  I[locale].descriptions[32]=feature.colorDescription;
}


const formulaFeatures={
  en:{
    option:"A% of B",
    engineeringPercentNotice:"A is the first number (percentage); B is the second number (base). Result = A × B / 100.",
    loanVariables:"M = monthly payment; P = principal; r = annual rate (%) / 1200; n = term (years) × 12. Payments are due at the end of each month. No fees or extra payments are included.",
    labels:{LoanFormula:"Payment formula",NumberOfPayments:"Number of monthly payments"}
  },
  de:{
    option:"A % von B",
    engineeringPercentNotice:"A ist die erste Zahl (Prozentsatz), B die zweite Zahl (Grundwert). Ergebnis = A × B / 100.",
    loanVariables:"M = Monatsrate; P = Kreditbetrag; r = Jahreszins (%) / 1200; n = Laufzeit (Jahre) × 12. Die Zahlungen erfolgen am Monatsende. Gebühren und Sondertilgungen sind nicht enthalten.",
    labels:{LoanFormula:"Ratenformel",NumberOfPayments:"Anzahl der Monatsraten"}
  },
  yo:{
    option:"A% nínú B",
    engineeringPercentNotice:"A ni nọ́ńbà àkọ́kọ́ (ìpín ọgọ́rùn-ún); B ni nọ́ńbà kejì (iye ìpìlẹ̀). Àbájáde = A × B / 100.",
    loanVariables:"M = ìsanwó oṣooṣù; P = owó awin; r = ìwọ̀n èrè ọdún (%) / 1200; n = àkókò awin (ọdún) × 12. Ìsanwó wá ní òpin oṣù kọ̀ọ̀kan. A kò fi owó iṣẹ́ tàbí àfikún ìsanwó kún un.",
    labels:{LoanFormula:"Àgbékalẹ̀ ìsanwó",NumberOfPayments:"Iye ìsanwó oṣooṣù"}
  },
  pcm:{
    option:"A% of B",
    engineeringPercentNotice:"A na first number (percentage); B na second number (base value). Result = A × B / 100.",
    loanVariables:"M = monthly payment; P = loan amount; r = yearly rate (%) / 1200; n = loan term (years) × 12. Payment dey due for end of each month. E no include fees or extra payments.",
    labels:{LoanFormula:"Payment formula",NumberOfPayments:"Number of monthly payments"}
  }
};
for(const [locale,feature] of Object.entries(formulaFeatures)){
  I[locale].options["op:percentOf"]=feature.option;
  RESULT_COPY[locale].engineeringPercentNotice=feature.engineeringPercentNotice;
  RESULT_COPY[locale].loanVariables=feature.loanVariables;
  Object.assign(RESULT_LABELS[locale],feature.labels);
}

const percentageRatioCopy={
  "en": "A is the first number (part); B is the second number (whole). Result = A / B × 100%. B must not be zero.",
  "de": "A ist die erste Zahl (Teil), B die zweite Zahl (Ganzes). Ergebnis = A / B × 100 %. B darf nicht null sein.",
  "yo": "A ni nọ́ńbà àkọ́kọ́ (apá); B ni nọ́ńbà kejì (àpapọ̀). Àbájáde = A / B × 100%. B kò gbọdọ̀ jẹ́ òdo.",
  "pcm": "A na first number (part); B na second number (whole). Result = A / B × 100%. B no fit be zero."
};
for(const [locale,copy] of Object.entries(percentageRatioCopy))RESULT_COPY[locale].percentageRatioNotice=copy;
