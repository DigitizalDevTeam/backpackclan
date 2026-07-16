import {
  findCustomerByEmail,
  resetCustomerPasswordByEmail,
} from "@/lib/mock/customer-store";
import {
  findUserByEmail,
  resetStaffPasswordByEmail,
} from "@/lib/mock/user-store";

interface ResetRecord {
  token: string;
  expiresAt: number;
}

const resetTokens = new Map<string, ResetRecord>();

export function issueMockResetToken(email: string): string | null {
  const normalized = email.toLowerCase();
  const exists = findCustomerByEmail(normalized) || findUserByEmail(normalized);
  if (!exists) return null;

  const token = `mock-${Date.now()}`;
  resetTokens.set(normalized, {
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  return token;
}

export function resetMockPassword(
  email: string,
  token: string,
  password: string
): boolean {
  const normalized = email.toLowerCase();
  const record = resetTokens.get(normalized);

  if (!record || record.token !== token || record.expiresAt < Date.now()) {
    return false;
  }

  const customerUpdated = resetCustomerPasswordByEmail(normalized, password);
  const staffUpdated = resetStaffPasswordByEmail(normalized, password);

  if (!customerUpdated && !staffUpdated) {
    return false;
  }

  resetTokens.delete(normalized);
  return true;
}
