import {field, requireField} from "./calculator-fields.js";

export const tradingExpansion = {
  "cagr-return": {
    category: "Trading",
    title: "Compound annual growth|Jährliche Wachstumsrate|Ìdàgbàsókè ọdọọdún|Compound yearly growth",
    description: "Annualize a change in value over a chosen period without cash flows.|Wertänderung ohne Zahlungsströme auf ein Jahr umrechnen.|Ṣírò ìyípadà iye lọ́dún láìka owó tó wọlé.|Find yearly growth without deposits or withdrawals.",
    fields: [
      field("growthStart", "Starting value|Anfangswert|Iye ìbẹ̀rẹ̀|Starting value", 0.000001, 1000000000000, false),
      field("growthEnd", "Ending value|Endwert|Iye ìparí|Ending value", 0, 1000000000000, false),
      field("growthYears", "Elapsed years|Vergangene Jahre|Ọdún tí ó kọjá|Years passed", 0.000001, 1000000000000, false),
    ],
    outputs: ["Annualized growth (%)|Jährliches Wachstum (%)|Ìdàgbàsókè ọdọọdún (%)|Yearly growth (%)","Total growth (%)|Gesamtwachstum (%)|Ìdàgbàsókè gbogbo (%)|Total growth (%)"],
    calculate: (a,b,y)=>[(Math.pow(b/a,1/y)-1)*100,(b/a-1)*100],
  },

  "trade-dividend-yield": {
    category: "Trading",
    title: "Dividend yield|Dividendenrendite|Èrè ìpín|Dividend yield",
    description: "Compare entered annual dividends with the share price and calculate gross cash income.|Jahresdividende mit Aktienkurs vergleichen und Bruttoertrag berechnen.|Fi èrè ìpín ọdún wé iye ọjà kí o sì ṣírò owó wọlé.|Compare yearly dividends with share price and work out cash received.",
    fields: [
      field("dividendPrice", "Share price|Aktienkurs|Iye ẹyọ ọjà|Share price", 0.000001, 1000000000000, false),
      field("dividendAnnual", "Annual dividend per share|Jahresdividende je Aktie|Èrè ọdún fún ẹyọ kan|Yearly dividend per share", 0, 1000000000000, false),
      field("dividendShares", "Shares held|Gehaltene Aktien|Iye ẹyọ tí a mú|Shares held", 0, 1000000000000, false),
    ],
    outputs: ["Gross yield (%)|Bruttorendite (%)|Ìpín èrè (%)|Gross yield (%)","Gross annual income|Jahresbruttoertrag|Owó ọdún|Gross yearly income"],
    calculate: (p,d,q)=>[100*d/p,d*q],
  },

  "trade-multiple-lots-exit": {
    category: "Trading",
    title: "Partial position exit|Teilverkauf einer Position|Títà díẹ̀ nínú ọjà|Partial position exit",
    description: "Calculate realized gain and remaining cost for a partial sale using average entry cost.|Realisierte Differenz und Restkosten eines Teilverkaufs zum Durchschnittseinstand berechnen.|Ṣírò èrè gidi àti iye tó kù ní títà apá kan.|Calculate sold gain and remaining cost from average buy price.",
    fields: [
      field("partialUnitsHeld", "Units held before sale|Bestand vor Verkauf|Ẹyọ ṣáájú títà|Units held before sale", 0.000001, 1000000000000, false),
      field("partialAverageCost", "Average entry cost per unit|Durchschnittseinstand je Einheit|Iye rírà àárín fún ẹyọ|Average buy cost per unit", 0.000001, 1000000000000, false),
      field("partialUnitsSold", "Units sold|Verkaufte Einheiten|Ẹyọ tí a tà|Units sold", 0.000001, 1000000000000, false),
      field("partialSalePrice", "Sale price per unit|Verkaufspreis je Einheit|Iye títà ẹyọ|Sale price per unit", 0, 1000000000000, false),
      field("partialSaleFees", "Sale fees|Verkaufsgebühren|Owó iṣẹ́ títà|Sale fees", 0, 1000000000000, false),
    ],
    outputs: ["Realized gain or loss|Realisierter Gewinn oder Verlust|Èrè tàbí òfo gidi|Realized gain or loss","Remaining cost|Verbleibender Einstand|Ináwó tó kù|Remaining cost"],
    calculate: (held,cost,sold,price,fees)=>{requireField(sold<=held,'partialUnitsSold');return [(price-cost)*sold-fees,(held-sold)*cost];},
  },

  "trading-funding-payment": {
    category: "Trading",
    title: "Perpetual funding payment|Finanzierungszahlung für Perpetuals|Owó ìnáwó perpetual|Perpetual funding payment",
    description: "Model the funding amount for a long position at an unchanged notional and signed rate per interval.|Finanzierung einer Long-Position bei konstantem Nominalbetrag und vorzeichenbehaftetem Satz je Intervall modellieren.|Ṣírò owó ìnáwó fún rírà ní iye tí kò yí pẹ̀lú ìpín àkókò.|Work out funding on a long position at the same notional and signed funding rate.",
    fields: [
      field("fundingNotional", "Position notional|Nominalwert der Position|Iye ipo|Position notional", 0, 1000000000000, false),
      field("fundingIntervalPct", "Funding rate per interval (%)|Finanzierungssatz je Intervall (%)|Ìpín ìnáwó fún àkókò (%)|Funding rate each interval (%)", -1000000000000, 1000000000000, false),
      field("fundingIntervalCount", "Funding intervals|Finanzierungsintervalle|Iye àkókò ìnáwó|Funding intervals", 0, 1000000000000, true),
    ],
    outputs: ["Per interval paid by long|Zahlung der Long-Position je Intervall|Owó ìsan long fún àkókò|Long pays per interval","Total paid by long|Gesamte Zahlung der Long-Position|Gbogbo owó ìsan long|Total long pays"],
    calculate: (n,r,i)=>[n*r/100,n*r*i/100],
  },

  "margin-markup-pair": {
    category: "Trading",
    title: "Selling price margin and markup|Marge und Aufschlag|Ìpín èrè àti àfikún iye|Margin and markup",
    description: "Distinguish profit as a share of sales from markup on cost.|Gewinnanteil am Umsatz vom Aufschlag auf Kosten unterscheiden.|Yà èrè lórí títà sọ́tọ̀ kúrò ní àfikún lórí ináwó.|See profit share on sale and markup on cost separately.",
    fields: [
      field("skuUnitCost", "Unit cost|Stückkosten|Ináwó ẹyọ|Unit cost", 0.000001, 1000000000000, false),
      field("skuSellingPrice", "Unit selling price|Stückverkaufspreis|Iye títà ẹyọ|Selling price per unit", 0.000001, 1000000000000, false),
    ],
    outputs: ["Gross margin (%)|Bruttomarge (%)|Ìpín èrè lórí títà (%)|Gross margin (%)","Markup (%)|Aufschlag (%)|Àfikún iye (%)|Markup (%)"],
    calculate: (c,p)=>[100*(p-c)/p,100*(p-c)/c],
  },

  "target-margin-price": {
    category: "Trading",
    title: "Target gross-margin price|Preis für Zielmarge|Iye títà fún èrè àfojúsùn|Target gross-margin price",
    description: "Calculate price after including sale fees charged as a share of price.|Verkaufspreis unter Berücksichtigung prozentualer Verkaufsgebühren berechnen.|Ṣírò iye títà pẹ̀lú owó iṣẹ́ tó jẹ́ ìpín iye.|Work out the price after fees based on the sale price.",
    fields: [
      field("marginProductCost", "Cost per unit|Kosten je Einheit|Ináwó ẹyọ kan|Unit cost", 0.000001, 1000000000000, false),
      field("marginTargetPct", "Target profit share (%)|Zielgewinnanteil (%)|Ìpín èrè àfojúsùn (%)|Target profit share (%)", 0, 100, false),
      field("marginSaleFeePct", "Platform fee share (%)|Plattformgebühr (%)|Ìpín owó iṣẹ́ (%)|Platform fee share (%)", 0, 100, false),
    ],
    outputs: ["Required selling price|Erforderlicher Verkaufspreis|Iye títà tí a nílò|Required selling price","Profit per unit|Gewinn je Einheit|Èrè fún ẹyọ kan|Profit per unit"],
    calculate: (c,m,f)=>{requireField(m+f<100,'marginSaleFeePct');const p=c/(1-(m+f)/100);return [p,p*m/100];},
  },

  "inventory-turnover-days": {
    category: "Trading",
    title: "Inventory turnover and days|Lagerumschlag und Lagertage|Ìyípo ọjà àti ọjọ́|Stock turnover and days",
    description: "Relate cost of goods sold to average inventory over the entered period.|Wareneinsatz mit dem Durchschnittsbestand des angegebenen Zeitraums vergleichen.|Fi ináwó ọjà tí a tà wé iye ọjà àárín fún àkókò yẹn.|Compare cost of goods sold with average stock across the period.",
    fields: [
      field("inventoryCostSold", "Cost of goods sold|Wareneinsatz|Ináwó ọjà tí a tà|Cost of goods sold", 0.000001, 1000000000000, false),
      field("inventoryMeanValue", "Average inventory value|Durchschnittlicher Lagerwert|Iye ọjà àárín|Average stock value", 0.000001, 1000000000000, false),
      field("inventoryPeriodDays", "Days in period|Tage im Zeitraum|Ọjọ́ nínú àkókò|Days in period", 0.000001, 1000000000000, false),
    ],
    outputs: ["Turns during period|Umschläge im Zeitraum|Ìyípo ní àkókò|Stock turns in period","Inventory days|Lagerreichweite (Tage)|Ọjọ́ ọjà|Stock days"],
    calculate: (c,i,d)=>[c/i,d*i/c],
  },

  "trade-invoice-cash-discount": {
    category: "Trading",
    title: "Invoice early-payment discount|Skonto bei Rechnung|Ẹ̀dinwó ìsanwó ṣáájú|Invoice early-payment discount",
    description: "Calculate the discounted payment and annualized simple cost of waiting until the later due date.|Skontozahlung und einfach hochgerechnete Kosten der späteren Zahlung bestimmen.|Ṣírò owó pẹ̀lú ẹ̀dinwó àti ìnáwó ìdúró sí ọjọ́ ìparí.|Find the discounted amount and simple yearly cost of waiting.",
    fields: [
      field("invoiceGrossValue", "Full invoice amount|Voller Rechnungsbetrag|Gbogbo iye ìwé owó|Full invoice amount", 0.000001, 1000000000000, false),
      field("invoiceEarlyDiscount", "Early payment discount (%)|Skonto (%)|Ẹ̀dinwó ìsanwó ṣáájú (%)|Early payment discount (%)", 0, 100, false),
      field("invoiceExtraDays", "Extra days until full payment is due|Zusätzliche Tage bis zur Vollzahlung|Ọjọ́ àfikún sí ìsanwó pípé|Extra days until full payment", 0.000001, 1000000000000, false),
    ],
    outputs: ["Early payment amount|Skontobetrag zur Zahlung|Iye ìsanwó ṣáájú|Early payment amount","Simple annualized waiting cost (%)|Linear annualisierte Wartekosten (%)|Ìnáwó ìdúró ọdọọdún (%)|Simple yearly waiting cost (%)"],
    calculate: (a,d,t)=>{requireField(d<100,'invoiceEarlyDiscount');return [a*(1-d/100),100*d/(100-d)*365/t];},
  },

  "trade-invoice-unit-landed": {
    category: "Trading",
    title: "Landed unit cost|Einstandskosten je Einheit|Iye ọjà tó dé lọ́wọ́|Landed unit cost",
    description: "Allocate freight and charges to the units that can be sold.|Fracht und Gebühren auf verkaufbare Einheiten umlegen.|Pín owó ẹrù àti owó iṣẹ́ sí ẹyọ tí a lè tà.|Share freight and charges over only the units you can sell.",
    fields: [
      field("landedInvoice", "Supplier invoice total|Lieferantenrechnung gesamt|Gbogbo ìwé owó olùpèsè|Supplier invoice total", 0, 1000000000000, false),
      field("landedFreight", "Inbound freight|Eingangsfracht|Owó ẹrù wọlé|Inbound freight", 0, 1000000000000, false),
      field("landedCharges", "Other inbound charges|Weitere Bezugskosten|Owó míì fún gbígbà ọjà|Other inbound charges", 0, 1000000000000, false),
      field("landedGoodUnits", "Sellable units received|Erhaltene verkaufbare Einheiten|Ẹyọ tí a lè tà tí a gbà|Sellable units received", 1, 1000000000000, true),
    ],
    outputs: ["Total landed cost|Gesamte Bezugskosten|Gbogbo ináwó gbígbà|Total landed cost","Landed cost per sellable unit|Bezugskosten je verkaufbarer Einheit|Ináwó fún ẹyọ tí a lè tà|Landed cost per sellable unit"],
    calculate: (a,b,c,u)=>[a+b+c,(a+b+c)/u],
  },

  "trade-fx-exchange-fee": {
    category: "Trading",
    title: "Foreign remittance receipt|Auslandsüberweisung netto|Owó àjèjì tí a gbà|Net foreign remittance",
    description: "Estimate the amount received after a sender fee, an entered exchange rate and a receiving fee.|Nettoempfang nach Absendergebühr, Wechselkurs und Empfängergebühr schätzen.|Ṣírò owó tí a gba lẹ́yìn owó iṣẹ́ méjèèjì àti oṣuwọn owó.|Find what lands after sender fee, exchange rate and receiving fee.",
    fields: [
      field("remittanceSource", "Send amount in source currency|Sendebetrag in Ausgangswährung|Iye owó tí a rán|Send amount in source currency", 0.000001, 1000000000000, false),
      field("remittanceSenderFee", "Fee deducted in source currency|Abzug in Ausgangswährung|Owó iṣẹ́ tí a yọ|Fee deducted in source currency", 0, 1000000000000, false),
      field("remittanceQuoteRate", "Target units per source unit|Zieleinheiten je Ausgangseinheit|Ẹyọ owó tuntun fún ẹyọ àkọ́kọ́|Target units per source unit", 0.000001, 1000000000000, false),
      field("remittanceReceiverFee", "Receiving fee in target currency|Empfangsgebühr in Zielwährung|Owó iṣẹ́ gbígbà|Receiving fee in target currency", 0, 1000000000000, false),
    ],
    outputs: ["Converted before receiver fee|Umrechnung vor Empfangsgebühr|Owó tuntun ṣáájú owó iṣẹ́|Converted before receiving fee","Net received|Nettoempfang|Owó gidi tí a gbà|Net received"],
    calculate: (s,f,r,e)=>{requireField(f<=s,'remittanceSenderFee');const x=(s-f)*r;requireField(e<=x,'remittanceReceiverFee');return [x,x-e];},
  },

  "trade-bond-price": {
    category: "Trading",
    title: "Fixed-rate bond price|Festzins-Anleihepreis|Iye ìwé ìdè owó|Fixed-rate bond price",
    description: "Discount annual coupon payments and principal at the entered annual yield. Prices are model estimates.|Jahreskupons und Nennwert mit der eingegebenen Jahresrendite abzinsen.|Dín èrè ọdún àti iye ojú ìwé kù pẹ̀lú ìpín tí a tẹ̀.|Discount yearly coupons and principal at the entered rate.",
    fields: [
      field("bondFaceValue", "Face value|Nennwert|Iye ojú ìwé|Face value", 0.000001, 1000000000000, false),
      field("bondAnnualCouponRate", "Annual coupon rate (%)|Jährlicher Kupon (%)|Ìpín èrè ọdún (%)|Yearly coupon rate (%)", 0, 100, false),
      field("bondRequiredYield", "Annual discount yield (%)|Jährliche Abzinsungsrendite (%)|Ìpín ìdínkù ọdún (%)|Yearly discount yield (%)", 0, 100, false),
      field("bondRemainingYears", "Whole years to maturity|Volle Jahre bis Fälligkeit|Ọdún odidi tó kù|Full years to maturity", 1, 1000000000000, true),
    ],
    outputs: ["Annual coupon|Jahreskupon|Èrè ọdún|Yearly coupon","Estimated price|Geschätzter Kurs|Iye tí a fojú díwọ̀n|Estimated price"],
    calculate: (f,c,y,n)=>{const r=y/100,k=f*c/100,d=Math.exp(-n*Math.log1p(r));return [k,r?k*(-Math.expm1(-n*Math.log1p(r)))/r+f*d:f+k*n];},
  },

  "trade-real-return": {
    category: "Trading",
    title: "Inflation-adjusted investment return|Inflationsbereinigte Anlagerendite|Èrè gidi lẹ́yìn ìfikún owó|Inflation-adjusted return",
    description: "Convert nominal return to purchasing-power return for the same period.|Nominale Rendite desselben Zeitraums in Kaufkraftrendite umrechnen.|Yí èrè ojú padà sí èrè agbára rírà fún àkókò kan náà.|See what nominal return means for buying power in the same period.",
    fields: [
      field("tradeNominalPct", "Nominal return (%)|Nominale Rendite (%)|Èrè ojú (%)|Nominal return (%)", -1000000000000, 1000000000000, false),
      field("tradeInflationPct", "Inflation over the same period (%)|Inflation desselben Zeitraums (%)|Ìfikún owó ní àkókò náà (%)|Inflation for same period (%)", -1000000000000, 1000000000000, false),
    ],
    outputs: ["Real return (%)|Reale Rendite (%)|Èrè gidi (%)|Real return (%)"],
    calculate: (r,i)=>{requireField(r>=-100,'tradeNominalPct');requireField(i>-100,'tradeInflationPct');return [100*((100+r)/(100+i)-1)];},
  },

  "trade-profit-factor": {
    category: "Trading",
    title: "Trade profit factor|Profitfaktor im Handel|Ìpín èrè ìṣòwò|Trade profit factor",
    description: "Compare the sum of profitable trades against the absolute losses from losing trades.|Gewinnsumme mit dem absoluten Verlust verlustreicher Trades vergleichen.|Fi àpapọ̀ èrè wé àpapọ̀ òfo.|Compare total gains with the size of all losses.",
    fields: [
      field("journalGrossGains", "Sum of profitable trades|Summe der Gewinne|Àpapọ̀ èrè|Sum of profitable trades", 0, 1000000000000, false),
      field("journalGrossLosses", "Sum of losses as positive amount|Verlustsumme als positiver Betrag|Àpapọ̀ òfo gẹ́gẹ́ bí iye rere|Total losses as a positive amount", 0, 1000000000000, false),
      field("journalTradeCount", "Total closed trades|Abgeschlossene Geschäfte|Gbogbo ìṣòwò tí ó parí|Total closed trades", 1, 1000000000000, true),
    ],
    outputs: ["Profit factor|Profitfaktor|Ìpín èrè|Profit factor","Net gain per closed trade|Nettoergebnis je Geschäft|Èrè gidi fún ìṣòwò kan|Net gain per closed trade"],
    calculate: (g,l,n)=>[l?g/l:null,(g-l)/n],
  },

  "trade-benefit-expectancy": {
    category: "Trading",
    title: "Trade journal expectancy|Erwartungswert im Handelsjournal|Èrè àárín ìwé ìṣòwò|Trade journal expectancy",
    description: "Estimate mean result from winners, losers and any flat trades in a journal sample.|Durchschnittsergebnis aus Gewinnen, Verlusten und neutralen Trades einer Stichprobe schätzen.|Ṣírò èrè àárín láti inú ìṣòwò rere, òfo àti èyí tí kò yí.|Estimate average from wins, losses and flat trades in a journal sample.",
    fields: [
      field("journalWinningCount", "Winning trades|Gewinntrades|Ìṣòwò èrè|Winning trades", 0, 1000000000000, true),
      field("journalMeanWin", "Average gain per win|Durchschnittlicher Gewinn|Èrè àárín|Average gain per win", 0, 1000000000000, false),
      field("journalLosingCount", "Losing trades|Verlusttrades|Ìṣòwò òfo|Losing trades", 0, 1000000000000, true),
      field("journalMeanLoss", "Average loss magnitude|Durchschnittlicher Verlustbetrag|Òfo àárín|Average loss size", 0, 1000000000000, false),
      field("journalFlatCount", "Flat trades|Neutrale Trades|Ìṣòwò láìyí|Flat trades", 0, 1000000000000, true),
    ],
    outputs: ["Mean result per closed trade|Durchschnittsergebnis je Abschluss|Èrè àárín fún ìṣòwò kan|Average result per trade","Observed win share (%)|Beobachtete Gewinnquote (%)|Ìpín ìṣòwò èrè (%)|Observed win share (%)"],
    calculate: (w,g,l,c,f)=>{const n=w+l+f;requireField(n>0,'journalWinningCount');return [(w*g-l*c)/n,100*w/n];},
  },

  "trade-order-book-fill": {
    category: "Trading",
    title: "Two-level ask fill|Kauf über zwei Briefstufen|Rírà ní ìpele méjì|Two-level ask fill",
    description: "Simulate a buy against two ask levels, reporting a partial fill if the order exceeds displayed depth.|Kauf auf zwei Briefstufen simulieren. Bei größerer Order bleibt ein Teil offen.|Ṣírò rírà lórí iye méjì, kí o sì fìdí iye tí kò tíì rà múlẹ̀.|Simulate a buy on two ask levels and show any units wey never fill.",
    fields: [
      field("bookRequestedUnits", "Units requested|Angefragte Menge|Ẹyọ tí a béèrè|Units requested", 0.000001, 1000000000000, false),
      field("bookLowerAsk", "First ask price|Erster Briefkurs|Iye rírà àkọ́kọ́|First ask price", 0.000001, 1000000000000, false),
      field("bookLowerQuantity", "Units at first ask|Menge zur ersten Briefstufe|Ẹyọ ní iye àkọ́kọ́|Units at first ask", 0.000001, 1000000000000, false),
      field("bookHigherAsk", "Second ask price|Zweiter Briefkurs|Iye rírà kejì|Second ask price", 0.000001, 1000000000000, false),
      field("bookHigherQuantity", "Units at second ask|Menge zur zweiten Briefstufe|Ẹyọ ní iye kejì|Units at second ask", 0.000001, 1000000000000, false),
    ],
    outputs: ["Estimated paid amount|Geschätzter Kaufbetrag|Owó tí a fojú díwọ̀n|Estimated paid amount","Average filled price|Mittlerer Ausführungskurs|Iye rírà àárín|Average filled price","Units still unfilled|Offene Stücke|Ẹyọ tó kù|Units still unfilled"],
    calculate: (n,a,q,b,r)=>{requireField(b>=a,'bookHigherAsk');const x=Math.min(n,q),y=Math.min(n-x,r),cost=x*a+y*b;return [cost,cost/(x+y),n-x-y];},
  },

  "trade-contribution-return": {
    category: "Trading",
    title: "Cash-flow-adjusted period return|Periodenrendite nach Zahlungsströmen|Èrè àkókò lẹ́yìn owó wọlé|Cash-flow-adjusted period return",
    description: "Approximate one period’s return with one signed cash flow weighted by the fraction of the period it was invested.|Periodenrendite mit einem zeitgewichteten Zahlungsstrom annähern.|Fojú díwọ̀n èrè àkókò kan pẹ̀lú owó tí ó wọlé tàbí jáde àti ìpín àkókò.|Estimate one period return adjusting one deposit or withdrawal for time invested.",
    fields: [
      field("performanceOpening", "Opening portfolio value|Anfangswert des Bestands|Iye ìbẹ̀rẹ̀ àkójọpọ̀|Opening portfolio value", 0.000001, 1000000000000, false),
      field("performanceClosing", "Closing portfolio value|Endwert des Bestands|Iye ìparí àkójọpọ̀|Closing portfolio value", 0, 1000000000000, false),
      field("performanceCashFlow", "Net deposit or negative withdrawal|Nettoeinzahlung oder negative Auszahlung|Owó wọlé tàbí iye òdì fún owó jáde|Deposit or negative withdrawal", -1000000000000, 1000000000000, false),
      field("performanceRemainingPct", "Time remaining at cash flow (%)|Restzeit bei Zahlung (%)|Ìpín àkókò tó kù nígbà ìsanwó (%)|Time left when cash moved (%)", 0, 100, false),
    ],
    outputs: ["Gain excluding cash flow|Gewinn ohne Zahlungsstrom|Èrè láìka ìsanwó|Gain excluding cash flow","Approximate return (%)|Näherungsrendite (%)|Èrè tí a fojú díwọ̀n (%)|Estimated return (%)"],
    calculate: (a,b,c,t)=>{const base=a+c*t/100;requireField(base>0,'performanceCashFlow');const gain=b-a-c;return [gain,100*gain/base];},
  },

  "trade-simple-forward": {
    category: "Trading",
    title: "Forward price with carry|Terminkurs mit laufenden Kosten|Iye ọjọ́ iwájú pẹ̀lú ináwó|Forward price with carry",
    description: "Model a continuously compounded carry price using rates you enter. A signed net rate can represent income exceeding carrying costs.|Terminkurs mit stetiger Verzinsung und eingegebenem Nettokostensatz modellieren.|Ṣírò iye ọjọ́ iwájú pẹ̀lú ìpín ináwó tí o tẹ̀, tó lè jẹ́ òdì.|Model forward price with continuous carry at the signed rate you enter.",
    fields: [
      field("carrySpotPrice", "Spot price|Kassakurs|Iye lọ́wọ́|Spot price", 0.000001, 1000000000000, false),
      field("carryNetAnnualRate", "Annual net carry rate (%)|Jährlicher Nettokostensatz (%)|Ìpín ináwó ọdún (%)|Yearly net carry rate (%)", -1000000000000, 1000000000000, false),
      field("carrySettlementYears", "Years to settlement|Jahre bis Erfüllung|Ọdún sí ìparí|Years to settlement", 0, 1000000000000, false),
    ],
    outputs: ["Modeled forward price|Modellierter Terminkurs|Iye ọjọ́ iwájú tí a ṣírò|Modeled forward price","Forward minus spot|Terminkurs minus Kassakurs|Iye ọjọ́ iwájú dín iye lọ́wọ́|Forward minus spot"],
    calculate: (s,r,t)=>{const gap=s*Math.expm1(r*t/100);return [s+gap,gap];},
  },

  "trade-stock-split": {
    category: "Trading",
    title: "Stock split adjustment|Aktienanpassung beim Split|Àtúnṣe ìpín ọjà|Stock split adjustment",
    description: "Adjust share count and average cost for a split ratio without assuming cash settlement of fractions.|Aktienzahl und Durchschnittseinstand nach Splitverhältnis ohne Barausgleich anpassen.|Ṣàtúnṣe iye ẹyọ àti ináwó àárín láìka ìsanwó fún ẹyọ àjẹkù.|Adjust share count and average cost for a split without cash for fractions.",
    fields: [
      field("splitOriginalShares", "Current shares|Aktueller Aktienbestand|Ẹyọ ọjà lọ́wọ́|Current shares", 0.000001, 1000000000000, false),
      field("splitOriginalUnitCost", "Cost per original share|Einstand je alter Aktie|Ináwó fún ẹyọ àtijọ́|Cost per old share", 0, 1000000000000, false),
      field("splitNewRatio", "New shares in ratio|Neue Aktien im Verhältnis|Ẹyọ tuntun nínú ìpín|New shares in ratio", 1, 1000000000000, true),
      field("splitOldRatio", "Old shares in ratio|Alte Aktien im Verhältnis|Ẹyọ àtijọ́ nínú ìpín|Old shares in ratio", 1, 1000000000000, true),
    ],
    outputs: ["Theoretical new shares|Theoretisch neue Aktien|Ẹyọ tuntun tí a ṣírò|Theoretical new shares","Adjusted cost per share|Angepasster Einstand je Aktie|Ináwó tuntun fún ẹyọ|Adjusted cost per share"],
    calculate: (q,c,n,o)=>[q*n/o,c*o/n],
  },

  "trade-cash-secured-put": {
    category: "Trading",
    title: "Cash-secured put at expiration|Bar besicherte Verkaufsoption am Verfall|Àṣàyàn títà pẹ̀lú owó ìdábòbò|Cash-secured put at expiration",
    description: "Model a sold put at expiration using the entered strike, premium and total fees.|Eine verkaufte Put-Option am Verfall mit Basispreis, Prämie und Gebühren modellieren.|Ṣírò àṣàyàn títà ní ìparí pẹ̀lú iye ìmúṣẹ, owó àṣàyàn àti owó iṣẹ́.|Model a sold put at expiry using strike, premium and total fees.",
    fields: [
      field("putStrikePrice", "Strike price per unit|Basispreis je Einheit|Iye ìmúṣẹ ẹyọ|Strike price per unit", 0.000001, 1000000000000, false),
      field("putExpirationPrice", "Underlying price at expiry|Basiswertkurs am Verfall|Iye ọjà ní ìparí|Underlying price at expiry", 0, 1000000000000, false),
      field("putPremiumPerUnit", "Premium received per unit|Erhaltene Prämie je Einheit|Owó àṣàyàn fún ẹyọ|Premium received per unit", 0, 1000000000000, false),
      field("putCoveredUnits", "Total underlying units|Basiseinheiten insgesamt|Gbogbo ẹyọ àdéhùn|Total underlying units", 1, 1000000000000, true),
      field("putTradeFees", "Total fees|Gesamtgebühren|Gbogbo owó iṣẹ́|Total fees", 0, 1000000000000, false),
    ],
    outputs: ["Gross assignment value owed|Bruttoverpflichtung bei Zuteilung|Àpapọ̀ ìnáwó ìmúṣẹ|Gross assignment loss","Net result at expiry|Nettoergebnis am Verfall|Àbájáde gidi ní ìparí|Net result at expiry"],
    calculate: (k,s,p,q,f)=>{const loss=Math.max(0,k-s)*q;return [loss,p*q-loss-f];},
  },

  "trade-inventory-shrink": {
    category: "Trading",
    title: "Inventory shrink reconciliation|Inventurdifferenz|Ìyàtọ̀ ọjà inú ìkà|Stock shrink reconciliation",
    description: "Compare physical stock to book quantities and value the difference at cost.|Tatsächlichen Bestand mit Buchbestand vergleichen und die Differenz zum Einstand bewerten.|Fi iye ọjà gidi wé iye inú ìwé kí o sì ṣírò iye ìyàtọ̀.|Compare real count with book stock and price the difference at cost.",
    fields: [
      field("shrinkExpectedQty", "Book inventory units|Buchbestand in Einheiten|Ẹyọ nínú ìwé ọjà|Book inventory units", 1, 1000000000000, true),
      field("shrinkCountedQty", "Physical count units|Gezählter Bestand|Ẹyọ tí a kà|Physical count units", 0, 1000000000000, true),
      field("shrinkUnitCost", "Cost per unit|Kosten je Einheit|Ináwó fún ẹyọ|Cost per unit", 0, 1000000000000, false),
    ],
    outputs: ["Book minus counted units|Buchbestand minus Zählbestand|Ìwé ọjà dín iye tí a kà|Book minus counted units","Difference at cost|Differenz zum Einstand|Ìyàtọ̀ ní ináwó|Difference at cost","Difference share (%)|Differenzanteil (%)|Ìpín ìyàtọ̀ (%)|Difference share (%)"],
    calculate: (b,c,p)=>[b-c,(b-c)*p,100*(b-c)/b],
  },
};
