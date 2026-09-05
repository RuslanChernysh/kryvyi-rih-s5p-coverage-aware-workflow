# Validation and provenance files

This directory contains post-release validation, diagnostic, sensitivity, and provenance records supporting the scientific workflow.

The files in this directory document independent checks performed without modifying the Master scientific workflow, source assets, Stage-2A assets, or publication outputs.

## Archived validation records

- `sentinel5p_processor_version_audit_summary.txt`  
  Summary of the Sentinel-5P OFFL source-metadata audit for NO2, CO, and SO2 over 2019-2024, including processor, algorithm, and HARP version provenance.

- `pixel_completeness_persistence_audit_summary.txt`  
  Summary of the pixel-completeness and multi-year hotspot-persistence audit for NO2 and CO, including annual-result availability, 12/12-month completeness, and strict versus original-like persistence diagnostics.

- `so2_missing_month_root_cause_audit_summary.txt`  
  Summary of the SO2 missing-month root-cause audit, tracing unavailable/NA monthly results through source availability, valid observations, AOI-level support, and Stage-2A materialization.

- `sensitivity_analysis_audit_summary.txt`  
  Summary of diagnostic sensitivity analyses for temporal-support thresholds. These scenarios are validation checks only and do not replace the acceptance rules used by the Master workflow.

- `so2_scale_sensitivity_audit_summary.txt`  
  Summary of the SO2 AOI zonal-reduction scale sensitivity audit across the tested spatial scales. The audit evaluates numerical stability without changing the native Sentinel-5P L3 raster support or the Master workflow.

- `critical_audit_decision_summary.txt`  
  Consolidated record of methodological decisions derived from the critical post-release audits and their implications for interpretation and reporting.

## Corresponding audit scripts

The executable Google Earth Engine audit scripts are archived separately in the repository `code/` directory. Validation summaries in this directory should be interpreted together with their corresponding scripts.

These audits are read-only diagnostic and provenance checks. They do not retroactively modify the scientific workflow or previously generated publication products.

## Interpretation note

Sentinel-5P/TROPOMI vertical column quantities (mol m^-2) must not be treated as directly equivalent to ground-level concentrations (for example, µg m^-3 or mg m^-3). Comparisons with independent ground-monitoring observations require an appropriate collocation and validation design and, without such a design, should be limited to suitable temporal or directional consistency assessments.
