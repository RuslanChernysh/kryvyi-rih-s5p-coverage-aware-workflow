/*
 * Sentinel-5P OFFL processor-version audit
 *
 * Copyright © 2026 Ruslan Chernysh. All rights reserved.
 *
 * This source code is publicly accessible for scientific transparency,
 * scholarly review, methodological inspection, and citation.
 * Reuse, copying, modification, redistribution, incorporation into other
 * software or workflows, and commercial use require prior written permission,
 * except where otherwise permitted by applicable law.
 *
 * See RIGHTS.md in the repository root for the complete rights and reuse policy:
 * https://github.com/RuslanChernysh/kryvyi-rih-s5p-coverage-aware-workflow/blob/main/RIGHTS.md
 */

// Sentinel-5P OFFL processor-version audit
// Metadata inventory for the Sentinel-5P OFFL collections used in the study.
// Study period: 2019-2024.

var START_YEAR = 2019;
var END_YEAR = 2024;

var CATALOG = {
  NO2: {
    collection: 'COPERNICUS/S5P/OFFL/L3_NO2',
    band: 'tropospheric_NO2_column_number_density'
  },
  CO: {
    collection: 'COPERNICUS/S5P/OFFL/L3_CO',
    band: 'CO_column_number_density'
  },
  SO2: {
    collection: 'COPERNICUS/S5P/OFFL/L3_SO2',
    band: 'SO2_column_number_density'
  }
};

function auditPollutant(pollutant) {
  var info = CATALOG[pollutant];

  var coll = ee.ImageCollection(info.collection)
    .filterDate(
      ee.Date.fromYMD(START_YEAR, 1, 1),
      ee.Date.fromYMD(END_YEAR + 1, 1, 1)
    );

  print('==================================================');
  print('PROCESSOR AUDIT:', pollutant);
  print('Collection:', info.collection);
  print('Total assets 2019-2024:', coll.size());

  print(
    'PROCESSOR_VERSION all-period histogram:',
    coll.aggregate_histogram('PROCESSOR_VERSION')
  );

  print(
    'ALGORITHM_VERSION all-period histogram:',
    coll.aggregate_histogram('ALGORITHM_VERSION')
  );

  print(
    'HARP_VERSION all-period histogram:',
    coll.aggregate_histogram('HARP_VERSION')
  );

  print(
    'PRODUCT_QUALITY all-period histogram:',
    coll.aggregate_histogram('PRODUCT_QUALITY')
  );

  print(
    'PROCESSING_STATUS all-period histogram:',
    coll.aggregate_histogram('PROCESSING_STATUS')
  );

  print(
    'SPATIAL_RESOLUTION all-period histogram:',
    coll.aggregate_histogram('SPATIAL_RESOLUTION')
  );

  for (var y = START_YEAR; y <= END_YEAR; y++) {

    var yc = coll.filterDate(
      ee.Date.fromYMD(y, 1, 1),
      ee.Date.fromYMD(y + 1, 1, 1)
    );

    print(
      pollutant + ' ' + y + ' count:',
      yc.size()
    );

    print(
      pollutant + ' ' + y + ' PROCESSOR_VERSION:',
      yc.aggregate_histogram('PROCESSOR_VERSION')
    );

    print(
      pollutant + ' ' + y + ' ALGORITHM_VERSION:',
      yc.aggregate_histogram('ALGORITHM_VERSION')
    );

    print(
      pollutant + ' ' + y + ' HARP_VERSION:',
      yc.aggregate_histogram('HARP_VERSION')
    );
  }
}

['NO2', 'CO', 'SO2'].forEach(auditPollutant);
