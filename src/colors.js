// sRGB/HSL model: https://www.w3.org/TR/css-color-4/#hsl-to-rgb
// Form inputs deliberately reject out-of-range values instead of CSS clamping.
function numeric(value){
  if(typeof value!=="number"&&typeof value!=="string")throw Error("number");
  if(typeof value==="string"&&!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))throw Error("number");
  const number=Number(value);
  if(!Number.isFinite(number))throw Error("number");
  return number;
}

export function rgbToHex(r,g,b){
  const channels=[r,g,b].map(numeric);
  if(channels.some(value=>!Number.isInteger(value)||value<0||value>255))throw Error("number");
  return "#"+channels.map(value=>value.toString(16).padStart(2,"0")).join("").toUpperCase();
}

export function normalizeHexColor(value){
  if(typeof value!=="string")throw Error("number");
  const match=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if(!match)throw Error("number");
  const digits=match[1].length===3?[...match[1]].map(char=>char+char).join(""):match[1];
  return "#"+digits.toUpperCase();
}

export function hslToHex(h,s,l){
  [h,s,l]=[h,s,l].map(numeric);
  if(h<0||h>360||s<0||s>100||l<0||l>100)throw Error("number");
  s/=100;l/=100;
  const sector=(h===360?0:h)/60;
  const chroma=(1-Math.abs(2*l-1))*s;
  const secondary=chroma*(1-Math.abs(sector%2-1));
  const channels=sector<1?[chroma,secondary,0]:sector<2?[secondary,chroma,0]:
    sector<3?[0,chroma,secondary]:sector<4?[0,secondary,chroma]:
    sector<5?[secondary,0,chroma]:[chroma,0,secondary];
  const offset=l-chroma/2;
  // Round once when quantizing sRGB channels to eight-bit HEX values.
  return rgbToHex(...channels.map(value=>Math.round((value+offset)*255)));
}
