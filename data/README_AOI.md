# Area of Interest (AOI)

## Publication AOI

The area of interest used for the publication analysis represents Kryvyi Rih, Ukraine.

AOI identifier:

`AOI_KRYVYI_RIH`

Google Earth Engine asset used for the frozen publication run:

`projects/ee-ruslan777chernysh/assets/KRYVYI_RIH_AOI`

The source asset contained **8 polygon features**, which were dissolved into a single analysis geometry before processing.

Publication-run AOI area:

**441.4874046016281 km²**

Geometry type after dissolve:

`Polygon`

These values are preserved as provenance information for the exact geometry used to generate the archived scientific results.

## Reproduction in Google Earth Engine

The Earth Engine asset path above belongs to the publication processing environment and should not be assumed to be accessible from another user's Earth Engine account.

To reproduce the workflow, an independent user should:

1. obtain an appropriate administrative-boundary geometry for Kryvyi Rih;
2. upload or construct that geometry in their own Google Earth Engine project;
3. dissolve multipart source features into the analysis geometry where required;
4. assign the resulting asset path to `CONFIG.aoiAsset`;
5. verify the geometry and area before running the analysis.

For comparison with the publication configuration, the reconstructed AOI should be checked against the archived provenance values:

- AOI ID: `AOI_KRYVYI_RIH`
- source feature count before dissolve: `8`
- geometry after dissolve: `Polygon`
- publication-run area: `441.4874046016281 km²`

## Important reproducibility note

The provenance information above identifies the geometry used for the publication run but, by itself, does not guarantee exact coordinate-level reconstruction of that geometry from an independent boundary source.

Accordingly, a separately reconstructed administrative boundary should be treated as an equivalent study-area reconstruction rather than assumed to be byte-for-byte or coordinate-for-coordinate identical to the original Earth Engine asset.

The exact publication results archived in this repository were generated using the Earth Engine asset identified above.

## Related metadata

Additional AOI and processing parameters are recorded in:

`../metadata/run_params.json`

The scientific workflow using this AOI is stored in:

`../code/kryvyi_rih_s5p_coverage_aware_workflow.js`

## Rights and reuse

The AOI provenance information is provided for scientific transparency and reproducibility documentation.

Rights and reuse conditions for repository materials are described in the repository-level `RIGHTS.md`.
