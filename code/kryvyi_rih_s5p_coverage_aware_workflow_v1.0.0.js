/*** 0. MASTER CONFIGURATION ***/

var CONFIG = {

  scriptVersion:
    'ARTICLE4_MASTER_MONITORING_SYSTEM_V1_0_RELEASE',

  verifiedStage1Version:
    'ARTICLE4_MULTIPOLLUTANT_ENGINE_V4_1_STAGE1_VERIFIED_R04',


  verifiedEngineVersion:
    'ARTICLE4_MULTIPOLLUTANT_ENGINE_V4_1_STAGE1_VERIFIED_R04',

  inputMaterializationVersion:
    'ARTICLE4_STAGE2A_YEAR_MATERIALIZATION_R02',

  stage2aVersion:
    'ARTICLE4_STAGE2A_YEAR_MATERIALIZATION_R02',

  stage2bVersion:
    'ARTICLE4_STAGE2B_PUBLICATION_TABLES_R02_VERIFIED',

  stage2cVersion:
    'ARTICLE4_STAGE2C_SPATIAL_PRODUCTS_ENGINE_R01_VERIFIED',

  stage2dVersion:
    'ARTICLE4_STAGE2D_PUBLICATION_EXPORTS_ENGINE_R01_VERIFIED_FINAL',


  runMode:
  'FINAL_PUBLICATION_EXPORT',

  activeYear:
    2024,

  activePollutant:
    'CO',

  startYear:
    2019,

  endYear:
    2024,

aoiAsset:
  'projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI',

aoiId:
  'AOI_KRYVYI_RIH',

  reductionCrs:
    'EPSG:4326',

  tileScale:
    8,

  maxPixels:
    1e9,

  hotspotPercentile:
    90,

  strictAnnualMonthCount:
    12,

  strictSeasonMonthCount:
    3,

  relativeChangeBaselineEpsilon:
    1e-10,

  assetFolder:
    'projects/ee-ruslan777chernysh/assets',

  spatialDriveFolder:
    'ARTICLE4_FINAL_SPATIAL_PRODUCTS',


  driveFolder:
    'ARTICLE4_FINAL_SPATIAL_PRODUCTS',

  tableDriveFolder:
    'ARTICLE4_FINAL_PUBLICATION_TABLES',

  figureDataDriveFolder:
    'ARTICLE4_FINAL_FIGURE_DATA',

  supplementDriveFolder:
    'ARTICLE4_FINAL_SUPPLEMENT',


  createYearlyTableAssetTask:
    true,


  createAnnualAssetTask:
    true,

  createGeoTiffTasks:
    false,

  createSummaryCsvTask:
    false,

  showMapPreview:
    false,

  smoothMapDisplayOnly:
    false,


  createPublicationTableCsvTasks:
    true,

  createFigureDataCsvTasks:
    true,

  createAnnualGeoTiffTasks:
    true,

  createLongTermGeoTiffTasks:
    true,

  createManifestCsvTasks:
    true,

  includeDiagnosticSo2AnnualGeoTiffs:
    false,

  includeSelectedSo2SeasonGeoTiffs:
    true,

  selectedAnnualGeoTiffYears:
    [2019, 2024],

selectedSo2SeasonYear:
  2024,

selectedSo2SeasonLabels:
  ['MAM', 'JJA'],


/*** MAP_PREVIEW / PUBLICATION_VISUALIZATION ***/


mapPreviewPollutant:
  'SO2',


mapPreviewYear:
  2024,


mapPreviewPeriod:
  'MAM',


mapDisplayMode:
  'PUBLICATION_RGB',


publicationPreviewOpacity:
  0.95,

publicationPreviewGamma:
  1.0,


publicationRangeLowPercentile:
  2,

publicationRangeHighPercentile:
  98,


publicationUseManualRange:
  false,

publicationManualMin:
  null,

publicationManualMax:
  null,


createPublicationRgbPreviewTask:
  false,


includePublicationRgbBatchInFinalExport:
  true,

publicationRgbDriveFolder:
  'ARTICLE4_FINAL_PUBLICATION_RGB',


publicationRgbRenderScaleM:
  10,

publicationRgbCrs:
  'EPSG:3857'
};


/*** 0.1 MASTER CONFIGURATION VALIDATION ***/

var MASTER_ALLOWED_MODES = [
  'VERIFY_ONE_YEAR',
  'MATERIALIZE_YEAR',
  'MATERIALIZE_ALL_YEARS',
  'SPATIAL_YEAR',
  'LONG_TERM_FROM_ASSETS',
  'MAP_PREVIEW',
  'PUBLICATION_RGB_BATCH_EXPORT',
  'FINAL_ACCEPTANCE',
  'FINAL_PUBLICATION_EXPORT'
];

if (MASTER_ALLOWED_MODES.indexOf(CONFIG.runMode) === -1) {
  throw new Error('Unknown CONFIG.runMode for MASTER RELEASE.');
}
/*** MAP PREVIEW CONFIGURATION VALIDATION ***/

var MASTER_ALLOWED_PREVIEW_POLLUTANTS = [
  'NO2',
  'SO2',
  'CO'
];

var MASTER_ALLOWED_PREVIEW_PERIODS = [
  'ANNUAL',
  'MAM',
  'JJA',
  'CHANGE'
];

var MASTER_ALLOWED_DISPLAY_MODES = [
  'SCIENTIFIC_GRID',
  'BILINEAR_DISPLAY',
  'PUBLICATION_RGB'
];


if (
  MASTER_ALLOWED_PREVIEW_POLLUTANTS
    .indexOf(CONFIG.mapPreviewPollutant) === -1
) {
  throw new Error(
    'CONFIG.mapPreviewPollutant must be NO2, SO2 or CO.'
  );
}


if (
  MASTER_ALLOWED_PREVIEW_PERIODS
    .indexOf(CONFIG.mapPreviewPeriod) === -1
) {
  throw new Error(
    'CONFIG.mapPreviewPeriod must be ANNUAL, MAM, JJA or CHANGE.'
  );
}


if (
  MASTER_ALLOWED_DISPLAY_MODES
    .indexOf(CONFIG.mapDisplayMode) === -1
) {
  throw new Error(
    'CONFIG.mapDisplayMode must be SCIENTIFIC_GRID, BILINEAR_DISPLAY or PUBLICATION_RGB.'
  );
}


if (
  Math.floor(CONFIG.mapPreviewYear) !==
    CONFIG.mapPreviewYear ||
  CONFIG.mapPreviewYear < CONFIG.startYear ||
  CONFIG.mapPreviewYear > CONFIG.endYear
) {
  throw new Error(
    'CONFIG.mapPreviewYear must be within the verified study period.'
  );
}


if (
  CONFIG.publicationUseManualRange &&
  (
    CONFIG.publicationManualMin === null ||
    CONFIG.publicationManualMax === null ||
    CONFIG.publicationManualMin >=
      CONFIG.publicationManualMax
  )
) {
  throw new Error(
    'Manual publication visualization range is invalid.'
  );
}
if (
  Math.floor(CONFIG.activeYear) !== CONFIG.activeYear ||
  CONFIG.activeYear < CONFIG.startYear ||
  CONFIG.activeYear > CONFIG.endYear
) {
  throw new Error('CONFIG.activeYear must be an integer from 2019 to 2024.');
}
/*** MASTER HELPER — EXACT PUBLICATION EXPORT GRID ***/


function getExactExportGrid(referenceImage) {

  var projectionInfo =
    ee.Image(referenceImage)
      .select(0)
      .projection()
      .getInfo();

  return {
    crs:
      projectionInfo.crs,

    crsTransform:
      projectionInfo.transform
  };
}

/*** 1. VERIFIED POLLUTANT CATALOG — STAGE-1 R04 ***/

var POLLUTANT_CATALOG = {

  NO2: {

    collection:
      'COPERNICUS/S5P/OFFL/L3_NO2',

    sourceBand:
      'tropospheric_NO2_column_number_density',

    longName:
      'Tropospheric nitrogen dioxide column number density',

    unit:
      'mol/m2',

    processingBranch:
      'NO2_DAILY_FIRST_LEVEL1',

    aggregationMode:
      'DAILY_FIRST',

    aggregationLabel:
      'daily-first calendar-month mean',

    sourceSelectionMode:
      'PRODUCT_QUALITY_NOMINAL',

    productQualityValue:
      'NOMINAL',

    qualityDescription:
      'PRODUCT_QUALITY = NOMINAL; native Earth Engine L3 NO2 validity screening retained',

    l3GridSpacingM:
      1113.2,

    analysisScaleM:
      1113.2,

    analysisScaleDescription:
      'Earth Engine L3 grid-scale AOI reduction',

    footprintMetadata:
      'TROPOMI footprint is coarser than the 1113.2 m Earth Engine L3 grid; not treated as independent 1.1 km observations',

    supportMode:
      'VALID_DAYS',

  supportDescription:
  'valid calendar days contributing to the monthly daily-first composite',

hotspotPublicationAllowed:
  true,

hotspotPublicationPolicy:
  'PUBLICATION_ELIGIBLE_IF_PERIOD_COMPLETE',

hotspotPublicationNote:
  'P90 hotspot may be used as an AOI-relative spatial indicator only for strictly complete annual or seasonal periods; it is not a regulatory exceedance threshold.',

allowStrictLongTermChange:
  true,

    visMin:
      0.0,

    visMax:
      0.00012
  },


  SO2: {

    collection:
      'COPERNICUS/S5P/OFFL/L3_SO2',

    sourceBand:
      'SO2_column_number_density',

    longName:
      'Sulfur dioxide column number density',

    unit:
      'mol/m2',

    processingBranch:
      'SO2_ORBITAL_MONTHLY_LEVEL1',

    aggregationMode:
      'ORBITAL_MONTHLY',

    aggregationLabel:
      'orbital-first calendar-month mean',

    sourceSelectionMode:
      'NATIVE_L3_INGESTION_QA',

    productQualityValue:
      null,

    qualityDescription:
      'native Earth Engine L3 SO2 ingestion QA retained; no additional qa_value or PRODUCT_QUALITY filter',

    l3GridSpacingM:
      1113.2,


    analysisScaleM:
      7000,

    analysisScaleDescription:
      '7000 m dissertation-compatible AOI analysis scale; not the native Earth Engine L3 pixel size',

    footprintMetadata:
      'approximately footprint-scale S5P/TROPOMI support; Earth Engine L3 grid spacing remains 1113.2 m',

    supportMode:
      'VALID_ORBITAL_OBSERVATIONS',

    supportDescription:
      'per-pixel count of valid orbital L3 observations contributing to the monthly composite',


 hotspotPublicationAllowed:
  false,

hotspotPublicationPolicy:
  'DIAGNOSTIC_ONLY',

hotspotPublicationNote:
  'SO2 P90 hotspot is retained only as a diagnostic spatial product. At the 7000 m AOI analysis scale, publication-grade hotspot interpretation remains disabled unless spatial support and temporal completeness are independently demonstrated for the final AOI.',

allowStrictLongTermChange:
  false,

    visMin:
      -0.0002,

    visMax:
      0.0010
  },


  CO: {

    collection:
      'COPERNICUS/S5P/OFFL/L3_CO',

    sourceBand:
      'CO_column_number_density',

    longName:
      'Carbon monoxide column number density',

    unit:
      'mol/m2',

    processingBranch:
      'CO_DAILY_FIRST',

    aggregationMode:
      'DAILY_FIRST',

    aggregationLabel:
      'daily-first calendar-month mean',

    sourceSelectionMode:
      'NATIVE_L3_MASK',

    productQualityValue:
      null,

    qualityDescription:
      'Earth Engine L3 CO ingestion validity mask retained; no additional pixel QA filter',

    l3GridSpacingM:
      1113.2,

    analysisScaleM:
      1113.2,

    analysisScaleDescription:
      'Earth Engine L3 grid-scale AOI reduction',

    footprintMetadata:
      'CO source footprint is coarser than the 1113.2 m Earth Engine L3 grid; 1113.2 m is not interpreted as independent native spatial resolution',

    supportMode:
      'VALID_DAYS',

    supportDescription:
      'valid calendar days contributing to the monthly daily-first composite',

hotspotPublicationAllowed:
  true,

hotspotPublicationPolicy:
  'PUBLICATION_ELIGIBLE_IF_PERIOD_COMPLETE',

hotspotPublicationNote:
  'P90 hotspot may be used as an AOI-relative spatial indicator only for strictly complete annual or seasonal periods; it is not a regulatory exceedance threshold.',

allowStrictLongTermChange:
  true,

    visMin:
      0.02,

    visMax:
      0.05
  }
};


var ACTIVE =
  POLLUTANT_CATALOG[
    CONFIG.activePollutant
  ];


/*** 2. AOI ***/

var AOI_SOURCE_FC =
  ee.FeatureCollection(
    CONFIG.aoiAsset
  );

var AOI_GEOM =
  AOI_SOURCE_FC
    .geometry()
    .dissolve(1);

var AOI_CENTROID =
  AOI_GEOM
    .centroid(1)
    .transform(
      'EPSG:4326',
      1
    );

var AOI_AREA_M2 =
  AOI_GEOM.area(1);

  print(
  '=== FINAL ARTICLE AOI QC ==='
);

print(
  'AOI asset:',
  CONFIG.aoiAsset
);

print(
  'AOI ID:',
  CONFIG.aoiId
);

print(
  'Source polygon feature count:',
  AOI_SOURCE_FC.size()
);

print(
  'AOI area, km2:',
  AOI_AREA_M2.divide(1e6)
);

print(
  'AOI geometry type:',
  AOI_GEOM.type()
);

Map.centerObject(
  AOI_SOURCE_FC,
  9
);

Map.addLayer(
  AOI_GEOM,
  {
    color: 'FF0000'
  },
  'FINAL ARTICLE AOI — KRYVYI RIH',
  true
);


/*** 3. COMMON EMPTY IMAGES ***/

var EMPTY_VALUE =
  ee.Image
    .constant(0)
    .rename('VALUE')
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(AOI_GEOM);


var ZERO_SUPPORT =
  ee.Image
    .constant(0)
    .rename(
      'temporal_support_count'
    )
    .toFloat()
    .clip(AOI_GEOM);


var EMPTY_PERIOD =
  ee.Image.cat([

    ee.Image.constant(0)
      .rename('period_mean'),

    ee.Image.constant(0)
      .rename('valid_month_count'),

    ee.Image.constant(0)
      .rename('valid_month_fraction'),

    ee.Image.constant(0)
      .rename('hotspot_p90')

  ])
  .toFloat()
  .updateMask(
    ee.Image.constant(0)
  )
  .clip(AOI_GEOM);


/*** 4. BASIC DATE HELPERS ***/

function twoDigits(value) {

  return value < 10
    ? '0' + value
    : String(value);
}


function monthStartString(
  yearValue,
  monthValue
) {

  return String(yearValue) +
    '-' +
    twoDigits(monthValue) +
    '-01';
}


function monthLabelFromStartString(
  monthStartValue
) {

  return monthStartValue.substring(
    0,
    7
  );
}


function buildYearMonthStarts(
  yearValue
) {

  var output = [];

  for (
    var monthNumber = 1;
    monthNumber <= 12;
    monthNumber++
  ) {

    output.push(
      monthStartString(
        yearValue,
        monthNumber
      )
    );
  }

  return output;
}


/*** 5. STAGE-2A MATERIALIZED TABLE HELPERS ***/


function stage2aAssetId(
  yearValue
) {

  return CONFIG.assetFolder +
    '/ARTICLE4_STAGE2A_AOI_MONTHLY_' +
    CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R02';
}


function loadStage2aYear(
  yearValue
) {

  return ee.FeatureCollection(
    stage2aAssetId(
      yearValue
    )
  );
}


function loadAvailabilityRows(
  monthStartStrings,
  pollutantKey
) {

  var years = [];

  monthStartStrings.forEach(
    function(monthStartValue) {

      var yearValue =
        Number(
          monthStartValue.substring(
            0,
            4
          )
        );

      if (
        years.indexOf(
          yearValue
        ) === -1
      ) {
        years.push(
          yearValue
        );
      }
    }
  );


  var combined =
    ee.FeatureCollection([]);


  years.forEach(
    function(yearValue) {


      if (
        yearValue >= CONFIG.startYear &&
        yearValue <= CONFIG.endYear
      ) {

        combined =
          combined.merge(
            loadStage2aYear(
              yearValue
            )
          );
      }
    }
  );


  var monthLabels =
    monthStartStrings.map(
      function(value) {
        return monthLabelFromStartString(
          value
        );
      }
    );


  return combined
    .filter(
      ee.Filter.eq(
        'pollutant',
        pollutantKey
      )
    )
    .filter(
      ee.Filter.inList(
        'month',
        monthLabels
      )
    );
}


/*** 6. VERIFIED SOURCE CONTEXT — STAGE-1 R04 ***/

function createSourceContext(
  pollutantKey,
  startDateString,
  endExclusiveString
) {

  var active =
    POLLUTANT_CATALOG[
      pollutantKey
    ];


  var sourceAll =
    ee.ImageCollection(
      active.collection
    )
    .filterBounds(
      AOI_GEOM
    )
    .filterDate(
      startDateString,
      endExclusiveString
    );


  var sourceMetadataSelected;


  if (
    active.sourceSelectionMode ===
      'PRODUCT_QUALITY_NOMINAL'
  ) {

    sourceMetadataSelected =
      sourceAll.filter(
        ee.Filter.eq(
          'PRODUCT_QUALITY',
          active.productQualityValue
        )
      );

  } else {

    sourceMetadataSelected =
      sourceAll;
  }


  var sourcePrepared =
    sourceMetadataSelected.map(
      function(imageObject) {

        var image =
          ee.Image(
            imageObject
          );


        var valueImage =
          image
            .select(
              active.sourceBand
            )
            .rename(
              'VALUE'
            )
            .toFloat();


        return valueImage
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


  return {

    active:
      active,

    sourceAll:
      sourceAll,

    sourceMetadataSelected:
      sourceMetadataSelected,

    sourcePrepared:
      sourcePrepared
  };
}


/*** 7. VERIFIED DAILY-FIRST FUNCTION ***/

function createDailyComposite(
  dayStartValue,
  pollutantKey,
  context
) {

  var active =
    context.active;

  var dayStart =
    ee.Date(
      dayStartValue
    );

  var dayEnd =
    dayStart.advance(
      1,
      'day'
    );


  var daySource =
    context.sourcePrepared
      .filterDate(
        dayStart,
        dayEnd
      );


  var sourceElementCount =
    daySource.size();


  var dailyMean =
    ee.Image(

      ee.Algorithms.If(

        sourceElementCount.gt(0),

        daySource
          .mean()
          .rename('VALUE')
          .toFloat(),

        EMPTY_VALUE
      )
    );


  return dailyMean.set({

    'system:index':
      dayStart.format(
        'YYYYMMdd'
      ),

    'system:time_start':
      dayStart.millis(),

    'system:time_end':
      dayEnd.millis(),

    date:
      dayStart.format(
        'YYYY-MM-dd'
      ),

    month:
      dayStart.format(
        'YYYY-MM'
      ),

    source_element_count:
      sourceElementCount,

    pollutant:
      pollutantKey,

    processing_branch:
      active.processingBranch,

    script_version:
      CONFIG.scriptVersion
  });
}


/*** 8. VERIFIED DAILY COLLECTION ***/

function buildDailyCollection(
  monthStart,
  monthEnd,
  pollutantKey,
  context
) {

  var calendarDayCount =
    ee.Number(
      monthEnd.difference(
        monthStart,
        'day'
      )
    ).toInt();


  var dayOffsets =
    ee.List.sequence(
      0,
      calendarDayCount.subtract(1)
    );


  var dailyImageList =
    dayOffsets.map(
      function(dayOffset) {

        return createDailyComposite(

          monthStart.advance(
            ee.Number(
              dayOffset
            ),
            'day'
          ),

          pollutantKey,

          context
        );
      }
    );


  return ee.ImageCollection
    .fromImages(
      dailyImageList
    )
    .sort(
      'system:time_start'
    );
}


/*** 9. VERIFIED MONTHLY PRODUCT — POLLUTANT-SPECIFIC ***/

function createMonthlyProduct(
  monthStartStringValue,
  pollutantKey
) {

  var active =
    POLLUTANT_CATALOG[
      pollutantKey
    ];


  var monthStart =
    ee.Date(
      monthStartStringValue
    );


  var monthEnd =
    monthStart.advance(
      1,
      'month'
    );


  var context =
    createSourceContext(

      pollutantKey,

      monthStartStringValue,

      ee.Date(
        monthEnd
      )
      .format(
        'YYYY-MM-dd'
      )
    );


  var calendarDayCount =
    ee.Number(
      monthEnd.difference(
        monthStart,
        'day'
      )
    ).toInt();


  var monthSource =
    context.sourcePrepared;


  var selectedSourceCount =
    monthSource.size();


  var allSourceElementCount =
    context.sourceAll.size();

  var metadataSelectedSourceElementCount =
    context.sourceMetadataSelected.size();

  var dailyCompositeCount = null;


  var monthlyMean;

  var supportCount;

  var supportFraction;


  if (
    active.aggregationMode ===
      'DAILY_FIRST'
  ) {

    var dailyCollection =
      buildDailyCollection(

        monthStart,

        monthEnd,

        pollutantKey,

        context
      );

    dailyCompositeCount =
      dailyCollection.size();


    monthlyMean =
      dailyCollection
        .select(
          'VALUE'
        )
        .mean()
        .rename(
          'pollutant_monthly_mean'
        )
        .toFloat()
        .clip(
          AOI_GEOM
        );


    supportCount =
      dailyCollection
        .select(
          'VALUE'
        )
        .map(
          function(imageObject) {

            return ee.Image(
              imageObject
            )
            .mask()
            .gt(0)
            .unmask(0)
            .rename(
              'temporal_support_count'
            )
            .toFloat()
            .clip(
              AOI_GEOM
            );
          }
        )
        .sum()
        .rename(
          'temporal_support_count'
        )
        .toFloat();


    supportFraction =
      supportCount
        .divide(
          calendarDayCount
        )
        .rename(
          'temporal_support_fraction'
        )
        .toFloat();

  } else {


    monthlyMean =
      ee.Image(

        ee.Algorithms.If(

          selectedSourceCount.gt(0),

          monthSource
            .mean()
            .rename(
              'pollutant_monthly_mean'
            )
            .toFloat(),

          EMPTY_VALUE.rename(
            'pollutant_monthly_mean'
          )
        )
      )
      .clip(
        AOI_GEOM
      );


    supportCount =
      ee.Image(

        ee.Algorithms.If(

          selectedSourceCount.gt(0),

          monthSource
            .select(
              'VALUE'
            )
            .count()
            .rename(
              'temporal_support_count'
            )
            .toFloat()
            .unmask(0),

          ZERO_SUPPORT
        )
      )
      .clip(
        AOI_GEOM
      );


    supportFraction =
      ee.Image
        .constant(0)
        .rename(
          'temporal_support_fraction'
        )
        .toFloat()
        .updateMask(
          ee.Image.constant(0)
        )
        .clip(
          AOI_GEOM
        );
  }


  var monthlyValidMask =
    monthlyMean
      .mask()
      .gt(0)
      .unmask(0)
      .rename(
        'monthly_valid_mask'
      )
      .toFloat()
      .clip(
        AOI_GEOM
      );


  return ee.Image.cat([

    monthlyMean,

    supportCount,

    supportFraction,

    monthlyValidMask

  ])
  .toFloat()
  .clip(
    AOI_GEOM
  )
  .set({

    'system:index':
      pollutantKey +
      '_' +
      monthStart.format(
        'YYYY_MM'
      ),

    'system:time_start':
      monthStart.millis(),

    'system:time_end':
      monthEnd.millis(),

    pollutant:
      pollutantKey,

    pollutant_long_name:
      active.longName,

    unit:
      active.unit,

    year:
      monthStart.get(
        'year'
      ),

    month:
      monthStart.format(
        'YYYY-MM'
      ),

    month_start:
      monthStart.format(
        'YYYY-MM-dd'
      ),

    month_end_exclusive:
      monthEnd.format(
        'YYYY-MM-dd'
      ),

    all_source_element_count:
      allSourceElementCount,

    metadata_selected_source_element_count:
      metadataSelectedSourceElementCount,

    source_element_count:
      selectedSourceCount,

    daily_composite_count:
      dailyCompositeCount,

    processing_branch:
      active.processingBranch,

    aggregation_mode:
      active.aggregationMode,

    aggregation_method:
      active.aggregationLabel,

    source_selection_mode:
      active.sourceSelectionMode,

    quality_description:
      active.qualityDescription,

    l3_grid_spacing_m:
      active.l3GridSpacingM,

    analysis_scale_m:
      active.analysisScaleM,

    analysis_scale_description:
      active.analysisScaleDescription,

    footprint_metadata:
      active.footprintMetadata,

    temporal_support_mode:
      active.supportMode,

    temporal_support_description:
      active.supportDescription,

    script_version:
      CONFIG.scriptVersion,

    verified_engine_version:
      CONFIG.verifiedEngineVersion
  });
}


/*** 10. BUILD MONTHLY COLLECTION FOR ARBITRARY MONTH LIST ***/

function buildMonthlyCollection(
  monthStartStrings,
  pollutantKey
) {

  var images =
    monthStartStrings.map(
      function(monthStartValue) {

        return createMonthlyProduct(
          monthStartValue,
          pollutantKey
        );
      }
    );


  return ee.ImageCollection
    .fromImages(
      images
    )
    .sort(
      'system:time_start'
    );
}


/*** 11. PERIOD PRODUCT BUILDER ***/

function createPeriodProduct(
  monthStartStrings,
  pollutantKey,
  periodType,
  periodLabel,
  periodYear
) {

  var active =
    POLLUTANT_CATALOG[
      pollutantKey
    ];


  var monthlyCollection =
    buildMonthlyCollection(
      monthStartStrings,
      pollutantKey
    );


  var expectedMonthCount =
    monthStartStrings.length;


  var periodMean =
    monthlyCollection
      .select(
        'pollutant_monthly_mean'
      )
      .mean()
      .rename(
        'period_mean'
      )
      .toFloat()
      .clip(
        AOI_GEOM
      );


  var validMonthCountRaster =
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
        AOI_GEOM
      );


  var validMonthFractionRaster =
    validMonthCountRaster
      .divide(
        expectedMonthCount
      )
      .rename(
        'valid_month_fraction'
      )
      .toFloat();


  var availabilityRows =
    loadAvailabilityRows(
      monthStartStrings,
      pollutantKey
    );


  var validMonthCountAoi =
    availabilityRows
      .filter(
        ee.Filter.notNull([
          'AOI_mean_mol_m2'
        ])
      )
      .size();


  var strictRequiredCount =
    periodType === 'ANNUAL'
      ? CONFIG.strictAnnualMonthCount
      : CONFIG.strictSeasonMonthCount;


  var strictPeriodComplete =
    ee.Number(

      ee.Algorithms.If(

        validMonthCountAoi.eq(
          strictRequiredCount
        ),

        1,

        0
      )
    );


var hotspotPolicyAllowed =
  ee.Number(
    active.hotspotPublicationAllowed
      ? 1
      : 0
  );

var hotspotPublicationEligible =
  strictPeriodComplete
    .multiply(
      hotspotPolicyAllowed
    );

var hotspotUseClass =
  ee.String(
    ee.Algorithms.If(
      hotspotPublicationEligible.eq(1),
      'PUBLICATION_ELIGIBLE',
      'DIAGNOSTIC_ONLY'
    )
  );


  var spatialStats =
    periodMean.reduceRegion({

   reducer:
  ee.Reducer.count()
    .combine({
      reducer2:
        ee.Reducer.mean(),
      sharedInputs:
        true
    })
    .combine({
      reducer2:
        ee.Reducer.median(),
      sharedInputs:
        true
    })
          .combine({
            reducer2:
              ee.Reducer.percentile([
                50,
                CONFIG.hotspotPercentile
              ]),
            sharedInputs:
              true
          })
          .combine({
            reducer2:
              ee.Reducer.minMax(),
            sharedInputs:
              true
          }),

      geometry:
        AOI_GEOM,

      scale:
        active.analysisScaleM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      tileScale:
        CONFIG.tileScale
    });


  var p90Raw =
    spatialStats.get(
      'period_mean_p' +
      String(
        CONFIG.hotspotPercentile
      )
    );


  var p90Threshold =
    ee.Number(

      ee.Algorithms.If(

        ee.Algorithms.IsEqual(
          p90Raw,
          null
        ),

        0,

        p90Raw
      )
    );


  var hotspotP90 =
    periodMean
      .gt(
        p90Threshold
      )
      .rename(
        'hotspot_p90'
      )
      .toFloat()
      .updateMask(
        periodMean.mask()
      );


  var finalImage =
    ee.Image.cat([

      periodMean,

      validMonthCountRaster,

      validMonthFractionRaster,

      hotspotP90

    ])
    .toFloat()
    .clip(
      AOI_GEOM
    );


  var validAreaDictionary =
    ee.Image
      .pixelArea()
      .updateMask(
        periodMean.mask()
      )
      .rename(
        'valid_area_m2'
      )
      .reduceRegion({

        reducer:
          ee.Reducer.sum(),

        geometry:
          AOI_GEOM,

        scale:
          active.analysisScaleM,

        crs:
          CONFIG.reductionCrs,

        maxPixels:
          CONFIG.maxPixels,

        tileScale:
          CONFIG.tileScale
      });


  var validAreaRaw =
    validAreaDictionary.get(
      'valid_area_m2'
    );


  var validAreaM2 =
    ee.Number(

      ee.Algorithms.If(

        ee.Algorithms.IsEqual(
          validAreaRaw,
          null
        ),

        0,

        validAreaRaw
      )
    )
    .max(0)
    .min(
      AOI_AREA_M2
    );


  var validAreaFraction =
    validAreaM2
      .divide(
        AOI_AREA_M2
      )
      .max(0)
      .min(1);


  finalImage =
    finalImage.set({

      pollutant:
        pollutantKey,

      pollutant_long_name:
        active.longName,

      unit:
        active.unit,

      aoi_id:
        CONFIG.aoiId,

      period_type:
        periodType,

      period_label:
        periodLabel,

      period_year:
        periodYear,

      expected_month_count:
        expectedMonthCount,

      valid_month_count_aoi:
        validMonthCountAoi,

      temporal_completeness_fraction:
        ee.Number(
          validMonthCountAoi
        )
        .divide(
          expectedMonthCount
        ),

      strict_period_complete:
        strictPeriodComplete,

      hotspot_definition:
        'AOI spatial P90 of period_mean; relative hotspot, not regulatory exceedance',

      hotspot_percentile:
        CONFIG.hotspotPercentile,
hotspot_publication_policy_allowed:
  hotspotPolicyAllowed,

hotspot_publication_eligible:
  hotspotPublicationEligible,

hotspot_use_class:
  hotspotUseClass,

hotspot_publication_policy:
  active.hotspotPublicationPolicy,

hotspot_publication_note:
  active.hotspotPublicationNote,

spatial_sample_count:
  spatialStats.get(
    'period_mean_count'
  ),
      hotspot_threshold_mol_m2:
        p90Raw,

      processing_branch:
        active.processingBranch,

      aggregation_mode:
        active.aggregationMode,

      aggregation_method:
        active.aggregationLabel,

      source_selection_mode:
        active.sourceSelectionMode,

      quality_description:
        active.qualityDescription,

      l3_grid_spacing_m:
        active.l3GridSpacingM,

      analysis_scale_m:
        active.analysisScaleM,

      analysis_scale_description:
        active.analysisScaleDescription,

      footprint_metadata:
        active.footprintMetadata,

      script_version:
        CONFIG.scriptVersion,

      verified_engine_version:
        CONFIG.verifiedEngineVersion
    });


  var summary =
    ee.Feature(
      AOI_CENTROID,
      {

        pollutant:
          pollutantKey,

        pollutant_long_name:
          active.longName,

        unit:
          active.unit,

        aoi_id:
          CONFIG.aoiId,

        period_type:
          periodType,

        period_label:
          periodLabel,

        period_year:
          periodYear,

        expected_month_count:
          expectedMonthCount,

        valid_month_count:
          validMonthCountAoi,

        missing_or_invalid_month_count:
          ee.Number(
            expectedMonthCount
          )
          .subtract(
            validMonthCountAoi
          ),

        temporal_completeness_fraction:
          ee.Number(
            validMonthCountAoi
          )
          .divide(
            expectedMonthCount
          ),

        temporal_completeness_percent:
          ee.Number(
            validMonthCountAoi
          )
          .divide(
            expectedMonthCount
          )
          .multiply(100),

        strict_publication_complete:
          strictPeriodComplete,

        spatial_mean_mol_m2:
          spatialStats.get(
            'period_mean_mean'
          ),

        spatial_median_mol_m2:
          spatialStats.get(
            'period_mean_median'
          ),

        spatial_p50_mol_m2:
          spatialStats.get(
            'period_mean_p50'
          ),

        spatial_p90_mol_m2:
          p90Raw,

        spatial_min_mol_m2:
          spatialStats.get(
            'period_mean_min'
          ),

        spatial_max_mol_m2:
          spatialStats.get(
            'period_mean_max'
          ),

        valid_area_m2:
          validAreaM2,

        valid_area_km2:
          validAreaM2.divide(
            1e6
          ),

        valid_area_fraction:
          validAreaFraction,

        valid_area_percent:
          validAreaFraction.multiply(
            100
          ),

        hotspot_definition:
          'upper spatial decile relative to AOI P90; not a regulatory threshold',
hotspot_publication_policy_allowed:
  hotspotPolicyAllowed,

hotspot_publication_eligible:
  hotspotPublicationEligible,

hotspot_use_class:
  hotspotUseClass,

hotspot_publication_policy:
  active.hotspotPublicationPolicy,

hotspot_publication_note:
  active.hotspotPublicationNote,

spatial_sample_count:
  spatialStats.get(
    'period_mean_count'
  ),
        processing_branch:
          active.processingBranch,

        aggregation_mode:
          active.aggregationMode,

        aggregation_method:
          active.aggregationLabel,

        source_selection_mode:
          active.sourceSelectionMode,

        quality_description:
          active.qualityDescription,

        l3_grid_spacing_m:
          active.l3GridSpacingM,

        analysis_scale_m:
          active.analysisScaleM,

        footprint_metadata:
          active.footprintMetadata,

        script_version:
          CONFIG.scriptVersion,

        verified_engine_version:
          CONFIG.verifiedEngineVersion
      }
    );


  return {

    image:
      finalImage,

    summary:
      summary,

    monthlyCollection:
      monthlyCollection
  };
}


/*** 12. ANNUAL PRODUCT ***/

function createAnnualProduct(
  pollutantKey,
  yearValue
) {

  return createPeriodProduct(

    buildYearMonthStarts(
      yearValue
    ),

    pollutantKey,

    'ANNUAL',

    String(
      yearValue
    ),

    yearValue
  );
}


/*** 13. SEASON MONTH DEFINITIONS ***/

function seasonMonthStarts(
  seasonName,
  seasonYear
) {

  if (
    seasonName === 'MAM'
  ) {

    return [
      monthStartString(
        seasonYear,
        3
      ),
      monthStartString(
        seasonYear,
        4
      ),
      monthStartString(
        seasonYear,
        5
      )
    ];
  }


  if (
    seasonName === 'JJA'
  ) {

    return [
      monthStartString(
        seasonYear,
        6
      ),
      monthStartString(
        seasonYear,
        7
      ),
      monthStartString(
        seasonYear,
        8
      )
    ];
  }


  if (
    seasonName === 'SON'
  ) {

    return [
      monthStartString(
        seasonYear,
        9
      ),
      monthStartString(
        seasonYear,
        10
      ),
      monthStartString(
        seasonYear,
        11
      )
    ];
  }


  if (
    seasonName === 'DJF'
  ) {

    return [
      monthStartString(
        seasonYear - 1,
        12
      ),
      monthStartString(
        seasonYear,
        1
      ),
      monthStartString(
        seasonYear,
        2
      )
    ];
  }


  throw new Error(
    'Unknown season: ' +
    seasonName
  );
}


/*** 14. SEASON PRODUCT ***/

function createSeasonProduct(
  pollutantKey,
  seasonName,
  seasonYear
) {

  return createPeriodProduct(

    seasonMonthStarts(
      seasonName,
      seasonYear
    ),

    pollutantKey,

    'SEASON',

    seasonName,

    seasonYear
  );
}


/*** 15. ASSET / EXPORT NAMES ***/

function annualAssetName(
  pollutantKey,
  yearValue
) {

  return (
    'ARTICLE4_STAGE2C_ANNUAL_' +
    pollutantKey +
    '_' +
    CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R01'
  );
}


function annualAssetId(
  pollutantKey,
  yearValue
) {

  return CONFIG.assetFolder +
    '/' +
    annualAssetName(
      pollutantKey,
      yearValue
    );
}


/*** 16. YEAR PACKAGE ***/

function runYearPackage() {

  var pollutantKey =
    CONFIG.activePollutant;

  var yearValue =
    CONFIG.activeYear;

  var active =
    POLLUTANT_CATALOG[
      pollutantKey
    ];


  var annual =
    createAnnualProduct(
      pollutantKey,
      yearValue
    );


  var seasonNames = [
    'MAM',
    'JJA',
    'SON'
  ];


  if (
    yearValue > CONFIG.startYear
  ) {
    seasonNames.push(
      'DJF'
    );
  }


  var seasonProducts = [];


  seasonNames.forEach(
    function(seasonName) {

      seasonProducts.push({

        name:
          seasonName,

        product:
          createSeasonProduct(
            pollutantKey,
            seasonName,
            yearValue
          )
      });
    }
  );


  var summaryFeatures = [
    annual.summary
  ];


  seasonProducts.forEach(
    function(item) {

      summaryFeatures.push(
        item.product.summary
      );
    }
  );


  var SPATIAL_PERIOD_SUMMARY =
    ee.FeatureCollection(
      summaryFeatures
    );


  print(
    '=================================================='
  );

  print(
    '=== ARTICLE 4 — STAGE 2C YEAR PACKAGE R01 ==='
  );

  print(
    'Script version:',
    CONFIG.scriptVersion
  );

  print(
    'Verified engine:',
    CONFIG.verifiedEngineVersion
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
    'Processing branch:',
    active.processingBranch
  );

  print(
    'Aggregation:',
    active.aggregationLabel
  );

  print(
    'Source selection:',
    active.sourceSelectionMode
  );

  print(
    'AOI analysis scale, m:',
    active.analysisScaleM
  );

  print(
    'L3 grid spacing metadata, m:',
    active.l3GridSpacingM
  );

  print(
    'Annual raster bands:',
    annual.image.bandNames()
  );

  print(
    'Annual summary:',
    annual.summary
  );

  print(
    'Spatial period summary:',
    SPATIAL_PERIOD_SUMMARY
  );

  print(
    'Expected spatial summary row count:',
    1 + seasonNames.length
  );

  print(
    'Actual spatial summary row count:',
    SPATIAL_PERIOD_SUMMARY.size()
  );

  print(
    'STRICT COMPLETENESS RULE:',
    'Annual = 12/12; season = 3/3. Incomplete periods are retained with explicit completeness metadata, not silently converted to complete periods.'
  );

  print(
    'NA RULE:',
    'Missing monthly data remain masked/NA. They are never replaced by zero.'
  );

  print(
    'HOTSPOT RULE:',
    'P90 denotes the AOI-relative upper spatial decile, NOT a legal or health threshold.'
  );
print(
  'Pollutant hotspot publication policy:',
  active.hotspotPublicationPolicy
);

print(
  'Pollutant hotspot publication allowed:',
  active.hotspotPublicationAllowed
);

print(
  'Annual hotspot publication eligible:',
  annual.image.get(
    'hotspot_publication_eligible'
  )
);

print(
  'Annual hotspot use class:',
  annual.image.get(
    'hotspot_use_class'
  )
);

print(
  'Annual spatial sample count:',
  annual.image.get(
    'spatial_sample_count'
  )
);
  print(
    'IMPORTANT:',
    'Scientific raster calculations are unsmoothed. Optional bilinear smoothing is display-only.'
  );

  print(
    '=== END STAGE 2C YEAR PACKAGE ACCEPTANCE ==='
  );

  print(
    '=================================================='
  );


  if (
    CONFIG.showMapPreview
  ) {

    Map.centerObject(
      AOI_SOURCE_FC,
      10
    );


    Map.addLayer(

      AOI_SOURCE_FC.style({

        color:
          '000000',

        fillColor:
          '00000000',

        width:
          2
      }),

      {},

      'AOI boundary'
    );


    var displayImage =
      annual.image.select(
        'period_mean'
      );


    if (
      CONFIG.smoothMapDisplayOnly
    ) {


      displayImage =
        displayImage.resample(
          'bilinear'
        );
    }


    Map.addLayer(

      displayImage,

      {

        min:
          active.visMin,

        max:
          active.visMax,

        palette: [
          '440154',
          '3b528b',
          '21918c',
          '5ec962',
          'fde725'
        ]
      },

      pollutantKey +
      ' ' +
      String(yearValue) +
      ' annual mean' +
      (
        CONFIG.smoothMapDisplayOnly
          ? ' — DISPLAY SMOOTHED'
          : ' — SOURCE GRID'
      ),

      true
    );


    Map.addLayer(

      annual.image
        .select(
          'hotspot_p90'
        )
        .selfMask(),

      {
        min:
          0,
        max:
          1,
        palette: [
          'ff0000'
        ]
      },

  pollutantKey +
  ' ' +
  String(yearValue) +
  (
    active.hotspotPublicationAllowed
      ? ' P90 hotspot'
      : ' P90 hotspot — DIAGNOSTIC ONLY'
  ),

      false
    );


    Map.addLayer(

      annual.image.select(
        'valid_month_fraction'
      ),

      {
        min:
          0,
        max:
          1,
        palette: [
          '440154',
          '21918c',
          'fde725'
        ]
      },

      pollutantKey +
      ' ' +
      String(yearValue) +
      ' temporal completeness',

      false
    );
  }


  if (
    CONFIG.createAnnualAssetTask
  ) {

    Export.image.toAsset({

      image:
        annual.image,

      description:
        annualAssetName(
          pollutantKey,
          yearValue
        ),

      assetId:
        annualAssetId(
          pollutantKey,
          yearValue
        ),

      region:
        AOI_GEOM,

      scale:
        active.l3GridSpacingM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      pyramidingPolicy: {

        '.default':
          'mean',

        'hotspot_p90':
          'mode'
      }
    });


    print(
      'Annual Asset task:',
      'CREATED'
    );

    print(
      'Annual Asset ID:',
      annualAssetId(
        pollutantKey,
        yearValue
      )
    );

  } else {

    print(
      'Annual Asset task:',
      'DISABLED — verification-safe default.'
    );
  }


  if (
    CONFIG.createGeoTiffTasks
  ) {

    var annualFileName =
      annualAssetName(
        pollutantKey,
        yearValue
      );


    Export.image.toDrive({

      image:
        annual.image,

      description:
        annualFileName,

      folder:
        CONFIG.driveFolder,

      fileNamePrefix:
        annualFileName,

      region:
        AOI_GEOM,

      scale:
        active.l3GridSpacingM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      fileFormat:
        'GeoTIFF',

      formatOptions: {
        cloudOptimized:
          true
      }
    });


    seasonProducts.forEach(
      function(item) {

        var seasonFileName =
          'ARTICLE4_STAGE2C_' +
          item.name +
          '_' +
          pollutantKey +
          '_' +
          CONFIG.aoiId +
          '_' +
          String(yearValue) +
          '_R01';


        Export.image.toDrive({

          image:
            item.product.image,

          description:
            seasonFileName,

          folder:
            CONFIG.driveFolder,

          fileNamePrefix:
            seasonFileName,

          region:
            AOI_GEOM,

          scale:
            active.l3GridSpacingM,

          crs:
            CONFIG.reductionCrs,

          maxPixels:
            CONFIG.maxPixels,

          fileFormat:
            'GeoTIFF',

          formatOptions: {
            cloudOptimized:
              true
          }
        });
      }
    );


    print(
      'GeoTIFF tasks:',
      'CREATED — annual + available season definitions.'
    );

  } else {

    print(
      'GeoTIFF tasks:',
      'DISABLED — verification-safe default.'
    );
  }


  if (
    CONFIG.createSummaryCsvTask
  ) {

    var summaryName =
      'ARTICLE4_STAGE2C_SPATIAL_SUMMARY_' +
      pollutantKey +
      '_' +
      CONFIG.aoiId +
      '_' +
      String(yearValue) +
      '_R01';


    Export.table.toDrive({

      collection:
        SPATIAL_PERIOD_SUMMARY,

      description:
        summaryName,

      folder:
        CONFIG.driveFolder,

      fileNamePrefix:
        summaryName,

      fileFormat:
        'CSV'
    });


    print(
      'Spatial summary CSV task:',
      'CREATED'
    );

  } else {

    print(
      'Spatial summary CSV task:',
      'DISABLED — verification-safe default.'
    );
  }


  return {

    annual:
      annual,

    seasons:
      seasonProducts,

    summary:
      SPATIAL_PERIOD_SUMMARY
  };
}


/*** 17. LONG-TERM PACKAGE — FROM MATERIALIZED ANNUAL ASSETS ***/

function runLongTermPackage() {

  var pollutantKey =
    CONFIG.activePollutant;

  var active =
    POLLUTANT_CATALOG[
      pollutantKey
    ];


  var annualImages = [];


  for (
    var yearValue = CONFIG.startYear;
    yearValue <= CONFIG.endYear;
    yearValue++
  ) {

    annualImages.push(

      ee.Image(
        annualAssetId(
          pollutantKey,
          yearValue
        )
      )
      .set(
        'analysis_year',
        yearValue
      )
    );
  }


  var ANNUAL_COLLECTION =
    ee.ImageCollection
      .fromImages(
        annualImages
      )
      .sort(
        'analysis_year'
      );


  var STRICT_COMPLETE_ANNUALS =
    ANNUAL_COLLECTION.filter(
      ee.Filter.eq(
        'strict_period_complete',
        1
      )
    );


  var strictCompleteYearCount =
    STRICT_COMPLETE_ANNUALS.size();


  var image2019 =
    ee.Image(
      annualImages[0]
    )
    .select(
      'period_mean'
    );


  var image2024 =
    ee.Image(
      annualImages[
        annualImages.length - 1
      ]
    )
    .select(
      'period_mean'
    );


  var startComplete =
    ee.Number(
      ee.Image(
        annualImages[0]
      )
      .get(
        'strict_period_complete'
      )
    );


  var endComplete =
    ee.Number(
      ee.Image(
        annualImages[
          annualImages.length - 1
        ]
      )
      .get(
        'strict_period_complete'
      )
    );


  var endpointCompleteness =
    startComplete
      .multiply(
        endComplete
      );


  var longTermChangeAllowed =
    ee.Number(

      ee.Algorithms.If(

        active.allowStrictLongTermChange,

        endpointCompleteness,

        0
      )
    );


  var absoluteChangeRaw =
    image2024
      .subtract(
        image2019
      )
      .rename(
        'absolute_change_2024_minus_2019'
      )
      .toFloat();


  var baselineSafeMask =
    image2019
      .abs()
      .gt(
        CONFIG.relativeChangeBaselineEpsilon
      );


  var relativeChangeRaw =
    absoluteChangeRaw
      .divide(
        image2019
      )
      .multiply(
        100
      )
      .rename(
        'relative_change_percent'
      )
      .updateMask(
        baselineSafeMask
      )
      .toFloat();


  var relativeChangeValidMask =
    baselineSafeMask
      .rename(
        'relative_change_valid_mask'
      )
      .toFloat();


  var EMPTY_CHANGE =
    ee.Image.cat([

      ee.Image.constant(0)
        .rename(
          'absolute_change_2024_minus_2019'
        ),

      ee.Image.constant(0)
        .rename(
          'relative_change_percent'
        ),

      ee.Image.constant(0)
        .rename(
          'relative_change_valid_mask'
        )

    ])
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(
      AOI_GEOM
    );


  var CHANGE_IMAGE =
    ee.Image(

      ee.Algorithms.If(

        longTermChangeAllowed.eq(1),

        ee.Image.cat([

          absoluteChangeRaw,

          relativeChangeRaw,

          relativeChangeValidMask

        ])
        .clip(
          AOI_GEOM
        ),

        EMPTY_CHANGE
      )
    )
    .set({

      pollutant:
        pollutantKey,

      start_year:
        CONFIG.startYear,

      end_year:
        CONFIG.endYear,

      strict_start_complete:
        startComplete,

      strict_end_complete:
        endComplete,

      long_term_change_allowed:
        longTermChangeAllowed,

      relative_change_epsilon:
        CONFIG.relativeChangeBaselineEpsilon,

      relative_change_warning:
        'relative change masked where absolute 2019 baseline <= epsilon',

      script_version:
        CONFIG.scriptVersion
    });


var expectedYearCount =
  CONFIG.endYear -
  CONFIG.startYear +
  1;


var persistenceAllowed =
  ee.Number(

    ee.Algorithms.If(

      active.hotspotPublicationAllowed,

      strictCompleteYearCount.eq(
        expectedYearCount
      ),

      0
    )
  );


  var hotspotOccurrenceCount =
    ee.ImageCollection(

      STRICT_COMPLETE_ANNUALS.map(
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
    )
    .sum()
    .rename(
      'hotspot_occurrence_count'
    )
    .toFloat();


  var hotspotPersistenceRaw =
    hotspotOccurrenceCount
      .divide(
        strictCompleteYearCount.max(1)
      )
      .rename(
        'hotspot_persistence_fraction'
      )
      .toFloat();


  var EMPTY_PERSISTENCE =
    ee.Image.cat([

      ee.Image.constant(0)
        .rename(
          'hotspot_occurrence_count'
        ),

      ee.Image.constant(0)
        .rename(
          'hotspot_persistence_fraction'
        )

    ])
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(
      AOI_GEOM
    );


  var HOTSPOT_PERSISTENCE =
    ee.Image(

      ee.Algorithms.If(

        persistenceAllowed.eq(1),

        ee.Image.cat([

          hotspotOccurrenceCount,

          hotspotPersistenceRaw

        ])
        .clip(
          AOI_GEOM
        ),

        EMPTY_PERSISTENCE
      )
    )
    .set({

      pollutant:
        pollutantKey,

      eligible_complete_year_count:
        strictCompleteYearCount,

      hotspot_definition:
        'fraction of strictly complete annual products where pixel exceeds annual AOI P90',

      persistence_allowed:
        persistenceAllowed,

      script_version:
        CONFIG.scriptVersion
    });


  var changeStats =
    CHANGE_IMAGE
      .select(
        'absolute_change_2024_minus_2019'
      )
      .reduceRegion({

        reducer:
          ee.Reducer.mean()
            .combine({
              reducer2:
                ee.Reducer.median(),
              sharedInputs:
                true
            })
            .combine({
              reducer2:
                ee.Reducer.percentile([
                  10,
                  90
                ]),
              sharedInputs:
                true
            })
            .combine({
              reducer2:
                ee.Reducer.minMax(),
              sharedInputs:
                true
            }),

        geometry:
          AOI_GEOM,

        scale:
          active.analysisScaleM,

        crs:
          CONFIG.reductionCrs,

        maxPixels:
          CONFIG.maxPixels,

        tileScale:
          CONFIG.tileScale
      });


  var LONG_TERM_SUMMARY =
    ee.FeatureCollection([

      ee.Feature(
        AOI_CENTROID,
        {

          pollutant:
            pollutantKey,

          start_year:
            CONFIG.startYear,

          end_year:
            CONFIG.endYear,

          strict_complete_year_count:
            strictCompleteYearCount,

          start_year_complete:
            startComplete,

          end_year_complete:
            endComplete,

          change_publication_eligible:
            longTermChangeAllowed,

          hotspot_persistence_eligible:
            persistenceAllowed,

          absolute_change_mean_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_mean'
            ),

          absolute_change_median_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_median'
            ),

          absolute_change_p10_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_p10'
            ),

          absolute_change_p90_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_p90'
            ),

          absolute_change_min_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_min'
            ),

          absolute_change_max_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_max'
            ),

          processing_branch:
            active.processingBranch,

          analysis_scale_m:
            active.analysisScaleM,

          footprint_metadata:
            active.footprintMetadata,
expected_year_count:
  expectedYearCount,

strict_complete_year_count:
  strictCompleteYearCount,

hotspot_publication_policy:
  active.hotspotPublicationPolicy,

hotspot_publication_allowed:
  active.hotspotPublicationAllowed,

hotspot_persistence_publication_eligible:
  persistenceAllowed,
          script_version:
            CONFIG.scriptVersion
        }
      )
    ]);


  print(
    '=================================================='
  );

  print(
    '=== ARTICLE 4 — STAGE 2C LONG-TERM PACKAGE R01 ==='
  );

  print(
    'Pollutant:',
    pollutantKey
  );

  print(
    'Annual Asset count:',
    ANNUAL_COLLECTION.size()
  );

  print(
    'Strictly complete annual count:',
    strictCompleteYearCount
  );

  print(
    '2019 strict complete:',
    startComplete
  );

  print(
    '2024 strict complete:',
    endComplete
  );

  print(
    'Long-term change publication eligible:',
    longTermChangeAllowed
  );

  print(
    'Hotspot persistence publication eligible:',
    persistenceAllowed
  );

  print(
    'Change bands:',
    CHANGE_IMAGE.bandNames()
  );

  print(
    'Persistence bands:',
    HOTSPOT_PERSISTENCE.bandNames()
  );

  print(
    'Long-term summary:',
    LONG_TERM_SUMMARY
  );

  print(
    'SCIENTIFIC RULE:',
    'SO2 is not forced into strict 2019–2024 change/hotspot persistence when annual temporal completeness is insufficient.'
  );

  print(
    '=== END STAGE 2C LONG-TERM ACCEPTANCE ==='
  );

  print(
    '=================================================='
  );


  if (
    CONFIG.showMapPreview
  ) {

    Map.centerObject(
      AOI_SOURCE_FC,
      10
    );


    Map.addLayer(

      CHANGE_IMAGE.select(
        'absolute_change_2024_minus_2019'
      ),

      {
        min:
          -0.00005,

        max:
          0.00005,

        palette: [
          '313695',
          '74add1',
          'ffffbf',
          'f46d43',
          'a50026'
        ]
      },

      pollutantKey +
      ' absolute change 2024-2019',

      true
    );


    Map.addLayer(

      HOTSPOT_PERSISTENCE.select(
        'hotspot_persistence_fraction'
      ),

      {
        min:
          0,

        max:
          1,

        palette: [
          '440154',
          '21918c',
          'fde725'
        ]
      },

      pollutantKey +
      ' P90 hotspot persistence',

      false
    );
  }


  if (
    CONFIG.createGeoTiffTasks
  ) {

    var changeName =
      'ARTICLE4_STAGE2C_CHANGE_' +
      pollutantKey +
      '_' +
      CONFIG.aoiId +
      '_2019_2024_R01';


    Export.image.toDrive({

      image:
        CHANGE_IMAGE,

      description:
        changeName,

      folder:
        CONFIG.driveFolder,

      fileNamePrefix:
        changeName,

      region:
        AOI_GEOM,

      scale:
        active.l3GridSpacingM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      fileFormat:
        'GeoTIFF',

      formatOptions: {
        cloudOptimized:
          true
      }
    });


    var persistenceName =
      'ARTICLE4_STAGE2C_HOTSPOT_PERSISTENCE_' +
      pollutantKey +
      '_' +
      CONFIG.aoiId +
      '_2019_2024_R01';


    Export.image.toDrive({

      image:
        HOTSPOT_PERSISTENCE,

      description:
        persistenceName,

      folder:
        CONFIG.driveFolder,

      fileNamePrefix:
        persistenceName,

      region:
        AOI_GEOM,

      scale:
        active.l3GridSpacingM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      fileFormat:
        'GeoTIFF',

      formatOptions: {
        cloudOptimized:
          true
      }
    });
  }


  if (
    CONFIG.createSummaryCsvTask
  ) {

    var longTermSummaryName =
      'ARTICLE4_STAGE2C_LONG_TERM_SUMMARY_' +
      pollutantKey +
      '_' +
      CONFIG.aoiId +
      '_2019_2024_R01';


    Export.table.toDrive({

      collection:
        LONG_TERM_SUMMARY,

      description:
        longTermSummaryName,

      folder:
        CONFIG.driveFolder,

      fileNamePrefix:
        longTermSummaryName,

      fileFormat:
        'CSV'
    });
  }


  return {

    annualCollection:
      ANNUAL_COLLECTION,

    changeImage:
      CHANGE_IMAGE,

    hotspotPersistence:
      HOTSPOT_PERSISTENCE,

    summary:
      LONG_TERM_SUMMARY
  };
}


/*** MASTER MODULE A — VERIFIED ONE-YEAR AOI MATERIALIZATION ***/


function createMasterAoiSummary(
  monthlyImageObject,
  monthStartStringValue,
  pollutantKey
) {

  var active = POLLUTANT_CATALOG[pollutantKey];
  var monthlyImage = ee.Image(monthlyImageObject);
  var monthStart = ee.Date(monthStartStringValue);
  var monthEnd = monthStart.advance(1, 'month');

  var valueImage = monthlyImage.select('pollutant_monthly_mean');
  var supportCountImage = monthlyImage.select('temporal_support_count');

  var valueStats = valueImage.reduceRegion({
    reducer: ee.Reducer.mean()
      .combine({reducer2: ee.Reducer.median(), sharedInputs: true})
      .combine({reducer2: ee.Reducer.percentile([90]), sharedInputs: true})
      .combine({reducer2: ee.Reducer.minMax(), sharedInputs: true})
      .combine({reducer2: ee.Reducer.count(), sharedInputs: true}),
    geometry: AOI_GEOM,
    scale: active.analysisScaleM,
    crs: CONFIG.reductionCrs,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  });

  var supportStats = supportCountImage.reduceRegion({
    reducer: ee.Reducer.mean()
      .combine({reducer2: ee.Reducer.median(), sharedInputs: true})
      .combine({reducer2: ee.Reducer.percentile([10, 90]), sharedInputs: true})
      .combine({reducer2: ee.Reducer.minMax(), sharedInputs: true}),
    geometry: AOI_GEOM,
    scale: active.analysisScaleM,
    crs: CONFIG.reductionCrs,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  });

  var validAreaImage = ee.Image.pixelArea()
    .updateMask(valueImage.mask())
    .rename('valid_area_m2');

  var validAreaDictionary = validAreaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: AOI_GEOM,
    scale: active.analysisScaleM,
    crs: CONFIG.reductionCrs,
    maxPixels: CONFIG.maxPixels,
    tileScale: CONFIG.tileScale
  });

  var validAreaRaw = validAreaDictionary.get('valid_area_m2');

  var validAreaM2 = ee.Number(
    ee.Algorithms.If(
      ee.Algorithms.IsEqual(validAreaRaw, null),
      0,
      validAreaRaw
    )
  ).max(0).min(AOI_AREA_M2);

  var validAreaFraction = ee.Number(
    ee.Algorithms.If(
      AOI_AREA_M2.gt(0),
      validAreaM2.divide(AOI_AREA_M2).max(0).min(1),
      0
    )
  );

  var temporalSupportFractionMean;

  if (active.aggregationMode === 'DAILY_FIRST') {
    var fractionStats = monthlyImage
      .select('temporal_support_fraction')
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: AOI_GEOM,
        scale: active.analysisScaleM,
        crs: CONFIG.reductionCrs,
        maxPixels: CONFIG.maxPixels,
        tileScale: CONFIG.tileScale
      });

    temporalSupportFractionMean = fractionStats.get(
      'temporal_support_fraction'
    );
  } else {
    temporalSupportFractionMean = null;
  }

  return ee.Feature(AOI_CENTROID, {
    'system:time_start': monthStart.millis(),
    pollutant: pollutantKey,
    pollutant_long_name: active.longName,
    unit: active.unit,
    year: monthStart.get('year'),
    month: monthStart.format('YYYY-MM'),
    month_of_year: monthStart.get('month'),
    month_start: monthStart.format('YYYY-MM-dd'),
    month_end_exclusive: monthEnd.format('YYYY-MM-dd'),
    aoi_id: CONFIG.aoiId,
    processing_branch: active.processingBranch,
    aggregation_mode: active.aggregationMode,
    aggregation_method: active.aggregationLabel,
    source_selection_mode: active.sourceSelectionMode,
    quality_description: active.qualityDescription,
    source_collection: active.collection,
    source_band: active.sourceBand,
    all_source_element_count: monthlyImage.get('all_source_element_count'),
    metadata_selected_source_element_count:
      monthlyImage.get('metadata_selected_source_element_count'),
    source_element_count: monthlyImage.get('source_element_count'),
    daily_composite_count: monthlyImage.get('daily_composite_count'),
    l3_grid_spacing_m: active.l3GridSpacingM,
    analysis_scale_m: active.analysisScaleM,
    analysis_scale_description: active.analysisScaleDescription,
    footprint_metadata: active.footprintMetadata,
    reduction_crs: CONFIG.reductionCrs,
    total_aoi_area_m2: AOI_AREA_M2,
    total_aoi_area_km2: AOI_AREA_M2.divide(1e6),
    valid_area_m2: validAreaM2,
    valid_area_km2: validAreaM2.divide(1e6),
    valid_area_fraction: validAreaFraction,
    valid_area_percent: validAreaFraction.multiply(100),
    coverage_method: 'pixelArea masked by final monthly pollutant raster',
    AOI_mean_mol_m2: valueStats.get('pollutant_monthly_mean_mean'),
    AOI_median_mol_m2: valueStats.get('pollutant_monthly_mean_median'),
    AOI_p90_mol_m2: valueStats.get('pollutant_monthly_mean_p90'),
    AOI_min_mol_m2: valueStats.get('pollutant_monthly_mean_min'),
    AOI_max_mol_m2: valueStats.get('pollutant_monthly_mean_max'),
    AOI_reduction_sample_count:
      valueStats.get('pollutant_monthly_mean_count'),
    temporal_support_mode: active.supportMode,
    temporal_support_description: active.supportDescription,
    support_count_mean: supportStats.get('temporal_support_count_mean'),
    support_count_median: supportStats.get('temporal_support_count_median'),
    support_count_p10: supportStats.get('temporal_support_count_p10'),
    support_count_p90: supportStats.get('temporal_support_count_p90'),
    support_count_min: supportStats.get('temporal_support_count_min'),
    support_count_max: supportStats.get('temporal_support_count_max'),
    temporal_support_fraction_mean: temporalSupportFractionMean,
    script_version: CONFIG.scriptVersion,
    run_mode: CONFIG.runMode
  });
}


function buildMasterOneYearMaterialization(yearValue) {

  var monthStarts = buildYearMonthStarts(yearValue);

  function buildPollutantSummary(pollutantKey) {
    var images = monthStarts.map(function(monthStartValue) {
      return createMonthlyProduct(monthStartValue, pollutantKey);
    });

    var rows = monthStarts.map(function(monthStartValue, index) {
      return createMasterAoiSummary(
        ee.Image(images[index]),
        monthStartValue,
        pollutantKey
      );
    });

    return {
      monthlyCollection: ee.ImageCollection.fromImages(images)
        .sort('system:time_start'),
      summary: ee.FeatureCollection(rows)
        .sort('system:time_start')
    };
  }

  var no2 = buildPollutantSummary('NO2');
  var so2 = buildPollutantSummary('SO2');
  var co = buildPollutantSummary('CO');

  var combined = no2.summary
    .merge(so2.summary)
    .merge(co.summary)
    .map(function(featureObject) {
      return ee.Feature(featureObject).set({
        materialization_year: yearValue,
        materialization_module: CONFIG.stage2aVersion,
        verified_engine_version: CONFIG.verifiedStage1Version,
        master_release_version: CONFIG.scriptVersion
      });
    })
    .sort('system:time_start');

  return {
    NO2: no2,
    SO2: so2,
    CO: co,
    combined: combined
  };
}


function runMasterOneYearMaterialization(
  createAssetTask,
  yearValue
) {


  yearValue =
    (yearValue === undefined || yearValue === null)
      ? CONFIG.activeYear
      : yearValue;


  var output =
    buildMasterOneYearMaterialization(
      yearValue
    );


  print(
    '=================================================='
  );

  print(
    '=== ARTICLE 4 MASTER — ONE YEAR MATERIALIZATION ==='
  );

  print(
    'Master version:',
    CONFIG.scriptVersion
  );

  print(
    'Verified Stage-1 engine:',
    CONFIG.verifiedStage1Version
  );

  print(
    'Year:',
    yearValue
  );

  print(
    'NO2 rows:',
    output.NO2.summary.size()
  );

  print(
    'SO2 rows:',
    output.SO2.summary.size()
  );

  print(
    'CO rows:',
    output.CO.summary.size()
  );

  print(
    'Combined rows (expected 36):',
    output.combined.size()
  );

  print(
    'NO2 valid months:',
    output.NO2.summary
      .filter(
        ee.Filter.notNull([
          'AOI_mean_mol_m2'
        ])
      )
      .size()
  );

  print(
    'SO2 valid months:',
    output.SO2.summary
      .filter(
        ee.Filter.notNull([
          'AOI_mean_mol_m2'
        ])
      )
      .size()
  );

  print(
    'CO valid months:',
    output.CO.summary
      .filter(
        ee.Filter.notNull([
          'AOI_mean_mol_m2'
        ])
      )
      .size()
  );


  var assetName =
    'ARTICLE4_STAGE2A_AOI_MONTHLY_' +
    CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R02';


  var assetId =
    CONFIG.assetFolder +
    '/' +
    assetName;


  print(
    'Target yearly Asset ID:',
    assetId
  );


  if (createAssetTask) {

    Export.table.toAsset({

      collection:
        output.combined,

      description:
        assetName,

      assetId:
        assetId
    });


    print(
      'Yearly Asset task:',
      'CREATED — exactly one task.'
    );

  } else {

    print(
      'Yearly Asset task:',
      'DISABLED — verification mode.'
    );
  }


  print(
    '=== END MASTER ONE YEAR MATERIALIZATION ==='
  );

  print(
    '=================================================='
  );


  return output;
}


/*** MASTER MODULE — ALL YEARS STAGE-2A MATERIALIZATION ***/


function runMasterAllYearsMaterialization(
  createAssetTasks
) {

  print(
    '=================================================='
  );

  print(
    '=== ARTICLE 4 MASTER — ALL YEARS MATERIALIZATION ==='
  );

  print(
    'AOI:',
    CONFIG.aoiId
  );

  print(
    'Period:',
    CONFIG.startYear +
    '-' +
    CONFIG.endYear
  );


  var outputs = {};


  for (
    var yearValue = CONFIG.startYear;
    yearValue <= CONFIG.endYear;
    yearValue++
  ) {

    print(
      '--------------------------------------------------'
    );

    print(
      'Preparing Stage-2A year:',
      yearValue
    );


    outputs[
      String(yearValue)
    ] =
      runMasterOneYearMaterialization(
        createAssetTasks,
        yearValue
      );
  }


  print(
    '--------------------------------------------------'
  );

  print(
    'Expected yearly Asset task count:',
    CONFIG.endYear -
    CONFIG.startYear +
    1
  );

  print(
    'ALL YEARS MATERIALIZATION:',
    createAssetTasks
      ? 'TASKS CREATED'
      : 'VERIFICATION ONLY — NO TASKS CREATED'
  );

  print(
    '=== END MASTER ALL YEARS MATERIALIZATION ==='
  );

  print(
    '=================================================='
  );


  return outputs;
}


/*** MASTER MODULE D — FINAL PUBLICATION PACKAGE FROM VERIFIED ASSETS ***/


function runMasterPublicationPackage(enableExports) {

  var PUB_CONFIG = {
    scriptVersion:
      'ARTICLE4_STAGE2D_PUBLICATION_EXPORTS_ENGINE_R01',
    inputTableStage:
      CONFIG.stage2bVersion,
    inputSpatialStage:
      CONFIG.stage2cVersion,
    aoiAsset:
      CONFIG.aoiAsset,
    aoiId:
      CONFIG.aoiId,
    startYear:
      CONFIG.startYear,
    endYear:
      CONFIG.endYear,
    assetFolder:
      CONFIG.assetFolder,
    tableDriveFolder:
      CONFIG.tableDriveFolder,
    figureDataDriveFolder:
      CONFIG.figureDataDriveFolder,
    spatialDriveFolder:
      CONFIG.spatialDriveFolder,
    supplementDriveFolder:
      CONFIG.supplementDriveFolder,
    reductionCrs:
      CONFIG.reductionCrs,
    maxPixels:
      CONFIG.maxPixels,
    tileScale:
      CONFIG.tileScale,
    relativeChangeBaselineEpsilon:
      CONFIG.relativeChangeBaselineEpsilon,
    expectedTotalMonthlyRows:
      216,
    expectedRowsPerPollutant:
      72,
    expectedAnnualAssetCount:
      18,
    expectedYearCount:
      6,
    selectedAnnualGeoTiffYears:
      CONFIG.selectedAnnualGeoTiffYears,
    selectedSo2SeasonYear:
      CONFIG.selectedSo2SeasonYear,
    selectedSo2SeasonLabels:
      CONFIG.selectedSo2SeasonLabels,
    createPublicationTableCsvTasks:
      enableExports && CONFIG.createPublicationTableCsvTasks,
    createFigureDataCsvTasks:
      enableExports && CONFIG.createFigureDataCsvTasks,
    createAnnualGeoTiffTasks:
      enableExports && CONFIG.createAnnualGeoTiffTasks,
    createLongTermGeoTiffTasks:
      enableExports && CONFIG.createLongTermGeoTiffTasks,
    createManifestCsvTasks:
      enableExports && CONFIG.createManifestCsvTasks,
    includeDiagnosticSo2AnnualGeoTiffs:
      enableExports && CONFIG.includeDiagnosticSo2AnnualGeoTiffs
  };

/*** 0.1 BASIC CONFIGURATION VALIDATION ***/

if (
  Math.floor(PUB_CONFIG.startYear) !== PUB_CONFIG.startYear ||
  Math.floor(PUB_CONFIG.endYear) !== PUB_CONFIG.endYear ||
  PUB_CONFIG.startYear !== 2019 ||
  PUB_CONFIG.endYear !== 2024
) {
  throw new Error(
    'Stage 2D R01 is frozen for the verified 2019–2024 publication period.'
  );
}


/*** 0.2 AOI ***/

var AOI_SOURCE_FC =
  ee.FeatureCollection(PUB_CONFIG.aoiAsset);

var AOI_GEOM =
  AOI_SOURCE_FC.geometry().dissolve(1);

var AOI_CENTROID =
  AOI_GEOM
    .centroid(1)
    .transform('EPSG:4326', 1);


/*** 1. INPUT ASSET IDS ***/

function yearlyAssetId(yearValue) {

  return PUB_CONFIG.assetFolder +
    '/ARTICLE4_STAGE2A_AOI_MONTHLY_' +
    PUB_CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R02';
}

var ASSET_2019 = yearlyAssetId(2019);
var ASSET_2020 = yearlyAssetId(2020);
var ASSET_2021 = yearlyAssetId(2021);
var ASSET_2022 = yearlyAssetId(2022);
var ASSET_2023 = yearlyAssetId(2023);
var ASSET_2024 = yearlyAssetId(2024);


/*** 2. LOAD AND MERGE MATERIALIZED YEARLY TABLES ***/

var YEAR_2019 = ee.FeatureCollection(ASSET_2019);
var YEAR_2020 = ee.FeatureCollection(ASSET_2020);
var YEAR_2021 = ee.FeatureCollection(ASSET_2021);
var YEAR_2022 = ee.FeatureCollection(ASSET_2022);
var YEAR_2023 = ee.FeatureCollection(ASSET_2023);
var YEAR_2024 = ee.FeatureCollection(ASSET_2024);

var MASTER_MONTHLY = YEAR_2019
  .merge(YEAR_2020)
  .merge(YEAR_2021)
  .merge(YEAR_2022)
  .merge(YEAR_2023)
  .merge(YEAR_2024)
  .sort('system:time_start');


/*** 3. STRUCTURAL ACCEPTANCE CHECKS ***/

var EXPECTED_TOTAL_ROWS = 216;
var EXPECTED_ROWS_PER_YEAR = 36;
var EXPECTED_ROWS_PER_POLLUTANT = 72;

var UNIQUE_POLLUTANT_MONTH = MASTER_MONTHLY
  .distinct([
    'pollutant',
    'month'
  ]);

var DUPLICATE_KEY_COUNT = MASTER_MONTHLY
  .size()
  .subtract(
    UNIQUE_POLLUTANT_MONTH.size()
  );

var NO2_MASTER = MASTER_MONTHLY.filter(
  ee.Filter.eq('pollutant', 'NO2')
);

var SO2_MASTER = MASTER_MONTHLY.filter(
  ee.Filter.eq('pollutant', 'SO2')
);

var CO_MASTER = MASTER_MONTHLY.filter(
  ee.Filter.eq('pollutant', 'CO')
);


/*** 3.1 ACCEPTANCE MANIFEST — 18 POLLUTANT × YEAR ROWS ***/

var MANIFEST_FEATURES = [];

['NO2', 'SO2', 'CO'].forEach(
  function(pollutantKey) {

    for (
      var yearValue = PUB_CONFIG.startYear;
      yearValue <= PUB_CONFIG.endYear;
      yearValue++
    ) {

      var subset = MASTER_MONTHLY
        .filter(
          ee.Filter.eq(
            'pollutant',
            pollutantKey
          )
        )
        .filter(
          ee.Filter.eq(
            'year',
            yearValue
          )
        );

      var validSubset = subset.filter(
        ee.Filter.notNull([
          'AOI_mean_mol_m2'
        ])
      );

      var zeroCoverageSubset = subset.filter(
        ee.Filter.eq(
          'valid_area_percent',
          0
        )
      );

      MANIFEST_FEATURES.push(
        ee.Feature(
          null,
          {
            pollutant:
              pollutantKey,

            year:
              yearValue,

            row_count:
              subset.size(),

            valid_month_count:
              validSubset.size(),

            null_month_count:
              subset.size()
                .subtract(
                  validSubset.size()
                ),

            zero_coverage_month_count:
              zeroCoverageSubset.size()
          }
        )
      );
    }
  }
);

var ACCEPTANCE_MANIFEST =
  ee.FeatureCollection(
    MANIFEST_FEATURES
  );


/*** 4. TABLE 1 — METHOD / DATASET METADATA ***/

var TABLE_1_METHOD_METADATA =
  ee.FeatureCollection([

    ee.Feature(
      null,
      {
        pollutant:
          'NO2',

        pollutant_long_name:
          'Tropospheric nitrogen dioxide column number density',

        source_collection:
          'COPERNICUS/S5P/OFFL/L3_NO2',

        source_band:
          'tropospheric_NO2_column_number_density',

        unit:
          'mol/m2',

        source_selection_mode:
          'PRODUCT_QUALITY_NOMINAL',

        quality_description:
          'PRODUCT_QUALITY = NOMINAL; native Earth Engine L3 NO2 validity screening retained',

        aggregation_mode:
          'DAILY_FIRST',

        aggregation_method:
          'orbital L3 observations -> daily mean -> calendar-month mean',

        temporal_support:
          'valid calendar days contributing to the monthly daily-first composite',

        l3_grid_spacing_m:
          1113.2,

        analysis_scale_m:
          1113.2,

        spatial_interpretation:
          'Earth Engine L3 grid-scale AOI reduction; 1113.2 m is not interpreted as independent native TROPOMI spatial resolution',

        study_period:
          '2019-01 through 2024-12',

        aoi_id:
          PUB_CONFIG.aoiId
      }
    ),

    ee.Feature(
      null,
      {
        pollutant:
          'SO2',

        pollutant_long_name:
          'Sulfur dioxide column number density',

        source_collection:
          'COPERNICUS/S5P/OFFL/L3_SO2',

        source_band:
          'SO2_column_number_density',

        unit:
          'mol/m2',

        source_selection_mode:
          'NATIVE_L3_INGESTION_QA',

        quality_description:
          'native Earth Engine L3 SO2 ingestion QA retained; no additional qa_value or PRODUCT_QUALITY filter',

        aggregation_mode:
          'ORBITAL_MONTHLY',

        aggregation_method:
          'valid orbital L3 observations -> calendar-month mean',

        temporal_support:
          'per-pixel count of valid orbital L3 observations contributing to the monthly composite',

        l3_grid_spacing_m:
          1113.2,

        analysis_scale_m:
          7000,

        spatial_interpretation:
          '7000 m dissertation-compatible AOI analysis scale; not the native Earth Engine L3 pixel size; months without valid support remain NA',

        study_period:
          '2019-01 through 2024-12',

        aoi_id:
          PUB_CONFIG.aoiId
      }
    ),

    ee.Feature(
      null,
      {
        pollutant:
          'CO',

        pollutant_long_name:
          'Carbon monoxide column number density',

        source_collection:
          'COPERNICUS/S5P/OFFL/L3_CO',

        source_band:
          'CO_column_number_density',

        unit:
          'mol/m2',

        source_selection_mode:
          'NATIVE_L3_MASK',

        quality_description:
          'Earth Engine L3 CO ingestion validity mask retained; no additional pixel QA filter',

        aggregation_mode:
          'DAILY_FIRST',

        aggregation_method:
          'orbital L3 observations -> daily mean -> calendar-month mean',

        temporal_support:
          'valid calendar days contributing to the monthly daily-first composite',

        l3_grid_spacing_m:
          1113.2,

        analysis_scale_m:
          1113.2,

        spatial_interpretation:
          'Earth Engine L3 grid-scale AOI reduction; 1113.2 m is not interpreted as independent native TROPOMI spatial resolution',

        study_period:
          '2019-01 through 2024-12',

        aoi_id:
          PUB_CONFIG.aoiId
      }
    )
  ]);


/*** 5. HELPER — PUBLICATION AVAILABILITY STATUS ***/

function addAvailabilityStatus(featureObject) {

  var feature =
    ee.Feature(featureObject);

  var meanValue =
    feature.get(
      'AOI_mean_mol_m2'
    );

  var validAreaPercent =
    feature.get(
      'valid_area_percent'
    );

  var hasMean =
    ee.Number(
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          meanValue,
          null
        ),
        0,
        1
      )
    );

  var coverageValue =
    ee.Number(
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          validAreaPercent,
          null
        ),
        0,
        validAreaPercent
      )
    );

  var isValid =
    hasMean.eq(1)
      .and(
        coverageValue.gt(0)
      );

  var status =
    ee.String(
      ee.Algorithms.If(
        isValid,
        'VALID',
        'NA_NO_VALID_FINAL_RASTER_DATA'
      )
    );

  return feature.set({
    is_valid_month:
      ee.Number(
        ee.Algorithms.If(
          isValid,
          1,
          0
        )
      ),

    availability_status:
      status
  });
}

var MASTER_MONTHLY_WITH_STATUS =
  MASTER_MONTHLY.map(
    addAvailabilityStatus
  );


/*** 6. SAFE PROPERTY ACCESS + PUBLICATION SCHEMA NORMALIZATION ***/


function safeGet(featureObject, propertyName) {

  var feature =
    ee.Feature(featureObject);

  return ee.Algorithms.If(
    feature
      .propertyNames()
      .contains(propertyName),
    feature.get(propertyName),
    null
  );
}


/*** 6.1 TABLE 2 — MONTHLY AOI STATISTICS ***/

function toMonthlyStatisticsRow(featureObject) {

  var feature =
    ee.Feature(featureObject);

  return ee.Feature(
    null,
    {
      pollutant:
        safeGet(feature, 'pollutant'),

      pollutant_long_name:
        safeGet(feature, 'pollutant_long_name'),

      unit:
        safeGet(feature, 'unit'),

      year:
        safeGet(feature, 'year'),

      month:
        safeGet(feature, 'month'),

      month_of_year:
        safeGet(feature, 'month_of_year'),

      month_start:
        safeGet(feature, 'month_start'),

      month_end_exclusive:
        safeGet(feature, 'month_end_exclusive'),

      aoi_id:
        safeGet(feature, 'aoi_id'),

      AOI_mean_mol_m2:
        safeGet(feature, 'AOI_mean_mol_m2'),

      AOI_median_mol_m2:
        safeGet(feature, 'AOI_median_mol_m2'),

      AOI_p90_mol_m2:
        safeGet(feature, 'AOI_p90_mol_m2'),

      AOI_min_mol_m2:
        safeGet(feature, 'AOI_min_mol_m2'),

      AOI_max_mol_m2:
        safeGet(feature, 'AOI_max_mol_m2'),

      AOI_reduction_sample_count:
        safeGet(feature, 'AOI_reduction_sample_count'),

      valid_area_m2:
        safeGet(feature, 'valid_area_m2'),

      valid_area_km2:
        safeGet(feature, 'valid_area_km2'),

      valid_area_fraction:
        safeGet(feature, 'valid_area_fraction'),

      valid_area_percent:
        safeGet(feature, 'valid_area_percent'),

      is_valid_month:
        safeGet(feature, 'is_valid_month'),

      availability_status:
        safeGet(feature, 'availability_status'),

      system_time_start:
        safeGet(feature, 'system:time_start')
    }
  );
}

var TABLE_2_MONTHLY_AOI_STATISTICS =
  ee.FeatureCollection(
    MASTER_MONTHLY_WITH_STATUS.map(
      toMonthlyStatisticsRow
    )
  )
  .sort('system_time_start');


/*** 7. TABLE 3 — MONTHLY COVERAGE / QC ***/

function toMonthlyQcRow(featureObject) {

  var feature =
    ee.Feature(featureObject);

  return ee.Feature(
    null,
    {
      pollutant:
        safeGet(feature, 'pollutant'),

      year:
        safeGet(feature, 'year'),

      month:
        safeGet(feature, 'month'),

      month_of_year:
        safeGet(feature, 'month_of_year'),

      aoi_id:
        safeGet(feature, 'aoi_id'),

      processing_branch:
        safeGet(feature, 'processing_branch'),

      aggregation_mode:
        safeGet(feature, 'aggregation_mode'),

      aggregation_method:
        safeGet(feature, 'aggregation_method'),

      source_selection_mode:
        safeGet(feature, 'source_selection_mode'),

      quality_description:
        safeGet(feature, 'quality_description'),

      source_collection:
        safeGet(feature, 'source_collection'),

      source_band:
        safeGet(feature, 'source_band'),

      all_source_element_count:
        safeGet(feature, 'all_source_element_count'),

      metadata_selected_source_element_count:
        safeGet(feature, 'metadata_selected_source_element_count'),

      source_element_count:
        safeGet(feature, 'source_element_count'),

      daily_composite_count:
        safeGet(feature, 'daily_composite_count'),

      l3_grid_spacing_m:
        safeGet(feature, 'l3_grid_spacing_m'),

      analysis_scale_m:
        safeGet(feature, 'analysis_scale_m'),

      analysis_scale_description:
        safeGet(feature, 'analysis_scale_description'),

      footprint_metadata:
        safeGet(feature, 'footprint_metadata'),

      reduction_crs:
        safeGet(feature, 'reduction_crs'),

      total_aoi_area_m2:
        safeGet(feature, 'total_aoi_area_m2'),

      total_aoi_area_km2:
        safeGet(feature, 'total_aoi_area_km2'),

      valid_area_m2:
        safeGet(feature, 'valid_area_m2'),

      valid_area_km2:
        safeGet(feature, 'valid_area_km2'),

      valid_area_fraction:
        safeGet(feature, 'valid_area_fraction'),

      valid_area_percent:
        safeGet(feature, 'valid_area_percent'),

      coverage_method:
        safeGet(feature, 'coverage_method'),

      temporal_support_mode:
        safeGet(feature, 'temporal_support_mode'),

      temporal_support_description:
        safeGet(feature, 'temporal_support_description'),

      support_count_mean:
        safeGet(feature, 'support_count_mean'),

      support_count_median:
        safeGet(feature, 'support_count_median'),

      support_count_p10:
        safeGet(feature, 'support_count_p10'),

      support_count_p90:
        safeGet(feature, 'support_count_p90'),

      support_count_min:
        safeGet(feature, 'support_count_min'),

      support_count_max:
        safeGet(feature, 'support_count_max'),

      temporal_support_fraction_mean:
        safeGet(feature, 'temporal_support_fraction_mean'),

      AOI_reduction_sample_count:
        safeGet(feature, 'AOI_reduction_sample_count'),

      is_valid_month:
        safeGet(feature, 'is_valid_month'),

      availability_status:
        safeGet(feature, 'availability_status'),

      system_time_start:
        safeGet(feature, 'system:time_start')
    }
  );
}

var TABLE_3_MONTHLY_QC =
  ee.FeatureCollection(
    MASTER_MONTHLY_WITH_STATUS.map(
      toMonthlyQcRow
    )
  )
  .sort('system_time_start');


/*** 8. SEASON DEFINITIONS ***/

var SEASON_DEFINITIONS = [
  {
    name:
      'MAM',
    months:
      [3, 4, 5]
  },
  {
    name:
      'JJA',
    months:
      [6, 7, 8]
  },
  {
    name:
      'SON',
    months:
      [9, 10, 11]
  }
];


/*** 9. HELPERS FOR SEASONAL / ANNUAL SUMMARY ***/

function subsetForRegularSeason(
  pollutantKey,
  yearValue,
  monthList
) {

  return MASTER_MONTHLY_WITH_STATUS
    .filter(
      ee.Filter.eq(
        'pollutant',
        pollutantKey
      )
    )
    .filter(
      ee.Filter.eq(
        'year',
        yearValue
      )
    )
    .filter(
      ee.Filter.inList(
        'month_of_year',
        monthList
      )
    );
}


function subsetForDJF(
  pollutantKey,
  seasonYear
) {

  var decemberPreviousYear =
    MASTER_MONTHLY_WITH_STATUS
      .filter(
        ee.Filter.eq(
          'pollutant',
          pollutantKey
        )
      )
      .filter(
        ee.Filter.eq(
          'year',
          seasonYear - 1
        )
      )
      .filter(
        ee.Filter.eq(
          'month_of_year',
          12
        )
      );

  var januaryFebruary =
    MASTER_MONTHLY_WITH_STATUS
      .filter(
        ee.Filter.eq(
          'pollutant',
          pollutantKey
        )
      )
      .filter(
        ee.Filter.eq(
          'year',
          seasonYear
        )
      )
      .filter(
        ee.Filter.inList(
          'month_of_year',
          [1, 2]
        )
      );

  return decemberPreviousYear
    .merge(
      januaryFebruary
    );
}


function createPeriodSummary(
  sourceCollection,
  pollutantKey,
  periodType,
  periodLabel,
  yearValue,
  expectedMonthCount
) {

  var source =
    ee.FeatureCollection(
      sourceCollection
    );

  var valid =
    source.filter(
      ee.Filter.eq(
        'is_valid_month',
        1
      )
    );

  var validCount =
    valid.size();

  var sourceCount =
    source.size();

  var completeness =
    ee.Number(
      validCount
    ).divide(
      expectedMonthCount
    );

  var validMeans =
    valid.filter(
      ee.Filter.notNull([
        'AOI_mean_mol_m2'
      ])
    );

  var valueStats =
    validMeans.reduceColumns({

      reducer:
        ee.Reducer.mean()
          .combine({
            reducer2:
              ee.Reducer.median(),
            sharedInputs:
              true
          })
          .combine({
            reducer2:
              ee.Reducer.percentile([
                90
              ]),
            sharedInputs:
              true
          })
          .combine({
            reducer2:
              ee.Reducer.stdDev(),
            sharedInputs:
              true
          })
          .combine({
            reducer2:
              ee.Reducer.minMax(),
            sharedInputs:
              true
          }),

      selectors: [
        'AOI_mean_mol_m2'
      ]
    });

  var periodMean =
    valueStats.get(
      'mean'
    );

  var periodStdDev =
    valueStats.get(
      'stdDev'
    );

  var coefficientOfVariationPercent =
    ee.Algorithms.If(
      ee.Algorithms.IsEqual(
        periodMean,
        null
      ),
      null,
      ee.Algorithms.If(
        ee.Number(
          periodMean
        ).neq(0),
        ee.Number(
          periodStdDev
        )
          .divide(
            ee.Number(
              periodMean
            )
          )
          .multiply(100),
        null
      )
    );

  var coverageMean =
    valid.aggregate_mean(
      'valid_area_percent'
    );

  var coverageMin =
    valid.aggregate_min(
      'valid_area_percent'
    );

  var coverageMax =
    valid.aggregate_max(
      'valid_area_percent'
    );

  return ee.Feature(
    null,
    {
      pollutant:
        pollutantKey,

      period_type:
        periodType,

      period_label:
        periodLabel,

      year:
        yearValue,

      expected_month_count:
        expectedMonthCount,

      source_month_count:
        sourceCount,

      valid_month_count:
        validCount,

      missing_or_invalid_month_count:
        ee.Number(
          expectedMonthCount
        ).subtract(
          validCount
        ),

      temporal_completeness_fraction:
        completeness,

      temporal_completeness_percent:
        completeness.multiply(100),

      period_mean_of_monthly_AOI_means_mol_m2:
        periodMean,

      period_median_of_monthly_AOI_means_mol_m2:
        valueStats.get(
          'median'
        ),

      period_p90_of_monthly_AOI_means_mol_m2:
        valueStats.get(
          'p90'
        ),

      period_stddev_of_monthly_AOI_means_mol_m2:
        periodStdDev,

      period_cv_percent:
        coefficientOfVariationPercent,

      period_min_monthly_AOI_mean_mol_m2:
        valueStats.get(
          'min'
        ),

      period_max_monthly_AOI_mean_mol_m2:
        valueStats.get(
          'max'
        ),

      mean_valid_area_percent:
        coverageMean,

      min_valid_area_percent:
        coverageMin,

      max_valid_area_percent:
        coverageMax,

      summary_basis:
        'equal-weight monthly AOI means; invalid/NA months excluded from value statistics and retained in completeness metrics',

      aoi_id:
        PUB_CONFIG.aoiId
    }
  );
}


/*** 10. TABLE 4 — SEASONAL + ANNUAL SUMMARY ***/

var TABLE_4_FEATURES = [];

['NO2', 'SO2', 'CO'].forEach(
  function(pollutantKey) {


    for (
      var yearValue = PUB_CONFIG.startYear;
      yearValue <= PUB_CONFIG.endYear;
      yearValue++
    ) {

      SEASON_DEFINITIONS.forEach(
        function(seasonDefinition) {

          TABLE_4_FEATURES.push(
            createPeriodSummary(
              subsetForRegularSeason(
                pollutantKey,
                yearValue,
                seasonDefinition.months
              ),
              pollutantKey,
              'SEASON',
              seasonDefinition.name,
              yearValue,
              3
            )
          );
        }
      );


      var annualSubset =
        MASTER_MONTHLY_WITH_STATUS
          .filter(
            ee.Filter.eq(
              'pollutant',
              pollutantKey
            )
          )
          .filter(
            ee.Filter.eq(
              'year',
              yearValue
            )
          );

      TABLE_4_FEATURES.push(
        createPeriodSummary(
          annualSubset,
          pollutantKey,
          'ANNUAL',
          'ANNUAL',
          yearValue,
          12
        )
      );
    }


    for (
      var djfYear = 2020;
      djfYear <= 2024;
      djfYear++
    ) {

      TABLE_4_FEATURES.push(
        createPeriodSummary(
          subsetForDJF(
            pollutantKey,
            djfYear
          ),
          pollutantKey,
          'SEASON',
          'DJF',
          djfYear,
          3
        )
      );
    }
  }
);

var TABLE_4_SEASONAL_ANNUAL_SUMMARY =
  ee.FeatureCollection(
    TABLE_4_FEATURES
  );


/*** 11. STAGE-2D FIGURE-READY TABLE DATA ***/


var FIGURE_3_TIME_SERIES_DATA =
  TABLE_2_MONTHLY_AOI_STATISTICS.map(
    function(featureObject) {

      var feature = ee.Feature(featureObject);

      return ee.Feature(null, {
        figure_id:
          'FIG_3',

        pollutant:
          feature.get('pollutant'),

        pollutant_long_name:
          feature.get('pollutant_long_name'),

        unit:
          feature.get('unit'),

        year:
          feature.get('year'),

        month:
          feature.get('month'),

        month_of_year:
          feature.get('month_of_year'),

        month_start:
          feature.get('month_start'),

        AOI_mean_mol_m2:
          feature.get('AOI_mean_mol_m2'),

        AOI_median_mol_m2:
          feature.get('AOI_median_mol_m2'),

        AOI_p90_mol_m2:
          feature.get('AOI_p90_mol_m2'),

        valid_area_percent:
          feature.get('valid_area_percent'),

        is_valid_month:
          feature.get('is_valid_month'),

        availability_status:
          feature.get('availability_status'),

        system_time_start:
          feature.get('system_time_start')
      });
    }
  )
  .sort('system_time_start');


var FIGURE_7_AVAILABILITY_DATA =
  TABLE_3_MONTHLY_QC.map(
    function(featureObject) {

      var feature = ee.Feature(featureObject);

      return ee.Feature(null, {
        figure_id:
          'FIG_7',

        pollutant:
          feature.get('pollutant'),

        year:
          feature.get('year'),

        month:
          feature.get('month'),

        month_of_year:
          feature.get('month_of_year'),

        valid_area_percent:
          feature.get('valid_area_percent'),

        support_count_mean:
          feature.get('support_count_mean'),

        support_count_median:
          feature.get('support_count_median'),

        support_count_p10:
          feature.get('support_count_p10'),

        support_count_p90:
          feature.get('support_count_p90'),

        temporal_support_fraction_mean:
          feature.get('temporal_support_fraction_mean'),

        is_valid_month:
          feature.get('is_valid_month'),

        availability_status:
          feature.get('availability_status'),

        processing_branch:
          feature.get('processing_branch'),

        temporal_support_mode:
          feature.get('temporal_support_mode'),

        system_time_start:
          feature.get('system_time_start')
      });
    }
  )
  .sort('system_time_start');


var SO2_COMPLETE_SEASON_CANDIDATES =
  TABLE_4_SEASONAL_ANNUAL_SUMMARY
    .filter(ee.Filter.eq('pollutant', 'SO2'))
    .filter(ee.Filter.eq('period_type', 'SEASON'))
    .filter(ee.Filter.eq('temporal_completeness_fraction', 1));


var FIGURE_6_SO2_SELECTED_SEASON_DATA =
  SO2_COMPLETE_SEASON_CANDIDATES
    .filter(
      ee.Filter.eq(
        'year',
        PUB_CONFIG.selectedSo2SeasonYear
      )
    )
    .filter(
      ee.Filter.inList(
        'period_label',
        PUB_CONFIG.selectedSo2SeasonLabels
      )
    );


/*** 12. STAGE-2C ANNUAL ASSET HELPERS ***/

var SPATIAL_CATALOG = {

  NO2: {
    analysisScaleM:
      1113.2,
    l3GridSpacingM:
      1113.2,
    processingBranch:
      'NO2_DAILY_FIRST_LEVEL1',
    hotspotPublicationAllowed:
      true,
    allowStrictLongTermChange:
      true,
    publicationClass:
      'PUBLICATION_ELIGIBLE_IF_PERIOD_COMPLETE',
    footprintMetadata:
      'TROPOMI footprint is coarser than the 1113.2 m Earth Engine L3 grid; not treated as independent 1.1 km observations'
  },

  SO2: {
    analysisScaleM:
      7000,
    l3GridSpacingM:
      1113.2,
    processingBranch:
      'SO2_ORBITAL_MONTHLY_LEVEL1',
    hotspotPublicationAllowed:
      false,
    allowStrictLongTermChange:
      false,
    publicationClass:
      'DIAGNOSTIC_ONLY',
    footprintMetadata:
      'approximately footprint-scale S5P/TROPOMI support; Earth Engine L3 grid spacing remains 1113.2 m'
  },

  CO: {
    analysisScaleM:
      1113.2,
    l3GridSpacingM:
      1113.2,
    processingBranch:
      'CO_DAILY_FIRST',
    hotspotPublicationAllowed:
      true,
    allowStrictLongTermChange:
      true,
    publicationClass:
      'PUBLICATION_ELIGIBLE_IF_PERIOD_COMPLETE',
    footprintMetadata:
      'CO source footprint is coarser than the 1113.2 m Earth Engine L3 grid; 1113.2 m is not interpreted as independent native spatial resolution'
  }
};


function stage2cAnnualAssetName(
  pollutantKey,
  yearValue
) {

  return 'ARTICLE4_STAGE2C_ANNUAL_' +
    pollutantKey +
    '_' +
    PUB_CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_R01';
}


function stage2cAnnualAssetId(
  pollutantKey,
  yearValue
) {

  return PUB_CONFIG.assetFolder +
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
  )
  .set('analysis_year', yearValue);
}


function buildAnnualCollection(
  pollutantKey
) {

  var images = [];

  for (
    var yearValue = PUB_CONFIG.startYear;
    yearValue <= PUB_CONFIG.endYear;
    yearValue++
  ) {

    images.push(
      loadAnnualAsset(
        pollutantKey,
        yearValue
      )
    );
  }

  return ee.ImageCollection
    .fromImages(images)
    .sort('analysis_year');
}


/*** 13. ANNUAL ASSET MANIFEST — 18 ROWS ***/

var ANNUAL_ASSET_MANIFEST_FEATURES = [];

['NO2', 'SO2', 'CO'].forEach(
  function(pollutantKey) {

    var spatial =
      SPATIAL_CATALOG[pollutantKey];

    for (
      var yearValue = PUB_CONFIG.startYear;
      yearValue <= PUB_CONFIG.endYear;
      yearValue++
    ) {

      var image =
        loadAnnualAsset(
          pollutantKey,
          yearValue
        );

      ANNUAL_ASSET_MANIFEST_FEATURES.push(
        ee.Feature(null, {

          product_group:
            'ANNUAL_SPATIAL',

          pollutant:
            pollutantKey,

          year:
            yearValue,

          asset_id:
            stage2cAnnualAssetId(
              pollutantKey,
              yearValue
            ),

          strict_period_complete:
            image.get(
              'strict_period_complete'
            ),

          valid_month_count_aoi:
            image.get(
              'valid_month_count_aoi'
            ),

          expected_month_count:
            image.get(
              'expected_month_count'
            ),

          hotspot_publication_eligible:
            image.get(
              'hotspot_publication_eligible'
            ),

          hotspot_use_class:
            image.get(
              'hotspot_use_class'
            ),

          processing_branch:
            image.get(
              'processing_branch'
            ),

          analysis_scale_m:
            spatial.analysisScaleM,

          l3_grid_spacing_m:
            spatial.l3GridSpacingM,

          publication_role:
            pollutantKey === 'SO2'
              ? 'DIAGNOSTIC_OR_SUPPLEMENT_ONLY'
              : 'PUBLICATION_CANDIDATE_IF_STRICT_COMPLETE',

          stage2d_script_version:
            PUB_CONFIG.scriptVersion
        })
      );
    }
  }
);

var ANNUAL_ASSET_MANIFEST =
  ee.FeatureCollection(
    ANNUAL_ASSET_MANIFEST_FEATURES
  );


/*** 14. LONG-TERM PRODUCTS — ASSET-ONLY, NO S5P REPROCESSING ***/

function buildLongTermProduct(
  pollutantKey
) {

  var spatial =
    SPATIAL_CATALOG[pollutantKey];

  var annualCollection =
    buildAnnualCollection(
      pollutantKey
    );

  var strictCompleteAnnuals =
    annualCollection.filter(
      ee.Filter.eq(
        'strict_period_complete',
        1
      )
    );

  var strictCompleteYearCount =
    strictCompleteAnnuals.size();

  var startImage =
    loadAnnualAsset(
      pollutantKey,
      PUB_CONFIG.startYear
    );

  var endImage =
    loadAnnualAsset(
      pollutantKey,
      PUB_CONFIG.endYear
    );

  var startComplete =
    ee.Number(
      startImage.get(
        'strict_period_complete'
      )
    );

  var endComplete =
    ee.Number(
      endImage.get(
        'strict_period_complete'
      )
    );

  var endpointComplete =
    startComplete.multiply(
      endComplete
    );

  var changePublicationEligible =
    ee.Number(
      ee.Algorithms.If(
        spatial.allowStrictLongTermChange,
        endpointComplete,
        0
      )
    );

  var startMean =
    startImage.select(
      'period_mean'
    );

  var endMean =
    endImage.select(
      'period_mean'
    );

  var absoluteChangeRaw =
    endMean
      .subtract(startMean)
      .rename(
        'absolute_change_2024_minus_2019'
      )
      .toFloat();

  var baselineSafeMask =
    startMean
      .abs()
      .gt(
        PUB_CONFIG.relativeChangeBaselineEpsilon
      );

  var relativeChangeRaw =
    absoluteChangeRaw
      .divide(startMean)
      .multiply(100)
      .rename(
        'relative_change_percent'
      )
      .updateMask(
        baselineSafeMask
      )
      .toFloat();

  var relativeChangeValidMask =
    baselineSafeMask
      .rename(
        'relative_change_valid_mask'
      )
      .toFloat();

  var emptyChange =
    ee.Image.cat([
      ee.Image.constant(0)
        .rename(
          'absolute_change_2024_minus_2019'
        ),
      ee.Image.constant(0)
        .rename(
          'relative_change_percent'
        ),
      ee.Image.constant(0)
        .rename(
          'relative_change_valid_mask'
        )
    ])
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(AOI_GEOM);

  var changeImage =
    ee.Image(
      ee.Algorithms.If(
        changePublicationEligible.eq(1),
        ee.Image.cat([
          absoluteChangeRaw,
          relativeChangeRaw,
          relativeChangeValidMask
        ]).clip(AOI_GEOM),
        emptyChange
      )
    )
    .set({
      pollutant:
        pollutantKey,
      start_year:
        PUB_CONFIG.startYear,
      end_year:
        PUB_CONFIG.endYear,
      start_year_complete:
        startComplete,
      end_year_complete:
        endComplete,
      change_publication_eligible:
        changePublicationEligible,
      processing_branch:
        spatial.processingBranch,
      stage2d_script_version:
        PUB_CONFIG.scriptVersion
    });

  var persistencePublicationEligible =
    ee.Number(
      ee.Algorithms.If(
        spatial.hotspotPublicationAllowed,
        strictCompleteYearCount.eq(
          PUB_CONFIG.expectedYearCount
        ),
        0
      )
    );

  var hotspotOccurrenceCount =
    ee.ImageCollection(
      strictCompleteAnnuals.map(
        function(imageObject) {

          return ee.Image(imageObject)
            .select('hotspot_p90')
            .unmask(0)
            .rename(
              'hotspot_occurrence_count'
            );
        }
      )
    )
    .sum()
    .rename(
      'hotspot_occurrence_count'
    )
    .toFloat();

  var hotspotPersistenceRaw =
    hotspotOccurrenceCount
      .divide(
        strictCompleteYearCount.max(1)
      )
      .rename(
        'hotspot_persistence_fraction'
      )
      .toFloat();

  var emptyPersistence =
    ee.Image.cat([
      ee.Image.constant(0)
        .rename(
          'hotspot_occurrence_count'
        ),
      ee.Image.constant(0)
        .rename(
          'hotspot_persistence_fraction'
        )
    ])
    .toFloat()
    .updateMask(
      ee.Image.constant(0)
    )
    .clip(AOI_GEOM);

  var hotspotPersistence =
    ee.Image(
      ee.Algorithms.If(
        persistencePublicationEligible.eq(1),
        ee.Image.cat([
          hotspotOccurrenceCount,
          hotspotPersistenceRaw
        ]).clip(AOI_GEOM),
        emptyPersistence
      )
    )
    .set({
      pollutant:
        pollutantKey,
      strict_complete_year_count:
        strictCompleteYearCount,
      expected_year_count:
        PUB_CONFIG.expectedYearCount,
      hotspot_publication_allowed:
        spatial.hotspotPublicationAllowed,
      hotspot_persistence_publication_eligible:
        persistencePublicationEligible,
      hotspot_definition:
        'fraction of strictly complete annual products where pixel exceeds annual AOI P90; AOI-relative, not regulatory',
      processing_branch:
        spatial.processingBranch,
      stage2d_script_version:
        PUB_CONFIG.scriptVersion
    });

  var changeStats =
    changeImage
      .select(
        'absolute_change_2024_minus_2019'
      )
      .reduceRegion({
        reducer:
          ee.Reducer.mean()
            .combine({
              reducer2:
                ee.Reducer.median(),
              sharedInputs:
                true
            })
            .combine({
              reducer2:
                ee.Reducer.percentile([
                  10,
                  90
                ]),
              sharedInputs:
                true
            })
            .combine({
              reducer2:
                ee.Reducer.minMax(),
              sharedInputs:
                true
            }),
        geometry:
          AOI_GEOM,
        scale:
          spatial.analysisScaleM,
        crs:
          PUB_CONFIG.reductionCrs,
        maxPixels:
          PUB_CONFIG.maxPixels,
        tileScale:
          PUB_CONFIG.tileScale
      });

  var summary =
    ee.FeatureCollection([
      ee.Feature(
        AOI_CENTROID,
        {
          pollutant:
            pollutantKey,
          start_year:
            PUB_CONFIG.startYear,
          end_year:
            PUB_CONFIG.endYear,
          expected_year_count:
            PUB_CONFIG.expectedYearCount,
          strict_complete_year_count:
            strictCompleteYearCount,
          start_year_complete:
            startComplete,
          end_year_complete:
            endComplete,
          change_publication_eligible:
            changePublicationEligible,
          hotspot_publication_allowed:
            spatial.hotspotPublicationAllowed,
          hotspot_persistence_publication_eligible:
            persistencePublicationEligible,
          hotspot_publication_policy:
            spatial.publicationClass,
          absolute_change_mean_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_mean'
            ),
          absolute_change_median_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_median'
            ),
          absolute_change_p10_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_p10'
            ),
          absolute_change_p90_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_p90'
            ),
          absolute_change_min_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_min'
            ),
          absolute_change_max_mol_m2:
            changeStats.get(
              'absolute_change_2024_minus_2019_max'
            ),
          analysis_scale_m:
            spatial.analysisScaleM,
          l3_grid_spacing_m:
            spatial.l3GridSpacingM,
          processing_branch:
            spatial.processingBranch,
          footprint_metadata:
            spatial.footprintMetadata,
          stage2d_script_version:
            PUB_CONFIG.scriptVersion
        }
      )
    ]);

  return {
    annualCollection:
      annualCollection,
    strictCompleteYearCount:
      strictCompleteYearCount,
    changeImage:
      changeImage,
    hotspotPersistence:
      hotspotPersistence,
    summary:
      summary
  };
}


var LONG_TERM_NO2 =
  buildLongTermProduct('NO2');

var LONG_TERM_SO2 =
  buildLongTermProduct('SO2');

var LONG_TERM_CO =
  buildLongTermProduct('CO');

var LONG_TERM_SUMMARY_ALL =
  LONG_TERM_NO2.summary
    .merge(LONG_TERM_SO2.summary)
    .merge(LONG_TERM_CO.summary);


/*** 15. PUBLICATION FIGURE MANIFEST ***/

var FIGURE_MANIFEST =
  ee.FeatureCollection([

    ee.Feature(null, {
      figure_id:
        'FIG_1',
      title:
        'Study area and spatial context',
      source:
        'QGIS/GEE AOI + contextual layers',
      stage2d_product:
        'NONE_EXTERNAL_CARTOGRAPHY',
      status:
        'TO_FORMAT_IN_STAGE3',
      publication_role:
        'MAIN_TEXT'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_2',
      title:
        'Pollutant-specific Level-1 workflow',
      source:
        'Methodological diagram',
      stage2d_product:
        'NONE_EXTERNAL_DIAGRAM',
      status:
        'TO_DRAW_IN_STAGE3',
      publication_role:
        'MAIN_TEXT'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_3',
      title:
        'Monthly AOI time series NO2, SO2 and CO, 2019–2024',
      source:
        'FIGURE_3_TIME_SERIES_DATA',
      stage2d_product:
        'CSV_LONG_FORMAT',
      status:
        'READY_FOR_PYTHON_R',
      publication_role:
        'MAIN_TEXT'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_4',
      title:
        'NO2 endpoint spatial distributions (2019, 2024), 2019–2024 change and hotspot persistence',
      source:
        'Stage-2C annual Assets 2019/2024 + LONG_TERM_NO2',
      stage2d_product:
        'GEOTIFF',
      status:
        'PUBLICATION_ELIGIBLE',
      publication_role:
        'MAIN_TEXT'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_5',
      title:
        'CO endpoint spatial distributions (2019, 2024), 2019–2024 change and hotspot persistence',
      source:
        'Stage-2C annual Assets 2019/2024 + LONG_TERM_CO',
      stage2d_product:
        'GEOTIFF',
      status:
        'PUBLICATION_ELIGIBLE',
      publication_role:
        'MAIN_TEXT'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_6',
      title:
        'SO2 seasonal contrast — MAM 2024 vs JJA 2024',
      source:
        'FIGURE_6_SO2_SELECTED_SEASON_DATA + explicit Stage-2C seasonal raster dependency',
      stage2d_product:
        'MAM_2024_JJA_2024_TABLE_READY_RASTERS_REQUIRE_EXPLICIT_MATERIALIZATION',
      status:
        'DO_NOT_RECOMPUTE_SILENTLY',
      publication_role:
        'MAIN_TEXT_OR_DIAGNOSTIC_DEPENDING_STAGE3_SELECTION',
      note:
        'Configured candidate seasons are MAM and JJA for the selected year. Their use in Fig. 6 is permitted only if the final-AOI acceptance confirms 3/3 valid months and strict completeness for both seasons. Frozen Stage 2C materializes annual Assets only; matching seasonal rasters require explicit verified Stage-2C materialization if Fig. 6 is retained as a spatial main-text figure.'
    }),

    ee.Feature(null, {
      figure_id:
        'FIG_7',
      title:
        'Coverage and data availability / completeness',
      source:
        'FIGURE_7_AVAILABILITY_DATA',
      stage2d_product:
        'CSV_LONG_FORMAT',
      status:
        'READY_FOR_PYTHON_R',
      publication_role:
        'MAIN_TEXT'
    })
  ]);


/*** 16. SPATIAL PRODUCT MANIFEST ***/

var LONG_TERM_PRODUCT_MANIFEST =
  ee.FeatureCollection([

    ee.Feature(null, {
      product_group:
        'LONG_TERM_CHANGE',
      pollutant:
        'NO2',
      period:
        '2019-2024',
      publication_eligible:
        LONG_TERM_NO2.summary.first().get(
          'change_publication_eligible'
        ),
      export_policy:
        'MAIN_PUBLICATION',
      bands:
        'absolute_change_2024_minus_2019;relative_change_percent;relative_change_valid_mask'
    }),

    ee.Feature(null, {
      product_group:
        'HOTSPOT_PERSISTENCE',
      pollutant:
        'NO2',
      period:
        '2019-2024',
      publication_eligible:
        LONG_TERM_NO2.summary.first().get(
          'hotspot_persistence_publication_eligible'
        ),
      export_policy:
        'MAIN_PUBLICATION',
      bands:
        'hotspot_occurrence_count;hotspot_persistence_fraction'
    }),

    ee.Feature(null, {
      product_group:
        'LONG_TERM_CHANGE',
      pollutant:
        'CO',
      period:
        '2019-2024',
      publication_eligible:
        LONG_TERM_CO.summary.first().get(
          'change_publication_eligible'
        ),
      export_policy:
        'MAIN_PUBLICATION',
      bands:
        'absolute_change_2024_minus_2019;relative_change_percent;relative_change_valid_mask'
    }),

    ee.Feature(null, {
      product_group:
        'HOTSPOT_PERSISTENCE',
      pollutant:
        'CO',
      period:
        '2019-2024',
      publication_eligible:
        LONG_TERM_CO.summary.first().get(
          'hotspot_persistence_publication_eligible'
        ),
      export_policy:
        'MAIN_PUBLICATION',
      bands:
        'hotspot_occurrence_count;hotspot_persistence_fraction'
    }),

    ee.Feature(null, {
      product_group:
        'LONG_TERM_CHANGE',
      pollutant:
        'SO2',
      period:
        '2019-2024',
      publication_eligible:
        0,
      export_policy:
        'DO_NOT_EXPORT_AS_PUBLICATION_GRADE',
      reason:
        '0/6 strict-complete annual periods; pollutant policy disables strict long-term publication change'
    }),

    ee.Feature(null, {
      product_group:
        'HOTSPOT_PERSISTENCE',
      pollutant:
        'SO2',
      period:
        '2019-2024',
      publication_eligible:
        0,
      export_policy:
        'DO_NOT_EXPORT_AS_PUBLICATION_GRADE',
      reason:
        'SO2 hotspot policy is DIAGNOSTIC_ONLY and strict annual completeness is insufficient'
    })
  ]);

var SPATIAL_PRODUCT_MANIFEST =
  ANNUAL_ASSET_MANIFEST
    .merge(
      LONG_TERM_PRODUCT_MANIFEST
    );


/*** 16.1 FINAL MAIN-TEXT EXPORT SELECTION MANIFEST ***/


var FINAL_EXPORT_SELECTION_FEATURES = [];

['NO2', 'CO'].forEach(
  function(pollutantKey) {

    var spatial =
      SPATIAL_CATALOG[pollutantKey];

    PUB_CONFIG.selectedAnnualGeoTiffYears.forEach(
      function(yearValue) {

        var annualImage =
          loadAnnualAsset(
            pollutantKey,
            yearValue
          );

        FINAL_EXPORT_SELECTION_FEATURES.push(
          ee.Feature(null, {
            product_id:
              'ANNUAL_' + pollutantKey + '_' + String(yearValue),
            product_group:
              'ANNUAL_ENDPOINT_SPATIAL',
            pollutant:
              pollutantKey,
            period:
              String(yearValue),
            processing_branch:
              spatial.processingBranch,
            unit:
              'mol/m2',
            analysis_scale_m:
              spatial.analysisScaleM,
            l3_grid_spacing_m:
              spatial.l3GridSpacingM,
            completeness:
              annualImage.get('temporal_completeness_fraction'),
            strict_complete:
              annualImage.get('strict_period_complete'),
            publication_eligible:
              annualImage.get('strict_period_complete'),
            figure_role:
              pollutantKey === 'NO2' ? 'FIG_4' : 'FIG_5',
            export_format:
              'GeoTIFF',
            export_status:
              'READY_FROM_VERIFIED_STAGE2C_ASSET',
            source_asset_id:
              stage2cAnnualAssetId(pollutantKey, yearValue)
          })
        );
      }
    );

    var longTermObject =
      pollutantKey === 'NO2'
        ? LONG_TERM_NO2
        : LONG_TERM_CO;

    FINAL_EXPORT_SELECTION_FEATURES.push(
      ee.Feature(null, {
        product_id:
          'CHANGE_' + pollutantKey + '_2019_2024',
        product_group:
          'LONG_TERM_CHANGE',
        pollutant:
          pollutantKey,
        period:
          '2019-2024',
        processing_branch:
          spatial.processingBranch,
        unit:
          'mol/m2; percent',
        analysis_scale_m:
          spatial.analysisScaleM,
        l3_grid_spacing_m:
          spatial.l3GridSpacingM,
        completeness:
          longTermObject.summary.first().get('strict_complete_year_count'),
        strict_complete:
          longTermObject.summary.first().get('change_publication_eligible'),
        publication_eligible:
          longTermObject.summary.first().get('change_publication_eligible'),
        figure_role:
          pollutantKey === 'NO2' ? 'FIG_4' : 'FIG_5',
        export_format:
          'GeoTIFF',
        export_status:
          'READY_FROM_VERIFIED_ANNUAL_ASSETS'
      })
    );

    FINAL_EXPORT_SELECTION_FEATURES.push(
      ee.Feature(null, {
        product_id:
          'HOTSPOT_PERSISTENCE_' + pollutantKey + '_2019_2024',
        product_group:
          'HOTSPOT_PERSISTENCE',
        pollutant:
          pollutantKey,
        period:
          '2019-2024',
        processing_branch:
          spatial.processingBranch,
        unit:
          'count; fraction',
        analysis_scale_m:
          spatial.analysisScaleM,
        l3_grid_spacing_m:
          spatial.l3GridSpacingM,
        completeness:
          longTermObject.summary.first().get('strict_complete_year_count'),
        strict_complete:
          longTermObject.summary.first().get('hotspot_persistence_publication_eligible'),
        publication_eligible:
          longTermObject.summary.first().get('hotspot_persistence_publication_eligible'),
        figure_role:
          pollutantKey === 'NO2' ? 'FIG_4' : 'FIG_5',
        export_format:
          'GeoTIFF',
        export_status:
          'READY_FROM_VERIFIED_ANNUAL_ASSETS'
      })
    );
  }
);


PUB_CONFIG.selectedSo2SeasonLabels.forEach(
  function(seasonLabel) {

    var selectedRow =
      FIGURE_6_SO2_SELECTED_SEASON_DATA
        .filter(ee.Filter.eq('period_label', seasonLabel))
        .first();

    FINAL_EXPORT_SELECTION_FEATURES.push(
      ee.Feature(null, {
        product_id:
          'SO2_' + seasonLabel + '_' + String(PUB_CONFIG.selectedSo2SeasonYear),
        product_group:
          'SEASONAL_SPATIAL_DEPENDENCY',
        pollutant:
          'SO2',
        period:
          seasonLabel + ' ' + String(PUB_CONFIG.selectedSo2SeasonYear),
        processing_branch:
          SPATIAL_CATALOG.SO2.processingBranch,
        unit:
          'mol/m2',
        analysis_scale_m:
          SPATIAL_CATALOG.SO2.analysisScaleM,
        l3_grid_spacing_m:
          SPATIAL_CATALOG.SO2.l3GridSpacingM,
        completeness:
          ee.Feature(selectedRow).get('temporal_completeness_fraction'),
        strict_complete:
          ee.Number(
            ee.Algorithms.If(
              ee.Number(
                ee.Feature(selectedRow).get('valid_month_count')
              ).eq(3),
              1,
              0
            )
          ),
                publication_eligible:
          1,

        figure_role:
          'FIG_6',

        export_format:
          'GeoTIFF',

        export_status:
          'READY_FROM_MASTER_VERIFIED_SEASONAL_ENGINE',

        source_mode:
          'MASTER_INTERNAL_VERIFIED_STAGE2C_LOGIC',

        hotspot_publication_eligible:
          0,

        hotspot_publication_policy:
          'DIAGNOSTIC_ONLY',

        note:
          'Temporal season is 3/3 complete and the representative seasonal period_mean raster is publication-ready. SO2 hotspot interpretation remains DIAGNOSTIC_ONLY and is not included in the final Fig. 6 GeoTIFF.'
      })
    );
  }
);

var FINAL_EXPORT_SELECTION_MANIFEST =
  ee.FeatureCollection(
    FINAL_EXPORT_SELECTION_FEATURES
  );


/*** 17. STAGE-2D FINAL ACCEPTANCE ***/

var UNIQUE_POLLUTANT_MONTH_STAGE2D =
  TABLE_2_MONTHLY_AOI_STATISTICS
    .distinct([
      'pollutant',
      'month'
    ]);

var DUPLICATE_POLLUTANT_MONTH_COUNT_STAGE2D =
  TABLE_2_MONTHLY_AOI_STATISTICS
    .size()
    .subtract(
      UNIQUE_POLLUTANT_MONTH_STAGE2D.size()
    );

var NO2_STRICT_ANNUAL_COUNT =
  buildAnnualCollection('NO2')
    .filter(
      ee.Filter.eq(
        'strict_period_complete',
        1
      )
    )
    .size();

var SO2_STRICT_ANNUAL_COUNT =
  buildAnnualCollection('SO2')
    .filter(
      ee.Filter.eq(
        'strict_period_complete',
        1
      )
    )
    .size();

var CO_STRICT_ANNUAL_COUNT =
  buildAnnualCollection('CO')
    .filter(
      ee.Filter.eq(
        'strict_period_complete',
        1
      )
    )
    .size();

var STAGE2D_ACCEPTANCE_ERROR_COUNT =
  ee.Number(0)
    .add(
      ee.Number(
        TABLE_1_METHOD_METADATA.size()
      ).neq(3)
    )
    .add(
      ee.Number(
        TABLE_2_MONTHLY_AOI_STATISTICS.size()
      ).neq(
        PUB_CONFIG.expectedTotalMonthlyRows
      )
    )
    .add(
      ee.Number(
        TABLE_3_MONTHLY_QC.size()
      ).neq(
        PUB_CONFIG.expectedTotalMonthlyRows
      )
    )
    .add(
      ee.Number(
        TABLE_4_SEASONAL_ANNUAL_SUMMARY.size()
      ).neq(87)
    )
    .add(
      ee.Number(
        FIGURE_3_TIME_SERIES_DATA.size()
      ).neq(
        PUB_CONFIG.expectedTotalMonthlyRows
      )
    )
    .add(
      ee.Number(
        FIGURE_7_AVAILABILITY_DATA.size()
      ).neq(
        PUB_CONFIG.expectedTotalMonthlyRows
      )
    )
    .add(
      ee.Number(
        FIGURE_6_SO2_SELECTED_SEASON_DATA.size()
      ).neq(2)
    )
    .add(
      ee.Number(
        FINAL_EXPORT_SELECTION_MANIFEST.size()
      ).neq(10)
    )
    .add(
      DUPLICATE_POLLUTANT_MONTH_COUNT_STAGE2D.neq(0)
    )
    .add(
      ee.Number(
        ANNUAL_ASSET_MANIFEST.size()
      ).neq(
        PUB_CONFIG.expectedAnnualAssetCount
      )
    )
    .add(
      ee.Number(
        NO2_STRICT_ANNUAL_COUNT
      ).neq(6)
    )
    .add(
      ee.Number(
        SO2_STRICT_ANNUAL_COUNT
      ).neq(0)
    )
    .add(
      ee.Number(
        CO_STRICT_ANNUAL_COUNT
      ).neq(6)
    )
    .add(
      ee.Number(
        LONG_TERM_NO2.summary.first().get(
          'change_publication_eligible'
        )
      ).neq(1)
    )
    .add(
      ee.Number(
        LONG_TERM_NO2.summary.first().get(
          'hotspot_persistence_publication_eligible'
        )
      ).neq(1)
    )
    .add(
      ee.Number(
        LONG_TERM_SO2.summary.first().get(
          'change_publication_eligible'
        )
      ).neq(0)
    )
    .add(
      ee.Number(
        LONG_TERM_SO2.summary.first().get(
          'hotspot_persistence_publication_eligible'
        )
      ).neq(0)
    )
    .add(
      ee.Number(
        LONG_TERM_CO.summary.first().get(
          'change_publication_eligible'
        )
      ).neq(1)
    )
    .add(
      ee.Number(
        LONG_TERM_CO.summary.first().get(
          'hotspot_persistence_publication_eligible'
        )
      ).neq(1)
    );


print(
  '=================================================='
);

print(
  '=== ARTICLE 4 — STAGE 2D FINAL ACCEPTANCE R01 ==='
);

print(
  'Script version:',
  PUB_CONFIG.scriptVersion
);

print(
  'Input table stage:',
  PUB_CONFIG.inputTableStage
);

print(
  'Input spatial stage:',
  PUB_CONFIG.inputSpatialStage
);

print(
  'Table 1 rows (expected 3):',
  TABLE_1_METHOD_METADATA.size()
);

print(
  'Table 2 rows (expected 216):',
  TABLE_2_MONTHLY_AOI_STATISTICS.size()
);

print(
  'Table 3 rows (expected 216):',
  TABLE_3_MONTHLY_QC.size()
);

print(
  'Table 4 rows (expected 87):',
  TABLE_4_SEASONAL_ANNUAL_SUMMARY.size()
);

print(
  'Duplicate pollutant-month keys (expected 0):',
  DUPLICATE_POLLUTANT_MONTH_COUNT_STAGE2D
);

print(
  'Figure 3 rows (expected 216):',
  FIGURE_3_TIME_SERIES_DATA.size()
);

print(
  'Figure 7 rows (expected 216):',
  FIGURE_7_AVAILABILITY_DATA.size()
);

print(
  'SO2 complete seasonal candidates:',
  SO2_COMPLETE_SEASON_CANDIDATES
);

print(
  'Selected SO2 Fig. 6 seasons (expected 2):',
  FIGURE_6_SO2_SELECTED_SEASON_DATA
);

print(
  'Selected SO2 Fig. 6 season row count (expected 2):',
  FIGURE_6_SO2_SELECTED_SEASON_DATA.size()
);

print(
  'Final main-text export selection manifest:',
  FINAL_EXPORT_SELECTION_MANIFEST
);

print(
  'Final main-text export selection row count (expected 10):',
  FINAL_EXPORT_SELECTION_MANIFEST.size()
);

print(
  'Annual spatial manifest rows (expected 18):',
  ANNUAL_ASSET_MANIFEST.size()
);

print(
  'Strict annual counts NO2 / SO2 / CO (expected 6 / 0 / 6):',
  NO2_STRICT_ANNUAL_COUNT,
  SO2_STRICT_ANNUAL_COUNT,
  CO_STRICT_ANNUAL_COUNT
);

print(
  'Long-term summary — all pollutants:',
  LONG_TERM_SUMMARY_ALL
);

print(
  'Figure manifest:',
  FIGURE_MANIFEST
);

print(
  'Spatial product manifest:',
  SPATIAL_PRODUCT_MANIFEST
);

print(
  'Stage 2D acceptance error count (expected 0):',
  STAGE2D_ACCEPTANCE_ERROR_COUNT
);

print(
  'Stage 2D acceptance status:',
  ee.Algorithms.If(
    STAGE2D_ACCEPTANCE_ERROR_COUNT.eq(0),
    'PASS — publication export architecture is internally consistent.',
    'FAIL — inspect acceptance output before enabling exports.'
  )
);

print(
  'SCIENTIFIC RULE:',
  'Stage 2D reads verified materialized Assets only; NA is preserved; NO2, SO2 and CO remain pollutant-specific; SO2 long-term publication-grade change/persistence is disabled.'
);

print(
  'FINAL EXPORT SELECTION RULE:'
);

print(
  'Main-text annual GeoTIFFs are limited to 2019 and 2024 for NO2/CO; long-term change and hotspot persistence are exported for NO2/CO; SO2 Fig. 6 uses the configured same-year MAM/JJA seasonal rasters only after final-AOI strict-completeness acceptance confirms both seasons.'
);

print(
  'SEASONAL SPATIAL RULE:'
);

print(
  'Configured SO2 MAM/JJA seasonal rasters are generated explicitly inside the Master using the verified Stage-2C seasonal processing logic; they remain publication-eligible only after final-AOI strict-completeness acceptance, and hotspot interpretation remains DIAGNOSTIC_ONLY and is excluded from the final Fig. 6 GeoTIFFs.'
);

print(
  '=== END STAGE 2D FINAL ACCEPTANCE ==='
);

print(
  '=================================================='
);


/*** 18. PUBLICATION TABLE CSV EXPORTS ***/

if (
  PUB_CONFIG.createPublicationTableCsvTasks
) {

  Export.table.toDrive({
    collection:
      TABLE_1_METHOD_METADATA,
    description:
      'ARTICLE4_FINAL_TABLE1_METHOD_METADATA_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_TABLE1_METHOD_METADATA_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      TABLE_2_MONTHLY_AOI_STATISTICS,
    description:
      'ARTICLE4_FINAL_TABLE2_MONTHLY_AOI_STATISTICS_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_TABLE2_MONTHLY_AOI_STATISTICS_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      TABLE_3_MONTHLY_QC,
    description:
      'ARTICLE4_FINAL_TABLE3_MONTHLY_QC_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_TABLE3_MONTHLY_QC_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      TABLE_4_SEASONAL_ANNUAL_SUMMARY,
    description:
      'ARTICLE4_FINAL_TABLE4_SEASONAL_ANNUAL_SUMMARY_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_TABLE4_SEASONAL_ANNUAL_SUMMARY_2019_2024_R01',
    fileFormat:
      'CSV'
  });
}


/*** 19. FIGURE DATA CSV EXPORTS ***/

if (
  PUB_CONFIG.createFigureDataCsvTasks
) {

  Export.table.toDrive({
    collection:
      FIGURE_3_TIME_SERIES_DATA,
    description:
      'ARTICLE4_FIG3_TIME_SERIES_DATA_2019_2024_R01',
    folder:
      PUB_CONFIG.figureDataDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FIG3_TIME_SERIES_DATA_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      FIGURE_7_AVAILABILITY_DATA,
    description:
      'ARTICLE4_FIG7_AVAILABILITY_DATA_2019_2024_R01',
    folder:
      PUB_CONFIG.figureDataDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FIG7_AVAILABILITY_DATA_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      SO2_COMPLETE_SEASON_CANDIDATES,
    description:
      'ARTICLE4_SO2_COMPLETE_SEASON_CANDIDATES_2019_2024_R01',
    folder:
      PUB_CONFIG.figureDataDriveFolder,
    fileNamePrefix:
      'ARTICLE4_SO2_COMPLETE_SEASON_CANDIDATES_2019_2024_R01',
    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      FIGURE_6_SO2_SELECTED_SEASON_DATA,
    description:
      'ARTICLE4_FIG6_SO2_SELECTED_SEASONS_MAM_JJA_2024_R01',
    folder:
      PUB_CONFIG.figureDataDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FIG6_SO2_SELECTED_SEASONS_MAM_JJA_2024_R01',
    fileFormat:
      'CSV'
  });
}

/*** 19.9 EXACT PUBLICATION EXPORT GRID ***/


/*** 20. ANNUAL SPATIAL GEOTIFF EXPORTS ***/

function createAnnualGeoTiffTask(
  pollutantKey,
  yearValue,
  targetFolder,
  fileSuffix
) {

  var spatial =
    SPATIAL_CATALOG[pollutantKey];

  var image =
    loadAnnualAsset(
      pollutantKey,
      yearValue
    );
  var exactGrid =
    getExactExportGrid(image);
  var exportName =
    'ARTICLE4_FINAL_ANNUAL_' +
    pollutantKey +
    '_' +
    PUB_CONFIG.aoiId +
    '_' +
    String(yearValue) +
    '_' +
    fileSuffix;

  Export.image.toDrive({
    image:
      image,
    description:
      exportName,
    folder:
      targetFolder,
    fileNamePrefix:
      exportName,
    region:
      AOI_GEOM,
    crs:
      exactGrid.crs,

    crsTransform:
      exactGrid.crsTransform,
    maxPixels:
      PUB_CONFIG.maxPixels,
    fileFormat:
      'GeoTIFF',
    formatOptions: {
      cloudOptimized:
        true
    }
  });
}


if (
  PUB_CONFIG.createAnnualGeoTiffTasks
) {

  ['NO2', 'CO'].forEach(
    function(pollutantKey) {

      PUB_CONFIG.selectedAnnualGeoTiffYears.forEach(
        function(yearValue) {

          createAnnualGeoTiffTask(
            pollutantKey,
            yearValue,
            PUB_CONFIG.spatialDriveFolder,
            'R01'
          );
        }
      );
    }
  );

  if (
    PUB_CONFIG.includeDiagnosticSo2AnnualGeoTiffs
  ) {

    for (
      var so2Year = PUB_CONFIG.startYear;
      so2Year <= PUB_CONFIG.endYear;
      so2Year++
    ) {

      createAnnualGeoTiffTask(
        'SO2',
        so2Year,
        PUB_CONFIG.supplementDriveFolder,
        'DIAGNOSTIC_R01'
      );
    }
  }
}


/*** 21. LONG-TERM SPATIAL GEOTIFF EXPORTS ***/

function createLongTermGeoTiffTasksForPollutant(
  pollutantKey,
  productObject
) {

  var spatial =
    SPATIAL_CATALOG[pollutantKey];
  var annualReferenceImage =
    loadAnnualAsset(
      pollutantKey,
      PUB_CONFIG.startYear
    );

  var exactGrid =
    getExactExportGrid(
      annualReferenceImage
    );
  var changeName =
    'ARTICLE4_FINAL_CHANGE_' +
    pollutantKey +
    '_' +
    PUB_CONFIG.aoiId +
    '_2019_2024_R01';

  Export.image.toDrive({
    image:
      productObject.changeImage,
    description:
      changeName,
    folder:
      PUB_CONFIG.spatialDriveFolder,
    fileNamePrefix:
      changeName,
    region:
      AOI_GEOM,
     crs:
      exactGrid.crs,

    crsTransform:
      exactGrid.crsTransform,
    maxPixels:
      PUB_CONFIG.maxPixels,
    fileFormat:
      'GeoTIFF',
    formatOptions: {
      cloudOptimized:
        true
    }
  });

  var persistenceName =
    'ARTICLE4_FINAL_HOTSPOT_PERSISTENCE_' +
    pollutantKey +
    '_' +
    PUB_CONFIG.aoiId +
    '_2019_2024_R01';

  Export.image.toDrive({
    image:
      productObject.hotspotPersistence,
    description:
      persistenceName,
    folder:
      PUB_CONFIG.spatialDriveFolder,
    fileNamePrefix:
      persistenceName,
    region:
      AOI_GEOM,
    scale:
      spatial.l3GridSpacingM,
    crs:
      PUB_CONFIG.reductionCrs,
    maxPixels:
      PUB_CONFIG.maxPixels,
    fileFormat:
      'GeoTIFF',
    formatOptions: {
      cloudOptimized:
        true
    }
  });
}


if (
  PUB_CONFIG.createLongTermGeoTiffTasks
) {


  createLongTermGeoTiffTasksForPollutant(
    'NO2',
    LONG_TERM_NO2
  );

  createLongTermGeoTiffTasksForPollutant(
    'CO',
    LONG_TERM_CO
  );
}


/*** 22. MANIFEST / LONG-TERM SUMMARY CSV EXPORTS ***/

if (
  PUB_CONFIG.createManifestCsvTasks
) {

  Export.table.toDrive({
    collection:
      ACCEPTANCE_MANIFEST,
    description:
      'ARTICLE4_FINAL_ACCEPTANCE_MANIFEST_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_ACCEPTANCE_MANIFEST_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      ANNUAL_ASSET_MANIFEST,
    description:
      'ARTICLE4_FINAL_ANNUAL_SPATIAL_ASSET_MANIFEST_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_ANNUAL_SPATIAL_ASSET_MANIFEST_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      LONG_TERM_SUMMARY_ALL,
    description:
      'ARTICLE4_FINAL_LONG_TERM_SUMMARY_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_LONG_TERM_SUMMARY_2019_2024_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      FIGURE_MANIFEST,
    description:
      'ARTICLE4_FINAL_FIGURE_MANIFEST_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_FIGURE_MANIFEST_R01',
    fileFormat:
      'CSV'
  });

  Export.table.toDrive({
    collection:
      SPATIAL_PRODUCT_MANIFEST,
    description:
      'ARTICLE4_FINAL_SPATIAL_PRODUCT_MANIFEST_2019_2024_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_SPATIAL_PRODUCT_MANIFEST_2019_2024_R01',
    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      FINAL_EXPORT_SELECTION_MANIFEST,
    description:
      'ARTICLE4_FINAL_MAIN_TEXT_EXPORT_SELECTION_MANIFEST_R01',
    folder:
      PUB_CONFIG.tableDriveFolder,
    fileNamePrefix:
      'ARTICLE4_FINAL_MAIN_TEXT_EXPORT_SELECTION_MANIFEST_R01',
    fileFormat:
      'CSV'
  });
}


/*** 23. EXPORT STATUS ***/

print(
  'Publication table CSV tasks:',
  PUB_CONFIG.createPublicationTableCsvTasks
    ? 'CREATED'
    : 'DISABLED — acceptance-safe default.'
);

print(
  'Figure-data CSV tasks:',
  PUB_CONFIG.createFigureDataCsvTasks
    ? 'CREATED'
    : 'DISABLED — acceptance-safe default.'
);

print(
  'Annual GeoTIFF tasks:',
  PUB_CONFIG.createAnnualGeoTiffTasks
    ? 'CREATED — NO2 + CO; SO2 only if diagnostic switch is enabled.'
    : 'DISABLED — acceptance-safe default.'
);

print(
  'Long-term GeoTIFF tasks:',
  PUB_CONFIG.createLongTermGeoTiffTasks
    ? 'CREATED — NO2 + CO only.'
    : 'DISABLED — acceptance-safe default.'
);

print(
  'Manifest CSV tasks:',
  PUB_CONFIG.createManifestCsvTasks
    ? 'CREATED'
    : 'DISABLED — acceptance-safe default.'
);


  return {
    masterMonthly: MASTER_MONTHLY,
    table1: TABLE_1_METHOD_METADATA,
    table2: TABLE_2_MONTHLY_AOI_STATISTICS,
    table3: TABLE_3_MONTHLY_QC,
    table4: TABLE_4_SEASONAL_ANNUAL_SUMMARY,
    figure3: FIGURE_3_TIME_SERIES_DATA,
    figure7: FIGURE_7_AVAILABILITY_DATA,
    figureManifest: FIGURE_MANIFEST,
    spatialManifest: SPATIAL_PRODUCT_MANIFEST,
    finalExportSelectionManifest: FINAL_EXPORT_SELECTION_MANIFEST,
    longTermSummary: LONG_TERM_SUMMARY_ALL,
    stage2dAcceptanceErrorCount: STAGE2D_ACCEPTANCE_ERROR_COUNT
  };
}


/*** MASTER MODULE E — SELECTED SO2 MAM/JJA FIG. 6 EXPORT ***/


function runMasterSelectedSo2SeasonExports(enableExports) {

  var seasonYear = CONFIG.selectedSo2SeasonYear;

  var mam = createSeasonProduct('SO2', 'MAM', seasonYear);
  var jja = createSeasonProduct('SO2', 'JJA', seasonYear);

  var mamImage = mam.image
    .select([
      'period_mean',
      'valid_month_count',
      'valid_month_fraction'
    ])
    .set({
      publication_product: 'SO2_REPRESENTATIVE_SEASONAL_SPATIAL',
      figure_role: 'FIG_6',
      season: 'MAM',
      year: seasonYear,
      pollutant: 'SO2',
      processing_branch: POLLUTANT_CATALOG.SO2.processingBranch,
      aggregation_method: POLLUTANT_CATALOG.SO2.aggregationLabel,
      source_selection_mode: POLLUTANT_CATALOG.SO2.sourceSelectionMode,
      unit: POLLUTANT_CATALOG.SO2.unit,
      analysis_scale_m: POLLUTANT_CATALOG.SO2.analysisScaleM,
      l3_grid_spacing_m: POLLUTANT_CATALOG.SO2.l3GridSpacingM,
      strict_period_complete: mam.image.get('strict_period_complete'),
      valid_month_count_aoi: mam.image.get('valid_month_count_aoi'),
      hotspot_publication_policy: 'DIAGNOSTIC_ONLY',
      hotspot_band_in_final_export: false,
      master_release_version: CONFIG.scriptVersion
    });

  var jjaImage = jja.image
    .select([
      'period_mean',
      'valid_month_count',
      'valid_month_fraction'
    ])
    .set({
      publication_product: 'SO2_REPRESENTATIVE_SEASONAL_SPATIAL',
      figure_role: 'FIG_6',
      season: 'JJA',
      year: seasonYear,
      pollutant: 'SO2',
      processing_branch: POLLUTANT_CATALOG.SO2.processingBranch,
      aggregation_method: POLLUTANT_CATALOG.SO2.aggregationLabel,
      source_selection_mode: POLLUTANT_CATALOG.SO2.sourceSelectionMode,
      unit: POLLUTANT_CATALOG.SO2.unit,
      analysis_scale_m: POLLUTANT_CATALOG.SO2.analysisScaleM,
      l3_grid_spacing_m: POLLUTANT_CATALOG.SO2.l3GridSpacingM,
      strict_period_complete: jja.image.get('strict_period_complete'),
      valid_month_count_aoi: jja.image.get('valid_month_count_aoi'),
      hotspot_publication_policy: 'DIAGNOSTIC_ONLY',
      hotspot_band_in_final_export: false,
      master_release_version: CONFIG.scriptVersion
    });


var SO2_EXPORT_GRID_CONTEXT =
  createSourceContext(
    'SO2',
    String(seasonYear) + '-01-01',
    String(seasonYear + 1) + '-01-01'
  );


var SO2_EXPORT_GRID_REFERENCE_IMAGE =
  ee.Image(
    SO2_EXPORT_GRID_CONTEXT
      .sourceAll
      .first()
  )
  .select(
    POLLUTANT_CATALOG.SO2.sourceBand
  );


var SO2_EXPORT_REFERENCE_PROJECTION =
  SO2_EXPORT_GRID_REFERENCE_IMAGE
    .projection();


var so2ExactGrid =
  getExactExportGrid(
    SO2_EXPORT_GRID_REFERENCE_IMAGE
  );


mamImage =
  mamImage
    .setDefaultProjection(
      SO2_EXPORT_REFERENCE_PROJECTION
    )
    .set({

      export_grid_crs:
        so2ExactGrid.crs,

      export_grid_transform:
        JSON.stringify(
          so2ExactGrid.crsTransform
        ),

      export_grid_source:
        'S5P_OFFL_L3_SO2_SOURCE_IMAGE',

      export_grid_reference_period:
        String(seasonYear),

      export_grid_reference_band:
        POLLUTANT_CATALOG.SO2.sourceBand,

      export_grid_nominal_spacing_metadata_m:
        POLLUTANT_CATALOG.SO2.l3GridSpacingM
    });


jjaImage =
  jjaImage
    .setDefaultProjection(
      SO2_EXPORT_REFERENCE_PROJECTION
    )
    .set({

      export_grid_crs:
        so2ExactGrid.crs,

      export_grid_transform:
        JSON.stringify(
          so2ExactGrid.crsTransform
        ),

      export_grid_source:
        'S5P_OFFL_L3_SO2_SOURCE_IMAGE',

      export_grid_reference_period:
        String(seasonYear),

      export_grid_reference_band:
        POLLUTANT_CATALOG.SO2.sourceBand,

      export_grid_nominal_spacing_metadata_m:
        POLLUTANT_CATALOG.SO2.l3GridSpacingM
    });


print(
  'SO2 FINAL EXPORT source projection:',
  SO2_EXPORT_REFERENCE_PROJECTION
);

print(
  'SO2 FINAL EXPORT source nominal scale, m:',
  SO2_EXPORT_REFERENCE_PROJECTION
    .nominalScale()
);

print(
  'SO2 FINAL EXPORT CRS:',
  so2ExactGrid.crs
);

print(
  'SO2 FINAL EXPORT CRS transform:',
  so2ExactGrid.crsTransform
);

print(
  'MAM final default projection:',
  mamImage
    .select('period_mean')
    .projection()
);

print(
  'JJA final default projection:',
  jjaImage
    .select('period_mean')
    .projection()
);
  print('==================================================');
  print('=== MASTER RELEASE — SO2 FIG. 6 SEASONAL ACCEPTANCE ===');
  print('MAM valid AOI months (expected 3):',
    mam.image.get('valid_month_count_aoi'));
  print('MAM strict complete (expected 1):',
    mam.image.get('strict_period_complete'));
  print('JJA valid AOI months (expected 3):',
    jja.image.get('valid_month_count_aoi'));
  print('JJA strict complete (expected 1):',
    jja.image.get('strict_period_complete'));
  print('SO2 hotspot policy:', POLLUTANT_CATALOG.SO2.hotspotPublicationPolicy);
  print('Export bands:', mamImage.bandNames());

  if (enableExports && CONFIG.includeSelectedSo2SeasonGeoTiffs) {

    var so2MamExportName =
      'ARTICLE4_FINAL_SO2_MAM_' +
      CONFIG.aoiId +
      '_' +
      String(seasonYear) +
      '_R01';

    var so2JjaExportName =
      'ARTICLE4_FINAL_SO2_JJA_' +
      CONFIG.aoiId +
      '_' +
      String(seasonYear) +
      '_R01';

    Export.image.toDrive({
      image: mamImage,
      description: so2MamExportName,
      folder: CONFIG.spatialDriveFolder,
      fileNamePrefix: so2MamExportName,
      region: AOI_GEOM,
         crs:
        so2ExactGrid.crs,

      crsTransform:
        so2ExactGrid.crsTransform,
      maxPixels: CONFIG.maxPixels,
      fileFormat: 'GeoTIFF',
      formatOptions: {cloudOptimized: true}
    });

    Export.image.toDrive({
      image: jjaImage,
      description: so2JjaExportName,
      folder: CONFIG.spatialDriveFolder,
      fileNamePrefix: so2JjaExportName,
      region: AOI_GEOM,
       crs:
        so2ExactGrid.crs,

      crsTransform:
        so2ExactGrid.crsTransform,
      maxPixels: CONFIG.maxPixels,
      fileFormat: 'GeoTIFF',
      formatOptions: {cloudOptimized: true}
    });

    print('Selected SO2 GeoTIFF tasks:', 'CREATED — exactly 2.');
  } else {
    print('Selected SO2 GeoTIFF tasks:', 'DISABLED — acceptance mode.');
  }

  print('=== END MASTER SO2 FIG. 6 ACCEPTANCE ===');
  print('==================================================');

  return {
    MAM: mamImage,
    JJA: jjaImage
  };
}

/*** MAP_PREVIEW / PUBLICATION_VISUALIZATION ENGINE ***/


/*** PV.1 PUBLICATION COLOR CATALOG ***/

var PUBLICATION_VIS_CATALOG = {

  NO2: {

    palette: [
      '440154',
      '414487',
      '2a788e',
      '22a884',
      '7ad151',
      'fde725'
    ],

    changePalette: [
      '313695',
      '74add1',
      'd9eff5',
      'f7f7f7',
      'fee090',
      'f46d43',
      'a50026'
    ],

    displayName:
      'NO₂',

    unit:
      'mol m⁻²'
  },


  SO2: {

    palette: [
      '081d58',
      '253494',
      '225ea8',
      '1d91c0',
      '41b6c4',
      '7fcdbb',
      'c7e9b4',
      'ffffcc'
    ],

    changePalette: [
      '313695',
      '74add1',
      'd9eff5',
      'f7f7f7',
      'fee090',
      'f46d43',
      'a50026'
    ],

    displayName:
      'SO₂',

    unit:
      'mol m⁻²'
  },


  CO: {

    palette: [
      '0d0887',
      '5b02a3',
      '9a179b',
      'cb4679',
      'ed7953',
      'fb9f3a',
      'fdca26',
      'f0f921'
    ],

    changePalette: [
      '313695',
      '74add1',
      'd9eff5',
      'f7f7f7',
      'fee090',
      'f46d43',
      'a50026'
    ],

    displayName:
      'CO',

    unit:
      'mol m⁻²'
  }
};


/*** PV.2 SOURCE PROJECTION REFERENCE ***/

function getPublicationReferenceProjection(
  pollutantKey,
  yearValue
) {

  var startDateString =
    String(yearValue) +
    '-01-01';


  var endDateString =
    String(yearValue + 1) +
    '-01-01';


  var context =
    createSourceContext(
      pollutantKey,
      startDateString,
      endDateString
    );


  var referenceImage =
    ee.Image(
      context.sourceAll.first()
    )
    .select(
      POLLUTANT_CATALOG[
        pollutantKey
      ].sourceBand
    );


  return referenceImage.projection();
}


/*** PV.3 ANNUAL VERIFIED ASSET ***/

function getPublicationAnnualImage(
  pollutantKey,
  yearValue
) {

  return ee.Image(
    annualAssetId(
      pollutantKey,
      yearValue
    )
  )
  .select(
    'period_mean'
  )
  .rename(
    'display_value'
  )
  .toFloat()
  .clip(
    AOI_GEOM
  );
}


/*** PV.4 VERIFIED SEASONAL PRODUCT ***/

function getPublicationSeasonImage(
  pollutantKey,
  yearValue,
  seasonLabel
) {

  var result =
    createPeriodProduct(

      seasonMonthStarts(
        seasonLabel,
        yearValue
      ),

      pollutantKey,

      'SEASON',

      seasonLabel,

      yearValue
    );


  return ee.Image(
    result.image
  )
  .select(
    'period_mean'
  )
  .rename(
    'display_value'
  )
  .toFloat()
  .clip(
    AOI_GEOM
  );
}


/*** PV.5 VERIFIED ENDPOINT CHANGE ***/

function getPublicationChangeImage(
  pollutantKey
) {

  if (
    pollutantKey === 'SO2'
  ) {

    throw new Error(
      'SO2 CHANGE preview is blocked: long-term publication-grade change is not eligible.'
    );
  }


  var startImage =
    getPublicationAnnualImage(
      pollutantKey,
      CONFIG.startYear
    );


  var endImage =
    getPublicationAnnualImage(
      pollutantKey,
      CONFIG.endYear
    );


  return endImage
    .subtract(
      startImage
    )
    .rename(
      'display_value'
    )
    .toFloat()
    .clip(
      AOI_GEOM
    );
}


/*** PV.6 PREVIEW PRODUCT BUNDLE ***/

function buildPublicationPreviewBundle() {

  var pollutantKey =
    CONFIG.mapPreviewPollutant;


  var yearValue =
    CONFIG.mapPreviewYear;


  var period =
    CONFIG.mapPreviewPeriod;


  var projection =
    getPublicationReferenceProjection(
      pollutantKey,
      yearValue
    );


  var selectedImage;

  var comparisonImages = [];

  var periodLabel;


  if (
    period === 'ANNUAL'
  ) {

    var annual2019 =
      getPublicationAnnualImage(
        pollutantKey,
        CONFIG.startYear
      )
      .setDefaultProjection(
        projection
      );


    var annual2024 =
      getPublicationAnnualImage(
        pollutantKey,
        CONFIG.endYear
      )
      .setDefaultProjection(
        projection
      );


    selectedImage =
      getPublicationAnnualImage(
        pollutantKey,
        yearValue
      )
      .setDefaultProjection(
        projection
      );


    comparisonImages = [
      annual2019,
      annual2024
    ];


    periodLabel =
      String(yearValue);
  }


  else if (
    period === 'MAM' ||
    period === 'JJA'
  ) {

    var mamImage =
      getPublicationSeasonImage(
        pollutantKey,
        yearValue,
        'MAM'
      )
      .setDefaultProjection(
        projection
      );


    var jjaImage =
      getPublicationSeasonImage(
        pollutantKey,
        yearValue,
        'JJA'
      )
      .setDefaultProjection(
        projection
      );


    selectedImage =
      period === 'MAM'
        ? mamImage
        : jjaImage;


    comparisonImages = [
      mamImage,
      jjaImage
    ];


    periodLabel =
      period +
      ' ' +
      String(yearValue);
  }


  else {

    selectedImage =
      getPublicationChangeImage(
        pollutantKey
      )
      .setDefaultProjection(
        projection
      );


    comparisonImages = [
      selectedImage
    ];


    periodLabel =
      String(CONFIG.startYear) +
      '–' +
      String(CONFIG.endYear) +
      ' change';
  }


  return {

    pollutant:
      pollutantKey,

    year:
      yearValue,

    period:
      period,

    periodLabel:
      periodLabel,

    image:
      selectedImage,

    comparisonImages:
      comparisonImages,

    referenceProjection:
      projection
  };
}


/*** PV.7 ROBUST SHARED PUBLICATION RANGE ***/

function getOneImageRobustRangeClient(
  imageObject,
  pollutantKey
) {

  var lowP =
    CONFIG.publicationRangeLowPercentile;


  var highP =
    CONFIG.publicationRangeHighPercentile;


  var result =
    ee.Image(
      imageObject
    )
    .select(
      'display_value'
    )
    .reduceRegion({

      reducer:
        ee.Reducer.percentile([
          lowP,
          highP
        ]),

      geometry:
        AOI_GEOM,

      scale:
        POLLUTANT_CATALOG[
          pollutantKey
        ].l3GridSpacingM,

      crs:
        CONFIG.reductionCrs,

      maxPixels:
        CONFIG.maxPixels,

      tileScale:
        CONFIG.tileScale
    })
    .getInfo();


  var lowKey =
    'display_value_p' +
    String(lowP);


  var highKey =
    'display_value_p' +
    String(highP);


  return {

    min:
      result[lowKey],

    max:
      result[highKey]
  };
}


function getPublicationSharedRangeClient(
  bundle
) {


  if (
    CONFIG.publicationUseManualRange
  ) {

    return {

      min:
        CONFIG.publicationManualMin,

      max:
        CONFIG.publicationManualMax,

      source:
        'MANUAL_FROZEN_RANGE'
    };
  }


  var globalMin =
    Infinity;


  var globalMax =
    -Infinity;


  bundle.comparisonImages.forEach(
    function(imageObject) {

      var oneRange =
        getOneImageRobustRangeClient(
          imageObject,
          bundle.pollutant
        );


      if (
        oneRange.min !== null &&
        isFinite(oneRange.min)
      ) {

        globalMin =
          Math.min(
            globalMin,
            oneRange.min
          );
      }


      if (
        oneRange.max !== null &&
        isFinite(oneRange.max)
      ) {

        globalMax =
          Math.max(
            globalMax,
            oneRange.max
          );
      }
    }
  );


  if (
    !isFinite(globalMin) ||
    !isFinite(globalMax)
  ) {

    throw new Error(
      'Publication visualization range could not be calculated.'
    );
  }


  if (
    bundle.period === 'CHANGE'
  ) {

    var absoluteLimit =
      Math.max(
        Math.abs(globalMin),
        Math.abs(globalMax)
      );


    if (
      absoluteLimit === 0
    ) {
      absoluteLimit =
        1e-12;
    }


    globalMin =
      -absoluteLimit;


    globalMax =
      absoluteLimit;
  }


  if (
    globalMin === globalMax
  ) {

    var epsilon =
      Math.abs(globalMin) > 0
        ? Math.abs(globalMin) * 0.01
        : 1e-12;


    globalMin -=
      epsilon;


    globalMax +=
      epsilon;
  }


  return {

    min:
      globalMin,

    max:
      globalMax,

    source:
      'SHARED_ROBUST_P' +
      String(
        CONFIG.publicationRangeLowPercentile
      ) +
      '_P' +
      String(
        CONFIG.publicationRangeHighPercentile
      )
  };
}


/*** PV.8 DISPLAY IMAGE ***/

function buildPublicationDisplayField(bundle) {

  var scientificImage =
    ee.Image(bundle.image)
      .setDefaultProjection(
        bundle.referenceProjection
      );


  if (
    CONFIG.mapDisplayMode ===
      'BILINEAR_DISPLAY'
  ) {

    return scientificImage
      .resample('bilinear');
  }


  return scientificImage;
}


/*** PV.9 PUBLICATION LEGEND ***/

function addPublicationLegend(
  titleText,
  rangeObject,
  palette,
  unitText
) {

  var legend =
    ui.Panel({

      style: {
        position:
          'bottom-left',

        padding:
          '8px 12px',

        backgroundColor:
          'rgba(255,255,255,0.92)'
      }
    });


  legend.add(
    ui.Label({

      value:
        titleText,

      style: {
        fontWeight:
          'bold',

        fontSize:
          '13px',

        margin:
          '0 0 6px 0'
      }
    })
  );


  var gradient =
    ee.Image.pixelLonLat()
      .select(
        'longitude'
      );


  var legendImage =
    gradient
      .multiply(
        (
          rangeObject.max -
          rangeObject.min
        ) /
        100
      )
      .add(
        rangeObject.min
      );


  var thumbnail =
    ui.Thumbnail({

      image:
        legendImage.visualize({

          min:
            rangeObject.min,

          max:
            rangeObject.max,

          palette:
            palette
        }),

      params: {
        bbox:
          [0, 0, 100, 10],

        dimensions:
          '260x24',

        format:
          'png'
      },

      style: {
        stretch:
          'horizontal',

        margin:
          '0px 0px 4px 0px',

        maxHeight:
          '24px'
      }
    });


  legend.add(
    thumbnail
  );


  var labels =
    ui.Panel({

      widgets: [

        ui.Label(
          rangeObject.min.toExponential(3),
          {
            margin:
              '0 8px 0 0'
          }
        ),

        ui.Label(
          unitText,
          {
            stretch:
              'horizontal',

            textAlign:
              'center',

            margin:
              '0'
          }
        ),

        ui.Label(
          rangeObject.max.toExponential(3),
          {
            margin:
              '0 0 0 8px'
          }
        )

      ],

      layout:
        ui.Panel.Layout.flow(
          'horizontal'
        )
    });


  legend.add(
    labels
  );


  Map.add(
    legend
  );
}


/*** PV.10 PUBLICATION TITLE / DISCLOSURE ***/

function addPublicationMapHeader(
  bundle
) {

  var vis =
    PUBLICATION_VIS_CATALOG[
      bundle.pollutant
    ];


  var title =
    ui.Label({

      value:
        vis.displayName +
        ' — ' +
        bundle.periodLabel,

      style: {
        fontWeight:
          'bold',

        fontSize:
          '18px',

        color:
          '#202020',

        backgroundColor:
          'rgba(255,255,255,0.92)',

        padding:
          '8px 12px',

        margin:
          '10px'
      }
    });

var disclosure =
  ui.Label({

    value:
      CONFIG.mapDisplayMode === 'BILINEAR_DISPLAY'
        ? 'Bilinear rendering: QC / DISPLAY ONLY — not used for final publication RGB'
        : CONFIG.mapDisplayMode === 'PUBLICATION_RGB'
          ? 'Publication RGB: scientific grid + color rendering only — no spatial interpolation'
          : 'Scientific analytical grid — no display interpolation',

    style: {
      fontSize:
        '11px',

      color:
        '#555555',

      backgroundColor:
        'rgba(255,255,255,0.88)',

      padding:
        '5px 10px',

      margin:
        '0 10px 10px 10px'
    }
  });


  var panel =
    ui.Panel({

      widgets: [
        title,
        disclosure
      ],

      style: {
        position:
          'top-left'
      }
    });


  Map.add(
    panel
  );
}


/*** PV.11 OPTIONAL PUBLICATION RGB EXPORT ***/

function createPublicationRgbPreviewTask(
  bundle,
  displayField,
  rangeObject,
  palette
) {


  var rgb =
    ee.Image(
      displayField
    )
    .visualize({

      min:
        rangeObject.min,

      max:
        rangeObject.max,

      palette:
        palette,

      forceRgbOutput:
        true
    });


  var outlineBase =
    ee.Image.constant(0)
      .byte()
      .reproject({

        crs:
          CONFIG.publicationRgbCrs,

        scale:
          CONFIG.publicationRgbRenderScaleM
      });


  var outline =
    outlineBase
      .paint({

        featureCollection:
          AOI_SOURCE_FC,

        color:
          1,

        width:
          2
      })
      .selfMask()
      .visualize({

        palette: [
          '202020'
        ],

        forceRgbOutput:
          true
      });


  var finalRgb =
    rgb
      .blend(
        outline
      );


  var RGB_NODATA_VALUE =
    0;


  var finalRgbForExport =
    finalRgb
      .unmask({
        value:
          RGB_NODATA_VALUE,

        sameFootprint:
          false
      })
      .byte();


var exportName =
  'ARTICLE4_PUBLICATION_RGB_' +
  bundle.pollutant +
  '_' +
  bundle.period +
  '_' +
  (
    bundle.period === 'CHANGE'
      ? '2019_2024'
      : String(bundle.year)
  ) +
  '_R01';


  Export.image.toDrive({

    image:
      finalRgbForExport,

    description:
      exportName,

    folder:
      CONFIG.publicationRgbDriveFolder,

    fileNamePrefix:
      exportName,

    region:
      AOI_GEOM.bounds(1),


    crs:
      CONFIG.publicationRgbCrs,


    scale:
      CONFIG.publicationRgbRenderScaleM,

    maxPixels:
      CONFIG.maxPixels,

    fileFormat:
      'GeoTIFF',

    formatOptions: {

      cloudOptimized:
        true,


      noData:
        RGB_NODATA_VALUE
    }
  });


  print(
    'PUBLICATION_RGB_PREVIEW task:',
    'CREATED'
  );


  print(
    'RGB display scale, m:',
    CONFIG.publicationRgbRenderScaleM
  );


  print(
    'RGB GeoTIFF NoData value:',
    RGB_NODATA_VALUE
  );


  print(
    'RGB background policy:',
    'MASKED PIXELS -> NODATA = 0'
  );


  print(
    'IMPORTANT:',
    'RGB render scale is cartographic display density only, NOT Sentinel-5P spatial resolution.'
  );


  print(
    'SCIENTIFIC INTEGRITY:',
    'No spatial interpolation is introduced by the RGB export function.'
  );
}

/*** PV.11B FINAL PUBLICATION RGB BATCH EXPORT ***/


function runPublicationRgbBatchExport() {

  print('==================================================');
  print('=== PUBLICATION RGB BATCH EXPORT ===');


  var originalPollutant =
    CONFIG.mapPreviewPollutant;

  var originalYear =
    CONFIG.mapPreviewYear;

  var originalPeriod =
    CONFIG.mapPreviewPeriod;

  var originalDisplayMode =
    CONFIG.mapDisplayMode;


  CONFIG.mapDisplayMode =
    'PUBLICATION_RGB';


  function createOneRgbExport(
    pollutantKey,
    yearValue,
    periodValue
  ) {

    CONFIG.mapPreviewPollutant =
      pollutantKey;

    CONFIG.mapPreviewYear =
      yearValue;

    CONFIG.mapPreviewPeriod =
      periodValue;


    var bundle =
      buildPublicationPreviewBundle();


    var vis =
      PUBLICATION_VIS_CATALOG[
        bundle.pollutant
      ];


    var range =
      getPublicationSharedRangeClient(
        bundle
      );


    var palette =
      bundle.period === 'CHANGE'
        ? vis.changePalette
        : vis.palette;


    var scientificField =
      ee.Image(
        bundle.image
      )
      .setDefaultProjection(
        bundle.referenceProjection
      );


    createPublicationRgbPreviewTask(
      bundle,
      scientificField,
      range,
      palette
    );


    print(
      'RGB task created:',
      pollutantKey +
      ' | ' +
      periodValue +
      ' | ' +
      (
        periodValue === 'CHANGE'
          ? '2019-2024'
          : String(yearValue)
      )
    );

    print(
      'RGB range:',
      range.min,
      range.max
    );

    return {
      pollutant:
        pollutantKey,

      year:
        yearValue,

      period:
        periodValue,

      rangeMin:
        range.min,

      rangeMax:
        range.max,

      rangeSource:
        range.source
    };
  }


  var RGB_SO2_MAM_2024 =
    createOneRgbExport(
      'SO2',
      2024,
      'MAM'
    );


  var RGB_SO2_JJA_2024 =
    createOneRgbExport(
      'SO2',
      2024,
      'JJA'
    );


  var RGB_NO2_2019 =
    createOneRgbExport(
      'NO2',
      2019,
      'ANNUAL'
    );


  var RGB_NO2_2024 =
    createOneRgbExport(
      'NO2',
      2024,
      'ANNUAL'
    );


  var RGB_CO_2019 =
    createOneRgbExport(
      'CO',
      2019,
      'ANNUAL'
    );


  var RGB_CO_2024 =
    createOneRgbExport(
      'CO',
      2024,
      'ANNUAL'
    );


  var RGB_NO2_CHANGE =
    createOneRgbExport(
      'NO2',
      2024,
      'CHANGE'
    );


  var RGB_CO_CHANGE =
    createOneRgbExport(
      'CO',
      2024,
      'CHANGE'
    );


  CONFIG.mapPreviewPollutant =
    originalPollutant;

  CONFIG.mapPreviewYear =
    originalYear;

  CONFIG.mapPreviewPeriod =
    originalPeriod;

  CONFIG.mapDisplayMode =
    originalDisplayMode;


  print('----------------------------------------------');
  print('Expected RGB export task count:', 8);

  print(
    'SO2 MAM/JJA shared range check:',
    RGB_SO2_MAM_2024.rangeMin,
    RGB_SO2_MAM_2024.rangeMax,
    RGB_SO2_JJA_2024.rangeMin,
    RGB_SO2_JJA_2024.rangeMax
  );

  print(
    'NO2 annual 2019/2024 shared range check:',
    RGB_NO2_2019.rangeMin,
    RGB_NO2_2019.rangeMax,
    RGB_NO2_2024.rangeMin,
    RGB_NO2_2024.rangeMax
  );

  print(
    'CO annual 2019/2024 shared range check:',
    RGB_CO_2019.rangeMin,
    RGB_CO_2019.rangeMax,
    RGB_CO_2024.rangeMin,
    RGB_CO_2024.rangeMax
  );

  print(
    'IMPORTANT:',
    'Final RGB batch uses scientific rasters + visualize(); no bilinear/bicubic spatial interpolation.'
  );

  print(
    '=== END PUBLICATION RGB BATCH EXPORT ==='
  );

  print('==================================================');


  return {

    SO2_MAM_2024:
      RGB_SO2_MAM_2024,

    SO2_JJA_2024:
      RGB_SO2_JJA_2024,

    NO2_2019:
      RGB_NO2_2019,

    NO2_2024:
      RGB_NO2_2024,

    CO_2019:
      RGB_CO_2019,

    CO_2024:
      RGB_CO_2024,

    NO2_CHANGE:
      RGB_NO2_CHANGE,

    CO_CHANGE:
      RGB_CO_CHANGE
  };
}
/*** PV.11C FINAL RELEASE RGB EXPORT WRAPPER ***/


function runMasterFinalPublicationRgbExports() {

  print('==================================================');
  print('=== MASTER FINAL PUBLICATION RGB EXPORT ===');

  if (
    !CONFIG.includePublicationRgbBatchInFinalExport
  ) {

    print(
      'Publication RGB batch:',
      'DISABLED BY FINAL EXPORT CONFIG'
    );

    print(
      '=== END MASTER FINAL PUBLICATION RGB EXPORT ==='
    );

    print('==================================================');

    return {
      enabled:
        false,

      expectedTaskCount:
        0,

      package:
        null
    };
  }


  var rgbPackage =
    runPublicationRgbBatchExport();


  print(
    'Publication RGB batch:',
    'CREATED — expected exactly 8 tasks.'
  );

  print(
    'RGB scientific-integrity rule:',
    'NO spatial interpolation; visualize() only.'
  );

  print(
    'RGB output role:',
    'CARTOGRAPHIC DISPLAY PRODUCT — NOT SCIENTIFIC RASTER.'
  );

  print(
    '=== END MASTER FINAL PUBLICATION RGB EXPORT ==='
  );

  print('==================================================');


  return {
    enabled:
      true,

    expectedTaskCount:
      8,

    package:
      rgbPackage
  };
}
/*** PV.12 MAIN MAP PREVIEW RUNNER ***/

function runPublicationVisualization() {

  var bundle =
    buildPublicationPreviewBundle();


  var vis =
    PUBLICATION_VIS_CATALOG[
      bundle.pollutant
    ];


  var range =
    getPublicationSharedRangeClient(
      bundle
    );


  var palette =
    bundle.period === 'CHANGE'
      ? vis.changePalette
      : vis.palette;


  var scientificField =
    ee.Image(
      bundle.image
    )
    .setDefaultProjection(
      bundle.referenceProjection
    );


  var displayField =
    buildPublicationDisplayField(
      bundle
    );


  Map.layers().reset();


  Map.setOptions(
     'TERRAIN'
  );


  Map.centerObject(
    AOI_SOURCE_FC,
    11
  );


  Map.addLayer(

    scientificField,

    {
      min:
        range.min,

      max:
        range.max,

      palette:
        palette
    },

    bundle.pollutant +
      ' ' +
      bundle.periodLabel +
      ' — SCIENTIFIC GRID',

    CONFIG.mapDisplayMode ===
      'SCIENTIFIC_GRID',

    CONFIG.publicationPreviewOpacity
  );


if (
  CONFIG.mapDisplayMode ===
    'BILINEAR_DISPLAY'
) {

  Map.addLayer(

    displayField,

    {
      min:
        range.min,

      max:
        range.max,

      palette:
        palette
    },

  bundle.pollutant +
    ' ' +
    bundle.periodLabel +
    ' — BILINEAR DISPLAY',

    true,

    CONFIG.publicationPreviewOpacity
  );
}


if (
  CONFIG.mapDisplayMode ===
    'PUBLICATION_RGB'
) {

  var publicationRgbDisplay =
    scientificField.visualize({
      min:
        range.min,
      max:
        range.max,
      palette:
        palette,
      forceRgbOutput:
        true
    });

  Map.addLayer(
    publicationRgbDisplay,
    {},
    bundle.pollutant +
      ' ' +
      bundle.periodLabel +
      ' — PUBLICATION RGB / NO INTERPOLATION',
    true,
    CONFIG.publicationPreviewOpacity
  );
}


Map.addLayer(

    AOI_SOURCE_FC.style({

      color:
        '202020',

      fillColor:
        '00000000',

      width:
        2
    }),

    {},

    'Study area boundary',

    true
  );


  addPublicationMapHeader(
    bundle
  );


  addPublicationLegend(

    vis.displayName +
      ' ' +
      bundle.periodLabel,

    range,

    palette,

    vis.unit
  );


  print(
    '=================================================='
  );


  print(
    '=== MAP_PREVIEW / PUBLICATION_VISUALIZATION ==='
  );


  print(
    'Pollutant:',
    bundle.pollutant
  );


  print(
    'Period:',
    bundle.periodLabel
  );


  print(
    'Display mode:',
    CONFIG.mapDisplayMode
  );


  print(
    'Visualization range source:',
    range.source
  );


  print(
    'Visualization MIN:',
    range.min
  );


  print(
    'Visualization MAX:',
    range.max
  );


  print(
    'Reference projection:',
    bundle.referenceProjection
  );


  print(
    'Reference nominal scale, m:',
    bundle.referenceProjection
      .nominalScale()
  );


  print(
    'IMPORTANT:',
    CONFIG.mapDisplayMode === 'BILINEAR_DISPLAY'
      ? 'Bilinear interpolation is QC/display-only and is not used for final publication RGB.'
      : 'No spatial interpolation is applied. Scientific raster/statistics/GeoTIFF remain unchanged.'
  );


  if (
    CONFIG.createPublicationRgbPreviewTask
  ) {

    createPublicationRgbPreviewTask(

      bundle,
      scientificField,
      range,
      palette
    );

  } else {

    print(
      'PUBLICATION_RGB_PREVIEW task:',
      'DISABLED'
    );
  }


  print(
    '=== END PUBLICATION VISUALIZATION ==='
  );


  print(
    '=================================================='
  );


  return {

    pollutant:
      bundle.pollutant,

    period:
      bundle.period,

    scientificImage:
      scientificField,

    displayImage:
      displayField,

    visualizationMin:
      range.min,

    visualizationMax:
      range.max,

    rangeSource:
      range.source,

    displayMode:
      CONFIG.mapDisplayMode
  };
}

/*** MASTER EXECUTION ROUTER ***/


var MASTER_OUTPUT = null;

print('==================================================');
print('ARTICLE 4 MASTER MONITORING SYSTEM V1.0 RELEASE');
print('Run mode:', CONFIG.runMode);
print('Master version:', CONFIG.scriptVersion);
print('AOI:', CONFIG.aoiId);
print('Study period:', CONFIG.startYear + '-' + CONFIG.endYear);
print('==================================================');

if (CONFIG.runMode === 'VERIFY_ONE_YEAR') {

  MASTER_OUTPUT = runMasterOneYearMaterialization(
    false,
    CONFIG.activeYear
  );

} else if (CONFIG.runMode === 'MATERIALIZE_YEAR') {

  MASTER_OUTPUT = runMasterOneYearMaterialization(
    CONFIG.createYearlyTableAssetTask,
    CONFIG.activeYear
  );

} else if (CONFIG.runMode === 'MATERIALIZE_ALL_YEARS') {

  MASTER_OUTPUT = runMasterAllYearsMaterialization(
    CONFIG.createYearlyTableAssetTask
  );

} else if (CONFIG.runMode === 'SPATIAL_YEAR') {


  MASTER_OUTPUT = runYearPackage();

} else if (CONFIG.runMode === 'LONG_TERM_FROM_ASSETS') {

  MASTER_OUTPUT =
    runLongTermPackage();

} else if (CONFIG.runMode === 'MAP_PREVIEW') {

  MASTER_OUTPUT =
    runPublicationVisualization();

} else if (
  CONFIG.runMode ===
    'PUBLICATION_RGB_BATCH_EXPORT'
) {

  MASTER_OUTPUT =
    runPublicationRgbBatchExport();

} else if (CONFIG.runMode === 'FINAL_ACCEPTANCE') {

  var PUB_ACCEPTANCE =
    runMasterPublicationPackage(false);

  var SO2_ACCEPTANCE =
    runMasterSelectedSo2SeasonExports(false);


  var MASTER_STAGE2D_ERROR_COUNT =
    ee.Number(
      PUB_ACCEPTANCE.stage2dAcceptanceErrorCount
    );


  var MASTER_SO2_MAM_VALID_MONTHS =
    ee.Number(
      SO2_ACCEPTANCE.MAM.get(
        'valid_month_count_aoi'
      )
    );


  var MASTER_SO2_JJA_VALID_MONTHS =
    ee.Number(
      SO2_ACCEPTANCE.JJA.get(
        'valid_month_count_aoi'
      )
    );


  var MASTER_SO2_MAM_STRICT_COMPLETE =
    ee.Number(
      SO2_ACCEPTANCE.MAM.get(
        'strict_period_complete'
      )
    );


  var MASTER_SO2_JJA_STRICT_COMPLETE =
    ee.Number(
      SO2_ACCEPTANCE.JJA.get(
        'strict_period_complete'
      )
    );


  var MASTER_ACCEPTANCE_ERROR_COUNT =
    MASTER_STAGE2D_ERROR_COUNT

      .add(
        ee.Number(
          ee.Algorithms.If(
            MASTER_SO2_MAM_VALID_MONTHS.eq(3),
            0,
            1
          )
        )
      )

      .add(
        ee.Number(
          ee.Algorithms.If(
            MASTER_SO2_JJA_VALID_MONTHS.eq(3),
            0,
            1
          )
        )
      )

      .add(
        ee.Number(
          ee.Algorithms.If(
            MASTER_SO2_MAM_STRICT_COMPLETE.eq(1),
            0,
            1
          )
        )
      )

      .add(
        ee.Number(
          ee.Algorithms.If(
            MASTER_SO2_JJA_STRICT_COMPLETE.eq(1),
            0,
            1
          )
        )
      );


  var MASTER_ACCEPTANCE_STATUS =
    ee.String(
      ee.Algorithms.If(
        MASTER_ACCEPTANCE_ERROR_COUNT.eq(0),
        'PASS — MASTER RELEASE IS INTERNALLY CONSISTENT',
        'FAIL — REVIEW MASTER ACCEPTANCE CONDITIONS'
      )
    );


  var MASTER_ACCEPTANCE_MANIFEST =
    ee.FeatureCollection([
      ee.Feature(
        null,
        {
          master_version:
            CONFIG.scriptVersion,

          stage2d_acceptance_error_count:
            MASTER_STAGE2D_ERROR_COUNT,

          so2_mam_valid_month_count:
            MASTER_SO2_MAM_VALID_MONTHS,

          so2_mam_strict_complete:
            MASTER_SO2_MAM_STRICT_COMPLETE,

          so2_jja_valid_month_count:
            MASTER_SO2_JJA_VALID_MONTHS,

          so2_jja_strict_complete:
            MASTER_SO2_JJA_STRICT_COMPLETE,

          master_acceptance_error_count:
            MASTER_ACCEPTANCE_ERROR_COUNT,

          master_acceptance_status:
            MASTER_ACCEPTANCE_STATUS
        }
      )
    ]);


  MASTER_OUTPUT = {
    publication:
      PUB_ACCEPTANCE,

    selectedSo2Seasons:
      SO2_ACCEPTANCE,

    masterAcceptanceManifest:
      MASTER_ACCEPTANCE_MANIFEST
  };


  print(
    '=================================================='
  );

  print(
    '=== MASTER RELEASE FINAL ACCEPTANCE ==='
  );

  print(
    'Stage-2D acceptance error count:',
    MASTER_STAGE2D_ERROR_COUNT
  );

  print(
    'SO2 MAM valid months:',
    MASTER_SO2_MAM_VALID_MONTHS
  );

  print(
    'SO2 MAM strict complete:',
    MASTER_SO2_MAM_STRICT_COMPLETE
  );

  print(
    'SO2 JJA valid months:',
    MASTER_SO2_JJA_VALID_MONTHS
  );

  print(
    'SO2 JJA strict complete:',
    MASTER_SO2_JJA_STRICT_COMPLETE
  );

  print(
    'MASTER_ACCEPTANCE_ERROR_COUNT:',
    MASTER_ACCEPTANCE_ERROR_COUNT
  );

  print(
    'MASTER_ACCEPTANCE_STATUS:',
    MASTER_ACCEPTANCE_STATUS
  );

  print(
    'MASTER_ACCEPTANCE_MANIFEST:',
    MASTER_ACCEPTANCE_MANIFEST
  );

  print(
    '=== END MASTER RELEASE FINAL ACCEPTANCE ==='
  );

  print(
    '=================================================='
  );


} else if (CONFIG.runMode === 'FINAL_PUBLICATION_EXPORT') {


  var PUB_EXPORT =
    runMasterPublicationPackage(true);


  var SO2_EXPORT =
    runMasterSelectedSo2SeasonExports(true);


  var RGB_EXPORT =
    runMasterFinalPublicationRgbExports();


  MASTER_OUTPUT = {

    publication:
      PUB_EXPORT,

    selectedSo2Seasons:
      SO2_EXPORT,

    publicationRgb:
      RGB_EXPORT
  };


  print('==================================================');
  print('=== MASTER FINAL PUBLICATION EXPORT COMPLETE ===');

  print(
    'Core publication package:',
    'CREATED'
  );

  print(
    'Selected SO2 scientific seasonal package:',
    'CREATED — MAM 2024 + JJA 2024'
  );

  print(
    'Publication RGB package:',
    CONFIG.includePublicationRgbBatchInFinalExport
      ? 'CREATED — expected exactly 8 RGB tasks'
      : 'DISABLED'
  );

  print(
    'RGB scientific-integrity rule:',
    'NO bilinear/bicubic interpolation.'
  );

  print(
    'Scientific raster rule:',
    'Scientific GeoTIFFs remain independent from RGB display products.'
  );

  print(
    'SO2 missing-data rule:',
    'The system does not silently interpolate SO2 NA months.'
  );

  print(
    'NEXT STEP:',
    'Open Tasks and verify the complete generated CSV + scientific GeoTIFF + publication RGB package.'
  );

  print(
    '=== END MASTER FINAL PUBLICATION EXPORT ==='
  );

  print('==================================================');
}
