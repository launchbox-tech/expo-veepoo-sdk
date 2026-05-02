# Documentation

The `docs/` folder holds:

- Frozen snapshots of the vendor Veepoo SDK manuals (under **`vendor-api/`**)  
- Package upgrade notes  
- Maintainer-facing **vendor / upstream** parity material (`vendor-manifest.json` at repo root, `npm run vendor:check`)

## Vendor SDK (offline snapshots)

See **[`vendor-api/README.md`](vendor-api/README.md)** for **`veepoo-sdk-android-api.md`**, **`veepoo-sdk-ios-api.md`**, and **`vendor-parity-matrix.md`**. Policy: **`adr/0002-vendor-upstream-tracking.md`**.

## Release notes

- `release-notes/1.1.0.md`
- `release-notes/1.2.0.md`
- `release-notes/1.2.1.md`
- `release-notes/1.2.2.md`
- `release-notes/1.2.3.md`
- `release-notes/1.2.4.md`
- `release-notes/1.2.5.md`
- `release-notes/1.2.6.md`
- `release-notes/1.2.7.md`
- `release-notes/1.2.8.md`
- `release-notes/1.2.11.md`

For integration guidance, start with the root **`README.md`**.

## Vendor parity (maintainers)

| Doc | Purpose |
|-----|---------|
| [`vendor-api/vendor-parity-matrix.md`](vendor-api/vendor-parity-matrix.md) | Vendor capabilities vs `VeepooSDK` JS APIs / events |
| [`adr/0002-vendor-upstream-tracking.md`](adr/0002-vendor-upstream-tracking.md) | No submodule, manifest, `vendor:check` decision |
| [`adr/0003-native-rejection-to-veepoo-error.md`](adr/0003-native-rejection-to-veepoo-error.md) | Map native `AsyncFunction` rejections to `VeepooError` |
| [`prd/0059-vendor-upstream-tracking-and-parity.md`](prd/0059-vendor-upstream-tracking-and-parity.md) | PRD #59 (parent work item) |

Keep **`Labels:`** in local **`docs/issues/`** and **`docs/prd/`** cards aligned with GitHub. **`needs-triage`** is only an inbox queue—remove it from closed issues and once triaged (see root **AGENTS.md**).
