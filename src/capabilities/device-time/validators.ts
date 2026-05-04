export function validateDeviceTime(time?: Date): void {
  if (time === undefined) return;
  if (!(time instanceof Date) || isNaN(time.getTime())) {
    throw { code: 'INVALID_ARGUMENT', message: 'time must be a valid Date' };
  }
}
