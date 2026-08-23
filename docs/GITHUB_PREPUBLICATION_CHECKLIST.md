# GitHub repository pre-publication checklist

Before creating the first public release:

- [ ] `code/kryvyi_rih_s5p_coverage_aware_workflow_v1.0.0.js` matches the frozen Master.
- [ ] `code/sentinel5p_processor_version_audit.js` is included as a separate script.
- [ ] `metadata/run_params.json` matches the publication run.
- [ ] `metadata/data_dictionary.csv` opens correctly.
- [ ] AOI provenance is described in `data/README_AOI.md`.
- [ ] Full processor-audit Console output is saved in `validation/`.
- [ ] `CITATION.cff` repository URL is replaced after GitHub repository creation.
- [ ] A software license is intentionally selected (or the repository is knowingly published without one).
- [ ] No credentials, private keys, API tokens, or unintended private files are present.
- [ ] Large GeoTIFFs are kept out of Git history unless intentionally required.
- [ ] Repository is created first; release/tag `v1.0.0` is created only after the repository contents are final.
