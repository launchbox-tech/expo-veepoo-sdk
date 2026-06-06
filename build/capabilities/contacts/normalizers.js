"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeContactList = normalizeContactList;
const primitives_1 = require("../../shared/primitives");
function normalizeContact(raw) {
    if (!(0, primitives_1.isRecord)(raw))
        return null;
    const name = (0, primitives_1.toStringValue)(raw.name ?? raw.nickName);
    const phone_number = (0, primitives_1.toStringValue)(raw.phoneNumber ?? raw.phone_number);
    if (!name && !phone_number)
        return null;
    return {
        contact_id: (0, primitives_1.toInt)(raw.contactID ?? raw.contactId ?? raw.contact_id ?? raw.id),
        name,
        phone_number,
        is_sos: (0, primitives_1.toBoolean)(raw.isSOS ?? raw.is_sos ?? raw.isSettingSOS),
        is_support_sos: (raw.isSupportSOS !== undefined || raw.is_support_sos !== undefined)
            ? (0, primitives_1.toBoolean)(raw.isSupportSOS ?? raw.is_support_sos)
            : undefined,
    };
}
function normalizeContactList(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => {
        const c = normalizeContact(item);
        return c !== null ? [c] : [];
    });
}
//# sourceMappingURL=normalizers.js.map