import "./product-bot.css";

const COPY = {
  en: { title:"Adigun BOT",open:"Open Adigun BOT",close:"Close Adigun BOT",intro:"Ask how to use the tools or understand their results. The copilot cannot see your calculator or work.",privacy:"Messages you send are processed by Cloudflare AI. Do not send calculator inputs, private text, passwords or personal details.",consent:"I agree to send my typed chat messages to Cloudflare AI.",send:"Send",placeholder:"Ask about a tool…",thinking:"Thinking…",error:"Adigun BOT is unavailable right now. Try again shortly.",clear:"Clear chat",language:"Copilot language",message:"Chat message",unavailable:"Check the privacy box before sending."},
  de: { title:"Adigun BOT",open:"Adigun BOT öffnen",close:"Adigun BOT schließen",intro:"Frage, wie die Werkzeuge funktionieren oder wie Ergebnisse zu verstehen sind. Der Copilot sieht deinen Rechner oder deine Arbeit nicht.",privacy:"Deine Nachrichten werden von Cloudflare AI verarbeitet. Sende keine Rechnereingaben, privaten Texte, Passwörter oder persönlichen Daten.",consent:"Ich stimme zu, meine eingegebenen Chatnachrichten an Cloudflare AI zu senden.",send:"Senden",placeholder:"Frage zu einem Werkzeug…",thinking:"Denkt nach…",error:"Adigun BOT ist gerade nicht verfügbar. Bitte später erneut versuchen.",clear:"Chat leeren",language:"Sprache des Copiloten",message:"Chatnachricht",unavailable:"Bestätige zuerst den Datenschutzhinweis."},
  yo: { title:"Adigun BOT",open:"Ṣí Adigun BOT",close:"Pa Adigun BOT",intro:"Beere bi a ṣe n lo àwọn irinṣẹ́ tàbí bi a ṣe le lóye abajade wọn. Oluranlọwọ ko le ri iṣiro tabi iṣẹ rẹ.",privacy:"Cloudflare AI yoo ṣe ilana awọn ifiranṣẹ ti o firanṣẹ. Ma ṣe firanṣẹ data iṣiro, ọrọ ikọkọ, ọrọigbaniwọle tabi alaye ara ẹni.",consent:"Mo gba lati fi awọn ifiranṣẹ iwiregbe ti mo tẹ ranṣẹ si Cloudflare AI.",send:"Firanṣẹ",placeholder:"Beere nipa irinṣẹ kan…",thinking:"N ronu…",error:"Adigun BOT ko si lọwọlọwọ. Gbiyanju lẹẹkansi nigbamii.",clear:"Pa iwiregbe rẹ",language:"Èdè oluranlọwọ",message:"Ifiranṣẹ iwiregbe",unavailable:"Jọwọ gba si asiri kí o tó firanṣẹ."},
  pcm: { title:"Adigun BOT",open:"Open Adigun BOT",close:"Close Adigun BOT",intro:"Ask how to use the tools or understand the result. The copilot no fit see your calculator or work.",privacy:"Cloudflare AI go process messages wey you send. No send calculator input, private text, password or personal details.",consent:"I agree make Cloudflare AI process the chat messages wey I type.",send:"Send",placeholder:"Ask about one tool…",thinking:"E dey think…",error:"Adigun BOT no dey available now. Try again small time.",clear:"Clear chat",language:"Copilot language",message:"Chat message",unavailable:"Agree to the privacy note before you send."},
};

export function mountProductBot() {
  const root = document.createElement("section");
  root.className = "token-bot";
  root.innerHTML = `<button class="token-bot-launch" type="button" aria-expanded="false" aria-controls="token-bot-panel"></button><aside class="token-bot-panel" id="token-bot-panel" hidden aria-label="Adigun BOT"><div class="token-bot-head"><strong data-title role="heading" aria-level="2"></strong><label><span class="sr-only" data-language-label></span><select data-language><option value="en">English</option><option value="de">Deutsch</option><option value="yo">Yorùbá</option><option value="pcm">Nigerian Pidgin</option></select></label><button type="button" data-close aria-label="Close">×</button></div><p data-intro></p><div class="token-bot-log" role="log" aria-live="polite" aria-relevant="additions text"></div><small data-privacy></small><form><label class="token-bot-consent"><input type="checkbox" required data-consent><span data-consent-copy></span></label><label class="sr-only" for="token-bot-input" data-input-label></label><textarea id="token-bot-input" rows="2" maxlength="1500" required></textarea><div class="token-bot-actions"><button type="button" data-clear></button><button type="button" data-send></button></div></form></aside>`;
  document.body.append(root);

  const launcher=root.querySelector(".token-bot-launch"),panel=root.querySelector(".token-bot-panel"),select=root.querySelector("[data-language]"),log=root.querySelector(".token-bot-log"),input=root.querySelector("textarea"),form=root.querySelector("form"),consent=root.querySelector("[data-consent]"),sendButton=root.querySelector("[data-send]");
  let language=document.querySelector("#language")?.value||"en",messages=[],busy=false;
  const copy=()=>COPY[language]||COPY.en;
  function updateCopy(){const words=copy();launcher.textContent=words.title;launcher.setAttribute("aria-label",panel.hidden?words.open:words.close);root.querySelector("[data-title]").textContent=words.title;root.querySelector("[data-intro]").textContent=words.intro;root.querySelector("[data-privacy]").textContent=words.privacy;root.querySelector("[data-consent-copy]").textContent=words.consent;root.querySelector("[data-language-label]").textContent=words.language;root.querySelector("[data-input-label]").textContent=words.message;root.querySelector("[data-send]").textContent=words.send;root.querySelector("[data-clear]").textContent=words.clear;input.placeholder=words.placeholder;select.value=language;}
  function bubble(role,text){const node=document.createElement("p");node.className=`token-bot-message ${role}`;node.textContent=text;log.append(node);log.scrollTop=log.scrollHeight;return node;}
  function toggle(open){panel.hidden=!open;launcher.setAttribute("aria-expanded",String(open));updateCopy();if(open)input.focus();else launcher.focus();}
  launcher.addEventListener("click",()=>toggle(panel.hidden));
  root.querySelector("[data-close]").addEventListener("click",()=>toggle(false));
  panel.addEventListener("keydown",event=>{if(event.key==="Escape")toggle(false);});
  select.addEventListener("change",()=>{language=COPY[select.value]?select.value:"en";updateCopy();});
  document.querySelector("#language")?.addEventListener("change",event=>{language=COPY[event.target.value]?event.target.value:"en";updateCopy();});
  root.querySelector("[data-clear]").addEventListener("click",()=>{messages=[];log.replaceChildren();consent.checked=false;input.focus();});
  updateCopy();

  async function send(){
    const text=input.value.trim();if(!text||busy)return;if(!consent.checked){bubble("assistant",copy().unavailable);return;}
    busy=true;input.value="";messages.push({role:"user",content:text});bubble("user",text);const answer=bubble("assistant",copy().thinking);sendButton.disabled=true;
    try{const response=await fetch("/api/bot",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({messages:messages.slice(-8),language})});if(!response.ok)throw new Error("unavailable");const payload=await response.json();if(typeof payload.answer!=="string"||!payload.answer.trim())throw new Error("empty-response");answer.textContent=payload.answer;messages.push({role:"assistant",content:payload.answer});messages=messages.slice(-8);}
    catch{answer.textContent=copy().error;messages.pop();}
    finally{busy=false;sendButton.disabled=false;input.focus();}
  }
  sendButton.addEventListener("click",send);
  input.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();send();}});
  form.addEventListener("submit",event=>{event.preventDefault();send();});
  return root;
}

