import "./company-footer.css";

const COPY={
  en:{help:"Help & docs",links:"Company links",copyright:"HEPHZIBAH BEHULAH",dialog:"Using AdigunTokenCalculator",intro:"Choose a tool from the directory, enter values in its form, and select Calculate. Tokenization and calculator work run locally in your browser. Adigun BOT is optional and sends only chat you type after consent.",close:"Close",website:"Website",facebook:"Facebook",x:"X",instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn"},
  de:{help:"Hilfe & Dokumentation",links:"Unternehmenslinks",copyright:"HEPHZIBAH BEHULAH",dialog:"AdigunTokenCalculator verwenden",intro:"Wähle ein Werkzeug aus dem Verzeichnis, trage Werte ein und wähle Berechnen. Tokenisierung und Berechnungen laufen lokal im Browser. Adigun BOT ist optional und sendet nur Chatnachrichten, denen du zustimmst.",close:"Schließen",website:"Website",facebook:"Facebook",x:"X",instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn"},
  yo:{help:"Ìrànlọ́wọ́ àti ìwé ìtọ́nisọ́nà",links:"Àwọn ìjápọ́ ilé-iṣẹ́",copyright:"HEPHZIBAH BEHULAH",dialog:"Lílò AdigunTokenCalculator",intro:"Yan irinṣẹ́ kan nínú àkójọ, tẹ àwọn iye rẹ̀ sí fọ́ọ̀mù, kí o sì yan Ṣe iṣirò. Tokenization àti iṣirò máa ń ṣiṣẹ́ lórí ẹ̀rọ rẹ. Adigun BOT jẹ́ àṣàyàn, ó sì ń fi ìwiregbe tí o fọwọ́ sí nìkan ránṣẹ́.",close:"Pa dé",website:"Ojúlé ayelujara",facebook:"Facebook",x:"X",instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn"},
  pcm:{help:"Help & docs",links:"Company links",copyright:"HEPHZIBAH BEHULAH",dialog:"How to use AdigunTokenCalculator",intro:"Choose tool from the directory, enter your values, then press Calculate. Token and calculator work run for your browser. Adigun BOT na optional; e go send only chat wey you agree to send.",close:"Close",website:"Website",facebook:"Facebook",x:"X",instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn"},
};
const LINKS=[
  ["website","https://hephzibahbehulah.com/"],
  ["facebook","https://www.facebook.com/Hephzibahbehulah/"],
  ["x","https://x.com/HephzibaBehulah"],
  ["instagram","https://www.instagram.com/hephzibahbehulah/"],
  ["tiktok","https://www.tiktok.com/@hephzibahbhehulah"],
  ["linkedin","https://www.linkedin.com/in/isaacoluwoleadigun/"],
];

export function mountCompanyFooter(){
  const footer=document.querySelector("footer");if(!footer)return null;
  const row=document.createElement("div");row.className="corporate-footer";
  const help=document.createElement("button");help.type="button";help.className="corporate-footer-help";
  const nav=document.createElement("nav");nav.className="corporate-footer-links";
  const copyright=document.createElement("span");copyright.className="corporate-footer-copyright";
  row.append(help,nav,copyright);footer.append(row);
  const dialog=document.createElement("dialog");dialog.className="corporate-help-dialog";dialog.innerHTML=`<h2 data-title></h2><p data-copy></p><button type="button" data-close></button>`;document.body.append(dialog);
  const close=dialog.querySelector("[data-close]");help.addEventListener("click",()=>dialog.showModal());close.addEventListener("click",()=>dialog.close());
  function update(locale){const text=COPY[locale]||COPY.en;help.textContent=text.help;help.setAttribute("aria-label",text.help);nav.setAttribute("aria-label",text.links);nav.replaceChildren();for(const [key,url] of LINKS){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=text[key];a.setAttribute("aria-label",text[key]);nav.append(a);}copyright.textContent=`© ${new Date().getFullYear()} ${text.copyright}`;dialog.querySelector("[data-title]").textContent=text.dialog;dialog.querySelector("[data-copy]").textContent=text.intro;close.textContent=text.close;}
  update(document.querySelector("#language")?.value||"en");
  document.querySelector("#language")?.addEventListener("change",event=>update(event.target.value));
  return row;
}
