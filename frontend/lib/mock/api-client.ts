export async function mockDelay(ms = 300): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export type MockResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export async function mockMutation<T>(
  fn: () => T,
  delayMs = 300
): Promise<MockResult<T>> {
  await mockDelay(delayMs);
  return { success: true, data: fn() };
}
