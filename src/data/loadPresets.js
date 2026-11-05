/** Owner-specified engineering estimates, not manufacturer ratings. All UI copies are editable.
 * Standby is deliberately zero until supplied by the user or measured on site.
 */
export const LOAD_PRESETS = Object.freeze([
  {id:"led-bulb",name:"LED bulb",watts:10,pf:0.9,type:"resistive",category:"lighting",standbyW:0,inrushMultiplier:1},
  {id:"fluorescent",name:"Fluorescent lamp",watts:36,pf:0.9,type:"inductive",category:"lighting",standbyW:0,inrushMultiplier:1},
  {id:"halogen",name:"Halogen lamp",watts:50,pf:1,type:"resistive",category:"lighting",standbyW:0,inrushMultiplier:1},
  {id:"ceiling-fan",name:"Ceiling fan",watts:75,pf:0.9,type:"inductive",category:"cooling",standbyW:0,inrushMultiplier:6},
  {id:"split-ac-1hp",name:"Split AC 1 HP",watts:750,pf:0.85,type:"inductive",category:"cooling",standbyW:0,inrushMultiplier:5},
  {id:"split-ac-1-5hp",name:"Split AC 1.5 HP",watts:1100,pf:0.85,type:"inductive",category:"cooling",standbyW:0,inrushMultiplier:5},
  {id:"window-ac",name:"Window AC",watts:1500,pf:0.85,type:"inductive",category:"cooling",standbyW:0,inrushMultiplier:5},
  {id:"refrigerator",name:"Refrigerator",watts:200,pf:0.8,type:"inductive",category:"appliances",standbyW:0,inrushMultiplier:6},
  {id:"freezer",name:"Freezer",watts:300,pf:0.8,type:"inductive",category:"appliances",standbyW:0,inrushMultiplier:6},
  {id:"microwave",name:"Microwave",watts:1200,pf:0.95,type:"resistive",category:"appliances",standbyW:0,inrushMultiplier:1},
  {id:"kettle",name:"Kettle",watts:1500,pf:1,type:"resistive",category:"appliances",standbyW:0,inrushMultiplier:1},
  {id:"washing-machine",name:"Washing machine",watts:500,pf:0.85,type:"inductive",category:"appliances",standbyW:0,inrushMultiplier:6},
  {id:"tv",name:"Television",watts:100,pf:0.9,type:"resistive",category:"electronics",standbyW:0,inrushMultiplier:1},
  {id:"laptop",name:"Laptop charger",watts:65,pf:0.95,type:"resistive",category:"electronics",standbyW:0,inrushMultiplier:1},
  {id:"desktop",name:"Desktop computer",watts:250,pf:0.9,type:"resistive",category:"electronics",standbyW:0,inrushMultiplier:1},
  {id:"router",name:"Router",watts:10,pf:0.9,type:"resistive",category:"electronics",standbyW:0,inrushMultiplier:1},
  {id:"water-pump",name:"Water pump",watts:500,pf:0.85,type:"inductive",category:"utility",standbyW:0,inrushMultiplier:6},
  {id:"borehole-pump",name:"Borehole pump",watts:1100,pf:0.85,type:"inductive",category:"utility",standbyW:0,inrushMultiplier:6},
  {id:"iron",name:"Iron",watts:1000,pf:1,type:"resistive",category:"utility",standbyW:0,inrushMultiplier:1}
].map(preset => Object.freeze(preset)));

/** Generation belongs in global daily offsets, never the consuming-device table. */
export const RENEWABLE_PRESETS = Object.freeze([
  {id:"solar",name:"Solar output",field:"solarKWh",category:"renewable",unit:"kWh/day",kWhPerDay:0},
  {id:"wind",name:"Wind output",field:"windKWh",category:"renewable",unit:"kWh/day",kWhPerDay:0}
].map(preset => Object.freeze(preset)));
