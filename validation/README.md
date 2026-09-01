# Validation and provenance files

This folder is reserved for external checks and source-provenance records that do not modify the scientific workflow.

Recommended archived files:

- `sentinel5p_processor_version_audit_2019_2024.txt` — structured transcription and interpretation of the complete Google Earth Engine metadata-audit results produced by `code/sentinel5p_processor_version_audit.js`.
- optional external-consistency tables comparing temporal changes with independent official ground-monitoring series.

Important: comparison of TROPOMI vertical columns (mol m^-2) with ground-level concentrations (e.g. µg m^-3 or mg m^-3) must not be treated as a direct equality or unit conversion. Such comparisons are suitable for temporal/directional consistency unless a dedicated collocation and validation design is implemented.
