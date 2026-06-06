"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceVersionCapability = void 0;
exports.normalizeDeviceVersion = normalizeDeviceVersion;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeDeviceVersion(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        hardware_version: (0, primitives_1.toStringValue)(record.hardwareVersion ?? record.hardware_version),
        firmware_version: (0, primitives_1.toStringValue)(record.firmwareVersion ?? record.firmware_version),
        software_version: (0, primitives_1.toStringValue)(record.softwareVersion ?? record.software_version),
        device_number: (0, primitives_1.toStringValue)(record.deviceNumber ?? record.device_number),
        new_version: (0, primitives_1.toStringValue)(record.newVersion ?? record.new_version),
        description: (0, primitives_1.toStringValue)(record.description),
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class DeviceVersionCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDeviceVersion() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDeviceVersion(),
            normalize: normalizeDeviceVersion,
            afterSuccess: (result) => {
                this.ctx.log("debug", "device", "device.version.read", "Device version received", {
                    data: result,
                });
            },
        });
    }
}
exports.DeviceVersionCapability = DeviceVersionCapability;
//# sourceMappingURL=device-version.js.map