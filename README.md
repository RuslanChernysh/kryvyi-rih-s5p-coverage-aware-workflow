# Coverage-aware Sentinel-5P workflow for Kryvyi Rih

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22071247.svg)](https://doi.org/10.5281/zenodo.22071247)

Current software release: **v1.0.0**

This repository contains the frozen Google Earth Engine implementation used for the 2019–2024 Sentinel-5P/TROPOMI analysis of NO₂, CO and SO₂ over Kryvyi Rih, Ukraine.

The archived and citable snapshot of release `v1.0.0` is available on Zenodo: [https://doi.org/10.5281/zenodo.22071247](https://doi.org/10.5281/zenodo.22071247).

## Scientific purpose

The workflow implements pollutant-specific preprocessing and a common quality-control architecture in which spatial coverage, temporal support, missing-data handling and strict calendar completeness determine whether downstream seasonal, annual, endpoint-change and hotspot-persistence products are eligible for interpretation.

The repository is intended to support transparent reproduction and audit of the published workflow. It does **not** convert satellite vertical columns to regulatory near-surface concentrations and does **not** perform source-emission inversion.

## Repository contents

```text
code/
  kryvyi_rih_s5p_coverage_aware_workflow_v1.0.0.js
  sentinel5p_processor_version_audit.js
  sentinel5p_offl_processor_version_audit.js

metadata/
  run_params.json
  data_dictionary.csv

data/
  README_AOI.md

validation/
  README.md

docs/
  PUBLIC_RELEASE_AUDIT.md
  GITHUB_PREPUBLICATION_CHECKLIST.md

CITATION.cff
RIGHTS.md
SHA256SUMS.txt
.gitignore
README.md
```

## Source datasets

The analysis uses Google Earth Engine collections:

- `COPERNICUS/S5P/OFFL/L3_NO2`
- `COPERNICUS/S5P/OFFL/L3_CO`
- `COPERNICUS/S5P/OFFL/L3_SO2`

Analyzed bands and pollutant-specific processing parameters are recorded in `metadata/run_params.json`.

## Study period and AOI

Study period: **2019–2024**.

Publication AOI identifier: `AOI_KRYVYI_RIH`.

The publication run used the Earth Engine asset:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

That path documents the exact publication provenance. Re-users should upload or construct the AOI in their own Earth Engine project and replace `CONFIG.aoiAsset` with their own accessible asset path. See `data/README_AOI.md`.

## Running the workflow

1. Open Google Earth Engine Code Editor.
2. Copy `code/kryvyi_rih_s5p_coverage_aware_workflow_v1.0.0.js` into a new script.
3. Provide an accessible Kryvyi Rih AOI asset and update only `CONFIG.aoiAsset` if necessary.
4. Review the export switches in `CONFIG` before running. The publication freeze records the settings used for the final publication export.
5. Run the script.
6. Verify the Console acceptance checks before starting export tasks.

Expected core integrity checks for the publication release include:

- Table 1 rows: 3
- Table 2 rows: 216
- Table 3 rows: 216
- Table 4 rows: 87
- duplicate pollutant-month keys: 0

Do not interpret RGB/display products as scientific analysis inputs.

## Processor-version provenance

The operational OFFL source archive is not processor-homogeneous over 2019–2024. The independent metadata audit is implemented in:

`code/sentinel5p_processor_version_audit.js`

Run that script separately from the Master. It does not modify scientific outputs.

## Missing-data and completeness policy

Missing or invalid monthly observations remain NA/masked and are never replaced by zero.

Strict completeness rules:

- season: 3/3 valid months;
- year: 12/12 valid months.

Long-term endpoint-change and hotspot-persistence products are only publication-eligible when the required strict completeness conditions are satisfied.

## Reproducibility note

Internal `ARTICLE4_*` version identifiers are intentionally retained inside the code. They are provenance identifiers corresponding to the development stages that generated the publication outputs and should not be renamed in v1.0.0.

## Data products

Large scientific GeoTIFFs and final CSV/manifests are intentionally not required to live in the GitHub source repository. They can be archived as a Zenodo dataset or attached to the software release package. The GitHub repository should remain focused on source code, metadata and documentation.

## Citation

The archived v1.0.0 software release is available on Zenodo:

Chernysh, R. V. (2026). *Coverage-aware Sentinel-5P workflow for atmospheric monitoring in Kryvyi Rih* (Version v1.0.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.22071247

DOI: https://doi.org/10.5281/zenodo.22071247

Citation metadata are also provided in `CITATION.cff`.

## Rights and reuse

Copyright © 2026 Ruslan Chernysh. All rights reserved.

The source code and associated technical materials in this repository are made publicly accessible for scientific transparency, scholarly review, methodological inspection, and citation. Public availability does not constitute the grant of an open-source software license.

Viewing, reading, scholarly discussion, citation, and linking to this repository are permitted. Reuse, copying, modification, adaptation, redistribution, incorporation into other software or workflows, and commercial use of the source code or substantial portions of it require prior written permission from the copyright holder, except where otherwise permitted by applicable law.

See [RIGHTS.md](RIGHTS.md) for the complete rights and reuse policy.
