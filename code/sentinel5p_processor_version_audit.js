// ARTICLE4_PROCESSOR_VERSION_AUDIT
// Purpose: inventory exact Sentinel-5P OFFL source processor/algorithm/HARP versions
// used by the Earth Engine collections over the article period 2019-2024.
// This script DOES NOT alter the scientific workflow or its outputs.

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


/*
OPTIONAL STRICT AUDIT

Run this script in the same Google Earth Engine project used for the article.

Then save or copy the Console output.

Please send me the complete Console output after the script finishes.

I will then verify, separately for NO2, CO and SO2:

1. which PROCESSOR_VERSION values are present in 2019-2024;
2. which ALGORITHM_VERSION values are present;
3. which HARP_VERSION values are present;
4. whether processor transitions occur inside individual years;
5. whether any year or endpoint (2019 / 2024) is affected by mixed versions;
6. whether the processor-version limitation currently written in the article
   should remain unchanged, be strengthened, or be softened.

IMPORTANT

This audit does NOT modify:
- monthly means;
- annual means;
- spatial products;
- endpoint change;
- hotspot persistence;
- completeness logic;
- any previously generated publication result.

It only reads metadata from the exact Sentinel-5P OFFL collections used in the article.
*/
