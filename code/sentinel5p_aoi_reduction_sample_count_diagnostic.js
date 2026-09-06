// ============================================================================
// ARTICLE 4 — 698 vs 528 FINAL PROVENANCE DIAGNOSTIC
// ============================================================================
// PURPOSE:
// Determine why publication monthly AOI statistics report
// AOI_reduction_sample_count = 698, whereas Stage-2C annual spatial
// products return 528 sampled cells at EPSG:4326 / 1113.2 m.
//
// READ-ONLY DIAGNOSTIC.
// No exports.
// No source assets are modified.
//
// Test cases:
//   NO2: 2019-01 and annual 2019
//   CO : 2019-01 and annual 2019
//
// The diagnostic compares:
//   A) source-derived monthly composite
//   B) monthly reduction support
//   C) Stage-2C annual asset
//   D) explicit masks
//   E) projections/transforms
//   F) counts with scale only
//   G) counts with CRS + scale
//   H) pixel-center counts
//   I) valid areas
// ============================================================================


// ============================================================================
// 1. CONFIGURATION
// ============================================================================

var CONFIG = {
  aoiAsset:
    'projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI',

  reductionCrs: 'EPSG:4326',

  no2ScaleM: 1113.2,
  coScaleM: 1113.2,

  tileScale: 8,
  maxPixels: 1e9
};

var ANNUAL_ASSETS = {
  NO2:
    'projects/ee-ruslan777chernysh/assets/' +
    'ARTICLE4_STAGE2C_ANNUAL_NO2_AOI_KRYVYI_RIH_2019_R01',

  CO:
    'projects/ee-ruslan777chernysh/assets/' +
    'ARTICLE4_STAGE2C_ANNUAL_CO_AOI_KRYVYI_RIH_2019_R01'
};

var POLLUTANTS = {

  NO2: {
    collection: 'COPERNICUS/S5P/OFFL/L3_NO2',
    band: 'tropospheric_NO2_column_number_density',
    scaleM: CONFIG.no2ScaleM,
    nominalOnly: true
  },

  CO: {
    collection: 'COPERNICUS/S5P/OFFL/L3_CO',
    band: 'CO_column_number_density',
    scaleM: CONFIG.coScaleM,
    nominalOnly: false
  }
};


// ============================================================================
// 2. AOI
// ============================================================================

var AOI_FC = ee.FeatureCollection(CONFIG.aoiAsset);
var AOI = AOI_FC.geometry().dissolve(1);

print('==================================================');
print('=== ARTICLE 4 — 698 vs 528 FINAL PROVENANCE DIAGNOSTIC ===');
print('AOI asset:', CONFIG.aoiAsset);
print('AOI source feature count:', AOI_FC.size());
print('AOI area, km2:', AOI.area(1).divide(1e6));
print('Reduction CRS:', CONFIG.reductionCrs);
print('NO2 scale, m:', CONFIG.no2ScaleM);
print('CO scale, m:', CONFIG.coScaleM);
print('==================================================');

Map.centerObject(AOI_FC, 9);
Map.addLayer(AOI, {color: 'FF0000'}, 'AOI', false);


// ============================================================================
// 3. BASIC HELPERS
// ============================================================================

function emptyValueImage() {

  return ee.Image.constant(0)
    .rename('VALUE')
    .toFloat()
    .updateMask(ee.Image.constant(0))
    .clip(AOI);
}


function createSourceCollection(pollutantKey, startDate, endDate) {

  var cfg = POLLUTANTS[pollutantKey];

  var collection = ee.ImageCollection(cfg.collection)
    .filterBounds(AOI)
    .filterDate(startDate, endDate);

  if (cfg.nominalOnly) {
    collection = collection.filter(
      ee.Filter.eq('PRODUCT_QUALITY', 'NOMINAL')
    );
  }

  return collection
    .select(cfg.band)
    .map(function(image) {

      return ee.Image(image)
        .rename('VALUE')
        .toFloat()
        .copyProperties(
          image,
          ['system:time_start', 'system:index']
        );
    });
}


// ============================================================================
// 4. DAILY-FIRST MONTHLY COMPOSITE
// ============================================================================

function createDailyFirstMonthlyComposite(
  pollutantKey,
  year,
  month
) {

  var start = ee.Date.fromYMD(year, month, 1);
  var end = start.advance(1, 'month');

  var monthlySource =
    createSourceCollection(
      pollutantKey,
      start,
      end
    );

  var numberOfDays =
    end.difference(start, 'day');

  var dayOffsets =
    ee.List.sequence(
      0,
      numberOfDays.subtract(1)
    );

  var dailyImages =
    ee.ImageCollection.fromImages(

      dayOffsets.map(function(offset) {

        offset = ee.Number(offset);

        var dayStart =
          start.advance(offset, 'day');

        var dayEnd =
          dayStart.advance(1, 'day');

        var dayCollection =
          monthlySource.filterDate(
            dayStart,
            dayEnd
          );

        var dayMean =
          ee.Image(
            ee.Algorithms.If(

              dayCollection.size().gt(0),

              dayCollection
                .mean()
                .rename('VALUE')
                .toFloat(),

              emptyValueImage()
            )
          );

        return dayMean.set(
          'system:time_start',
          dayStart.millis()
        );
      })
    );

  return dailyImages
    .mean()
    .rename('VALUE')
    .toFloat()
    .clip(AOI)
    .set({
      pollutant: pollutantKey,
      year: year,
      month: month,
      'system:time_start': start.millis()
    });
}


// ============================================================================
// 5. REDUCTION HELPERS
// ============================================================================


// ---------------------------------------------------------------------------
// 5A. Count using CRS + SCALE
// ---------------------------------------------------------------------------

function countCrsScale(image, bandName, scaleM) {

  image = ee.Image(image).rename(bandName);

  return image.reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get(bandName);
}


// ---------------------------------------------------------------------------
// 5B. Count using SCALE ONLY
//
// Important diagnostic:
// lets Earth Engine use the image's own projection context instead of
// explicitly forcing EPSG:4326.
// ---------------------------------------------------------------------------

function countScaleOnly(image, bandName, scaleM) {

  image = ee.Image(image).rename(bandName);

  return image.reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: AOI,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get(bandName);
}


// ---------------------------------------------------------------------------
// 5C. Mean + count exactly in the style used for publication AOI statistics
// ---------------------------------------------------------------------------

function meanCountCrsScale(image, bandName, scaleM) {

  image = ee.Image(image).rename(bandName);

  return image.reduceRegion({

    reducer:
      ee.Reducer.mean()
        .combine({
          reducer2: ee.Reducer.count(),
          sharedInputs: true
        }),

    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  });
}


// ---------------------------------------------------------------------------
// 5D. Pixel-center count
//
// Creates a constant value at the projection/grid of the supplied image.
// This helps distinguish image-mask support from AOI/grid sampling.
// ---------------------------------------------------------------------------

function pixelCenterCount(image, scaleM) {

  var projection =
    ee.Image(image)
      .select(0)
      .projection();

  var constant =
    ee.Image.constant(1)
      .rename('CELL')
      .reproject(projection)
      .clip(AOI);

  return constant.reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get('CELL');
}


// ---------------------------------------------------------------------------
// 5E. Valid area
// ---------------------------------------------------------------------------

function validArea(image, scaleM) {

  var mask =
    ee.Image(image)
      .select(0)
      .mask()
      .gt(0);

  var areaImage =
    ee.Image.pixelArea()
      .updateMask(mask)
      .rename('AREA');

  return areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get('AREA');
}


// ---------------------------------------------------------------------------
// 5F. AOI-only constant count
// ---------------------------------------------------------------------------

function aoiConstantCount(scaleM) {

  var constant =
    ee.Image.constant(1)
      .rename('AOI_CELL')
      .clip(AOI);

  return constant.reduceRegion({
    reducer: ee.Reducer.count(),
    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get('AOI_CELL');
}


// ---------------------------------------------------------------------------
// 5G. AOI weighted sum
//
// Useful because boundary pixels may be weighted fractionally.
// ---------------------------------------------------------------------------

function aoiWeightedSum(scaleM) {

  var constant =
    ee.Image.constant(1)
      .rename('AOI_WEIGHT')
      .clip(AOI);

  return constant.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: AOI,
    crs: CONFIG.reductionCrs,
    scale: scaleM,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  }).get('AOI_WEIGHT');
}


// ============================================================================
// 6. MONTHLY vs ANNUAL PROVENANCE TEST
// ============================================================================

function runDiagnostic(pollutantKey) {

  var cfg =
    POLLUTANTS[pollutantKey];

  var scaleM =
    cfg.scaleM;

  var year = 2019;
  var month = 1;

  var start =
    ee.Date.fromYMD(year, month, 1);

  var end =
    start.advance(1, 'month');


  // -------------------------------------------------------------------------
  // SOURCE COLLECTION
  // -------------------------------------------------------------------------

  var source =
    createSourceCollection(
      pollutantKey,
      start,
      end
    );


  // -------------------------------------------------------------------------
  // MONTHLY COMPOSITES
  // -------------------------------------------------------------------------

  var allSourceMonthlyMean =
    source.mean()
      .rename('VALUE')
      .toFloat()
      .clip(AOI);


  var dailyFirstMonthlyMean =
    createDailyFirstMonthlyComposite(
      pollutantKey,
      year,
      month
    );


  // -------------------------------------------------------------------------
  // FINAL STAGE-2C ANNUAL ASSET
  // -------------------------------------------------------------------------

  var annualAsset =
    ee.Image(
      ANNUAL_ASSETS[pollutantKey]
    );

  var annualMean =
    annualAsset
      .select('period_mean')
      .rename('VALUE');


  var annualValidMonthCount =
    annualAsset
      .select('valid_month_count')
      .rename('VALID_MONTH_COUNT');


  var annualMask =
    annualMean
      .mask()
      .rename('ANNUAL_MASK');


  var monthlyMask =
    dailyFirstMonthlyMean
      .mask()
      .rename('MONTHLY_MASK');


  // -------------------------------------------------------------------------
  // OUTPUT
  // -------------------------------------------------------------------------

  print('##################################################');
  print('FINAL 698 vs 528 DIAGNOSTIC');
  print('Pollutant:', pollutantKey);
  print('Test month:', '2019-01');
  print('Analysis scale, m:', scaleM);

  print('--------------------------------------------------');
  print('SOURCE');
  print('Source image count:', source.size());

  print('First source projection:',
    ee.Image(source.first()).projection()
  );


  print('--------------------------------------------------');
  print('MONTHLY — ALL-SOURCE MEAN');

  print(
    'All-source monthly mean count — CRS + scale:',
    countCrsScale(
      allSourceMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'All-source monthly mean count — scale only:',
    countScaleOnly(
      allSourceMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'All-source monthly mean mean+count dictionary:',
    meanCountCrsScale(
      allSourceMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'All-source monthly mean projection:',
    allSourceMonthlyMean.projection()
  );

  print(
    'All-source monthly valid area, m2:',
    validArea(
      allSourceMonthlyMean,
      scaleM
    )
  );


  print('--------------------------------------------------');
  print('MONTHLY — DAILY-FIRST');

  print(
    'Daily-first monthly count — CRS + scale:',
    countCrsScale(
      dailyFirstMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Daily-first monthly count — scale only:',
    countScaleOnly(
      dailyFirstMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Daily-first monthly mean+count dictionary:',
    meanCountCrsScale(
      dailyFirstMonthlyMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Daily-first monthly projection:',
    dailyFirstMonthlyMean.projection()
  );

  print(
    'Daily-first monthly mask count:',
    countCrsScale(
      monthlyMask,
      'MONTHLY_MASK',
      scaleM
    )
  );

  print(
    'Daily-first monthly valid area, m2:',
    validArea(
      dailyFirstMonthlyMean,
      scaleM
    )
  );

  print(
    'Daily-first monthly pixel-center count:',
    pixelCenterCount(
      dailyFirstMonthlyMean,
      scaleM
    )
  );


  print('--------------------------------------------------');
  print('ANNUAL — FINAL STAGE-2C ASSET');

  print(
    'Annual asset ID:',
    ANNUAL_ASSETS[pollutantKey]
  );

  print(
    'Annual asset bands:',
    annualAsset.bandNames()
  );

  print(
    'Annual period_mean count — CRS + scale:',
    countCrsScale(
      annualMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Annual period_mean count — scale only:',
    countScaleOnly(
      annualMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Annual period_mean mean+count dictionary:',
    meanCountCrsScale(
      annualMean,
      'VALUE',
      scaleM
    )
  );

  print(
    'Annual period_mean projection:',
    annualMean.projection()
  );

  print(
    'Annual valid_month_count projection:',
    annualValidMonthCount.projection()
  );

  print(
    'Annual period_mean mask count:',
    countCrsScale(
      annualMask,
      'ANNUAL_MASK',
      scaleM
    )
  );

  print(
    'Annual period_mean valid area, m2:',
    validArea(
      annualMean,
      scaleM
    )
  );

  print(
    'Annual period_mean pixel-center count:',
    pixelCenterCount(
      annualMean,
      scaleM
    )
  );


  print('--------------------------------------------------');
  print('AOI / GRID REFERENCE');

  print(
    'AOI-only constant count — CRS + scale:',
    aoiConstantCount(scaleM)
  );

  print(
    'AOI-only constant weighted sum — CRS + scale:',
    aoiWeightedSum(scaleM)
  );

  print(
    'AOI geodesic area, m2:',
    AOI.area(1)
  );


  // -------------------------------------------------------------------------
  // DIRECT MASK COMPARISON
  // -------------------------------------------------------------------------

  var monthlyValid =
    monthlyMask.gt(0)
      .unmask(0)
      .rename('MONTHLY_VALID');

  var annualValid =
    annualMask.gt(0)
      .unmask(0)
      .rename('ANNUAL_VALID');


  var monthlyNotAnnual =
    monthlyValid
      .and(annualValid.not())
      .rename('MONTHLY_NOT_ANNUAL')
      .toByte();


  var annualNotMonthly =
    annualValid
      .and(monthlyValid.not())
      .rename('ANNUAL_NOT_MONTHLY')
      .toByte();


  print('--------------------------------------------------');
  print('MASK COMPARISON');

  print(
    'Cells valid monthly but not annual:',
    countCrsScale(
      monthlyNotAnnual.selfMask(),
      'MONTHLY_NOT_ANNUAL',
      scaleM
    )
  );

  print(
    'Cells valid annual but not monthly:',
    countCrsScale(
      annualNotMonthly.selfMask(),
      'ANNUAL_NOT_MONTHLY',
      scaleM
    )
  );


  // -------------------------------------------------------------------------
  // VISUAL DIAGNOSTIC
  // -------------------------------------------------------------------------

  Map.addLayer(
    dailyFirstMonthlyMean,
    {},
    pollutantKey + ' 2019-01 daily-first',
    false
  );

  Map.addLayer(
    annualMean,
    {},
    pollutantKey + ' 2019 annual Stage-2C',
    false
  );

  Map.addLayer(
    monthlyNotAnnual.selfMask(),
    {min: 1, max: 1},
    pollutantKey + ' monthly valid / annual invalid',
    false
  );

  Map.addLayer(
    annualNotMonthly.selfMask(),
    {min: 1, max: 1},
    pollutantKey + ' annual valid / monthly invalid',
    false
  );


  print('##################################################');
}


// ============================================================================
// 7. RUN
// ============================================================================

runDiagnostic('NO2');
runDiagnostic('CO');


print('==================================================');
print('FINAL DIAGNOSTIC COMPLETE');
print('No export was created.');
print('No Earth Engine asset was modified.');
print('==================================================');
