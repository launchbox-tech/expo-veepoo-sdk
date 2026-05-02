# Vendor API reference (offline)

Maintainer-facing artifacts for **HBand / Veepoo** upstream documentation and **JavaScript bridge** parity. This is not the host-app **Band** or **Session** API—see **`AGENTS.md`** for product vocabulary.

| File | Purpose |
|------|---------|
| **`veepoo-sdk-android-api.md`** | Frozen snapshot of the vendor Android API wiki (live URL in the file header). |
| **`veepoo-sdk-ios-api.md`** | Frozen snapshot of the vendor iOS API wiki (live URL in the file header). |
| **`vendor-parity-matrix.md`** | Maps vendor capability areas to this repo’s **`VeepooSDK`** methods and events. |

**Policy:** [`docs/adr/0002-vendor-upstream-tracking.md`](../adr/0002-vendor-upstream-tracking.md). **Pins / drift:** root [`vendor-manifest.json`](../../vendor-manifest.json) and **`npm run vendor:check`**.
