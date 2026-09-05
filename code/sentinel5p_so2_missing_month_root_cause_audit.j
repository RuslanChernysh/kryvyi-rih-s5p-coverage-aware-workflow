// ARTICLE4_SO2_MISSING_MONTH_ROOT_CAUSE_AUDIT_V1_0_3
// Read-only diagnostic audit for Kryvyi Rih, 2019-2024.
// Purpose: identify the first stage at which SO2 months become unavailable/NA.
// This script does NOT modify the Master workflow, source assets, or publication outputs.

var AUDIT = {
  startYear: 2019,
  endYear: 2024,

  aoiAsset:
    'projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI',

  aoiId:
    'AOI_KRYVYI_RIH',

  assetFolder:
    'projects/ee-ruslan777chernysh/assets',

  collection:
    'COPERNICUS/S5P/OFFL/L3_SO2',

  band:
    'SO2_column_number_density',

  reductionCrs:
    'EPSG:4326',

  analysisScaleM:
    7000,

  tileScale:
    8,

  maxPixels:
    1e9,

  suspectMonths:
    [1, 11, 12]
};


// ============================================================
// 1. AOI
// ============================================================

var AOI_FC =
  ee.FeatureCollection(
    AUDIT.aoiAsset
  );

var AOI =
  AOI_FC
    .geometry()
    .dissolve(1);

var AOI_AREA_M2 =
  AOI.area(1);

Map.centerObject(
  AOI_FC,
  9
);

Map.addLayer(
  AOI,
  {
    color: 'FF0000'
  },
  'KRYVYI RIH AOI',
  false
);


// ============================================================
// 2. HEADER / MASTER-EQUIVALENT SO2 BRANCH
// ============================================================

print(
  '=================================================='
);

print(
  'SO2 MISSING-MONTH ROOT-CAUSE AUDIT'
);

print(
  'Study period:',
  AUDIT.startYear + '-' + AUDIT.endYear
);

print(
  'AOI asset:',
  AUDIT.aoiAsset
);

print(
  'AOI source feature count:',
  AOI_FC.size()
);

print(
  'AOI area, km2:',
  AOI_AREA_M2.divide(1e6)
);

print(
  'SO2 collection:',
  AUDIT.collection
);

print(
  'SO2 band:',
  AUDIT.band
);

print(
  'Master-equivalent aggregation:',
  'ORBITAL_MONTHLY'
);

print(
  'Master-equivalent source handling:',
  'NATIVE_L3_INGESTION_QA'
);

print(
  'Additional PRODUCT_QUALITY / qa_value filter:',
  'NONE'
);

print(
  'AOI analysis scale, m:',
  AUDIT.analysisScaleM
);

print(
  'Reduction CRS:',
  AUDIT.reductionCrs
);


// ============================================================
// 3. HELPERS
// ============================================================

function twoDigits(value) {

  return value < 10
    ? '0' + value
    : String(value);

}


function monthLabel(
  yearValue,
  monthValue
) {

  return String(yearValue) +
    '-' +
    twoDigits(monthValue);

}


function stage2aAssetId(
  yearValue
) {

  return AUDIT.assetFolder +
    '/ARTICLE4_STAGE2A_AOI_MONTHLY_' +
    AUDIT.aoiId +
    '_' +
    String(yearValue) +
    '_R02';

}


function maskedEmptyValue() {

  return ee.Image
    .constant(0)
    .rename('VALUE')
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(AOI);

}


function safeDictionaryGet(
  dictionary,
  key
) {

  dictionary =
    ee.Dictionary(
      dictionary
    );

  return ee.Algorithms.If(
    dictionary.contains(key),
    dictionary.get(key),
    null
  );

}


function safeNumberOrNull(
  value
) {

  return ee.Algorithms.If(
    ee.Algorithms.IsEqual(
      value,
      null
    ),
    null,
    ee.Number(value)
  );

}


// ============================================================
// 4. FULL SOURCE INVENTORY
// ============================================================

var FULL_PERIOD_COLLECTION =
  ee.ImageCollection(
    AUDIT.collection
  )
  .filterDate(
    ee.Date.fromYMD(
      AUDIT.startYear,
      1,
      1
    ),
    ee.Date.fromYMD(
      AUDIT.endYear + 1,
      1,
      1
    )
  );

print(
  'Full-period SO2 source asset count, 2019-2024:',
  FULL_PERIOD_COLLECTION.size()
);

print(
  'Full-period PRODUCT_QUALITY histogram:',
  FULL_PERIOD_COLLECTION
    .aggregate_histogram(
      'PRODUCT_QUALITY'
    )
);

print(
  'Full-period PROCESSING_STATUS histogram:',
  FULL_PERIOD_COLLECTION
    .aggregate_histogram(
      'PROCESSING_STATUS'
    )
);


// ============================================================
// 5. MONTH AUDIT
// ============================================================

function auditMonth(
  yearValue,
  monthValue
) {

  var label =
    monthLabel(
      yearValue,
      monthValue
    );

  var start =
    ee.Date.fromYMD(
      yearValue,
      monthValue,
      1
    );

  var end =
    start.advance(
      1,
      'month'
    );


  // ----------------------------------------------------------
  // Stage 1: source after filterDate only
  // ----------------------------------------------------------

  var dateFiltered =
    ee.ImageCollection(
      AUDIT.collection
    )
    .filterDate(
      start,
      end
    );


  // ----------------------------------------------------------
  // Stage 2: source after filterDate + filterBounds(AOI)
  // ----------------------------------------------------------

  var aoiFiltered =
    dateFiltered
      .filterBounds(
        AOI
      );


  // ----------------------------------------------------------
  // Stage 3: Master-equivalent SO2 source selection
  //
  // v1.0.0 SO2 uses NATIVE_L3_INGESTION_QA.
  // Therefore there is NO extra qa_value or PRODUCT_QUALITY
  // filter in the Master branch.
  // ----------------------------------------------------------

  var qaEquivalent =
    aoiFiltered;


  // ----------------------------------------------------------
  // Stage 4: selected value band / native L3 validity mask
  // ----------------------------------------------------------

  var prepared =
    qaEquivalent.map(
      function(imageObject) {

        var image =
          ee.Image(
            imageObject
          );

        return image
          .select(
            AUDIT.band
          )
          .rename(
            'VALUE'
          )
          .toFloat()
          .copyProperties(
            image,
            [
              'system:time_start',
              'ORBIT',
              'PRODUCT_ID',
              'PRODUCT_QUALITY',
              'PROCESSING_STATUS',
              'SPATIAL_RESOLUTION'
            ]
          );

      }
    );


  // ----------------------------------------------------------
  // Stage 5: orbital-monthly composite
  // ----------------------------------------------------------

  var preparedCount =
    prepared.size();

  var monthlyMean =
    ee.Image(
      ee.Algorithms.If(
        preparedCount.gt(0),
        prepared
          .mean()
          .rename(
            'VALUE'
          )
          .toFloat()
          .clip(
            AOI
          ),
        maskedEmptyValue()
      )
    );


  // ----------------------------------------------------------
  // Stage 6: temporal support count
  // Per-pixel count of valid orbital L3 observations
  // ----------------------------------------------------------

  var supportCount =
    ee.Image(
      ee.Algorithms.If(
        preparedCount.gt(0),
        prepared
          .count()
          .rename(
            'temporal_support_count'
          )
          .toFloat()
          .clip(
            AOI
          ),
        ee.Image
          .constant(0)
          .rename(
            'temporal_support_count'
          )
          .toFloat()
          .clip(
            AOI
          )
      )
    );


  // ----------------------------------------------------------
  // Stage 7: AOI valid pixel count at Master analysis scale
  // ----------------------------------------------------------

  var validMask =
    monthlyMean
      .mask()
      .select(0)
      .gt(0)
      .rename(
        'valid'
      )
      .toByte();

  var validPixelCountDict =
    validMask
      .selfMask()
      .reduceRegion({
        reducer:
          ee.Reducer.count(),
        geometry:
          AOI,
        crs:
          AUDIT.reductionCrs,
        scale:
          AUDIT.analysisScaleM,
        maxPixels:
          AUDIT.maxPixels,
        tileScale:
          AUDIT.tileScale
      });

  var validPixelCount =
    safeDictionaryGet(
      validPixelCountDict,
      'valid'
    );


  // ----------------------------------------------------------
  // Stage 8: bounded AOI valid-sample fraction at 7000 m
  //
  // IMPORTANT:
  // A direct pixelArea sum on the 7000 m analysis grid can slightly
  // exceed the vector AOI area because edge cells are sampled on a
  // coarse grid. For the root-cause audit we therefore use a binary
  // valid-sample fraction, which is strictly bounded to [0, 1].
  // The approximate valid area is derived from AOI area × fraction.
  // ----------------------------------------------------------

  var validFractionDict =
    validMask
      .unmask(0)
      .reduceRegion({
        reducer:
          ee.Reducer.mean(),
        geometry:
          AOI,
        crs:
          AUDIT.reductionCrs,
        scale:
          AUDIT.analysisScaleM,
        maxPixels:
          AUDIT.maxPixels,
        tileScale:
          AUDIT.tileScale
      });

  var validSampleFraction =
    safeDictionaryGet(
      validFractionDict,
      'valid'
    );

  var validAreaApproxKm2 =
    ee.Algorithms.If(
      ee.Algorithms.IsEqual(
        validSampleFraction,
        null
      ),
      null,
      AOI_AREA_M2
        .multiply(
          ee.Number(
            validSampleFraction
          )
        )
        .divide(1e6)
    );


  // ----------------------------------------------------------
  // Stage 9: AOI monthly mean at 7000 m
  // ----------------------------------------------------------

  var aoiMeanDict =
    monthlyMean
      .reduceRegion({
        reducer:
          ee.Reducer.mean(),
        geometry:
          AOI,
        crs:
          AUDIT.reductionCrs,
        scale:
          AUDIT.analysisScaleM,
        maxPixels:
          AUDIT.maxPixels,
        tileScale:
          AUDIT.tileScale
      });

  var aoiMean =
    safeDictionaryGet(
      aoiMeanDict,
      'VALUE'
    );


  // ----------------------------------------------------------
  // Stage 10: temporal support diagnostics at 7000 m
  // ----------------------------------------------------------

  var supportStatsDict =
    supportCount
      .reduceRegion({
        reducer:
          ee.Reducer
            .minMax()
            .combine(
              ee.Reducer.mean(),
              '',
              true
            ),
        geometry:
          AOI,
        crs:
          AUDIT.reductionCrs,
        scale:
          AUDIT.analysisScaleM,
        maxPixels:
          AUDIT.maxPixels,
        tileScale:
          AUDIT.tileScale
      });

  var supportMin =
    safeDictionaryGet(
      supportStatsDict,
      'temporal_support_count_min'
    );

  var supportMax =
    safeDictionaryGet(
      supportStatsDict,
      'temporal_support_count_max'
    );

  var supportMean =
    safeDictionaryGet(
      supportStatsDict,
      'temporal_support_count_mean'
    );


  // ----------------------------------------------------------
  // Stage 11: source metadata diagnostics
  // ----------------------------------------------------------

  var productQualityHistogram =
    qaEquivalent
      .aggregate_histogram(
        'PRODUCT_QUALITY'
      );

  var processingStatusHistogram =
    qaEquivalent
      .aggregate_histogram(
        'PROCESSING_STATUS'
      );


  // ----------------------------------------------------------
  // Stage 12: Stage-2A materialized row
  // ----------------------------------------------------------

  var stage2aYear =
    ee.FeatureCollection(
      stage2aAssetId(
        yearValue
      )
    );

  var stage2aMonthRows =
    stage2aYear
      .filter(
        ee.Filter.eq(
          'pollutant',
          'SO2'
        )
      )
      .filter(
        ee.Filter.eq(
          'month',
          label
        )
      );

  var stage2aRowCount =
    stage2aMonthRows.size();

  var stage2aFirstRow =
    ee.Feature(
      ee.Algorithms.If(
        stage2aRowCount.gt(0),
        stage2aMonthRows.first(),
        ee.Feature(null, {})
      )
    );

  var stage2aPropertyNames =
    stage2aFirstRow
      .propertyNames();

  var stage2aProperties =
    stage2aFirstRow
      .toDictionary();


  // ----------------------------------------------------------
  // Stage 13: diagnostic flags
  // ----------------------------------------------------------

  var sourceDateExists =
    dateFiltered
      .size()
      .gt(0);

  var sourceAoiExists =
    aoiFiltered
      .size()
      .gt(0);

  var validAoiPixelsExist =
    ee.Number(
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          validPixelCount,
          null
        ),
        0,
        validPixelCount
      )
    )
    .gt(0);

  var aoiMeanExists =
    ee.Number(
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          aoiMean,
          null
        ),
        0,
        1
      )
    )
    .eq(1);

  var stage2aRowExists =
    stage2aRowCount
      .gt(0);


  // ----------------------------------------------------------
  // Stage 14: first detected failure stage
  // ----------------------------------------------------------

  var failureStage =
    ee.String(
      ee.Algorithms.If(
        sourceDateExists.not(),
        'SOURCE_DATE_EMPTY',

        ee.Algorithms.If(
          sourceAoiExists.not(),
          'AOI_FILTER_EMPTY',

          ee.Algorithms.If(
            preparedCount.eq(0),
            'MASTER_EQUIVALENT_SOURCE_SELECTION_EMPTY',

            ee.Algorithms.If(
              validAoiPixelsExist.not(),
              'NO_VALID_AOI_PIXELS_AFTER_NATIVE_L3_MASK',

              ee.Algorithms.If(
                ee.Algorithms.IsEqual(
                  aoiMean,
                  null
                ),
                'AOI_MEAN_NULL',

                ee.Algorithms.If(
                  stage2aRowExists.not(),
                  'STAGE2A_ROW_MISSING',

                  'SOURCE_COMPOSITE_AND_STAGE2A_ROW_PRESENT'
                )
              )
            )
          )
        )
      )
    );


  // ----------------------------------------------------------
  // Stage 15: audit feature
  // ----------------------------------------------------------

  return ee.Feature(
    null,
    {
      pollutant:
        'SO2',

      year:
        yearValue,

      month_number:
        monthValue,

      month:
        label,

      suspect_month:
        AUDIT.suspectMonths
          .indexOf(
            monthValue
          ) !== -1,

      date_filtered_size:
        dateFiltered.size(),

      aoi_filtered_size:
        aoiFiltered.size(),

      qa_equivalent_size:
        qaEquivalent.size(),

      prepared_source_size:
        preparedCount,

      product_quality_histogram:
        productQualityHistogram,

      processing_status_histogram:
        processingStatusHistogram,

      monthly_composite_source_exists:
        preparedCount.gt(0),

      valid_aoi_pixel_count_7000m:
        validPixelCount,

      valid_sample_fraction_7000m:
        validSampleFraction,

      valid_area_approx_km2:
        validAreaApproxKm2,

      aoi_mean_mol_m2:
        aoiMean,

      aoi_mean_exists:
        aoiMeanExists,

      support_min:
        supportMin,

      support_mean:
        supportMean,

      support_max:
        supportMax,

      stage2a_asset_id:
        stage2aAssetId(
          yearValue
        ),

      stage2a_row_count:
        stage2aRowCount,

      stage2a_row_exists:
        stage2aRowExists,

      stage2a_property_names:
        stage2aPropertyNames,

      stage2a_row_properties:
        stage2aProperties,

      first_failure_stage:
        failureStage
    }
  );

}


// ============================================================
// 6. BUILD 72-MONTH AUDIT TABLE
// ============================================================

var auditFeatures = [];

for (
  var yearValue = AUDIT.startYear;
  yearValue <= AUDIT.endYear;
  yearValue++
) {

  for (
    var monthValue = 1;
    monthValue <= 12;
    monthValue++
  ) {

    auditFeatures.push(
      auditMonth(
        yearValue,
        monthValue
      )
    );

  }

}

var AUDIT_TABLE =
  ee.FeatureCollection(
    auditFeatures
  );


// ============================================================
// 7. FLAT CONSOLE OUTPUT
//
// The audit is evaluated once and printed as plain one-line records.
// Nothing needs to be manually expanded in the Earth Engine Console.
// ============================================================

function formatValue(value, digits) {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'number' && digits !== undefined) {
    return value.toFixed(digits);
  }

  return String(value);
}


function makeAuditLine(properties) {

  return [
    properties.suspect_month ? '[SUSPECT]' : '[OK]',
    properties.month,

    'date=' + formatValue(properties.date_filtered_size),
    'bounds=' + formatValue(properties.aoi_filtered_size),
    'qa=' + formatValue(properties.qa_equivalent_size),
    'prepared=' + formatValue(properties.prepared_source_size),

    'validPix=' + formatValue(properties.valid_aoi_pixel_count_7000m),
    'validAreaApproxKm2=' + formatValue(properties.valid_area_approx_km2, 3),
    'validFraction=' + formatValue(properties.valid_sample_fraction_7000m, 6),

    'AOImean=' + formatValue(properties.aoi_mean_mol_m2, 10),

    'supportMin=' + formatValue(properties.support_min, 3),
    'supportMean=' + formatValue(properties.support_mean, 3),
    'supportMax=' + formatValue(properties.support_max, 3),

    'Stage2Arows=' + formatValue(properties.stage2a_row_count),

    'FAIL=' + formatValue(properties.first_failure_stage)
  ].join(' | ');
}


function countByFailure(rows) {

  var summary = {};

  rows.forEach(function(row) {

    var key =
      row.properties.first_failure_stage ||
      'NULL';

    summary[key] =
      (summary[key] || 0) + 1;

  });

  return summary;
}


function printRows(title, rows) {

  print('==================================================');
  print(title);
  print('ROW COUNT: ' + rows.length);

  rows.forEach(function(row) {
    print(makeAuditLine(row.properties));
  });
}


AUDIT_TABLE.evaluate(
  function(result) {

    if (!result || !result.features) {

      print(
        'ERROR: AUDIT_TABLE could not be evaluated.'
      );

      return;
    }


    var rows =
      result.features.slice();


    rows.sort(
      function(a, b) {

        var pa =
          a.properties;

        var pb =
          b.properties;

        if (pa.year !== pb.year) {
          return pa.year - pb.year;
        }

        return pa.month_number - pb.month_number;
      }
    );


    var suspectRows =
      rows.filter(
        function(row) {
          return row.properties.suspect_month === true;
        }
      );


    var controlRows =
      rows.filter(
        function(row) {

          return [2, 3, 10]
            .indexOf(
              row.properties.month_number
            ) !== -1;

        }
      );


    var sourcePresentMeanNull =
      rows.filter(
        function(row) {

          var p =
            row.properties;

          return (
            Number(p.prepared_source_size) > 0 &&
            Number(p.aoi_mean_exists) !== 1
          );

        }
      );


    var recomputedValidStage2aMissing =
      rows.filter(
        function(row) {

          var p =
            row.properties;

          return (
            Number(p.aoi_mean_exists) === 1 &&
            Number(p.stage2a_row_exists) !== 1
          );

        }
      );


    var suspectStage2aMissing =
      suspectRows.filter(
        function(row) {
          return Number(row.properties.stage2a_row_exists) !== 1;
        }
      );


    var suspectStage2aPresent =
      suspectRows.filter(
        function(row) {
          return Number(row.properties.stage2a_row_exists) === 1;
        }
      );


    print(
      '=================================================='
    );

    print(
      'SO2 ROOT-CAUSE AUDIT v1.0.3 — FLAT CONSOLE OUTPUT'
    );

    print(
      'Expected month records: 72'
    );

    print(
      'Actual audit rows: ' + rows.length
    );


    printRows(
      'FULL 72-MONTH AUDIT — ALL ROWS ALREADY EXPANDED',
      rows
    );


    printRows(
      'SUSPECT MONTHS — JAN / NOV / DEC',
      suspectRows
    );


    printRows(
      'CONTROL MONTHS — FEB / MAR / OCT',
      controlRows
    );


    print(
      '=================================================='
    );

    print(
      'ALL-MONTH FIRST-FAILURE-STAGE SUMMARY: ' +
      JSON.stringify(
        countByFailure(rows)
      )
    );


    print(
      'SUSPECT-MONTH FIRST-FAILURE-STAGE SUMMARY: ' +
      JSON.stringify(
        countByFailure(suspectRows)
      )
    );


    printRows(
      'SUSPECT MONTHS WITH Stage2A ROW PRESENT',
      suspectStage2aPresent
    );


    printRows(
      'SUSPECT MONTHS WITH Stage2A ROW MISSING',
      suspectStage2aMissing
    );


    printRows(
      'SOURCE PRESENT BUT AOI MEAN NULL',
      sourcePresentMeanNull
    );


    printRows(
      'VALID RECOMPUTED MONTH BUT Stage2A ROW MISSING',
      recomputedValidStage2aMissing
    );


    print(
      '=================================================='
    );

    print(
      'SO2 ROOT-CAUSE AUDIT COMPLETE'
    );

    print(
      'No Master code, source asset, Stage2A asset, or publication output was modified.'
    );

    print(
      '=================================================='
    );

    print(
      'SO2 ROOT-CAUSE AUDIT COMPLETE'
    );

    print(
      'No Master code, source asset, Stage2A asset, or publication output was modified.'
    );

  }
);
