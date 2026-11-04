import test from "node:test";
import assert from "node:assert/strict";
import {I} from "../src/i18n.js";
import "../src/copy.js";
const requiredFields=["text","encoding","a","b","op","value","direction","birth","weight","height","mode","total","shares","minutes","sessions","years","cash","gold","silver","investments","rate","lat","lon","group","from","to","principal","annualRate","term","start","end","grades","distance","efficiency","price","time","cycle","buffer","weightImperial","heightImperial"];
const requiredOptions=["add","subtract","multiply","divide","power","sqrt","c","f","of","as","change","bed","wake","length","mass","volume","area","speed","digital","modulo","sin","cos","tan","log","ln","factorial","metric","imperial"];
test("all 18 tools have names, groups and descriptions in all four locales",()=>{for(const locale of ["en","de","yo","pcm"]){assert.equal(I[locale].names.length,18,locale);assert.equal(I[locale].groups.length,18,locale);assert.equal(I[locale].descriptions.length,18,locale);assert.ok(I[locale].descriptions.every(Boolean),locale);}});
test("all calculator form labels and select options are translated",()=>{for(const locale of ["en","de","yo","pcm"]){for(const key of requiredFields)assert.ok(I[locale].fields[key],locale+":"+key);for(const key of requiredOptions)assert.ok(I[locale].options[key],locale+":"+key);}});

test("completion milestone controls are labelled in every locale",()=>{for(const locale of ["en","de","yo","pcm"]){for(const key of ["mpgType","distanceMiles","mpg","priceGallon","percentCredit"])assert.ok(I[locale].fields[key],locale+":"+key);for(const key of ["difference","annual","metric","imperial","us","uk"])assert.ok(I[locale].options[key],locale+":"+key);for(const key of ["copyIds","copyText","clear","useLocation","liveTokens","worldWithheld","gpaAssumption","gpaPercentageAssumption"])assert.ok(I[locale][key],locale+":"+key);}});

test("new result labels are translated in every locale",()=>{for(const locale of ["en","de","yo","pcm"])for(const key of ["Estimated population","Estimated net change per day","Reference baseline","Daily average minutes","Countdown status","Next occurrence","Days until event","Weighted percentage average","Fuel units","Applied rate","Compass direction"])assert.ok(I[locale].outputs[key],locale+":"+key);});
