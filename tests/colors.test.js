import test from "node:test";
import assert from "node:assert/strict";
import {rgbToHex,hslToHex,normalizeHexColor} from "../src/colors.js";
import {parseHexColor,rgbToHsl} from "../src/additional.js";

test("HEX normalization expands short notation and preserves channel values",()=>{
  for(const [input,expected] of [["abc","#AABBCC"],["#09f","#0099FF"],[" aBc123 ","#ABC123"],["#000000","#000000"],["FFF","#FFFFFF"]]){
    assert.equal(normalizeHexColor(input),expected);
    assert.equal(normalizeHexColor(expected),expected);
  }
  for(const value of [""," ","#12","#abcd","12345","1234567","#12345678","#ggg","##abc","# abc","rgb(0,0,0)",null,undefined,123,[],{}])assert.throws(()=>normalizeHexColor(value),/number/);
});

test("RGB accepts numeric form values and serializes eight-bit sRGB",()=>{
  // W3C CSS Color 4 named-color table: rebeccapurple = (102,51,153).
  assert.equal(rgbToHex("102","51","153"),"#663399");
  assert.equal(rgbToHex(0,0,0),"#000000");
  assert.equal(rgbToHex(255,255,255),"#FFFFFF");
  assert.equal(rgbToHex(" 2.55e2 ","+16.0","0"),"#FF1000");
  assert.equal(rgbToHex(1,2,15),"#01020F");
});

test("RGB rejects empty, nonfinite, nonnumeric, fractional and out-of-range channels",()=>{
  for(const invalid of [""," ",null,undefined,false,[],{},NaN,Infinity,-Infinity,-1,256,1.5,"1.5","12x","0x10","1_0"]){
    for(let index=0;index<3;index++){
      const channels=[0,0,0];channels[index]=invalid;
      assert.throws(()=>rgbToHex(...channels),/number/);
    }
  }
});

test("HSL covers all hue sectors, wrap boundary, black, white and achromatic colors",()=>{
  // CSS Color 4 §7 gives blue as hsl(240 100% 50%) and yellow as hsl(60 100% 50%).
  const wheel=[[0,"#FF0000"],[60,"#FFFF00"],[120,"#00FF00"],[180,"#00FFFF"],[240,"#0000FF"],[300,"#FF00FF"],[360,"#FF0000"]];
  for(const [hue,hex] of wheel)assert.equal(hslToHex(hue,100,50),hex);
  for(const hue of [0,17.5,180,359.99,360]){
    assert.equal(hslToHex(hue,100,0),"#000000");
    assert.equal(hslToHex(hue,100,100),"#FFFFFF");
    assert.equal(hslToHex(hue,0,50),"#808080");
  }
  assert.equal(hslToHex(" 240 ","100","50"),"#0000FF");
  assert.equal(hslToHex(30,100,50),"#FF8000");
});

test("HSL matches independently calculated nonsymmetric colors",()=>{
  // Fixed expected values independently checked with Python colorsys.hls_to_rgb,
  // using degrees/percentages and nearest-integer eight-bit channels.
  const vectors=[
    [12,34,56,"#B57869"],
    [210,50,40,"#336699"],
    [270,50,40,"#663399"],
    [359.5,73,42,"#B91D1E"],
    [100.5,12.5,33.3,"#51604A"]
  ];
  for(const [h,s,l,expected] of vectors)assert.equal(hslToHex(h,s,l),expected);
});

test("HSL rejects invalid form values even when saturation or lightness hides their effect",()=>{
  for(const invalid of [""," ",null,undefined,false,[],{},NaN,Infinity,-Infinity,"1e999","12deg","50%","0x10"]){
    for(let index=0;index<3;index++){
      const channels=[0,0,0];channels[index]=invalid;
      assert.throws(()=>hslToHex(...channels),/number/);
    }
  }
  for(const channels of [[-1,0,0],[360.01,0,0],[0,-1,0],[0,100.01,0],[0,0,-1],[0,0,100.01]])assert.throws(()=>hslToHex(...channels),/number/);
});

test("RGB via HSL form values to HEX retains exact channels across sectors and near endpoints",()=>{
  const values=[0,1,64,127,128,192,254,255];
  for(const r of values)for(const g of values)for(const b of values){
    const hex=rgbToHex(r,g,b),hsl=rgbToHsl(r,g,b);
    assert.equal(hslToHex(hsl.h,hsl.s,hsl.l),hex,`${r},${g},${b}`);
    assert.deepEqual(parseHexColor(hex),{r,g,b});
  }
});
