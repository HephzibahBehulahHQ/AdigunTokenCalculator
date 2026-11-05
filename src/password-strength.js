import zxcvbn from "zxcvbn";

export function scorePassword(value){
  if(typeof value!=="string"||value.length===0)throw Error("number");
  let length=0;
  for(const point of value){
    if(++length>128)throw Error("number");
  }
  const estimate=zxcvbn(value);
  // Discard the library's password and matched tokens; expose estimates only.
  return {
    score:estimate.score,
    guessesLog10:estimate.guesses_log10,
    patterns:[...new Set(estimate.sequence.map(match=>match.pattern))]
  };
}
