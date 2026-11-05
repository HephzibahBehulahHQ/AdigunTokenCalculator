export function formatNumber(n,locale="en",d=3,preserveSmall=false){
  const value=Number(n);
  if(!Number.isFinite(value))throw Error("number");
  const options=preserveSmall&&value!==0&&Math.abs(value)<0.5*10**(-d)
    ?{notation:"scientific",maximumSignificantDigits:8}
    :{maximumFractionDigits:d};
  return value.toLocaleString(locale,options);
}
