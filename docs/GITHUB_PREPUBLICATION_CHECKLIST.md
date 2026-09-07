# GitHub pre-release audit checklist

## Scope

This checklist documents the completed pre-release quality-control and archival status of the publication-supporting reproducibility package for the Kryvyi Rih Sentinel-5P study.

Release history:

- initial archived release: `v1.0.0` — DOI `10.5281/zenodo.22071247`;
- expanded reproducibility release: `v1.1.0` — DOI `10.5281/zenodo.22533826`;
- current corrective reproducibility release: `v1.1.1` — DOI `10.5281/zenodo.22534101`.

GitHub release `v1.1.1` and its corresponding Zenodo record were successfully published.

Version-specific DOI:

https://doi.org/10.5281/zenodo.22534101

## Corrective-release scope

Archived release `v1.1.1` incorporates:

- refreshed Stage-2A `R03` monthly AOI materializations;
- refreshed Stage-2B `R03` publication tables;
- verified Stage-2C `R01` scientific annual assets;
- refreshed Stage-2D `R02` publication exports;
- corrected AOI raster-cell-count provenance;
- exact-grid scientific GeoTIFF exports;
- expanded diagnostic, sensitivity, and provenance records;
- separate publication-rendered RGB products.

## Code and processing

- [x] `code/kryvyi_rih_s5p_coverage_aware_workflow.js` contains the final `v1.1.1` corrective Master workflow.
- [x] The Master processing logic is separated from independent diagnostic and validation scripts.
- [x] Internal `ARTICLE4_*` identifiers are retained as processing-provenance identifiers.
- [x] `metadata/run_params.json` records release `v1.1.1` and the correct Stage-2A/2B/2C/2D version relationships.
- [x] `metadata/data_dictionary.csv` documents the principal exported data fields.
- [x] Missing or invalid monthly values remain NA/null/masked and are not intentionally replaced with zero in the scientific workflow.
- [x] Strict calendar-completeness rules are documented for seasonal, annual, endpoint-change, and persistence products.
- [x] The predefined 7000 m SO₂ AOI reduction scale is described as sensitivity-evaluated, not empirically optimized.
- [x] Scientific persistence exports use the verified exact CRS and affine transform rather than an independently imposed export scale.

## Independent audit scripts

The repository contains separate scripts for:

- processor-version provenance;
- pixel completeness and hotspot persistence;
- temporal-support threshold sensitivity;
- SO₂ missing-month root-cause assessment;
- SO₂ AOI reduction-scale sensitivity;
- AOI reduction sample-count diagnosis;
- annual, endpoint-change, and persistence spatial-support provenance.

These scripts are maintained separately from the Master workflow and do not silently redefine or modify the scientific processing logic.

## Validation package

The `validation/` directory contains corresponding summaries for:

- critical audit decisions;
- pixel completeness and persistence;
- sensitivity analysis;
- processor-version provenance;
- SO₂ missing-month root cause;
- SO₂ scale sensitivity;
- the historical 698-versus-528 sample-count discrepancy;
- spatial-support and export-grid provenance.

Verified principal conclusions include:

- the standalone unweighted AOI raster-cell count is 528 for the applicable approximately 0.01-degree grid;
- 698 must not be interpreted as a standalone count of valid raster cells;
- no duplicate pollutant-month keys were found in the 216-row Stage-2A audit collection;
- unavailable SO₂ months had source records but zero valid AOI pixels after the native Earth Engine L3 mask;
- unavailable SO₂ values remain missing and are not silently interpolated;
- the qualitative SO₂ relationship `MAM > JJA` remained stable across the tested zonal-reduction scales;
- strict common-completeness masking did not remove the nine NO₂ 6/6 persistent-hotspot cells;
- CO retained zero 6/6 persistent-hotspot cells.

## Publication-supporting data

The archived `v1.1.1` package contains:

- 14 CSV publication exports;
- 10 numerical scientific GeoTIFF exports;
- 8 publication-rendered RGB GeoTIFF exports.

Repository organization:

- `data/tables/` — analytical, quality-control, summary, and acceptance tables;
- `data/figure_data/` — figure-supporting numerical data and complete SO₂ season candidates;
- `data/manifests/` — provenance and publication-selection manifests;
- `data/rasters/` — numerical scientific GeoTIFF products;
- `data/publication_rgb/` — rendered RGB visualization products.

Scientific GeoTIFFs and RGB products remain separate. RGB files are visualization products and must not be used as substitutes for numerical scientific rasters.

## AOI provenance

AOI provenance is documented in `data/README_AOI.md`.

The publication run used:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

Recorded provenance:

- AOI identifier: `AOI_KRYVYI_RIH`;
- source feature count before dissolve: 8;
- geometry after dissolve: `Polygon`;
- area: `441.4874046016281 km²`.

The asset path is a scientific provenance identifier, not an authentication credential. An independently reconstructed boundary must not be assumed to be coordinate-for-coordinate identical to the publication asset.

## Repository integrity and security

- [x] No open-source software license is intentionally granted.
- [x] Rights and reuse conditions are documented in `RIGHTS.md`.
- [x] The Zenodo record uses the custom rights statement `All Rights Reserved — Permission Required for Reuse`.
- [x] Public Earth Engine project and asset paths are retained only as provenance identifiers.
- [x] No API keys, private keys, access tokens, passwords, or other credentials were identified in the audited release package.
- [x] No unintended personal, temporary, editor, or local archive files were identified in the audited release package.
- [x] `.gitignore` permits the intended scientific and RGB GeoTIFFs while excluding unintended exports.
- [x] Every file listed in the repository README was checked against the physical release-package structure.
- [x] Superseded `R01` publication exports replaced by `R02` outputs were removed; retained `R01` identifiers refer only to the verified Stage-2C processing version where scientifically applicable.
- [x] All JavaScript files passed syntax validation.
- [x] The JSON and Citation File Format metadata files passed structural validation.
- [x] The release checksum manifest was regenerated and successfully verified before archival.

## Citation and archival status

The current archived corrective release is `v1.1.1`:

https://doi.org/10.5281/zenodo.22534101

The preceding archived release `v1.1.0` remains available at:

https://doi.org/10.5281/zenodo.22533826

The concept DOI representing all versions and resolving to the latest Zenodo version is:

https://doi.org/10.5281/zenodo.22071246

The GitHub tag `v1.1.1` identifies the exact source snapshot archived by Zenodo. Post-release documentation changes made on `main` do not retrospectively modify that archived tag or Zenodo record.

## Final pre-release and archival actions

- [x] Confirm that all 32 Google Earth Engine export tasks completed successfully.
- [x] Validate all 14 CSV files, including headers, row counts, missing-value semantics, and duplicate keys.
- [x] Validate all 10 scientific GeoTIFF files, including bands, CRS, affine transform, dimensions, masks, and NoData handling.
- [x] Validate all 8 RGB GeoTIFF files and confirm that they are stored separately from scientific rasters.
- [x] Remove superseded `R01` publication-output files replaced by `R02` outputs.
- [x] Confirm that all subdirectory README files match the final physical contents.
- [x] Confirm final repository structure and filenames against the root `README.md`.
- [x] Complete the final secret and unintended-file review.
- [x] Regenerate `SHA256SUMS.txt` from the finalized package.
- [x] Verify every checksum successfully.
- [x] Commit the finalized repository state.
- [x] Create Git tag and GitHub Release `v1.1.1` from that exact commit.
- [x] Archive the release in Zenodo and verify its files and metadata.
- [x] Record the version-specific DOI `10.5281/zenodo.22534101` and release date.
- [x] Verify the Zenodo rights statement and recommended citation.
- [ ] Complete all post-release DOI-reference updates on `main`.
- [ ] Synchronize the manuscript Data and Code Availability statement with the final archived release.

## Post-release actions on `main`

- [ ] Update the root `README.md` DOI badge, archived-release wording, and citation to `v1.1.1`.
- [ ] Add DOI `10.5281/zenodo.22534101` and release date `2026-09-07` to `CITATION.cff`.
- [ ] Update `docs/PUBLIC_RELEASE_AUDIT.md` from pre-release to archived status.
- [ ] Update `validation/critical_audit_decision_summary.txt` with the verified `v1.1.1` DOI.
- [ ] Replace the remaining phrase `release candidate v1.1.1` in `data/publication_rgb/README.md` with `archived software release v1.1.1`.
- [ ] Regenerate and verify `SHA256SUMS.txt` after all post-release documentation changes on `main` are complete.

These post-release commits update the live repository documentation but do not alter the immutable GitHub tag or Zenodo archive for `v1.1.1`.

## Status

GitHub release `v1.1.1` and the corresponding Zenodo archive were successfully published.

Version-specific DOI:

https://doi.org/10.5281/zenodo.22534101

The corrective reproducibility package is in **published and archived status**. Only the post-release DOI synchronization of the live `main` branch and the corresponding manuscript wording remain to be completed.
