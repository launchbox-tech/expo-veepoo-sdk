import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange } from "@/shared/assertions";
import type { VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

export type Sex = 0 | 1;

export interface PersonalInfo {
  sex: Sex;
  height: number;
  weight: number;
  age: number;
  step_aim: number;
  sleep_aim: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface PersonalInfoNativeMethods {
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validatePersonalInfo(info: PersonalInfo): void {
  if (info.sex !== 0 && info.sex !== 1) {
    throw { code: "INVALID_ARGUMENT", message: "sex must be 0 or 1" } satisfies VeepooError;
  }
  requireInRange(info.height, "height", 50, 300);
  requireInRange(info.weight, "weight", 1, 500);
  requireInRange(info.age, "age", 1, 120);
  requireInRange(info.step_aim, "stepAim", 1, 100_000);
  requireInRange(info.sleep_aim, "sleepAim", 0, 1_440);
}

// ── Capability ──────────────────────────────────────────────────────────────

export class PersonalInfoCapability {
  constructor(private readonly ctx: CapabilityContext<PersonalInfoNativeMethods>) {}

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return this.ctx.invoke({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.ctx.native.syncPersonalInfo(deepCamelKeys(info) as PersonalInfo),
    });
  }
}
