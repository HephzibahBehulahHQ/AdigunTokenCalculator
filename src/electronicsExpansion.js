import {field, requireField} from "./calculator-fields.js";

export const electronicsExpansion = {
  "ohms-law-series": {
    category: "Electronics & Automation",
    title: "Series circuit current|Strom im Reihenschaltkreis|Ìṣàn iná ní tẹ̀léra|Series circuit current",
    description: "Calculate current and voltage drops across two series resistors.|Strom und Spannungsabfälle an zwei Reihenwiderständen berechnen.|Ṣírò ìṣàn àti ìdínkù foliteji fún resístọ̀ méjì ní tẹ̀léra.|Work out current and voltage drop for two series resistors.",
    fields: [
      field("seriesSupply", "Supply (V)|Versorgung (V)|Ìpèsè (V)|Supply (V)", 0.000001, 1000000000000, false),
      field("seriesFirst", "First resistor (Ω)|Erster Widerstand (Ω)|Resístọ̀ àkọ́kọ́ (Ω)|First resistor (Ω)", 0.000001, 1000000000000, false),
      field("seriesSecond", "Second resistor (Ω)|Zweiter Widerstand (Ω)|Resístọ̀ kejì (Ω)|Second resistor (Ω)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Current (A)|Strom (A)|Ìṣàn (A)|Current (A)","First drop (V)|Erster Abfall (V)|Ìdínkù àkọ́kọ́ (V)|First drop (V)","Second drop (V)|Zweiter Abfall (V)|Ìdínkù kejì (V)|Second drop (V)"],
    calculate: (v, a, b) => [v/(a+b), v*a/(a+b), v*b/(a+b)],
  },

  "parallel-resistor-load": {
    category: "Electronics & Automation",
    title: "Parallel resistor load|Parallele Widerstandslast|Ẹrù resístọ̀ afífẹ́ra|Parallel resistor load",
    description: "Find equivalent resistance and source current for two branches.|Ersatzwiderstand und Quellenstrom für zwei Zweige ermitteln.|Ṣírò ìdènà àpapọ̀ àti ìṣàn fún ẹ̀ka méjì.|Find combined resistance and supply current for two branches.",
    fields: [
      field("parallelSupply", "Supply (V)|Versorgung (V)|Ìpèsè (V)|Supply (V)", 0.000001, 1000000000000, false),
      field("parallelFirst", "First branch (Ω)|Erster Zweig (Ω)|Ẹ̀ka àkọ́kọ́ (Ω)|First branch (Ω)", 0.000001, 1000000000000, false),
      field("parallelSecond", "Second branch (Ω)|Zweiter Zweig (Ω)|Ẹ̀ka kejì (Ω)|Second branch (Ω)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Equivalent resistance (Ω)|Ersatzwiderstand (Ω)|Ìdènà àpapọ̀ (Ω)|Combined resistance (Ω)","Source current (A)|Quellenstrom (A)|Ìṣàn orísun (A)|Supply current (A)"],
    calculate: (v,a,b)=>[a*b/(a+b),v/a+v/b],
  },

  "rc-charge-time": {
    category: "Electronics & Automation",
    title: "RC capacitor charge time|RC-Kondensatorladezeit|Àkókò gbigba agbára RC|RC capacitor charge time",
    description: "Find time to reach a fraction of the supply from an empty ideal capacitor.|Ladezeit bis zum gewünschten Anteil der Versorgung ausgehend von null berechnen.|Ṣírò àkókò láti dé ìpín foliteji tí a yàn láti òdo.|Find time for an empty capacitor to reach a share of supply voltage.",
    fields: [
      field("rcResistor", "Resistance (kΩ)|Widerstand (kΩ)|Ìdènà (kΩ)|Resistance (kΩ)", 0.000001, 1000000000000, false),
      field("rcCapacitor", "Capacitance (µF)|Kapazität (µF)|Kapasítánsì (µF)|Capacitance (µF)", 0.000001, 1000000000000, false),
      field("rcTarget", "Target voltage share (%)|Zielspannungsanteil (%)|Ìpín foliteji àfojúsùn (%)|Target voltage share (%)", 0.000001, 100, false),
    ],
    outputs: ["Time constant (s)|Zeitkonstante (s)|Àkókò ìdúró (s)|Time constant (s)","Elapsed charge time (s)|Ladezeit (s)|Àkókò gbigba (s)|Charge time (s)"],
    calculate: (r,c,p)=>{requireField(p<100,'rcTarget'); const tau=r*c/1000;return [tau,-tau*Math.log1p(-p/100)];},
  },

  "capacitor-stored-energy": {
    category: "Electronics & Automation",
    title: "Capacitor stored energy|Gespeicherte Kondensatorenergie|Agbára inú capacitor|Capacitor stored energy",
    description: "Calculate stored charge and energy at the entered voltage.|Ladung und Energie bei der angegebenen Spannung berechnen.|Ṣírò ìkójọ iná àti agbára ní foliteji tí a tẹ̀.|Work out stored charge and energy at this voltage.",
    fields: [
      field("storedCapacitance", "Capacitance (µF)|Kapazität (µF)|Kapasítánsì (µF)|Capacitance (µF)", 0.000001, 1000000000000, false),
      field("storedCapVoltage", "Voltage (V)|Spannung (V)|Foliteji (V)|Voltage (V)", 0, 1000000000000, false),
    ],
    outputs: ["Charge (mC)|Ladung (mC)|Ìkójọ iná (mC)|Charge (mC)","Energy (J)|Energie (J)|Agbára (J)|Energy (J)"],
    calculate: (c,v)=>[c*v/1000,c*v*v/2e6],
  },

  "inductor-current-ramp": {
    category: "Electronics & Automation",
    title: "Inductor current ramp|Stromanstieg in einer Spule|Ìgòkè ìṣàn inductor|Inductor current ramp",
    description: "Model current rise under constant voltage in an ideal inductor.|Stromanstieg einer idealen Spule bei konstanter Spannung modellieren.|Ṣírò ìgòkè ìṣàn pẹ̀lú foliteji tó dúró.|Model current rising in an ideal inductor under steady voltage.",
    fields: [
      field("rampInductance", "Inductance (mH)|Induktivität (mH)|Indọ́ktánsì (mH)|Inductance (mH)", 0.000001, 1000000000000, false),
      field("rampVoltage", "Applied voltage (V)|Angelegte Spannung (V)|Foliteji ìpèsè (V)|Applied voltage (V)", 0.000001, 1000000000000, false),
      field("rampCurrent", "Final current from zero (A)|Endstrom ab null (A)|Ìṣàn ìparí láti òdo (A)|Final current from zero (A)", 0, 1000000000000, false),
    ],
    outputs: ["Ramp time (ms)|Anstiegszeit (ms)|Àkókò ìgòkè (ms)|Ramp time (ms)","Final stored energy (J)|Gespeicherte Endenergie (J)|Agbára ìparí (J)|Final stored energy (J)"],
    calculate: (l,v,i)=>[l*i/v,l*i*i/2000],
  },

  "pwm-resistive-power": {
    category: "Electronics & Automation",
    title: "PWM resistive load power|PWM-Leistung einer Widerstandslast|Agbára ẹrù PWM|PWM resistive load power",
    description: "Estimate RMS voltage and average heating power for ideal on-off switching.|Effektivspannung und mittlere Heizleistung bei idealem Schalten schätzen.|Ṣírò foliteji RMS àti agbára ooru àárín fún yíyí tan-pa.|Estimate RMS voltage and average heat for ideal on-off switching.",
    fields: [
      field("pwmSupply", "On voltage (V)|Einschaltspannung (V)|Foliteji tí ó tan (V)|On voltage (V)", 0.000001, 1000000000000, false),
      field("pwmDuty", "Duty cycle (%)|Tastgrad (%)|Ìpín àkókò tí ó tan (%)|Duty cycle (%)", 0, 100, false),
      field("pwmLoad", "Resistive load (Ω)|Widerstandslast (Ω)|Ẹrù resístọ̀ (Ω)|Resistor load (Ω)", 0.000001, 1000000000000, false),
    ],
    outputs: ["RMS voltage (V)|Effektivspannung (V)|Foliteji RMS (V)|RMS voltage (V)","Average power (W)|Mittlere Leistung (W)|Agbára àárín (W)|Average power (W)"],
    calculate: (v,d,r)=>[v*Math.sqrt(d/100),v*v*d/(100*r)],
  },

  "stepper-travel-resolution": {
    category: "Electronics & Automation",
    title: "Stepper axis resolution|Auflösung einer Schrittmotorachse|Ìwọ̀n ìrìn axis stepper|Stepper axis resolution",
    description: "Convert motor steps, microsteps and screw lead into commanded travel resolution.|Motorschritte, Mikroschritte und Spindelsteigung in Wegauflösung umrechnen.|Yí ìgbésẹ̀ mọ́tò àti gígùn screw padà sí ìwọ̀n ìrìn.|Work out travel per pulse from motor steps, microsteps and screw lead.",
    fields: [
      field("stepperFullSteps", "Full steps per turn|Vollschritte je Umdrehung|Ìgbésẹ̀ odidi fún yípo kan|Full steps for one turn", 1, 1000000000000, true),
      field("stepperMicroSteps", "Microsteps per full step|Mikroschritte je Vollschritt|Ìgbésẹ̀ kékeré fún odidi kan|Microsteps per full step", 1, 1000000000000, true),
      field("stepperLead", "Screw lead (mm/turn)|Spindelsteigung (mm/U)|Ìrìn screw (mm/yípo)|Screw lead (mm/turn)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Pulses per mm|Impulse pro mm|Pulse fún mm|Pulses per mm","Travel per pulse (µm)|Weg je Impuls (µm)|Ìrìn fún pulse kan (µm)|Travel per pulse (µm)"],
    calculate: (steps,micro,lead)=>[steps*micro/lead,1000*lead/(steps*micro)],
  },

  "encoder-machine-speed": {
    category: "Electronics & Automation",
    title: "Encoder shaft speed|Drehzahl aus Encoderimpulsen|Ìyára ọ̀pá láti encoder|Encoder shaft speed",
    description: "Convert pulse frequency and decoded counts per revolution into shaft speed.|Impulsfrequenz und dekodierte Zählwerte je Umdrehung in Drehzahl umrechnen.|Yí iye pulse ní ìṣẹ́jú-àáyá àti iye ní yípo kan padà sí ìyára ọ̀pá.|Use pulse frequency and decoded counts per turn to find shaft speed.",
    fields: [
      field("encoderFrequency", "Count frequency (Hz)|Zählfrequenz (Hz)|Igbohunsafẹfẹ iye (Hz)|Count frequency (Hz)", 0, 1000000000000, false),
      field("encoderCounts", "Decoded counts per turn|Dekodierte Zählwerte je Umdrehung|Iye tí a tú fún yípo kan|Decoded counts per turn", 1, 1000000000000, true),
    ],
    outputs: ["Shaft speed (rpm)|Wellendrehzahl (U/min)|Ìyára ọ̀pá (rpm)|Shaft speed (rpm)","Turns per second|Umdrehungen pro Sekunde|Yípo ní ìṣẹ́jú-àáyá|Turns per second"],
    calculate: (f,c)=>[f*60/c,f/c],
  },

  "gearbox-output": {
    category: "Electronics & Automation",
    title: "Gearbox output speed and torque|Getriebeabtrieb und Drehmoment|Ìyára àti agbára gearbox|Gearbox output speed and torque",
    description: "Estimate output speed and torque using a reduction ratio and efficiency.|Abtriebsdrehzahl und Drehmoment aus Übersetzung und Wirkungsgrad schätzen.|Ṣírò ìyára àti agbára ìjáde pẹ̀lú ìpín gearbox àti ìmúlò rẹ̀.|Estimate speed and torque after reduction and losses.",
    fields: [
      field("gearInputSpeed", "Input speed (rpm)|Eingangsdrehzahl (U/min)|Ìyára ìwọlé (rpm)|Input speed (rpm)", 0, 1000000000000, false),
      field("gearInputTorque", "Input torque (N·m)|Eingangsdrehmoment (N·m)|Agbára yíyí ìwọlé (N·m)|Input torque (N·m)", 0, 1000000000000, false),
      field("gearRatioReduction", "Input turns per output turn|Eingangsumdrehungen je Abtriebsumdrehung|Yípo ìwọlé fún yípo ìjáde|Input turns per output turn", 0.000001, 1000000000000, false),
      field("gearEfficiency", "Gearbox efficiency (%)|Getriebewirkungsgrad (%)|Ìmúlò gearbox (%)|Gearbox efficiency (%)", 0, 100, false),
    ],
    outputs: ["Output speed (rpm)|Abtriebsdrehzahl (U/min)|Ìyára ìjáde (rpm)|Output speed (rpm)","Output torque (N·m)|Abtriebsdrehmoment (N·m)|Agbára ìjáde (N·m)|Output torque (N·m)"],
    calculate: (s,t,r,e)=>[s/r,t*r*e/100],
  },

  "vfd-synchronous-speed": {
    category: "Electronics & Automation",
    title: "Motor synchronous speed and slip|Synchrondrehzahl und Schlupf|Ìyára amúṣiṣẹ́ àti slip|Motor synchronous speed and slip",
    description: "Find synchronous speed and compare it with measured rotor RPM.|Synchrondrehzahl berechnen und mit der gemessenen Rotordrehzahl vergleichen.|Ṣírò ìyára amúṣiṣẹ́, kí o fi wé ìyára rotor tí a wọn.|Work out synchronous speed and compare am with measured rotor RPM.",
    fields: [
      field("motorSupplyFrequency", "Supply frequency (Hz)|Speisefrequenz (Hz)|Igbohunsafẹfẹ ìpèsè (Hz)|Supply frequency (Hz)", 0.000001, 1000000000000, false),
      field("motorPoleCount", "Motor poles|Motorpole|Òpó mọ́tò|Motor poles", 1, 1000000000000, true),
      field("measuredRotorRpm", "Measured rotor speed (rpm)|Gemessene Rotordrehzahl (U/min)|Ìyára rotor tí a wọn (rpm)|Measured rotor speed (rpm)", 0, 1000000000000, false),
    ],
    outputs: ["Synchronous speed (rpm)|Synchrondrehzahl (U/min)|Ìyára amúṣiṣẹ́ (rpm)|Synchronous speed (rpm)","Slip (%)|Schlupf (%)|Slip (%)|Slip (%)"],
    calculate: (f,p,m)=>{requireField(p%2===0,'motorPoleCount');const s=120*f/p;return [s,(s-m)/s*100];},
  },

  "ac-power-triangle": {
    category: "Electronics & Automation",
    title: "Single-phase AC power triangle|Einphasiges Leistungsdreieck|Onígun agbára AC ẹ̀ka kan|Single-phase AC power triangle",
    description: "Estimate apparent, real and reactive power from RMS inputs and displacement factor for a sinusoidal load.|Schein-, Wirk- und Blindleistung aus Effektivwerten und Verschiebungsfaktor für sinusförmige Last schätzen.|Ṣírò agbára tí ó hàn, gidi àti ìfàsẹ́yìn láti iye RMS àti ìpín.|Estimate apparent, real and reactive power from RMS readings.",
    fields: [
      field("acLineVoltage", "RMS voltage (V)|Effektivspannung (V)|Foliteji RMS (V)|RMS voltage (V)", 0.000001, 1000000000000, false),
      field("acLineCurrent", "RMS current (A)|Effektivstrom (A)|Ìṣàn RMS (A)|RMS current (A)", 0, 1000000000000, false),
      field("acPowerFactorPct", "Displacement factor (%)|Verschiebungsfaktor (%)|Ìpín ìyàtọ̀ (%)|Displacement factor (%)", 0, 100, false),
    ],
    outputs: ["Apparent power (VA)|Scheinleistung (VA)|Agbára tí ó hàn (VA)|Apparent power (VA)","Real power (W)|Wirkleistung (W)|Agbára gidi (W)|Real power (W)","Reactive power magnitude (var)|Blindleistungsbetrag (var)|Ìwọ̀n agbára ìfàsẹ́yìn (var)|Reactive power size (var)"],
    calculate: (v,i,p)=>[v*i,v*i*p/100,v*i*Math.sqrt(1-(p/100)**2)],
  },

  "digital-sampling-rate": {
    category: "Electronics & Automation",
    title: "Waveform sampling density|Abtastdichte einer Wellenform|Ìpọ̀ àpẹẹrẹ igbi|Waveform sampling density",
    description: "Compare the chosen sample rate with samples per waveform cycle and the ideal Nyquist boundary.|Abtastrate mit Punkten pro Periode und der idealen Nyquist-Grenze vergleichen.|Fi ìwọn àpẹẹrẹ wé iye fún ìyípo igbi kan àti ààlà Nyquist.|Check samples for one cycle and the ideal Nyquist limit.",
    fields: [
      field("waveSampleRate", "Sampling rate (Hz)|Abtastrate (Hz)|Iye àpẹẹrẹ (Hz)|Sample rate (Hz)", 0.000001, 1000000000000, false),
      field("waveFrequency", "Waveform frequency (Hz)|Signalfrequenz (Hz)|Igbohunsafẹfẹ igbi (Hz)|Waveform frequency (Hz)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Samples per cycle|Abtastwerte je Periode|Àpẹẹrẹ fún ìyípo kan|Samples each cycle","Nyquist boundary (Hz)|Nyquist-Grenze (Hz)|Ààlà Nyquist (Hz)|Nyquist boundary (Hz)"],
    calculate: (s,f)=>[s/f,s/2],
  },

  "adc-code-step": {
    category: "Electronics & Automation",
    title: "ADC voltage code step|ADC-Spannungsschritt|Ìgbésẹ̀ foliteji ADC|ADC voltage code step",
    description: "Calculate ideal code width and a zero-based code for a unipolar ADC with a zero-volt lower endpoint.|Ideale Schrittweite und nullbasierten Code für einen unipolaren ADC ab null Volt berechnen.|Ṣírò ìwọ̀n kóòdù ADC tó bẹ̀rẹ̀ ní foliteji òdo.|Find ideal ADC step size and code for an input range that starts at zero.",
    fields: [
      field("adcTopVoltage", "Full-scale reference (V)|Vollbereichsreferenz (V)|Foliteji ìkún (V)|Full-scale reference (V)", 0.000001, 1000000000000, false),
      field("adcBits", "Resolution (bits)|Auflösung (Bit)|Ìpinnu (bit)|Resolution (bits)", 1, 1000000000000, true),
      field("adcInputVoltage", "Input (V)|Eingang (V)|Ìwọlé (V)|Input (V)", 0, 1000000000000, false),
    ],
    outputs: ["Code width (mV)|Schrittweite (mV)|Ìwọ̀n kóòdù (mV)|Code step (mV)","Ideal output code|Idealer Ausgabecode|Kóòdù ìjáde|Ideal output code"],
    calculate: (v,b,x)=>{requireField(b<=32,'adcBits');requireField(x<=v,'adcInputVoltage');const n=2**b;return [1000*v/n,Math.min(n-1,Math.floor(x*n/v))];},
  },

  "uart-frame-transmission": {
    category: "Electronics & Automation",
    title: "UART frame transmission time|UART-Rahmenübertragungszeit|Àkókò fífi frame UART ránṣẹ́|UART frame transmission time",
    description: "Estimate wire time from complete frame bits and baud rate, excluding gaps.|Leitungszeit aus vollständigen Rahmenbits und Baudrate ohne Pausen schätzen.|Ṣírò àkókò fífi frame pípé ránṣẹ́ láìka àlàfo.|Work out wire time from all bits per frame and baud rate, without gaps.",
    fields: [
      field("uartBaud", "Baud rate (bit/s)|Baudrate (Bit/s)|Ìyára baud (bit/s)|Baud rate (bit/s)", 0.000001, 1000000000000, false),
      field("uartFrameBits", "Bits per frame including framing|Bits je Rahmen einschließlich Rahmenbits|Bítì fún frame pẹ̀lú ìṣètò|Bits per frame including framing", 0.000001, 1000000000000, false),
      field("uartFrameCount", "Frames transmitted|Übertragene Rahmen|Frame tí a rán|Frames sent", 1, 1000000000000, true),
    ],
    outputs: ["Total frame bits|Rahmenbits insgesamt|Gbogbo bítì frame|Total frame bits","Wire time (ms)|Übertragungszeit (ms)|Àkókò okùn (ms)|Wire time (ms)"],
    calculate: (baud,bits,frames)=>[bits*frames,1000*bits*frames/baud],
  },

  "thermal-resistance-rise": {
    category: "Electronics & Automation",
    title: "Electronic thermal rise|Thermischer Anstieg eines Bauteils|Ìgòkè ooru ẹ̀rọ|Electronic thermal rise",
    description: "Estimate steady-state device temperature using total thermal resistance to ambient.|Stationäre Bauteiltemperatur aus Gesamtwärmewiderstand zur Umgebung schätzen.|Ṣírò ìwọ̀n ooru ẹ̀rọ pẹ̀lú ìdènà ooru sí àyíká.|Estimate steady device temperature using thermal resistance to the air.",
    fields: [
      field("thermalPowerLoss", "Power dissipated (W)|Verlustleistung (W)|Agbára tó sọnù (W)|Power dissipated (W)", 0, 1000000000000, false),
      field("thermalPathResistance", "Thermal resistance (°C/W)|Wärmewiderstand (°C/W)|Ìdènà ooru (°C/W)|Thermal resistance (°C/W)", 0.000001, 1000000000000, false),
      field("ambientTemperatureC", "Ambient temperature (°C)|Umgebungstemperatur (°C)|Ooru àyíká (°C)|Ambient temperature (°C)", -1000000000000, 1000000000000, false),
    ],
    outputs: ["Temperature rise (°C)|Temperaturanstieg (°C)|Ìgòkè ooru (°C)|Temperature rise (°C)","Estimated temperature (°C)|Geschätzte Temperatur (°C)|Ooru tí a fojú díwọ̀n (°C)|Estimated temperature (°C)"],
    calculate: (p,r,t)=>[p*r,t+p*r],
  },

  "hydraulic-cylinder-force": {
    category: "Electronics & Automation",
    title: "Hydraulic cylinder force|Hydraulikzylinderkraft|Agbára cylinder omi|Hydraulic cylinder force",
    description: "Estimate ideal extension and retraction forces from gauge pressure, bore and rod diameters.|Ideale Ausfahr- und Einfahrkräfte aus Überdruck, Kolben- und Stangendurchmesser schätzen.|Ṣírò agbára títẹ̀ jáde àti padà láti inú ìfúnpá àti ìwọ̀n cylinder.|Estimate ideal push and pull forces from pressure and bore and rod sizes.",
    fields: [
      field("cylinderPressureBar", "Gauge pressure (bar)|Überdruck (bar)|Ìfúnpá tí a wọn (bar)|Gauge pressure (bar)", 0, 1000000000000, false),
      field("cylinderBoreMm", "Cylinder bore (mm)|Kolbendurchmesser (mm)|Ìbú cylinder (mm)|Cylinder bore (mm)", 0.000001, 1000000000000, false),
      field("cylinderRodMm", "Rod diameter (mm)|Stangendurchmesser (mm)|Ìbú ọ̀pá (mm)|Rod diameter (mm)", 0, 1000000000000, false),
    ],
    outputs: ["Extension force (kN)|Ausfahrkraft (kN)|Agbára títẹ̀ jáde (kN)|Extension force (kN)","Retraction force (kN)|Einfahrkraft (kN)|Agbára títẹ̀ padà (kN)|Retraction force (kN)"],
    calculate: (p,b,r)=>{requireField(r<b,'cylinderRodMm');const k=p*Math.PI/40000;return [k*b*b,k*(b*b-r*r)];},
  },

  "process-cycle-takt": {
    category: "Electronics & Automation",
    title: "Production takt time|Produktionstakt|Àkókò takt ìṣelọpọ|Production takt time",
    description: "Compare available production time per required unit with the observed cycle time.|Verfügbare Zeit pro benötigtem Stück mit der gemessenen Zykluszeit vergleichen.|Fi àkókò tó wà fún ẹyọ kan wé àkókò ìyípo tí a wọn.|Compare time you get for each required item with the actual cycle time.",
    fields: [
      field("taktAvailableMinutes", "Net production time (min)|Netto-Produktionszeit (min)|Àkókò ìṣelọpọ gidi (ìṣẹ́jú)|Net production time (min)", 0.000001, 1000000000000, false),
      field("taktDemand", "Required good units|Benötigte Gutteile|Ẹyọ rere tí a nílò|Required good units", 1, 1000000000000, true),
      field("taktObservedSeconds", "Observed cycle time (s)|Gemessene Zykluszeit (s)|Àkókò ìyípo tí a wọn (s)|Observed cycle time (s)", 0.000001, 1000000000000, false),
    ],
    outputs: ["Takt time (s/unit)|Taktzeit (s/Stück)|Takt (s/ẹyọ)|Takt time (s/unit)","Nominal completed units|Nominell fertige Stück|Ẹyọ tí a lè parí|Nominal completed units"],
    calculate: (m,n,c)=>[m*60/n,Math.floor(m*60/c)],
  },

  "oee-machine-effectiveness": {
    category: "Electronics & Automation",
    title: "Machine OEE|Maschinen-OEE|Ìmúlò ẹ̀rọ OEE|Machine OEE",
    description: "Compute availability, performance, quality and overall equipment effectiveness from one observation period.|Verfügbarkeit, Leistung, Qualität und Gesamtanlageneffektivität für einen Zeitraum berechnen.|Ṣírò ìwàláàyè, iṣẹ́, dídára àti ìmúlò ẹ̀rọ fún àkókò kan.|Work out availability, performance, quality and total effectiveness for one period.",
    fields: [
      field("oeePlannedMinutes", "Planned production (min)|Geplante Produktion (min)|Àkókò ìṣelọpọ tí a ṣètò|Planned production (min)", 0.000001, 1000000000000, false),
      field("oeeRunningMinutes", "Actual running (min)|Tatsächliche Laufzeit (min)|Àkókò tí ẹ̀rọ ṣiṣẹ́|Actual running (min)", 0.000001, 1000000000000, false),
      field("oeeIdealCycleSeconds", "Ideal cycle (s/item)|Idealer Zyklus (s/Stück)|Ìyípo pípé (s/ẹyọ)|Ideal cycle (s/item)", 0.000001, 1000000000000, false),
      field("oeeOutput", "Total items made|Produzierte Teile|Gbogbo ẹyọ tí a ṣe|Total items made", 1, 1000000000000, true),
      field("oeeGoodOutput", "Good items made|Gutteile|Ẹyọ rere|Good items made", 0, 1000000000000, true),
    ],
    outputs: ["Availability (%)|Verfügbarkeit (%)|Ìwàláàyè (%)|Availability (%)","Performance (%)|Leistung (%)|Iṣẹ́ (%)|Performance (%)","Quality (%)|Qualität (%)|Dídára (%)|Quality (%)","OEE (%)|OEE (%)|OEE (%)|OEE (%)"],
    calculate: (p,r,c,t,g)=>{requireField(r<=p,'oeeRunningMinutes');requireField(g<=t,'oeeGoodOutput');return [100*r/p,100*c*t/(60*r),100*g/t,100*c*g/(60*p)];},
  },

  "synchronous-belt-ratio": {
    category: "Electronics & Automation",
    title: "Synchronous belt ratio|Zahnriemenübersetzung|Ìpín igbanu eyín|Toothed belt ratio",
    description: "Calculate driven pulley speed and ideal output torque before losses.|Drehzahl der Abtriebsscheibe und ideales Drehmoment vor Verlusten berechnen.|Ṣírò ìyára pulley ìjáde àti agbára ṣáájú ìsọnù.|Work out driven speed and ideal shaft torque before losses.",
    fields: [
      field("beltDriverTeeth", "Driver pulley teeth|Zähne antreibende Scheibe|Eyín pulley ìwọlé|Driver pulley teeth", 1, 1000000000000, true),
      field("beltDrivenTeeth", "Driven pulley teeth|Zähne angetriebene Scheibe|Eyín pulley ìjáde|Driven pulley teeth", 1, 1000000000000, true),
      field("beltMotorSpeed", "Driver speed (rpm)|Antriebsdrehzahl (U/min)|Ìyára pulley ìwọlé (rpm)|Driver speed (rpm)", 0, 1000000000000, false),
      field("beltInputTorque", "Input torque (N·m)|Eingangsdrehmoment (N·m)|Agbára yíyí ìwọlé (N·m)|Input torque (N·m)", 0, 1000000000000, false),
    ],
    outputs: ["Driven speed (rpm)|Abtriebsdrehzahl (U/min)|Ìyára pulley ìjáde (rpm)|Driven speed (rpm)","Ideal driven torque (N·m)|Ideales Abtriebsdrehmoment (N·m)|Agbára yíyí ìjáde (N·m)|Ideal driven torque (N·m)"],
    calculate: (a,b,s,t)=>[s*a/b,t*b/a],
  },

  "tank-fill-duration": {
    category: "Electronics & Automation",
    title: "Tank fill duration|Tankfüllzeit|Àkókò kíkún táńkì|Tank fill duration",
    description: "Estimate time to fill a fixed volume while inlet and outlet flow stay constant.|Füllzeit bei konstantem Zu- und Abfluss für ein festes Volumen berechnen.|Ṣírò àkókò kíkún nígbà tí ìṣàn wọlé àti jáde dúró.|Work out fill time when incoming and outgoing flow stay steady.",
    fields: [
      field("tankVolumeRemainingL", "Liquid still needed (L)|Noch benötigte Flüssigkeit (L)|Omi tí ó ṣì kù (L)|Liquid still needed (L)", 0, 1000000000000, false),
      field("tankInletLpm", "Inlet flow (L/min)|Zulauf (L/min)|Ìṣàn wọlé (L/ìṣẹ́jú)|Inlet flow (L/min)", 0.000001, 1000000000000, false),
      field("tankOutletLpm", "Concurrent outlet flow (L/min)|Gleichzeitiger Abfluss (L/min)|Ìṣàn jáde (L/ìṣẹ́jú)|Concurrent outlet flow (L/min)", 0, 1000000000000, false),
    ],
    outputs: ["Net inflow (L/min)|Nettozufluss (L/min)|Ìṣàn wọlé gidi (L/ìṣẹ́jú)|Net inflow (L/min)","Fill time (min)|Füllzeit (min)|Àkókò kíkún (ìṣẹ́jú)|Fill time (min)"],
    calculate: (v,i,o)=>{requireField(o<i,'tankOutletLpm');return [i-o,v/(i-o)];},
  },
};
