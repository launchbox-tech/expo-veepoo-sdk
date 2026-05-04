export function validateFirmwareDfuFilePath(filePath: string): void {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'filePath is required' };
  }
  if (filePath.length > 4096) {
    throw { code: 'INVALID_ARGUMENT', message: 'filePath is too long' };
  }
}
