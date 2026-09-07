# Figure-supporting data

This directory contains the machine-readable tabular data supporting selected figures in the Kryvyi Rih Sentinel-5P study for 2019–2024.

The files are corrective-release `R02` outputs generated for software release `v1.1.1`. They supersede the corresponding `R01` figure-supporting files previously included in the repository.

These files preserve the numerical basis of the publication visualizations and provide traceability between the scientific workflow, quality-control decisions, reported results, and figures.

## Files

### `ARTICLE4_FIG3_TIME_SERIES_DATA_2019_2024_R02.csv`

Machine-readable source data supporting Figure 3.

This file contains the monthly time-series values used to represent the temporal evolution of the analysed Sentinel-5P atmospheric-pollutant products over the Kryvyi Rih area of interest during 2019–2024.

The file preserves:

- pollutant and calendar-month identifiers;
- monthly AOI-level values;
- data-availability information;
- applicable temporal-support and quality-control fields;
- missing values retained by the scientific workflow.

The dataset must be interpreted using the pollutant-specific processing rules documented in the Master workflow and methodological metadata.

Unavailable SO2 monthly results remain missing and are not replaced with zero.

---

### `ARTICLE4_FIG7_AVAILABILITY_DATA_2019_2024_R02.csv`

Machine-readable source data supporting Figure 7.

This file contains the data-availability, coverage, and temporal-support information used to construct the corresponding publication visualization.

It documents differences in observational support among the NO2, CO, and SO2 processing branches during 2019–2024.

The file supports inspection of:

- monthly source availability;
- pollutant-specific temporal support;
- spatial coverage;
- accepted and unavailable months;
- completeness patterns across the study period.

The availability information must not be interpreted as atmospheric-pollutant concentration data. A missing or unavailable result does not represent a zero pollutant value.

---

### `ARTICLE4_SO2_COMPLETE_SEASON_CANDIDATES_2019_2024_R02.csv`

Complete set of quality-controlled SO2 seasonal candidates evaluated for the 2019–2024 study period.

This file records the seasonal periods assessed under the SO2-specific processing, availability, and strict calendar-completeness rules.

It preserves the evidence used to distinguish:

- complete seasonal candidates;
- incomplete or unavailable seasons;
- seasons eligible for scientific interpretation;
- seasons excluded because the required monthly support was not available.

The file documents the complete candidate-selection process and should be interpreted together with the selected Figure 6 dataset.

SO2 missing months remain missing. The workflow does not silently interpolate unavailable SO2 monthly values and does not convert them to zero.

---

### `ARTICLE4_FIG6_SO2_SELECTED_SEASONS_MAM_JJA_2024_R02.csv`

Machine-readable source data supporting Figure 6.

This file contains the selected complete SO2 seasonal results for 2024:

- MAM: March, April, and May 2024;
- JJA: June, July, and August 2024.

These seasons were selected from the complete-season candidates because both contained all three required monthly results under the applicable SO2 temporal-support and quality-control rules.

The file provides the numerical basis for comparing the selected MAM and JJA 2024 SO2 seasonal products.

The selection of these seasons does not imply that incomplete seasons were assigned zero values or reconstructed through temporal interpolation.

## SO2 scale interpretation

The SO2 AOI-level values were calculated using the predefined 7000 m zonal-reduction scale specified by the publication workflow.

This scale was evaluated through a dedicated sensitivity analysis across the following tested reduction scales:

- 1113.2 m;
- 3500 m;
- 5500 m;
- 7000 m.

The sensitivity audit confirmed that the qualitative relationship `MAM > JJA` remained stable across the tested scales.

The 7000 m scale must not be described as:

- an empirically optimized scale;
- the native Sentinel-5P/TROPOMI spatial resolution;
- a replacement for the native Earth Engine L3 raster support.

The corresponding validation record is available at:

`../../validation/so2_scale_sensitivity_audit_summary.txt`

## Corrective-release provenance

The `R02` designation identifies refreshed figure-supporting outputs generated for software release `v1.1.1`.

The corrective release retains the verified scientific processing architecture while incorporating the following provenance clarifications:

- Stage-2A monthly AOI materializations use corrective version `R03`;
- Stage-2B publication tables use corrective version `R03`;
- verified Stage-2C scientific annual assets remain version `R01`;
- final Stage-2D publication exports use corrective version `R02`;
- the verified standalone unweighted AOI raster-cell count is 528 for the applicable approximately 0.01-degree grid;
- the historical value 698 must not be interpreted as the number of valid raster cells;
- SO2 missing months remain missing and are never silently interpolated;
- the predefined 7000 m SO2 AOI reduction scale was evaluated through sensitivity analysis and was not selected as an optimal scale.

## Scope

The files in this directory are figure-supporting tabular products rather than independent raw satellite datasets.

They should be interpreted together with:

- the Master scientific workflow;
- methodological metadata;
- monthly quality-control tables;
- scientific raster products;
- publication manifests;
- validation and provenance records.

The files contain Sentinel-5P/TROPOMI satellite-column products and supporting quality-control information. Satellite vertical-column quantities must not be interpreted as directly equivalent to regulatory ground-level concentrations.

## Scientific versus rendered products

The CSV files in this directory preserve the numerical data underlying selected publication figures.

They are distinct from publication-rendered RGB GeoTIFFs, which are visualization products and must not be used as substitutes for numerical scientific rasters or tabular values.

The primary numerical scientific GeoTIFF products are stored in:

`../rasters/`

## Related repository materials

Publication tables:

`../tables/`

Scientific GeoTIFF products:

`../rasters/`

Publication and provenance manifests:

`../manifests/`

AOI provenance:

`../README_AOI.md`

Workflow and audit scripts:

`../../code/`

Validation and provenance records:

`../../validation/`

Processing metadata:

`../../metadata/`

## Reproducibility

Providing the numerical figure-supporting data separately from the rendered publication figures improves transparency and allows the visualizations and selection decisions to be independently inspected or reconstructed.

The files originate from, or are derived from, the same final publication workflow documented in this repository.

## Rights and reuse

Copyright © 2026 Ruslan Chernysh. All rights reserved.

Public availability of these files is provided for scientific transparency, scholarly review, methodological inspection, and citation. It does not constitute permission for unrestricted reuse.

Reuse, copying, modification, redistribution, incorporation into other datasets or workflows, and commercial use require prior written permission, except where otherwise permitted by applicable law.

See the repository-level `RIGHTS.md` for the complete rights and reuse policy.

For scholarly citation, use the citation information provided in the repository-level `CITATION.cff` and the associated archived software record.
