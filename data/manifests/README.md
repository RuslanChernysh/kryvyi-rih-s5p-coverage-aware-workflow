# Publication data manifests

This directory contains the final manifest files documenting the selection, organization, provenance, and publication status of the spatial and figure-related products generated for the Kryvyi Rih Sentinel-5P study for 2019–2024.

The files are corrective-release `R02` outputs generated for software release `v1.1.1`. They supersede the corresponding `R01` manifests previously included in the repository.

These manifests connect the archived scientific workflow with the tabular results, scientific GeoTIFFs, figure-supporting data, and publication outputs included in the release.

## Files

### `ARTICLE4_FINAL_ANNUAL_SPATIAL_ASSET_MANIFEST_2019_2024_R02.csv`

Inventory of the verified annual Stage-2C spatial assets generated for the 2019–2024 study period.

The manifest records information concerning:

- pollutant;
- calendar year;
- Earth Engine asset identifier;
- asset version;
- available raster bands;
- expected and valid month counts;
- strict period completeness;
- hotspot-publication eligibility;
- role of each asset in the publication workflow.

The manifest refers to the verified Stage-2C scientific annual assets, which retain version `R01`. The `R02` suffix identifies the refreshed manifest exported by the Stage-2D corrective publication workflow; it does not rename or replace the underlying verified Stage-2C assets.

---

### `ARTICLE4_FINAL_SPATIAL_PRODUCT_MANIFEST_2019_2024_R02.csv`

Manifest of the final spatial products evaluated or selected for the `v1.1.1` publication package.

This file provides a structured record of:

- annual scientific raster products;
- endpoint-change products;
- hotspot-persistence products;
- selected SO2 seasonal products;
- publication eligibility;
- product role;
- scientific versus visualization status;
- corresponding source assets or derived products;
- output identifiers and version provenance.

The manifest supports traceability between the verified scientific processing outputs and the GeoTIFF files archived in the repository.

---

### `ARTICLE4_FINAL_FIGURE_MANIFEST_R02.csv`

Manifest of the figures and figure-related outputs prepared from the final publication workflow.

This file documents the relationship between:

- publication figure identifiers;
- figure-supporting CSV files;
- scientific raster sources;
- publication-rendered RGB products;
- temporal or spatial selection rules;
- output version identifiers;
- publication status.

The manifest distinguishes numerical scientific products from rendered visualization products.

Publication-rendered RGB files must not be used as substitutes for the original scientific rasters or machine-readable tabular values.

---

### `ARTICLE4_FINAL_MAIN_TEXT_EXPORT_SELECTION_MANIFEST_R02.csv`

Record of the outputs selected for use in the main manuscript and associated publication materials.

This manifest documents the selection decisions used to distinguish:

- outputs intended for the main manuscript;
- figure-supporting datasets;
- scientific raster products;
- supplementary or provenance materials;
- diagnostic products;
- outputs excluded from primary interpretation.

The file preserves the final publication-selection logic without modifying the underlying scientific results.

## Version relationships

The release uses different version identifiers for different processing and publication stages. These identifiers must not be treated as interchangeable.

The final version relationships are:

- software release: `v1.1.1`;
- Master script: `ARTICLE4_MASTER_MONITORING_SYSTEM_V1_1_1_CORRECTIVE_RELEASE`;
- verified Stage-1 engine: `ARTICLE4_MULTIPOLLUTANT_ENGINE_V4_1_STAGE1_VERIFIED_R04`;
- Stage-2A monthly AOI materializations: `ARTICLE4_STAGE2A_YEAR_MATERIALIZATION_R03_CORRECTIVE`;
- Stage-2B publication tables: `ARTICLE4_STAGE2B_PUBLICATION_TABLES_R03_CORRECTIVE`;
- verified Stage-2C scientific spatial assets: `ARTICLE4_STAGE2C_SPATIAL_PRODUCTS_ENGINE_R01_VERIFIED`;
- final Stage-2D publication exports: `ARTICLE4_STAGE2D_PUBLICATION_EXPORTS_ENGINE_R02_CORRECTIVE`.

The `R02` suffix in the filenames in this directory identifies the final corrective Stage-2D manifest exports. It does not mean that all source scientific assets were regenerated as Stage-2C `R02` assets.

## Corrective-release provenance

The `v1.1.1` corrective release preserves the verified scientific processing architecture and documents the following corrections and clarifications:

- Stage-2A monthly AOI materializations were refreshed as version `R03`;
- Stage-2B publication tables were refreshed as version `R03`;
- verified Stage-2C annual scientific assets remain version `R01`;
- Stage-2D publication tables, manifests, scientific GeoTIFFs, and publication-rendered products were refreshed as version `R02`;
- the verified standalone unweighted AOI raster-cell count is 528 for the applicable approximately 0.01-degree grid;
- the historical value 698 originated from a combined mean-and-count reduction and must not be interpreted as a standalone count of valid raster cells;
- SO2 missing monthly values remain missing and are not silently interpolated;
- the predefined 7000 m SO2 AOI reduction scale was evaluated through sensitivity analysis and was not selected as an optimal scale;
- scientific raster exports preserve the verified source-grid projection and transform;
- publication-rendered RGB products remain separate from the numerical scientific rasters.

## Reproducibility role

The manifests in this directory do not constitute additional scientific processing steps and do not modify the archived scientific results.

Their purpose is to preserve a transparent record of:

- which workflow outputs were generated;
- which source assets were used;
- which quality-control and completeness rules were applied;
- which products were considered eligible;
- which outputs were selected for publication;
- how the archived files correspond to the processing stages.

## Related repository materials

Corresponding publication tables:

`../tables/`

Figure-supporting data:

`../figure_data/`

Scientific GeoTIFF products:

`../rasters/`

AOI provenance:

`../README_AOI.md`

Workflow and audit scripts:

`../../code/`

Validation and provenance records:

`../../validation/`

Processing metadata:

`../../metadata/`

## Interpretation

Manifest entries describe provenance, eligibility, selection, and file relationships. They must not be interpreted as independent atmospheric measurements.

Scientific interpretation should be based on the corresponding numerical tables and scientific raster products, together with the documented quality-control and temporal-completeness rules.

Sentinel-5P/TROPOMI vertical-column quantities must not be treated as directly equivalent to regulatory ground-level pollutant concentrations.

Missing or unavailable observations must not be interpreted as zero values.

## Integrity verification

The manifests should be checked against the physical files included in the final repository snapshot.

Repository-level cryptographic checksums are provided in:

`../../SHA256SUMS.txt`

The checksum file must correspond to the finalized `v1.1.1` repository contents.

## Rights and reuse

Copyright © 2026 Ruslan Chernysh. All rights reserved.

Public availability of these manifest files is provided for scientific transparency, scholarly review, methodological inspection, and citation. It does not constitute permission for unrestricted reuse.

Reuse, copying, modification, redistribution, incorporation into other datasets or workflows, and commercial use require prior written permission, except where otherwise permitted by applicable law.

See the repository-level `RIGHTS.md` for the complete rights and reuse policy.

For scholarly citation, use the citation information provided in the repository-level `CITATION.cff` and the associated archived software record.
