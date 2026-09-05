# Coverage-aware Sentinel-5P workflow for Kryvyi Rih

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22071247.svg)](https://doi.org/10.5281/zenodo.22071247)

Current archived software release: **v1.0.0**

This repository contains the Google Earth Engine implementation and supporting reproducibility materials for the 2019–2024 Sentinel-5P/TROPOMI analysis of NO₂, CO and SO₂ over Kryvyi Rih, Ukraine.

The archived and citable snapshot of software release `v1.0.0` is available on Zenodo:

https://doi.org/10.5281/zenodo.22071247

The current `main` branch additionally contains publication-supporting data products, manifests, validation records, and audit scripts assembled after the initial software release. These materials are intended to support transparent verification of the reported analyses and preparation of an updated archival release.

## Scientific purpose

The workflow implements pollutant-specific preprocessing and a common quality-control architecture in which spatial coverage, temporal support, missing-data handling, and strict calendar completeness determine whether downstream seasonal, annual, endpoint-change, and hotspot-persistence products are eligible for interpretation.

The repository is intended to support transparent reproduction, verification, and audit of the scientific workflow and its reported outputs.

The workflow does **not** convert satellite vertical columns to regulatory near-surface concentrations and does **not** perform source-emission inversion.

## Repository contents

```text
code/
  kryvyi_rih_s5p_coverage_aware_workflow.js
  sentinel5p_pixel_completeness_persistence_audit.js
  sentinel5p_processor_version_audit.js
  sentinel5p_sensitivity_analysis_audit.js
  sentinel5p_so2_missing_month_root_cause_audit.js
  sentinel5p_so2_scale_sensitivity_audit.js

metadata/
  run_params.json
  data_dictionary.csv

data/
  README_AOI.md

  tables/
    ARTICLE4_FINAL_ACCEPTANCE_MANIFEST_2019_2024_R01.csv
    ARTICLE4_FINAL_LONG_TERM_SUMMARY_2019_2024_R01.csv
    ARTICLE4_FINAL_TABLE1_METHOD_METADATA_2019_2024_R01.csv
    ARTICLE4_FINAL_TABLE2_MONTHLY_AOI_STATISTICS_2019_2024_R01.csv
    ARTICLE4_FINAL_TABLE3_MONTHLY_QC_2019_2024_R01.csv
    ARTICLE4_FINAL_TABLE4_SEASONAL_ANNUAL_SUMMARY_2019_2024_R01.csv
    ARTICLE4_SO2_COMPLETE_SEASON_CANDIDATES_2019_2024_R01.csv
    README.md

  figure_data/
    ARTICLE4_FIG3_TIME_SERIES_DATA_2019_2024_R01.csv
    ARTICLE4_FIG6_SO2_SELECTED_SEASONS_MAM_JJA_2024_R01.csv
    ARTICLE4_FIG7_AVAILABILITY_DATA_2019_2024_R01.csv
    README.md

  manifests/
    ARTICLE4_FINAL_ANNUAL_SPATIAL_ASSET_MANIFEST_2019_2024_R01.csv
    ARTICLE4_FINAL_FIGURE_MANIFEST_R01.csv
    ARTICLE4_FINAL_MAIN_TEXT_EXPORT_SELECTION_MANIFEST_R01.csv
    ARTICLE4_FINAL_SPATIAL_PRODUCT_MANIFEST_2019_2024_R01.csv
    README.md

  rasters/
    ARTICLE4_FINAL_ANNUAL_CO_AOI_KRYVYI_RIH_2019_R01.tif
    ARTICLE4_FINAL_ANNUAL_CO_AOI_KRYVYI_RIH_2024_R01.tif
    ARTICLE4_FINAL_ANNUAL_NO2_AOI_KRYVYI_RIH_2019_R01.tif
    ARTICLE4_FINAL_ANNUAL_NO2_AOI_KRYVYI_RIH_2024_R01.tif
    ARTICLE4_FINAL_CHANGE_CO_AOI_KRYVYI_RIH_2019_2024_R01.tif
    ARTICLE4_FINAL_CHANGE_NO2_AOI_KRYVYI_RIH_2019_2024_R01.tif
    ARTICLE4_FINAL_HOTSPOT_PERSISTENCE_CO_AOI_KRYVYI_RIH_2019_2024_R01.tif
    ARTICLE4_FINAL_HOTSPOT_PERSISTENCE_NO2_AOI_KRYVYI_RIH_2019_2024_R01.tif
    ARTICLE4_FINAL_SO2_JJA_AOI_KRYVYI_RIH_2024_R01.tif
    ARTICLE4_FINAL_SO2_MAM_AOI_KRYVYI_RIH_2024_R01.tif
    README.md

validation/
  README.md
  critical_audit_decision_summary.txt
  pixel_completeness_persistence_audit_summary.txt
  sensitivity_analysis_audit_summary.txt
  sentinel5p_processor_version_audit_summary.txt
  so2_missing_month_root_cause_audit_summary.txt
  so2_scale_sensitivity_audit_summary.txt

docs/
  GITHUB_PREPUBLICATION_CHECKLIST.md
  PUBLIC_RELEASE_AUDIT.md

CITATION.cff
RIGHTS.md
SHA256SUMS.txt
.gitignore
README.md
