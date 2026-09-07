# GitHub pre-release audit checklist

## Scope

This checklist documents the pre-release quality-control status of the publication-supporting reproducibility package for the Kryvyi Rih Sentinel-5P study.

Release history:

- initial archived release: `v1.0.0` — DOI `10.5281/zenodo.22071247`;
- latest archived release: `v1.1.0` — DOI `10.5281/zenodo.22533826`;
- corrective release under preparation: `v1.1.1` — DOI not yet assigned.

The current `main` branch is being finalized as release candidate `v1.1.1`. It is not yet an archived `v1.1.1` release and must not be described as such until the corresponding GitHub release and Zenodo record are published.

Until then, DOI `10.5281/zenodo.22533826` identifies archived release `v1.1.0`.

## Corrective-release scope

Release candidate `v1.1.1` incorporates:

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

The final `v1.1.1` package is expected to contain:

- 14 CSV publication exports;
- 10 numerical scientific GeoTIFF exports;
- 8 publication-rendered RGB GeoTIFF exports.

Repository organization:

- `data/tables/` — analytical, quality-control, summary, and acceptance tables;
- `data/figure_data/` — figure-supporting numerical data and complete SO₂ season candidates;
- `data/manifests/` — provenance and publication-selection manifests;
- `data/rasters/` — numerical scientific GeoTIFF products;
- `data/publication_rgb/` — rendered RGB visualization products.

Scientific GeoTIFFs and RGB products must remain separate. RGB files are visualization products and must not be used as substitutes for numerical scientific rasters.

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
- [x] Public Earth Engine project and asset paths are retained only as provenance identifiers.
- [ ] Confirm that no API keys, private keys, access tokens, passwords, or other credentials are present.
- [ ] Confirm that no unintended personal, temporary, editor, or local archive files are present.
- [ ] Confirm that `.gitignore` permits intended scientific and RGB GeoTIFFs while excluding unintended exports.
- [ ] Confirm that every file listed in repository README documents physically exists with the exact listed name.
- [ ] Confirm that no superseded `R01` publication exports remain alongside their replacement `R02` files unless explicitly archived and documented.

## Citation and archival status

The latest archived release is currently `v1.1.0`:

https://doi.org/10.5281/zenodo.22533826

Release candidate `v1.1.1` does not yet have a version-specific DOI.

Before Zenodo archival:

- the new DOI must not be invented;
- the final release commit must not be recorded in advance;
- `README.md` must describe `v1.1.1` as a release candidate;
- `CITATION.cff` may identify version `1.1.1` without a DOI;
- `SHA256SUMS.txt` must be regenerated only after the complete package is finalized.

After Zenodo archival:

- record and verify the version-specific `v1.1.1` DOI;
- update the DOI badge and archived-release wording on the repository `main` branch;
- update `CITATION.cff` with the DOI and release date;
- update manuscript Data and Code Availability wording against the actual archive.

## Final pre-release actions

- [ ] Confirm that all 32 Google Earth Engine export tasks completed successfully.
- [ ] Validate all 14 CSV files, including headers, row counts, missing-value semantics, and duplicate keys.
- [ ] Validate all 10 scientific GeoTIFF files, including bands, CRS, affine transform, dimensions, masks, and NoData handling.
- [ ] Validate all 8 RGB GeoTIFF files and confirm that they are stored separately from scientific rasters.
- [ ] Remove superseded `R01` publication-output files replaced by `R02` outputs.
- [ ] Confirm that all subdirectory README files match the final physical contents.
- [ ] Confirm final repository structure and filenames against the root `README.md`.
- [ ] Complete the final secret and unintended-file review.
- [ ] Regenerate `SHA256SUMS.txt` from the finalized package.
- [ ] Verify every checksum successfully.
- [ ] Commit the finalized repository state.
- [ ] Create Git tag and GitHub Release `v1.1.1` from that exact commit.
- [ ] Archive the release in Zenodo and verify its files and metadata.
- [ ] Record the new DOI and release date.
- [ ] Update post-release DOI references on `main`.
- [ ] Synchronize the manuscript with the final archived outputs and validation evidence.

## Status

The scientific workflow and validation evidence are complete. The repository remains in **pre-release preparation status** until the final `R02` and RGB files are validated and uploaded, the checksum manifest is regenerated and verified, and GitHub/Zenodo archival is completed.
