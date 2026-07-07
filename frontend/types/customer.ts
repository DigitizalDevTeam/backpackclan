export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer";
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerUserWithPassword = CustomerUser & { password: string };
