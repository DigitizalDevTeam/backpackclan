import type { CustomerUser, CustomerUserWithPassword } from "@/types/customer";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";

const CUSTOMER_ROLE_ID = "5";
const CUSTOMER_ROLE_NAME = "Customer";

const SEED_CUSTOMERS: CustomerUserWithPassword[] = [
  {
    id: "c1",
    name: "Amit Sharma",
    email: "customer@demo.com",
    phone: "+91 98765 43210",
    password: "password",
    role: "customer",
    roleId: CUSTOMER_ROLE_ID,
    roleName: CUSTOMER_ROLE_NAME,
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "c2",
    name: "Priya Verma",
    email: "priya@email.com",
    phone: "+91 91234 56789",
    password: "password123",
    role: "customer",
    roleId: CUSTOMER_ROLE_ID,
    roleName: CUSTOMER_ROLE_NAME,
    isActive: true,
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
  },
];

let customers: CustomerUserWithPassword[] | null = null;

function getCustomers(): CustomerUserWithPassword[] {
  if (!customers) {
    customers = loadMockData("customers", structuredClone(SEED_CUSTOMERS));
  }
  return customers;
}

function persistCustomers(): void {
  if (customers) saveMockData("customers", customers);
}

function toPublicCustomer(user: CustomerUserWithPassword): CustomerUser {
  const { password: _, ...publicUser } = user;
  return publicUser;
}

function generateId(): string {
  return `c${Date.now()}`;
}

export function getAllCustomers(): CustomerUser[] {
  return getCustomers().map(toPublicCustomer);
}

export function getCustomerById(id: string): CustomerUser | null {
  const user = getCustomers().find((c) => c.id === id);
  return user ? toPublicCustomer(user) : null;
}

export function findCustomerByEmail(email: string): CustomerUser | null {
  const user = getCustomers().find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  return user ? toPublicCustomer(user) : null;
}

export function authenticateCustomer(
  email: string,
  password: string
): CustomerUser | null {
  const user = getCustomers().find(
    (c) =>
      c.email.toLowerCase() === email.toLowerCase() &&
      c.password === password &&
      c.isActive
  );
  return user ? toPublicCustomer(user) : null;
}

export function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): CustomerUser {
  const emailExists = getCustomers().some(
    (c) => c.email.toLowerCase() === data.email.toLowerCase()
  );
  if (emailExists) {
    throw new Error("An account with this email already exists");
  }

  const now = new Date().toISOString();
  const newUser: CustomerUserWithPassword = {
    id: generateId(),
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    password: data.password,
    role: "customer",
    roleId: CUSTOMER_ROLE_ID,
    roleName: CUSTOMER_ROLE_NAME,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  customers = [...getCustomers(), newUser];
  persistCustomers();
  return toPublicCustomer(newUser);
}

export function emailExistsGlobally(email: string): boolean {
  return getCustomers().some(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
}

export function updateCustomerProfile(
  id: string,
  data: { name: string; phone: string }
): CustomerUser {
  const index = getCustomers().findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Customer not found");
  }

  const updated: CustomerUserWithPassword = {
    ...getCustomers()[index],
    name: data.name,
    phone: data.phone,
    updatedAt: new Date().toISOString(),
  };

  customers = [
    ...getCustomers().slice(0, index),
    updated,
    ...getCustomers().slice(index + 1),
  ];
  persistCustomers();

  return toPublicCustomer(updated);
}

export function changeCustomerPassword(
  id: string,
  currentPassword: string,
  newPassword: string
): void {
  const index = getCustomers().findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Customer not found");
  }

  const user = getCustomers()[index];
  if (user.password !== currentPassword) {
    throw new Error("Current password is incorrect");
  }

  customers = [
    ...getCustomers().slice(0, index),
    {
      ...user,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    },
    ...getCustomers().slice(index + 1),
  ];
  persistCustomers();
}

export function resetCustomerPasswordByEmail(
  email: string,
  password: string
): boolean {
  const index = getCustomers().findIndex(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (index === -1) return false;

  const user = getCustomers()[index];
  customers = [
    ...getCustomers().slice(0, index),
    {
      ...user,
      password,
      updatedAt: new Date().toISOString(),
    },
    ...getCustomers().slice(index + 1),
  ];
  persistCustomers();
  return true;
}
