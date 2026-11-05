import test from "node:test";
import assert from "node:assert/strict";
import * as c from "../src/calculators/loadCalculator.js";
import {LOAD_COMPANY} from "../src/data/loadCompany.js";

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9 * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);
const customer = {customerName:"  Ada Example  ", phone:" +234 800 000 0000 ", email:" ada@example.test ",
  address:"  10 Example Street\r\nLagos  ", reference:"EST-20261105-0042", date:"2026-11-05", taxPercent:0, taxLabel:"VAT", billingBasis:"day"};
const device = {name:"Kettle", watts:1000, quantity:2, hoursPerDay:2, pf:1};
const assemble = (billing = {}, devices = [device], settings = {tariff:0.25, currency:"EUR"}, v2 = {}) =>
  c.assembleLoadBill(devices, settings, v2, {...customer, ...billing});
const rejects = (billing, field, code) => assert.throws(() => assemble(billing), error =>
  error instanceof RangeError && error.field === field && error.code === code);
const reconcile = bill => {
  assert.equal(bill.subtotalCents, bill.lineItems.reduce((total, row) => total + row.periodCostCents, 0));
  assert.equal(bill.grandTotalCents, bill.subtotalCents + bill.taxAmountCents);
  assert.equal(bill.subtotal, bill.subtotalCents / 100);
  assert.equal(bill.taxAmount, bill.taxAmountCents / 100);
  assert.equal(bill.grandTotal, bill.grandTotalCents / 100);
  near(bill.summary.periodGrossCost - bill.summary.periodRenewableCredit, bill.summary.periodNetGridCost);
  assert.equal(bill.summary.periodNetGridCost, bill.subtotal);
};

test("load bill: deterministic references validate the calendar and four-digit sequence", () => {
  assert.equal(c.makeEstimateReference("2026-11-05", 42), "EST-20261105-0042");
  assert.equal(c.makeEstimateReference("2024-02-29", 0), "EST-20240229-0000");
  assert.equal(c.makeEstimateReference("2026-11-05", 9999), "EST-20261105-9999");
  assert.equal(c.makeEstimateReference("2026-11-05"), "EST-20261105-0001");
  for (const date of ["2026-02-29", "2026-04-31", "0000-01-01", "2026-1-01", "", null]) {
    assert.throws(() => c.makeEstimateReference(date, 1), error => error.code === "invalidDate" && error.field === "date");
  }
  for (const sequence of [-1, 10000, 1.5, NaN, "42"]) assert.throws(() => c.makeEstimateReference("2026-11-05", sequence));
});

test("load bill: approved company, explicit customer fields and device inputs assemble without losing Unicode or newlines", () => {
  const bill = assemble({customerName:"  Ọlá Example  ", taxLabel:"Sales Tax"});
  assert.equal(bill.company, LOAD_COMPANY);
  assert.deepEqual(bill.customer, {name:"Ọlá Example", phone:"+234 800 000 0000", email:"ada@example.test", address:"10 Example Street\nLagos"});
  assert.equal(bill.reference, customer.reference);assert.equal(bill.date, customer.date);assert.equal(bill.currency, "EUR");
  assert.equal(bill.taxLabel, "Sales Tax");assert.equal(bill.basis.type, "day");assert.equal(bill.basis.days, 1);
  const row = bill.lineItems[0];
  assert.equal(row.index, 0);assert.equal(row.description, "Kettle");assert.equal(row.quantity, 2);
  assert.equal(row.ratedW, 1000);assert.equal(row.hoursPerDay, 2);assert.equal(row.dailyKWh, 4);
  assert.equal(row.dailyCost, 1);assert.equal(row.periodCost, 1);assert.equal(bill.subtotal, 1);
  for (const key of ["load.message.estimates", "load.help.renewables", "load.help.battery", "loadV2.help.localCode", "loadV2.bill.noFinalInvoice"]) {
    assert.ok(bill.assumptionKeys.includes(key), key);
  }
  reconcile(bill);
});

test("load bill: name, separate phone and multiline address are individually required", () => {
  for (const field of ["customerName", "phone", "address"]) {
    for (const value of [undefined, "", " \n\t "]) rejects({[field]:value}, field, "requiredField");
  }
  assert.equal(assemble({email:""}).customer.email, "");
  assert.equal(assemble({email:undefined}).customer.email, "");
  rejects({email:"not-an-email"}, "email", "invalidEmail");
  rejects({email:"person@example.test\nother@example.test"}, "email", "invalidEmail");
  rejects({customerName:"x".repeat(121)}, "customerName", "invalidText");
  rejects({phone:123}, "phone", "invalidText");
  rejects({address:"x".repeat(2001)}, "address", "invalidText");
});

test("load bill: reference and editable date require real calendar values", () => {
  for (const date of ["", undefined, "2026-02-29", "2026-04-31", "2026-11-05T00:00:00Z", "0000-01-01"]) rejects({date}, "date", "invalidDate");
  for (const reference of ["", undefined, "EST-20261105-12", "EST-20260229-0042", "INV-20261105-0042", "EST-20261105-0042extra"]) rejects({reference}, "reference", "invalidReference");
  assert.equal(assemble({date:"2024-02-29"}).date, "2024-02-29");
});

test("load bill: zero, 15 and 100 percent tax reconcile with the chosen editable label", () => {
  for (const [taxPercent, taxAmount, grandTotal] of [[0,0,1], [15,0.15,1.15], [100,1,2]]) {
    const bill = assemble({taxPercent, taxLabel:"Levy"});
    assert.equal(bill.taxPercent, taxPercent);assert.equal(bill.taxAmount, taxAmount);assert.equal(bill.grandTotal, grandTotal);
    assert.equal(bill.taxLabel, "Levy");reconcile(bill);
  }
  assert.equal(assemble({taxPercent:undefined}).taxAmount, 0);
  for (const taxPercent of [-1, 100.01, NaN, Infinity, "15", null]) rejects({taxPercent}, "taxPercent", "invalidNumber");
  rejects({taxLabel:"  "}, "taxLabel", "requiredField");
});

test("load bill: half-cent line costs and half-cent tax use consistent currency rounding", () => {
  const small = {name:"Small load", watts:1000, hoursPerDay:1, pf:1};
  const bill = assemble({taxPercent:15}, [small, {...small, name:"Second load"}], {tariff:0.105});
  assert.deepEqual(bill.lineItems.map(row => row.periodCost), [0.11, 0.11]);
  assert.equal(bill.subtotal, 0.22);assert.equal(bill.taxAmount, 0.03);assert.equal(bill.grandTotal, 0.25);reconcile(bill);
  const tinyTax = assemble({taxPercent:15}, [small], {tariff:0.1});
  assert.equal(tinyTax.taxAmount, 0.02);assert.equal(tinyTax.grandTotal, 0.12);reconcile(tinyTax);
  assert.equal(assemble({}, [small], {tariff:1.005}).subtotal, 1.01);
});

test("load bill: daily TOU line order and renewable credits reconcile without a second deduction", () => {
  const ds = [
    {name:"Standard", watts:1000, hoursPerDay:1, pf:1, operatingWindow:{startHour:7, endHour:8}},
    {name:"Peak", watts:2000, hoursPerDay:1, pf:1, operatingWindow:{startHour:17, endHour:18}}
  ];
  const tariffBands = [{id:"peak", startHour:17, endHour:22, rate:0.6}, {id:"offPeak", startHour:22, endHour:7, rate:0.1}, {id:"standard", startHour:7, endHour:17, rate:0.3}];
  const bill = assemble({}, ds, {tariff:0.25, currency:"NGN", renewableOffsetKWh:1.5}, {touEnabled:true, tariffBands});
  assert.deepEqual(bill.lineItems.map(row => row.description), ["Standard", "Peak"]);
  assert.deepEqual(bill.lineItems.map(row => row.periodCost), [0.15, 0.6]);
  assert.equal(bill.currency, "NGN");assert.equal(bill.summary.tariff.mode, "tou");
  assert.deepEqual(bill.summary.tariff.bands, tariffBands);
  assert.equal(bill.summary.periodGrossCost, 1.5);assert.equal(bill.summary.periodRenewableCredit, 0.75);
  assert.equal(bill.subtotal, 0.75);near(bill.summary.periodNetGridKWh, 1.5);reconcile(bill);
});

test("load bill: selected seasonal month, weighted year and custom-day bases use the corresponding device costs", () => {
  const ds = [{name:"Seasonal", watts:1000, hoursPerDay:1, standbyW:10, pf:1}];
  const settings = {tariff:0.3, renewableOffsetKWh:0.5}, monthlyFactors = Array(12).fill(1);
  monthlyFactors[0] = 0;monthlyFactors[1] = 2;
  const v2 = {monthlyFactors, selectedMonth:2};
  const month = assemble({billingBasis:"month"}, ds, settings, v2);
  assert.equal(month.basis.days, 30);assert.equal(month.basis.selectedMonth, 2);assert.equal(month.basis.factor, 2);
  near(month.summary.periodKWh, 2.23 * 30);assert.equal(month.subtotal, 15.57);reconcile(month);
  const year = assemble({billingBasis:"year"}, ds, settings, v2);
  assert.equal(year.basis.days, 365);near(year.summary.periodKWh, 445.95);assert.equal(year.subtotal, 81.55);reconcile(year);
  const custom = assemble({billingBasis:"custom", customDays:10}, ds, settings, v2);
  assert.equal(custom.basis.days, 10);near(custom.summary.periodKWh, 12.3);assert.equal(custom.subtotal, 2.19);reconcile(custom);
  assert.equal(month.lineItems[0].dailyCost, 0.22);near(month.lineItems[0].dailyKWh, 1.23);
  assert.equal(month.summary.dailyCost, 0.22);assert.equal(month.summary.monthlyCost, 15.57);assert.equal(month.summary.annualCost, 81.55);
});

test("load bill: zero seasonal usage and excessive generation produce a nonnegative zero-cost bill", () => {
  const bill = assemble({billingBasis:"month", taxPercent:15}, [{name:"Seasonal", watts:1000, hoursPerDay:1}],
    {tariff:0.3, renewableOffsetKWh:10}, {monthlyFactors:Array(12).fill(0), selectedMonth:1});
  assert.equal(bill.summary.periodKWh, 0);assert.equal(bill.subtotal, 0);assert.equal(bill.taxAmount, 0);assert.equal(bill.grandTotal, 0);reconcile(bill);
  const empty = assemble({}, []);assert.equal(empty.lineItems.length, 0);assert.equal(empty.subtotal, 0);reconcile(empty);
});

test("load bill: billing period and currency ranges reject malformed inputs and unsafe totals", () => {
  rejects({billingBasis:"week"}, "billingBasis", "invalidNumber");
  for (const customDays of [0, -1, 3651, 1.5, NaN, "5"]) rejects({billingBasis:"custom", customDays}, "customDays", "invalidNumber");
  assert.equal(assemble({billingBasis:"custom", customDays:3650}).basis.days, 3650);
  assert.throws(() => assemble({}, [device], {tariff:1, currency:"<x>"}), error => error.field === "currency");
  assert.throws(() => assemble({}, [{name:"Huge", watts:1e12, hoursPerDay:24}], {tariff:1e6}), error => error.field === "money" && error.code === "overflow");
});

test("load bill: inputs remain unchanged and customer data is confined to the assembled object", () => {
  const input = {devices:[{...device}], settings:{tariff:0.25, currency:"GBP"}, v2:{monthlyFactors:Array(12).fill(1)}, billing:{...customer}};
  const snapshot = structuredClone(input);
  const bill = c.assembleLoadBill(input.devices, input.settings, input.v2, input.billing);
  assert.deepEqual(input, snapshot);
  bill.customer.name = "Changed output";bill.lineItems[0].description = "Changed output";
  assert.deepEqual(input, snapshot);assert.equal(bill.currency, "GBP");
  assert.equal(Object.hasOwn(bill.summary, "customer"), false);assert.equal(Object.hasOwn(bill.summary, "phone"), false);
});
