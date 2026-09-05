# GitHub pre-release audit checklist

## Scope

This checklist documents the pre-release quality-control status of the current publication-supporting reproducibility package for the Kryvyi Rih Sentinel-5P study.

The initial archived software release is `v1.0.0` (2026-08-23):

https://doi.org/10.5281/zenodo.22071247

The current `main` branch has subsequently been expanded with independent audit scripts, validation records, machine-readable publication data, provenance manifests, and selected scientific GeoTIFF products.

Accordingly, the current `main` branch is not byte-identical to the archived `v1.0.0` release.

## Code and processing

- `code/kryvyi_rih_s5p_coverage_aware_workflow.js` contains the scientific Master workflow.
- The Master processing logic remains separated from independent diagnostic and validation scripts.
- Internal `ARTICLE4_*` identifiers are retained as provenance identifiers.
- `metadata/run_params.json` records the publication-run configuration.
- `metadata/data_dictionary.csv` documents the principal exported data fields.
- Missing or invalid monthly data remain NA/masked and are not intentionally replaced by zero in the scientific workflow.
- Strict calendar-completeness criteria are documented for downstream seasonal and annual products.

## Independent audit scripts

The repository contains separate diagnostic scripts for:

- processor-version provenance;
- pixel completeness and hotspot persistence;
- threshold sensitivity analysis;
- SO2 missing-month root-cause assessment;
- SO2 reduction-scale sensitivity assessment.

These scripts are maintained separately from the Master workflow and do not redefine the frozen scientific processing logic.

## Validation package

The `validation/` directory contains archived summaries for the completed methodological audits, including:

- critical audit decisions;
- pixel completeness and persistence;
- sensitivity analysis;
- processor-version provenance;
- SO2 missing-month root cause;
- SO2 scale sensitivity.

No previously identified critical audit item remains intentionally undocumented in the validation package.

## Publication-supporting data

The repository contains machine-readable publication-supporting outputs under `data/`.

### `data/tables/`

Contains principal analytical, quality-control, completeness, summary, and acceptance tables.

### `data/figure_data/`

Contains machine-readable numerical data supporting selected publication figures.

### `data/manifests/`

Contains provenance and publication-selection manifests.

### `data/rasters/`

Contains selected scientific GeoTIFF products supporting the reported spatial analyses.

These scientific GeoTIFFs are intentionally tracked as part of the current reproducibility package and are distinct from rendered RGB/display products.

## AOI provenance

AOI provenance is documented in:

`data/README_AOI.md`

The publication run used:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

Recorded publication-run provenance includes:

- AOI identifier: `AOI_KRYVYI_RIH`
- source feature count before dissolve: 8
- geometry after dissolve: Polygon
- area: 441.4874046016281 km²

The repository documents the exact publication asset provenance but does not claim that an independently reconstructed administrative boundary will be coordinate-for-coordinate identical to the original Earth Engine asset.

## Repository integrity and security

- No open-source software license is intentionally granted.
- Rights and reuse conditions are documented in `RIGHTS.md`.
- Public Earth Engine project/asset paths are retained as scientific provenance identifiers and are not treated as credentials.
- No obvious API keys, private-key blocks, access tokens, passwords, or other intentional credentials should be present in the public package.
- Temporary files, local archives, editor files, and unintended raster exports are excluded through `.gitignore`.
- Scientific GeoTIFFs under `data/rasters/` are explicitly permitted by `.gitignore`.

## Citation and archival status

The currently archived Zenodo software release remains `v1.0.0`:

https://doi.org/10.5281/zenodo.22071247

The current expanded `main` branch is being prepared for a subsequent archival release.

Until that release is created:

- `CITATION.cff` may continue to identify the existing archived `v1.0.0` release;
- the new release DOI must not be invented or assigned in advance;
- the final release commit must not be recorded in advance;
- the checksum manifest must be regenerated only after the release package contents are finalized.

## Final pre-release actions

Before creating the next GitHub release:

- [ ] confirm final repository structure;
- [ ] confirm that README files match actual directory contents;
- [ ] confirm final version number;
- [ ] update release-sensitive metadata;
- [ ] regenerate `SHA256SUMS.txt` from the finalized package;
- [ ] verify the checksum manifest;
- [ ] perform a final secret/unintended-file review;
- [ ] create the GitHub release from the finalized commit;
- [ ] archive the release in Zenodo;
- [ ] verify the resulting Zenodo metadata and DOI;
- [ ] update manuscript Data and Code Availability wording against the actual archived package.

## Status

The scientific workflow, independent validation materials, and publication-supporting data package are assembled.

The repository remains in **pre-release preparation status** until the final metadata, checksums, GitHub release, and Zenodo archival steps are completed.
