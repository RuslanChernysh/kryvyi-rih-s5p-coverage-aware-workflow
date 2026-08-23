# Public-release audit

## Frozen-code policy

The v1.0.0 source file is a comment-cleaned copy of the verified publication Master. Executable logic was not intentionally changed during comment cleanup.

Do not rename internal `ARTICLE4_*` provenance identifiers in v1.0.0.

## Public identifiers present in the code

The frozen source contains Earth Engine project/asset paths under:

`projects/ee-ruslan777chernysh/assets`

These are provenance identifiers, not credentials. They are retained to document the exact publication environment. Independent users may need to replace `CONFIG.aoiAsset` and other asset destinations with paths in their own Earth Engine project.

## Secret scan

The preparation audit found no obvious:
- e-mail addresses;
- Google API keys matching the common `AIza...` pattern;
- private-key blocks;
- GitHub personal-access-token patterns.

This automated check is not a guarantee. Review the repository once more before publication.

## Export tasks

The publication freeze may create multiple Earth Engine export tasks when run in `FINAL_PUBLICATION_EXPORT` mode. Re-running all tasks is not required merely to verify the code. Review export switches before execution to avoid duplicate Drive/Asset outputs.

## Files deliberately separated from Master

- processor-version audit;
- external consistency checks;
- large scientific GeoTIFF outputs;
- publication RGB products.

This separation preserves the Master as the exact scientific processing implementation while keeping provenance and display materials auditable.
