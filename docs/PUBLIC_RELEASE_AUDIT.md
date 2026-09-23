# Public-release audit
## v1.1.2 integrity-only patch

This release corrects the publication-package filename and SHA256 checksum-manifest integrity issues identified in v1.1.1. No Google Earth Engine processing, numerical table, scientific GeoTIFF, RGB product, figure-supporting data, or scientific conclusion changed.

## Purpose

This document records the public-release, integrity, and reproducibility considerations for the Kryvyi Rih Sentinel-5P scientific workflow and its publication-supporting package.

Release history:

- `v1.0.0` — initial archived release, DOI `10.5281/zenodo.22071247`;
- `v1.1.0` — expanded reproducibility release, DOI `10.5281/zenodo.22533826`;
- `v1.1.1` — corrective reproducibility release, DOI `10.5281/zenodo.22534101`.
- `v1.1.2` — integrity-only corrective release, DOI `10.5281/zenodo.22917199`.

Release `v1.1.1` corrected AOI sample-count provenance, refreshed the publication outputs, expanded validation documentation, and clarified scientific raster export provenance.

## Scientific Master policy

The principal processing implementation is stored in:

`code/kryvyi_rih_s5p_coverage_aware_workflow.js`

The final version relationships are:

- Master: `ARTICLE4_MASTER_MONITORING_SYSTEM_V1_1_1_CORRECTIVE_RELEASE`;
- verified Stage-1 engine: `ARTICLE4_MULTIPOLLUTANT_ENGINE_V4_1_STAGE1_VERIFIED_R04`;
- Stage-2A monthly materializations: `ARTICLE4_STAGE2A_YEAR_MATERIALIZATION_R03_CORRECTIVE`;
- Stage-2B publication tables: `ARTICLE4_STAGE2B_PUBLICATION_TABLES_R03_CORRECTIVE`;
- verified Stage-2C scientific assets: `ARTICLE4_STAGE2C_SPATIAL_PRODUCTS_ENGINE_R01_VERIFIED`;
- Stage-2D publication exports: `ARTICLE4_STAGE2D_PUBLICATION_EXPORTS_ENGINE_R02_CORRECTIVE`.

Independent diagnostic scripts are maintained separately from the Master. This makes validation, provenance, and sensitivity tests inspectable without silently redefining the processing logic used to produce the publication outputs.

Internal `ARTICLE4_*` identifiers are processing-provenance identifiers and must not be confused with public semantic release numbers.

## Independent diagnostic code

The repository contains separate scripts for:

- processor-version provenance;
- pixel completeness and hotspot persistence;
- temporal-support threshold sensitivity;
- SO₂ missing-month root-cause assessment;
- SO₂ AOI reduction-scale sensitivity;
- the historical AOI sample-count discrepancy;
- annual, endpoint-change, and persistence spatial-support provenance.

Corresponding summaries are stored under `validation/`.

These scripts document methodological assumptions and robustness. They do not replace the Master workflow and do not silently modify publication assets or outputs.

## Verified corrective-release findings

The completed audits support the following conclusions:

1. The standalone unweighted AOI raster-cell count is 528 for the applicable approximately 0.01-degree grid.
2. The historical value 698 arose from a combined mean-and-count reduction and must not be interpreted as the number of valid raster cells.
3. The complete Stage-2A sensitivity-audit collection contains 216 pollutant-month rows with no duplicate pollutant-month keys.
4. Eighteen recurrent SO₂ monthly AOI results were unavailable because the native Earth Engine L3 mask left zero valid AOI pixels, not because source collection records or Stage-2A rows were absent.
5. Missing SO₂ results remain NA/null and are not silently interpolated or converted to zero.
6. The qualitative 2024 SO₂ relationship `MAM > JJA` remained stable across the tested AOI zonal-reduction scales of 1113.2, 3500, 5500, and 7000 m.
7. The predefined 7000 m SO₂ AOI reduction scale is sensitivity-evaluated and must not be described as empirically optimal or as the native Sentinel-5P spatial resolution.
8. Strict common 12/12 pixel completeness did not remove the nine NO₂ cells classified as 6/6 persistent hotspots.
9. CO retained zero 6/6 persistent-hotspot cells.
10. Final scientific persistence exports preserve the exact verified raster-grid CRS and affine transform.

## Public identifiers in the code

The source code contains Google Earth Engine project and asset paths under:

`projects/ee-ruslan777chernysh/assets`

These paths are retained as scientific provenance identifiers and are not credentials.

The publication AOI asset is:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

Independent users may need to replace project-specific asset and export destinations with paths available in their own Earth Engine environment.

AOI provenance and reconstruction limitations are documented in `data/README_AOI.md`.

## Security and unintended-information review

Before release, the repository must be checked for unintended inclusion of:

- passwords;
- private keys;
- API secrets;
- access tokens;
- authentication credentials;
- unintended personal files;
- temporary working files;
- editor or operating-system files;
- local archives;
- private datasets not intended for publication.

Earth Engine asset paths retained for scientific provenance must not be confused with authentication credentials.

Pattern-based checks reduce the risk of unintended disclosure but do not provide an absolute security guarantee.

## Export tasks

The final Master publication-export configuration creates 32 Google Earth Engine Drive tasks:

- 14 CSV publication exports;
- 10 numerical scientific GeoTIFF exports;
- 8 rendered RGB GeoTIFF exports.

Users should review the Master configuration and task switches before execution to avoid duplicate or unintended exports.

Re-running exports is not required merely to inspect the code. For release preparation, however, every archived output must be traced to a successfully completed task and validated before inclusion.

## Publication-supporting data separation

The repository separates executable code from publication-supporting outputs:

- `code/` — Master and independent audit scripts;
- `metadata/` — frozen processing configuration and data dictionary;
- `validation/` — diagnostic, sensitivity, and provenance records;
- `data/tables/` — analytical, quality-control, summary, and acceptance tables;
- `data/figure_data/` — figure-supporting data and complete SO₂ season candidates;
- `data/manifests/` — provenance and publication-selection manifests;
- `data/rasters/` — numerical scientific GeoTIFF products;
- `data/publication_rgb/` — rendered RGB visualization products.

This organization preserves traceability while distinguishing processing code, validation evidence, tabular results, scientific spatial products, and visualization outputs.

## Scientific versus display products

Scientific GeoTIFFs under `data/rasters/` preserve numerical scientific values.

Rendered RGB GeoTIFFs under `data/publication_rgb/` are cartographic display products. Their rendering density must not be interpreted as Sentinel-5P spatial resolution, and their RGB values must not be used to reconstruct or replace the underlying scientific data.

The final RGB export workflow uses the scientific rasters with visualization operations and does not introduce bilinear or bicubic scientific interpolation.

## Missing-data integrity

Missing or invalid observations are handled through masking, null values, and completeness rules.

Publication-supporting files must not redefine missing satellite observations as zero pollutant values. This is particularly important for the 18 recurrent unavailable SO₂ months identified by the root-cause audit.

## Rights and reuse

The repository is publicly accessible without granting an open-source software license.

Rights and reuse conditions are defined in `RIGHTS.md`.

Public accessibility supports scientific transparency, methodological inspection, scholarly discussion, linking, and citation. Reuse beyond the permissions described in `RIGHTS.md` may require prior written permission from the copyright holder.

## Version and archival integrity

DOI `10.5281/zenodo.22533826` identifies archived release `v1.1.0`.

Release `v1.1.1` was archived under DOI `10.5281/zenodo.22534101`.

Release `v1.1.2` is the current archived integrity-only corrective package, published under DOI `10.5281/zenodo.22917199`. It corrects the publication-package filename and SHA256 checksum-manifest integrity issue identified in `v1.1.1`; it does not modify Google Earth Engine processing, scientific code, R02 numerical tables, scientific GeoTIFFs, RGB products, figure-supporting data, results, or conclusions.

For a future scientific-output release:

1. complete and validate all required publication exports;
2. ensure all README files match the physical repository contents;
3. complete the security and unintended-file review;
4. regenerate and verify `SHA256SUMS.txt`;
5. commit the exact finalized state;
6. create a new version-specific Git tag and GitHub Release from that commit;
7. archive that release in Zenodo;
8. verify the archived files, metadata, version, rights statement, and DOI.

Only after these steps should the manuscript state that the corresponding package is archived.

## Post-archival updates

After Zenodo published the `v1.1.2` record:

- the root README DOI badge and archived-release wording on `main` were updated;
- the verified DOI and release date were added to `CITATION.cff`;
- the Zenodo version DOI is `10.5281/zenodo.22917199`;
- the manuscript Data and Code Availability statement should be updated before the next submission or revision;
- the files contained in the already archived Git tag must not be changed retrospectively without creating a subsequent version.

## Current status

The scientific Master, audit scripts, validation records, metadata, publication-supporting tables, scientific GeoTIFFs, publication-rendered RGB products, and repository documentation are archived in GitHub release `v1.1.2`.

The corresponding Zenodo record was published successfully:

https://doi.org/10.5281/zenodo.22917199

Release `v1.1.2` is the current archived integrity-only corrective package. It corrects the publication-package filename and SHA256 checksum-manifest integrity issue and does not re-run, replace, or alter the scientific workflow outputs.

Release `v1.1.1` is the current archived corrective reproducibility package.
Release `v1.1.2` is an integrity-only package correction in preparation; it does not re-run or replace the scientific workflow outputs.
