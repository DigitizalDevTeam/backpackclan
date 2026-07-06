import type { AdminUser, AdminUserWithPassword } from "@/types/user";
import type { UserRole } from "@/types/auth";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";

const SEED_USERS: AdminUserWithPassword[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@backpackclan.com",
    password: "password",
    role: "admin",
    isActive: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Content Editor",
    email: "editor@backpackclan.com",
    password: "password",
    role: "editor",
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
    },
  {
    id: "3",
    name: "Viewer User",
    email: "viewer@backpackclan.com",
    password: "password",
    role: "viewer",
    isActive: true,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "4",
    name: "Sarah Mitchell",
    email: "sarah@backpackclan.com",
    password: "password123",
    role: "editor",
    isActive: true,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "5",
    name: "James Cooper",
    email: "james@backpackclan.com",
    password: "password123",
    role: "viewer",
    isActive: false,
    createdAt: "2026-03-12T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
];

let users: AdminUserWithPassword[] | null = null;

function getUsers(): AdminUserWithPassword[] {
  if (!users) {
    users = loadMockData("users", structuredClone(SEED_USERS));
  }
  return users;
}

function persistUsers(): void {
  if (users) saveMockData("users", users);
}

function toPublicUser(user: AdminUserWithPassword): AdminUser {
  const { password: _, ...publicUser } = user;
  return publicUser;
}

function generateId(): string {
  return String(Date.now());
}

export function getAllUsers(): AdminUser[] {
  return getUsers().map(toPublicUser);
}

export function getUserWithPasswordById(
  id: string
): AdminUserWithPassword | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function getUserById(id: string): AdminUser | null {
  const user = getUserWithPasswordById(id);
  return user ? toPublicUser(user) : null;
}

export function authenticateUser(
  email: string,
  password: string
): AdminUser | null {
  const user = getUsers().find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.isActive
  );
  return user ? toPublicUser(user) : null;
}

export function createUser(data: {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}): AdminUser {
  const emailExists = getUsers().some(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (emailExists) {
    throw new Error("A user with this email already exists");
  }

  const now = new Date().toISOString();
  const newUser: AdminUserWithPassword = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  users = [...getUsers(), newUser];
  persistUsers();
  return toPublicUser(newUser);
}

export function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    password?: string;
  }
): AdminUser {
  const index = getUsers().findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");

  const emailTaken = getUsers().some(
    (u) => u.id !== id && u.email.toLowerCase() === data.email.toLowerCase()
  );
  if (emailTaken) {
    throw new Error("A user with this email already exists");
  }

  const existing = getUsers()[index];
  const updated: AdminUserWithPassword = {
    ...existing,
    name: data.name,
    email: data.email,
    role: data.role,
    isActive: data.isActive,
    updatedAt: new Date().toISOString(),
    ...(data.password ? { password: data.password } : {}),
  };

  users = [...getUsers().slice(0, index), updated, ...getUsers().slice(index + 1)];
  persistUsers();
  return toPublicUser(updated);
}

export function deleteUser(id: string): void {
  const adminCount = getUsers().filter((u) => u.role === "admin" && u.isActive).length;
  const target = getUsers().find((u) => u.id === id);

  if (!target) throw new Error("User not found");
  if (target.role === "admin" && adminCount <= 1) {
    throw new Error("Cannot delete the last active admin user");
  }

  users = getUsers().filter((u) => u.id !== id);
  persistUsers();
}

export function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): void {
  const index = getUsers().findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User not found");

  const user = getUsers()[index];
  if (user.password !== currentPassword) {
    throw new Error("Current password is incorrect");
  }

  users = [
    ...getUsers().slice(0, index),
    {
      ...user,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    },
    ...getUsers().slice(index + 1),
  ];
  persistUsers();
}

export function findUserByEmail(email: string): AdminUser | null {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  return user ? toPublicUser(user) : null;
}

export function resetUserStore(): void {
  users = structuredClone(SEED_USERS);
  persistUsers();
}
