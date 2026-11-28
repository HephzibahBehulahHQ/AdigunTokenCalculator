export const practicalExamples = [
  ["paint-coverage", {wallAreaM2:60, openingAreaM2:10, paintCoats:2, coverageM2PerL:10, tinSizeL:3}, [10, 4]],
  ["concrete-slab", {slabLengthM:4, slabWidthM:3, slabDepthCm:10, concreteWastePct:10, bagYieldL:20}, [1.32, 66]],
  ["tile-order", {floorAreaM2:12, tileLengthCm:30, tileWidthCm:30, tileWastePct:10, tilesPerBox:8}, [147, 19]],
  ["rainwater-harvest", {roofAreaM2:80, rainfallMm:25, runoffPct:85, freeTankLitres:1000}, [1000, 700]],
  ["drip-irrigation", {gardenAreaM2:12, targetWaterMm:10, emitterCount:20, emitterLitresPerHour:2}, [120, 180]],
  ["plant-spacing", {bedLengthM:3, bedWidthM:1.2, plantSpacingCm:25, rowSpacingCm:30}, [4, 12, 48]],
  ["product-break-even", {fixedCosts:900, sellingPrice:30, variableCost:12}, [18, 50, 1500]],
  ["shift-staffing", {itemsToProcess:500, itemsPerStaffHour:12, shiftHours:8, downtimeMinutes:30}, [7.5, 6]],
  ["final-grade-target", {courseworkAveragePct:80, examWeightPct:40, targetGradePct:82}, [85, 88]],
  ["running-pace", {distanceRunKm:5, elapsedRunMinutes:25, finishDistanceKm:10}, [5, 12, 50]],
  ["print-resolution", {imageWidthPx:3000, imageHeightPx:2400, printWidthCm:25.4, printHeightCm:20.32, targetPrintPpi:300}, [300, 300, 25.4, 20.32]],
  ["download-time", {downloadSizeGb:9, linkSpeedMbps:100, linkEfficiencyPct:80}, [80, 15]],
];
