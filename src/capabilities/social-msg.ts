import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { normalizeFunctionStatus } from "@/shared/primitives";
import type { FunctionStatus, OperationStatus, VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SocialMsgData {
  phone: FunctionStatus;
  sms: FunctionStatus;
  wechat: FunctionStatus;
  qq: FunctionStatus;
  facebook: FunctionStatus;
  twitter: FunctionStatus;
  instagram: FunctionStatus;
  linkedin: FunctionStatus;
  whatsapp: FunctionStatus;
  line: FunctionStatus;
  skype: FunctionStatus;
  email: FunctionStatus;
  other: FunctionStatus;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface SocialMsgNativeMethods {
  readSocialMsgData(): Promise<unknown>;
  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

const supportedFunctionKeys = [
  "phone",
  "sms",
  "wechat",
  "qq",
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "whatsapp",
  "line",
  "skype",
  "email",
  "other",
] as const;

export function normalizeSocialMsgData(value: unknown): SocialMsgData {
  const record =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    supportedFunctionKeys.map((key) => [key, normalizeFunctionStatus(record[key])]),
  ) as unknown as SocialMsgData;
}

// ── Validators ──────────────────────────────────────────────────────────────

const VALID_FUNCTION_STATUSES = new Set<FunctionStatus>([
  "unsupported",
  "support",
  "open",
  "close",
  "unknown",
]);

function validateSocialMsgData(data: Partial<SocialMsgData>): void {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw { code: "INVALID_ARGUMENT", message: "data must contain at least one channel" } satisfies VeepooError;
  }
  for (const key of keys) {
    const value = (data as unknown as Record<string, unknown>)[key];
    if (!VALID_FUNCTION_STATUSES.has(value as FunctionStatus)) {
      throw { code: "INVALID_ARGUMENT", message: `${key} must be a valid FunctionStatus` } satisfies VeepooError;
    }
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class SocialMsgCapability {
  constructor(private readonly ctx: CapabilityContext<SocialMsgNativeMethods>) {}

  readSocialMsgData(): Promise<SocialMsgData> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSocialMsgData(),
      normalize: normalizeSocialMsgData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "device.social.read", "Social message settings received", {
          data: result,
        });
      },
    });
  }

  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateSocialMsgData(data),
      invoke: () => this.ctx.native.writeSocialMsgData(deepCamelKeys(data) as Partial<SocialMsgData>),
    });
  }
}
