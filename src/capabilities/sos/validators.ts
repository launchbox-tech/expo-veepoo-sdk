export function validateSosCallTimes(times: number): void {
  if (!Number.isInteger(times) || times < 1) {
    throw { code: 'INVALID_ARGUMENT', message: 'times must be a positive integer' };
  }
}
