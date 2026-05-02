# Docs

当前 `docs/` 目录包含两类文档：

- Veepoo 原厂 SDK 文档
- 包版本升级说明

以及维护者用的 **vendor / 上游对照**（根目录 `vendor-manifest.json`、`npm run vendor:check`）。

## Vendor SDK（离线快照）

- `VeepooSDK Android Api.md`
- `VeepooSDK iOS Api.md`

Wiki 实时文档与 drift 说明见各文件顶部提示框；API 与 JS 桥对照见 **`vendor-parity-matrix.md`**；策略见 **`adr/0002-vendor-upstream-tracking.md`**。

## Release Notes

- `release-notes/1.1.0.md`
- `release-notes/1.2.0.md`
- `release-notes/1.2.1.md`
- `release-notes/1.2.2.md`
- `release-notes/1.2.3.md`
- `release-notes/1.2.4.md`
- `release-notes/1.2.5.md`
- `release-notes/1.2.6.md`
- `release-notes/1.2.7.md`

对外使用说明请优先查看仓库根目录 `README.md`。

## Vendor parity（维护）

| 文档 | 用途 |
|------|------|
| [`vendor-parity-matrix.md`](vendor-parity-matrix.md) | Vendor 能力与 `VeepooSDK` JS API / 事件对照表 |
| [`adr/0002-vendor-upstream-tracking.md`](adr/0002-vendor-upstream-tracking.md) | 不落 submodule、manifest、`vendor:check` 决策 |
| [`prd/0059-vendor-upstream-tracking-and-parity.md`](prd/0059-vendor-upstream-tracking-and-parity.md) | PRD #59（父工单） |

本地 **`docs/issues/`** / **`docs/prd/`** 卡片里的 **`Labels:`** 应与 GitHub 一致；**`needs-triage`** 仅作入库队列，结案或分流后应从远端与镜像中去掉（见根目录 **AGENTS.md**）。
