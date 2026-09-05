// SENTINEL-5P SO2 SCALE SENSITIVITY AUDIT
// Kryvyi Rih — MAM vs JJA 2024
//
// Read-only diagnostic audit.
// Purpose: test whether the central SO2 seasonal contrast is stable across
// reasonable AOI zonal-reduction scales.
//
// IMPORTANT:
// - This script does NOT search for an "optimal" spatial scale.
// - It does NOT alter the Master workflow or publication products.
// - It reproduces the verified SO2 ORBITAL_MONTHLY branch:
//     valid native Earth Engine L3 SO2 observations
//       -> calendar-month mean
//       -> equal-weight seasonal mean of valid monthly products.
// - Native Earth Engine L3 masking is retained.
// - No additional PRODUCT_QUALITY or qa_value filter is applied.
// - The tested scale changes ONLY the AOI zonal reduction.
// - The seasonal raster itself remains on the native Earth Engine L3 grid.
//
// Expected publication reference:
// MAM/JJA 2024 AOI ratio at 7000 m ≈ 8.845.

var AUDIT = {
  aoiAsset:
    'projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI',

  collection:
    'COPERNICUS/S5P/OFFL/L3_SO2',

  sourceBand:
    'SO2_column_number_density',

  year:
    2024,

  reductionCrs:
    'EPSG:4326',

  scalesM:
    [1113.2, 3500, 5500, 7000],

  maxPixels:
    1e9,

  tileScale:
    8,

  expectedSeasonMonthCount:
    3,

  createDriveCsvTask:
    false,

  driveFolder:
    'ARTICLE4_VALIDATION'
};


// ============================================================
// 1. AOI
// ============================================================

var AOI_SOURCE =
  ee.FeatureCollection(
    AUDIT.aoiAsset
  );

var AOI =
  AOI_SOURCE
    .geometry()
    .dissolve(1);

print('==================================================');
print('SO2 SCALE SENSITIVITY AUDIT');
print('AOI asset:', AUDIT.aoiAsset);
print('AOI source feature count:', AOI_SOURCE.size());
print(
  'AOI area, km2:',
  AOI.area(1).divide(1e6)
);
print('Year:', AUDIT.year);
print('Collection:', AUDIT.collection);
print('Band:', AUDIT.sourceBand);
print(
  'Aggregation:',
  'ORBITAL_MONTHLY -> equal-weight seasonal mean'
);
print(
  'Source QA:',
  'native Earth Engine L3 ingestion mask; no extra PRODUCT_QUALITY / qa_value filter'
);
print(
  'Tested AOI reduction scales, m:',
  AUDIT.scalesM
);


// ============================================================
// 2. SOURCE PREPARATION — MASTER-EQUIVALENT SO2 BRANCH
// ============================================================

function sourceForPeriod(
  startDate,
  endDate
) {

  return ee.ImageCollection(
    AUDIT.collection
  )
  .filterBounds(
    AOI
  )
  .filterDate(
    startDate,
    endDate
  )
  .map(
    function(imageObject) {

      var image =
        ee.Image(
          imageObject
        );

      return image
        .select(
          AUDIT.sourceBand
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
}


// ============================================================
// 3. MONTHLY PRODUCT
// ============================================================

function buildMonthlySo2(
  yearValue,
  monthValue
) {

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

  var source =
    sourceForPeriod(
      start,
      end
    );

  var sourceCount =
    source.size();

  var monthlyMean =
    source
      .mean()
      .rename(
        'SO2_monthly_mean'
      )
      .toFloat()
      .clip(
        AOI
      );

  var validMask =
    monthlyMean
      .mask()
      .gt(0)
      .rename(
        'monthly_valid_mask'
      )
      .toFloat()
      .clip(
        AOI
      );

  return ee.Image.cat([
    monthlyMean,
    validMask
  ])
  .set({
    'system:time_start':
      start.millis(),

    year:
      yearValue,

    month_of_year:
      monthValue,

    month:
      start.format(
        'YYYY-MM'
      ),

    source_asset_count:
      sourceCount
  });
}


// ============================================================
// 4. SEASONAL PRODUCT
// ============================================================

function buildSeason(
  yearValue,
  monthNumbers,
  seasonLabel
) {

  var images =
    monthNumbers.map(
      function(monthValue) {
        return buildMonthlySo2(
          yearValue,
          monthValue
        );
      }
    );

  var monthlyCollection =
    ee.ImageCollection
      .fromImages(
        images
      )
      .sort(
        'system:time_start'
      );

  var seasonMean =
    monthlyCollection
      .select(
        'SO2_monthly_mean'
      )
      .mean()
      .rename(
        'period_mean'
      )
      .toFloat()
      .clip(
        AOI
      );

  var validMonthCount =
    monthlyCollection
      .select(
        'monthly_valid_mask'
      )
      .sum()
      .rename(
        'valid_month_count'
      )
      .toFloat()
      .clip(
        AOI
      );

  var commonThreeMonthMask =
    validMonthCount
      .eq(
        AUDIT.expectedSeasonMonthCount
      );

  var strictSeasonMean =
    seasonMean
      .updateMask(
        commonThreeMonthMask
      )
      .rename(
        'period_mean'
      )
      .toFloat();

  return {
    image:
      strictSeasonMean,

    validMonthCount:
      validMonthCount,

    monthlyCollection:
      monthlyCollection,

    label:
      seasonLabel
  };
}


var MAM =
  buildSeason(
    AUDIT.year,
    [3, 4, 5],
    'MAM'
  );

var JJA =
  buildSeason(
    AUDIT.year,
    [6, 7, 8],
    'JJA'
  );


// ============================================================
// 5. STRUCTURAL CHECKS
// ============================================================

print('==================================================');
print('MONTHLY STRUCTURAL CHECKS');

print(
  'MAM month source counts:',
  MAM.monthlyCollection
    .aggregate_array(
      'source_asset_count'
    )
);

print(
  'JJA month source counts:',
  JJA.monthlyCollection
    .aggregate_array(
      'source_asset_count'
    )
);

print(
  'MAM month labels:',
  MAM.monthlyCollection
    .aggregate_array(
      'month'
    )
);

print(
  'JJA month labels:',
  JJA.monthlyCollection
    .aggregate_array(
      'month'
    )
);

print(
  'Seasonal raster source nominal scale, m:',
  MAM.image
    .projection()
    .nominalScale()
);

print(
  'Seasonal raster source projection:',
  MAM.image
    .projection()
);


// ============================================================
// 6. SCALE-DEPENDENT AOI STATISTICS
// ============================================================

function scaleStats(
  scaleValue
) {

  var scale =
    ee.Number(
      scaleValue
    );


  var mamStats =
    MAM.image.reduceRegion({
      reducer:
        ee.Reducer.mean()
          .combine({
            reducer2:
              ee.Reducer.count(),
            sharedInputs:
              true
          }),

      geometry:
        AOI,

      scale:
        scaleValue,

      crs:
        AUDIT.reductionCrs,

      maxPixels:
        AUDIT.maxPixels,

      tileScale:
        AUDIT.tileScale
    });


  var jjaStats =
    JJA.image.reduceRegion({
      reducer:
        ee.Reducer.mean()
          .combine({
            reducer2:
              ee.Reducer.count(),
            sharedInputs:
              true
          }),

      geometry:
        AOI,

      scale:
        scaleValue,

      crs:
        AUDIT.reductionCrs,

      maxPixels:
        AUDIT.maxPixels,

      tileScale:
        AUDIT.tileScale
    });


  var mamMean =
    ee.Number(
      mamStats.get(
        'period_mean_mean'
      )
    );

  var jjaMean =
    ee.Number(
      jjaStats.get(
        'period_mean_mean'
      )
    );

  var mamCellCount =
    ee.Number(
      mamStats.get(
        'period_mean_count'
      )
    );

  var jjaCellCount =
    ee.Number(
      jjaStats.get(
        'period_mean_count'
      )
    );


  var mamValidArea =
    ee.Image.pixelArea()
      .updateMask(
        MAM.image.mask()
      )
      .rename(
        'valid_area_m2'
      )
      .reduceRegion({
        reducer:
          ee.Reducer.sum(),

        geometry:
          AOI,

        scale:
          scaleValue,

        crs:
          AUDIT.reductionCrs,

        maxPixels:
          AUDIT.maxPixels,

        tileScale:
          AUDIT.tileScale
      })
      .get(
        'valid_area_m2'
      );


  var jjaValidArea =
    ee.Image.pixelArea()
      .updateMask(
        JJA.image.mask()
      )
      .rename(
        'valid_area_m2'
      )
      .reduceRegion({
        reducer:
          ee.Reducer.sum(),

        geometry:
          AOI,

        scale:
          scaleValue,

        crs:
          AUDIT.reductionCrs,

        maxPixels:
          AUDIT.maxPixels,

        tileScale:
          AUDIT.tileScale
      })
      .get(
        'valid_area_m2'
      );


  var totalAoiArea =
    ee.Number(
      AOI.area(1)
    );


  var mamAreaM2 =
    ee.Number(
      mamValidArea
    );

  var jjaAreaM2 =
    ee.Number(
      jjaValidArea
    );


  var mamAreaFraction =
    mamAreaM2
      .divide(
        totalAoiArea
      );


  var jjaAreaFraction =
    jjaAreaM2
      .divide(
        totalAoiArea
      );


  var mamOverJja =
    mamMean
      .divide(
        jjaMean
      );


  var absoluteDifference =
    mamMean
      .subtract(
        jjaMean
      );


  var differenceSign =
    ee.String(
      ee.Algorithms.If(
        absoluteDifference.gt(0),
        'MAM_GT_JJA',
        ee.Algorithms.If(
          absoluteDifference.lt(0),
          'MAM_LT_JJA',
          'MAM_EQ_JJA'
        )
      )
    );


  return ee.Feature(
    null,
    {
      scale_m:
        scale,

      MAM_mean_mol_m2:
        mamMean,

      JJA_mean_mol_m2:
        jjaMean,

      MAM_over_JJA_ratio:
        mamOverJja,

      MAM_minus_JJA_mol_m2:
        absoluteDifference,

      MAM_minus_JJA_sign:
        differenceSign,

      MAM_valid_reduction_cells:
        mamCellCount,

      JJA_valid_reduction_cells:
        jjaCellCount,

      MAM_valid_area_km2:
        mamAreaM2.divide(1e6),

      JJA_valid_area_km2:
        jjaAreaM2.divide(1e6),

      MAM_valid_area_fraction:
        mamAreaFraction,

      JJA_valid_area_fraction:
        jjaAreaFraction,

      MAM_valid_area_percent:
        mamAreaFraction.multiply(100),

      JJA_valid_area_percent:
        jjaAreaFraction.multiply(100),

      reduction_crs:
        AUDIT.reductionCrs,

      interpretation:
        'Diagnostic AOI zonal-reduction scale sensitivity only; seasonal raster construction unchanged.'
    }
  );
}


var SCALE_RESULTS =
  ee.FeatureCollection(
    AUDIT.scalesM.map(
      function(scaleValue) {
        return scaleStats(
          scaleValue
        );
      }
    )
  );


// ============================================================
// 7. REFERENCE-TO-7000 COMPARISON
// ============================================================

var REFERENCE_7000 =
  ee.Feature(
    SCALE_RESULTS
      .filter(
        ee.Filter.eq(
          'scale_m',
          7000
        )
      )
      .first()
  );


var REF_MAM =
  ee.Number(
    REFERENCE_7000.get(
      'MAM_mean_mol_m2'
    )
  );

var REF_JJA =
  ee.Number(
    REFERENCE_7000.get(
      'JJA_mean_mol_m2'
    )
  );

var REF_RATIO =
  ee.Number(
    REFERENCE_7000.get(
      'MAM_over_JJA_ratio'
    )
  );


var SCALE_RESULTS_WITH_DELTA =
  SCALE_RESULTS.map(
    function(featureObject) {

      var feature =
        ee.Feature(
          featureObject
        );

      var mam =
        ee.Number(
          feature.get(
            'MAM_mean_mol_m2'
          )
        );

      var jja =
        ee.Number(
          feature.get(
            'JJA_mean_mol_m2'
          )
        );

      var ratio =
        ee.Number(
          feature.get(
            'MAM_over_JJA_ratio'
          )
        );


      return feature.set({
        MAM_percent_difference_vs_7000:
          mam.subtract(
            REF_MAM
          )
          .divide(
            REF_MAM
          )
          .multiply(100),

        JJA_percent_difference_vs_7000:
          jja.subtract(
            REF_JJA
          )
          .divide(
            REF_JJA
          )
          .multiply(100),

        ratio_percent_difference_vs_7000:
          ratio.subtract(
            REF_RATIO
          )
          .divide(
            REF_RATIO
          )
          .multiply(100)
      });
    }
  );


// ============================================================
// 8. FLAT CONSOLE OUTPUT
// ============================================================

function fmt(
  value,
  digits
) {

  if (
    value === null ||
    value === undefined
  ) {
    return 'null';
  }

  if (
    typeof value === 'number' &&
    digits !== undefined
  ) {
    return value.toFixed(
      digits
    );
  }

  return String(
    value
  );
}


SCALE_RESULTS_WITH_DELTA.evaluate(
  function(result) {

    print('==================================================');
    print('SO2 SCALE SENSITIVITY — FLAT RESULTS');

    result.features.forEach(
      function(feature) {

        var p =
          feature.properties;

        print(
          [
            'scale=' +
              fmt(
                p.scale_m,
                1
              ) +
              'm',

            'MAM=' +
              fmt(
                p.MAM_mean_mol_m2,
                10
              ),

            'JJA=' +
              fmt(
                p.JJA_mean_mol_m2,
                10
              ),

            'MAM/JJA=' +
              fmt(
                p.MAM_over_JJA_ratio,
                4
              ),

            'sign=' +
              p.MAM_minus_JJA_sign,

            'MAMcells=' +
              fmt(
                p.MAM_valid_reduction_cells
              ),

            'JJAcells=' +
              fmt(
                p.JJA_valid_reduction_cells
              ),

            'MAMarea%=' +
              fmt(
                p.MAM_valid_area_percent,
                3
              ),

            'JJAarea%=' +
              fmt(
                p.JJA_valid_area_percent,
                3
              ),

            'dMAMvs7000%=' +
              fmt(
                p.MAM_percent_difference_vs_7000,
                4
              ),

            'dJJAvs7000%=' +
              fmt(
                p.JJA_percent_difference_vs_7000,
                4
              ),

            'dRatiovs7000%=' +
              fmt(
                p.ratio_percent_difference_vs_7000,
                4
              )
          ].join(
            ' | '
          )
        );
      }
    );

  }
);


// ============================================================
// 9. OPTIONAL CSV EXPORT
// ============================================================

if (
  AUDIT.createDriveCsvTask
) {

  Export.table.toDrive({
    collection:
      SCALE_RESULTS_WITH_DELTA,

    description:
      'ARTICLE4_VALIDATION_SO2_SCALE_SENSITIVITY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'SO2_scale_sensitivity_audit',

    fileFormat:
      'CSV'
  });
}


print('==================================================');
print('SO2 SCALE SENSITIVITY AUDIT READY');
print(
  'Interpretation rule:',
  'Do not select an optimal scale. Evaluate whether MAM > JJA, the MAM/JJA ratio, and spatial support remain stable across reasonable zonal-reduction scales.'
);
print(
  'Drive CSV export task:',
  AUDIT.createDriveCsvTask
    ? 'ENABLED'
    : 'DISABLED'
);
