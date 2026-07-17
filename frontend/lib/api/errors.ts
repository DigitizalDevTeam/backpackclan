export function getFormErrorMessage(
  result: { errors?: Record<string, unknown>; message?: string },
  fallback: string
): string {
  const form = result.errors?.form;
  if (typeof form === "string" && form.trim()) return form;

  if (result.errors) {
    for (const value of Object.values(result.errors)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    }
  }

  if (typeof result.message === "string" && result.message.trim()) {
    return result.message;
  }

  return fallback;
}
