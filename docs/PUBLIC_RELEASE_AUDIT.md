# Public-release audit

## Purpose

This document records the public-release and reproducibility considerations for the Kryvyi Rih Sentinel-5P scientific workflow and its associated publication-supporting package.

The initial archived software release was `v1.0.0`.

The current repository `main` branch has subsequently been expanded with independent audit scripts, validation summaries, machine-readable tabular outputs, publication manifests, figure-supporting data, and selected scientific GeoTIFF products.

## Scientific Master policy

The principal scientific processing implementation is stored in:

`code/kryvyi_rih_s5p_coverage_aware_workflow.js`

Independent diagnostic scripts are maintained separately from the Master.

This separation is intentional: validation, provenance, sensitivity, and methodological audits should be inspectable without silently redefining the scientific processing logic that generated the publication outputs.

Internal `ARTICLE4_*` identifiers are intentionally retained where they provide development and publication provenance.

They should not be interpreted as public software-version identifiers.

## Independent diagnostic code

The repository contains separate scripts for:

- processor-version provenance;
- pixel-level completeness and hotspot persistence;
- threshold sensitivity analysis;
- SO2 missing-month root-cause assessment;
- SO2 spatial reduction-scale sensitivity.

Corresponding archived summaries are stored under `validation/`.

These diagnostic scripts are intended to test methodological assumptions and document robustness; they are not replacements for the scientific Master workflow.

## Public identifiers present in the code

The source code contains Google Earth Engine project and asset paths under:

`projects/ee-ruslan777chernysh/assets`

These paths are retained as scientific provenance identifiers and are not credentials.

The publication AOI asset is:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

Independent users may need to replace project-specific asset and export destinations with paths available in their own Earth Engine environment.

AOI provenance and reconstruction limitations are documented separately in:

`data/README_AOI.md`

## Security and unintended-information review

The public-release preparation process should verify that the repository does not unintentionally contain:

- passwords;
- private keys;
- API secrets;
- access tokens;
- authentication credentials;
- unintended personal files;
- temporary working files;
- private datasets not intended for publication.

Earth Engine asset paths used as scientific provenance should not be confused with authentication credentials.

Automated or manual pattern checks reduce the risk of unintended disclosure but do not constitute an absolute security guarantee.

## Export tasks

The Master workflow may create multiple Google Earth Engine export tasks when the relevant publication-export switches are enabled.

Re-running every export is not required merely to inspect or audit the source code.

Users should review the configuration and export switches before execution to avoid unnecessary or duplicate Drive/Asset outputs.

## Publication-supporting data separation

The repository separates scientific processing code from publication-supporting outputs.

### Source and audit code

Stored under:

`code/`

### Processing metadata

Stored under:

`metadata/`

### Independent validation records

Stored under:

`validation/`

### Analytical and quality-control tables

Stored under:

`data/tables/`

### Figure-supporting numerical data

Stored under:

`data/figure_data/`

### Publication and provenance manifests

Stored under:

`data/manifests/`

### Selected scientific GeoTIFFs

Stored under:

`data/rasters/`

This organization preserves traceability while distinguishing executable scientific processing, diagnostic validation, tabular results, spatial products, and publication-supporting materials.

## Scientific versus display products

Scientific GeoTIFF products archived under `data/rasters/` are maintained separately from RGB/display-only visualization products.

Rendered RGB products must not be treated as substitutes for the underlying scientific numerical rasters.

The current reproducibility package intentionally includes selected scientific GeoTIFF products required to inspect the reported spatial analyses.

## Missing-data integrity

Missing or invalid observations are treated according to the scientific workflow's masking and completeness logic.

Publication-supporting materials must not redefine missing satellite observations as zero pollutant values.

The validation package documents additional checks concerning pixel completeness, hotspot persistence, threshold sensitivity, SO2 temporal availability, and SO2 reduction-scale sensitivity.

## Rights and reuse

The repository is intentionally made publicly accessible without granting an open-source software license.

Rights and reuse conditions are defined in:

`RIGHTS.md`

Public accessibility supports scientific transparency, methodological inspection, scholarly discussion, linking, and citation.

Reuse beyond the permissions described in `RIGHTS.md` may require prior written permission from the copyright holder.

## Version and archival integrity

The existing Zenodo version-specific DOI:

`10.5281/zenodo.22071247`

identifies archived software release `v1.0.0`.

The expanded current `main` branch should not be described as already archived under that version-specific DOI unless and until a new archival release containing the expanded package is created.

Before the next release:

1. finalize repository contents;
2. finalize release-sensitive metadata;
3. regenerate the SHA-256 checksum manifest;
4. verify repository integrity;
5. create the GitHub release from the finalized commit;
6. archive the release in Zenodo;
7. verify the resulting archival metadata and DOI.

Only after those steps should the manuscript state that the expanded reproducibility package is archived in the corresponding Zenodo release.

## Current status

The scientific Master, diagnostic scripts, validation records, machine-readable supporting data, manifests, and selected scientific spatial products are assembled in the repository.

The package remains in **pre-release preparation status** until final version metadata, checksums, GitHub release, and Zenodo archival are completed.
