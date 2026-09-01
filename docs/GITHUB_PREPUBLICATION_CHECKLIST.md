# GitHub release audit checklist

Release reviewed: `v1.0.0`  
Release date: 2026-08-23  
Version-specific DOI: [10.5281/zenodo.22071247](https://doi.org/10.5281/zenodo.22071247)  
Tagged source: [v1.0.0](https://github.com/RuslanChernysh/kryvyi-rih-s5p-coverage-aware-workflow/tree/v1.0.0)

## Completed checks

- [x] `code/kryvyi_rih_s5p_coverage_aware_workflow_v1.0.0.js` is included in the tagged release.
- [x] `code/sentinel5p_processor_version_audit.js` is included as a separate provenance-audit script.
- [x] `code/sentinel5p_offl_processor_version_audit.js` is included as a separate OFFL audit script.
- [x] `metadata/run_params.json` records the publication-run configuration.
- [x] `metadata/data_dictionary.csv` documents the exported publication-table fields.
- [x] AOI provenance is documented in `data/README_AOI.md`.
- [x] `CITATION.cff` contains the correct public repository URL.
- [x] The repository is intentionally published without an open-source software license.
- [x] Rights and reuse conditions are documented in `RIGHTS.md`.
- [x] No obvious credentials, private keys, API tokens, or unintended private files were identified during the public-release audit.
- [x] Large scientific GeoTIFFs are intentionally excluded from Git history.
- [x] Release tag `v1.0.0` was created and archived on Zenodo.
- [x] Files contained in the tagged `v1.0.0` release are covered by the SHA-256 checksum manifest archived with that release.

## Outstanding reproducibility item

- [x] Archive the complete structured results of the Google Earth Engine processor-version audit in the `validation/` directory.

## Release status

Release `v1.0.0` is the initial archived software release. Its source snapshot is permanently available through the version-specific Zenodo DOI:

[https://doi.org/10.5281/zenodo.22071247](https://doi.org/10.5281/zenodo.22071247)
