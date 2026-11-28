import test from "node:test";
import assert from "node:assert/strict";
import {calculatePracticalTool, practicalTools} from "../src/practical-tools.js";
import {practicalExamples} from "./fixtures/practical-examples.js";

for (const [key, input, expected] of practicalExamples) {
  test(key + " calculates a realistic scenario in all four locales", () => {
    for (const locale of ["en", "de", "yo", "pcm"]) {
      const rows = calculatePracticalTool(key, input, locale);
      assert.equal(rows.length, expected.length);
      rows.forEach(([label, value], index) => {
        assert.ok(label.trim());
        assert.ok(Math.abs(value - expected[index]) < 1e-9, String(value));
      });
    }
    for (const {key: field} of practicalTools[key].fields) {
      assert.throws(() => calculatePracticalTool(key, {...input, [field]:""}), {field});
    }
  });
}

test("rejects invalid domains and handles real boundary conditions", () => {
  const run = (index, changes) => {
    const [key, input] = practicalExamples[index];
    return calculatePracticalTool(key, {...input, ...changes}).map(([,value])=>value);
  };
  assert.throws(() => run(0,{openingAreaM2:65}), {field:"openingAreaM2"});
  assert.throws(() => run(2,{tilesPerBox:1.5}), {field:"tilesPerBox"});
  assert.deepEqual(run(3,{rainfallMm:0}), [0,0]);
  assert.deepEqual(run(5,{bedWidthM:0.2}), [0,12,0]);
  assert.throws(() => run(6,{variableCost:30}), {field:"variableCost"});
  assert.deepEqual(run(6,{fixedCosts:1,sellingPrice:0.3,variableCost:0.2}), [0.1,10,3]);
  assert.throws(() => run(7,{downtimeMinutes:480}), {field:"downtimeMinutes"});
  assert.deepEqual(run(8,{targetGradePct:100}), [130,88]);
  assert.throws(() => run(11,{linkEfficiencyPct:0}), {field:"linkEfficiencyPct"});
  assert.deepEqual(run(12,{fenceRunM:2}), [1,2,2]);
  assert.deepEqual(run(13,{rampRiseCm:0}), [0,0,40]);
  assert.deepEqual(run(15,{batteryTargetPct:20}), [0,0,0]);
  assert.throws(() => run(15,{batteryTargetPct:10}), {field:"batteryTargetPct"});
  assert.throws(() => run(18,{pumpOverallEfficiencyPct:0}), {field:"pumpOverallEfficiencyPct"});
  assert.deepEqual(run(20,{stockPositionUnits:100}), [60,70,0]);
  assert.deepEqual(run(21,{targetRequestsPerMinute:0}), [24,0]);
  assert.throws(() => run(22,{readingDaysPerWeek:8}), {field:"readingDaysPerWeek"});
  assert.deepEqual(run(24,{communityProjectBudget:1900}), [600,2100,0]);
  assert.deepEqual(run(26,{ballotsCastCount:0,validBallotsCount:0}), [0,0,null]);
  assert.throws(() => run(26,{validBallotsCount:601}), {field:"validBallotsCount"});
  assert.throws(() => run(27,{dcLoadAmps:50}), {field:"dcLoadAmps"});
  assert.deepEqual(run(29,{datasetRecordCount:1,validationSetPct:25,testSetPct:25}), [1,0,0]);
  assert.throws(() => run(29,{validationSetPct:90}), {field:"testSetPct"});
  assert.deepEqual(run(31,{closedRequestsWeek:30}), [90,null]);
});
