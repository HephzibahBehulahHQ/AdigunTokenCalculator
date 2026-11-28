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
  assert.throws(() => run(32,{ledSupplyVolts:6}), {field:"ledsInSeries"});
  assert.deepEqual(run(33,{currentAccountValue:0}), [1000,100,null]);
  assert.throws(() => run(34,{modelBitsPerParameter:65}), {field:"modelBitsPerParameter"});
  assert.deepEqual(run(36,{scheduledBusinessMinutes:90}), [0,0,0]);
  assert.deepEqual(run(37,{transformerSecondaryAmps:0}), [12,0,0]);
  assert.throws(() => run(38,{favorableExitPrice:21}), {field:"favorableExitPrice"});
  assert.deepEqual(run(39,{reviewSamplePct:0}), [20,0,4]);
  assert.throws(() => run(41,{membersPresentForQuorum:22}), {field:"membersPresentForQuorum"});
  assert.throws(() => run(43,{fxAskQuote:1.1}), {field:"fxAskQuote"});
  assert.deepEqual(run(45,{comfortableHighestMidi:60}), [12,null,null]);
  assert.deepEqual(run(46,{seatsToAllocate:2,firstListVotes:10,secondListVotes:10,thirdListVotes:10}), [1,1,0]);
  assert.deepEqual(run(46,{seatsToAllocate:1e12,firstListVotes:1e12,secondListVotes:0,thirdListVotes:1e12}), [5e11,0,5e11]);
  assert.throws(() => run(48,{futuresExitPrice:99.9}), {field:"futuresExitPrice"});
  assert.deepEqual(run(49,{truePositiveCount:0,falsePositiveCount:0,falseNegativeCount:0}), [null,null,100,null]);
  assert.deepEqual(run(50,{packedItemsAvailable:300,stapleKgInStock:300}), [100,0,0,0]);
  assert.throws(() => run(51,{civicSurveySupporters:101}), {field:"civicSurveySupporters"});
  assert.deepEqual(run(52,{loopMeasuredMilliamps:0}), [-60,-25]);
  assert.deepEqual(run(53,{positionMaximumLoss:1}), [3.25,0,0]);
  assert.throws(() => run(54,{bytesPerVectorDimension:9}), {field:"bytesPerVectorDimension"});
  assert.deepEqual(run(55,{micUseHours:2,eventMicSpareSets:0}), [0,4,8]);
  assert.throws(() => run(56,{motionYesVotes:26}), {field:"motionYesVotes"});
});
