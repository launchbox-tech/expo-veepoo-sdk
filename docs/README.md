# Documentation

The `docs/` folder holds:

- Frozen snapshots of the vendor Veepoo SDK manuals  
- Package upgrade notes  
- Maintainer-facing **vendor / upstream** parity material (`vendor-manifest.json` at repo root, `npm run vendor:check`)

## Vendor SDK (offline snapshots)

- `VeepooSDK Android Api.md`
- `VeepooSDK iOS Api.md`

Each snapshot begins with a box linking the live wiki and drift checks; API coverage versus this bridge is in **`vendor-parity-matrix.md`**; policy is in **`adr/0002-vendor-upstream-tracking.md`**.

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

For integration guidance, start with the root **`README.md`**.

## Vendor parity (maintainers)

| Doc | Purpose |
|-----|---------|
| [`vendor-parity-matrix.md`](vendor-parity-matrix.md) | Vendor capabilities vs `VeepooSDK` JS APIs / events |
| [`adr/0002-vendor-upstream-tracking.md`](adr/0002-vendor-upstream-tracking.md) | No submodule, manifest, `vendor:check` decision |
| [`prd/0059-vendor-upstream-tracking-and-parity.md`](prd/0059-vendor-upstream-tracking-and-parity.md) | PRD #59 (parent work item) |

Keep **`Labels:`** in local **`docs/issues/`** and **`docs/prd/`** cards aligned with GitHub. **`needs-triage`** is only an inbox queue—remove it from closed issues and once triaged (see root **AGENTS.md**).
