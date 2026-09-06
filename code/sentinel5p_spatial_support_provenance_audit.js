/***************************************************************
 * ARTICLE 4 — STAGE-2C / STAGE-2D SPATIAL-SUPPORT PROVENANCE AUDIT
 *
 * PURPOSE
 * -------
 * Diagnose the exact spatial-element support used by the
 * FINAL Stage-2C annual Assets and the Stage-2D long-term
 * change / hotspot-persistence products.
 *
 * IMPORTANT
 * ---------
 * - NO Sentinel-5P reprocessing.
 * - NO exports.
 * - NO modification of Assets.
 * - Reads only existing verified Stage-2C annual Assets.
 ***************************************************************/


/*** 0. CONFIGURATION ***/

var CONFIG = {

  aoiAsset:
    'projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI',

  aoiId:
    'AOI_KRYVYI_RIH',

  assetFolder:
    'projects/ee-ruslan777chernysh/assets',

  startYear:
    2019,

  endYear:
    2024,

  analysisScaleM:
    1113.2,

  reductionCrs:
    'EPSG:4326',

  maxPixels:
    1e9,

  tileScale:
    8,

  relativeChangeBaselineEpsilon:
    1e-10
};


/*** 1. AOI ***/

var AOI_SOURCE_FC =
  ee.FeatureCollection(
    CONFIG.aoiAsset
  );

var AOI_GEOM =
  AOI_SOURCE_FC
    .geometry()
    .dissolve(1);

var AOI_AREA_M2 =
  AOI_GEOM.area(1);


/*** 2. STAGE-2C ASSET HELPERS ***/

function stage2cAnnualAssetName(
  pollutantKey,
  yearValue
) {

  return 'ARTICLE4_STAGE2C_ANNUAL_' +
    pollutantKey +
    '_' +
    CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R01';
}


function stage2cAnnualAssetId(
  pollutantKey,
  yearValue
) {

  return CONFIG.assetFolder +
    '/' +
    stage2cAnnualAssetName(
      pollutantKey,
      yearValue
    );
}


function loadAnnualAsset(
  pollutantKey,
  yearValue
) {

  return ee.Image(
    stage2cAnnualAssetId(
      pollutantKey,
      yearValue
    )
  );
}


/*** 3. SAFE COUNT HELPER ***/

function countBand(
  image,
  bandName
) {

  var result =
    ee.Image(image)
      .select(bandName)
      .reduceRegion({

        reducer:
          ee.Reducer.count(),

        geometry:
          AOI_GEOM,

        scale:
          CONFIG.analysisScaleM,

        crs:
          CONFIG.reductionCrs,

        maxPixels:
          CONFIG.maxPixels,

        tileScale:
          CONFIG.tileScale
      });

  return result.get(
    bandName
  );
}


/*** 4. MASK COUNT HELPER ***/

function countMask(
  image,
  bandName
) {

  var maskImage =
    ee.Image(image)
      .select(bandName)
      .mask()
      .rename('MASK');

  var result =
    maskImage.reduceRegion({

      reducer:
        ee.Reducer.count(),

      geometry:
        AOI_GEOM,

      scale:
        CONFIG.analysisScaleM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      tileScale:
        CONFIG.tileScale
    });

  return result.get(
    'MASK'
  );
}


/*** 5. STRICT VALID-MONTH COUNT ***/

function countStrict12(
  image
) {

  var strictMask =
    ee.Image(image)
      .select(
        'valid_month_count'
      )
      .eq(12)
      .selfMask()
      .rename(
        'STRICT12'
      );

  var result =
    strictMask.reduceRegion({

      reducer:
        ee.Reducer.count(),

      geometry:
        AOI_GEOM,

      scale:
        CONFIG.analysisScaleM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      tileScale:
        CONFIG.tileScale
    });

  return result.get(
    'STRICT12'
  );
}


/*** 6. ANNUAL-ASSET DIAGNOSTIC ***/

function diagnoseAnnual(
  pollutantKey,
  yearValue
) {

  var image =
    loadAnnualAsset(
      pollutantKey,
      yearValue
    );

  print(
    '=================================================='
  );

  print(
    'ANNUAL ASSET PROVENANCE CHECK'
  );

  print(
    'Pollutant:',
    pollutantKey
  );

  print(
    'Year:',
    yearValue
  );

  print(
    'Asset ID:',
    stage2cAnnualAssetId(
      pollutantKey,
      yearValue
    )
  );

  print(
    'Band names:',
    image.bandNames()
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' period_mean count:',
    countBand(
      image,
      'period_mean'
    )
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' period_mean MASK count:',
    countMask(
      image,
      'period_mean'
    )
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' valid_month_count count:',
    countBand(
      image,
      'valid_month_count'
    )
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' strict 12/12 count:',
    countStrict12(
      image
    )
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' hotspot_p90 count:',
    countBand(
      image,
      'hotspot_p90'
    )
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' period_mean projection:',
    image
      .select('period_mean')
      .projection()
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' valid_month_count projection:',
    image
      .select('valid_month_count')
      .projection()
  );

  print(
    pollutantKey +
    ' ' +
    yearValue +
    ' hotspot_p90 projection:',
    image
      .select('hotspot_p90')
      .projection()
  );

  print(
    'strict_period_complete property:',
    image.get(
      'strict_period_complete'
    )
  );

  print(
    'valid_month_count_aoi property:',
    image.get(
      'valid_month_count_aoi'
    )
  );

  print(
    'expected_month_count property:',
    image.get(
      'expected_month_count'
    )
  );

  print(
    'hotspot_publication_eligible property:',
    image.get(
      'hotspot_publication_eligible'
    )
  );

  print(
    '=================================================='
  );
}


/*** 7. LONG-TERM PRODUCT RECONSTRUCTION
 *
 * EXACTLY follows the relevant Stage-2D logic:
 *
 * change =
 *   2024 period_mean - 2019 period_mean
 *
 * persistence =
 *   sum of annual hotspot_p90.unmask(0)
 ***************************************************************/

function diagnoseLongTerm(
  pollutantKey
) {

  var annualImages = [];

  for (
    var yearValue = CONFIG.startYear;
    yearValue <= CONFIG.endYear;
    yearValue++
  ) {

    annualImages.push(
      loadAnnualAsset(
        pollutantKey,
        yearValue
      )
      .set(
        'analysis_year',
        yearValue
      )
    );
  }


  var annualCollection =
    ee.ImageCollection
      .fromImages(
        annualImages
      )
      .sort(
        'analysis_year'
      );


  var startImage =
    loadAnnualAsset(
      pollutantKey,
      CONFIG.startYear
    );

  var endImage =
    loadAnnualAsset(
      pollutantKey,
      CONFIG.endYear
    );


  var startMean =
    startImage.select(
      'period_mean'
    );

  var endMean =
    endImage.select(
      'period_mean'
    );


  var absoluteChange =
    endMean
      .subtract(
        startMean
      )
      .rename(
        'absolute_change_2024_minus_2019'
      )
      .toFloat();


  var baselineSafeMask =
    startMean
      .abs()
      .gt(
        CONFIG.relativeChangeBaselineEpsilon
      );


  var relativeChange =
    absoluteChange
      .divide(
        startMean
      )
      .multiply(100)
      .rename(
        'relative_change_percent'
      )
      .updateMask(
        baselineSafeMask
      )
      .toFloat();


  /*
   * Reproduce Stage-2D persistence logic.
   */

  var hotspotOccurrenceCount =
    annualCollection
      .map(
        function(imageObject) {

          return ee.Image(
            imageObject
          )
          .select(
            'hotspot_p90'
          )
          .unmask(0)
          .rename(
            'hotspot_occurrence_count'
          );
        }
      )
      .sum()
      .rename(
        'hotspot_occurrence_count'
      )
      .toFloat();


  var hotspotPersistence =
    hotspotOccurrenceCount
      .divide(6)
      .rename(
        'hotspot_persistence_fraction'
      )
      .toFloat();


  /*
   * Counts for positive / negative endpoint change.
   */

  var negativeChange =
    relativeChange
      .lt(0)
      .selfMask()
      .rename(
        'NEGATIVE'
      );


  var positiveChange =
    relativeChange
      .gt(0)
      .selfMask()
      .rename(
        'POSITIVE'
      );


  var zeroChange =
    relativeChange
      .eq(0)
      .selfMask()
      .rename(
        'ZERO'
      );


  /*
   * Persistence categories.
   */

  var sixOfSix =
    hotspotOccurrenceCount
      .eq(6)
      .selfMask()
      .rename(
        'SIX_OF_SIX'
      );


  var fiveOrMore =
    hotspotOccurrenceCount
      .gte(5)
      .selfMask()
      .rename(
        'FIVE_OR_MORE'
      );


  var fourOfSix =
    hotspotOccurrenceCount
      .eq(4)
      .selfMask()
      .rename(
        'FOUR_OF_SIX'
      );


  print(
    '##################################################'
  );

  print(
    'LONG-TERM PROVENANCE CHECK'
  );

  print(
    'Pollutant:',
    pollutantKey
  );


  print(
    pollutantKey +
    ' 2019 period_mean count:',
    countBand(
      startImage,
      'period_mean'
    )
  );


  print(
    pollutantKey +
    ' 2024 period_mean count:',
    countBand(
      endImage,
      'period_mean'
    )
  );


  print(
    pollutantKey +
    ' absolute-change count:',
    countBand(
      absoluteChange,
      'absolute_change_2024_minus_2019'
    )
  );


  print(
    pollutantKey +
    ' relative-change count:',
    countBand(
      relativeChange,
      'relative_change_percent'
    )
  );


  print(
    pollutantKey +
    ' NEGATIVE relative-change count:',
    countBand(
      negativeChange,
      'NEGATIVE'
    )
  );


  print(
    pollutantKey +
    ' POSITIVE relative-change count:',
    countBand(
      positiveChange,
      'POSITIVE'
    )
  );


  print(
    pollutantKey +
    ' ZERO relative-change count:',
    countBand(
      zeroChange,
      'ZERO'
    )
  );


  print(
    pollutantKey +
    ' hotspot occurrence raster count:',
    countBand(
      hotspotOccurrenceCount,
      'hotspot_occurrence_count'
    )
  );


  print(
    pollutantKey +
    ' persistence raster count:',
    countBand(
      hotspotPersistence,
      'hotspot_persistence_fraction'
    )
  );


  print(
    pollutantKey +
    ' hotspot 6/6 count:',
    countBand(
      sixOfSix,
      'SIX_OF_SIX'
    )
  );


  print(
    pollutantKey +
    ' hotspot >=5/6 count:',
    countBand(
      fiveOrMore,
      'FIVE_OR_MORE'
    )
  );


  print(
    pollutantKey +
    ' hotspot 4/6 count:',
    countBand(
      fourOfSix,
      'FOUR_OF_SIX'
    )
  );


  print(
    pollutantKey +
    ' absolute-change projection:',
    absoluteChange.projection()
  );


  print(
    pollutantKey +
    ' persistence projection:',
    hotspotPersistence.projection()
  );


  /*
   * Histogram gives the complete recurrence distribution:
   * 0,1,2,3,4,5,6 years.
   */

  var persistenceHistogram =
    hotspotOccurrenceCount
      .reduceRegion({

        reducer:
          ee.Reducer.frequencyHistogram(),

        geometry:
          AOI_GEOM,

        scale:
          CONFIG.analysisScaleM,

        crs:
          CONFIG.reductionCrs,

        maxPixels:
          CONFIG.maxPixels,

        tileScale:
          CONFIG.tileScale
      });


  print(
    pollutantKey +
    ' FULL hotspot occurrence histogram:',
    persistenceHistogram
  );


  print(
    '##################################################'
  );
}


/*** 8. AOI CONTROL ***/

print(
  '=================================================='
);

print(
  '=== ARTICLE 4 — STAGE-2C / STAGE-2D SPATIAL-SUPPORT PROVENANCE AUDIT ==='
);

print(
  'AOI:',
  CONFIG.aoiId
);

print(
  'AOI area, km2:',
  AOI_AREA_M2.divide(1e6)
);

print(
  'Analysis scale:',
  CONFIG.analysisScaleM
);

print(
  'Reduction CRS:',
  CONFIG.reductionCrs
);

print(
  '=================================================='
);


/*** 9. ANNUAL ENDPOINT CHECKS ***/

diagnoseAnnual(
  'NO2',
  2019
);

diagnoseAnnual(
  'NO2',
  2024
);

diagnoseAnnual(
  'CO',
  2019
);

diagnoseAnnual(
  'CO',
  2024
);


/*** 10. SIX-YEAR LONG-TERM CHECKS ***/

diagnoseLongTerm(
  'NO2'
);

diagnoseLongTerm(
  'CO'
);


/*** 11. FINAL MESSAGE ***/

print(
  '=================================================='
);

print(
  'FINAL CHECK COMPLETE.'
);

print(
  'Compare especially:'
);

print(
  '1) annual period_mean count'
);

print(
  '2) relative-change count'
);

print(
  '3) persistence raster count'
);

print(
  '4) NO2 6/6 and >=5/6 counts'
);

print(
  '5) CO 4/6, >=5/6 and 6/6 counts'
);

print(
  '6) projections of annual/change/persistence rasters'
);

print(
  '=================================================='
);
