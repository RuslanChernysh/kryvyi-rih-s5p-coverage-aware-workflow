// SENTINEL-5P SENSITIVITY ANALYSIS AUDIT
// Kryvyi Rih, 2019-2024
//
// Read-only post-release validation script.
// Uses the verified Stage-2A monthly AOI materializations produced by the
// Master workflow. It does NOT modify the Master workflow, source assets,
// Stage-2A assets, or publication outputs.
//
// Audit questions:
// A. NO2 / CO: diagnostic sensitivity to minimum mean temporal-support
//    fraction thresholds: BASE, 10%, 20%, 25%.
// B. SO2: diagnostic sensitivity to minimum mean valid orbital-support
//    thresholds: 1, 3, 5 observations.
//
// IMPORTANT:
// - These thresholds are diagnostic sensitivity scenarios only.
// - They are NOT new Master acceptance rules.
// - NO2/CO endpoint contrasts below are AOI-level diagnostics computed from
//   accepted monthly AOI means, not replacements for the publication raster
//   endpoint products.
// - SO2 seasonal means below are AOI-level diagnostics from accepted monthly
//   AOI means.
// - NA/null values remain excluded and are never converted to zero.

var AUDIT = {
  startYear: 2019,
  endYear: 2024,

  endpointStartYear: 2019,
  endpointEndYear: 2024,

  so2SeasonYear: 2024,

  aoiId: 'AOI_KRYVYI_RIH',

  assetFolder:
    'projects/ee-ruslan777chernysh/assets',

  stage2aSuffix:
    '_R02',

  no2CoThresholds: [
    {
      id: 'BASE',
      fraction: 0.0,
      label: 'BASE_NO_EXTRA_SUPPORT_FILTER'
    },
    {
      id: 'GE_10_PERCENT',
      fraction: 0.10,
      label: 'temporal_support_fraction_mean >= 0.10'
    },
    {
      id: 'GE_20_PERCENT',
      fraction: 0.20,
      label: 'temporal_support_fraction_mean >= 0.20'
    },
    {
      id: 'GE_25_PERCENT',
      fraction: 0.25,
      label: 'temporal_support_fraction_mean >= 0.25'
    }
  ],

  so2Thresholds: [
    {
      id: 'GE_1_ORBITAL',
      count: 1,
      label: 'support_count_mean >= 1'
    },
    {
      id: 'GE_3_ORBITAL',
      count: 3,
      label: 'support_count_mean >= 3'
    },
    {
      id: 'GE_5_ORBITAL',
      count: 5,
      label: 'support_count_mean >= 5'
    }
  ],

  expectedMonthsPerYear: 12,
  expectedSeasonMonths: 3,

  createDriveCsvTasks: false,
  driveFolder: 'ARTICLE4_VALIDATION'
};


// ============================================================
// 1. LOAD VERIFIED STAGE-2A MATERIALIZATIONS
// ============================================================

function stage2aAssetId(yearValue) {
  return AUDIT.assetFolder +
    '/ARTICLE4_STAGE2A_AOI_MONTHLY_' +
    AUDIT.aoiId +
    '_' +
    String(yearValue) +
    AUDIT.stage2aSuffix;
}


var MASTER_MONTHLY =
  ee.FeatureCollection([]);


for (
  var y = AUDIT.startYear;
  y <= AUDIT.endYear;
  y++
) {
  MASTER_MONTHLY =
    MASTER_MONTHLY.merge(
      ee.FeatureCollection(
        stage2aAssetId(y)
      )
    );
}


MASTER_MONTHLY =
  MASTER_MONTHLY.sort(
    'system:time_start'
  );


print('==================================================');
print('SENTINEL-5P SENSITIVITY ANALYSIS AUDIT');
print('Study period:', AUDIT.startYear + '-' + AUDIT.endYear);
print('Endpoint years:', AUDIT.endpointStartYear, AUDIT.endpointEndYear);
print('Expected total Stage-2A rows:', 216);
print('Actual total Stage-2A rows:', MASTER_MONTHLY.size());
print(
  'Duplicate pollutant-month key count:',
  MASTER_MONTHLY.size().subtract(
    MASTER_MONTHLY
      .distinct(['pollutant', 'month'])
      .size()
  )
);


// ============================================================
// 2. HELPERS
// ============================================================

function validMonthlyRows(pollutantKey) {
  return MASTER_MONTHLY
    .filter(
      ee.Filter.eq(
        'pollutant',
        pollutantKey
      )
    )
    .filter(
      ee.Filter.notNull([
        'AOI_mean_mol_m2'
      ])
    );
}


function acceptedNo2CoRows(
  pollutantKey,
  thresholdFraction
) {

  var rows =
    validMonthlyRows(
      pollutantKey
    );

  if (thresholdFraction <= 0) {
    return rows;
  }

  return rows
    .filter(
      ee.Filter.notNull([
        'temporal_support_fraction_mean'
      ])
    )
    .filter(
      ee.Filter.gte(
        'temporal_support_fraction_mean',
        thresholdFraction
      )
    );
}


function acceptedSo2Rows(
  thresholdCount
) {

  return validMonthlyRows('SO2')
    .filter(
      ee.Filter.notNull([
        'support_count_mean'
      ])
    )
    .filter(
      ee.Filter.gte(
        'support_count_mean',
        thresholdCount
      )
    );
}


function rowsForYear(
  collection,
  yearValue
) {

  return ee.FeatureCollection(
    collection
  ).filter(
    ee.Filter.eq(
      'year',
      yearValue
    )
  );
}


function monthList(
  collection
) {

  return ee.List(
    ee.FeatureCollection(
      collection
    )
    .aggregate_array(
      'month'
    )
  ).sort();
}


function meanProperty(
  collection,
  propertyName
) {

  var fc =
    ee.FeatureCollection(
      collection
    );

  return ee.Algorithms.If(
    fc.size().gt(0),
    fc.aggregate_mean(
      propertyName
    ),
    null
  );
}


function minProperty(
  collection,
  propertyName
) {

  var fc =
    ee.FeatureCollection(
      collection
    )
    .filter(
      ee.Filter.notNull([
        propertyName
      ])
    );

  return ee.Algorithms.If(
    fc.size().gt(0),
    fc.aggregate_min(
      propertyName
    ),
    null
  );
}


function maxProperty(
  collection,
  propertyName
) {

  var fc =
    ee.FeatureCollection(
      collection
    )
    .filter(
      ee.Filter.notNull([
        propertyName
      ])
    );

  return ee.Algorithms.If(
    fc.size().gt(0),
    fc.aggregate_max(
      propertyName
    ),
    null
  );
}


function endpointContrastPercent(
  startMean,
  endMean
) {

  return ee.Algorithms.If(
    ee.Algorithms.IsEqual(
      startMean,
      null
    ),
    null,

    ee.Algorithms.If(
      ee.Algorithms.IsEqual(
        endMean,
        null
      ),
      null,

      ee.Algorithms.If(
        ee.Number(startMean)
          .abs()
          .gt(0),

        ee.Number(endMean)
          .subtract(
            ee.Number(startMean)
          )
          .divide(
            ee.Number(startMean)
          )
          .multiply(100),

        null
      )
    )
  );
}


function seasonRows(
  collection,
  yearValue,
  monthNumbers
) {

  return ee.FeatureCollection(
    collection
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
      monthNumbers
    )
  );
}


// ============================================================
// 3. NO2 / CO SENSITIVITY
// ============================================================

var NO2_CO_FEATURES = [];


['NO2', 'CO'].forEach(
  function(pollutantKey) {

    AUDIT.no2CoThresholds.forEach(
      function(thresholdObject) {

        var accepted =
          acceptedNo2CoRows(
            pollutantKey,
            thresholdObject.fraction
          );


        var startRows =
          rowsForYear(
            accepted,
            AUDIT.endpointStartYear
          );


        var endRows =
          rowsForYear(
            accepted,
            AUDIT.endpointEndYear
          );


        var startCount =
          startRows.size();


        var endCount =
          endRows.size();


        var startComplete =
          ee.Number(
            startCount.eq(
              AUDIT.expectedMonthsPerYear
            )
          );


        var endComplete =
          ee.Number(
            endCount.eq(
              AUDIT.expectedMonthsPerYear
            )
          );


        var startMean =
          meanProperty(
            startRows,
            'AOI_mean_mol_m2'
          );


        var endMean =
          meanProperty(
            endRows,
            'AOI_mean_mol_m2'
          );


        var contrast =
          endpointContrastPercent(
            startMean,
            endMean
          );


        NO2_CO_FEATURES.push(
          ee.Feature(
            null,
            {
              pollutant:
                pollutantKey,

              scenario:
                thresholdObject.id,

              threshold_description:
                thresholdObject.label,

              threshold_fraction:
                thresholdObject.fraction,

              accepted_months_all_2019_2024:
                accepted.size(),

              accepted_months_2019:
                startCount,

              accepted_month_labels_2019:
                monthList(startRows),

              accepted_months_2024:
                endCount,

              accepted_month_labels_2024:
                monthList(endRows),

              annual_2019_complete_12_of_12:
                startComplete,

              annual_2024_complete_12_of_12:
                endComplete,

              aoi_mean_2019_mol_m2:
                startMean,

              aoi_mean_2024_mol_m2:
                endMean,

              endpoint_contrast_percent_2024_vs_2019:
                contrast,

              valid_area_percent_min_2019:
                minProperty(
                  startRows,
                  'valid_area_percent'
                ),

              valid_area_percent_mean_2019:
                meanProperty(
                  startRows,
                  'valid_area_percent'
                ),

              valid_area_percent_min_2024:
                minProperty(
                  endRows,
                  'valid_area_percent'
                ),

              valid_area_percent_mean_2024:
                meanProperty(
                  endRows,
                  'valid_area_percent'
                ),

              sample_count_min_2019:
                minProperty(
                  startRows,
                  'AOI_reduction_sample_count'
                ),

              sample_count_max_2019:
                maxProperty(
                  startRows,
                  'AOI_reduction_sample_count'
                ),

              sample_count_min_2024:
                minProperty(
                  endRows,
                  'AOI_reduction_sample_count'
                ),

              sample_count_max_2024:
                maxProperty(
                  endRows,
                  'AOI_reduction_sample_count'
                ),

              diagnostic_note:
                'AOI-level sensitivity using verified Stage-2A monthly AOI means; not a replacement for publication raster endpoint products.'
            }
          )
        );

      }
    );

  }
);


var NO2_CO_SENSITIVITY =
  ee.FeatureCollection(
    NO2_CO_FEATURES
  );


// ============================================================
// 4. SO2 SENSITIVITY
// ============================================================

var SO2_FEATURES = [];


AUDIT.so2Thresholds.forEach(
  function(thresholdObject) {

    var accepted =
      acceptedSo2Rows(
        thresholdObject.count
      );


    var mam =
      seasonRows(
        accepted,
        AUDIT.so2SeasonYear,
        [3, 4, 5]
      );


    var jja =
      seasonRows(
        accepted,
        AUDIT.so2SeasonYear,
        [6, 7, 8]
      );


    var mamCount =
      mam.size();


    var jjaCount =
      jja.size();


    var mamComplete =
      ee.Number(
        mamCount.eq(
          AUDIT.expectedSeasonMonths
        )
      );


    var jjaComplete =
      ee.Number(
        jjaCount.eq(
          AUDIT.expectedSeasonMonths
        )
      );


    var mamMean =
      ee.Algorithms.If(
        mamComplete.eq(1),
        mam.aggregate_mean(
          'AOI_mean_mol_m2'
        ),
        null
      );


    var jjaMean =
      ee.Algorithms.If(
        jjaComplete.eq(1),
        jja.aggregate_mean(
          'AOI_mean_mol_m2'
        ),
        null
      );


    var mamOverJja =
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          mamMean,
          null
        ),
        null,

        ee.Algorithms.If(
          ee.Algorithms.IsEqual(
            jjaMean,
            null
          ),
          null,

          ee.Algorithms.If(
            ee.Number(jjaMean)
              .abs()
              .gt(0),

            ee.Number(mamMean)
              .divide(
                ee.Number(jjaMean)
              ),

            null
          )
        )
      );


    var jjaOverMam =
      ee.Algorithms.If(
        ee.Algorithms.IsEqual(
          mamMean,
          null
        ),
        null,

        ee.Algorithms.If(
          ee.Algorithms.IsEqual(
            jjaMean,
            null
          ),
          null,

          ee.Algorithms.If(
            ee.Number(mamMean)
              .abs()
              .gt(0),

            ee.Number(jjaMean)
              .divide(
                ee.Number(mamMean)
              ),

            null
          )
        )
      );


    var perYearCounts = {};

    for (
      var so2Year = AUDIT.startYear;
      so2Year <= AUDIT.endYear;
      so2Year++
    ) {

      perYearCounts[
        'accepted_months_' +
        String(so2Year)
      ] =
        rowsForYear(
          accepted,
          so2Year
        ).size();

    }


    var properties = {
      pollutant:
        'SO2',

      scenario:
        thresholdObject.id,

      threshold_description:
        thresholdObject.label,

      threshold_min_mean_orbital_contributions:
        thresholdObject.count,

      accepted_months_all_2019_2024:
        accepted.size(),

      accepted_month_labels_all:
        monthList(accepted),

      season_year:
        AUDIT.so2SeasonYear,

      MAM_accepted_month_count:
        mamCount,

      MAM_accepted_month_labels:
        monthList(mam),

      MAM_complete_3_of_3:
        mamComplete,

      MAM_mean_mol_m2:
        mamMean,

      JJA_accepted_month_count:
        jjaCount,

      JJA_accepted_month_labels:
        monthList(jja),

      JJA_complete_3_of_3:
        jjaComplete,

      JJA_mean_mol_m2:
        jjaMean,

      MAM_over_JJA_ratio:
        mamOverJja,

      JJA_over_MAM_ratio:
        jjaOverMam,

      MAM_valid_area_percent_min:
        minProperty(
          mam,
          'valid_area_percent'
        ),

      JJA_valid_area_percent_min:
        minProperty(
          jja,
          'valid_area_percent'
        ),

      MAM_support_count_mean_min:
        minProperty(
          mam,
          'support_count_mean'
        ),

      JJA_support_count_mean_min:
        minProperty(
          jja,
          'support_count_mean'
        ),

      diagnostic_note:
        'AOI-level sensitivity using verified Stage-2A monthly SO2 means and support_count_mean; thresholds are diagnostic and do not modify the Master SO2 branch.'
    };


    Object.keys(
      perYearCounts
    ).forEach(
      function(key) {
        properties[key] =
          perYearCounts[key];
      }
    );


    SO2_FEATURES.push(
      ee.Feature(
        null,
        properties
      )
    );

  }
);


var SO2_SENSITIVITY =
  ee.FeatureCollection(
    SO2_FEATURES
  );


// ============================================================
// 5. MONTH-LEVEL SUPPORT INVENTORY
// ============================================================

var NO2_SUPPORT_INVENTORY =
  validMonthlyRows('NO2')
  .select([
    'pollutant',
    'year',
    'month',
    'AOI_mean_mol_m2',
    'valid_area_percent',
    'AOI_reduction_sample_count',
    'support_count_mean',
    'support_count_median',
    'support_count_p10',
    'support_count_p90',
    'temporal_support_fraction_mean'
  ]);


var CO_SUPPORT_INVENTORY =
  validMonthlyRows('CO')
  .select([
    'pollutant',
    'year',
    'month',
    'AOI_mean_mol_m2',
    'valid_area_percent',
    'AOI_reduction_sample_count',
    'support_count_mean',
    'support_count_median',
    'support_count_p10',
    'support_count_p90',
    'temporal_support_fraction_mean'
  ]);


var SO2_SUPPORT_INVENTORY =
  validMonthlyRows('SO2')
  .select([
    'pollutant',
    'year',
    'month',
    'AOI_mean_mol_m2',
    'valid_area_percent',
    'AOI_reduction_sample_count',
    'support_count_mean',
    'support_count_median',
    'support_count_p10',
    'support_count_p90'
  ]);


// ============================================================
// 6. FLAT CONSOLE OUTPUT
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

  return String(value);
}


function bool01(value) {
  return Number(value) === 1
    ? 'YES'
    : 'NO';
}


NO2_CO_SENSITIVITY.evaluate(
  function(result) {

    print('==================================================');
    print('NO2 / CO SENSITIVITY — FLAT RESULTS');

    result.features.forEach(
      function(feature) {

        var p = feature.properties;

        print(
          [
            p.pollutant,
            p.scenario,

            'accepted2019=' +
              fmt(
                p.accepted_months_2019
              ),

            'accepted2024=' +
              fmt(
                p.accepted_months_2024
              ),

            'complete2019=' +
              bool01(
                p.annual_2019_complete_12_of_12
              ),

            'complete2024=' +
              bool01(
                p.annual_2024_complete_12_of_12
              ),

            'mean2019=' +
              fmt(
                p.aoi_mean_2019_mol_m2,
                10
              ),

            'mean2024=' +
              fmt(
                p.aoi_mean_2024_mol_m2,
                10
              ),

            'endpointPct=' +
              fmt(
                p.endpoint_contrast_percent_2024_vs_2019,
                4
              ),

            'minArea2019=' +
              fmt(
                p.valid_area_percent_min_2019,
                3
              ),

            'minArea2024=' +
              fmt(
                p.valid_area_percent_min_2024,
                3
              ),

            'sampleRange2019=' +
              fmt(
                p.sample_count_min_2019
              ) +
              '-' +
              fmt(
                p.sample_count_max_2019
              ),

            'sampleRange2024=' +
              fmt(
                p.sample_count_min_2024
              ) +
              '-' +
              fmt(
                p.sample_count_max_2024
              )
          ].join(' | ')
        );

        print(
          '  months2019=' +
          JSON.stringify(
            p.accepted_month_labels_2019
          )
        );

        print(
          '  months2024=' +
          JSON.stringify(
            p.accepted_month_labels_2024
          )
        );

      }
    );

  }
);


SO2_SENSITIVITY.evaluate(
  function(result) {

    print('==================================================');
    print('SO2 SENSITIVITY — FLAT RESULTS');

    result.features.forEach(
      function(feature) {

        var p = feature.properties;

        print(
          [
            p.scenario,

            'acceptedTotal=' +
              fmt(
                p.accepted_months_all_2019_2024
              ),

            '2019=' +
              fmt(
                p.accepted_months_2019
              ),

            '2020=' +
              fmt(
                p.accepted_months_2020
              ),

            '2021=' +
              fmt(
                p.accepted_months_2021
              ),

            '2022=' +
              fmt(
                p.accepted_months_2022
              ),

            '2023=' +
              fmt(
                p.accepted_months_2023
              ),

            '2024=' +
              fmt(
                p.accepted_months_2024
              ),

            'MAM=' +
              fmt(
                p.MAM_accepted_month_count
              ) +
              '/3',

            'MAMcomplete=' +
              bool01(
                p.MAM_complete_3_of_3
              ),

            'MAMmean=' +
              fmt(
                p.MAM_mean_mol_m2,
                10
              ),

            'JJA=' +
              fmt(
                p.JJA_accepted_month_count
              ) +
              '/3',

            'JJAcomplete=' +
              bool01(
                p.JJA_complete_3_of_3
              ),

            'JJAmean=' +
              fmt(
                p.JJA_mean_mol_m2,
                10
              ),

            'MAM/JJA=' +
              fmt(
                p.MAM_over_JJA_ratio,
                4
              ),

            'JJA/MAM=' +
              fmt(
                p.JJA_over_MAM_ratio,
                4
              )
          ].join(' | ')
        );

        print(
          '  MAM months=' +
          JSON.stringify(
            p.MAM_accepted_month_labels
          )
        );

        print(
          '  JJA months=' +
          JSON.stringify(
            p.JJA_accepted_month_labels
          )
        );

      }
    );

  }
);


// ============================================================
// 7. OPTIONAL CSV EXPORTS
// ============================================================

if (
  AUDIT.createDriveCsvTasks
) {

  Export.table.toDrive({
    collection:
      NO2_CO_SENSITIVITY,

    description:
      'ARTICLE4_VALIDATION_NO2_CO_SENSITIVITY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'NO2_CO_sensitivity_analysis',

    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      SO2_SENSITIVITY,

    description:
      'ARTICLE4_VALIDATION_SO2_SENSITIVITY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'SO2_sensitivity_analysis',

    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      NO2_SUPPORT_INVENTORY,

    description:
      'ARTICLE4_VALIDATION_NO2_SUPPORT_INVENTORY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'NO2_monthly_support_inventory',

    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      CO_SUPPORT_INVENTORY,

    description:
      'ARTICLE4_VALIDATION_CO_SUPPORT_INVENTORY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'CO_monthly_support_inventory',

    fileFormat:
      'CSV'
  });


  Export.table.toDrive({
    collection:
      SO2_SUPPORT_INVENTORY,

    description:
      'ARTICLE4_VALIDATION_SO2_SUPPORT_INVENTORY',

    folder:
      AUDIT.driveFolder,

    fileNamePrefix:
      'SO2_monthly_support_inventory',

    fileFormat:
      'CSV'
  });

}


print('==================================================');
print('SENSITIVITY AUDIT READY');
print(
  'Thresholds are diagnostic sensitivity scenarios only; Master scientific processing is unchanged.'
);
print(
  'Drive CSV export tasks:',
  AUDIT.createDriveCsvTasks
    ? 'ENABLED'
    : 'DISABLED'
);
