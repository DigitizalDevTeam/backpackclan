import type { AuthUser } from "@/types/auth";
import type { CustomerUser } from "@/types/customer";
import {
  authenticateCustomer,
  getCustomerById,
} from "@/lib/mock/customer-store";
import {
  authenticateUser as storeAuthenticateStaff,
  getUserById as storeGetStaffById,
} from "@/lib/mock/user-store";
import { getRoleBySlug } from "@/lib/mock/role-store";

function customerToAuthUser(customer: CustomerUser): AuthUser {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: "customer",
    roleId: customer.roleId,
    roleName: customer.roleName,
    permissions: [],
    userType: "customer",
    phone: customer.phone,
  };
}

function enrichStaffUser(
  user: NonNullable<ReturnType<typeof storeGetStaffById>>
): AuthUser {
  const role = getRoleBySlug(user.role);
  return {
    ...user,
    roleId: role?.id ?? user.roleId,
    roleName: role?.name ?? user.roleName,
    permissions: role?.permissions ?? [],
    userType: "staff",
    phone: null,
  };
}

export function authenticateUser(
  email: string,
  password: string
): AuthUser | null {
  const customer = authenticateCustomer(email, password);
  if (customer) return customerToAuthUser(customer);

  const staff = storeAuthenticateStaff(email, password);
  return staff ? enrichStaffUser(staff) : null;
}

export function getUserById(id: string): AuthUser | null {
  const customer = getCustomerById(id);
  if (customer) return customerToAuthUser(customer);

  const staff = storeGetStaffById(id);
  return staff ? enrichStaffUser(staff) : null;
}

export { customerToAuthUser };
