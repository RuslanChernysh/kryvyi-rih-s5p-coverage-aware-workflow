# Coverage-aware Sentinel-5P workflow for Kryvyi Rih

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22534101.svg)](https://doi.org/10.5281/zenodo.22534101)

Current archived software release: **v1.1.1**

This repository contains the Google Earth Engine implementation and supporting reproducibility materials for the 2019–2024 Sentinel-5P/TROPOMI analysis of NO₂, CO, and SO₂ over Kryvyi Rih, Ukraine.

The current archived and citable software release is `v1.1.1`:

https://doi.org/10.5281/zenodo.22534101

Release `v1.1.1` is the corrective reproducibility release. It includes refreshed publication-supporting `R02` outputs, corrected AOI raster-cell-count provenance, expanded validation records, updated audit scripts, clarified scientific raster export provenance, and separate publication-rendered RGB products.

The preceding archived release `v1.1.0` remains available at:

https://doi.org/10.5281/zenodo.22533826

## Scientific purpose

The workflow implements pollutant-specific preprocessing and a common quality-control architecture in which spatial coverage, temporal support, missing-data handling, and strict calendar completeness determine whether downstream seasonal, annual, endpoint-change, and hotspot-persistence products are eligible for interpretation.

The repository supports transparent reproduction, verification, and audit of the scientific workflow and its reported outputs.

The workflow does **not** convert satellite vertical columns to regulatory near-surface concentrations and does **not** perform source-emission inversion.

## Corrective-release scope

Archived release `v1.1.1` preserves the verified scientific processing architecture while incorporating the following corrections and clarifications:

- Stage-2A monthly AOI materializations use corrective version `R03`;
- Stage-2B publication tables use corrective version `R03`;
- verified Stage-2C scientific annual assets remain version `R01`;
- final Stage-2D publication exports use corrective version `R02`;
- the verified standalone unweighted AOI raster-cell count is 528 for the applicable approximately 0.01-degree grid;
- the historical value 698 originated from a combined mean-and-count reduction and must not be interpreted as the number of valid raster cells;
- SO₂ missing months remain missing and are not silently interpolated or converted to zero;
- the predefined 7000 m SO₂ AOI reduction scale was evaluated through sensitivity analysis and was not selected as an optimal scale;
- final scientific GeoTIFF exports preserve the verified source-grid CRS and affine transform;
- publication-rendered RGB GeoTIFFs are kept separate from numerical scientific rasters.

## Repository contents

```text
code/
  kryvyi_rih_s5p_coverage_aware_workflow.js
  sentinel5p_aoi_reduction_sample_count_diagnostic.js
  sentinel5p_pixel_completeness_persistence_audit.js
  sentinel5p_processor_version_audit.js
  sentinel5p_sensitivity_analysis_audit.js
  sentinel5p_so2_missing_month_root_cause_audit.js
  sentinel5p_so2_scale_sensitivity_audit.js
  sentinel5p_spatial_support_provenance_audit.js

metadata/
  data_dictionary.csv
  run_params.json

data/
  README_AOI.md

  tables/
    ARTICLE4_FINAL_ACCEPTANCE_MANIFEST_2019_2024_R02.csv
    ARTICLE4_FINAL_LONG_TERM_SUMMARY_2019_2024_R02.csv
    ARTICLE4_FINAL_TABLE1_METHOD_METADATA_2019_2024_R02.csv
    ARTICLE4_FINAL_TABLE2_MONTHLY_AOI_STATISTICS_2019_2024_R02.csv
    ARTICLE4_FINAL_TABLE3_MONTHLY_QC_2019_2024_R02.csv
    ARTICLE4_FINAL_TABLE4_SEASONAL_ANNUAL_SUMMARY_2019_2024_R02.csv
    README.md

  figure_data/
    ARTICLE4_FIG3_TIME_SERIES_DATA_2019_2024_R02.csv
    ARTICLE4_FIG6_SO2_SELECTED_SEASONS_MAM_JJA_2024_R02.csv
    ARTICLE4_FIG7_AVAILABILITY_DATA_2019_2024_R02.csv
    ARTICLE4_SO2_COMPLETE_SEASON_CANDIDATES_2019_2024_R02.csv
    README.md

  manifests/
    ARTICLE4_FINAL_ANNUAL_SPATIAL_ASSET_MANIFEST_2019_2024_R02.csv
    ARTICLE4_FINAL_FIGURE_MANIFEST_R02.csv
    ARTICLE4_FINAL_MAIN_TEXT_EXPORT_SELECTION_MANIFEST_R02.csv
    ARTICLE4_FINAL_SPATIAL_PRODUCT_MANIFEST_2019_2024_R02.csv
    README.md

  rasters/
    ARTICLE4_FINAL_ANNUAL_CO_AOI_KRYVYI_RIH_2019_R02.tif
    ARTICLE4_FINAL_ANNUAL_CO_AOI_KRYVYI_RIH_2024_R02.tif
    ARTICLE4_FINAL_ANNUAL_NO2_AOI_KRYVYI_RIH_2019_R02.tif
    ARTICLE4_FINAL_ANNUAL_NO2_AOI_KRYVYI_RIH_2024_R02.tif
    ARTICLE4_FINAL_CHANGE_CO_AOI_KRYVYI_RIH_2019_2024_R02.tif
    ARTICLE4_FINAL_CHANGE_NO2_AOI_KRYVYI_RIH_2019_2024_R02.tif
    ARTICLE4_FINAL_HOTSPOT_PERSISTENCE_CO_AOI_KRYVYI_RIH_2019_2024_R02.tif
    ARTICLE4_FINAL_HOTSPOT_PERSISTENCE_NO2_AOI_KRYVYI_RIH_2019_2024_R02.tif
    ARTICLE4_FINAL_SO2_JJA_AOI_KRYVYI_RIH_2024_R02.tif
    ARTICLE4_FINAL_SO2_MAM_AOI_KRYVYI_RIH_2024_R02.tif
    README.md

  publication_rgb/
    ARTICLE4_PUBLICATION_RGB_CO_ANNUAL_2019_R02.tif
    ARTICLE4_PUBLICATION_RGB_CO_ANNUAL_2024_R02.tif
    ARTICLE4_PUBLICATION_RGB_CO_CHANGE_2019_2024_R02.tif
    ARTICLE4_PUBLICATION_RGB_NO2_ANNUAL_2019_R02.tif
    ARTICLE4_PUBLICATION_RGB_NO2_ANNUAL_2024_R02.tif
    ARTICLE4_PUBLICATION_RGB_NO2_CHANGE_2019_2024_R02.tif
    ARTICLE4_PUBLICATION_RGB_SO2_JJA_2024_R02.tif
    ARTICLE4_PUBLICATION_RGB_SO2_MAM_2024_R02.tif
    README.md

validation/
  README.md
  critical_audit_decision_summary.txt
  pixel_completeness_persistence_audit_summary.txt
  sensitivity_analysis_audit_summary.txt
  sentinel5p_aoi_reduction_sample_count_diagnostic_summary.txt
  sentinel5p_processor_version_audit_summary.txt
  sentinel5p_spatial_support_provenance_audit_summary.txt
  so2_missing_month_root_cause_audit_summary.txt
  so2_scale_sensitivity_audit_summary.txt

docs/
  GITHUB_PREPUBLICATION_CHECKLIST.md
  PUBLIC_RELEASE_AUDIT.md

CITATION.cff
README.md
RIGHTS.md
SHA256SUMS.txt
.gitignore
```

## Processing architecture

The final version relationships are:

- software release: `v1.1.1`;
- Master script: `ARTICLE4_MASTER_MONITORING_SYSTEM_V1_1_1_CORRECTIVE_RELEASE`;
- verified Stage-1 engine: `ARTICLE4_MULTIPOLLUTANT_ENGINE_V4_1_STAGE1_VERIFIED_R04`;
- Stage-2A monthly AOI materializations: `ARTICLE4_STAGE2A_YEAR_MATERIALIZATION_R03_CORRECTIVE`;
- Stage-2B publication tables: `ARTICLE4_STAGE2B_PUBLICATION_TABLES_R03_CORRECTIVE`;
- verified Stage-2C scientific spatial assets: `ARTICLE4_STAGE2C_SPATIAL_PRODUCTS_ENGINE_R01_VERIFIED`;
- final Stage-2D publication exports: `ARTICLE4_STAGE2D_PUBLICATION_EXPORTS_ENGINE_R02_CORRECTIVE`.

The different `R01`, `R02`, and `R03` identifiers describe versions of different processing or publication stages and must not be treated as interchangeable.

## Data organization

- `data/tables/` contains final publication tables and acceptance summaries.
- `data/figure_data/` contains machine-readable data supporting selected publication figures and the complete SO₂ season-candidate assessment.
- `data/manifests/` contains product inventories, provenance records, and publication-selection manifests.
- `data/rasters/` contains numerical scientific GeoTIFF products.
- `data/publication_rgb/` contains rendered cartographic RGB GeoTIFFs intended for visualization only.

Publication RGB products must not be used as substitutes for the numerical scientific rasters or machine-readable tabular values.

## Reproducibility and AOI

The publication analysis used the following Google Earth Engine AOI asset:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

The source asset contained eight polygon features, which were dissolved into a single analysis geometry. The verified publication-run AOI area is `441.4874046016281 km²`.

The asset path belongs to the publication processing environment and should not be assumed to be accessible from another Earth Engine account. AOI provenance and reconstruction guidance are provided in `data/README_AOI.md`.

The Master workflow is stored in:

`code/kryvyi_rih_s5p_coverage_aware_workflow.js`

The frozen processing configuration is recorded in:

`metadata/run_params.json`

## Validation and provenance

The `validation/` directory contains the archived evidence supporting the principal corrective-release decisions, including:

- processor-version provenance;
- monthly and multi-year completeness checks;
- SO₂ missing-month root-cause analysis;
- temporal-support sensitivity analysis;
- SO₂ AOI reduction-scale sensitivity analysis;
- the 698-versus-528 AOI sample-count diagnostic;
- annual, endpoint-change, and hotspot-persistence spatial-support provenance.

The audit scripts are stored separately in `code/`. These scripts are diagnostic and do not silently modify source assets or scientific publication products.

## Scientific interpretation limitations

The archived values represent Sentinel-5P/TROPOMI satellite vertical-column quantities and derived products. They must not be interpreted as directly equivalent to regulatory near-surface concentrations such as µg m⁻³ or mg m⁻³.

The workflow does not perform:

- conversion of satellite columns to regulatory ground-level concentrations;
- source-emission inversion;
- causal attribution to individual industrial facilities;
- exposure or health-risk assessment.

Endpoint differences and spatial hotspot persistence describe patterns within the analysed satellite products. They do not independently establish their causes.

## Integrity verification

Repository files are accompanied by cryptographic checksums in `SHA256SUMS.txt`.

For release `v1.1.1`, this checksum file must be generated only after all final `R02` CSV, scientific GeoTIFF, RGB GeoTIFF, documentation, code, metadata, and validation files have been added to the release snapshot.

## Rights and reuse

Copyright © 2026 Ruslan Chernysh. All rights reserved.

The repository is publicly accessible for scientific transparency, scholarly review, methodological inspection, and citation. Public accessibility does not constitute an open-source or unrestricted-reuse license.

Reuse, copying, modification, adaptation, redistribution, incorporation into other datasets or workflows, and commercial use require prior written permission, except where otherwise permitted by applicable law.

See `RIGHTS.md` for the complete rights and reuse policy.

## Citation

Cite the archived corrective software release as:

Chernysh, R. V. (2026). *Coverage-aware Sentinel-5P workflow for atmospheric monitoring in Kryvyi Rih* (Version v1.1.1) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.22534101

The version-specific DOI above identifies the exact archived `v1.1.1` release.

For a DOI that always resolves to the latest Zenodo version, use:

https://doi.org/10.5281/zenodo.22071246

After the `v1.1.1` Zenodo record is published, the DOI badge, archived-release status, citation text, and `CITATION.cff` should be updated to the new version-specific DOI.
