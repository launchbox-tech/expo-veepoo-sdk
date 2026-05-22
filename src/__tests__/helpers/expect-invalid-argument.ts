export function expectInvalidArgument(fn: () => void, fieldHint?: string): void {
  let thrown: unknown;
  try {
    fn();
  } catch (e) {
    thrown = e;
  }
  expect(thrown).toBeDefined();
  expect((thrown as any).code).toBe('INVALID_ARGUMENT');
  if (fieldHint) {
    expect((thrown as any).message).toContain(fieldHint);
  }
}
